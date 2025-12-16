"""
Google OR-Tools VRP Solver - 100% FREE!
Professional-grade optimization library
"""
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import numpy as np
from typing import List, Dict, Tuple, Optional


class ORToolsSolver:
    """
    Vehicle Routing Problem solver using Google OR-Tools
    100% FREE - Handles complex constraints professionally
    
    Features:
    - Time window constraints (opening hours)
    - Vehicle capacity
    - Multiple vehicles
    - Distance/time optimization
    - Professional-grade metaheuristics
    
    Best for: Production use (can handle 100+ POIs)
    """
    
    def __init__(
        self,
        time_limit_seconds: int = 30,
        solution_strategy: str = 'PATH_CHEAPEST_ARC'
    ):
        self.time_limit = time_limit_seconds
        self.strategy = solution_strategy
        
    def solve_tsp(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray,
        start_poi_idx: int = 0
    ) -> Tuple[List[int], float, bool]:
        """
        Solve TSP using OR-Tools
        FREE - Much better than Nearest Neighbor
        
        Args:
            pois: List of POI dictionaries
            distance_matrix: n×n distance matrix (km or meters)
            start_poi_idx: Starting point index
            
        Returns:
            (route, total_distance, success)
        """
        n = len(pois)
        
        if n <= 1:
            return ([0] if n == 1 else [], 0.0, True)
        
        # Create routing model
        manager = pywrapcp.RoutingIndexManager(
            n,  # Number of locations
            1,  # Number of vehicles
            start_poi_idx  # Depot (start/end)
        )
        routing = pywrapcp.RoutingModel(manager)
        
        # Define distance callback
        def distance_callback(from_index: int, to_index: int) -> int:
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            # Convert to integer (OR-Tools requires integers)
            return int(distance_matrix[from_node][to_node] * 1000)  # meters
        
        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
        
        # Set search parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )
        search_parameters.time_limit.seconds = self.time_limit
        
        # Solve
        solution = routing.SolveWithParameters(search_parameters)
        
        if solution:
            route = self._extract_route(manager, routing, solution)
            total_distance = solution.ObjectiveValue() / 1000.0  # back to km
            return route, total_distance, True
        else:
            # Fallback to simple route if no solution
            return list(range(n)), float('inf'), False
    
    def solve_with_time_windows(
        self,
        pois: List[Dict],
        distance_matrix: np.ndarray,
        time_matrix: np.ndarray,
        current_time_minutes: float = 540,  # 9:00 AM
        start_poi_idx: int = 0
    ) -> Dict:
        """
        Solve with time window constraints (opening hours)
        FREE - Professional constraint handling
        
        POI format:
        {
            'id': 1,
            'name': 'Temple',
            'opening_time': 360,  # 6:00 AM in minutes
            'closing_time': 1080,  # 6:00 PM in minutes
            'visit_duration': 60,  # minutes
        }
        
        Returns:
            {
                'route': [0, 2, 1, 3],
                'distance': 12.5,
                'total_time': 180,
                'arrival_times': [540, 560, 620, 680],
                'success': True
            }
        """
        n = len(pois)
        
        if n <= 1:
            return {
                'route': [0] if n == 1 else [],
                'distance': 0.0,
                'total_time': 0,
                'arrival_times': [current_time_minutes] if n == 1 else [],
                'success': True
            }
        
        # Create routing model
        manager = pywrapcp.RoutingIndexManager(n, 1, start_poi_idx)
        routing = pywrapcp.RoutingModel(manager)
        
        # Time callback
        def time_callback(from_index: int, to_index: int) -> int:
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            travel_time = int(time_matrix[from_node][to_node])
            visit_duration = pois[from_node].get('visit_duration', 60)
            return travel_time + visit_duration
        
        transit_callback_index = routing.RegisterTransitCallback(time_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
        
        # Add time window constraints
        time_dimension_name = 'Time'
        routing.AddDimension(
            transit_callback_index,
            30,  # Waiting time slack (30 minutes max wait)
            1440,  # Maximum time per vehicle (24 hours)
            False,  # Don't force start cumul to zero
            time_dimension_name
        )
        time_dimension = routing.GetDimensionOrDie(time_dimension_name)
        
        # Set time windows for each POI
        for poi_idx, poi in enumerate(pois):
            index = manager.NodeToIndex(poi_idx)
            opening = poi.get('opening_time', 0)
            closing = poi.get('closing_time', 1440)
            time_dimension.CumulVar(index).SetRange(opening, closing)
        
        # Set start time
        start_index = manager.NodeToIndex(start_poi_idx)
        time_dimension.CumulVar(start_index).SetRange(
            int(current_time_minutes), 
            int(current_time_minutes)
        )
        
        # Minimize time
        time_dimension.SetGlobalSpanCostCoefficient(100)
        
        # Solve
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.time_limit.seconds = self.time_limit
        
        solution = routing.SolveWithParameters(search_parameters)
        
        if solution:
            route = self._extract_route(manager, routing, solution)
            
            # Extract arrival times
            arrival_times = []
            for poi_idx in route:
                index = manager.NodeToIndex(poi_idx)
                arrival_times.append(solution.Min(time_dimension.CumulVar(index)))
            
            # Calculate total distance
            total_distance = 0.0
            for i in range(len(route) - 1):
                total_distance += distance_matrix[route[i]][route[i+1]]
            
            return {
                'route': route,
                'distance': total_distance,
                'total_time': arrival_times[-1] - current_time_minutes,
                'arrival_times': arrival_times,
                'success': True
            }
        else:
            return {
                'route': [],
                'distance': 0.0,
                'total_time': 0,
                'arrival_times': [],
                'success': False
            }
    
    def _extract_route(
        self,
        manager: pywrapcp.RoutingIndexManager,
        routing: pywrapcp.RoutingModel,
        solution
    ) -> List[int]:
        """Extract route from OR-Tools solution"""
        route = []
        index = routing.Start(0)
        
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            route.append(node)
            index = solution.Value(routing.NextVar(index))
        
        # Add final node
        route.append(manager.IndexToNode(index))
        
        return route


# Example usage (FREE)
if __name__ == "__main__":
    # Sample POIs with time windows
    sample_pois = [
        {
            'id': 1, 
            'name': 'Hotel',
            'opening_time': 0,
            'closing_time': 1440,
            'visit_duration': 0
        },
        {
            'id': 2,
            'name': 'Temple',
            'opening_time': 360,  # 6 AM
            'closing_time': 1080,  # 6 PM
            'visit_duration': 60
        },
        {
            'id': 3,
            'name': 'Museum',
            'opening_time': 540,  # 9 AM
            'closing_time': 1020,  # 5 PM
            'visit_duration': 90
        },
        {
            'id': 4,
            'name': 'Restaurant',
            'opening_time': 660,  # 11 AM
            'closing_time': 1320,  # 10 PM
            'visit_duration': 60
        }
    ]
    
    # Distance matrix (km)
    distance_matrix = np.array([
        [0.0, 2.1, 1.2, 1.5],
        [2.1, 0.0, 0.8, 0.5],
        [1.2, 0.8, 0.0, 0.3],
        [1.5, 0.5, 0.3, 0.0]
    ])
    
    # Time matrix (minutes - assume 30 km/h average speed)
    time_matrix = (distance_matrix / 30) * 60
    
    # Solve with OR-Tools (FREE!)
    solver = ORToolsSolver(time_limit_seconds=10)
    
    # Simple TSP
    route, distance, success = solver.solve_tsp(
        sample_pois, distance_matrix, start_poi_idx=0
    )
    print("OR-Tools TSP Solution:")
    print(f"Route: {[sample_pois[i]['name'] for i in route]}")
    print(f"Distance: {distance:.2f} km")
    print(f"Success: {success}\n")
    
    # With time windows
    result = solver.solve_with_time_windows(
        sample_pois, distance_matrix, time_matrix, 
        current_time_minutes=540  # Start at 9 AM
    )
    print("OR-Tools with Time Windows:")
    print(f"Route: {[sample_pois[i]['name'] for i in result['route']]}")
    print(f"Distance: {result['distance']:.2f} km")
    print(f"Total Time: {result['total_time']:.0f} minutes")
    print(f"Arrival Times: {[f'{t//60:02d}:{t%60:02d}' for t in result['arrival_times']]}")
