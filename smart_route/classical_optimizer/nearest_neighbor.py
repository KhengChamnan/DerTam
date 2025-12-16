"""
Nearest Neighbor Algorithm for Tourist Route Optimization
FREE - Simple greedy heuristic (O(n²))
"""
import numpy as np
from typing import List, Dict, Tuple


class NearestNeighborSolver:
    """
    Nearest Neighbor (NN) algorithm for TSP
    100% FREE - No external APIs needed
    
    Algorithm:
    1. Start at initial POI (e.g., hotel)
    2. Repeatedly visit nearest unvisited POI
    3. Return to start (optional)
    
    Complexity: O(n²) - FAST!
    Solution Quality: ~25% worse than optimal (but fast)
    """
    
    def __init__(self):
        self.distance_matrix = None
        
    def solve(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray,
        start_poi_idx: int = 0
    ) -> Tuple[List[int], float]:
        """
        Solve TSP using Nearest Neighbor
        
        Args:
            pois: List of POI dictionaries
            distance_matrix: n×n matrix of distances (FREE Haversine calc)
            start_poi_idx: Starting POI index (default: 0)
            
        Returns:
            (route_indices, total_distance)
            route_indices: [0, 2, 1, 3] - order to visit POIs
            total_distance: Total route distance in km
        """
        n = len(pois)
        
        if n == 0:
            return [], 0.0
            
        if n == 1:
            return [0], 0.0
        
        # Initialize
        unvisited = set(range(n))
        route = [start_poi_idx]
        unvisited.remove(start_poi_idx)
        current = start_poi_idx
        total_distance = 0.0
        
        # Greedy selection: always pick nearest unvisited
        while unvisited:
            # Find nearest unvisited POI
            nearest_idx = None
            nearest_dist = float('inf')
            
            for poi_idx in unvisited:
                dist = distance_matrix[current][poi_idx]
                if dist < nearest_dist:
                    nearest_dist = dist
                    nearest_idx = poi_idx
            
            # Visit nearest POI
            route.append(nearest_idx)
            unvisited.remove(nearest_idx)
            total_distance += nearest_dist
            current = nearest_idx
        
        # Optional: return to start (for round trip)
        # total_distance += distance_matrix[current][start_poi_idx]
        # route.append(start_poi_idx)
        
        return route, total_distance
    
    def solve_with_constraints(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray,
        time_matrix: np.ndarray,
        current_time: float,
        start_poi_idx: int = 0
    ) -> Tuple[List[int], float, bool]:
        """
        Nearest Neighbor with time window constraints
        FREE - considers opening hours
        
        Args:
            pois: POI list with 'opening_time', 'closing_time' fields
            distance_matrix: Distance matrix (km)
            time_matrix: Travel time matrix (minutes)
            current_time: Current time in minutes since midnight
            start_poi_idx: Starting point
            
        Returns:
            (route, total_distance, is_feasible)
        """
        n = len(pois)
        
        if n <= 1:
            return ([0] if n == 1 else [], 0.0, True)
        
        unvisited = set(range(n))
        route = [start_poi_idx]
        unvisited.remove(start_poi_idx)
        current_idx = start_poi_idx
        current_time_value = current_time
        total_distance = 0.0
        is_feasible = True
        
        while unvisited:
            # Find nearest FEASIBLE unvisited POI
            best_idx = None
            best_dist = float('inf')
            
            for poi_idx in unvisited:
                # Check time window feasibility
                travel_time = time_matrix[current_idx][poi_idx]
                arrival_time = current_time_value + travel_time
                
                poi_opening = pois[poi_idx].get('opening_time', 0)
                poi_closing = pois[poi_idx].get('closing_time', 1440)  # 24h
                poi_visit_duration = pois[poi_idx].get('visit_duration', 60)
                
                # Can we visit this POI?
                if arrival_time <= poi_closing - poi_visit_duration:
                    dist = distance_matrix[current_idx][poi_idx]
                    if dist < best_dist:
                        best_dist = dist
                        best_idx = poi_idx
            
            if best_idx is None:
                # No feasible POI - constraint violation
                is_feasible = False
                # Pick nearest anyway (for partial solution)
                best_idx = min(unvisited, key=lambda i: distance_matrix[current_idx][i])
                best_dist = distance_matrix[current_idx][best_idx]
            
            # Visit POI
            route.append(best_idx)
            unvisited.remove(best_idx)
            total_distance += best_dist
            
            # Update time
            travel_time = time_matrix[current_idx][best_idx]
            arrival_time = current_time_value + travel_time
            wait_time = max(0, pois[best_idx].get('opening_time', 0) - arrival_time)
            visit_duration = pois[best_idx].get('visit_duration', 60)
            
            current_time_value = arrival_time + wait_time + visit_duration
            current_idx = best_idx
        
        return route, total_distance, is_feasible
    
    def solve_multi_start(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray
    ) -> Tuple[List[int], float]:
        """
        Try Nearest Neighbor from multiple starting points
        Pick best solution
        FREE - improves solution quality slightly
        
        Returns:
            Best (route, distance) found
        """
        n = len(pois)
        
        if n <= 1:
            return ([0] if n == 1 else [], 0.0)
        
        best_route = None
        best_distance = float('inf')
        
        # Try starting from each POI
        for start_idx in range(n):
            route, distance = self.solve(pois, distance_matrix, start_idx)
            
            if distance < best_distance:
                best_distance = distance
                best_route = route
        
        return best_route, best_distance


# Example usage (FREE)
if __name__ == "__main__":
    # Sample POIs
    sample_pois = [
        {'id': 1, 'name': 'Hotel', 'lat': 13.7563, 'lon': 100.5018},  # Bangkok
        {'id': 2, 'name': 'Wat Arun', 'lat': 13.7437, 'lon': 100.4887},
        {'id': 3, 'name': 'Grand Palace', 'lat': 13.7500, 'lon': 100.4917},
        {'id': 4, 'name': 'Wat Pho', 'lat': 13.7465, 'lon': 100.4927},
    ]
    
    # Distance matrix (FREE - calculate with Haversine)
    # Simplified example (actual distances in km)
    distance_matrix = np.array([
        [0.0, 2.1, 1.2, 1.5],
        [2.1, 0.0, 0.8, 0.5],
        [1.2, 0.8, 0.0, 0.3],
        [1.5, 0.5, 0.3, 0.0]
    ])
    
    # Solve with Nearest Neighbor (FREE)
    solver = NearestNeighborSolver()
    route, total_dist = solver.solve(sample_pois, distance_matrix, start_poi_idx=0)
    
    print("Nearest Neighbor Solution:")
    print(f"Route: {[sample_pois[i]['name'] for i in route]}")
    print(f"Total Distance: {total_dist:.2f} km")
    
    # Try multi-start for better solution (still FREE)
    best_route, best_dist = solver.solve_multi_start(sample_pois, distance_matrix)
    print(f"\nBest Multi-Start Solution:")
    print(f"Route: {[sample_pois[i]['name'] for i in best_route]}")
    print(f"Total Distance: {best_dist:.2f} km")
