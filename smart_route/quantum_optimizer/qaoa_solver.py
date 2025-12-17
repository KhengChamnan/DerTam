"""
QAOA Solver for Route Optimization
Implements Quantum Approximate Optimization Algorithm
"""
import numpy as np
from typing import Dict, List, Optional, Tuple
from qiskit import QuantumCircuit
from qiskit_algorithms import QAOA, NumPyMinimumEigensolver
from qiskit_algorithms.optimizers import COBYLA, SPSA
from qiskit.quantum_info import Operator
from qiskit_aer import AerSimulator
import warnings
warnings.filterwarnings('ignore')

# Try different Sampler imports for compatibility
SAMPLER_AVAILABLE = False
Sampler = None

try:
    # Try qiskit-aer's Sampler first (most compatible)
    from qiskit_aer.primitives import Sampler
    SAMPLER_AVAILABLE = True
except ImportError:
    try:
        # Try qiskit's primitives Sampler
        from qiskit.primitives import Sampler
        SAMPLER_AVAILABLE = True
    except ImportError:
        # Fallback: will use classical solver
        SAMPLER_AVAILABLE = False

from quantum_optimizer.qubo_encoder import QUBOEncoder
from quantum_optimizer.route_decoder import RouteDecoder


class QAOASolver:
    """
    QAOA solver for route optimization
    Uses Qiskit for quantum simulation
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
                # Try with backend parameter first (qiskit-aer style)
                self.sampler = Sampler(backend=self.backend)
            except (TypeError, ValueError) as e:
                try:
                    # Try without backend parameter (some versions)
                    self.sampler = Sampler()
                    # If successful, try to set backend attribute
                    if hasattr(self.sampler, 'backend'):
                        self.sampler.backend = self.backend
                except Exception as e2:
                    # If all else fails, sampler will be None
                    print(f"Warning: Could not initialize Sampler: {e}, {e2}")
                    self.sampler = None
        
        self.decoder = RouteDecoder()
    
    def solve(
        self,
        qubo_matrix: np.ndarray,
        num_pois: int,
        encoding_info: Optional[Dict] = None
    ) -> Dict:
        """
        Solve QUBO problem using QAOA
        
        Args:
            qubo_matrix: QUBO matrix (n x n)
            num_pois: Number of POIs
            encoding_info: Encoding information from QUBOEncoder
            
        Returns:
            Solution dictionary with route and metadata
        """
        num_qubits = qubo_matrix.shape[0]
        
        # Convert QUBO to Ising Hamiltonian
        ising_hamiltonian = self._qubo_to_ising(qubo_matrix)
        
        # Create QAOA instance
        if self.sampler is None:
            # If no sampler available, use classical fallback immediately
            return self._classical_fallback(qubo_matrix, num_pois, encoding_info)
        
        try:
            qaoa = QAOA(
                sampler=self.sampler,
                optimizer=self.optimizer,
                reps=self.num_layers,
                initial_point=None  # Random initialization
            )
        except Exception as e:
            # If QAOA initialization fails, use classical fallback
            print(f"Warning: QAOA initialization failed: {e}")
            return self._classical_fallback(qubo_matrix, num_pois, encoding_info)
        
        # Solve
        try:
            result = qaoa.compute_minimum_eigenvalue(ising_hamiltonian)
            
            # Extract optimal parameters
            optimal_params = result.optimal_parameters
            optimal_value = result.eigenvalue.real
            
            # Get measurement results
            if hasattr(result, 'eigenstate'):
                eigenstate = result.eigenstate
                counts = eigenstate.to_dict()
            else:
                # Run circuit with optimal parameters to get measurements
                counts = self._run_circuit_with_params(
                    ising_hamiltonian, optimal_params, num_qubits
                )
            
            # Decode route
            route, decode_info = self.decoder.decode_route(counts, num_pois, encoding_info)
            
            # Calculate route metrics
            route_metrics = self._calculate_route_metrics(
                route, qubo_matrix, num_pois, encoding_info
            )
            
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
                'route_metrics': route_metrics,
                'circuit': None  # Will be set by circuit visualizer
            }
            
        except Exception as e:
            # Fallback to classical solver for validation
            print(f"QAOA optimization failed: {e}")
            return self._classical_fallback(qubo_matrix, num_pois, encoding_info)
    
    def _qubo_to_ising(self, qubo_matrix: np.ndarray) -> Operator:
        """
        Convert QUBO matrix to Ising Hamiltonian
        
        Args:
            qubo_matrix: QUBO matrix (n x n)
            
        Returns:
            Ising Hamiltonian as Qiskit Operator
        """
        num_qubits = qubo_matrix.shape[0]
        
        # QUBO: x^T Q x where x in {0,1}
        # Ising: H = sum h_i Z_i + sum J_ij Z_i Z_j where Z in {-1,+1}
        # Conversion: x = (1 - Z)/2
        
        # Initialize Hamiltonian coefficients
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
        
        # Create Ising Hamiltonian
        # For simplicity, we'll use a simplified approach
        # In practice, use qiskit_nature or construct manually
        
        # Simplified: create a cost operator from QUBO
        # This is a placeholder - actual implementation would use proper Ising form
        from qiskit.quantum_info import SparsePauliOp
        
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
            hamiltonian = SparsePauliOp(pauli_list, coeff_list)
        else:
            # Fallback: create simple Hamiltonian
            pauli_str = ['I'] * num_qubits
            pauli_str[0] = 'Z'
            hamiltonian = SparsePauliOp([''.join(pauli_str)], [1.0])
        
        return hamiltonian
    
    def _run_circuit_with_params(
        self,
        hamiltonian: Operator,
        params: Dict,
        num_qubits: int
    ) -> Dict[str, int]:
        """
        Run QAOA circuit with optimal parameters and get measurements
        
        Args:
            hamiltonian: Ising Hamiltonian
            params: Optimal parameters
            num_qubits: Number of qubits
            
        Returns:
            Measurement counts dictionary
        """
        # Create QAOA circuit
        qaoa = QAOA(
            sampler=self.sampler,
            optimizer=self.optimizer,
            reps=self.num_layers,
            initial_point=list(params.values())
        )
        
        # Run with optimal parameters
        result = qaoa.compute_minimum_eigenvalue(hamiltonian)
        
        if hasattr(result, 'eigenstate'):
            return result.eigenstate.to_dict()
        else:
            # Fallback: return uniform distribution
            return {format(i, f'0{num_qubits}b'): 1 for i in range(2**min(num_qubits, 10))}
    
    def _calculate_route_metrics(
        self,
        route: List[int],
        qubo_matrix: np.ndarray,
        num_pois: int,
        encoding_info: Optional[Dict]
    ) -> Dict:
        """
        Calculate metrics for decoded route
        
        Args:
            route: Decoded route
            qubo_matrix: QUBO matrix
            num_pois: Number of POIs
            
        Returns:
            Metrics dictionary
        """
        # Calculate QUBO energy for route
        route_bitstring = self.decoder.route_to_bitstring(route, num_pois)
        energy = self._calculate_qubo_energy(route_bitstring, qubo_matrix)
        
        return {
            'qubo_energy': energy,
            'route_length': len(route),
            'is_complete': len(set(route)) == num_pois
        }
    
    def _calculate_qubo_energy(self, bitstring: str, qubo_matrix: np.ndarray) -> float:
        """
        Calculate QUBO energy for a bitstring
        
        Args:
            bitstring: Binary string
            qubo_matrix: QUBO matrix
            
        Returns:
            Energy value
        """
        n = len(bitstring)
        x = np.array([int(b) for b in bitstring])
        energy = x.T @ qubo_matrix @ x
        return float(energy)
    
    def _classical_fallback(
        self,
        qubo_matrix: np.ndarray,
        num_pois: int,
        encoding_info: Optional[Dict]
    ) -> Dict:
        """
        Fallback to classical solver if QAOA fails
        
        Args:
            qubo_matrix: QUBO matrix
            num_pois: Number of POIs
            
        Returns:
            Solution dictionary
        """
        # Use NumPy eigensolver as fallback
        ising_hamiltonian = self._qubo_to_ising(qubo_matrix)
        solver = NumPyMinimumEigensolver()
        result = solver.compute_minimum_eigenvalue(ising_hamiltonian)
        
        # Extract eigenstate
        eigenstate = result.eigenstate
        counts = eigenstate.to_dict()
        
        # Decode route
        route, decode_info = self.decoder.decode_route(counts, num_pois, encoding_info)
        
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
            'route_metrics': self._calculate_route_metrics(route, qubo_matrix, num_pois, encoding_info),
            'method': 'classical_fallback'
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

