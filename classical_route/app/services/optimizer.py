import numpy as np
import logging
from typing import List
from app.models.schemas import Place, RouteSegment, OptimizedRouteResponse
from app.utils.distance import build_distance_matrix, calculate_total_distance

logger = logging.getLogger(__name__)

class RouteOptimizer:
    """Service for optimizing routes using nearest-neighbor heuristic"""
    
    def __init__(self):
        self.algorithm_name = "Nearest Neighbor TSP"
    
    def optimize_route(self, places: List[Place], day: int, start_lat: float = None, start_lon: float = None) -> OptimizedRouteResponse:
        """
        Optimize the route for a list of places using a nearest-neighbor heuristic.
        
        Args:
            places: List of Place objects with coordinates
            day: Day number for the trip
            start_lat: Starting latitude (user's current location)
            start_lon: Starting longitude (user's current location)
        
        Returns:
            OptimizedRouteResponse with ordered places and distances
        
        Raises:
            ValueError: If places list is empty or has only one place
        """
        if not places:
            raise ValueError("Cannot optimize route: places list is empty")
        
        if len(places) == 1:
            # Only one place, calculate distance from start if provided
            if start_lat is not None and start_lon is not None:
                from app.utils.distance import haversine_distance
                distance_to_place = haversine_distance(start_lat, start_lon, places[0].latitude, places[0].longitude)
                return self._create_single_place_response(places[0], day, distance_to_place)
            return self._create_single_place_response(places[0], day)

        if len(places) == 2:
            distance_matrix = build_distance_matrix(places)
            if not np.isfinite(distance_matrix).all():
                raise ValueError("Cannot optimize route: invalid coordinates produced a non-finite distance matrix")

            optimized_indices = self._nearest_neighbor_route(
                places=places,
                distance_matrix=distance_matrix,
                start_lat=start_lat,
                start_lon=start_lon,
            )
        else:
            # Build distance matrix
            distance_matrix = build_distance_matrix(places)
            distance_matrix = np.asarray(distance_matrix, dtype=float)
            if not np.isfinite(distance_matrix).all():
                raise ValueError("Cannot optimize route: invalid coordinates produced a non-finite distance matrix")
            
            optimized_indices = self._nearest_neighbor_route(
                places=places,
                distance_matrix=distance_matrix,
                start_lat=start_lat,
                start_lon=start_lon,
            )

        # Calculate total distance based on the optimized indices
        total_distance = calculate_total_distance(optimized_indices, distance_matrix)

        # Include distance from starting location to the first place if provided
        if start_lat is not None and start_lon is not None:
            from app.utils.distance import haversine_distance
            first_place = places[optimized_indices[0]]
            total_distance += haversine_distance(start_lat, start_lon, first_place.latitude, first_place.longitude)
        
        # Build route segments with distances
        route_segments = self._build_route_segments(
            places, 
            optimized_indices, 
            distance_matrix,
            start_lat,
            start_lon
        )
        
        return OptimizedRouteResponse(
            day=day,
            total_places=len(places),
            total_distance=round(total_distance, 2),
            starting_location={"latitude": start_lat, "longitude": start_lon} if start_lat is not None and start_lon is not None else None,
            route=route_segments,
            algorithm=self.algorithm_name
        )
    
    def _build_route_segments(
        self, 
        places: List[Place], 
        optimized_indices: List[int],
        distance_matrix: np.ndarray,
        start_lat: float = None,
        start_lon: float = None
    ) -> List[RouteSegment]:
        """
        Build route segments from optimized indices.
        
        Args:
            places: Original list of places
            optimized_indices: Optimized order of place indices
            distance_matrix: Distance matrix between places
            start_lat: Starting latitude (user's location)
            start_lon: Starting longitude (user's location)
        
        Returns:
            List of RouteSegment objects
        """
        route_segments = []
        
        # Add distance from starting point to first place if provided
        if start_lat is not None and start_lon is not None and len(optimized_indices) > 0:
            from app.utils.distance import haversine_distance
            first_place = places[optimized_indices[0]]
            distance_from_start = round(haversine_distance(start_lat, start_lon, first_place.latitude, first_place.longitude), 2)
            
            # First segment includes distance from starting point
            segment = RouteSegment(
                place=first_place,
                order=0,
                distance_to_next=distance_from_start
            )
            route_segments.append(segment)
            
            # Continue with rest of the places
            for order in range(1, len(optimized_indices)):
                place_idx = optimized_indices[order]
                place = places[place_idx]
                
                # Calculate distance to next place
                distance_to_next = None
                if order < len(optimized_indices) - 1:
                    next_place_idx = optimized_indices[order + 1]
                    distance_to_next = round(distance_matrix[place_idx][next_place_idx], 2)
                
                segment = RouteSegment(
                    place=place,
                    order=order,
                    distance_to_next=distance_to_next
                )
                route_segments.append(segment)
        else:
            # No starting location, use original logic
            for order, place_idx in enumerate(optimized_indices):
                place = places[place_idx]
                
                # Calculate distance to next place
                distance_to_next = None
                if order < len(optimized_indices) - 1:
                    next_place_idx = optimized_indices[order + 1]
                    distance_to_next = round(distance_matrix[place_idx][next_place_idx], 2)
                
                segment = RouteSegment(
                    place=place,
                    order=order,
                    distance_to_next=distance_to_next
                )
                route_segments.append(segment)
        
        return route_segments
    
    def _nearest_neighbor_route(
        self,
        places: List[Place],
        distance_matrix: np.ndarray,
        start_lat: float = None,
        start_lon: float = None,
    ) -> List[int]:
        """
        Generate a route using the nearest-neighbor heuristic.
        
        Starts from the closest place to the user's starting location (if provided),
        then repeatedly visits the nearest unvisited place.
        """
        if distance_matrix.shape[0] == 0:
            return []

        unvisited = set(range(len(places)))
        route = []

        # Choose starting node: closest to user if provided, otherwise first place
        if start_lat is not None and start_lon is not None:
            from app.utils.distance import haversine_distance
            start_idx = min(
                unvisited,
                key=lambda idx: haversine_distance(
                    start_lat, start_lon, places[idx].latitude, places[idx].longitude
                ),
            )
        else:
            start_idx = 0

        current = start_idx
        route.append(current)
        unvisited.remove(current)

        # Greedily pick the nearest unvisited place
        while unvisited:
            next_idx = min(unvisited, key=lambda idx: distance_matrix[current][idx])
            route.append(next_idx)
            unvisited.remove(next_idx)
            current = next_idx

        return route
    
    def _create_single_place_response(
        self, 
        place: Place, 
        day: int,
        distance_from_start: float = 0.0
    ) -> OptimizedRouteResponse:
        """
        Create response for single place (no optimization needed).
        
        Args:
            place: The single place
            day: Day number
            distance_from_start: Distance from starting location
        
        Returns:
            OptimizedRouteResponse with single place
        """
        segment = RouteSegment(
            place=place,
            order=0,
            distance_to_next=None
        )
        
        return OptimizedRouteResponse(
            day=day,
            total_places=1,
            total_distance=round(distance_from_start, 2),
            starting_location=None,
            route=[segment],
            algorithm=self.algorithm_name
        )


# Create singleton instance
route_optimizer = RouteOptimizer()
