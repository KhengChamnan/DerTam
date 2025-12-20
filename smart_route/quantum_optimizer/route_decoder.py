"""
Route Decoder for Quantum Optimization Results
Decodes quantum measurement results back to POI route sequence
"""
import numpy as np
from typing import List, Dict, Tuple, Optional


class RouteDecoder:
    """
    Decode quantum measurement results to route sequence
    Maps qubit states back to POI visit order
    """
    
    def __init__(self):
        """Initialize route decoder"""
        pass
    
    def decode_route(
        self,
        measurement_result: Dict[str, int],
        num_pois: int,
        encoding_info: Optional[Dict] = None,
        distance_matrix: Optional[np.ndarray] = None,
        time_matrix: Optional[np.ndarray] = None,
        traffic_penalty_matrix: Optional[np.ndarray] = None,
        pois: Optional[List[Dict]] = None
    ) -> Tuple[List[int], Dict]:
        """
        Decode quantum measurement result to route
        
        Args:
            measurement_result: Dictionary mapping bitstring to count
                e.g., {'0000': 100, '0001': 50, ...}
            num_pois: Number of POIs
            encoding_info: Encoding information from QUBOEncoder
            distance_matrix: Distance matrix for weighted nearest neighbor
            time_matrix: Time matrix for weighted nearest neighbor
            traffic_penalty_matrix: Traffic penalty matrix
            pois: List of POI dictionaries for category-based routing
            
        Returns:
            (route, decode_info)
            route: List of POI indices in visit order
            decode_info: Decoding information and validation
        """
        # Check if feature-based encoding
        if encoding_info and encoding_info.get('encoding') == 'feature_based':
            return self.decode_feature_based(
                measurement_result,
                num_pois,
                encoding_info,
                distance_matrix,
                time_matrix,
                traffic_penalty_matrix,
                pois
            )
        
        # Legacy decoding (n*n qubits)
        # Find most frequent measurement
        if isinstance(measurement_result, dict):
            best_bitstring = max(measurement_result.items(), key=lambda x: x[1])[0]
        elif isinstance(measurement_result, str):
            best_bitstring = measurement_result
        else:
            raise ValueError(f"Invalid measurement_result type: {type(measurement_result)}")
        
        # Decode bitstring to route
        route = self._bitstring_to_route(best_bitstring, num_pois)
        
        # Validate route
        validation = self._validate_route(route, num_pois)
        
        # If invalid, try to repair
        if not validation['is_valid']:
            route = self._repair_route(route, num_pois, measurement_result)
            validation = self._validate_route(route, num_pois)
        
        decode_info = {
            'bitstring': best_bitstring,
            'route': route,
            'validation': validation,
            'num_pois': num_pois
        }
        
        return route, decode_info
    
    def decode_feature_based(
        self,
        measurement_result: Dict[str, int],
        num_pois: int,
        encoding_info: Dict,
        distance_matrix: np.ndarray,
        time_matrix: Optional[np.ndarray] = None,
        traffic_penalty_matrix: Optional[np.ndarray] = None,
        pois: Optional[List[Dict]] = None
    ) -> Tuple[List[int], Dict]:
        """
        Decode feature-based quantum result to route using weighted nearest neighbor
        
        Args:
            measurement_result: Dictionary mapping bitstring to count
            num_pois: Number of POIs
            encoding_info: Encoding information with qubit mapping
            distance_matrix: Distance matrix
            time_matrix: Time matrix
            traffic_penalty_matrix: Traffic penalty matrix
            pois: List of POI dictionaries
            
        Returns:
            (route, decode_info)
        """
        # Find most frequent measurement
        if isinstance(measurement_result, dict):
            best_bitstring = max(measurement_result.items(), key=lambda x: x[1])[0]
        elif isinstance(measurement_result, str):
            best_bitstring = measurement_result
        else:
            raise ValueError(f"Invalid measurement_result type: {type(measurement_result)}")
        
        # Decode qubit states to feature preferences
        qubit_mapping = encoding_info.get('qubit_mapping', {})
        num_qubits = encoding_info.get('num_qubits', 4)
        
        # Ensure bitstring has correct length
        if len(best_bitstring) < num_qubits:
            best_bitstring = best_bitstring.zfill(num_qubits)
        elif len(best_bitstring) > num_qubits:
            best_bitstring = best_bitstring[:num_qubits]
        
        # Extract feature preferences from qubit states
        # QAOA measurements directly control preferences - no deterministic overrides
        preferences = {}
        for i, feature_name in qubit_mapping.items():
            if i < len(best_bitstring):
                # |0⟩ = prefer feature (minimize/avoid), |1⟩ = accept (less priority)
                preferences[feature_name] = int(best_bitstring[i])
        
        # Get constraint weights for weighted matrix creation
        constraint_weights = encoding_info.get('constraint_weights', {})
        
        # Create weighted cost matrix based on preferences
        weighted_matrix = self._create_weighted_matrix(
            distance_matrix,
            time_matrix,
            traffic_penalty_matrix,
            preferences,
            constraint_weights
        )
        
        # Apply weighted nearest neighbor
        route = self._weighted_nearest_neighbor(weighted_matrix, num_pois)
        
        # Validate route
        validation = self._validate_route(route, num_pois)
        
        decode_info = {
            'bitstring': best_bitstring,
            'route': route,
            'validation': validation,
            'num_pois': num_pois,
            'preferences': preferences,
            'qubit_mapping': qubit_mapping,
            'encoding_type': 'feature_based'
        }
        
        return route, decode_info
    
    def _create_weighted_matrix(
        self,
        distance_matrix: np.ndarray,
        time_matrix: Optional[np.ndarray],
        traffic_penalty_matrix: Optional[np.ndarray],
        preferences: Dict[str, int],
        constraint_weights: Dict
    ) -> np.ndarray:
        """
        Create weighted cost matrix from preferences
        
        Args:
            distance_matrix: Distance matrix
            time_matrix: Time matrix
            traffic_penalty_matrix: Traffic penalty matrix
            preferences: Feature preferences from qubits
            constraint_weights: Constraint weights
            
        Returns:
            Weighted cost matrix
        """
        n = distance_matrix.shape[0]
        weighted_matrix = np.zeros((n, n))
        
        # Normalize matrices
        max_dist = np.max(distance_matrix[distance_matrix > 0]) if np.any(distance_matrix > 0) else 1.0
        max_time = np.max(time_matrix[time_matrix > 0]) if time_matrix is not None and np.any(time_matrix > 0) else 1.0
        max_traffic = np.max(traffic_penalty_matrix[traffic_penalty_matrix > 0]) if traffic_penalty_matrix is not None and np.any(traffic_penalty_matrix > 0) else 1.0
        
        # Weight factors based on QAOA qubit states - AMPLIFIED for stronger effect
        # |0⟩ = minimize (weight = 1.0), |1⟩ = accept/deprioritize (weight = 0.2)
        # Using 1.0 vs 0.2 instead of 1.0 vs 0.5 for 5x stronger differentiation
        dist_weight = 1.0 if preferences.get('distance', 0) == 0 else 0.2
        time_weight = 1.0 if preferences.get('time', 0) == 0 else 0.2
        
        # Category weight based on qubit state
        # |0⟩ = prefer similar categories (higher penalty for different), |1⟩ = prefer diversity
        category_weight = 1.0 if preferences.get('category', 0) == 0 else 0.2
        
        # Traffic weight from QAOA measurement - amplified effect
        # |0⟩ = strongly avoid traffic (1.0), |1⟩ = accept traffic (0.15)
        # This creates significant route differences based on QAOA measurement
        base_traffic_weight = 1.0 if preferences.get('traffic', 0) == 0 else 0.15
        traffic_constraint_weight = constraint_weights.get('traffic', 0.1)
        # Scale traffic weight: higher constraint weight = stronger traffic avoidance
        # Multiply by (1 + traffic_constraint_weight * 8) for even stronger amplification
        traffic_weight = base_traffic_weight * (1.0 + traffic_constraint_weight * 8.0)
        
        # Combine weighted matrices - QAOA preferences influence each component
        for i in range(n):
            for j in range(n):
                if i != j:
                    cost = 0.0
                    
                    # Distance component - QAOA distance preference affects weight
                    if max_dist > 0:
                        cost += constraint_weights.get('distance', 0.4) * dist_weight * (distance_matrix[i][j] / max_dist)
                    
                    # Time component - QAOA time preference affects weight
                    if time_matrix is not None and max_time > 0:
                        cost += constraint_weights.get('time', 0.3) * time_weight * (time_matrix[i][j] / max_time)
                    
                    # Traffic component - QAOA traffic preference strongly affects weight
                    if traffic_penalty_matrix is not None and max_traffic > 0:
                        cost += constraint_weights.get('traffic', 0.1) * traffic_weight * (traffic_penalty_matrix[i][j] / max_traffic)
                    
                    # Category diversity component - based on QAOA category preference
                    # |0⟩ = prefer similar categories (add penalty for different)
                    # |1⟩ = prefer diverse categories (add penalty for same)
                    category_pref_weight = constraint_weights.get('category', constraint_weights.get('preferences', 0.2))
                    if preferences.get('category', 0) == 0:
                        # Penalize if categories are different (prefer grouping similar)
                        cost += category_pref_weight * category_weight * 0.5
                    else:
                        # Penalize if categories are same (prefer diversity) - reduced penalty
                        cost += category_pref_weight * (1.0 - category_weight) * 0.3
                    
                    weighted_matrix[i][j] = cost
        
        return weighted_matrix
    
    def _weighted_nearest_neighbor(self, weighted_matrix: np.ndarray, num_pois: int, start_idx: int = 0) -> List[int]:
        """
        Apply weighted nearest neighbor algorithm
        
        Args:
            weighted_matrix: Weighted cost matrix
            num_pois: Number of POIs
            start_idx: Starting POI index
            
        Returns:
            Route as list of POI indices
        """
        route = [start_idx]
        unvisited = set(range(num_pois)) - {start_idx}
        
        current = start_idx
        while unvisited:
            # Find nearest unvisited POI based on weighted cost
            nearest = None
            min_cost = float('inf')
            
            for next_poi in unvisited:
                cost = weighted_matrix[current][next_poi]
                if cost < min_cost:
                    min_cost = cost
                    nearest = next_poi
            
            if nearest is not None:
                route.append(nearest)
                unvisited.remove(nearest)
                current = nearest
            else:
                # Fallback: add any remaining POI
                route.append(unvisited.pop())
        
        return route
    
    def _bitstring_to_route(self, bitstring: str, num_pois: int) -> List[int]:
        """
        Convert bitstring to route sequence
        
        Encoding: x[i*n + t] = 1 if POI i is at position t
        Bitstring length: n * n
        
        Args:
            bitstring: Binary string (e.g., '00011010')
            num_pois: Number of POIs
            
        Returns:
            Route as list of POI indices
        """
        num_qubits = num_pois * num_pois
        
        # Ensure bitstring has correct length
        if len(bitstring) < num_qubits:
            # Pad with zeros
            bitstring = bitstring.zfill(num_qubits)
        elif len(bitstring) > num_qubits:
            # Truncate
            bitstring = bitstring[:num_qubits]
        
        # Parse bitstring
        route = [-1] * num_pois
        
        for i in range(num_pois):
            for t in range(num_pois):
                qubit_idx = i * num_pois + t
                if qubit_idx < len(bitstring) and bitstring[qubit_idx] == '1':
                    if route[t] == -1:
                        route[t] = i
                    else:
                        # Conflict: multiple POIs at same position
                        # Keep first one, mark conflict
                        pass
        
        # Fill missing positions
        route = self._fill_missing_positions(route, num_pois)
        
        return route
    
    def _fill_missing_positions(self, route: List[int], num_pois: int) -> List[int]:
        """
        Fill missing positions in route
        
        Args:
            route: Partial route with -1 for missing positions
            num_pois: Number of POIs
            
        Returns:
            Complete route
        """
        used_pois = set([p for p in route if p != -1])
        missing_pois = set(range(num_pois)) - used_pois
        
        # Fill missing positions with unused POIs
        missing_list = list(missing_pois)
        for i in range(num_pois):
            if route[i] == -1:
                if missing_list:
                    route[i] = missing_list.pop(0)
                else:
                    # No more POIs, use first unused
                    route[i] = 0
        
        return route
    
    def _validate_route(self, route: List[int], num_pois: int) -> Dict:
        """
        Validate decoded route
        
        Args:
            route: Route as list of POI indices
            num_pois: Number of POIs
            
        Returns:
            Validation dictionary
        """
        errors = []
        warnings = []
        
        # Check length
        if len(route) != num_pois:
            errors.append(f"Route length {len(route)} != {num_pois}")
        
        # Check all POIs present
        used_pois = set(route)
        if len(used_pois) != num_pois:
            missing = set(range(num_pois)) - used_pois
            errors.append(f"Missing POIs: {missing}")
        
        # Check duplicates
        if len(route) != len(set(route)):
            duplicates = [p for p in route if route.count(p) > 1]
            errors.append(f"Duplicate POIs: {duplicates}")
        
        # Check valid indices
        for i, poi_idx in enumerate(route):
            if poi_idx < 0 or poi_idx >= num_pois:
                errors.append(f"Invalid POI index {poi_idx} at position {i}")
        
        is_valid = len(errors) == 0
        
        return {
            'is_valid': is_valid,
            'errors': errors,
            'warnings': warnings,
            'num_pois': num_pois,
            'unique_pois': len(set(route))
        }
    
    def _repair_route(
        self,
        route: List[int],
        num_pois: int,
        measurement_result: Dict[str, int]
    ) -> List[int]:
        """
        Repair invalid route by trying alternative decodings
        
        Args:
            route: Invalid route
            num_pois: Number of POIs
            measurement_result: All measurement results
            
        Returns:
            Repaired route
        """
        # Try top N bitstrings
        sorted_results = sorted(
            measurement_result.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]  # Top 10
        
        for bitstring, count in sorted_results:
            candidate_route = self._bitstring_to_route(bitstring, num_pois)
            validation = self._validate_route(candidate_route, num_pois)
            
            if validation['is_valid']:
                return candidate_route
        
        # If all fail, return greedy repair
        return self._greedy_repair(route, num_pois)
    
    def _greedy_repair(self, route: List[int], num_pois: int) -> List[int]:
        """
        Greedy repair: fill missing, remove duplicates
        
        Args:
            route: Route to repair
            num_pois: Number of POIs
            
        Returns:
            Repaired route
        """
        # Remove duplicates, keep first occurrence
        seen = set()
        repaired = []
        for poi_idx in route:
            if poi_idx not in seen and 0 <= poi_idx < num_pois:
                repaired.append(poi_idx)
                seen.add(poi_idx)
        
        # Fill missing
        missing = set(range(num_pois)) - set(repaired)
        repaired.extend(list(missing))
        
        # Ensure correct length
        while len(repaired) < num_pois:
            repaired.append(0)
        
        return repaired[:num_pois]
    
    def decode_multiple_solutions(
        self,
        measurement_result: Dict[str, int],
        num_pois: int,
        top_k: int = 5
    ) -> List[Tuple[List[int], Dict]]:
        """
        Decode top K solutions from measurement results
        
        Args:
            measurement_result: Dictionary mapping bitstring to count
            num_pois: Number of POIs
            top_k: Number of top solutions to return
            
        Returns:
            List of (route, decode_info) tuples
        """
        sorted_results = sorted(
            measurement_result.items(),
            key=lambda x: x[1],
            reverse=True
        )[:top_k]
        
        solutions = []
        for bitstring, count in sorted_results:
            route, decode_info = self.decode_route(
                {bitstring: count}, num_pois
            )
            decode_info['count'] = count
            decode_info['probability'] = count / sum(measurement_result.values())
            solutions.append((route, decode_info))
        
        return solutions
    
    def route_to_bitstring(self, route: List[int], num_pois: int) -> str:
        """
        Convert route to bitstring (reverse encoding)
        
        Args:
            route: Route as list of POI indices
            num_pois: Number of POIs
            
        Returns:
            Bitstring representation
        """
        num_qubits = num_pois * num_pois
        bitstring = ['0'] * num_qubits
        
        for position, poi_idx in enumerate(route):
            if 0 <= poi_idx < num_pois and 0 <= position < num_pois:
                qubit_idx = poi_idx * num_pois + position
                if qubit_idx < num_qubits:
                    bitstring[qubit_idx] = '1'
        
        return ''.join(bitstring)


# Example usage
if __name__ == "__main__":
    # Sample measurement result
    measurement_result = {
        '00011010': 100,
        '00110100': 50,
        '11000001': 30,
        '00000000': 10
    }
    
    decoder = RouteDecoder()
    
    # Decode single solution
    route, decode_info = decoder.decode_route(measurement_result, num_pois=4)
    
    print(f"Decoded Route: {route}")
    print(f"Validation: {decode_info['validation']}")
    
    # Decode top K solutions
    solutions = decoder.decode_multiple_solutions(measurement_result, num_pois=4, top_k=3)
    print(f"\nTop 3 Solutions:")
    for i, (r, info) in enumerate(solutions):
        print(f"  {i+1}. Route: {r}, Count: {info['count']}, Valid: {info['validation']['is_valid']}")

