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
        """Calculate total time including travel time only"""
        total = 0.0
        for i in range(len(route) - 1):
            total += time_matrix[route[i]][route[i + 1]]
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
        """Calculate total time including travel time only"""
        total = 0.0
        for i in range(len(route) - 1):
            total += time_matrix[route[i]][route[i + 1]]
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
        """Calculate total time including travel time only"""
        total = 0.0
        for i in range(len(route) - 1):
            total += time_matrix[route[i]][route[i + 1]]
        return total


class TSPWeightedNearestNeighborSolver:
    """
    Weighted Nearest Neighbor TSP Solver
    Uses constraint_weights directly (without QAOA) to create weighted cost matrix
    Scenario A: Direct weight application for comparison with QAOA
    """
    
    def __init__(self):
        """Initialize Weighted Nearest Neighbor solver"""
        self.name = "Weighted Nearest Neighbor (Direct Weights)"
    
    def solve(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray,
        time_matrix: Optional[np.ndarray] = None,
        start_time_minutes: int = 480,
        start_poi_idx: int = 0,
        constraint_weights: Optional[Dict] = None,
        traffic_penalty_matrix: Optional[np.ndarray] = None,
        preferred_category: Optional[str] = None
    ) -> Dict:
        """
        Solve TSP using Weighted Nearest Neighbor with constraint_weights directly
        
        Args:
            pois: List of POI dictionaries
            distance_matrix: Distance matrix (n x n)
            time_matrix: Optional time matrix (n x n)
            start_time_minutes: Start time in minutes since midnight
            start_poi_idx: Starting POI index (default: 0)
            constraint_weights: Constraint weights dict (distance, time, preferences, traffic)
            traffic_penalty_matrix: Traffic penalty matrix (n x n)
            preferred_category: Preferred POI category (for category matching)
            
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
        
        # Default constraint weights if not provided
        if constraint_weights is None:
            constraint_weights = {
                'distance': 0.4,
                'time': 0.3,
                'preferences': 0.2,
                'traffic': 0.1
            }
        
        # Create weighted cost matrix using constraint_weights directly
        weighted_matrix = self._create_weighted_matrix(
            distance_matrix,
            time_matrix,
            traffic_penalty_matrix,
            constraint_weights,
            pois,
            preferred_category
        )
        
        # Apply weighted nearest neighbor
        route = self._weighted_nearest_neighbor(weighted_matrix, n, start_poi_idx)
        
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
    
    def _create_weighted_matrix(
        self,
        distance_matrix: np.ndarray,
        time_matrix: Optional[np.ndarray],
        traffic_penalty_matrix: Optional[np.ndarray],
        constraint_weights: Dict,
        pois: List[Dict],
        preferred_category: Optional[str]
    ) -> np.ndarray:
        """
        Create weighted cost matrix using constraint_weights directly (no QAOA preferences)
        
        Args:
            distance_matrix: Distance matrix
            time_matrix: Time matrix
            traffic_penalty_matrix: Traffic penalty matrix
            constraint_weights: Constraint weights
            pois: List of POI dictionaries
            preferred_category: Preferred category for matching
            
        Returns:
            Weighted cost matrix
        """
        n = distance_matrix.shape[0]
        weighted_matrix = np.zeros((n, n))
        
        # Normalize matrices
        max_dist = np.max(distance_matrix[distance_matrix > 0]) if np.any(distance_matrix > 0) else 1.0
        max_time = np.max(time_matrix[time_matrix > 0]) if time_matrix is not None and np.any(time_matrix > 0) else 1.0
        max_traffic = np.max(traffic_penalty_matrix[traffic_penalty_matrix > 0]) if traffic_penalty_matrix is not None and np.any(traffic_penalty_matrix > 0) else 1.0
        
        # Create category match matrix if preferred_category is set
        category_match_matrix = None
        if preferred_category:
            category_match_matrix = np.zeros((n, n))
            for i in range(n):
                for j in range(n):
                    if i != j:
                        # Check if destination POI matches preferred category
                        poi_category = pois[j].get('category', 'Unknown')
                        category_match_matrix[i][j] = 1.0 if poi_category == preferred_category else 0.0
        
        # Combine weighted matrices using constraint_weights directly
        # No qubit preferences - use full weights for all factors
        for i in range(n):
            for j in range(n):
                if i != j:
                    cost = 0.0
                    
                    # Distance component (always minimize with full weight)
                    if max_dist > 0:
                        cost += constraint_weights.get('distance', 0.4) * 1.0 * (distance_matrix[i][j] / max_dist)
                    
                    # Time component (always minimize with full weight)
                    if time_matrix is not None and max_time > 0:
                        cost += constraint_weights.get('time', 0.3) * 1.0 * (time_matrix[i][j] / max_time)
                    
                    # Category preference component
                    if category_match_matrix is not None:
                        # Invert: 1.0 = match (lower cost), 0.0 = no match (higher cost)
                        category_penalty = 1.0 - category_match_matrix[i][j]
                        cost += constraint_weights.get('preferences', 0.2) * category_penalty
                    
                    # Traffic component (always minimize with full weight)
                    # Scale traffic weight to amplify effect based on constraint_weights['traffic']
                    # Higher traffic sensitivity = stronger traffic avoidance
                    traffic_constraint_weight = constraint_weights.get('traffic', 0.1)
                    # Amplify effect more: multiply by (1 + traffic_constraint_weight * 5)
                    # This ensures traffic sensitivity has a strong impact on route selection
                    traffic_weight = 1.0 * (1.0 + traffic_constraint_weight * 5.0)
                    if traffic_penalty_matrix is not None and max_traffic > 0:
                        cost += traffic_constraint_weight * traffic_weight * (traffic_penalty_matrix[i][j] / max_traffic)
                    
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
        """Calculate total time including travel time only"""
        total = 0.0
        for i in range(len(route) - 1):
            total += time_matrix[route[i]][route[i + 1]]
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
            'simulated_annealing': TSPSimulatedAnnealingSolver(),
            'weighted_nearest_neighbor': TSPWeightedNearestNeighborSolver()
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
            algorithm: Algorithm name ('nearest_neighbor', 'two_opt', 'simulated_annealing', 'weighted_nearest_neighbor')
            
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
        
        # Prepare solver arguments
        solve_kwargs = {
            'pois': pois,
            'distance_matrix': distance_matrix,
            'time_matrix': time_matrix,
            'start_time_minutes': start_time_minutes
        }
        
        # For weighted_nearest_neighbor, add constraint_weights and other parameters
        if algorithm == 'weighted_nearest_neighbor':
            constraint_weights = user_prefs.get('constraint_weights', {
                'distance': 0.4,
                'time': 0.3,
                'preferences': 0.2,
                'traffic': 0.1
            })
            preferred_category = user_prefs.get('preferred_category')
            
            # Get traffic penalty matrix if available
            from utils.distance_calculator import DistanceCalculator
            from app_helpers import get_traffic_data_path
            distance_calc = DistanceCalculator(traffic_data_path=get_traffic_data_path())
            traffic_penalty_matrix = distance_calc.get_traffic_penalty_matrix(pois, distance_matrix)
            
            solve_kwargs.update({
                'constraint_weights': constraint_weights,
                'traffic_penalty_matrix': traffic_penalty_matrix,
                'preferred_category': preferred_category
            })
        
        # Solve
        result = solver.solve(**solve_kwargs)
        
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
         "opening_time": 480, "closing_time": 1020},
        {"id": "poi_02", "name": "Silver Pagoda", "lat": 11.5627, "lng": 104.9312,
         "opening_time": 480, "closing_time": 1020},
        {"id": "poi_03", "name": "National Museum", "lat": 11.5640, "lng": 104.9282,
         "opening_time": 480, "closing_time": 1020},
        {"id": "poi_04", "name": "Independence Monument", "lat": 11.5650, "lng": 104.9300,
         "opening_time": 0, "closing_time": 1440}
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

