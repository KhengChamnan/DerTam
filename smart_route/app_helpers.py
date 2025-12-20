"""
Helper functions for Streamlit app
Utility functions for data loading, matrix calculations, and common operations
"""
import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from utils.distance_calculator import DistanceCalculator
from classical_optimizer.feature_engineer import FeatureEngineer


def load_pois_data(province: str = "phnompenh") -> List[Dict]:
    """Load POIs data from JSON file"""
    from utils.json_data_manager import JSONDataManager
    
    data_manager = JSONDataManager()
    pois_data = data_manager.load_pois(province)
    
    if not pois_data:
        # Try loading from file directly
        base_path = Path(__file__).parent
        poi_file = base_path / "data" / "pois" / f"{province}_pois.json"
        if poi_file.exists():
            with open(poi_file, 'r') as f:
                data = json.load(f)
                pois_data = data.get('pois', [])
    
    return pois_data


def get_traffic_data_path() -> Optional[str]:
    """Get path to traffic data file"""
    base_path = Path(__file__).parent
    traffic_path = base_path / "data" / "traffic" / "phnompenh_traffic.json"
    return str(traffic_path) if traffic_path.exists() else None


def calculate_matrices(pois: List[Dict]) -> Tuple[DistanceCalculator, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Calculate distance, time, and traffic penalty matrices
    
    Returns:
        (distance_calc, distance_matrix, time_matrix_with_traffic, traffic_penalty, time_matrix_without_traffic)
    """
    distance_calc = DistanceCalculator(traffic_data_path=get_traffic_data_path())
    distance_matrix = distance_calc.calculate_distance_matrix(pois)
    time_matrix_with_traffic = distance_calc.calculate_time_matrix(distance_matrix, pois, apply_traffic=True)
    time_matrix_without_traffic = distance_calc.calculate_time_matrix(distance_matrix, pois, apply_traffic=False)
    traffic_penalty = distance_calc.get_traffic_penalty_matrix(pois, distance_matrix)
    
    return distance_calc, distance_matrix, time_matrix_with_traffic, traffic_penalty, time_matrix_without_traffic


def create_feature_matrix(
    pois: List[Dict],
    user_preferences: Dict,
    distance_calc: DistanceCalculator
) -> Tuple[np.ndarray, Dict]:
    """Create feature matrix from POIs and user preferences"""
    feature_engineer = FeatureEngineer(distance_calc)
    start_lat = user_preferences['start_lat']
    start_lon = user_preferences['start_lon']
    
    return feature_engineer.create_feature_matrix(pois, user_preferences, start_lat, start_lon)


def prepare_data_for_classical(pois: List[Dict], user_preferences: Dict, 
                                distance_matrix: np.ndarray, time_matrix: np.ndarray) -> Dict:
    """Prepare data dictionary for classical optimizer"""
    return {
        'pois': pois,
        'distance_matrix': distance_matrix,
        'time_matrix': time_matrix,
        'user_preferences': user_preferences
    }


def time_string_to_minutes(time_str: str) -> int:
    """Convert time string (HH:MM:SS) to minutes since midnight"""
    try:
        parts = time_str.split(':')
        hours = int(parts[0])
        minutes = int(parts[1]) if len(parts) > 1 else 0
        return hours * 60 + minutes
    except (ValueError, IndexError):
        return 480  # Default to 8 AM


def validate_poi_selection(selected_pois: List[Dict], min_pois: int = 2, max_pois: int = 8) -> Tuple[bool, Optional[str]]:
    """Validate POI selection"""
    if not selected_pois:
        return False, "Please select POIs in the sidebar first!"
    
    if len(selected_pois) < min_pois:
        return False, f"Please select at least {min_pois} POIs (maximum {max_pois})"
    
    if len(selected_pois) > max_pois:
        return False, f"Maximum {max_pois} POIs allowed"
    
    return True, None


def calculate_minimum_required_distance(selected_pois: List[Dict], start_lat: float, start_lon: float) -> float:
    """
    Calculate minimum required distance to include all selected POIs
    
    Args:
        selected_pois: List of selected POI dictionaries
        start_lat: Starting latitude
        start_lon: Starting longitude
        
    Returns:
        Minimum required distance in kilometers
    """
    if not selected_pois:
        return 0.0
    
    distance_calc = DistanceCalculator()
    distances = distance_calc.calculate_distance_from_start(start_lat, start_lon, selected_pois)
    
    if not distances:
        return 0.0
    
    # Return the maximum distance needed (with some buffer)
    max_distance = max(distances)
    # Add 10% buffer to ensure all POIs are included
    return max_distance * 1.1

