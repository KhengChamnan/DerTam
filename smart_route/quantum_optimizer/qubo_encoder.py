"""
QUBO Encoder for Route Optimization
Encodes route optimization problem using feature-based QUBO format (2-4 qubits)
"""
import numpy as np
from typing import List, Dict, Tuple, Optional


class QUBOEncoder:
    """
    Encode route optimization problem to QUBO format using feature-based encoding
    Uses 2-4 qubits to encode route preferences based on feature matrix from FeatureEngineer
    """
    
    def __init__(self, penalty_coefficient: float = 1000.0):
        """
        Initialize QUBO encoder
        
        Args:
            penalty_coefficient: Penalty weight for constraint violations
        """
        self.penalty_coefficient = penalty_coefficient
        self.encoding_info = {}
    
    def encode_feature_based(
        self,
        feature_matrix: np.ndarray,
        distance_matrix: np.ndarray,
        time_matrix: Optional[np.ndarray] = None,
        traffic_penalty_matrix: Optional[np.ndarray] = None,
        constraint_weights: Optional[Dict] = None,
        num_qubits: int = 4,
        feature_info: Optional[Dict] = None
    ) -> Tuple[np.ndarray, Dict]:
        """
        Encode route optimization using feature-based QUBO (2-4 qubits)
        
        Qubit Mapping (for 4 qubits):
        - Qubit 0: Distance preference (0=short routes, 1=long routes)
        - Qubit 1: Time preference (0=fast routes, 1=slow routes)
        - Qubit 2: Category diversity (0=same category, 1=mixed categories)
        - Qubit 3: Traffic avoidance (0=avoid traffic, 1=accept traffic)
        
        Args:
            feature_matrix: Feature matrix (n_pois x n_features) from classical preprocessing
            distance_matrix: Distance matrix (n x n)
            time_matrix: Time matrix (n x n), optional
            traffic_penalty_matrix: Traffic penalty matrix, optional
            constraint_weights: Weights for different objectives
            num_qubits: Number of qubits (2, 3, or 4)
            feature_info: Dictionary with feature names and metadata from FeatureEngineer
            
        Returns:
            (QUBO_matrix, encoding_info)
        """
        if num_qubits < 2 or num_qubits > 4:
            raise ValueError("Number of qubits must be between 2 and 4")
        
        n_pois = feature_matrix.shape[0]
        n_features = feature_matrix.shape[1]
        
        if constraint_weights is None:
            constraint_weights = {
                'distance': 0.4,
                'time': 0.3,
                'traffic': 0.1,
                'category': 0.2
            }
        
        # QUBO matrix: num_qubits x num_qubits
        qubo_matrix = np.zeros((num_qubits, num_qubits))
        
        # Extract features from feature matrix based on structure from FeatureEngineer
        # Structure: [category_one_hot..., distance_from_start, opening_compatibility, avg_traffic]
        if feature_info is not None and 'feature_names' in feature_info:
            feature_names = feature_info['feature_names']
            n_categories = len(feature_info.get('categories', []))
            
            # Find indices of specific features
            try:
                distance_from_start_idx = feature_names.index('distance_from_start')
                opening_compatibility_idx = feature_names.index('opening_compatibility')
                avg_traffic_idx = feature_names.index('avg_traffic')
            except ValueError:
                # Fallback: assume standard structure
                n_categories = n_features - 3
                distance_from_start_idx = n_categories
                opening_compatibility_idx = n_categories + 1
                avg_traffic_idx = n_categories + 2
        else:
            # Fallback: infer structure (assume last 3 columns are the standard features)
            n_categories = n_features - 3
            distance_from_start_idx = n_categories
            opening_compatibility_idx = n_categories + 1
            avg_traffic_idx = n_categories + 2
        
        # Extract feature values from feature matrix
        # 1. Distance from start (normalized 0-1)
        distances_from_start = feature_matrix[:, distance_from_start_idx]
        avg_distance_from_start = np.mean(distances_from_start)
        max_distance_from_start = np.max(distances_from_start) if np.max(distances_from_start) > 0 else 1.0
        
        # 2. Opening hours compatibility (0-1 score)
        opening_compatibilities = feature_matrix[:, opening_compatibility_idx]
        avg_opening_compatibility = np.mean(opening_compatibilities)
        
        # 3. Average traffic factor (normalized 0-1)
        avg_traffic_features = feature_matrix[:, avg_traffic_idx]
        avg_traffic_value = np.mean(avg_traffic_features)
        max_traffic_value = np.max(avg_traffic_features) if np.max(avg_traffic_features) > 0 else 1.0
        
        # 4. Category features (one-hot encoded in first n_categories columns)
        category_features = feature_matrix[:, :n_categories] if n_categories > 0 else np.zeros((n_pois, 1))
        # Calculate category diversity: variance across POIs (how different are categories)
        # For each POI, sum of category features = 1 (one-hot), so diversity = std across POIs
        category_diversity = np.std(np.sum(category_features, axis=0)) if n_categories > 0 else 0.5
        # Normalize to 0-1 range
        category_diversity = min(category_diversity / max(n_categories, 1), 1.0) if n_categories > 0 else 0.5
        
        # Use distance matrix for route distance (between POIs)
        avg_route_distance = np.mean(distance_matrix[distance_matrix > 0]) if np.any(distance_matrix > 0) else 1.0
        max_route_distance = np.max(distance_matrix) if np.max(distance_matrix) > 0 else 1.0
        
        # Use time matrix for route time (between POIs)
        if time_matrix is not None:
            avg_route_time = np.mean(time_matrix[time_matrix > 0]) if np.any(time_matrix > 0) else 1.0
            max_route_time = np.max(time_matrix) if np.max(time_matrix) > 0 else 1.0
        else:
            # Estimate from distance if time matrix not available
            avg_route_time = avg_route_distance * 2.0  # Rough estimate: 2 min per km
            max_route_time = max_route_distance * 2.0
        
        # Qubit 0: Distance preference
        # |0⟩ = prefer short distances, |1⟩ = accept longer distances
        # Combine distance from start and route distances
        if num_qubits >= 1:
            distance_factor = 0.5 * (avg_distance_from_start / max_distance_from_start) + \
                            0.5 * (avg_route_distance / max_route_distance)
            # Diagonal: preference for short distances (negative = prefer |0⟩)
            qubo_matrix[0, 0] = -constraint_weights.get('distance', 0.4) * distance_factor
        
        # Qubit 1: Time preference
        # |0⟩ = minimize time, |1⟩ = accept longer times
        # Consider route time only
        if num_qubits >= 2:
            time_factor = avg_route_time / max_route_time if max_route_time > 0 else 1.0
            qubo_matrix[1, 1] = -constraint_weights.get('time', 0.3) * time_factor
            
            # Interaction: distance and time are correlated
            qubo_matrix[0, 1] = constraint_weights.get('distance', 0.4) * 0.1
            qubo_matrix[1, 0] = qubo_matrix[0, 1]
        
        # Qubit 2: Category diversity
        # |0⟩ = prefer similar categories, |1⟩ = prefer diverse categories
        if num_qubits >= 3:
            qubo_matrix[2, 2] = constraint_weights.get('category', 0.2) * category_diversity
            
            # Interaction with distance: diverse categories might require longer routes
            qubo_matrix[0, 2] = -constraint_weights.get('category', 0.2) * 0.05
            qubo_matrix[2, 0] = qubo_matrix[0, 2]
            
            # Interaction with opening compatibility: diverse categories might have scheduling issues
            qubo_matrix[1, 2] = -constraint_weights.get('category', 0.2) * (1.0 - avg_opening_compatibility) * 0.1
            qubo_matrix[2, 1] = qubo_matrix[1, 2]
        
        # Qubit 3: Traffic avoidance
        # |0⟩ = avoid high-traffic routes, |1⟩ = accept high-traffic routes
        if num_qubits >= 4:
            traffic_factor = avg_traffic_value / max_traffic_value if max_traffic_value > 0 else 1.0
            qubo_matrix[3, 3] = -constraint_weights.get('traffic', 0.1) * traffic_factor
            
            # Interaction: traffic affects time
            qubo_matrix[1, 3] = constraint_weights.get('traffic', 0.1) * 0.15
            qubo_matrix[3, 1] = qubo_matrix[1, 3]
            
            # Interaction: traffic affects distance preference
            qubo_matrix[0, 3] = constraint_weights.get('traffic', 0.1) * 0.1
            qubo_matrix[3, 0] = qubo_matrix[0, 3]
        
        # Store encoding information
        qubit_features = ['distance', 'time', 'category', 'traffic'][:num_qubits]
        self.encoding_info = {
            'num_pois': n_pois,
            'num_qubits': num_qubits,
            'encoding': 'feature_based',
            'qubit_features': qubit_features,
            'qubit_mapping': {
                i: feature for i, feature in enumerate(qubit_features)
            },
            'constraint_weights': constraint_weights,
            'feature_matrix_shape': feature_matrix.shape,
            'extracted_features': {
                'avg_distance_from_start': float(avg_distance_from_start),
                'avg_opening_compatibility': float(avg_opening_compatibility),
                'avg_traffic_value': float(avg_traffic_value),
                'category_diversity': float(category_diversity)
            }
        }
        
        return qubo_matrix, self.encoding_info


# Example usage
if __name__ == "__main__":
    # Sample feature matrix (4 POIs, 5 features: 2 categories + 3 standard features)
    # Features: [Historical, Temple, distance_from_start, opening_compatibility, avg_traffic]
    sample_feature_matrix = np.array([
        [1.0, 0.0, 0.2, 1.0, 0.3],  # POI 1: Historical, close, compatible, low traffic
        [0.0, 1.0, 0.3, 1.0, 0.2],  # POI 2: Temple, medium, compatible, low traffic
        [1.0, 0.0, 0.4, 1.0, 0.4],  # POI 3: Historical, far, compatible, medium traffic
        [0.0, 0.0, 0.5, 0.8, 0.5]   # POI 4: Other, far, less compatible, high traffic
    ])
    
    # Sample distance matrix
    distance_matrix = np.array([
        [0.0, 0.2, 0.3, 0.6],
        [0.2, 0.0, 0.2, 0.5],
        [0.3, 0.2, 0.0, 0.4],
        [0.6, 0.5, 0.4, 0.0]
    ])
    
    # Sample time matrix
    time_matrix = np.array([
        [0.0, 5.0, 8.0, 15.0],
        [5.0, 0.0, 5.0, 12.0],
        [8.0, 5.0, 0.0, 10.0],
        [15.0, 12.0, 10.0, 0.0]
    ])
    
    # Sample feature info
    feature_info = {
        'feature_names': ['Historical', 'Temple', 'distance_from_start', 
                         'opening_compatibility', 'avg_traffic'],
        'categories': ['Historical', 'Temple'],
        'n_features': 5,
        'n_pois': 4
    }
    
    # Encode to QUBO using feature-based encoding
    encoder = QUBOEncoder(penalty_coefficient=1000.0)
    qubo_matrix, encoding_info = encoder.encode_feature_based(
        sample_feature_matrix,
        distance_matrix,
        time_matrix=time_matrix,
        num_qubits=4,
        feature_info=feature_info
    )
    
    print(f"QUBO Matrix Shape: {qubo_matrix.shape}")
    print(f"Encoding Info: {encoding_info}")
    print(f"\nQUBO Matrix:")
    print(qubo_matrix)

