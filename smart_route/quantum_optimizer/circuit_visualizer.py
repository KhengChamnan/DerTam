"""
Circuit Visualizer - Show QAOA circuit for teacher presentation
100% FREE - Uses matplotlib for visualization
"""
import matplotlib.pyplot as plt
from qiskit import QuantumCircuit
from qiskit.visualization import circuit_drawer, plot_histogram
from typing import Dict, List, Optional
import numpy as np


class CircuitVisualizer:

    
    def __init__(self, output_dir: str = './outputs/circuits'):
        self.output_dir = output_dir
        
    def visualize_circuit(
        self,
        circuit: QuantumCircuit,
        parameters: Optional[List[float]] = None,
        filename: str = 'qaoa_circuit',
        style: str = 'mpl'
    ) -> str:
        """
        Generate circuit diagram
        FREE - For teacher to see circuit structure
        
        Args:
            circuit: QAOA circuit
            parameters: Optimized [γ₁, β₁, γ₂, β₂] values
            filename: Output filename
            style: 'mpl' (matplotlib) or 'text'
            
        Returns:
            Path to saved image
        """
        print(f"\nGenerating circuit diagram...")
        
        # Bind parameters if provided
        if parameters is not None and len(circuit.parameters) > 0:
            param_dict = dict(zip(circuit.parameters, parameters))
            bound_circuit = circuit.bind_parameters(param_dict)
        else:
            bound_circuit = circuit
        
        # Draw circuit
        if style == 'mpl':
            fig = circuit_drawer(
                bound_circuit,
                output='mpl',
                style={'backgroundcolor': '#FFFFFF'},
                fold=100  # Wrap long circuits
            )
            
            # Save figure
            save_path = f"{self.output_dir}/{filename}.png"
            fig.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Circuit diagram saved: {save_path}")
            return save_path
        else:
            # Text output for console
            print(circuit_drawer(bound_circuit, output='text'))
            return "console"
    
    def explain_qubit_mapping(
        self,
        num_pois: int,
        pois: List[Dict],
        save: bool = True,
        filename: str = 'qubit_mapping'
    ) -> str:
        """
        Create visual qubit-to-feature mapping for teacher
        FREE - Shows which qubit represents what
        
        For 4 POIs:
        Qubit 0:  POI_0 at position 0  [Temple at 1st]
        Qubit 1:  POI_0 at position 1  [Temple at 2nd]
        ...
        Qubit 15: POI_3 at position 3  [Restaurant at 4th]
        
        Returns:
            Explanation text
        """
        n = num_pois
        num_qubits = n * n
        
        explanation_lines = ["=" * 60]
        explanation_lines.append("QUBIT-TO-FEATURE MAPPING FOR TEACHER")
        explanation_lines.append("=" * 60)
        explanation_lines.append(f"\nProblem: {n} POIs, {num_qubits} qubits needed")
        explanation_lines.append(f"Encoding: Position encoding (x_{{i,p}})")
        explanation_lines.append("\nEach qubit represents: POI_i at position_p\n")
        
        # Create mapping table
        explanation_lines.append(f"{'Qubit':<8} {'POI':<6} {'Position':<10} {'Meaning':<30}")
        explanation_lines.append("-" * 60)
        
        for i in range(n):
            poi_name = pois[i]['name'] if i < len(pois) else f"POI_{i}"
            for p in range(n):
                qubit_idx = i * n + p
                position_name = ['1st', '2nd', '3rd', '4th'][p]
                meaning = f"{poi_name} visited {position_name}"
                
                explanation_lines.append(
                    f"{qubit_idx:<8} {i:<6} {p:<10} {meaning:<30}"
                )
        
        explanation_lines.append("\n" + "=" * 60)
        explanation_lines.append("QUANTUM CIRCUIT STRUCTURE")
        explanation_lines.append("=" * 60)
        explanation_lines.append("\n1. Initialization Layer:")
        explanation_lines.append(f"   - Apply Hadamard (H) gates to all {num_qubits} qubits")
        explanation_lines.append(f"   - Creates uniform superposition: |+⟩^⊗{num_qubits}")
        
        explanation_lines.append("\n2. QAOA Ansatz (p=2 layers):")
        explanation_lines.append("   Layer 1:")
        explanation_lines.append("     - Cost Hamiltonian: e^(-iγ₁H_C)")
        explanation_lines.append("       * ZZ gates for distance costs (POI interactions)")
        explanation_lines.append("       * RZ gates for constraint penalties")
        explanation_lines.append("     - Mixer Hamiltonian: e^(-iβ₁H_M)")
        explanation_lines.append("       * RX(2β₁) gates on all qubits")
        explanation_lines.append("   Layer 2:")
        explanation_lines.append("     - Cost Hamiltonian: e^(-iγ₂H_C)")
        explanation_lines.append("     - Mixer Hamiltonian: e^(-iβ₂H_M)")
        
        explanation_lines.append("\n3. Measurement Layer:")
        explanation_lines.append(f"   - Measure all {num_qubits} qubits in computational basis")
        explanation_lines.append("   - Get bitstring: e.g., '1000010000100001'")
        
        explanation_lines.append("\n" + "=" * 60)
        explanation_lines.append("PARAMETER OPTIMIZATION")
        explanation_lines.append("=" * 60)
        explanation_lines.append("\nParameters to optimize: {γ₁, β₁, γ₂, β₂}")
        explanation_lines.append("  - γ (gamma): Cost layer rotation angles")
        explanation_lines.append("  - β (beta): Mixer layer rotation angles")
        explanation_lines.append("  - Range: [0, 2π] radians")
        explanation_lines.append("\nClassical Optimizer: COBYLA")
        explanation_lines.append("  - Iteratively adjusts parameters")
        explanation_lines.append("  - Goal: Minimize expected energy ⟨ψ|H_C|ψ⟩")
        explanation_lines.append("  - Typical iterations: 50-200")
        
        explanation = "\n".join(explanation_lines)
        
        # Save to file
        if save:
            save_path = f"{self.output_dir}/{filename}.txt"
            with open(save_path, 'w') as f:
                f.write(explanation)
            print(f"Qubit mapping saved: {save_path}")
        
        print(explanation)
        return explanation
    
    def plot_measurement_histogram(
        self,
        counts: Dict[str, int],
        top_n: int = 10,
        filename: str = 'measurement_histogram'
    ) -> str:
        """
        Plot measurement outcome histogram
        FREE - Show which solutions were found
        
        Args:
            counts: {'bitstring': count, ...}
            top_n: Show top N most frequent outcomes
            filename: Output filename
            
        Returns:
            Path to saved plot
        """
        # Get top N results
        sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        top_counts = dict(sorted_counts[:top_n])
        
        # Create plot
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Plot bars
        bitstrings = list(top_counts.keys())
        values = list(top_counts.values())
        
        bars = ax.bar(range(len(bitstrings)), values, color='steelblue', alpha=0.7)
        
        # Customize
        ax.set_xlabel('Measurement Outcome (Bitstring)', fontsize=12)
        ax.set_ylabel('Count (out of total shots)', fontsize=12)
        ax.set_title(f'Top {top_n} QAOA Measurement Outcomes', fontsize=14, fontweight='bold')
        ax.set_xticks(range(len(bitstrings)))
        ax.set_xticklabels(bitstrings, rotation=45, ha='right', fontsize=8)
        ax.grid(axis='y', alpha=0.3)
        
        # Add count labels on bars
        for i, (bar, count) in enumerate(zip(bars, values)):
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                   f'{count}',
                   ha='center', va='bottom', fontsize=9)
        
        plt.tight_layout()
        
        # Save
        save_path = f"{self.output_dir}/{filename}.png"
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"Histogram saved: {save_path}")
        return save_path
    
    def plot_convergence(
        self,
        history: List[Tuple[int, float]],
        filename: str = 'convergence'
    ) -> str:
        """
        Plot optimization convergence
        FREE - Show how QAOA improves
        
        Args:
            history: [(iteration, energy), ...]
            filename: Output filename
        """
        iterations = [h[0] for h in history]
        energies = [h[1] for h in history]
        
        fig, ax = plt.subplots(figsize=(10, 6))
        
        ax.plot(iterations, energies, marker='o', linewidth=2, markersize=6)
        ax.set_xlabel('Iteration', fontsize=12)
        ax.set_ylabel('Energy (lower is better)', fontsize=12)
        ax.set_title('QAOA Convergence', fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3)
        
        # Annotate best
        best_idx = np.argmin(energies)
        ax.annotate(
            f'Best: {energies[best_idx]:.2f}',
            xy=(iterations[best_idx], energies[best_idx]),
            xytext=(10, 10), textcoords='offset points',
            bbox=dict(boxstyle='round', facecolor='yellow', alpha=0.5),
            arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0')
        )
        
        plt.tight_layout()
        
        save_path = f"{self.output_dir}/{filename}.png"
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"Convergence plot saved: {save_path}")
        return save_path
    
    def create_teacher_presentation(
        self,
        circuit: QuantumCircuit,
        parameters: List[float],
        counts: Dict[str, int],
        route: List[int],
        pois: List[Dict],
        energy: float,
        num_qubits: int
    ) -> Dict[str, str]:
        """
        Generate complete visualization package for teacher
        FREE - All materials for presentation
        
        Returns:
            Dictionary of saved file paths
        """
        print("\n" + "=" * 60)
        print("GENERATING TEACHER PRESENTATION MATERIALS")
        print("=" * 60)
        
        outputs = {}
        
        # 1. Circuit diagram
        outputs['circuit'] = self.visualize_circuit(
            circuit, parameters, 'qaoa_circuit_with_params'
        )
        
        # 2. Qubit mapping explanation
        outputs['mapping'] = self.explain_qubit_mapping(
            len(pois), pois, save=True
        )
        
        # 3. Measurement histogram
        outputs['histogram'] = self.plot_measurement_histogram(
            counts, top_n=10
        )
        
        # 4. Summary statistics
        summary = self._generate_summary_stats(
            circuit, parameters, route, pois, energy, num_qubits
        )
        outputs['summary'] = summary
        
        print("\n" + "=" * 60)
        print("PRESENTATION MATERIALS READY!")
        print("=" * 60)
        print(f"\nFiles saved in: {self.output_dir}/")
        for key, path in outputs.items():
            print(f"  - {key}: {path}")
        
        return outputs
    
    def _generate_summary_stats(
        self,
        circuit: QuantumCircuit,
        parameters: List[float],
        route: List[int],
        pois: List[Dict],
        energy: float,
        num_qubits: int
    ) -> str:
        """Generate summary statistics text file"""
        lines = ["=" * 60]
        lines.append("QAOA SUMMARY STATISTICS FOR TEACHER")
        lines.append("=" * 60)
        
        lines.append("\n--- PROBLEM SIZE ---")
        lines.append(f"Number of POIs: {len(pois)}")
        lines.append(f"Number of qubits: {num_qubits}")
        lines.append(f"Number of binary variables: {num_qubits}")
        
        lines.append("\n--- CIRCUIT DETAILS ---")
        lines.append(f"Circuit depth: {circuit.depth()}")
        lines.append(f"Total gates: {len(circuit.data)}")
        lines.append(f"Number of QAOA layers (p): {len(parameters) // 2}")
        lines.append(f"Number of parameters: {len(parameters)}")
        
        lines.append("\n--- OPTIMIZED PARAMETERS ---")
        for i in range(0, len(parameters), 2):
            layer = i // 2 + 1
            gamma = parameters[i]
            beta = parameters[i+1]
            lines.append(f"Layer {layer}:")
            lines.append(f"  γ{layer} = {gamma:.4f} rad ({gamma*180/np.pi:.2f}°)")
            lines.append(f"  β{layer} = {beta:.4f} rad ({beta*180/np.pi:.2f}°)")
        
        lines.append("\n--- SOLUTION ---")
        lines.append(f"Route: {[pois[i]['name'] for i in route]}")
        lines.append(f"Final energy: {energy:.4f}")
        
        lines.append("\n--- GATE BREAKDOWN ---")
        gate_counts = {}
        for instruction in circuit.data:
            gate_name = instruction[0].name
            gate_counts[gate_name] = gate_counts.get(gate_name, 0) + 1
        
        for gate, count in sorted(gate_counts.items()):
            lines.append(f"{gate.upper()}: {count} gates")
        
        summary = "\n".join(lines)
        
        # Save
        save_path = f"{self.output_dir}/summary_statistics.txt"
        with open(save_path, 'w') as f:
            f.write(summary)
        
        print(f"\nSummary statistics saved: {save_path}")
        return save_path


# Example usage (FREE)
if __name__ == "__main__":
    import os
    os.makedirs('./outputs/circuits', exist_ok=True)
    
    visualizer = CircuitVisualizer(output_dir='./outputs/circuits')
    
    # Sample data
    sample_pois = [
        {'id': 1, 'name': 'Temple'},
        {'id': 2, 'name': 'Museum'},
        {'id': 3, 'name': 'Beach'},
        {'id': 4, 'name': 'Restaurant'}
    ]
    
    # Show qubit mapping
    visualizer.explain_qubit_mapping(4, sample_pois, save=True)
    
    print("\nVisualization tools ready for teacher demonstration!")
