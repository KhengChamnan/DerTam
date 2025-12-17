"""
Circuit Visualizer for QAOA
Visualizes quantum circuits and optimization progress
"""
import numpy as np
from typing import Dict, List, Optional, Tuple
from qiskit import QuantumCircuit
from qiskit.visualization import plot_histogram
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
        filename: Optional[str] = None
    ) -> str:
        """
        Visualize quantum circuit
        
        Args:
            circuit: QuantumCircuit object
            title: Plot title
            filename: Output filename (optional)
            
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
                    # Final fallback: text representation
                    return self._create_text_circuit(circuit, filepath)
            
            return str(filepath)
        except Exception as e:
            print(f"Error visualizing circuit: {e}")
            # Fallback: create simple text representation
            return self._create_text_circuit(circuit, filepath)
    
    def visualize_measurement_results(
        self,
        counts: Dict[str, int],
        title: str = "Measurement Results",
        filename: Optional[str] = None,
        top_k: int = 10
    ) -> str:
        """
        Visualize measurement results as histogram
        
        Args:
            counts: Dictionary mapping bitstrings to counts
            title: Plot title
            filename: Output filename (optional)
            top_k: Number of top results to show
            
        Returns:
            Path to saved visualization
        """
        if filename is None:
            filename = f"measurements_{hash(str(counts))}.png"
        
        filepath = self.output_dir / filename
        
        try:
            # Sort by count and take top K
            sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:top_k]
            top_counts = dict(sorted_counts)
            
            # Plot histogram
            fig, ax = plt.subplots(figsize=(12, 6))
            plot_histogram(top_counts, ax=ax, title=title)
            plt.xticks(rotation=45, ha='right')
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

