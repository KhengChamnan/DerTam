"""
QAOA Solver - Quantum Approximate Optimization Algorithm
100% FREE - Uses Qiskit Aer Simulator (no quantum hardware needed)
"""
from qiskit import QuantumCircuit, transpile
from qiskit_aer.primitives import Sampler
from qiskit_aer import AerSimulator
from qiskit_algorithms.optimizers import COBYLA, SPSA
from qiskit.circuit import Parameter
import numpy as np
from typing import List, Dict, Tuple, Optional


class QAOASolver:
    """
    QAOA for Tourist Route Optimization
    100% FREE - Quantum simulation only
    
    For Teacher Understanding:
    - Hybrid quantum-classical algorithm
    - Quantum circuit runs on FREE Qiskit Aer simulator
    - Classical optimizer (COBYLA) finds best parameters
    - Ansatz: Alternating cost + mixer layers
    
    Circuit Structure (p=2 layers):
    1. Initialize: |+⟩⊗16 (Hadamard on all qubits)
    2. Cost layer 1: e^(-iγ₁H_C) - ZZ gates + Z rotations
    3. Mixer layer 1: e^(-iβ₁H_M) - RX rotations
    4. Cost layer 2: e^(-iγ₂H_C)
    5. Mixer layer 2: e^(-iβ₂H_M)
    6. Measure all qubits
    
    Parameters to optimize: {γ₁, β₁, γ₂, β₂} ∈ [0, 2π]
    """
    
    def __init__(
        self,
        num_layers: int = 2,
        shots: int = 1024,
        optimizer: str = 'COBYLA',
        max_iterations: int = 100
    ):
        """
        Args:
            num_layers: Number of QAOA layers (p parameter) - default 2
            shots: Number of quantum measurements - default 1024
            optimizer: Classical optimizer ('COBYLA' or 'SPSA')
            max_iterations: Max optimization iterations
        """
        self.p = num_layers
        self.shots = shots
        self.max_iter = max_iterations
        
        # Select classical optimizer (both FREE)
        if optimizer == 'COBYLA':
            self.optimizer = COBYLA(maxiter=max_iterations)
        else:
            self.optimizer = SPSA(maxiter=max_iterations)
        
        # Use FREE Aer simulator
        self.backend = AerSimulator()
        
    def solve(
        self,
        qubo_matrix: np.ndarray,
        n_pois: int,
        initial_params: Optional[List[float]] = None
    ) -> Dict:
        """
        Solve QUBO using QAOA
        FREE - Runs on simulator, no quantum hardware costs
        
        Args:
            qubo_matrix: QUBO matrix from encoder
            n_pois: Number of POIs
            initial_params: Optional starting parameters [γ₁,β₁,...,γₚ,βₚ]
            
        Returns:
            {
                'solution': binary solution [0,1,0,...],
                'route': decoded route [0,2,1,3],
                'energy': final energy value,
                'parameters': optimized [γ₁,β₁,γ₂,β₂],
                'circuit': quantum circuit object,
                'counts': measurement counts,
                'iterations': number of iterations,
                'is_valid': whether solution satisfies constraints
            }
        """
        num_qubits = qubo_matrix.shape[0]
        
        # Create parameterized QAOA circuit
        circuit, params = self._create_qaoa_circuit(qubo_matrix, num_qubits)
        
        # Initial parameter guess if not provided
        if initial_params is None:
            # Random initialization in [0, 2π]
            initial_params = np.random.uniform(0, 2*np.pi, 2*self.p)
        
        # Cost function for classical optimization
        def cost_function(parameters):
            return self._evaluate_energy(circuit, params, parameters, qubo_matrix)
        
        # Classical optimization loop (FREE - COBYLA)
        print(f"Starting QAOA optimization with {self.p} layers...")
        print(f"Optimizing {len(initial_params)} parameters...")
        
        result = self.optimizer.minimize(
            fun=cost_function,
            x0=initial_params
        )
        
        # Get best solution
        optimal_params = result.x
        optimal_energy = result.fun
        
        # Run circuit with optimal parameters and get counts
        counts = self._get_measurement_counts(circuit, params, optimal_params)
        
        # Extract best binary solution
        best_bitstring = max(counts, key=counts.get)
        binary_solution = [int(bit) for bit in best_bitstring]
        
        # Decode to route
        from .qubo_encoder import QUBOEncoder
        encoder = QUBOEncoder()
        route, is_valid = encoder.decode_solution(binary_solution, n_pois)
        
        return {
            'solution': binary_solution,
            'route': route,
            'energy': optimal_energy,
            'parameters': optimal_params.tolist(),
            'circuit': circuit,
            'counts': counts,
            'iterations': result.nfev,  # Function evaluations
            'is_valid': is_valid,
            'num_qubits': num_qubits,
            'num_layers': self.p
        }
    
    def _create_qaoa_circuit(
        self,
        qubo_matrix: np.ndarray,
        num_qubits: int
    ) -> Tuple[QuantumCircuit, List[Parameter]]:
        """
        Create parameterized QAOA circuit
        FREE - For teacher visualization
        
        Circuit Structure:
        - H gates on all qubits (initialization)
        - p repetitions of:
            * Cost layer: ZZ and Z gates (from QUBO)
            * Mixer layer: RX gates
        - Measurement on all qubits
        
        Returns:
            (circuit, parameter_list)
        """
        qc = QuantumCircuit(num_qubits, num_qubits)
        
        # Initialize all qubits to |+⟩ superposition
        qc.h(range(num_qubits))
        qc.barrier()
        
        # Create parameters: [γ₁, β₁, γ₂, β₂, ..., γₚ, βₚ]
        gamma_params = [Parameter(f'γ_{i+1}') for i in range(self.p)]
        beta_params = [Parameter(f'β_{i+1}') for i in range(self.p)]
        
        # Alternate cost and mixer layers p times
        for layer in range(self.p):
            # Cost Hamiltonian: e^(-iγH_C)
            self._apply_cost_layer(qc, qubo_matrix, gamma_params[layer])
            qc.barrier()
            
            # Mixer Hamiltonian: e^(-iβH_M)
            self._apply_mixer_layer(qc, num_qubits, beta_params[layer])
            qc.barrier()
        
        # Measure all qubits
        qc.measure(range(num_qubits), range(num_qubits))
        
        # Return circuit and flat parameter list
        all_params = []
        for i in range(self.p):
            all_params.append(gamma_params[i])
            all_params.append(beta_params[i])
        
        return qc, all_params
    
    def _apply_cost_layer(
        self,
        qc: QuantumCircuit,
        qubo_matrix: np.ndarray,
        gamma: Parameter
    ):
        """
        Apply cost Hamiltonian layer
        
        For each QUBO term:
        - Diagonal Q[i][i]: Apply RZ(2*γ*Q[i][i]) gate
        - Off-diagonal Q[i][j]: Apply ZZ interaction
        
        This encodes the QUBO objective into quantum gates
        """
        n = qubo_matrix.shape[0]
        
        # Apply linear terms (diagonal)
        for i in range(n):
            if qubo_matrix[i][i] != 0:
                # RZ gate for linear cost
                angle = 2 * gamma * qubo_matrix[i][i]
                qc.rz(angle, i)
        
        # Apply quadratic terms (off-diagonal)
        for i in range(n):
            for j in range(i + 1, n):
                if qubo_matrix[i][j] != 0:
                    # ZZ interaction gate
                    angle = 2 * gamma * qubo_matrix[i][j]
                    qc.rzz(angle, i, j)
    
    def _apply_mixer_layer(
        self,
        qc: QuantumCircuit,
        num_qubits: int,
        beta: Parameter
    ):
        """
        Apply mixer Hamiltonian layer
        
        Standard X-mixer: Apply RX(2β) to all qubits
        This allows exploration of solution space
        """
        for qubit in range(num_qubits):
            qc.rx(2 * beta, qubit)
    
    def _evaluate_energy(
        self,
        circuit: QuantumCircuit,
        params: List[Parameter],
        param_values: List[float],
        qubo_matrix: np.ndarray
    ) -> float:
        """
        Evaluate expected energy for given parameters
        
        This is the cost function for classical optimizer:
        1. Bind parameters to circuit
        2. Run on simulator
        3. Calculate expected QUBO energy from measurements
        
        Returns:
            Average energy (lower is better)
        """
        # Bind parameters
        bound_circuit = circuit.bind_parameters(
            dict(zip(params, param_values))
        )
        
        # Get measurement counts
        counts = self._get_measurement_counts(circuit, params, param_values)
        
        # Calculate expected energy
        total_energy = 0.0
        total_counts = sum(counts.values())
        
        for bitstring, count in counts.items():
            # Convert bitstring to binary vector
            x = np.array([int(bit) for bit in bitstring])
            
            # Calculate QUBO energy: x^T Q x
            energy = x.T @ qubo_matrix @ x
            
            # Weight by probability
            probability = count / total_counts
            total_energy += energy * probability
        
        return total_energy
    
    def _get_measurement_counts(
        self,
        circuit: QuantumCircuit,
        params: List[Parameter],
        param_values: List[float]
    ) -> Dict[str, int]:
        """
        Run circuit and get measurement counts
        FREE - Uses Aer simulator
        
        Returns:
            {'0101...': 234, '1010...': 189, ...}
        """
        # Bind parameters
        bound_circuit = circuit.bind_parameters(
            dict(zip(params, param_values))
        )
        
        # Transpile for simulator
        transpiled = transpile(bound_circuit, self.backend)
        
        # Run simulation (FREE)
        job = self.backend.run(transpiled, shots=self.shots)
        result = job.result()
        counts = result.get_counts()
        
        return counts


# Example usage for teacher demonstration (FREE)
if __name__ == "__main__":
    from qubo_encoder import QUBOEncoder
    
    # Sample 4 POIs (teacher requirement)
    sample_pois = [
        {'id': 1, 'name': 'Temple'},
        {'id': 2, 'name': 'Museum'},
        {'id': 3, 'name': 'Beach'},
        {'id': 4, 'name': 'Restaurant'}
    ]
    
    # Distance matrix
    distance_matrix = np.array([
        [0.0, 2.5, 4.0, 3.0],
        [2.5, 0.0, 3.5, 2.0],
        [4.0, 3.5, 0.0, 5.0],
        [3.0, 2.0, 5.0, 0.0]
    ])
    
    # Step 1: Encode to QUBO (FREE)
    print("Step 1: Encoding TSP to QUBO...")
    encoder = QUBOEncoder(penalty_coefficient=100.0)
    qubo_matrix, info = encoder.encode_tsp(sample_pois, distance_matrix)
    
    print(f"QUBO Matrix size: {info['num_qubits']}×{info['num_qubits']}")
    print(f"Number of qubits: {info['num_qubits']}")
    print(f"Encoding type: {info['encoding_type']}\n")
    
    # Step 2: Solve with QAOA (FREE - simulation)
    print("Step 2: Running QAOA optimization...")
    solver = QAOASolver(num_layers=2, shots=1024, optimizer='COBYLA')
    result = solver.solve(qubo_matrix, n_pois=4)
    
    print(f"\n=== QAOA Results ===")
    print(f"Route: {[sample_pois[i]['name'] for i in result['route']]}")
    print(f"Energy: {result['energy']:.2f}")
    print(f"Valid solution: {result['is_valid']}")
    print(f"Optimized parameters: {[f'{p:.3f}' for p in result['parameters']]}")
    print(f"Iterations: {result['iterations']}")
    print(f"\nCircuit depth: {result['circuit'].depth()}")
    print(f"Number of gates: {len(result['circuit'].data)}")
    
    # Show top measurement results
    print(f"\nTop 5 measurement outcomes:")
    sorted_counts = sorted(result['counts'].items(), key=lambda x: x[1], reverse=True)
    for bitstring, count in sorted_counts[:5]:
        prob = count / solver.shots * 100
        print(f"  {bitstring}: {count} ({prob:.1f}%)")
