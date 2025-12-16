"""
Metrics Calculator - Compare Classical vs Quantum Performance
100% FREE - For teacher evaluation
"""
import time
import numpy as np
from typing import List, Dict, Tuple


class MetricsCalculator:
    """
    Calculate comparison metrics between classical and quantum
    100% FREE - No paid services
    
    For Teacher Comparison:
    - Solution quality (distance, time)
    - Computational performance (speed, iterations)
    - Constraint satisfaction
    - Scalability analysis
    """
    
    def __init__(self):
        self.results_history = []
        
    def evaluate_solution_quality(
        self,
        route: List[int],
        pois: List[Dict],
        distance_matrix: np.ndarray,
        time_matrix: np.ndarray = None
    ) -> Dict:
        """
        Evaluate solution quality metrics
        FREE - Standard optimization metrics
        
        Returns:
            {
                'total_distance': float (km),
                'total_time': float (minutes),
                'num_pois': int,
                'avg_distance_per_poi': float
            }
        """
        n = len(route)
        
        if n <= 1:
            return {
                'total_distance': 0.0,
                'total_time': 0.0,
                'num_pois': n,
                'avg_distance_per_poi': 0.0
            }
        
        # Calculate total distance
        total_dist = 0.0
        for i in range(len(route) - 1):
            poi_a = route[i]
            poi_b = route[i + 1]
            total_dist += distance_matrix[poi_a][poi_b]
        
        # Calculate total time if available
        total_time = 0.0
        if time_matrix is not None:
            for i in range(len(route) - 1):
                poi_a = route[i]
                poi_b = route[i + 1]
                total_time += time_matrix[poi_a][poi_b]
                
                # Add visit duration
                if i + 1 < len(pois):
                    total_time += pois[route[i + 1]].get('visit_duration', 60)
        
        return {
            'total_distance': total_dist,
            'total_time': total_time,
            'num_pois': n,
            'avg_distance_per_poi': total_dist / (n - 1) if n > 1 else 0.0
        }
    
    def check_constraint_violations(
        self,
        route: List[int],
        pois: List[Dict],
        time_matrix: np.ndarray,
        start_time: float = 540  # 9 AM
    ) -> Dict:
        """
        Check if route violates any constraints
        FREE - Time window validation
        
        Returns:
            {
                'num_violations': int,
                'violated_pois': List[int],
                'is_feasible': bool,
                'violations': List[Dict]
            }
        """
        violations = []
        current_time = start_time
        
        for i, poi_idx in enumerate(route):
            if i > 0:
                # Add travel time
                prev_poi = route[i - 1]
                current_time += time_matrix[prev_poi][poi_idx]
            
            poi = pois[poi_idx]
            opening = poi.get('opening_time', 0)
            closing = poi.get('closing_time', 1440)
            visit_dur = poi.get('visit_duration', 60)
            
            # Check if we can visit
            if current_time < opening:
                # Wait until opening
                wait_time = opening - current_time
                current_time = opening
            
            if current_time + visit_dur > closing:
                # Violation: arrives too late
                violations.append({
                    'poi_index': poi_idx,
                    'poi_name': poi.get('name', f'POI_{poi_idx}'),
                    'type': 'time_window',
                    'arrival_time': current_time,
                    'closing_time': closing,
                    'violation_amount': (current_time + visit_dur) - closing
                })
            
            # Update time
            current_time += visit_dur
        
        return {
            'num_violations': len(violations),
            'violated_pois': [v['poi_index'] for v in violations],
            'is_feasible': len(violations) == 0,
            'violations': violations
        }
    
    def benchmark_algorithm(
        self,
        algorithm_func,
        *args,
        **kwargs
    ) -> Dict:
        """
        Benchmark algorithm execution
        FREE - Time and iteration tracking
        
        Returns:
            {
                'execution_time': float (seconds),
                'result': algorithm output,
                'timestamp': float
            }
        """
        start_time = time.time()
        result = algorithm_func(*args, **kwargs)
        end_time = time.time()
        
        execution_time = end_time - start_time
        
        return {
            'execution_time': execution_time,
            'result': result,
            'timestamp': start_time
        }
    
    def compare_algorithms(
        self,
        algorithms: Dict[str, callable],
        pois: List[Dict],
        distance_matrix: np.ndarray,
        time_matrix: np.ndarray = None
    ) -> Dict:
        """
        Compare multiple algorithms
        FREE - Comprehensive comparison
        
        Args:
            algorithms: {'name': solver_function, ...}
            pois: POI list
            distance_matrix: Distance matrix
            time_matrix: Optional time matrix
            
        Returns:
            Comparison results for all algorithms
        """
        results = {}
        
        for name, algo_func in algorithms.items():
            print(f"\nTesting {name}...")
            
            # Benchmark
            benchmark = self.benchmark_algorithm(
                algo_func,
                pois=pois,
                distance_matrix=distance_matrix
            )
            
            # Extract route
            if 'route' in benchmark['result']:
                route = benchmark['result']['route']
            elif isinstance(benchmark['result'], tuple):
                route = benchmark['result'][0]  # (route, distance)
            else:
                route = benchmark['result']
            
            # Evaluate quality
            quality = self.evaluate_solution_quality(
                route, pois, distance_matrix, time_matrix
            )
            
            # Check constraints
            if time_matrix is not None:
                constraints = self.check_constraint_violations(
                    route, pois, time_matrix
                )
            else:
                constraints = {'is_feasible': True, 'num_violations': 0}
            
            results[name] = {
                'route': route,
                'route_names': [pois[i].get('name', f'POI_{i}') for i in route],
                'execution_time': benchmark['execution_time'],
                **quality,
                **constraints
            }
        
        # Add comparison metrics
        results['comparison'] = self._create_comparison_summary(results)
        
        return results
    
    def _create_comparison_summary(self, results: Dict) -> Dict:
        """
        Create comparison summary
        Shows best/worst for each metric
        """
        # Exclude 'comparison' key itself
        algo_results = {k: v for k, v in results.items() if k != 'comparison'}
        
        if not algo_results:
            return {}
        
        # Find best for each metric
        best_distance = min(algo_results.items(), 
                          key=lambda x: x[1]['total_distance'])
        fastest = min(algo_results.items(),
                     key=lambda x: x[1]['execution_time'])
        
        return {
            'best_distance': {
                'algorithm': best_distance[0],
                'value': best_distance[1]['total_distance']
            },
            'fastest': {
                'algorithm': fastest[0],
                'value': fastest[1]['execution_time']
            },
            'num_algorithms_tested': len(algo_results)
        }
    
    def calculate_optimality_gap(
        self,
        route: List[int],
        distance_matrix: np.ndarray,
        optimal_distance: float
    ) -> Dict:
        """
        Calculate optimality gap (% above known optimal solution)
        Demonstrates how close quantum/classical gets to true optimum
        
        Args:
            route: Solution route
            distance_matrix: Distance matrix
            optimal_distance: Known optimal distance (from brute force)
            
        Returns:
            {
                'actual_distance': float,
                'optimal_distance': float,
                'gap_absolute': float (km),
                'gap_percentage': float (%),
                'quality_score': float (0-1, 1=optimal)
            }
        """
        # Calculate route distance
        actual_distance = 0.0
        for i in range(len(route) - 1):
            actual_distance += distance_matrix[route[i]][route[i + 1]]
        
        gap_absolute = actual_distance - optimal_distance
        gap_percentage = (gap_absolute / optimal_distance * 100) if optimal_distance > 0 else 0
        quality_score = optimal_distance / actual_distance if actual_distance > 0 else 0
        
        return {
            'actual_distance': actual_distance,
            'optimal_distance': optimal_distance,
            'gap_absolute': gap_absolute,
            'gap_percentage': gap_percentage,
            'quality_score': quality_score,
            'is_optimal': abs(gap_percentage) < 0.1  # Within 0.1%
        }
    
    def measure_multi_objective_score(
        self,
        route: List[int],
        pois: List[Dict],
        distance_matrix: np.ndarray,
        user_preferences: Dict[int, float],
        constraint_violations: int = 0,
        weights: Dict[str, float] = None
    ) -> Dict:
        """
        Calculate multi-objective optimization score
        Demonstrates QAOA's ability to balance multiple objectives
        
        Args:
            route: Solution route
            pois: POI list
            distance_matrix: Distance matrix
            user_preferences: {poi_id: preference_score} in [0,1]
            constraint_violations: Number of constraint violations
            weights: Objective weights {
                'distance': 0.3,
                'preference': 0.5,
                'constraints': 0.2
            }
            
        Returns:
            {
                'distance_score': float (0-1, normalized),
                'preference_score': float (0-1, avg preference),
                'constraint_score': float (0-1, 0=violations),
                'weighted_total': float (0-1, combined score),
                'breakdown': Dict with component details
            }
        """
        if weights is None:
            weights = {
                'distance': 0.3,
                'preference': 0.5,
                'constraints': 0.2
            }
        
        # Distance score (lower is better, normalized)
        total_distance = 0.0
        for i in range(len(route) - 1):
            total_distance += distance_matrix[route[i]][route[i + 1]]
        
        # Normalize distance (assume max possible is sum of all edges)
        max_distance = np.sum(distance_matrix) / 2  # Rough upper bound
        distance_score = 1.0 - min(total_distance / max_distance, 1.0)
        
        # Preference score (average of visited POIs)
        preference_sum = 0.0
        for poi_idx in route:
            if poi_idx < len(pois):
                poi_id = pois[poi_idx].get('id', poi_idx)
                preference_sum += user_preferences.get(poi_id, 0.5)
        avg_preference = preference_sum / len(route) if route else 0.0
        
        # Constraint score (binary: 1=feasible, 0=infeasible, or gradual penalty)
        if constraint_violations == 0:
            constraint_score = 1.0
        else:
            # Gradual penalty for violations
            constraint_score = max(0.0, 1.0 - (constraint_violations * 0.2))
        
        # Weighted total
        weighted_total = (
            weights['distance'] * distance_score +
            weights['preference'] * avg_preference +
            weights['constraints'] * constraint_score
        )
        
        return {
            'distance_score': distance_score,
            'preference_score': avg_preference,
            'constraint_score': constraint_score,
            'weighted_total': weighted_total,
            'breakdown': {
                'distance_component': weights['distance'] * distance_score,
                'preference_component': weights['preference'] * avg_preference,
                'constraint_component': weights['constraints'] * constraint_score,
                'total_distance_km': total_distance,
                'avg_preference_raw': avg_preference,
                'num_violations': constraint_violations
            }
        }
    
    def constraint_satisfaction_degree(
        self,
        route: List[int],
        pois: List[Dict],
        time_matrix: np.ndarray,
        start_time: float = 540
    ) -> Dict:
        """
        Measure degree of constraint satisfaction (0-1 scale)
        Shows partial satisfaction, not just binary feasible/infeasible
        
        Returns:
            {
                'satisfaction_degree': float (0-1, 1=fully satisfied),
                'total_penalty': float (sum of violation amounts),
                'max_possible_penalty': float,
                'num_hard_violations': int (complete violations),
                'num_soft_violations': int (partial violations),
                'details': List of violation details
            }
        """
        violations_detail = []
        total_penalty = 0.0
        hard_violations = 0
        soft_violations = 0
        
        current_time = start_time
        max_possible_penalty = len(pois) * 1440  # Worst case: miss all by full day
        
        for i, poi_idx in enumerate(route):
            if i > 0:
                current_time += time_matrix[route[i - 1]][poi_idx]
            
            poi = pois[poi_idx]
            opening = poi.get('opening_time', 0)
            closing = poi.get('closing_time', 1440)
            visit_dur = poi.get('visit_duration', 60)
            
            # Check arrival vs opening
            if current_time < opening:
                wait_time = opening - current_time
                current_time = opening
                soft_violations += 1
                violations_detail.append({
                    'poi': poi.get('name', f'POI_{poi_idx}'),
                    'type': 'early_arrival',
                    'severity': 'soft',
                    'penalty': wait_time * 0.1  # Waiting is minor penalty
                })
                total_penalty += wait_time * 0.1
            
            # Check if can complete visit before closing
            if current_time + visit_dur > closing:
                overtime = (current_time + visit_dur) - closing
                hard_violations += 1
                violations_detail.append({
                    'poi': poi.get('name', f'POI_{poi_idx}'),
                    'type': 'late_arrival',
                    'severity': 'hard',
                    'penalty': overtime  # Full penalty for missing deadline
                })
                total_penalty += overtime
            
            current_time += visit_dur
        
        # Calculate satisfaction degree
        satisfaction_degree = 1.0 - min(total_penalty / max_possible_penalty, 1.0)
        
        return {
            'satisfaction_degree': satisfaction_degree,
            'total_penalty': total_penalty,
            'max_possible_penalty': max_possible_penalty,
            'num_hard_violations': hard_violations,
            'num_soft_violations': soft_violations,
            'is_fully_satisfied': hard_violations == 0 and soft_violations == 0,
            'details': violations_detail
        }
    
    def generate_comparison_table(self, results: Dict) -> str:
        """
        Generate ASCII table for teacher presentation
        FREE - Terminal-friendly output
        """
        # Exclude comparison key
        algo_results = {k: v for k, v in results.items() if k != 'comparison'}
        
        if not algo_results:
            return "No results to display"
        
        lines = []
        lines.append("=" * 100)
        lines.append("CLASSICAL vs QUANTUM COMPARISON TABLE")
        lines.append("=" * 100)
        
        # Header
        header = f"{'Algorithm':<20} {'Distance (km)':<15} {'Time (min)':<12} {'Execution (s)':<15} {'Feasible':<10}"
        lines.append(header)
        lines.append("-" * 100)
        
        # Rows
        for name, data in algo_results.items():
            dist = f"{data['total_distance']:.2f}"
            time_val = f"{data['total_time']:.1f}" if data['total_time'] > 0 else "N/A"
            exec_time = f"{data['execution_time']:.4f}"
            feasible = "✓" if data.get('is_feasible', True) else "✗"
            
            row = f"{name:<20} {dist:<15} {time_val:<12} {exec_time:<15} {feasible:<10}"
            lines.append(row)
        
        lines.append("=" * 100)
        
        # Summary
        if 'comparison' in results:
            comp = results['comparison']
            lines.append(f"\nBest Distance: {comp['best_distance']['algorithm']} "
                        f"({comp['best_distance']['value']:.2f} km)")
            lines.append(f"Fastest: {comp['fastest']['algorithm']} "
                        f"({comp['fastest']['value']:.4f} seconds)")
        
        return "\n".join(lines)


# Example usage (FREE)
if __name__ == "__main__":
    # Sample data
    sample_pois = [
        {'id': 1, 'name': 'Hotel', 'opening_time': 0, 'closing_time': 1440, 'visit_duration': 0},
        {'id': 2, 'name': 'Temple', 'opening_time': 360, 'closing_time': 1080, 'visit_duration': 60},
        {'id': 3, 'name': 'Museum', 'opening_time': 540, 'closing_time': 1020, 'visit_duration': 90},
        {'id': 4, 'name': 'Restaurant', 'opening_time': 660, 'closing_time': 1320, 'visit_duration': 60}
    ]
    
    distance_matrix = np.array([
        [0.0, 2.1, 1.2, 1.5],
        [2.1, 0.0, 0.8, 0.5],
        [1.2, 0.8, 0.0, 0.3],
        [1.5, 0.5, 0.3, 0.0]
    ])
    
    time_matrix = (distance_matrix / 30) * 60  # Assume 30 km/h
    
    # Test metrics calculator
    calculator = MetricsCalculator()
    
    # Sample route
    route = [0, 1, 3, 2]
    
    # Evaluate
    quality = calculator.evaluate_solution_quality(
        route, sample_pois, distance_matrix, time_matrix
    )
    
    print("Solution Quality Metrics:")
    for key, value in quality.items():
        print(f"  {key}: {value}")
    
    # Check constraints
    constraints = calculator.check_constraint_violations(
        route, sample_pois, time_matrix, start_time=540
    )
    
    print(f"\nConstraint Satisfaction:")
    print(f"  Feasible: {constraints['is_feasible']}")
    print(f"  Violations: {constraints['num_violations']}")
