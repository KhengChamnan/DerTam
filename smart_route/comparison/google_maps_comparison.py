"""
Google Maps / OpenRouteService Comparison
Compares our optimized routes with external routing services
100% FREE - Uses OpenRouteService API (free tier available)
"""
import numpy as np
import requests
import time
from typing import List, Dict, Tuple, Optional
import json


class RouteComparison:
    """
    Compare our routes with Google Maps / OpenRouteService
    """
    
    def __init__(self, api_key: Optional[str] = None, use_openrouteservice: bool = True):
        """
        Initialize route comparison
        
        Args:
            api_key: API key for routing service (optional, uses free service if None)
            use_openrouteservice: If True, use OpenRouteService (free), else try Google Maps
        """
        self.api_key = api_key
        self.use_openrouteservice = use_openrouteservice
        self.base_url_ors = "https://api.openrouteservice.org/v2/directions/driving-car"
        self.base_url_gmaps = "https://maps.googleapis.com/maps/api/directions/json"
    
    def get_route_from_service(
        self,
        pois: List[Dict],
        route_order: List[int]
    ) -> Dict:
        """
        Get route from external service (OpenRouteService or Google Maps)
        
        Args:
            pois: List of POI dictionaries with 'lat', 'lng'
            route_order: Order of POIs to visit (list of indices)
            
        Returns:
            Dictionary with route information:
            {
                'success': bool,
                'total_distance_km': float,
                'total_duration_minutes': float,
                'route_coordinates': List[Tuple[lat, lng]],
                'legs': List[Dict] with distance and duration for each leg
            }
        """
        if len(route_order) < 2:
            return {
                'success': False,
                'error': 'Need at least 2 POIs for route'
            }
        
        # Build coordinate list in route order
        coordinates = []
        for idx in route_order:
            if idx < len(pois):
                poi = pois[idx]
                coordinates.append([poi['lng'], poi['lat']])  # OpenRouteService uses [lon, lat]
        
        if self.use_openrouteservice:
            return self._get_ors_route(coordinates)
        else:
            return self._get_gmaps_route(pois, route_order)
    
    def _get_ors_route(self, coordinates: List[List[float]]) -> Dict:
        """
        Get route from OpenRouteService (FREE)
        
        Args:
            coordinates: List of [lon, lat] pairs
            
        Returns:
            Route information dictionary
        """
        try:
            # OpenRouteService API call
            headers = {}
            if self.api_key:
                headers['Authorization'] = self.api_key
            
            # For free tier, we can make requests without API key (limited)
            params = {
                'coordinates': coordinates,
                'format': 'json',
                'geometry': 'true'
            }
            
            response = requests.get(
                self.base_url_ors,
                params=params,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract route information
                if 'routes' in data and len(data['routes']) > 0:
                    route = data['routes'][0]
                    summary = route.get('summary', {})
                    
                    total_distance = summary.get('distance', 0) / 1000.0  # Convert to km
                    total_duration = summary.get('duration', 0) / 60.0  # Convert to minutes
                    
                    # Extract geometry if available
                    geometry = route.get('geometry', {})
                    route_coords = []
                    if 'coordinates' in geometry:
                        route_coords = [(coord[1], coord[0]) for coord in geometry['coordinates']]
                    
                    # Extract leg information
                    legs = []
                    segments = route.get('segments', [])
                    for segment in segments:
                        leg_distance = segment.get('distance', 0) / 1000.0
                        leg_duration = segment.get('duration', 0) / 60.0
                        legs.append({
                            'distance_km': leg_distance,
                            'duration_minutes': leg_duration
                        })
                    
                    return {
                        'success': True,
                        'total_distance_km': total_distance,
                        'total_duration_minutes': total_duration,
                        'route_coordinates': route_coords,
                        'legs': legs,
                        'service': 'OpenRouteService'
                    }
            
            # If API call failed, return estimated route
            return self._estimate_route(coordinates)
            
        except Exception as e:
            print(f"Error calling OpenRouteService: {e}")
            return self._estimate_route(coordinates)
    
    def _get_gmaps_route(self, pois: List[Dict], route_order: List[int]) -> Dict:
        """
        Get route from Google Maps API (requires API key)
        
        Args:
            pois: List of POI dictionaries
            route_order: Order of POIs
            
        Returns:
            Route information dictionary
        """
        if not self.api_key:
            # Fallback to estimation
            return self._estimate_route_from_pois(pois, route_order)
        
        try:
            # Build waypoints
            waypoints = []
            for idx in route_order[1:-1]:  # Exclude start and end
                if idx < len(pois):
                    poi = pois[idx]
                    waypoints.append(f"{poi['lat']},{poi['lng']}")
            
            # Start and end
            start_poi = pois[route_order[0]]
            end_poi = pois[route_order[-1]]
            
            origin = f"{start_poi['lat']},{start_poi['lng']}"
            destination = f"{end_poi['lat']},{end_poi['lng']}"
            
            params = {
                'origin': origin,
                'destination': destination,
                'waypoints': '|'.join(waypoints) if waypoints else '',
                'key': self.api_key,
                'units': 'metric'
            }
            
            response = requests.get(self.base_url_gmaps, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data['status'] == 'OK' and 'routes' in data:
                    route = data['routes'][0]
                    legs = route.get('legs', [])
                    
                    total_distance = sum(leg['distance']['value'] for leg in legs) / 1000.0
                    total_duration = sum(leg['duration']['value'] for leg in legs) / 60.0
                    
                    route_coords = []
                    for leg in legs:
                        for step in leg.get('steps', []):
                            if 'polyline' in step:
                                # Decode polyline (simplified)
                                pass
                    
                    return {
                        'success': True,
                        'total_distance_km': total_distance,
                        'total_duration_minutes': total_duration,
                        'route_coordinates': route_coords,
                        'legs': [{'distance_km': leg['distance']['value']/1000.0, 
                                 'duration_minutes': leg['duration']['value']/60.0} 
                                for leg in legs],
                        'service': 'Google Maps'
                    }
            
            return self._estimate_route_from_pois(pois, route_order)
            
        except Exception as e:
            print(f"Error calling Google Maps API: {e}")
            return self._estimate_route_from_pois(pois, route_order)
    
    def _estimate_route(self, coordinates: List[List[float]]) -> Dict:
        """
        Estimate route using Haversine distance (fallback)
        
        Args:
            coordinates: List of [lon, lat] pairs
            
        Returns:
            Estimated route information
        """
        total_distance = 0.0
        legs = []
        
        for i in range(len(coordinates) - 1):
            coord1 = coordinates[i]
            coord2 = coordinates[i + 1]
            
            # Haversine distance
            distance = self._haversine_distance(
                coord1[1], coord1[0],  # lat, lon
                coord2[1], coord2[0]
            )
            
            total_distance += distance
            # Estimate time: assume 30 km/h average
            duration = (distance / 30.0) * 60.0  # minutes
            legs.append({
                'distance_km': distance,
                'duration_minutes': duration
            })
        
        return {
            'success': True,
            'total_distance_km': total_distance,
            'total_duration_minutes': sum(leg['duration_minutes'] for leg in legs),
            'route_coordinates': [(coord[1], coord[0]) for coord in coordinates],
            'legs': legs,
            'service': 'Estimated (Haversine)',
            'note': 'Using distance estimation (no API available)'
        }
    
    def _estimate_route_from_pois(self, pois: List[Dict], route_order: List[int]) -> Dict:
        """
        Estimate route from POIs using Haversine
        
        Args:
            pois: List of POI dictionaries
            route_order: Order of POIs
            
        Returns:
            Estimated route information
        """
        coordinates = []
        for idx in route_order:
            if idx < len(pois):
                poi = pois[idx]
                coordinates.append([poi['lng'], poi['lat']])
        
        return self._estimate_route(coordinates)
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate Haversine distance between two points
        
        Args:
            lat1, lon1: First point coordinates
            lat2, lon2: Second point coordinates
            
        Returns:
            Distance in kilometers
        """
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371.0  # Earth radius in km
        
        lat1_rad = radians(lat1)
        lon1_rad = radians(lon1)
        lat2_rad = radians(lat2)
        lon2_rad = radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        return R * c
    
    def compare_routes(
        self,
        our_route: Dict,
        external_route: Dict
    ) -> Dict:
        """
        Compare our route with external service route
        
        Args:
            our_route: Our route information
                {
                    'total_distance_km': float,
                    'total_duration_minutes': float,
                    'route': List[int]
                }
            external_route: External service route information
            
        Returns:
            Comparison dictionary with metrics
        """
        our_dist = our_route.get('total_distance_km', 0)
        our_time = our_route.get('total_duration_minutes', 0)
        
        ext_dist = external_route.get('total_distance_km', 0)
        ext_time = external_route.get('total_duration_minutes', 0)
        
        # Calculate differences
        dist_diff = our_dist - ext_dist
        time_diff = our_time - ext_time
        
        dist_diff_pct = (dist_diff / ext_dist * 100) if ext_dist > 0 else 0
        time_diff_pct = (time_diff / ext_time * 100) if ext_time > 0 else 0
        
        # Determine winner
        dist_winner = "Our Route" if our_dist < ext_dist else "External Service"
        time_winner = "Our Route" if our_time < ext_time else "External Service"
        
        return {
            'our_route': {
                'distance_km': our_dist,
                'duration_minutes': our_time
            },
            'external_route': {
                'distance_km': ext_dist,
                'duration_minutes': ext_time,
                'service': external_route.get('service', 'Unknown')
            },
            'comparison': {
                'distance_difference_km': dist_diff,
                'distance_difference_percent': dist_diff_pct,
                'time_difference_minutes': time_diff,
                'time_difference_percent': time_diff_pct,
                'distance_winner': dist_winner,
                'time_winner': time_winner
            },
            'metrics': {
                'distance_improvement': -dist_diff_pct if dist_diff < 0 else dist_diff_pct,
                'time_improvement': -time_diff_pct if time_diff < 0 else time_diff_pct
            }
        }


# Example usage
if __name__ == "__main__":
    # Sample POIs
    sample_pois = [
        {"id": "poi_01", "name": "Royal Palace", "lat": 11.5625, "lng": 104.9310},
        {"id": "poi_02", "name": "Silver Pagoda", "lat": 11.5627, "lng": 104.9312},
        {"id": "poi_03", "name": "National Museum", "lat": 11.5640, "lng": 104.9282},
        {"id": "poi_04", "name": "Independence Monument", "lat": 11.5564, "lng": 104.9312}
    ]
    
    route_order = [0, 1, 2, 3]
    
    # Our route (example)
    our_route = {
        'total_distance_km': 2.5,
        'total_duration_minutes': 45.0,
        'route': route_order
    }
    
    # Compare
    comparator = RouteComparison(use_openrouteservice=True)
    external_route = comparator.get_route_from_service(sample_pois, route_order)
    comparison = comparator.compare_routes(our_route, external_route)
    
    print("Route Comparison:")
    print(json.dumps(comparison, indent=2))

