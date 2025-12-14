import math
import numpy as np
from typing import List
from app.models.schemas import Place


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth using Haversine formula.
    
    Args:
        lat1: Latitude of first point in degrees
        lon1: Longitude of first point in degrees
        lat2: Latitude of second point in degrees
        lon2: Longitude of second point in degrees
    
    Returns:
        Distance in kilometers
    """
    # Earth's radius in kilometers
    R = 6371.0
    
    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Calculate differences
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Haversine formula
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance


def build_distance_matrix(places: List[Place]) -> np.ndarray:
    """
    Build a distance matrix from a list of places using Haversine distance.
    
    Args:
        places: List of Place objects with latitude and longitude
    
    Returns:
        2D numpy array where element [i][j] is the distance from place i to place j
    """
    n = len(places)
    distance_matrix = np.zeros((n, n))
    
    for i in range(n):
        for j in range(n):
            if i != j:
                distance = haversine_distance(
                    places[i].latitude,
                    places[i].longitude,
                    places[j].latitude,
                    places[j].longitude
                )
                distance_matrix[i][j] = distance
            else:
                distance_matrix[i][j] = 0.0
    
    return distance_matrix


def calculate_total_distance(route_indices: List[int], distance_matrix: np.ndarray) -> float:
    """
    Calculate the total distance for a given route.
    
    Args:
        route_indices: List of place indices in route order
        distance_matrix: Distance matrix between all places
    
    Returns:
        Total distance in kilometers
    """
    total = 0.0
    for i in range(len(route_indices) - 1):
        total += distance_matrix[route_indices[i]][route_indices[i + 1]]
    return total
