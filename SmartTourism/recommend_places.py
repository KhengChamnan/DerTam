"""
Main Recommendation Module

This module provides a unified interface for place recommendations,
supporting both cold-start users (via preferences) and existing users
(via place-based recommendations).
"""

from cbf_recommender import CBFRecommender, load_recommender
from user_onboarding import UserOnboarding, collect_preferences_interactive
import pandas as pd
from typing import Dict, Any, Optional, Union


class PlaceRecommendationSystem:
    """Main recommendation system that handles both cold-start and place-based recommendations"""
    
    def __init__(self, model_path: str = 'cbf_model.pkl'):
        """
        Initialize the recommendation system
        
        Args:
            model_path: Path to the CBF model file
        """
        self.recommender = load_recommender(model_path)
        self.onboarding = self.recommender.onboarding
    
    def get_recommendations(
        self,
        user_input: Union[str, Dict[str, Any], None] = None,
        top_n: int = 10,
        min_similarity: float = 0.0,
        use_defaults: bool = True
    ) -> pd.DataFrame:
        """
        Get recommendations based on user input
        
        Args:
            user_input: Can be:
                - None: Use default preferences (for cold-start)
                - str: Place name (for place-based recommendations)
                - dict: User preferences (for cold-start with preferences)
            top_n: Number of recommendations to return
            min_similarity: Minimum similarity threshold
            use_defaults: If True and user_input is None, use default preferences
            
        Returns:
            DataFrame with recommendations
        """
        if user_input is None:
            if use_defaults:
                # Use default preferences for cold-start
                preferences = self.onboarding.get_default_preferences()
                return self.recommender.get_recommendations_for_new_user(
                    preferences, top_n, min_similarity
                )
            else:
                raise ValueError("user_input cannot be None when use_defaults=False")
        
        # Delegate to recommender
        result = self.recommender.get_recommendations(user_input, top_n, min_similarity)
        
        if isinstance(result, str):
            # Error message
            raise ValueError(result)
        
        return result
    
    def get_onboarding_questions(self) -> Dict[str, Any]:
        """
        Get the onboarding questionnaire structure
        
        Returns:
            Dictionary containing question definitions
        """
        return self.onboarding.get_questionnaire_structure()
    
    def create_preferences_from_answers(
        self,
        categories: Optional[list] = None,
        subcategories: Optional[list] = None,
        min_rating: float = 4.0,
        popularity_preference: str = "balanced",
        provinces: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Create user preferences from onboarding answers
        
        Args:
            categories: List of category IDs (optional, deprecated for Tourist Attractions)
            subcategories: List of tourist attraction subcategory IDs (e.g., ["temples", "museums"])
            min_rating: Minimum rating preference
            popularity_preference: 'popular', 'hidden_gems', or 'balanced'
            provinces: Optional list of province names
            
        Returns:
            User preferences dictionary
        """
        return self.onboarding.create_user_preferences(
            categories=categories,
            subcategories=subcategories,
            min_rating=min_rating,
            popularity_preference=popularity_preference,
            provinces=provinces
        )
    
    def get_default_preferences(self) -> Dict[str, Any]:
        """
        Get default preferences for users who skip onboarding
        
        Returns:
            Dictionary with default preferences
        """
        return self.onboarding.get_default_preferences()


def recommend_for_new_user(
    preferences: Optional[Dict[str, Any]] = None,
    top_n: int = 10
) -> pd.DataFrame:
    """
    Convenience function to get recommendations for a new user
    
    Args:
        preferences: User preferences dictionary (uses defaults if None)
        top_n: Number of recommendations
        
    Returns:
        DataFrame with recommendations
    """
    system = PlaceRecommendationSystem()
    
    if preferences is None:
        preferences = system.get_default_preferences()
    
    return system.recommender.get_recommendations_for_new_user(preferences, top_n)


def recommend_for_place(
    place_name: str,
    top_n: int = 10,
    preferences: Optional[Dict[str, Any]] = None
) -> pd.DataFrame:
    """
    Convenience function to get recommendations based on a place
    
    Args:
        place_name: Name of the place
        top_n: Number of recommendations
        preferences: Optional user preferences to filter results
        
    Returns:
        DataFrame with recommendations
    """
    system = PlaceRecommendationSystem()
    result = system.recommender.get_recommendations_for_place(
        place_name, top_n, preferences=preferences
    )
    
    if isinstance(result, str):
        raise ValueError(result)
    
    return result


if __name__ == "__main__":
    print("=" * 60)
    print("PLACE RECOMMENDATION SYSTEM")
    print("=" * 60)
    
    # Initialize system
    system = PlaceRecommendationSystem()
    
    # Example 1: Cold-start with default preferences
    print("\n[Example 1] Recommendations for new user (default preferences):")
    default_recs = recommend_for_new_user()
    print(default_recs.head(5).to_string(index=False))
    
    # Example 2: Cold-start with custom preferences
    print("\n[Example 2] Recommendations for user who likes Tourist Attractions:")
    custom_prefs = system.create_preferences_from_answers(
        categories=[1],  # Tourist Attractions only
        min_rating=4.5,
        popularity_preference='popular'
    )
    custom_recs = recommend_for_new_user(custom_prefs, top_n=5)
    print(custom_recs.to_string(index=False))
    
    # Example 3: Place-based recommendation
    print("\n[Example 3] Similar places to 'Royal Palace of Cambodia':")
    try:
        place_recs = recommend_for_place('Royal Palace of Cambodia', top_n=3)
        print(place_recs.to_string(index=False))
    except ValueError as e:
        print(f"Error: {e}")
    
    print("\n" + "=" * 60)
    print("To collect user preferences interactively, run:")
    print("  python user_onboarding.py")
    print("=" * 60)
