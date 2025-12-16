"""
QUBO Encoder - Convert TSP to Quantum Problem
FREE - Core quantum formulation (for teacher explanation)
"""
import numpy as np
from typing import List, Dict, Tuple


class QUBOEncoder:
    """
    Encode Tourist Routing Problem into QUBO Matrix
    100% FREE - No quantum hardware needed
    
    QUBO = Quadratic Unconstrained Binary Optimization
    
    For Teacher Understanding:
    - Binary variables: x_{i,p} = 1 if POI i is at position p
    - 4 POIs → 16 binary variables (4 × 4 position encoding)
    - QUBO matrix Q: 16×16 where energy = x^T Q x
    
    Objective:
    Minimize: Total distance + Constraint penalties
    """
    
    def __init__(self, penalty_coefficient: float = 1000.0):
        """
        Args:
            penalty_coefficient: Weight for constraint violations (A >> B)
        """
        self.penalty = penalty_coefficient
        
    def encode_tsp(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray
    ) -> Tuple[np.ndarray, Dict]:
        """
        Encode TSP into QUBO matrix
        FREE - Position encoding method
        
        Args:
            pois: List of POIs (max 4 for quantum demo)
            distance_matrix: n×n distance matrix
            
        Returns:
            (qubo_matrix, encoding_info)
            
        QUBO Formulation:
        H = A * Σ(1 - Σx_{i,p})² + A * Σ(1 - Σx_{i,p})² + B * ΣΣ d_{ij} x_{i,p} x_{j,p+1}
        
        Where:
        - First term: Each POI visited exactly once
        - Second term: Each position filled exactly once  
        - Third term: Minimize distance between consecutive POIs
        """
        n = len(pois)
        
        if n > 4:
            print("WARNING: Quantum limited to 4 POIs (16 qubits)")
            print("Using first 4 POIs only")
            pois = pois[:4]
            distance_matrix = distance_matrix[:4, :4]
            n = 4
        
        # Number of binary variables: n × n (POI × position)
        num_vars = n * n
        
        # Initialize QUBO matrix (symmetric)
        Q = np.zeros((num_vars, num_vars))
        
        # Penalty coefficients
        A = self.penalty  # Constraint penalty
        B = 1.0  # Distance cost
        
        # Encoding: variable index = i * n + p
        # where i = POI index, p = position index
        
        # CONSTRAINT 1: Each POI visited exactly once
        # Σ_p x_{i,p} = 1 for all i
        # Expanded: (1 - Σ_p x_{i,p})² = 1 - 2*Σx + Σx² + 2*ΣΣx*x
        for i in range(n):
            for p in range(n):
                var_idx = i * n + p
                
                # Linear term: -2A * x_{i,p}
                Q[var_idx][var_idx] += -2 * A
                
                # Quadratic terms: 2A * x_{i,p} * x_{i,q} for p != q
                for q in range(p + 1, n):
                    var_idx2 = i * n + q
                    Q[var_idx][var_idx2] += 2 * A
                    Q[var_idx2][var_idx] += 2 * A  # Symmetric
        
        # CONSTRAINT 2: Each position filled exactly once
        # Σ_i x_{i,p} = 1 for all p
        for p in range(n):
            for i in range(n):
                var_idx = i * n + p
                
                # Linear term: -2A * x_{i,p}
                Q[var_idx][var_idx] += -2 * A
                
                # Quadratic terms: 2A * x_{i,p} * x_{j,p} for i != j
                for j in range(i + 1, n):
                    var_idx2 = j * n + p
                    Q[var_idx][var_idx2] += 2 * A
                    Q[var_idx2][var_idx] += 2 * A
        
        # OBJECTIVE: Minimize distance
        # Σ_i Σ_j Σ_p d_{ij} * x_{i,p} * x_{j,p+1}
        for i in range(n):
            for j in range(n):
                if i == j:
                    continue
                    
                dist = distance_matrix[i][j]
                
                for p in range(n - 1):
                    var_i = i * n + p
                    var_j = j * n + (p + 1)
                    
                    # Add distance cost
                    Q[var_i][var_j] += B * dist
                    Q[var_j][var_i] += B * dist
        
        # Encoding information for teacher explanation
        encoding_info = {
            'num_pois': n,
            'num_variables': num_vars,
            'num_qubits': num_vars,
            'encoding_type': 'position',
            'penalty_coefficient': A,
            'distance_coefficient': B,
            'variable_mapping': self._create_variable_mapping(n),
            'constraint_terms': 2 * n,  # n POI constraints + n position constraints
            'distance_terms': n * (n - 1) * (n - 1)
        }
        
        return Q, encoding_info
    
    def encode_with_preferences(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray,
        user_preferences: Dict[int, float]
    ) -> Tuple[np.ndarray, Dict]:
        """
        Encode with user preference scores
        FREE - Add preference bonuses to QUBO
        
        Args:
            pois: POI list
            distance_matrix: Distances
            user_preferences: {poi_id: preference_score} where score in [0,1]
            
        Returns:
            QUBO matrix with preference terms
        """
        # Start with basic TSP encoding
        Q, info = self.encode_tsp(pois, distance_matrix)
        
        n = len(pois) if len(pois) <= 4 else 4
        C = 10.0  # Preference bonus coefficient
        
        # Add preference bonuses (negative cost = reward)
        for i in range(n):
            poi_id = pois[i]['id']
            preference = user_preferences.get(poi_id, 0.5)
            
            # Reward visiting preferred POIs
            # Subtract from diagonal (linear term)
            for p in range(n):
                var_idx = i * n + p
                Q[var_idx][var_idx] -= C * preference
        
        info['preference_coefficient'] = C
        info['has_preferences'] = True
        
        return Q, info
    
    def encode_multi_objective(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray,
        user_preferences: Dict[int, float] = None,
        time_constraints: List[Dict] = None,
        weights: Dict[str, float] = None
    ) -> Tuple[np.ndarray, Dict]:
        """
        Encode multi-objective TSP with configurable weights
        Demonstrates QAOA advantage for complex optimization
        
        Args:
            pois: List of POIs (max 4-6)
            distance_matrix: n×n distance matrix
            user_preferences: {poi_id: preference_score} in [0,1]
            time_constraints: List of time window constraints (optional)
            weights: Objective weights {
                'constraint': 1000.0,  # Hard constraint penalty
                'distance': 1.0,       # Distance minimization
                'preference': 50.0,    # Preference maximization
                'time_penalty': 100.0  # Time window violations
            }
            
        Returns:
            (qubo_matrix, encoding_info)
            
        QUBO Formulation:
        H = A*(constraint violations) + B*(distance) - C*(preferences) + D*(time violations)
        
        This encoding allows QAOA to optimize multiple objectives simultaneously,
        demonstrating quantum advantage over greedy classical algorithms.
        """
        # Default weights if not provided
        if weights is None:
            weights = {
                'constraint': 1000.0,  # A >> others (hard constraints)
                'distance': 1.0,       # B (distance cost)
                'preference': 50.0,    # C (preference reward)
                'time_penalty': 100.0  # D (time constraint penalty)
            }
        
        n = len(pois)
        
        if n > 6:
            print("WARNING: Multi-objective quantum limited to 6 POIs (36 qubits)")
            print("Using first 6 POIs only")
            pois = pois[:6]
            distance_matrix = distance_matrix[:6, :6]
            n = 6
        
        # Start with base TSP encoding (constraints + distance)
        Q, info = self.encode_tsp(pois, distance_matrix)
        
        A = weights['constraint']
        B = weights['distance']
        C = weights['preference']
        D = weights['time_penalty']
        
        # Rescale base QUBO to use custom weights
        # Base QUBO uses self.penalty for A and 1.0 for B
        scale_factor = A / self.penalty
        Q = Q * scale_factor
        
        # Rescale distance terms
        distance_scale = B / 1.0
        for i in range(n):
            for j in range(n):
                if i == j:
                    continue
                dist = distance_matrix[i][j]
                for p in range(n - 1):
                    var_i = i * n + p
                    var_j = j * n + (p + 1)
                    # Adjust existing distance terms
                    Q[var_i][var_j] = Q[var_i][var_j] / scale_factor * distance_scale
                    Q[var_j][var_i] = Q[var_j][var_i] / scale_factor * distance_scale
        
        # Add preference bonuses (negative = reward)
        if user_preferences:
            for i in range(n):
                poi_id = pois[i].get('id', i)
                preference = user_preferences.get(poi_id, 0.5)
                
                # Reward visiting preferred POIs at any position
                for p in range(n):
                    var_idx = i * n + p
                    Q[var_idx][var_idx] -= C * preference
        
        # Add time window penalties (if provided)
        time_violations = 0
        if time_constraints:
            for constraint in time_constraints:
                poi_idx = constraint.get('poi_index')
                if poi_idx is None or poi_idx >= n:
                    continue
                
                opening = constraint.get('opening_time', 0)
                closing = constraint.get('closing_time', 1440)
                
                # Penalize visiting this POI at incompatible positions
                # (Simplified: penalize late positions if early closing)
                if closing < 720:  # Closes before noon
                    for p in range(n // 2, n):  # Penalize late positions
                        var_idx = poi_idx * n + p
                        Q[var_idx][var_idx] += D
                        time_violations += 1
        
        # Update encoding info
        info.update({
            'weights': weights,
            'has_preferences': user_preferences is not None,
            'has_time_constraints': time_constraints is not None,
            'time_violations_encoded': time_violations,
            'optimization_type': 'multi_objective',
            'objectives': {
                'constraint_satisfaction': f'Weight: {A}',
                'distance_minimization': f'Weight: {B}',
                'preference_maximization': f'Weight: {C}',
                'time_feasibility': f'Weight: {D}'
            }
        })
        
        return Q, info
    
    def _create_variable_mapping(self, n: int) -> Dict[int, Dict]:
        """
        Create mapping for teacher explanation
        Shows which qubit represents which POI-position combination
        
        Example for n=4:
        {
            0: {'poi': 0, 'position': 0, 'meaning': 'POI_0 at position 0'},
            1: {'poi': 0, 'position': 1, 'meaning': 'POI_0 at position 1'},
            ...
            15: {'poi': 3, 'position': 3, 'meaning': 'POI_3 at position 3'}
        }
        """
        mapping = {}
        for i in range(n):
            for p in range(n):
                var_idx = i * n + p
                mapping[var_idx] = {
                    'poi_index': i,
                    'position': p,
                    'meaning': f'POI_{i} at position {p}',
                    'qubit': var_idx
                }
        return mapping
    
    def decode_solution(
        self,
        binary_solution: List[int],
        n_pois: int
    ) -> Tuple[List[int], bool]:
        """
        Decode binary solution back to route
        FREE - Convert quantum measurement to route
        
        Args:
            binary_solution: [0,1,0,...,1] length n²
            n_pois: Number of POIs
            
        Returns:
            (route, is_valid)
            route: [poi_0, poi_2, poi_1, poi_3]
            is_valid: Whether solution satisfies constraints
        """
        n = n_pois
        
        # Extract position assignments
        route = [-1] * n
        is_valid = True
        
        for i in range(n):
            for p in range(n):
                var_idx = i * n + p
                if binary_solution[var_idx] == 1:
                    if route[p] == -1:
                        route[p] = i
                    else:
                        # Constraint violation: position p assigned twice
                        is_valid = False
        
        # Check if all positions filled
        if -1 in route:
            is_valid = False
        
        return route, is_valid
    
    def explain_qubo(self, Q: np.ndarray, n_pois: int) -> str:
        """
        Generate explanation text for teacher
        FREE - Educational tool
        """
        n = n_pois
        explanation = f"""
=== QUBO Matrix Explanation ===

Problem Size:
- Number of POIs: {n}
- Number of binary variables: {n * n}
- QUBO matrix size: {n * n} × {n * n}

Variable Encoding (Position Encoding):
- x_{{i,p}} = 1 if POI i is visited at position p
- Example: x_{{0,0}} = 1 means POI 0 is visited first
-         x_{{2,3}} = 1 means POI 2 is visited last (position 3)

Constraints Encoded:
1. Each POI visited exactly once: Σ_p x_{{i,p}} = 1 for all i
2. Each position filled exactly once: Σ_i x_{{i,p}} = 1 for all p

Objective:
- Minimize total distance: Σ_{{i,j,p}} d_{{ij}} · x_{{i,p}} · x_{{j,p+1}}

QUBO Matrix Structure:
- Diagonal elements: Linear costs (constraints + preferences)
- Off-diagonal elements: Pairwise interactions (distance costs)
- Symmetric matrix (Q_{{ij}} = Q_{{ji}})

Energy Function:
E(x) = x^T Q x = Σ_i Q_{{ii}} x_i + Σ_{{i<j}} Q_{{ij}} x_i x_j

Goal: Find binary vector x that minimizes E(x)
"""
        return explanation


# Example usage for teacher demonstration (FREE)
if __name__ == "__main__":
    # Sample 4 POIs (teacher requirement)
    sample_pois = [
        {'id': 1, 'name': 'Temple A'},
        {'id': 2, 'name': 'Museum B'},
        {'id': 3, 'name': 'Beach C'},
        {'id': 4, 'name': 'Restaurant D'}
    ]
    
    # Distance matrix (km)
    distance_matrix = np.array([
        [0.0, 2.5, 4.0, 3.0],
        [2.5, 0.0, 3.5, 2.0],
        [4.0, 3.5, 0.0, 5.0],
        [3.0, 2.0, 5.0, 0.0]
    ])
    
    # Create QUBO encoder (FREE)
    encoder = QUBOEncoder(penalty_coefficient=1000.0)
    
    # Encode problem
    qubo_matrix, info = encoder.encode_tsp(sample_pois, distance_matrix)
    
    print("QUBO Encoding Complete!")
    print(f"Number of qubits needed: {info['num_qubits']}")
    print(f"Number of variables: {info['num_variables']}")
    print(f"Encoding type: {info['encoding_type']}")
    print(f"\nQUBO Matrix shape: {qubo_matrix.shape}")
    print(f"\nVariable Mapping (first 4):")
    for i in range(4):
        print(f"  Qubit {i}: {info['variable_mapping'][i]['meaning']}")
    
    # Show explanation for teacher
    print(encoder.explain_qubo(qubo_matrix, 4))
    
    # Test decode
    sample_solution = [1,0,0,0, 0,0,1,0, 0,0,0,1, 0,1,0,0]
    route, valid = encoder.decode_solution(sample_solution, 4)
    print(f"\nSample Solution: {sample_solution}")
    print(f"Decoded Route: {route}")
    print(f"Valid: {valid}")
    print(f"Route interpretation: {[sample_pois[i]['name'] for i in route]}")
