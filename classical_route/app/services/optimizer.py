import numpy as np
from typing import List, Tuple
from python_tsp.heuristics import solve_tsp_simulated_annealing
from app.models.schemas import Place, RouteSegment, OptimizedRouteResponse
from app.utils.distance import build_distance_matrix, calculate_total_distance


class RouteOptimizer:
    """Service for optimizing routes using ML-based TSP algorithms"""
    
    def __init__(self):
        self.algorithm_name = "Simulated Annealing TSP"
    
    def optimize_route(self, places: List[Place], day: int) -> OptimizedRouteResponse:
        """
        Optimize the route for a list of places using Simulated Annealing TSP algorithm.
        
        Args:
            places: List of Place objects with coordinates
            day: Day number for the trip
        
        Returns:
            OptimizedRouteResponse with ordered places and distances
        
        Raises:
            ValueError: If places list is empty or has only one place
        """
        if not places:
            raise ValueError("Cannot optimize route: places list is empty")
        
        if len(places) == 1:
            # Only one place, no optimization needed
            return self._create_single_place_response(places[0], day)
        
        # Build distance matrix
        distance_matrix = build_distance_matrix(places)
        
        # Solve TSP using simulated annealing
        optimized_indices, total_distance = solve_tsp_simulated_annealing(distance_matrix)
        
        # Convert to list if numpy array
        if isinstance(optimized_indices, np.ndarray):
            optimized_indices = optimized_indices.tolist()
        
        # Build route segments with distances
        route_segments = self._build_route_segments(
            places, 
            optimized_indices, 
            distance_matrix
        )
        
        return OptimizedRouteResponse(
            day=day,
            total_places=len(places),
            total_distance=round(total_distance, 2),
            route=route_segments,
            algorithm=self.algorithm_name
        )
    
    def _build_route_segments(
        self, 
        places: List[Place], 
        optimized_indices: List[int],
        distance_matrix: np.ndarray
    ) -> List[RouteSegment]:
        """
        Build route segments from optimized indices.
        
        Args:
            places: Original list of places
            optimized_indices: Optimized order of place indices
            distance_matrix: Distance matrix between places
        
        Returns:
            List of RouteSegment objects
        """
        route_segments = []
        
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
    
    def _create_single_place_response(
        self, 
        place: Place, 
        day: int
    ) -> OptimizedRouteResponse:
        """
        Create response for single place (no optimization needed).
        
        Args:
            place: The single place
            day: Day number
        
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
            total_distance=0.0,
            route=[segment],
            algorithm=self.algorithm_name
        )


# Create singleton instance
route_optimizer = RouteOptimizer()
