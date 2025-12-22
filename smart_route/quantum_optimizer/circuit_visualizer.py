"""
Circuit Visualizer for QAOA
Visualizes quantum circuits and optimization progress
"""
import numpy as np
from typing import Dict, List, Optional, Tuple
from qiskit import QuantumCircuit, transpile
from qiskit.visualization import plot_histogram
from qiskit_aer import AerSimulator
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
from pathlib import Path
import json

# Note: plot_circuit doesn't exist in qiskit.visualization
# We use circuit.draw() method instead, which is already implemented below


class CircuitVisualizer:
    """
    Visualize QAOA circuits and results
    """
    
    def __init__(self, output_dir: str = "outputs/circuits"):
        """
        Initialize circuit visualizer
        
        Args:
            output_dir: Directory to save visualizations
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def visualize_circuit(
        self,
        circuit: QuantumCircuit,
        title: str = "QAOA Circuit",
        filename: Optional[str] = None,
        parameters: Optional[Dict] = None,
        encoding_info: Optional[Dict] = None
    ) -> str:
        """
        Visualize quantum circuit with detailed parameters
        
        Args:
            circuit: QuantumCircuit object
            title: Plot title
            filename: Output filename (optional)
            parameters: QAOA parameters (gamma, beta values)
            encoding_info: Encoding information with qubit mapping
            
        Returns:
            Path to saved visualization
        """
        if filename is None:
            filename = f"circuit_{hash(str(circuit))}.png"
        
        filepath = self.output_dir / filename
        
        try:
            # Plot circuit using circuit.draw() method
            # Try different output formats for compatibility
            try:
                # Try matplotlib output (most common)
                fig = circuit.draw('mpl', output='mpl', style='clifford')
                if hasattr(fig, 'suptitle'):
                    fig.suptitle(title, fontsize=14, fontweight='bold')
                fig.savefig(filepath, dpi=150, bbox_inches='tight')
                plt.close(fig)
            except (TypeError, AttributeError):
                # Fallback: try without style parameter
                try:
                    fig = circuit.draw('mpl', output='mpl')
                    if hasattr(fig, 'suptitle'):
                        fig.suptitle(title, fontsize=14, fontweight='bold')
                    fig.savefig(filepath, dpi=150, bbox_inches='tight')
                    plt.close(fig)
                except Exception:
                    # Final fallback: return None if image creation fails
                    return None
            
            # Verify the file was created and is a valid image
            if filepath.exists() and filepath.suffix.lower() == '.png':
                return str(filepath)
            else:
                # File doesn't exist or is not an image - return None
                return None
        except Exception as e:
            print(f"Error visualizing circuit: {e}")
            # Return None instead of text file to indicate failure
            return None
    
    def create_detailed_circuit_visualization(
        self,
        circuit: QuantumCircuit,
        parameters: Dict,
        encoding_info: Optional[Dict] = None,
        filename: Optional[str] = None,
        num_layers: Optional[int] = None,
        shots: int = 1024,
        simulate: bool = False
    ) -> Dict[str, str]:
        """
        Create detailed circuit visualization with parameters, angles, and qubit labels
        
        Args:
            circuit: QuantumCircuit object
            parameters: QAOA parameters dictionary
            encoding_info: Encoding information with qubit mapping
            filename: Base filename (optional)
            num_layers: Number of QAOA layers (p parameter) - explicitly passed
            shots: Number of measurement shots for simulation (if simulate=True)
            simulate: Whether to simulate the circuit to get measurement counts
            
        Returns:
            Dictionary with visualization file paths and parameter details
        """
        import math
        import re
        
        if filename is None:
            filename = "detailed_circuit"
        
        # Extract qubit mapping
        qubit_mapping = {}
        if encoding_info:
            qubit_mapping = encoding_info.get('qubit_mapping', {})
            qubit_features = encoding_info.get('qubit_features', [])
            for i, feature in enumerate(qubit_features):
                qubit_mapping[i] = feature
        
        num_qubits = circuit.num_qubits
        
        # Extract parameters with improved parsing for various naming conventions
        # Supports: β[0], γ[0], gamma_0, beta_0, or positional parameters
        gammas = []
        betas = []
        param_details = {}
        
        # Helper function to extract index from parameter key
        def extract_index(key):
            """Extract numeric index from parameter key like 'γ[0]' or 'gamma_1'"""
            match = re.search(r'\[(\d+)\]|_(\d+)$|(\d+)$', str(key))
            if match:
                for g in match.groups():
                    if g is not None:
                        return int(g)
            return 0
        
        # Collect gamma and beta parameters with their indices
        gamma_params = []  # List of (index, value)
        beta_params = []   # List of (index, value)
        unidentified_params = []  # Parameters we couldn't identify
        
        if isinstance(parameters, dict) and parameters:
            for key, value in parameters.items():
                key_str = str(key)
                float_value = float(value) if not isinstance(value, complex) else float(value.real)
                idx = extract_index(key_str)
                
                # Check for gamma parameters (γ, gamma)
                if 'γ' in key_str or 'gamma' in key_str.lower():
                    gamma_params.append((idx, float_value))
                    param_details[key_str] = {
                        'value': float_value,
                        'type': 'gamma',
                        'layer': idx + 1,
                        'angle_rad': float_value,
                        'angle_deg': math.degrees(float_value),
                        'angle_pi': f"{float_value/math.pi:.3f}π" if float_value != 0 else "0"
                    }
                # Check for beta parameters (β, beta)
                elif 'β' in key_str or 'beta' in key_str.lower():
                    beta_params.append((idx, float_value))
                    param_details[key_str] = {
                        'value': float_value,
                        'type': 'beta',
                        'layer': idx + 1,
                        'angle_rad': float_value,
                        'angle_deg': math.degrees(float_value),
                        'angle_pi': f"{float_value/math.pi:.3f}π" if float_value != 0 else "0"
                    }
                else:
                    # Store unidentified parameters for fallback
                    unidentified_params.append(float_value)
            
            # Fallback: if no gamma/beta identified, split unidentified params
            if not gamma_params and not beta_params and unidentified_params:
                mid = len(unidentified_params) // 2
                for i, v in enumerate(unidentified_params[:mid]):
                    gamma_params.append((i, v))
                    param_details[f'gamma_{i}'] = {
                        'value': v,
                        'type': 'gamma',
                        'layer': i + 1,
                        'angle_rad': v,
                        'angle_deg': math.degrees(v),
                        'angle_pi': f"{v/math.pi:.3f}π" if v != 0 else "0"
                    }
                for i, v in enumerate(unidentified_params[mid:]):
                    beta_params.append((i, v))
                    param_details[f'beta_{i}'] = {
                        'value': v,
                        'type': 'beta',
                        'layer': i + 1,
                        'angle_rad': v,
                        'angle_deg': math.degrees(v),
                        'angle_pi': f"{v/math.pi:.3f}π" if v != 0 else "0"
                    }
        
        # Sort by index and extract values
        gamma_params.sort(key=lambda x: x[0])
        beta_params.sort(key=lambda x: x[0])
        gammas = [v for _, v in gamma_params]
        betas = [v for _, v in beta_params]
        
        # Determine actual number of layers
        # Priority: explicit num_layers > len(gammas) > len(betas) > 1
        if num_layers is not None:
            actual_num_layers = num_layers
        elif gammas:
            actual_num_layers = len(gammas)
        elif betas:
            actual_num_layers = len(betas)
        else:
            actual_num_layers = 1
        
        # Create parameter summary text
        param_summary = []
        param_summary.append("=" * 60)
        param_summary.append("QAOA Circuit Parameters")
        param_summary.append("=" * 60)
        param_summary.append(f"\nNumber of Qubits: {num_qubits}")
        param_summary.append(f"Number of Layers (p): {actual_num_layers}")
        
        if qubit_mapping:
            param_summary.append("\nQubit Feature Mapping:")
            for qubit_idx, feature in qubit_mapping.items():
                param_summary.append(f"  Q{qubit_idx}: {feature}")
        
        param_summary.append("\nRotation Angles:")
        for key, details in param_details.items():
            param_summary.append(f"\n  {key} (Layer {details.get('layer', 'N/A')}):")
            param_summary.append(f"    Value: {details['value']:.6f}")
            param_summary.append(f"    Angle: {details['angle_rad']:.6f} rad = {details['angle_deg']:.2f}°")
            param_summary.append(f"    In π units: {details['angle_pi']}")
            if details['type'] == 'gamma':
                param_summary.append(f"    Rotation: R_Z(2γ) = R_Z({2*details['value']:.6f})")
            else:
                param_summary.append(f"    Rotation: R_X(2β) = R_X({2*details['value']:.6f})")
        
        # Calculate rotation angles for each gate - use actual_num_layers
        gate_details = []
        for layer_idx in range(actual_num_layers):
            # Use extracted values or generate varied defaults per layer
            # Varied defaults make it obvious if extraction failed
            if layer_idx < len(gammas):
                gamma = gammas[layer_idx]
            else:
                # Generate varied default based on layer index
                gamma = 0.1 + 0.05 * layer_idx
            
            if layer_idx < len(betas):
                beta = betas[layer_idx]
            else:
                # Generate varied default based on layer index
                beta = 0.1 + 0.03 * layer_idx
            
            gate_details.append({
                'layer': layer_idx + 1,
                'gamma': gamma,
                'beta': beta,
                'rz_angle': 2 * gamma,
                'rx_angle': 2 * beta,
                'rz_angle_pi': f"{2*gamma/math.pi:.3f}π" if gamma != 0 else "0",
                'rx_angle_pi': f"{2*beta/math.pi:.3f}π" if beta != 0 else "0"
            })
        
        param_summary.append("\n\nGate Details by Layer:")
        for gate in gate_details:
            param_summary.append(f"\n  Layer {gate['layer']}:")
            param_summary.append(f"    Cost Hamiltonian (R_Z):")
            param_summary.append(f"      γ = {gate['gamma']:.6f}")
            param_summary.append(f"      Angle: {gate['rz_angle']:.6f} rad = {gate['rz_angle_pi']}")
            param_summary.append(f"    Mixer Hamiltonian (R_X):")
            param_summary.append(f"      β = {gate['beta']:.6f}")
            param_summary.append(f"      Angle: {gate['rx_angle']:.6f} rad = {gate['rx_angle_pi']}")
        
        # Save parameter details
        param_text = "\n".join(param_summary)
        param_file = self.output_dir / f"{filename}_parameters.txt"
        with open(param_file, 'w', encoding='utf-8') as f:
            f.write(param_text)
        
        # Create circuit visualization
        circuit_file = self.visualize_circuit(
            circuit,
            title=f"QAOA Circuit - {num_qubits} Qubits, {actual_num_layers} Layers",
            filename=f"{filename}_circuit.png",
            parameters=parameters,
            encoding_info=encoding_info
        )
        
        # Only include circuit_image if it's a valid image file
        result_dict = {
            'parameters_text': str(param_file),
            'parameters': param_details,
            'gate_details': gate_details,
            'qubit_mapping': qubit_mapping,
            'summary': param_text,
            'num_layers': actual_num_layers,
            'num_qubits': num_qubits
        }
        
        # Add circuit_image only if visualization was successful
        if circuit_file is not None:
            result_dict['circuit_image'] = circuit_file
        
        # Optionally simulate circuit to get measurement counts
        if simulate:
            try:
                simulated_counts = self.simulate_circuit(circuit, shots)
                result_dict['simulated_counts'] = simulated_counts
                
                # Create visualization of simulated results
                meas_file = self.visualize_measurement_results(
                    counts=simulated_counts,
                    title=f"Simulated Measurement Results ({shots} shots)",
                    filename=f"{filename}_simulated_measurements.png",
                    top_k=None  # Show all results
                )
                if meas_file:
                    result_dict['simulated_measurements_image'] = meas_file
            except Exception as e:
                print(f"Error simulating circuit: {e}")
        
        return result_dict
    
    def simulate_circuit(
        self,
        circuit: QuantumCircuit,
        shots: int = 1024
    ) -> Dict[str, int]:
        """
        Simulate quantum circuit using AerSimulator
        
        Args:
            circuit: QuantumCircuit object to simulate
            shots: Number of measurement shots
            
        Returns:
            Dictionary mapping bitstrings to counts
        """
        try:
            # Create simulator
            sim = AerSimulator()
            
            # Transpile circuit for simulator
            compiled = transpile(circuit, sim)
            
            # Run simulation
            job = sim.run(compiled, shots=shots)
            result = job.result()
            counts = result.get_counts()
            
            return counts
        except Exception as e:
            print(f"Error simulating circuit: {e}")
            return {}
    
    def visualize_measurement_results(
        self,
        counts: Optional[Dict[str, int]] = None,
        circuit: Optional[QuantumCircuit] = None,
        shots: int = 1024,
        title: str = "Measurement Results",
        filename: Optional[str] = None,
        top_k: Optional[int] = None
    ) -> str:
        """
        Visualize measurement results as histogram
        
        Args:
            counts: Dictionary mapping bitstrings to counts (optional if circuit provided)
            circuit: QuantumCircuit object to simulate (optional if counts provided)
            shots: Number of measurement shots (used if circuit is provided)
            title: Plot title
            filename: Output filename (optional)
            top_k: Number of top results to show (None = show all)
            
        Returns:
            Path to saved visualization
        """
        # If circuit is provided but no counts, simulate the circuit
        if circuit is not None and counts is None:
            counts = self.simulate_circuit(circuit, shots)
        
        if counts is None or len(counts) == 0:
            print("Warning: No counts provided and circuit simulation failed")
            return ""
        
        if filename is None:
            filename = f"measurements_{hash(str(counts))}.png"
        
        filepath = self.output_dir / filename
        
        try:
            # Sort by count (highest to lowest) and optionally take top K
            sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)
            if top_k is not None:
                sorted_counts = sorted_counts[:top_k]
            
            # Extract labels and values in sorted order
            labels = [bitstring for bitstring, _ in sorted_counts]
            values = [count for _, count in sorted_counts]
            
            # Create custom sorted bar plot
            fig, ax = plt.subplots(figsize=(14, 8))
            bars = ax.bar(range(len(labels)), values, color='#4fc3f7', edgecolor='#0288d1', linewidth=0.5)
            
            # Set labels
            ax.set_xlabel('Quantum State', fontsize=12, fontweight='bold')
            ax.set_ylabel('Measurement Count', fontsize=12, fontweight='bold')
            ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
            
            # Set x-axis labels with rotation
            ax.set_xticks(range(len(labels)))
            ax.set_xticklabels(labels, rotation=45, ha='right', fontsize=9)
            
            # Add value labels on top of bars
            total_shots = sum(values)
            for i, (bar, count) in enumerate(zip(bars, values)):
                height = bar.get_height()
                percentage = (count / total_shots * 100) if total_shots > 0 else 0
                ax.text(bar.get_x() + bar.get_width()/2., height,
                       f'{int(count)}\n({percentage:.1f}%)',
                       ha='center', va='bottom', fontsize=8, fontweight='bold')
            
            # Add grid for better readability
            ax.grid(True, alpha=0.3, axis='y', linestyle='--')
            ax.set_axisbelow(True)
            
            plt.tight_layout()
            fig.savefig(filepath, dpi=150, bbox_inches='tight')
            plt.close(fig)
            
            return str(filepath)
        except Exception as e:
            print(f"Error visualizing measurements: {e}")
            return ""
    
    def visualize_optimization_progress(
        self,
        optimization_history: List[Dict],
        title: str = "QAOA Optimization Progress",
        filename: Optional[str] = None
    ) -> str:
        """
        Visualize parameter optimization progress
        
        Args:
            optimization_history: List of optimization steps
                Each dict should have 'iteration', 'energy', 'parameters'
            title: Plot title
            filename: Output filename (optional)
            
        Returns:
            Path to saved visualization
        """
        if filename is None:
            filename = f"optimization_{len(optimization_history)}.png"
        
        filepath = self.output_dir / filename
        
        try:
            iterations = [step['iteration'] for step in optimization_history]
            energies = [step['energy'] for step in optimization_history]
            
            fig, ax = plt.subplots(figsize=(10, 6))
            ax.plot(iterations, energies, 'b-', linewidth=2, marker='o', markersize=4)
            ax.set_xlabel('Iteration', fontsize=12)
            ax.set_ylabel('Energy', fontsize=12)
            ax.set_title(title, fontsize=14, fontweight='bold')
            ax.grid(True, alpha=0.3)
            plt.tight_layout()
            fig.savefig(filepath, dpi=150, bbox_inches='tight')
            plt.close(fig)
            
            return str(filepath)
        except Exception as e:
            print(f"Error visualizing optimization: {e}")
            return ""
    
    def create_route_visualization(
        self,
        route: List[int],
        pois: List[Dict],
        distance_matrix: np.ndarray,
        title: str = "Optimized Route",
        filename: Optional[str] = None
    ) -> str:
        """
        Visualize route on map (simplified 2D plot)
        
        Args:
            route: Route as list of POI indices
            pois: List of POI dictionaries with 'lat', 'lng', 'name'
            distance_matrix: Distance matrix
            title: Plot title
            filename: Output filename (optional)
            
        Returns:
            Path to saved visualization
        """
        if filename is None:
            filename = f"route_{hash(str(route))}.png"
        
        filepath = self.output_dir / filename
        
        try:
            fig, ax = plt.subplots(figsize=(12, 8))
            
            # Extract coordinates
            lats = [pois[i]['lat'] for i in route]
            lngs = [pois[i]['lng'] for i in route]
            names = [pois[i].get('name', f'POI_{i}') for i in route]
            
            # Plot route
            ax.plot(lngs, lats, 'b-o', linewidth=2, markersize=8, label='Route')
            
            # Add arrows to show direction
            for i in range(len(route) - 1):
                dx = lngs[i+1] - lngs[i]
                dy = lats[i+1] - lats[i]
                ax.arrow(lngs[i], lats[i], dx*0.7, dy*0.7,
                        head_width=0.001, head_length=0.001, fc='blue', ec='blue')
            
            # Annotate POIs
            for i, (lat, lng, name) in enumerate(zip(lats, lngs, names)):
                ax.annotate(f"{i+1}. {name}", (lng, lat),
                           xytext=(5, 5), textcoords='offset points',
                           fontsize=9, bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.7))
            
            ax.set_xlabel('Longitude', fontsize=12)
            ax.set_ylabel('Latitude', fontsize=12)
            ax.set_title(title, fontsize=14, fontweight='bold')
            ax.grid(True, alpha=0.3)
            ax.legend()
            plt.tight_layout()
            fig.savefig(filepath, dpi=150, bbox_inches='tight')
            plt.close(fig)
            
            return str(filepath)
        except Exception as e:
            print(f"Error visualizing route: {e}")
            return ""
    
    def create_comprehensive_visualization(
        self,
        qaoa_result: Dict,
        pois: List[Dict],
        distance_matrix: np.ndarray,
        encoding_info: Optional[Dict] = None
    ) -> Dict[str, str]:
        """
        Create comprehensive visualization package
        
        Args:
            qaoa_result: QAOA result dictionary
            pois: List of POI dictionaries
            distance_matrix: Distance matrix
            encoding_info: Encoding information
            
        Returns:
            Dictionary mapping visualization type to filepath
        """
        visualizations = {}
        
        # 1. Measurement results
        if 'counts' in qaoa_result:
            vis_path = self.visualize_measurement_results(
                qaoa_result['counts'],
                title="QAOA Measurement Results",
                filename="measurements.png"
            )
            if vis_path:
                visualizations['measurements'] = vis_path
        
        # 2. Route visualization
        if 'route' in qaoa_result:
            vis_path = self.create_route_visualization(
                qaoa_result['route'],
                pois,
                distance_matrix,
                title="Optimized Route",
                filename="route.png"
            )
            if vis_path:
                visualizations['route'] = vis_path
        
        # 3. Circuit (if available)
        if 'circuit' in qaoa_result and qaoa_result['circuit'] is not None:
            vis_path = self.visualize_circuit(
                qaoa_result['circuit'],
                title="QAOA Circuit",
                filename="circuit.png"
            )
            if vis_path:
                visualizations['circuit'] = vis_path
        
        return visualizations
    
    def _create_text_circuit(self, circuit: QuantumCircuit, filepath: Path) -> str:
        """
        Create text representation of circuit
        
        Args:
            circuit: QuantumCircuit object
            filepath: Output filepath
            
        Returns:
            Path to saved file
        """
        try:
            text_repr = str(circuit)
            with open(filepath.with_suffix('.txt'), 'w') as f:
                f.write(text_repr)
            return str(filepath.with_suffix('.txt'))
        except Exception as e:
            print(f"Error creating text circuit: {e}")
            return ""
    
    def export_results_json(
        self,
        qaoa_result: Dict,
        filepath: Optional[str] = None
    ) -> str:
        """
        Export QAOA results to JSON
        
        Args:
            qaoa_result: QAOA result dictionary
            filepath: Output filepath (optional)
            
        Returns:
            Path to saved JSON file
        """
        if filepath is None:
            filepath = self.output_dir / "qaoa_result.json"
        else:
            filepath = Path(filepath)
        
        # Convert numpy types to native Python types
        def convert_to_native(obj):
            if isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, dict):
                return {k: convert_to_native(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_to_native(item) for item in obj]
            else:
                return obj
        
        exportable_result = convert_to_native(qaoa_result)
        
        with open(filepath, 'w') as f:
            json.dump(exportable_result, f, indent=2)
        
        return str(filepath)


# Example usage
if __name__ == "__main__":
    # Sample data
    sample_pois = [
        {"id": "poi_01", "name": "Royal Palace", "lat": 11.5625, "lng": 104.9310},
        {"id": "poi_02", "name": "Silver Pagoda", "lat": 11.5627, "lng": 104.9312},
        {"id": "poi_03", "name": "National Museum", "lat": 11.5640, "lng": 104.9282},
        {"id": "poi_04", "name": "Independence Monument", "lat": 11.5564, "lng": 104.9312}
    ]
    
    distance_matrix = np.array([
        [0.0, 0.2, 0.3, 0.6],
        [0.2, 0.0, 0.2, 0.5],
        [0.3, 0.2, 0.0, 0.4],
        [0.6, 0.5, 0.4, 0.0]
    ])
    
    sample_result = {
        'route': [0, 1, 2, 3],
        'counts': {'00011010': 100, '00110100': 50},
        'energy': -2.5,
        'parameters': {'gamma': [0.1, 0.2], 'beta': [0.3, 0.4]}
    }
    
    # Visualize
    visualizer = CircuitVisualizer()
    
    # Route visualization
    route_path = visualizer.create_route_visualization(
        sample_result['route'], sample_pois, distance_matrix
    )
    print(f"Route visualization saved: {route_path}")
    
    # Measurement visualization
    meas_path = visualizer.visualize_measurement_results(sample_result['counts'])
    print(f"Measurement visualization saved: {meas_path}")

