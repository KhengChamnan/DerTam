"""
Place Recommendation System Package

This package contains modules for:
- Data loading and preprocessing
- User profile creation
- Content-Based Filtering (CBF)
- Collaborative Filtering (CF)
- Main recommendation system
"""

__version__ = "1.0.0"

## from .system import PlaceRecommendationSystem, OnboardingSystem  # Removed, file does not exist
from .recommender import PlaceRecommender
from .cbf_recommender import CBFRecommender
from .cf_recommender import CFRecommender
from .data_loader import load_places_dataset, preprocess_places_data
from .user_profile import create_preferences_from_answers, filter_places_by_preferences

__all__ = [
    'PlaceRecommender',
    'CBFRecommender',
    'CFRecommender',
    'load_places_dataset',
    'preprocess_places_data',
    'create_preferences_from_answers',
    'filter_places_by_preferences'
]
