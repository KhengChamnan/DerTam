"""
Distance Calculator - 100% FREE
No paid APIs required - Uses Haversine formula
"""
import numpy as np
from math import radians, sin, cos, sqrt, atan2
from typing import List, Dict


class DistanceCalculator:
    """
    Calculate distances between geographic coordinates
    100% FREE - Haversine formula (great-circle distance)
    
    No Google Maps API needed!
    """
    
    def __init__(self, earth_radius_km: float = 6371.0):
        """
        Args:
            earth_radius_km: Earth's radius in kilometers (default: 6371)
        """
        self.earth_radius = earth_radius_km
        
    def haversine_distance(
        self,
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float
    ) -> float:
        """
        Calculate distance between two points using Haversine formula
        FREE - No API calls
        
        Args:
            lat1, lon1: First point (degrees)
            lat2, lon2: Second point (degrees)
            
        Returns:
            Distance in kilometers
            
        Formula:
        a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
        c = 2 ⋅ atan2(√a, √(1−a))
        d = R ⋅ c
        """
        # Convert to radians
        lat1_rad = radians(lat1)
        lon1_rad = radians(lon1)
        lat2_rad = radians(lat2)
        lon2_rad = radians(lon2)
        
        # Differences
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        # Haversine formula
        a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        distance = self.earth_radius * c
        
        return distance
    
    def calculate_distance_matrix(
        self,
        pois: List[Dict]
    ) -> np.ndarray:
        """
        Calculate distance matrix for all POI pairs
        FREE - No external API calls
        
        Args:
            pois: List of POIs with 'lat' and 'lon' fields
            
        Returns:
            n×n distance matrix where matrix[i][j] = distance from POI i to POI j
        """
        n = len(pois)
        matrix = np.zeros((n, n))
        
        for i in range(n):
            for j in range(n):
                if i != j:
                    dist = self.haversine_distance(
                        pois[i]['lat'],
                        pois[i]['lon'],
                        pois[j]['lat'],
                        pois[j]['lon']
                    )
                    matrix[i][j] = dist
        
        return matrix
    
    def calculate_time_matrix(
        self,
        distance_matrix: np.ndarray,
        avg_speed_kmh: float = 30.0
    ) -> np.ndarray:
        """
        Convert distance matrix to time matrix
        FREE - Simple speed calculation
        
        Args:
            distance_matrix: Distance matrix (km)
            avg_speed_kmh: Average travel speed in km/h
            
        Returns:
            Time matrix in minutes
        """
        # Time = Distance / Speed
        # Convert to minutes: (km / km/h) * 60
        time_matrix = (distance_matrix / avg_speed_kmh) * 60
        return time_matrix
    
    def estimate_total_trip_time(
        self,
        route: List[int],
        pois: List[Dict],
        distance_matrix: np.ndarray,
        avg_speed_kmh: float = 30.0
    ) -> Dict:
        """
        Estimate total trip time including travel and visits
        FREE - Comprehensive time calculation
        
        Returns:
            {
                'travel_time': minutes,
                'visit_time': minutes,
                'total_time': minutes,
                'breakdown': [(poi, travel_min, visit_min), ...]
            }
        """
        travel_time = 0.0
        visit_time = 0.0
        breakdown = []
        
        for i in range(len(route)):
            poi_idx = route[i]
            poi = pois[poi_idx]
            
            # Travel time to this POI
            if i > 0:
                prev_idx = route[i - 1]
                distance = distance_matrix[prev_idx][poi_idx]
                travel_min = (distance / avg_speed_kmh) * 60
                travel_time += travel_min
            else:
                travel_min = 0.0
            
            # Visit duration
            visit_min = poi.get('visit_duration', 60)
            visit_time += visit_min
            
            breakdown.append({
                'poi': poi.get('name', f'POI_{poi_idx}'),
                'travel_minutes': travel_min,
                'visit_minutes': visit_min
            })
        
        return {
            'travel_time_minutes': travel_time,
            'visit_time_minutes': visit_time,
            'total_time_minutes': travel_time + visit_time,
            'breakdown': breakdown
        }
    
    def find_nearest_poi(
        self,
        lat: float,
        lon: float,
        pois: List[Dict],
        max_distance_km: float = None
    ) -> Dict:
        """
        Find nearest POI to a location
        FREE - For dynamic re-routing
        
        Args:
            lat, lon: Current location
            pois: POI list
            max_distance_km: Optional distance limit
            
        Returns:
            {
                'poi': nearest POI dict,
                'distance': distance in km,
                'index': POI index
            }
        """
        nearest_poi = None
        nearest_dist = float('inf')
        nearest_idx = -1
        
        for i, poi in enumerate(pois):
            dist = self.haversine_distance(lat, lon, poi['lat'], poi['lon'])
            
            if dist < nearest_dist:
                if max_distance_km is None or dist <= max_distance_km:
                    nearest_dist = dist
                    nearest_poi = poi
                    nearest_idx = i
        
        return {
            'poi': nearest_poi,
            'distance': nearest_dist,
            'index': nearest_idx
        }


# Example usage (FREE)
if __name__ == "__main__":
    # Sample POIs in Bangkok
    sample_pois = [
        {'id': 1, 'name': 'Wat Arun', 'lat': 13.7437, 'lon': 100.4887},
        {'id': 2, 'name': 'Grand Palace', 'lat': 13.7500, 'lon': 100.4917},
        {'id': 3, 'name': 'Wat Pho', 'lat': 13.7465, 'lon': 100.4927},
        {'id': 4, 'name': 'Khao San Road', 'lat': 13.7589, 'lon': 100.4976},
    ]
    
    # Create calculator (FREE)
    calc = DistanceCalculator()
    
    # Calculate distance matrix (FREE - no API calls)
    print("Calculating distance matrix...")
    distance_matrix = calc.calculate_distance_matrix(sample_pois)
    
    print("\nDistance Matrix (km):")
    print("        ", end="")
    for poi in sample_pois:
        print(f"{poi['name'][:10]:<12}", end="")
    print()
    
    for i, poi in enumerate(sample_pois):
        print(f"{poi['name'][:10]:<8}", end="")
        for j in range(len(sample_pois)):
            print(f"{distance_matrix[i][j]:>10.2f}  ", end="")
        print()
    
    # Calculate time matrix (FREE)
    time_matrix = calc.calculate_time_matrix(distance_matrix, avg_speed_kmh=25)
    print(f"\nTime to travel (assuming 25 km/h):")
    print(f"Wat Arun → Grand Palace: {time_matrix[0][1]:.1f} minutes")
    
    # Find nearest POI to current location (FREE)
    current_lat, current_lon = 13.7500, 100.4950  # Near Grand Palace
    nearest = calc.find_nearest_poi(current_lat, current_lon, sample_pois)
    print(f"\nNearest POI to (13.7500, 100.4950):")
    print(f"  {nearest['poi']['name']} - {nearest['distance']:.2f} km away")
    
    print("\n✓ All distance calculations 100% FREE - No API costs!")
