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

# Try different Sampler imports for compatibility with qiskit-algorithms
# Priority: StatevectorSampler (works with QAOA) > BackendSamplerV2 > SamplerV2 > Sampler (legacy)
STATEVECTOR_SAMPLER_AVAILABLE = False
SAMPLER_V2_AVAILABLE = False
SAMPLER_AVAILABLE = False
StatevectorSampler = None
SamplerV2 = None
Sampler = None
BackendSamplerV2 = None

# Try StatevectorSampler first (simple local sampler, works well with qiskit-algorithms QAOA)
try:
    from qiskit.primitives import StatevectorSampler
    STATEVECTOR_SAMPLER_AVAILABLE = True
except ImportError:
    pass

# Try BackendSamplerV2 from qiskit.primitives as second option
try:
    from qiskit.primitives import BackendSamplerV2
except ImportError:
    pass

# Try qiskit_aer.primitives.SamplerV2
try:
    from qiskit_aer.primitives import SamplerV2
    SAMPLER_V2_AVAILABLE = True
except ImportError:
    pass

# Legacy Sampler imports (may not work with newer qiskit-algorithms)
try:
    from qiskit_aer.primitives import Sampler
    SAMPLER_AVAILABLE = True
except ImportError:
    pass

if not SAMPLER_AVAILABLE:
    try:
        from qiskit.primitives import Sampler
        SAMPLER_AVAILABLE = True
    except ImportError:
        pass

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
        self.optimizer_name = optimizer
        
        # Iteration tracking
        self._iteration_count = 0
        self._optimization_history = []
        
        # Setup optimizer with callback for iteration tracking
        self._setup_optimizer(optimizer, max_iterations)
        
        # Setup backend
        if backend is None:
            self.backend = AerSimulator()
        else:
            self.backend = backend
        
        # Setup sampler with proper API
        # Priority: StatevectorSampler > BackendSamplerV2 > SamplerV2 > Sampler (legacy)
        self.sampler = None
        sampler_error = None
        
        # Try StatevectorSampler first (simple local sampler, works well with qiskit-algorithms QAOA)
        if STATEVECTOR_SAMPLER_AVAILABLE and StatevectorSampler is not None:
            try:
                self.sampler = StatevectorSampler()
            except Exception as e:
                sampler_error = f"StatevectorSampler failed: {e}"
        
        # Fallback to BackendSamplerV2
        if self.sampler is None and BackendSamplerV2 is not None:
            try:
                self.sampler = BackendSamplerV2(backend=self.backend)
            except Exception as e:
                sampler_error = f"BackendSamplerV2 failed: {e}"
        
        # Fallback to SamplerV2 from qiskit_aer
        if self.sampler is None and SAMPLER_V2_AVAILABLE and SamplerV2 is not None:
            try:
                self.sampler = SamplerV2()
            except Exception as e:
                sampler_error = f"SamplerV2 failed: {e}"
        
        # Final fallback to legacy Sampler
        if self.sampler is None and SAMPLER_AVAILABLE and Sampler is not None:
            try:
                self.sampler = Sampler()
            except Exception as e:
                sampler_error = f"Sampler failed: {e}"
        
        if self.sampler is None:
            print(f"Warning: Could not initialize Sampler: {sampler_error}")
        
        self.decoder = RouteDecoder()
    
    def _optimization_callback_cobyla(self, x_k):
        """
        Callback function for COBYLA optimizer
        COBYLA callback signature: callback(x_k) where x_k is current parameters
        
        Args:
            x_k: Current parameter values
        """
        self._iteration_count += 1
        self._optimization_history.append({
            'iteration': self._iteration_count,
            'nfev': self._iteration_count,
            'energy': None,  # COBYLA doesn't pass energy in callback
            'parameters': [float(p) for p in x_k] if x_k is not None else []
        })
    
    def _optimization_callback_spsa(self, nfev, parameters, energy, stepsize=None, accepted=None):
        """
        Callback function for SPSA optimizer
        SPSA callback signature: callback(nfev, parameters, energy, stepsize, accepted)
        
        Args:
            nfev: Number of function evaluations
            parameters: Current parameter values
            energy: Current energy/cost value
            stepsize: Step size
            accepted: Whether step was accepted
        """
        self._iteration_count += 1
        self._optimization_history.append({
            'iteration': self._iteration_count,
            'nfev': nfev,
            'energy': float(energy.real) if hasattr(energy, 'real') else float(energy) if energy is not None else None,
            'parameters': [float(p) for p in parameters] if parameters is not None else []
        })
    
    def _setup_optimizer(self, optimizer: str, max_iterations: int):
        """Setup optimizer with callback for iteration tracking
        
        Configures optimizers to ensure at least 10 iterations by using
        tight tolerance and appropriate step sizes.
        
        Note: Different optimizers have different callback signatures:
        - COBYLA: callback(x_k) - only receives current parameters
        - SPSA: callback(nfev, parameters, energy, stepsize, accepted)
        """
        # Ensure minimum 10 iterations by setting tight tolerance
        min_iterations = 10
        effective_max_iter = max(max_iterations, min_iterations)
        
        if optimizer == 'COBYLA':
            # Set tight tolerance to prevent early convergence
            # rhobeg: initial step size, tol: convergence tolerance
            self.optimizer = COBYLA(
                maxiter=effective_max_iter,
                tol=1e-8,  # Very tight tolerance to ensure more iterations
                rhobeg=0.5,  # Reasonable initial step size
                callback=self._optimization_callback_cobyla
            )
        elif optimizer == 'SPSA':
            # SPSA with settings for better convergence
            self.optimizer = SPSA(
                maxiter=effective_max_iter,
                learning_rate=0.1,
                perturbation=0.1,
                callback=self._optimization_callback_spsa
            )
        else:
            self.optimizer = COBYLA(
                maxiter=effective_max_iter,
                tol=1e-8,
                rhobeg=0.5,
                callback=self._optimization_callback_cobyla
            )
    
    def _reset_iteration_tracking(self):
        """Reset iteration tracking for a new optimization run"""
        self._iteration_count = 0
        self._optimization_history = []
    
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
        # Reset iteration tracking for new optimization run
        self._reset_iteration_tracking()
        
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
        except TypeError as e:
            print(f"Warning: QAOA initialization failed (TypeError - likely sampler API mismatch): {e}")
            return self._classical_fallback(
                qubo_matrix, num_pois, encoding_info,
                distance_matrix, time_matrix, traffic_penalty_matrix, pois
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
            if hasattr(result, 'eigenstate') and result.eigenstate is not None:
                eigenstate = result.eigenstate
                # Handle different eigenstate formats
                if isinstance(eigenstate, dict):
                    counts = eigenstate
                elif hasattr(eigenstate, 'to_dict'):
                    counts = eigenstate.to_dict()
                elif hasattr(eigenstate, 'binary_probabilities'):
                    counts = eigenstate.binary_probabilities()
                else:
                    # Fallback: create simple counts
                    counts = {format(i, f'0{num_qubits}b'): 1 for i in range(2**num_qubits)}
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
            
            # Get actual iteration count from multiple sources for reliability
            # Priority: optimizer result cost_function_evals > tracked callback count > 1
            actual_iterations = self._iteration_count
            optimizer_evals = None
            
            # Try to get function evaluations from optimizer result
            if hasattr(result, 'cost_function_evals') and result.cost_function_evals is not None:
                optimizer_evals = result.cost_function_evals
                actual_iterations = max(actual_iterations, optimizer_evals)
            elif hasattr(result, 'optimizer_evals') and result.optimizer_evals is not None:
                optimizer_evals = result.optimizer_evals
                actual_iterations = max(actual_iterations, optimizer_evals)
            
            # Ensure we report at least 1 iteration
            actual_iterations = max(actual_iterations, 1)
            
            # Convert parameters to dict with explicit gamma_X/beta_X naming
            # Qiskit QAOA uses names like β[0], γ[0] or similar
            param_dict = {}
            gamma_values = []
            beta_values = []
            
            for k, v in optimal_params.items():
                key_str = str(k)
                float_val = float(v) if not isinstance(v, complex) else float(v.real)
                
                # Detect gamma (γ) or beta (β) parameters
                if 'γ' in key_str or 'gamma' in key_str.lower():
                    gamma_values.append(float_val)
                elif 'β' in key_str or 'beta' in key_str.lower():
                    beta_values.append(float_val)
                else:
                    # Unknown parameter - store as-is
                    param_dict[key_str] = float_val
            
            # If we couldn't identify gamma/beta by name, assume first half are gammas, second half betas
            if not gamma_values and not beta_values and optimal_params:
                all_values = [float(v) if not isinstance(v, complex) else float(v.real) 
                             for v in optimal_params.values()]
                mid = len(all_values) // 2
                gamma_values = all_values[:mid] if mid > 0 else all_values[:self.num_layers]
                beta_values = all_values[mid:] if mid > 0 else all_values[self.num_layers:]
            
            # Store with explicit naming for reliable extraction
            for i, gamma in enumerate(gamma_values):
                param_dict[f'gamma_{i}'] = gamma
            for i, beta in enumerate(beta_values):
                param_dict[f'beta_{i}'] = beta
            
            return {
                'success': True,
                'route': route,
                'energy': optimal_value,
                'parameters': param_dict,
                'iterations': actual_iterations,
                'optimizer_evals': optimizer_evals,  # Raw optimizer evaluations (if available)
                'max_iterations': self.max_iterations,
                'optimization_history': self._optimization_history,
                'num_qubits': num_qubits,
                'num_layers': self.num_layers,
                'counts': counts,
                'decode_info': decode_info,
                'is_valid': decode_info['validation']['is_valid'],
                'circuit': circuit,
                'method': 'qaoa'  # Indicate QAOA was used (not fallback)
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
            
            # Extract gamma and beta from params with improved logic
            gammas = []
            betas = []
            
            if isinstance(params, dict) and params:
                # Try to extract by explicit naming (gamma_X, beta_X)
                for i in range(self.num_layers):
                    gamma_key = f'gamma_{i}'
                    beta_key = f'beta_{i}'
                    
                    if gamma_key in params:
                        gammas.append(float(params[gamma_key]))
                    if beta_key in params:
                        betas.append(float(params[beta_key]))
                
                # If explicit naming didn't work, try other patterns
                if not gammas or not betas:
                    for k, v in params.items():
                        key_str = str(k)
                        float_val = float(v) if not isinstance(v, complex) else float(v.real)
                        
                        if 'γ' in key_str or 'gamma' in key_str.lower():
                            gammas.append(float_val)
                        elif 'β' in key_str or 'beta' in key_str.lower():
                            betas.append(float_val)
                
                # Final fallback: split param list in half
                if not gammas and not betas:
                    param_list = list(params.values())
                    mid = len(param_list) // 2
                    gammas = [float(v) if not isinstance(v, complex) else float(v.real) 
                             for v in param_list[:mid]]
                    betas = [float(v) if not isinstance(v, complex) else float(v.real) 
                            for v in param_list[mid:]]
            
            # Ensure we have enough values for all layers
            while len(gammas) < self.num_layers:
                gammas.append(0.1 + 0.05 * len(gammas))  # Slightly different defaults
            while len(betas) < self.num_layers:
                betas.append(0.1 + 0.05 * len(betas))  # Slightly different defaults
            
            # Apply QAOA layers
            for layer in range(self.num_layers):
                gamma = gammas[layer]
                beta = betas[layer]
                
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
        
        # Extract eigenstate - handle different formats
        eigenstate = result.eigenstate
        if isinstance(eigenstate, dict):
            counts = eigenstate
        elif hasattr(eigenstate, 'to_dict'):
            counts = eigenstate.to_dict()
        elif hasattr(eigenstate, 'binary_probabilities'):
            counts = eigenstate.binary_probabilities()
        else:
            # Fallback
            counts = {format(0, f'0{qubo_matrix.shape[0]}b'): 1}
        
        # Decode route
        route, decode_info = self.decoder.decode_route(
            counts, num_pois, encoding_info,
            distance_matrix, time_matrix, traffic_penalty_matrix, pois
        )
        
        # Create circuit for visualization (still show full layers for display)
        circuit = self._create_circuit(ising_hamiltonian, {}, qubo_matrix.shape[0])
        
        # Classical fallback uses 1 iteration (exact solver)
        return {
            'success': True,
            'route': route,
            'energy': result.eigenvalue.real,
            'parameters': {},
            'iterations': 1,
            'max_iterations': self.max_iterations,
            'optimization_history': [{'iteration': 1, 'energy': float(result.eigenvalue.real), 'nfev': 1, 'parameters': []}],
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

