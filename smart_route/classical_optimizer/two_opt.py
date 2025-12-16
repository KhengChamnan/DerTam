"""
2-opt Local Search Algorithm
FREE - Improves existing routes
"""
import numpy as np
from typing import List, Dict, Tuple


class TwoOptSolver:
    """
    2-opt local search for TSP improvement
    100% FREE - Classic optimization algorithm
    
    Algorithm:
    1. Start with an initial route (from Nearest Neighbor)
    2. Try all pairs of edges to swap
    3. Keep swap if it improves total distance
    4. Repeat until no improvement found
    
    Complexity: O(n²) per iteration, typically 10-100 iterations
    Improves solution by 10-30% on average
    """
    
    def __init__(self, max_iterations: int = 100):
        self.max_iterations = max_iterations
        
    def optimize(
        self,
        initial_route: List[int],
        distance_matrix: np.ndarray
    ) -> Tuple[List[int], float, int]:
        """
        Improve route using 2-opt swaps
        
        Args:
            initial_route: Starting route [0, 2, 1, 3]
            distance_matrix: n×n distance matrix
            
        Returns:
            (optimized_route, total_distance, num_iterations)
        """
        route = initial_route.copy()
        best_distance = self._calculate_route_distance(route, distance_matrix)
        improved = True
        iteration = 0
        
        while improved and iteration < self.max_iterations:
            improved = False
            iteration += 1
            
            # Try all possible 2-opt swaps
            for i in range(1, len(route) - 1):
                for j in range(i + 1, len(route)):
                    # Create new route by reversing segment [i:j]
                    new_route = self._two_opt_swap(route, i, j)
                    new_distance = self._calculate_route_distance(
                        new_route, distance_matrix
                    )
                    
                    # Accept improvement
                    if new_distance < best_distance:
                        route = new_route
                        best_distance = new_distance
                        improved = True
                        break  # Restart search with new route
                
                if improved:
                    break
        
        return route, best_distance, iteration
    
    def _two_opt_swap(self, route: List[int], i: int, j: int) -> List[int]:
        """
        Perform 2-opt swap by reversing route segment [i:j]
        
        Example:
            route = [0, 1, 2, 3, 4]
            i = 1, j = 3
            new_route = [0, 3, 2, 1, 4]  # Reversed [1:4]
        """
        new_route = route[:i] + route[i:j+1][::-1] + route[j+1:]
        return new_route
    
    def _calculate_route_distance(
        self, 
        route: List[int], 
        distance_matrix: np.ndarray
    ) -> float:
        """Calculate total distance of a route"""
        total = 0.0
        for i in range(len(route) - 1):
            total += distance_matrix[route[i]][route[i+1]]
        return total
    
    def optimize_with_history(
        self,
        initial_route: List[int],
        distance_matrix: np.ndarray
    ) -> Dict:
        """
        2-opt with convergence history for visualization
        FREE - useful for teacher demonstration
        
        Returns:
            {
                'route': optimized route,
                'distance': final distance,
                'iterations': number of iterations,
                'history': [(iteration, distance), ...]
            }
        """
        route = initial_route.copy()
        distance = self._calculate_route_distance(route, distance_matrix)
        history = [(0, distance)]
        
        improved = True
        iteration = 0
        
        while improved and iteration < self.max_iterations:
            improved = False
            iteration += 1
            
            for i in range(1, len(route) - 1):
                for j in range(i + 1, len(route)):
                    new_route = self._two_opt_swap(route, i, j)
                    new_distance = self._calculate_route_distance(
                        new_route, distance_matrix
                    )
                    
                    if new_distance < distance:
                        route = new_route
                        distance = new_distance
                        improved = True
                        history.append((iteration, distance))
                        break
                
                if improved:
                    break
        
        return {
            'route': route,
            'distance': distance,
            'iterations': iteration,
            'history': history
        }


# Example usage (FREE)
if __name__ == "__main__":
    from nearest_neighbor import NearestNeighborSolver
    
    # Sample distance matrix
    distance_matrix = np.array([
        [0.0, 2.1, 1.2, 1.5],
        [2.1, 0.0, 0.8, 0.5],
        [1.2, 0.8, 0.0, 0.3],
        [1.5, 0.5, 0.3, 0.0]
    ])
    
    # Step 1: Get initial route with Nearest Neighbor (FREE)
    nn_solver = NearestNeighborSolver()
    initial_route, initial_dist = nn_solver.solve(
        pois=[{'id': i} for i in range(4)],
        distance_matrix=distance_matrix,
        start_poi_idx=0
    )
    
    print(f"Initial Route (Nearest Neighbor): {initial_route}")
    print(f"Initial Distance: {initial_dist:.2f} km\n")
    
    # Step 2: Improve with 2-opt (FREE)
    two_opt_solver = TwoOptSolver(max_iterations=100)
    optimized_route, optimized_dist, num_iters = two_opt_solver.optimize(
        initial_route, distance_matrix
    )
    
    print(f"Optimized Route (2-opt): {optimized_route}")
    print(f"Optimized Distance: {optimized_dist:.2f} km")
    print(f"Iterations: {num_iters}")
    print(f"Improvement: {((initial_dist - optimized_dist) / initial_dist * 100):.1f}%")
