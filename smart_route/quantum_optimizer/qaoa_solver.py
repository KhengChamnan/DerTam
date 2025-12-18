"""
QAOA Solver for Route Optimization
Implements Quantum Approximate Optimization Algorithm for feature-based QUBO (2-4 qubits)
"""
import numpy as np
from typing import Dict, List, Optional
from qiskit import QuantumCircuit
from qiskit_algorithms import QAOA, NumPyMinimumEigensolver
from qiskit_algorithms.optimizers import COBYLA, SPSA
from qiskit.quantum_info import Operator, SparsePauliOp
from qiskit_aer import AerSimulator
import warnings
warnings.filterwarnings('ignore')

# Try different Sampler imports for compatibility
SAMPLER_AVAILABLE = False
Sampler = None

try:
    from qiskit_aer.primitives import Sampler
    SAMPLER_AVAILABLE = True
except ImportError:
    try:
        from qiskit.primitives import Sampler
        SAMPLER_AVAILABLE = True
    except ImportError:
        SAMPLER_AVAILABLE = False

from quantum_optimizer.route_decoder import RouteDecoder


class QAOASolver:
    """
    QAOA solver for route optimization using feature-based QUBO encoding (2-4 qubits)
    """
    
    def __init__(
        self,
        num_layers: int = 2,
        shots: int = 1024,
        optimizer: str = 'COBYLA',
        max_iterations: int = 100,
        backend: Optional[str] = None
    ):
        """
        Initialize QAOA solver
        
        Args:
            num_layers: Number of QAOA layers (p parameter)
            shots: Number of measurement shots
            optimizer: Optimizer name ('COBYLA', 'SPSA')
            max_iterations: Maximum optimization iterations
            backend: Quantum backend (default: AerSimulator)
        """
        self.num_layers = num_layers
        self.shots = shots
        self.max_iterations = max_iterations
        
        # Setup optimizer
        if optimizer == 'COBYLA':
            self.optimizer = COBYLA(maxiter=max_iterations)
        elif optimizer == 'SPSA':
            self.optimizer = SPSA(maxiter=max_iterations)
        else:
            self.optimizer = COBYLA(maxiter=max_iterations)
        
        # Setup backend
        if backend is None:
            self.backend = AerSimulator()
        else:
            self.backend = backend
        
        # Setup sampler with fallback
        self.sampler = None
        if SAMPLER_AVAILABLE and Sampler is not None:
            try:
                self.sampler = Sampler(backend=self.backend)
            except (TypeError, ValueError):
                try:
                    self.sampler = Sampler()
                    if hasattr(self.sampler, 'backend'):
                        self.sampler.backend = self.backend
                except Exception:
                    self.sampler = None
        
        self.decoder = RouteDecoder()
    
    def solve(
        self,
        qubo_matrix: np.ndarray,
        num_pois: int,
        encoding_info: Optional[Dict] = None,
        distance_matrix: Optional[np.ndarray] = None,
        time_matrix: Optional[np.ndarray] = None,
        traffic_penalty_matrix: Optional[np.ndarray] = None,
        pois: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Solve QUBO problem using QAOA
        
        Args:
            qubo_matrix: QUBO matrix from QUBOEncoder.encode_feature_based() (2-4 qubits)
            num_pois: Number of POIs
            encoding_info: Encoding information from QUBOEncoder (must have 'encoding' == 'feature_based')
            distance_matrix: Distance matrix (for feature-based decoding)
            time_matrix: Time matrix (for feature-based decoding)
            traffic_penalty_matrix: Traffic penalty matrix (for feature-based decoding)
            pois: List of POI dictionaries (for feature-based decoding)
            
        Returns:
            Solution dictionary with route and metadata
        """
        num_qubits = qubo_matrix.shape[0]
        
        # Convert QUBO to Ising Hamiltonian
        ising_hamiltonian = self._qubo_to_ising(qubo_matrix)
        
        # Create QAOA instance
        if self.sampler is None:
            return self._classical_fallback(
                qubo_matrix, num_pois, encoding_info,
                distance_matrix, time_matrix, traffic_penalty_matrix, pois
            )
        
        try:
            qaoa = QAOA(
                sampler=self.sampler,
                optimizer=self.optimizer,
                reps=self.num_layers,
                initial_point=None
            )
        except Exception as e:
            print(f"Warning: QAOA initialization failed: {e}")
            return self._classical_fallback(
                qubo_matrix, num_pois, encoding_info,
                distance_matrix, time_matrix, traffic_penalty_matrix, pois
            )
        
        # Solve
        try:
            result = qaoa.compute_minimum_eigenvalue(ising_hamiltonian)
            
            # Extract optimal parameters and energy
            optimal_params = result.optimal_parameters
            optimal_value = result.eigenvalue.real
            
            # Get measurement results
            if hasattr(result, 'eigenstate'):
                counts = result.eigenstate.to_dict()
            else:
                # Fallback: create simple counts from eigenstate
                counts = {format(i, f'0{num_qubits}b'): 1 for i in range(2**num_qubits)}
            
            # Decode route using feature-based decoder
            route, decode_info = self.decoder.decode_route(
                counts, num_pois, encoding_info,
                distance_matrix, time_matrix, traffic_penalty_matrix, pois
            )
            
            # Create circuit for visualization
            circuit = self._create_circuit(ising_hamiltonian, optimal_params, num_qubits)
            
            return {
                'success': True,
                'route': route,
                'energy': optimal_value,
                'parameters': {k: float(v) for k, v in optimal_params.items()},
                'iterations': self.max_iterations,
                'num_qubits': num_qubits,
                'num_layers': self.num_layers,
                'counts': counts,
                'decode_info': decode_info,
                'is_valid': decode_info['validation']['is_valid'],
                'circuit': circuit
            }
            
        except Exception as e:
            print(f"QAOA optimization failed: {e}")
            return self._classical_fallback(
                qubo_matrix, num_pois, encoding_info,
                distance_matrix, time_matrix, traffic_penalty_matrix, pois
            )
    
    def _qubo_to_ising(self, qubo_matrix: np.ndarray) -> SparsePauliOp:
        """
        Convert QUBO matrix to Ising Hamiltonian
        
        Args:
            qubo_matrix: QUBO matrix (n x n) where n is 2-4 qubits
            
        Returns:
            Ising Hamiltonian as SparsePauliOp
        """
        num_qubits = qubo_matrix.shape[0]
        
        # QUBO: x^T Q x where x in {0,1}
        # Ising: H = sum h_i Z_i + sum J_ij Z_i Z_j where Z in {-1,+1}
        # Conversion: x = (1 - Z)/2
        
        h_coeffs = np.zeros(num_qubits)
        j_coeffs = np.zeros((num_qubits, num_qubits))
        
        # Convert QUBO to Ising
        for i in range(num_qubits):
            # Linear terms
            h_coeffs[i] -= qubo_matrix[i][i] / 2
            
            # Quadratic terms
            for j in range(i + 1, num_qubits):
                j_coeffs[i][j] = qubo_matrix[i][j] / 4
                h_coeffs[i] -= qubo_matrix[i][j] / 4
                h_coeffs[j] -= qubo_matrix[i][j] / 4
        
        # Create SparsePauliOp
        pauli_list = []
        coeff_list = []
        
        # Add Z terms (linear)
        for i in range(num_qubits):
            if abs(h_coeffs[i]) > 1e-10:
                pauli_str = ['I'] * num_qubits
                pauli_str[i] = 'Z'
                pauli_list.append(''.join(pauli_str))
                coeff_list.append(h_coeffs[i])
        
        # Add ZZ terms (quadratic)
        for i in range(num_qubits):
            for j in range(i + 1, num_qubits):
                if abs(j_coeffs[i][j]) > 1e-10:
                    pauli_str = ['I'] * num_qubits
                    pauli_str[i] = 'Z'
                    pauli_str[j] = 'Z'
                    pauli_list.append(''.join(pauli_str))
                    coeff_list.append(j_coeffs[i][j])
        
        if pauli_list:
            return SparsePauliOp(pauli_list, coeff_list)
        else:
            # Fallback: simple Z_0 term
            pauli_str = ['I'] * num_qubits
            pauli_str[0] = 'Z'
            return SparsePauliOp([''.join(pauli_str)], [1.0])
    
    def _create_circuit(self, hamiltonian: SparsePauliOp, params: Dict, num_qubits: int) -> Optional[QuantumCircuit]:
        """Create QAOA circuit for visualization"""
        try:
            circuit = QuantumCircuit(num_qubits)
            
            # Initial state: |+⟩^⊗n
            for i in range(num_qubits):
                circuit.h(i)
            
            # Extract gamma and beta from params
            param_list = list(params.values()) if isinstance(params, dict) else []
            if len(param_list) >= 2 * self.num_layers:
                gammas = param_list[:self.num_layers]
                betas = param_list[self.num_layers:]
            else:
                gammas = [0.1] * self.num_layers
                betas = [0.1] * self.num_layers
            
            # Apply QAOA layers
            for layer in range(self.num_layers):
                gamma = gammas[layer] if layer < len(gammas) else 0.1
                beta = betas[layer] if layer < len(betas) else 0.1
                
                # Cost Hamiltonian: e^(-iγH_C)
                for pauli, coeff in zip(hamiltonian.paulis, hamiltonian.coeffs):
                    for i, pauli_char in enumerate(pauli):
                        if pauli_char == 'Z':
                            circuit.rz(2 * gamma * float(coeff), i)
                
                # Mixer Hamiltonian: e^(-iβΣX_i)
                for i in range(num_qubits):
                    circuit.rx(2 * beta, i)
            
            circuit.measure_all()
            return circuit
        except Exception as e:
            print(f"Warning: Could not create circuit: {e}")
            return None
    
    def _classical_fallback(
        self,
        qubo_matrix: np.ndarray,
        num_pois: int,
        encoding_info: Optional[Dict],
        distance_matrix: Optional[np.ndarray] = None,
        time_matrix: Optional[np.ndarray] = None,
        traffic_penalty_matrix: Optional[np.ndarray] = None,
        pois: Optional[List[Dict]] = None
    ) -> Dict:
        """Fallback to classical solver if QAOA fails"""
        ising_hamiltonian = self._qubo_to_ising(qubo_matrix)
        solver = NumPyMinimumEigensolver()
        result = solver.compute_minimum_eigenvalue(ising_hamiltonian)
        
        # Extract eigenstate
        eigenstate = result.eigenstate
        counts = eigenstate.to_dict()
        
        # Decode route
        route, decode_info = self.decoder.decode_route(
            counts, num_pois, encoding_info,
            distance_matrix, time_matrix, traffic_penalty_matrix, pois
        )
        
        # Create circuit for visualization
        circuit = self._create_circuit(ising_hamiltonian, {}, qubo_matrix.shape[0])
        
        return {
            'success': True,
            'route': route,
            'energy': result.eigenvalue.real,
            'parameters': {},
            'iterations': 0,
            'num_qubits': qubo_matrix.shape[0],
            'num_layers': self.num_layers,
            'counts': counts,
            'decode_info': decode_info,
            'is_valid': decode_info['validation']['is_valid'],
            'method': 'classical_fallback',
            'circuit': circuit
        }


# Example usage
if __name__ == "__main__":
    # Sample QUBO matrix (4 POIs = 16 qubits)
    num_pois = 4
    num_qubits = num_pois * num_pois
    
    # Create simple QUBO
    qubo_matrix = np.random.rand(num_qubits, num_qubits)
    qubo_matrix = (qubo_matrix + qubo_matrix.T) / 2  # Make symmetric
    
    # Solve
    solver = QAOASolver(num_layers=2, shots=512, max_iterations=50)
    result = solver.solve(qubo_matrix, num_pois)
    
    print(f"Route: {result['route']}")
    print(f"Energy: {result['energy']}")
    print(f"Valid: {result['is_valid']}")

