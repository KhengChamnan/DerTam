"""
Feature Engineering for Route Optimization
Validates POIs, checks constraints, and prepares data for QUBO encoding
"""
import numpy as np
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
from utils.distance_calculator import DistanceCalculator


class FeatureEngineer:
    """
    Feature engineering and validation pipeline
    Ensures data quality before quantum optimization
    """
    
    def __init__(self, distance_calculator: Optional[DistanceCalculator] = None):
        """
        Initialize feature engineer
        
        Args:
            distance_calculator: DistanceCalculator instance
        """
        self.distance_calculator = distance_calculator or DistanceCalculator()
        self.validation_errors = []
        self.validation_warnings = []
    
    def validate_poi_constraints(
        self,
        poi: Dict,
        start_time_minutes: int,
        current_time_minutes: int
    ) -> Tuple[bool, List[str]]:
        """
        Validate if POI can be visited given time constraints
        
        Args:
            poi: POI dictionary
            start_time_minutes: Trip start time in minutes since midnight
            current_time_minutes: Current time when arriving at POI
            
        Returns:
            (is_valid, list_of_errors)
        """
        errors = []
        
        # Check opening hours
        opening_time = poi.get('opening_time', 0)
        closing_time = poi.get('closing_time', 1440)
        visit_duration = poi.get('visit_duration', 60)
        
        # Check if POI is open when we arrive
        arrival_time = max(current_time_minutes, opening_time)
        
        if arrival_time < opening_time:
            errors.append(f"Arrives before opening time ({opening_time} minutes)")
        
        if arrival_time + visit_duration > closing_time:
            errors.append(
                f"Cannot complete visit before closing "
                f"(arrival: {arrival_time}, closing: {closing_time}, duration: {visit_duration})"
            )
        
        is_valid = len(errors) == 0
        return is_valid, errors
    
    def validate_distance_constraint(
        self,
        pois: List[Dict],
        start_lat: float,
        start_lon: float,
        max_distance_km: float
    ) -> Tuple[List[Dict], List[int]]:
        """
        Filter POIs that exceed maximum distance from start
        
        Args:
            pois: List of POI dictionaries
            start_lat: Starting latitude
            start_lon: Starting longitude
            max_distance_km: Maximum allowed distance in kilometers
            
        Returns:
            (filtered_pois, removed_indices)
        """
        distances = self.distance_calculator.calculate_distance_from_start(
            start_lat, start_lon, pois
        )
        
        filtered_pois = []
        removed_indices = []
        
        for i, (poi, distance) in enumerate(zip(pois, distances)):
            if distance <= max_distance_km:
                filtered_pois.append(poi)
            else:
                removed_indices.append(i)
                self.validation_warnings.append(
                    f"POI {poi.get('name', i)} removed: "
                    f"distance {distance:.2f} km exceeds limit {max_distance_km} km"
                )
        
        return filtered_pois, removed_indices
    
    def validate_time_windows(
        self,
        pois: List[Dict],
        start_time_minutes: int,
        trip_duration_hours: float
    ) -> Tuple[List[Dict], List[str]]:
        """
        Validate that all POIs can be visited within trip duration
        
        Args:
            pois: List of POI dictionaries
            start_time_minutes: Start time in minutes since midnight
            trip_duration_hours: Total trip duration in hours
            
        Returns:
            (valid_pois, errors)
        """
        trip_duration_minutes = trip_duration_hours * 60
        end_time_minutes = start_time_minutes + trip_duration_minutes
        
        valid_pois = []
        errors = []
        current_time = start_time_minutes
        
        for poi in pois:
            opening_time = poi.get('opening_time', 0)
            closing_time = poi.get('closing_time', 1440)
            visit_duration = poi.get('visit_duration', 60)
            
            # Check if POI is accessible during trip time window
            if closing_time < start_time_minutes or opening_time > end_time_minutes:
                errors.append(
                    f"POI {poi.get('name', 'Unknown')} not accessible "
                    f"during trip window ({start_time_minutes}-{end_time_minutes})"
                )
                continue
            
            # Estimate arrival time (simplified - assumes direct travel)
            arrival_time = max(current_time, opening_time)
            
            if arrival_time + visit_duration > min(closing_time, end_time_minutes):
                errors.append(
                    f"POI {poi.get('name', 'Unknown')} cannot be visited "
                    f"within available time"
                )
                continue
            
            valid_pois.append(poi)
            current_time = arrival_time + visit_duration
        
        return valid_pois, errors
    
    def prepare_pois_for_optimization(
        self,
        pois: List[Dict],
        user_preferences: Dict,
        distance_matrix: Optional[np.ndarray] = None,
        time_matrix: Optional[np.ndarray] = None
    ) -> Dict:
        """
        Prepare POIs and matrices for QUBO encoding
        
        Args:
            pois: List of POI dictionaries
            user_preferences: User preference dictionary
            distance_matrix: Pre-calculated distance matrix (optional)
            time_matrix: Pre-calculated time matrix (optional)
            
        Returns:
            Dictionary with prepared data:
            {
                'pois': filtered_pois,
                'distance_matrix': distance_matrix,
                'time_matrix': time_matrix,
                'validation_info': {...}
            }
        """
        # Extract preferences
        start_lat = user_preferences.get('start_lat')
        start_lon = user_preferences.get('start_lon')
        max_distance = user_preferences.get('max_distance', 10.0)
        start_time_str = user_preferences.get('start_time', '08:00:00')
        trip_duration = user_preferences.get('trip_duration', 8)
        
        # Convert start_time to minutes
        start_time_minutes = self._time_string_to_minutes(start_time_str)
        
        # Step 1: Filter by distance
        filtered_pois, removed_by_distance = self.validate_distance_constraint(
            pois, start_lat, start_lon, max_distance
        )
        
        if len(filtered_pois) == 0:
            raise ValueError("No POIs within distance constraint")
        
        # Step 2: Validate time windows
        valid_pois, time_errors = self.validate_time_windows(
            filtered_pois, start_time_minutes, trip_duration
        )
        
        if len(valid_pois) == 0:
            raise ValueError(f"No valid POIs after time validation: {time_errors}")
        
        # Step 3: Calculate matrices if not provided
        if distance_matrix is None:
            distance_matrix = self.distance_calculator.calculate_distance_matrix(valid_pois)
        
        if time_matrix is None:
            time_matrix = self.distance_calculator.calculate_time_matrix(
                distance_matrix, valid_pois, apply_traffic=True
            )
        
        # Ensure matrices match POI count
        if len(distance_matrix) != len(valid_pois):
            distance_matrix = self.distance_calculator.calculate_distance_matrix(valid_pois)
            time_matrix = self.distance_calculator.calculate_time_matrix(
                distance_matrix, valid_pois, apply_traffic=True
            )
        
        # Step 4: Normalize data for QUBO encoding
        normalized_data = self._normalize_for_qubo(
            valid_pois, distance_matrix, time_matrix, user_preferences
        )
        
        return {
            'pois': valid_pois,
            'distance_matrix': distance_matrix,
            'time_matrix': time_matrix,
            'normalized_data': normalized_data,
            'validation_info': {
                'original_count': len(pois),
                'after_distance_filter': len(filtered_pois),
                'final_count': len(valid_pois),
                'removed_by_distance': len(removed_by_distance),
                'time_errors': time_errors,
                'warnings': self.validation_warnings
            }
        }
    
    def _normalize_for_qubo(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray,
        time_matrix: np.ndarray,
        user_preferences: Dict
    ) -> Dict:
        """
        Normalize data for QUBO encoding
        
        Args:
            pois: List of POI dictionaries
            distance_matrix: Distance matrix
            time_matrix: Time matrix
            user_preferences: User preferences
            
        Returns:
            Normalized data dictionary
        """
        # Normalize distance matrix (0-1 scale)
        max_distance = np.max(distance_matrix)
        normalized_distances = distance_matrix / max_distance if max_distance > 0 else distance_matrix
        
        # Normalize time matrix (0-1 scale)
        max_time = np.max(time_matrix)
        normalized_times = time_matrix / max_time if max_time > 0 else time_matrix
        
        # Extract constraint weights
        constraint_weights = user_preferences.get('constraint_weights', {
            'distance': 0.4,
            'time': 0.3,
            'preferences': 0.2,
            'traffic': 0.1
        })
        
        # Calculate traffic penalty matrix
        traffic_penalty = self.distance_calculator.get_traffic_penalty_matrix(pois, distance_matrix)
        max_penalty = np.max(traffic_penalty)
        normalized_traffic = traffic_penalty / max_penalty if max_penalty > 0 else traffic_penalty
        
        return {
            'normalized_distances': normalized_distances,
            'normalized_times': normalized_times,
            'normalized_traffic': normalized_traffic,
            'constraint_weights': constraint_weights,
            'max_distance': max_distance,
            'max_time': max_time
        }
    
    def _time_string_to_minutes(self, time_str: str) -> int:
        """
        Convert time string (HH:MM:SS) to minutes since midnight
        
        Args:
            time_str: Time string in format "HH:MM:SS" or "HH:MM"
            
        Returns:
            Minutes since midnight
        """
        try:
            parts = time_str.split(':')
            hours = int(parts[0])
            minutes = int(parts[1]) if len(parts) > 1 else 0
            return hours * 60 + minutes
        except (ValueError, IndexError):
            # Default to 8 AM
            return 480
    
    def check_feasibility(
        self,
        route: List[int],
        pois: List[Dict],
        distance_matrix: np.ndarray,
        time_matrix: np.ndarray,
        start_time_minutes: int
    ) -> Dict:
        """
        Check if a route is feasible given constraints
        
        Args:
            route: Route as list of POI indices
            pois: List of POI dictionaries
            distance_matrix: Distance matrix
            time_matrix: Time matrix
            start_time_minutes: Start time in minutes
            
        Returns:
            Feasibility report dictionary
        """
        violations = []
        current_time = start_time_minutes
        total_distance = 0.0
        total_time = 0.0
        
        for i, poi_idx in enumerate(route):
            if i > 0:
                # Add travel time
                prev_idx = route[i - 1]
                travel_time = time_matrix[prev_idx][poi_idx]
                travel_distance = distance_matrix[prev_idx][poi_idx]
                current_time += travel_time
                total_time += travel_time
                total_distance += travel_distance
            
            poi = pois[poi_idx]
            opening_time = poi.get('opening_time', 0)
            closing_time = poi.get('closing_time', 1440)
            visit_duration = poi.get('visit_duration', 60)
            
            # Check opening hours
            if current_time < opening_time:
                wait_time = opening_time - current_time
                current_time = opening_time
                violations.append({
                    'type': 'wait',
                    'poi': poi.get('name', f'POI_{poi_idx}'),
                    'wait_minutes': wait_time
                })
            
            # Check closing time
            if current_time + visit_duration > closing_time:
                violations.append({
                    'type': 'closing_time_violation',
                    'poi': poi.get('name', f'POI_{poi_idx}'),
                    'arrival_time': current_time,
                    'closing_time': closing_time,
                    'visit_duration': visit_duration
                })
            
            current_time += visit_duration
            total_time += visit_duration
        
        return {
            'is_feasible': len(violations) == 0,
            'violations': violations,
            'total_distance': total_distance,
            'total_time': total_time,
            'end_time': current_time
        }
    
    def optimize_classical(
        self,
        prepared_data: Dict,
        algorithm: str = 'nearest_neighbor'
    ) -> Dict:
        """
        Optimize route using classical TSP algorithms
        
        Args:
            prepared_data: Prepared data from prepare_pois_for_optimization()
            algorithm: Algorithm name ('nearest_neighbor', 'two_opt', 'simulated_annealing')
            
        Returns:
            Solution dictionary compatible with quantum solver format:
            {
                'route': List[int],
                'total_distance': float,
                'total_time': float,
                'execution_time': float,
                'algorithm': str,
                'is_valid': bool,
                'feasibility': Dict
            }
        """
        from classical_optimizer.tsp_solver import ClassicalOptimizer
        
        optimizer = ClassicalOptimizer()
        
        # Add user preferences to prepared_data if not present
        if 'user_preferences' not in prepared_data:
            prepared_data['user_preferences'] = {}
        
        result = optimizer.solve(prepared_data, algorithm)
        
        return result


# Example usage
if __name__ == "__main__":
    # Sample data
    sample_pois = [
        {"id": "poi_01", "name": "Royal Palace", "lat": 11.5625, "lng": 104.9310,
         "opening_time": 480, "closing_time": 1020, "visit_duration": 90},
        {"id": "poi_02", "name": "Silver Pagoda", "lat": 11.5627, "lng": 104.9312,
         "opening_time": 480, "closing_time": 1020, "visit_duration": 60},
        {"id": "poi_03", "name": "National Museum", "lat": 11.5640, "lng": 104.9282,
         "opening_time": 480, "closing_time": 1020, "visit_duration": 90}
    ]
    
    user_prefs = {
        "start_lat": 11.5625,
        "start_lon": 104.931,
        "start_time": "08:00:00",
        "trip_duration": 8,
        "max_distance": 10.0
    }
    
    # Initialize
    engineer = FeatureEngineer()
    
    # Prepare data
    prepared = engineer.prepare_pois_for_optimization(sample_pois, user_prefs)
    
    print("Prepared Data:")
    print(f"  POIs: {len(prepared['pois'])}")
    print(f"  Validation: {prepared['validation_info']}")

