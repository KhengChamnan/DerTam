"""
QUBO Encoder for Route Optimization
Encodes TSP problem with constraints into QUBO format
"""
import numpy as np
from typing import List, Dict, Tuple, Optional


class QUBOEncoder:
    """
    Encode route optimization problem to QUBO format
    Supports constraints: opening hours, distance limits, traffic penalties
    """
    
    def __init__(self, penalty_coefficient: float = 1000.0):
        """
        Initialize QUBO encoder
        
        Args:
            penalty_coefficient: Penalty weight for constraint violations
        """
        self.penalty_coefficient = penalty_coefficient
        self.encoding_info = {}
    
    def encode_tsp(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray,
        time_matrix: Optional[np.ndarray] = None,
        start_time_minutes: int = 480,
        max_distance: Optional[float] = None,
        traffic_penalty_matrix: Optional[np.ndarray] = None,
        constraint_weights: Optional[Dict] = None
    ) -> Tuple[np.ndarray, Dict]:
        """
        Encode TSP problem to QUBO format
        
        Args:
            pois: List of POI dictionaries
            distance_matrix: Distance matrix (n x n)
            time_matrix: Time matrix (n x n), optional
            start_time_minutes: Start time in minutes since midnight
            max_distance: Maximum distance constraint, optional
            traffic_penalty_matrix: Traffic penalty matrix, optional
            constraint_weights: Weights for different objectives
            
        Returns:
            (QUBO_matrix, encoding_info)
        """
        n = len(pois)
        
        if n < 2:
            raise ValueError("Need at least 2 POIs for TSP")
        
        if constraint_weights is None:
            constraint_weights = {
                'distance': 0.4,
                'time': 0.3,
                'traffic': 0.1,
                'constraints': 0.2
            }
        else:
            # Ensure 'constraints' key exists with default value if not provided
            if 'constraints' not in constraint_weights:
                constraint_weights['constraints'] = 0.2
        
        # Number of qubits: n * n (n POIs, n positions)
        num_qubits = n * n
        qubo_matrix = np.zeros((num_qubits, num_qubits))
        
        # Encoding: x[i][t] = 1 if POI i is visited at position t
        # QUBO index: i * n + t
        
        # 1. Objective: Minimize total distance
        self._add_distance_objective(qubo_matrix, distance_matrix, n, constraint_weights['distance'])
        
        # 2. Objective: Minimize total time (if provided)
        if time_matrix is not None:
            self._add_time_objective(qubo_matrix, time_matrix, n, constraint_weights['time'])
        
        # 3. Objective: Minimize traffic penalties (if provided)
        if traffic_penalty_matrix is not None:
            self._add_traffic_penalty(qubo_matrix, traffic_penalty_matrix, n, constraint_weights['traffic'])
        
        # 4. Constraints: Each POI visited exactly once
        self._add_poi_constraint(qubo_matrix, n, self.penalty_coefficient)
        
        # 5. Constraints: Each position has exactly one POI
        self._add_position_constraint(qubo_matrix, n, self.penalty_coefficient)
        
        # 6. Constraints: Opening hours violations (penalty)
        if time_matrix is not None:
            self._add_opening_hours_penalty(
                qubo_matrix, pois, time_matrix, n, start_time_minutes, 
                self.penalty_coefficient * constraint_weights['constraints']
            )
        
        # 7. Constraints: Distance limit violations (penalty)
        if max_distance is not None:
            self._add_distance_limit_penalty(
                qubo_matrix, distance_matrix, n, max_distance,
                self.penalty_coefficient * constraint_weights['constraints']
            )
        
        # Store encoding information
        self.encoding_info = {
            'num_pois': n,
            'num_qubits': num_qubits,
            'encoding': 'x[i*n + t] = 1 if POI i at position t',
            'penalty_coefficient': self.penalty_coefficient,
            'constraint_weights': constraint_weights
        }
        
        return qubo_matrix, self.encoding_info
    
    def _add_distance_objective(
        self, 
        qubo_matrix: np.ndarray, 
        distance_matrix: np.ndarray, 
        n: int,
        weight: float
    ):
        """Add distance minimization objective to QUBO"""
        for i in range(n):
            for j in range(n):
                if i != j:
                    # For each consecutive position pair (t, t+1)
                    for t in range(n - 1):
                        # x[i][t] * x[j][t+1] contributes distance[i][j]
                        idx_i_t = i * n + t
                        idx_j_t1 = j * n + (t + 1)
                        qubo_matrix[idx_i_t][idx_j_t1] += weight * distance_matrix[i][j]
                        qubo_matrix[idx_j_t1][idx_i_t] += weight * distance_matrix[i][j]
    
    def _add_time_objective(
        self,
        qubo_matrix: np.ndarray,
        time_matrix: np.ndarray,
        n: int,
        weight: float
    ):
        """Add time minimization objective to QUBO"""
        for i in range(n):
            for j in range(n):
                if i != j:
                    for t in range(n - 1):
                        idx_i_t = i * n + t
                        idx_j_t1 = j * n + (t + 1)
                        qubo_matrix[idx_i_t][idx_j_t1] += weight * time_matrix[i][j]
                        qubo_matrix[idx_j_t1][idx_i_t] += weight * time_matrix[i][j]
    
    def _add_traffic_penalty(
        self,
        qubo_matrix: np.ndarray,
        traffic_penalty_matrix: np.ndarray,
        n: int,
        weight: float
    ):
        """Add traffic penalty objective to QUBO"""
        for i in range(n):
            for j in range(n):
                if i != j:
                    for t in range(n - 1):
                        idx_i_t = i * n + t
                        idx_j_t1 = j * n + (t + 1)
                        penalty = traffic_penalty_matrix[i][j]
                        qubo_matrix[idx_i_t][idx_j_t1] += weight * penalty
                        qubo_matrix[idx_j_t1][idx_i_t] += weight * penalty
    
    def _add_poi_constraint(self, qubo_matrix: np.ndarray, n: int, penalty: float):
        """
        Constraint: Each POI visited exactly once
        Sum over positions: (sum_t x[i][t] - 1)^2
        """
        for i in range(n):
            # Linear terms: -2 * sum_t x[i][t]
            for t in range(n):
                idx = i * n + t
                qubo_matrix[idx][idx] -= 2 * penalty
            
            # Quadratic terms: sum_{t1,t2} x[i][t1] * x[i][t2]
            for t1 in range(n):
                for t2 in range(n):
                    idx1 = i * n + t1
                    idx2 = i * n + t2
                    qubo_matrix[idx1][idx2] += penalty
            
            # Constant term: +1 (handled in offset, not in QUBO matrix)
    
    def _add_position_constraint(self, qubo_matrix: np.ndarray, n: int, penalty: float):
        """
        Constraint: Each position has exactly one POI
        Sum over POIs: (sum_i x[i][t] - 1)^2
        """
        for t in range(n):
            # Linear terms: -2 * sum_i x[i][t]
            for i in range(n):
                idx = i * n + t
                qubo_matrix[idx][idx] -= 2 * penalty
            
            # Quadratic terms: sum_{i1,i2} x[i1][t] * x[i2][t]
            for i1 in range(n):
                for i2 in range(n):
                    idx1 = i1 * n + t
                    idx2 = i2 * n + t
                    qubo_matrix[idx1][idx2] += penalty
    
    def _add_opening_hours_penalty(
        self,
        qubo_matrix: np.ndarray,
        pois: List[Dict],
        time_matrix: np.ndarray,
        n: int,
        start_time_minutes: int,
        penalty_weight: float
    ):
        """
        Add penalty for opening hours violations
        Penalizes routes that arrive too early or too late
        """
        for i in range(n):
            poi = pois[i]
            opening_time = poi.get('opening_time', 0)
            closing_time = poi.get('closing_time', 1440)
            visit_duration = poi.get('visit_duration', 60)
            
            for t in range(n):
                idx = i * n + t
                
                # Estimate arrival time at position t
                # Simplified: assume average travel time
                avg_travel_time = np.mean(time_matrix[time_matrix > 0])
                estimated_arrival = start_time_minutes + t * avg_travel_time
                
                # Penalty if arrives before opening
                if estimated_arrival < opening_time:
                    wait_penalty = (opening_time - estimated_arrival) * penalty_weight * 0.1
                    qubo_matrix[idx][idx] += wait_penalty
                
                # Penalty if cannot complete visit before closing
                if estimated_arrival + visit_duration > closing_time:
                    violation_penalty = (estimated_arrival + visit_duration - closing_time) * penalty_weight
                    qubo_matrix[idx][idx] += violation_penalty
    
    def _add_distance_limit_penalty(
        self,
        qubo_matrix: np.ndarray,
        distance_matrix: np.ndarray,
        n: int,
        max_distance: float,
        penalty_weight: float
    ):
        """
        Add penalty for exceeding maximum distance constraint
        """
        # Calculate cumulative distance for each possible route segment
        for i in range(n):
            for j in range(n):
                if i != j and distance_matrix[i][j] > max_distance:
                    # Penalize transitions that exceed max distance
                    for t in range(n - 1):
                        idx_i_t = i * n + t
                        idx_j_t1 = j * n + (t + 1)
                        excess = distance_matrix[i][j] - max_distance
                        penalty = excess * penalty_weight
                        qubo_matrix[idx_i_t][idx_j_t1] += penalty
                        qubo_matrix[idx_j_t1][idx_i_t] += penalty
    
    def get_qubit_to_poi_mapping(self, n: int) -> Dict[int, Tuple[int, int]]:
        """
        Get mapping from qubit index to (POI_index, position)
        
        Args:
            n: Number of POIs
            
        Returns:
            Dictionary mapping qubit_index -> (poi_index, position)
        """
        mapping = {}
        for i in range(n):
            for t in range(n):
                qubit_idx = i * n + t
                mapping[qubit_idx] = (i, t)
        return mapping


# Example usage
if __name__ == "__main__":
    # Sample data
    sample_pois = [
        {"id": "poi_01", "name": "Royal Palace", "opening_time": 480, "closing_time": 1020, "visit_duration": 90},
        {"id": "poi_02", "name": "Silver Pagoda", "opening_time": 480, "closing_time": 1020, "visit_duration": 60},
        {"id": "poi_03", "name": "National Museum", "opening_time": 480, "closing_time": 1020, "visit_duration": 90},
        {"id": "poi_04", "name": "Independence Monument", "opening_time": 0, "closing_time": 1440, "visit_duration": 30}
    ]
    
    # Sample distance matrix
    distance_matrix = np.array([
        [0.0, 0.2, 0.3, 0.6],
        [0.2, 0.0, 0.2, 0.5],
        [0.3, 0.2, 0.0, 0.4],
        [0.6, 0.5, 0.4, 0.0]
    ])
    
    # Encode to QUBO
    encoder = QUBOEncoder(penalty_coefficient=1000.0)
    qubo_matrix, encoding_info = encoder.encode_tsp(
        sample_pois,
        distance_matrix,
        start_time_minutes=480,
        max_distance=1.0
    )
    
    print(f"QUBO Matrix Shape: {qubo_matrix.shape}")
    print(f"Encoding Info: {encoding_info}")
    print(f"\nQUBO Matrix (first 4x4):")
    print(qubo_matrix[:4, :4])

