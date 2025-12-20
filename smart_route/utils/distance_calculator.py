"""
Distance Calculator with Traffic Support
Calculates distance and time matrices with traffic factors
"""
import numpy as np
from haversine import haversine
from typing import List, Dict, Optional
import json
from pathlib import Path


class DistanceCalculator:
    """
    Calculate distance and time matrices for POIs
    Supports traffic factors for realistic time calculations
    """
    
    def __init__(self, traffic_data_path: Optional[str] = None, default_speed_kmh: float = 30.0):
        """
        Initialize distance calculator
        
        Args:
            traffic_data_path: Path to traffic JSON file
            default_speed_kmh: Default travel speed in km/h
        """
        self.default_speed_kmh = default_speed_kmh
        self.traffic_factors = {}
        self.default_traffic_factor = 1.2
        
        if traffic_data_path:
            self.load_traffic_data(traffic_data_path)
    
    def load_traffic_data(self, traffic_data_path: str):
        """Load traffic factors from JSON file"""
        try:
            with open(traffic_data_path, 'r') as f:
                data = json.load(f)
            
            # Load traffic conditions
            conditions = data.get('traffic_conditions', [])
            for condition in conditions:
                from_id = condition['from_poi_id']
                to_id = condition['to_poi_id']
                factor = condition.get('traffic_factor', 1.0)
                self.traffic_factors[(from_id, to_id)] = factor
            
            # Load default factor
            self.default_traffic_factor = data.get('default_traffic_factor', 1.2)
        except FileNotFoundError:
            print(f"Warning: Traffic data file not found: {traffic_data_path}")
        except Exception as e:
            print(f"Warning: Error loading traffic data: {e}")
    
    def calculate_distance_matrix(self, pois: List[Dict]) -> np.ndarray:
        """
        Calculate distance matrix using Haversine formula
        
        Args:
            pois: List of POI dictionaries with 'lat' and 'lng' keys
            
        Returns:
            Distance matrix in kilometers (n x n numpy array)
        """
        n = len(pois)
        distance_matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(n):
                if i == j:
                    distance_matrix[i][j] = 0.0
                else:
                    poi_i = (pois[i]['lat'], pois[i]['lng'])
                    poi_j = (pois[j]['lat'], pois[j]['lng'])
                    distance_km = haversine(poi_i, poi_j)
                    distance_matrix[i][j] = distance_km
        
        return distance_matrix
    
    def get_traffic_factor(self, from_poi: Dict, to_poi: Dict) -> float:
        """
        Get traffic factor between two POIs
        
        Args:
            from_poi: Source POI dictionary
            to_poi: Destination POI dictionary
            
        Returns:
            Traffic factor (1.0 = normal, >1.0 = slower)
        """
        from_id = from_poi.get('id', '')
        to_id = to_poi.get('id', '')
        
        # Check for specific pair
        factor = self.traffic_factors.get((from_id, to_id))
        if factor is not None:
            return factor
        
        # Return default
        return self.default_traffic_factor
    
    def calculate_time_matrix(
        self, 
        distance_matrix: np.ndarray, 
        pois: List[Dict],
        apply_traffic: bool = True
    ) -> np.ndarray:
        """
        Calculate time matrix from distance matrix
        
        Args:
            distance_matrix: Distance matrix in kilometers
            pois: List of POI dictionaries
            apply_traffic: Whether to apply traffic factors
            
        Returns:
            Time matrix in minutes (n x n numpy array)
        """
        n = len(distance_matrix)
        time_matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(n):
                if i == j:
                    time_matrix[i][j] = 0.0
                else:
                    # Base time = distance / speed
                    distance_km = distance_matrix[i][j]
                    base_time_minutes = (distance_km / self.default_speed_kmh) * 60
                    
                    # Apply traffic factor if enabled
                    if apply_traffic and i < len(pois) and j < len(pois):
                        traffic_factor = self.get_traffic_factor(pois[i], pois[j])
                        time_matrix[i][j] = base_time_minutes * traffic_factor
                    else:
                        time_matrix[i][j] = base_time_minutes
        
        return time_matrix
    
    def calculate_distance_from_start(
        self, 
        start_lat: float, 
        start_lon: float, 
        pois: List[Dict]
    ) -> List[float]:
        """
        Calculate distances from start location to all POIs
        
        Args:
            start_lat: Starting latitude
            start_lon: Starting longitude
            pois: List of POI dictionaries
            
        Returns:
            List of distances in kilometers
        """
        start_location = (start_lat, start_lon)
        distances = []
        
        for poi in pois:
            poi_location = (poi['lat'], poi['lng'])
            distance_km = haversine(start_location, poi_location)
            distances.append(distance_km)
        
        return distances
    
    def filter_pois_by_distance(
        self,
        pois: List[Dict],
        start_lat: float,
        start_lon: float,
        max_distance_km: float
    ) -> List[Dict]:
        """
        Filter POIs that are within max_distance from start location
        
        Args:
            pois: List of POI dictionaries
            start_lat: Starting latitude
            start_lon: Starting longitude
            max_distance_km: Maximum distance in kilometers
            
        Returns:
            Filtered list of POIs within distance limit
        """
        distances = self.calculate_distance_from_start(start_lat, start_lon, pois)
        filtered_pois = []
        
        for poi, distance in zip(pois, distances):
            if distance <= max_distance_km:
                filtered_pois.append(poi)
        
        return filtered_pois
    
    def get_traffic_penalty_matrix(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray
    ) -> np.ndarray:
        """
        Calculate traffic penalty matrix for QUBO encoding
        
        Args:
            pois: List of POI dictionaries
            distance_matrix: Distance matrix in kilometers
            
        Returns:
            Traffic penalty matrix (higher values = more penalty)
        """
        n = len(pois)
        penalty_matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    traffic_factor = self.get_traffic_factor(pois[i], pois[j])
                    # Penalty increases with traffic factor and distance
                    # Amplify penalty: (traffic_factor - 1.0) * distance * 2.0
                    # This makes traffic differences more significant
                    penalty = (traffic_factor - 1.0) * distance_matrix[i][j] * 2.0
                    penalty_matrix[i][j] = penalty
        
        return penalty_matrix


# Example usage
if __name__ == "__main__":
    # Sample POIs
    sample_pois = [
        {"id": "poi_01", "name": "Royal Palace", "lat": 11.5625, "lng": 104.9310},
        {"id": "poi_02", "name": "Silver Pagoda", "lat": 11.5627, "lng": 104.9312},
        {"id": "poi_03", "name": "National Museum", "lat": 11.5640, "lng": 104.9282},
        {"id": "poi_04", "name": "Independence Monument", "lat": 11.5564, "lng": 104.9312}
    ]
    
    # Initialize calculator
    calc = DistanceCalculator(
        traffic_data_path="data/traffic/phnompenh_traffic.json",
        default_speed_kmh=30.0
    )
    
    # Calculate matrices
    distance_matrix = calc.calculate_distance_matrix(sample_pois)
    time_matrix = calc.calculate_time_matrix(distance_matrix, sample_pois, apply_traffic=True)
    
    print("Distance Matrix (km):")
    print(distance_matrix)
    print("\nTime Matrix (minutes):")
    print(time_matrix)
    
    # Test traffic penalties
    penalty_matrix = calc.get_traffic_penalty_matrix(sample_pois, distance_matrix)
    print("\nTraffic Penalty Matrix:")
    print(penalty_matrix)

