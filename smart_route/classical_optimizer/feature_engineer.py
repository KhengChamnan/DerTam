"""
Feature Engineering for Route Optimization
Creates feature matrix from manually selected POIs for quantum encoding
"""
import numpy as np
from typing import List, Dict, Tuple, Optional
from utils.distance_calculator import DistanceCalculator


class FeatureEngineer:
    """
    Feature engineering for quantum encoding
    Creates feature matrix (POIs × Features) from manually selected POIs
    """
    
    def __init__(self, distance_calculator: Optional[DistanceCalculator] = None):
        """
        Initialize feature engineer
        
        Args:
            distance_calculator: DistanceCalculator instance
        """
        self.distance_calculator = distance_calculator or DistanceCalculator()
    
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
    
    def create_feature_matrix(
        self,
        pois: List[Dict],
        user_preferences: Dict,
        start_lat: float,
        start_lon: float
    ) -> Tuple[np.ndarray, Dict]:
        """
        Create feature matrix from manually selected POIs for quantum encoding
        Rows = POIs, Columns = Features
        
        Features:
        - Category (one-hot encoded: Historical, Temple, Museum, etc.)
        - Distance from start (normalized 0-1)
        - Opening hours compatibility (0-1 score)
        - Traffic factor (normalized 0-1)
        
        Args:
            pois: List of manually selected POI dictionaries (2-8 POIs)
            user_preferences: User preference dictionary
            start_lat: Starting latitude
            start_lon: Starting longitude
            
        Returns:
            (feature_matrix, feature_info)
            feature_matrix: numpy array (n_pois x n_features)
            feature_info: Dictionary with feature names and metadata
        """
        n_pois = len(pois)
        if n_pois < 2 or n_pois > 8:
            raise ValueError(f"Number of POIs must be between 2 and 8, got {n_pois}")
        
        # Get all unique categories
        all_categories = set()
        for poi in pois:
            all_categories.add(poi.get('category', 'Unknown'))
        all_categories = sorted(list(all_categories))
        n_categories = len(all_categories)
        
        # Calculate distances from start
        distances_from_start = self.distance_calculator.calculate_distance_from_start(
            start_lat, start_lon, pois
        )
        max_distance = max(distances_from_start) if distances_from_start else 1.0
        
        # Get start time
        start_time_str = user_preferences.get('start_time', '08:00:00')
        start_time_minutes = self._time_string_to_minutes(start_time_str)
        trip_duration = user_preferences.get('trip_duration', 8) * 60  # Convert to minutes
        
        # Get traffic penalty matrix
        distance_matrix = self.distance_calculator.calculate_distance_matrix(pois)
        traffic_penalty = self.distance_calculator.get_traffic_penalty_matrix(pois, distance_matrix)
        max_traffic = np.max(traffic_penalty) if np.max(traffic_penalty) > 0 else 1.0
        
        # Build feature matrix
        # Features: [category_one_hot..., distance_from_start, opening_compatibility, avg_traffic]
        n_features = n_categories + 3  # categories + 3 other features
        feature_matrix = np.zeros((n_pois, n_features))
        
        for i, poi in enumerate(pois):
            feature_idx = 0
            
            # 1. Category one-hot encoding
            category = poi.get('category', 'Unknown')
            if category in all_categories:
                cat_idx = all_categories.index(category)
                feature_matrix[i, cat_idx] = 1.0
            feature_idx += n_categories
            
            # 2. Distance from start (normalized 0-1)
            dist = distances_from_start[i] if i < len(distances_from_start) else 0.0
            feature_matrix[i, feature_idx] = dist / max_distance if max_distance > 0 else 0.0
            feature_idx += 1
            
            # 3. Opening hours compatibility (0-1 score)
            opening_time = poi.get('opening_time', 0)
            closing_time = poi.get('closing_time', 1440)
            
            # Check if POI is accessible during trip window
            trip_end = start_time_minutes + trip_duration
            if closing_time < start_time_minutes or opening_time > trip_end:
                compatibility = 0.0  # Not accessible
            else:
                # Binary: 1.0 if accessible during trip window, 0.0 if not
                compatibility = 1.0
            
            feature_matrix[i, feature_idx] = compatibility
            feature_idx += 1
            
            # 4. Average traffic factor (normalized 0-1)
            # Average traffic penalty for routes to/from this POI
            if traffic_penalty.shape[0] > i:
                avg_traffic = np.mean(traffic_penalty[i, :]) if np.any(traffic_penalty[i, :]) else 0.0
                feature_matrix[i, feature_idx] = avg_traffic / max_traffic if max_traffic > 0 else 0.0
            else:
                feature_matrix[i, feature_idx] = 0.0
        
        # Create feature info
        feature_names = all_categories + ['distance_from_start', 'opening_compatibility', 'avg_traffic']
        feature_info = {
            'feature_names': feature_names,
            'n_features': n_features,
            'n_pois': n_pois,
            'categories': all_categories,
            'feature_matrix_shape': feature_matrix.shape
        }
        
        return feature_matrix, feature_info
    
    def check_feasibility(
        self,
        route: List[int],
        pois: List[Dict],
        distance_matrix: np.ndarray,
        time_matrix: Optional[np.ndarray] = None,
        start_time_minutes: int = 480
    ) -> Dict:
        """
        Check if a route is feasible given constraints
        
        Args:
            route: Route as list of POI indices
            pois: List of POI dictionaries
            distance_matrix: Distance matrix (n x n)
            time_matrix: Optional time matrix (n x n)
            start_time_minutes: Start time in minutes since midnight
            
        Returns:
            Dictionary with feasibility information:
            {
                'is_feasible': bool,
                'num_violations': int,
                'violated_pois': List[int],
                'violations': List[Dict],
                'errors': List[str],
                'warnings': List[str]
            }
        """
        errors = []
        warnings = []
        violations = []
        n_pois = len(pois)
        
        # Check route validity
        if len(route) != n_pois:
            errors.append(f"Route length {len(route)} != {n_pois}")
        
        # Check all POIs present
        used_pois = set(route)
        if len(used_pois) != n_pois:
            missing = set(range(n_pois)) - used_pois
            errors.append(f"Missing POIs: {missing}")
        
        # Check duplicates
        if len(route) != len(set(route)):
            duplicates = [p for p in route if route.count(p) > 1]
            errors.append(f"Duplicate POIs: {duplicates}")
        
        # Check valid indices
        for i, poi_idx in enumerate(route):
            if poi_idx < 0 or poi_idx >= n_pois:
                errors.append(f"Invalid POI index {poi_idx} at position {i}")
        
        # Check time window constraints if time_matrix is provided
        if time_matrix is not None:
            current_time = start_time_minutes
            
            for i, poi_idx in enumerate(route):
                if poi_idx < 0 or poi_idx >= n_pois:
                    continue
                
                # Add travel time from previous POI
                if i > 0:
                    prev_poi = route[i - 1]
                    if prev_poi >= 0 and prev_poi < n_pois:
                        current_time += time_matrix[prev_poi][poi_idx]
                
                poi = pois[poi_idx]
                opening = poi.get('opening_time', 0)
                closing = poi.get('closing_time', 1440)
                
                # Check if we can visit
                if current_time < opening:
                    # Wait until opening (not a violation, just a note)
                    wait_time = opening - current_time
                    current_time = opening
                
                if current_time > closing:
                    # Violation: arrives after closing
                    violations.append({
                        'poi_index': poi_idx,
                        'poi_name': poi.get('name', f'POI_{poi_idx}'),
                        'type': 'time_window',
                        'arrival_time': current_time,
                        'closing_time': closing,
                        'violation_amount': current_time - closing
                    })
        
        is_feasible = len(errors) == 0 and len(violations) == 0
        
        return {
            'is_feasible': is_feasible,
            'num_violations': len(violations),
            'violated_pois': [v['poi_index'] for v in violations],
            'violations': violations,
            'errors': errors,
            'warnings': warnings
        }

