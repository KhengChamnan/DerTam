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
        encoding_info: Optional[Dict] = None
    ) -> Tuple[List[int], Dict]:
        """
        Decode quantum measurement result to route
        
        Args:
            measurement_result: Dictionary mapping bitstring to count
                e.g., {'0000': 100, '0001': 50, ...}
            num_pois: Number of POIs
            encoding_info: Encoding information from QUBOEncoder
            
        Returns:
            (route, decode_info)
            route: List of POI indices in visit order
            decode_info: Decoding information and validation
        """
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

