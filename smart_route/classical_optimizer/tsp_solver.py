"""
Classical TSP Solvers
Implements Nearest Neighbor, 2-Opt, and Simulated Annealing algorithms
100% FREE - No paid services
"""
import numpy as np
import time
import random
from typing import List, Dict, Tuple, Optional
import math


class TSPNearestNeighborSolver:
    """
    Nearest Neighbor TSP Solver
    Greedy algorithm that always visits the nearest unvisited POI
    """
    
    def __init__(self):
        """Initialize Nearest Neighbor solver"""
        self.name = "Nearest Neighbor"
    
    def solve(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray,
        time_matrix: Optional[np.ndarray] = None,
        start_time_minutes: int = 480,
        start_poi_idx: int = 0
    ) -> Dict:
        """
        Solve TSP using Nearest Neighbor heuristic
        
        Args:
            pois: List of POI dictionaries
            distance_matrix: Distance matrix (n x n)
            time_matrix: Optional time matrix (n x n)
            start_time_minutes: Start time in minutes since midnight
            start_poi_idx: Starting POI index (default: 0)
            
        Returns:
            Solution dictionary with route and metrics
        """
        start_time = time.time()
        n = len(pois)
        
        if n <= 1:
            return {
                'route': list(range(n)),
                'total_distance': 0.0,
                'total_time': 0.0,
                'execution_time': time.time() - start_time,
                'algorithm': self.name,
                'is_valid': True
            }
        
        # Initialize route
        route = [start_poi_idx]
        unvisited = set(range(n)) - {start_poi_idx}
        
        # Greedy selection
        current = start_poi_idx
        while unvisited:
            # Find nearest unvisited POI
            nearest = None
            min_distance = float('inf')
            
            for next_poi in unvisited:
                dist = distance_matrix[current][next_poi]
                if dist < min_distance:
                    min_distance = dist
                    nearest = next_poi
            
            if nearest is not None:
                route.append(nearest)
                unvisited.remove(nearest)
                current = nearest
            else:
                # Fallback: add any remaining POI
                route.append(unvisited.pop())
        
        # Calculate metrics
        total_distance = self._calculate_total_distance(route, distance_matrix)
        total_time = 0.0
        if time_matrix is not None:
            total_time = self._calculate_total_time(route, time_matrix, pois)
        
        execution_time = time.time() - start_time
        
        return {
            'route': route,
            'total_distance': total_distance,
            'total_time': total_time,
            'execution_time': execution_time,
            'algorithm': self.name,
            'is_valid': True
        }
    
    def _calculate_total_distance(self, route: List[int], distance_matrix: np.ndarray) -> float:
        """Calculate total distance for route"""
        total = 0.0
        for i in range(len(route) - 1):
            total += distance_matrix[route[i]][route[i + 1]]
        return total
    
    def _calculate_total_time(
        self,
        route: List[int],
        time_matrix: np.ndarray,
        pois: List[Dict]
    ) -> float:
        """Calculate total time including travel and visit duration"""
        total = 0.0
        for i in range(len(route) - 1):
            total += time_matrix[route[i]][route[i + 1]]
            # Add visit duration for destination POI
            if i + 1 < len(route):
                total += pois[route[i + 1]].get('visit_duration', 60)
        return total


class TSPTwoOptSolver:
    """
    2-Opt TSP Solver
    Local search improvement algorithm that swaps edges to reduce distance
    """
    
    def __init__(self, max_iterations: int = 100, max_no_improvement: int = 20):
        """
        Initialize 2-Opt solver
        
        Args:
            max_iterations: Maximum iterations
            max_no_improvement: Stop after N iterations without improvement
        """
        self.name = "2-Opt"
        self.max_iterations = max_iterations
        self.max_no_improvement = max_no_improvement
    
    def solve(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray,
        time_matrix: Optional[np.ndarray] = None,
        start_time_minutes: int = 480,
        initial_route: Optional[List[int]] = None
    ) -> Dict:
        """
        Solve TSP using 2-Opt improvement
        
        Args:
            pois: List of POI dictionaries
            distance_matrix: Distance matrix (n x n)
            time_matrix: Optional time matrix (n x n)
            start_time_minutes: Start time in minutes since midnight
            initial_route: Initial route to improve (if None, uses nearest neighbor)
            
        Returns:
            Solution dictionary with route and metrics
        """
        start_time = time.time()
        n = len(pois)
        
        if n <= 1:
            return {
                'route': list(range(n)),
                'total_distance': 0.0,
                'total_time': 0.0,
                'execution_time': time.time() - start_time,
                'algorithm': self.name,
                'is_valid': True,
                'iterations': 0
            }
        
        # Get initial route
        if initial_route is None:
            nn_solver = TSPNearestNeighborSolver()
            initial_result = nn_solver.solve(pois, distance_matrix, time_matrix, start_time_minutes)
            route = initial_result['route']
        else:
            route = initial_route.copy()
        
        # Optimize using 2-opt
        route, iterations, improvements = self._two_opt_optimize(route, distance_matrix)
        
        # Calculate metrics
        total_distance = self._calculate_total_distance(route, distance_matrix)
        total_time = 0.0
        if time_matrix is not None:
            total_time = self._calculate_total_time(route, time_matrix, pois)
        
        execution_time = time.time() - start_time
        
        return {
            'route': route,
            'total_distance': total_distance,
            'total_time': total_time,
            'execution_time': execution_time,
            'algorithm': self.name,
            'is_valid': True,
            'iterations': iterations,
            'improvements': improvements
        }
    
    def _two_opt_optimize(
        self,
        route: List[int],
        distance_matrix: np.ndarray
    ) -> Tuple[List[int], int, int]:
        """
        Apply 2-opt optimization
        
        Returns:
            (optimized_route, iterations, improvements)
        """
        n = len(route)
        best_route = route.copy()
        best_distance = self._calculate_total_distance(best_route, distance_matrix)
        iterations = 0
        improvements = 0
        no_improvement_count = 0
        
        improved = True
        while improved and iterations < self.max_iterations:
            improved = False
            iterations += 1
            
            for i in range(1, n - 2):
                for j in range(i + 1, n):
                    if j - i == 1:
                        continue  # Skip adjacent edges
                    
                    # Try 2-opt swap
                    new_route = self._two_opt_swap(best_route, i, j)
                    new_distance = self._calculate_total_distance(new_route, distance_matrix)
                    
                    if new_distance < best_distance:
                        best_route = new_route
                        best_distance = new_distance
                        improved = True
                        improvements += 1
                        no_improvement_count = 0
                        break
                
                if improved:
                    break
            
            if not improved:
                no_improvement_count += 1
                if no_improvement_count >= self.max_no_improvement:
                    break
        
        return best_route, iterations, improvements
    
    def _two_opt_swap(self, route: List[int], i: int, j: int) -> List[int]:
        """
        Perform 2-opt swap: reverse segment between i and j
        
        Args:
            route: Current route
            i: Start index
            j: End index
            
        Returns:
            New route with segment reversed
        """
        new_route = route[:i] + route[i:j+1][::-1] + route[j+1:]
        return new_route
    
    def _calculate_total_distance(self, route: List[int], distance_matrix: np.ndarray) -> float:
        """Calculate total distance for route"""
        total = 0.0
        for i in range(len(route) - 1):
            total += distance_matrix[route[i]][route[i + 1]]
        return total
    
    def _calculate_total_time(
        self,
        route: List[int],
        time_matrix: np.ndarray,
        pois: List[Dict]
    ) -> float:
        """Calculate total time including travel and visit duration"""
        total = 0.0
        for i in range(len(route) - 1):
            total += time_matrix[route[i]][route[i + 1]]
            if i + 1 < len(route):
                total += pois[route[i + 1]].get('visit_duration', 60)
        return total


class TSPSimulatedAnnealingSolver:
    """
    Simulated Annealing TSP Solver
    Probabilistic optimization with temperature schedule
    """
    
    def __init__(
        self,
        initial_temperature: float = 1000.0,
        cooling_rate: float = 0.995,
        min_temperature: float = 0.1,
        max_iterations: int = 1000
    ):
        """
        Initialize Simulated Annealing solver
        
        Args:
            initial_temperature: Starting temperature
            cooling_rate: Temperature reduction factor per iteration
            min_temperature: Minimum temperature (stopping criterion)
            max_iterations: Maximum iterations
        """
        self.name = "Simulated Annealing"
        self.initial_temperature = initial_temperature
        self.cooling_rate = cooling_rate
        self.min_temperature = min_temperature
        self.max_iterations = max_iterations
    
    def solve(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray,
        time_matrix: Optional[np.ndarray] = None,
        start_time_minutes: int = 480,
        initial_route: Optional[List[int]] = None
    ) -> Dict:
        """
        Solve TSP using Simulated Annealing
        
        Args:
            pois: List of POI dictionaries
            distance_matrix: Distance matrix (n x n)
            time_matrix: Optional time matrix (n x n)
            start_time_minutes: Start time in minutes since midnight
            initial_route: Initial route (if None, uses nearest neighbor)
            
        Returns:
            Solution dictionary with route and metrics
        """
        start_time = time.time()
        n = len(pois)
        
        if n <= 1:
            return {
                'route': list(range(n)),
                'total_distance': 0.0,
                'total_time': 0.0,
                'execution_time': time.time() - start_time,
                'algorithm': self.name,
                'is_valid': True,
                'iterations': 0,
                'temperature': 0.0
            }
        
        # Get initial route
        if initial_route is None:
            nn_solver = TSPNearestNeighborSolver()
            initial_result = nn_solver.solve(pois, distance_matrix, time_matrix, start_time_minutes)
            current_route = initial_result['route']
        else:
            current_route = initial_route.copy()
        
        current_distance = self._calculate_total_distance(current_route, distance_matrix)
        best_route = current_route.copy()
        best_distance = current_distance
        
        # Simulated Annealing
        temperature = self.initial_temperature
        iterations = 0
        accepted = 0
        
        while temperature > self.min_temperature and iterations < self.max_iterations:
            iterations += 1
            
            # Generate neighbor solution (2-opt swap)
            neighbor_route = self._generate_neighbor(current_route)
            neighbor_distance = self._calculate_total_distance(neighbor_route, distance_matrix)
            
            # Calculate acceptance probability
            delta = neighbor_distance - current_distance
            if delta < 0:
                # Better solution, always accept
                current_route = neighbor_route
                current_distance = neighbor_distance
                accepted += 1
                
                if current_distance < best_distance:
                    best_route = current_route.copy()
                    best_distance = current_distance
            else:
                # Worse solution, accept with probability
                probability = math.exp(-delta / temperature)
                if random.random() < probability:
                    current_route = neighbor_route
                    current_distance = neighbor_distance
                    accepted += 1
            
            # Cool down
            temperature *= self.cooling_rate
        
        # Calculate metrics
        total_distance = best_distance
        total_time = 0.0
        if time_matrix is not None:
            total_time = self._calculate_total_time(best_route, time_matrix, pois)
        
        execution_time = time.time() - start_time
        
        return {
            'route': best_route,
            'total_distance': total_distance,
            'total_time': total_time,
            'execution_time': execution_time,
            'algorithm': self.name,
            'is_valid': True,
            'iterations': iterations,
            'accepted_moves': accepted,
            'final_temperature': temperature
        }
    
    def _generate_neighbor(self, route: List[int]) -> List[int]:
        """
        Generate neighbor solution using 2-opt swap
        
        Args:
            route: Current route
            
        Returns:
            Neighbor route
        """
        n = len(route)
        if n <= 2:
            return route.copy()
        
        # Random 2-opt swap
        i = random.randint(1, n - 2)
        j = random.randint(i + 1, n - 1)
        
        new_route = route[:i] + route[i:j+1][::-1] + route[j+1:]
        return new_route
    
    def _calculate_total_distance(self, route: List[int], distance_matrix: np.ndarray) -> float:
        """Calculate total distance for route"""
        total = 0.0
        for i in range(len(route) - 1):
            total += distance_matrix[route[i]][route[i + 1]]
        return total
    
    def _calculate_total_time(
        self,
        route: List[int],
        time_matrix: np.ndarray,
        pois: List[Dict]
    ) -> float:
        """Calculate total time including travel and visit duration"""
        total = 0.0
        for i in range(len(route) - 1):
            total += time_matrix[route[i]][route[i + 1]]
            if i + 1 < len(route):
                total += pois[route[i + 1]].get('visit_duration', 60)
        return total


class ClassicalOptimizer:
    """
    Wrapper class for classical TSP solvers
    Provides unified interface for all classical algorithms
    """
    
    def __init__(self):
        """Initialize classical optimizer"""
        self.solvers = {
            'nearest_neighbor': TSPNearestNeighborSolver(),
            'two_opt': TSPTwoOptSolver(),
            'simulated_annealing': TSPSimulatedAnnealingSolver()
        }
    
    def solve(
        self,
        prepared_data: Dict,
        algorithm: str = 'nearest_neighbor'
    ) -> Dict:
        """
        Solve TSP using specified classical algorithm
        
        Args:
            prepared_data: Prepared data from FeatureEngineer.prepare_pois_for_optimization()
                Must contain: 'pois', 'distance_matrix', 'time_matrix'
            algorithm: Algorithm name ('nearest_neighbor', 'two_opt', 'simulated_annealing')
            
        Returns:
            Solution dictionary compatible with quantum solver format
        """
        if algorithm not in self.solvers:
            raise ValueError(f"Unknown algorithm: {algorithm}. Available: {list(self.solvers.keys())}")
        
        solver = self.solvers[algorithm]
        pois = prepared_data['pois']
        distance_matrix = prepared_data['distance_matrix']
        time_matrix = prepared_data.get('time_matrix')
        
        # Extract start time from user preferences if available
        user_prefs = prepared_data.get('user_preferences', {})
        start_time_str = user_prefs.get('start_time', '08:00:00')
        start_time_minutes = self._time_string_to_minutes(start_time_str)
        
        # Solve
        result = solver.solve(
            pois=pois,
            distance_matrix=distance_matrix,
            time_matrix=time_matrix,
            start_time_minutes=start_time_minutes
        )
        
        # Add validation using FeatureEngineer
        from classical_optimizer.feature_engineer import FeatureEngineer
        engineer = FeatureEngineer()
        feasibility = engineer.check_feasibility(
            result['route'],
            pois,
            distance_matrix,
            time_matrix,
            start_time_minutes
        )
        
        result['is_valid'] = feasibility['is_feasible']
        result['feasibility'] = feasibility
        
        return result
    
    def _time_string_to_minutes(self, time_str: str) -> int:
        """Convert time string (HH:MM:SS) to minutes since midnight"""
        try:
            parts = time_str.split(':')
            hours = int(parts[0])
            minutes = int(parts[1]) if len(parts) > 1 else 0
            return hours * 60 + minutes
        except (ValueError, IndexError):
            return 480  # Default to 8 AM


# Example usage
if __name__ == "__main__":
    # Sample data
    sample_pois = [
        {"id": "poi_01", "name": "Royal Palace", "lat": 11.5625, "lng": 104.9310,
         "opening_time": 480, "closing_time": 1020, "visit_duration": 90},
        {"id": "poi_02", "name": "Silver Pagoda", "lat": 11.5627, "lng": 104.9312,
         "opening_time": 480, "closing_time": 1020, "visit_duration": 60},
        {"id": "poi_03", "name": "National Museum", "lat": 11.5640, "lng": 104.9282,
         "opening_time": 480, "closing_time": 1020, "visit_duration": 90},
        {"id": "poi_04", "name": "Independence Monument", "lat": 11.5650, "lng": 104.9300,
         "opening_time": 0, "closing_time": 1440, "visit_duration": 30}
    ]
    
    # Sample distance matrix
    distance_matrix = np.array([
        [0.0, 0.2, 0.3, 0.6],
        [0.2, 0.0, 0.2, 0.5],
        [0.3, 0.2, 0.0, 0.4],
        [0.6, 0.5, 0.4, 0.0]
    ])
    
    # Test Nearest Neighbor
    print("Testing Nearest Neighbor:")
    nn_solver = TSPNearestNeighborSolver()
    result = nn_solver.solve(sample_pois, distance_matrix)
    print(f"  Route: {result['route']}")
    print(f"  Distance: {result['total_distance']:.2f} km")
    print(f"  Time: {result['execution_time']:.4f} s")
    
    # Test 2-Opt
    print("\nTesting 2-Opt:")
    two_opt_solver = TSPTwoOptSolver(max_iterations=50)
    result = two_opt_solver.solve(sample_pois, distance_matrix)
    print(f"  Route: {result['route']}")
    print(f"  Distance: {result['total_distance']:.2f} km")
    print(f"  Iterations: {result['iterations']}")
    
    # Test Simulated Annealing
    print("\nTesting Simulated Annealing:")
    sa_solver = TSPSimulatedAnnealingSolver(max_iterations=200)
    result = sa_solver.solve(sample_pois, distance_matrix)
    print(f"  Route: {result['route']}")
    print(f"  Distance: {result['total_distance']:.2f} km")
    print(f"  Iterations: {result['iterations']}")

