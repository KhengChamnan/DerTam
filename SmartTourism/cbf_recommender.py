"""
Enhanced CBF Recommendation Module

This module provides content-based filtering recommendations that work
with user preferences collected during onboarding for cold-start users.
"""

import pandas as pd
import numpy as np
import pickle
from typing import Dict, List, Optional, Any, Union
from sklearn.metrics.pairwise import cosine_similarity
from user_onboarding import UserOnboarding


class CBFRecommender:
    """Content-Based Filtering Recommender with user preference support"""
    
    def __init__(self, model_path: str = 'cbf_model.pkl'):
        """
        Initialize the CBF recommender
        
        Args:
            model_path: Path to the saved CBF model pickle file
        """
        self.model_path = model_path
        self.model_package = None
        self.onboarding = None
        self._load_model()
    
    def _load_model(self):
        """Load the trained CBF model"""
        try:
            with open(self.model_path, 'rb') as f:
                self.model_package = pickle.load(f)
            
            # Initialize onboarding with places data
            if 'places_data' in self.model_package:
                self.onboarding = UserOnboarding(self.model_package['places_data'])
            else:
                # Try to load from CSV if not in model
                try:
                    places_data = pd.read_csv('clean_place_for_ml.csv', encoding='latin1')
                    self.onboarding = UserOnboarding(places_data)
                except FileNotFoundError:
                    self.onboarding = UserOnboarding()
            
            print(f"✓ CBF Model loaded successfully")
            print(f"  Model type: {self.model_package['metadata']['model_type']}")
            print(f"  Training date: {self.model_package['metadata']['training_date']}")
            print(f"  Total places: {self.model_package['metadata']['n_places']}")
        except FileNotFoundError:
            raise FileNotFoundError(f"Model file not found: {self.model_path}")
        except Exception as e:
            raise Exception(f"Error loading model: {str(e)}")
    
    def filter_places_by_preferences(
        self,
        preferences: Dict[str, Any],
        places_data: Optional[pd.DataFrame] = None
    ) -> pd.DataFrame:
        """
        Filter places based on user preferences
        
        Args:
            preferences: User preferences dictionary
            places_data: Optional places DataFrame (uses model data if not provided)
            
        Returns:
            Filtered DataFrame
        """
        if places_data is None:
            places_data = self.model_package['places_data'].copy()
        else:
            places_data = places_data.copy()
        
        # Filter by categories
        if preferences.get('categories'):
            places_data = places_data[places_data['category_id'].isin(preferences['categories'])]
        
        # Filter by subcategories (for Tourist Attractions)
        if preferences.get('subcategories') and self.onboarding:
            subcategories = preferences['subcategories']
            subcat_defs = self.onboarding.TOURIST_ATTRACTION_SUBCATEGORIES
            
            # Only apply subcategory filtering to Tourist Attractions (category_id == 1)
            tourist_attractions_mask = places_data['category_id'] == 1
            
            # Build a mask for matching subcategories
            subcategory_match_mask = pd.Series(False, index=places_data.index)
            
            # For each selected subcategory, find matching places
            for subcat_id in subcategories:
                if subcat_id in subcat_defs:
                    subcat = subcat_defs[subcat_id]
                    keywords = subcat.get('keywords', [])
                    
                    if subcat_id == 'other_attractions':
                        # For "other", match places that don't match any other subcategory
                        # First, get all keywords from other subcategories
                        all_other_keywords = []
                        for other_subcat_id, other_subcat in subcat_defs.items():
                            if other_subcat_id != 'other_attractions':
                                all_other_keywords.extend(other_subcat.get('keywords', []))
                        
                        # Match tourist attractions that don't contain any of the other keywords
                        if all_other_keywords:
                            ta_names = places_data.loc[tourist_attractions_mask, 'name'].str.lower()
                            other_mask = pd.Series(True, index=places_data.loc[tourist_attractions_mask].index)
                            for keyword in all_other_keywords:
                                other_mask = other_mask & ~ta_names.str.contains(
                                    keyword.lower(), na=False, regex=False
                                )
                            subcategory_match_mask[other_mask.index] = subcategory_match_mask[other_mask.index] | other_mask
                        else:
                            # If no keywords defined, match all tourist attractions
                            subcategory_match_mask[tourist_attractions_mask] = True
                    else:
                        # Match tourist attractions that contain any of the keywords
                        if keywords:
                            ta_names = places_data.loc[tourist_attractions_mask, 'name'].str.lower()
                            keyword_mask = pd.Series(False, index=places_data.loc[tourist_attractions_mask].index)
                            for keyword in keywords:
                                keyword_mask = keyword_mask | ta_names.str.contains(
                                    keyword.lower(), na=False, regex=False
                                )
                            subcategory_match_mask[keyword_mask.index] = subcategory_match_mask[keyword_mask.index] | keyword_mask
            
            # Keep non-tourist attractions (they pass through)
            # Only filter tourist attractions by subcategory
            final_mask = ~tourist_attractions_mask | subcategory_match_mask
            places_data = places_data[final_mask]
        
        # Filter by minimum rating
        min_rating = preferences.get('min_rating', 0.0)
        places_data = places_data[places_data['ratings'] >= min_rating]
        
        # Filter by provinces (if specified)
        if preferences.get('province_ids'):
            places_data = places_data[places_data['province_id'].isin(preferences['province_ids'])]
        
        return places_data
    
    def create_user_profile_vector(
        self,
        preferences: Dict[str, Any],
        places_data: Optional[pd.DataFrame] = None
    ) -> np.ndarray:
        """
        Create a user profile vector from preferences that matches CBF feature space
        
        Args:
            preferences: User preferences dictionary
            places_data: Optional places DataFrame (uses model data if not provided)
            
        Returns:
            User profile vector (numpy array) matching the feature space
        """
        if places_data is None:
            places_data = self.model_package['places_data']
        
        # Filter places by preferences
        filtered_places = self.filter_places_by_preferences(preferences, places_data)
        
        if len(filtered_places) == 0:
            # If no places match, use defaults
            filtered_places = places_data
        
        # Get feature columns
        feature_cols = self.model_package['feature_columns']
        
        # Calculate average values for selected categories
        user_profile = {}
        
        # Category: Use average of selected categories
        if preferences.get('categories'):
            avg_category = np.mean(preferences['categories'])
        else:
            avg_category = filtered_places['category_id'].mean()
        user_profile['category_id'] = avg_category
        
        # Rating: Use minimum rating preference
        user_profile['ratings'] = preferences.get('min_rating', filtered_places['ratings'].mean())
        
        # Reviews count: Based on popularity preference
        popularity_pref = preferences.get('popularity_preference', 'balanced')
        if popularity_pref == 'popular':
            # Prefer places with high review counts
            user_profile['reviews_count'] = filtered_places['reviews_count'].quantile(0.75)
        elif popularity_pref == 'hidden_gems':
            # Prefer places with low review counts
            user_profile['reviews_count'] = filtered_places['reviews_count'].quantile(0.25)
        else:  # balanced
            # Use median
            user_profile['reviews_count'] = filtered_places['reviews_count'].median()
        
        # Create vector in same order as feature columns
        profile_vector = np.array([
            user_profile[col] for col in feature_cols
        ]).reshape(1, -1)
        
        # Scale using the same scaler from training
        scaler = self.model_package['scaler']
        profile_vector_scaled = scaler.transform(profile_vector)
        
        return profile_vector_scaled
    
    def get_recommendations_for_new_user(
        self,
        preferences: Dict[str, Any],
        top_n: int = 10,
        min_similarity: float = 0.0
    ) -> pd.DataFrame:
        """
        Get recommendations for a new user based on their preferences (cold-start)
        
        Args:
            preferences: User preferences dictionary from onboarding
            top_n: Number of recommendations to return
            min_similarity: Minimum similarity threshold
            
        Returns:
            DataFrame with recommendations
        """
        # Validate preferences
        if self.onboarding:
            is_valid, error = self.onboarding.validate_preferences(preferences)
            if not is_valid:
                raise ValueError(f"Invalid preferences: {error}")
        
        # Create user profile vector
        user_profile = self.create_user_profile_vector(preferences)
        
        # Get filtered places
        filtered_places = self.filter_places_by_preferences(preferences)
        
        if len(filtered_places) == 0:
            # Fallback to all places if filtering too restrictive
            filtered_places = self.model_package['places_data'].copy()
        
        # Get feature data for filtered places
        feature_data = self.model_package['feature_data']
        
        # Get unique place names from filtered places
        unique_place_names = filtered_places['name'].unique()
        
        # Filter feature data using isin to avoid reindexing issues with duplicates
        filtered_feature_data = feature_data[feature_data.index.isin(unique_place_names)]
        
        if len(filtered_feature_data) == 0:
            # If no feature data matches, return empty recommendations
            return pd.DataFrame(columns=['name', 'province_name', 'category_name', 'ratings', 
                                        'reviews_count', 'similarity_score'])
        
        # Compute cosine similarity between user profile and all filtered places
        similarities = cosine_similarity(user_profile, filtered_feature_data.values)[0]
        
        # Create similarity series with unique place names as index
        similarity_series = pd.Series(
            similarities,
            index=filtered_feature_data.index,
            name='similarity_score'
        )
        
        # Sort by similarity
        similarity_series = similarity_series.sort_values(ascending=False)
        
        # Apply minimum similarity threshold
        similarity_series = similarity_series[similarity_series >= min_similarity]
        
        # Get top N (handle duplicates in index by keeping first)
        top_places = similarity_series.head(top_n)
        top_places = top_places[~top_places.index.duplicated(keep='first')]
        
        # Get full place information - merge with filtered_places to get all columns
        # First, get unique place names from top_places
        top_place_names = top_places.index.tolist()
        
        # Filter filtered_places to only include top places
        recommendations = filtered_places[
            filtered_places['name'].isin(top_place_names)
        ].copy()
        
        # Add similarity scores - map from top_places series
        recommendations['similarity_score'] = recommendations['name'].map(top_places)
        
        # Remove rows where similarity_score is NaN (shouldn't happen, but safety check)
        recommendations = recommendations.dropna(subset=['similarity_score'])
        
        # Sort by similarity
        recommendations = recommendations.sort_values('similarity_score', ascending=False)
        
        # Remove duplicates (keep first occurrence of each place name)
        recommendations = recommendations.drop_duplicates(subset='name', keep='first')
        
        return recommendations[['name', 'province_name', 'category_name', 'ratings', 
                               'reviews_count', 'similarity_score']]
    
    def get_recommendations_for_place(
        self,
        place_name: str,
        top_n: int = 10,
        min_similarity: float = 0.0,
        preferences: Optional[Dict[str, Any]] = None
    ) -> Union[pd.DataFrame, str]:
        """
        Get recommendations based on a specific place (existing functionality)
        Optionally filter by user preferences
        
        Args:
            place_name: Name of the place to get recommendations for
            top_n: Number of recommendations to return
            min_similarity: Minimum similarity threshold
            preferences: Optional user preferences to filter results
            
        Returns:
            DataFrame with recommendations or error message
        """
        sim_matrix = self.model_package['similarity_matrix']
        places_data = self.model_package['places_data']
        
        if place_name not in sim_matrix.index:
            return f"Place '{place_name}' not found in dataset"
        
        # Get similarity scores
        matching_indices = sim_matrix.index[sim_matrix.index == place_name]
        if len(matching_indices) > 0:
            sim_scores = sim_matrix.loc[matching_indices[0], :]
        else:
            return f"Place '{place_name}' not found in dataset"
        
        # Ensure we have a Series
        if isinstance(sim_scores, pd.DataFrame):
            sim_scores = sim_scores.iloc[0]
        
        # Sort and filter
        sim_scores = sim_scores.sort_values(ascending=False)
        sim_scores = sim_scores[sim_scores > min_similarity]
        sim_scores = sim_scores[sim_scores.index != place_name]
        
        # Apply preference filtering if provided
        if preferences:
            filtered_places = self.filter_places_by_preferences(preferences, places_data)
            valid_place_names = set(filtered_places['name'].values)
            sim_scores = sim_scores[sim_scores.index.isin(valid_place_names)]
        
        # Get top N
        top_places = sim_scores.head(top_n)
        top_places_unique = top_places[~top_places.index.duplicated(keep='first')]
        
        # Get recommendations
        recommendations = places_data[places_data['name'].isin(top_places_unique.index)].copy()
        recommendations['similarity_score'] = recommendations['name'].map(top_places_unique)
        recommendations = recommendations.sort_values('similarity_score', ascending=False)
        
        return recommendations[['name', 'province_name', 'category_name', 'ratings', 
                              'reviews_count', 'similarity_score']]
    
    def get_recommendations(
        self,
        user_input: Union[str, Dict[str, Any]],
        top_n: int = 10,
        min_similarity: float = 0.0
    ) -> Union[pd.DataFrame, str]:
        """
        Universal recommendation function that handles both place-based and preference-based recommendations
        
        Args:
            user_input: Either a place name (str) or user preferences (dict)
            top_n: Number of recommendations to return
            min_similarity: Minimum similarity threshold
            
        Returns:
            DataFrame with recommendations or error message
        """
        if isinstance(user_input, str):
            # Place-based recommendation
            return self.get_recommendations_for_place(user_input, top_n, min_similarity)
        elif isinstance(user_input, dict):
            # Preference-based recommendation (cold-start)
            return self.get_recommendations_for_new_user(user_input, top_n, min_similarity)
        else:
            return "Invalid input: Expected place name (str) or preferences (dict)"


def load_recommender(model_path: str = 'cbf_model.pkl') -> CBFRecommender:
    """
    Convenience function to load and return a CBFRecommender instance
    
    Args:
        model_path: Path to the CBF model file
        
    Returns:
        CBFRecommender instance
    """
    return CBFRecommender(model_path)


if __name__ == "__main__":
    # Test the recommender
    print("=" * 60)
    print("Testing CBF Recommender with User Preferences")
    print("=" * 60)
    
    # Load recommender
    recommender = load_recommender()
    
    # Test with default preferences
    print("\n[Test 1] Recommendations with default preferences:")
    default_prefs = recommender.onboarding.get_default_preferences()
    recs = recommender.get_recommendations_for_new_user(default_prefs, top_n=5)
    print(recs.to_string(index=False))
    
    # Test with custom preferences
    print("\n[Test 2] Recommendations for user who likes Tourist Attractions and Restaurants:")
    custom_prefs = recommender.onboarding.create_user_preferences(
        categories=[1, 3],  # Tourist Attractions and Restaurants
        min_rating=4.0,
        popularity_preference='popular'
    )
    recs = recommender.get_recommendations_for_new_user(custom_prefs, top_n=5)
    print(recs.to_string(index=False))
    
    # Test place-based recommendation
    print("\n[Test 3] Place-based recommendation:")
    recs = recommender.get_recommendations_for_place('Royal Palace of Cambodia', top_n=3)
    if isinstance(recs, pd.DataFrame):
        print(recs.to_string(index=False))
    else:
        print(recs)

