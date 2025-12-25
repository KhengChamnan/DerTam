"""
Main Recommendation System

This module combines CBF and CF recommendations using a weighted ensemble approach.
"""

import pandas as pd
import numpy as np
from typing import Dict, Optional
from .cbf_recommender import CBFRecommender
from .cf_recommender import CFRecommender
from .user_profile import filter_places_by_preferences


class PlaceRecommender:
    """
    Main recommendation system that combines CBF and CF.
    """
    
    def __init__(self, cbf_model: Optional[CBFRecommender] = None, 
                 cf_model: Optional[CFRecommender] = None,
                 cbf_weight: float = 0.6, cf_weight: float = 0.4):
        """
        Initialize the recommender.
        
        Args:
            cbf_model: Trained CBF recommender
            cf_model: Trained CF recommender
            cbf_weight: Weight for CBF recommendations (default: 0.6)
            cf_weight: Weight for CF recommendations (default: 0.4)
        """
        self.cbf_model = cbf_model
        self.cf_model = cf_model
        self.cbf_weight = cbf_weight
        self.cf_weight = cf_weight
        
        # Normalize weights
        total_weight = cbf_weight + cf_weight
        if total_weight > 0:
            self.cbf_weight = cbf_weight / total_weight
            self.cf_weight = cf_weight / total_weight
    
    def recommend(self, preferences: Dict, user_id: Optional[int] = None, k: int = 10):
        """
        Get combined recommendations from CBF and CF.
        
        Args:
            preferences: User preferences dictionary
            user_id: User ID for CF recommendations (optional)
            k: Number of recommendations to return
            
        Returns:
            DataFrame with recommended places and scores
        """
        recommendations_list = []
        
        # Get CBF recommendations
        if self.cbf_model is not None:
            try:
                cbf_recs = self.cbf_model.recommend_by_preferences(preferences, k=k*2)
                if len(cbf_recs) > 0:
                    cbf_recs['cbf_score'] = cbf_recs.get('similarity_score', 1.0)
                    cbf_recs['cbf_score'] = cbf_recs['cbf_score'].fillna(0.5)
                    recommendations_list.append(cbf_recs)
            except Exception as e:
                print(f"Error getting CBF recommendations: {e}")
        
        # Get CF recommendations
        if self.cf_model is not None and user_id is not None:
            try:
                # Get places to recommend from
                places_df = self.cbf_model.places_df if self.cbf_model else None
                if places_df is None:
                    places_df = self.cf_model.places_df if hasattr(self.cf_model, 'places_df') else None
                
                if places_df is not None:
                    # Filter by preferences first
                    filtered_places = filter_places_by_preferences(places_df, preferences)
                    
                    if len(filtered_places) > 0:
                        cf_recs = self.cf_model.recommend_places(user_id, filtered_places, k=k*2)
                        if len(cf_recs) > 0:
                            cf_recs['cf_score'] = cf_recs['predicted_rating']
                            recommendations_list.append(cf_recs)
            except Exception as e:
                print(f"Error getting CF recommendations: {e}")
        
        # Combine recommendations
        if len(recommendations_list) == 0:
            return pd.DataFrame()
        
        # Merge all recommendations
        all_recs = pd.concat(recommendations_list, ignore_index=True)
        
        # Remove duplicates, keeping the best scores
        all_recs = all_recs.groupby('placeID').agg({
            'name': 'first',
            'ratings': 'first',
            'reviews_count': 'first',
            'description': 'first',
            'province_name': 'first',
            'category_name': 'first',
            'cbf_score': 'max',
            'cf_score': 'max',
            'similarity_score': 'max',
            'predicted_rating': 'max'
        }).reset_index()
        
        # Calculate combined score
        all_recs['cbf_score'] = all_recs.get('cbf_score', 0.5).fillna(0.5)
        all_recs['cf_score'] = all_recs.get('cf_score', 0.5).fillna(0.5)
        
        # Weighted combination
        if self.cbf_model is not None and self.cf_model is not None:
            all_recs['combined_score'] = (
                self.cbf_weight * all_recs['cbf_score'] +
                self.cf_weight * all_recs['cf_score']
            )
        elif self.cbf_model is not None:
            all_recs['combined_score'] = all_recs['cbf_score']
        elif self.cf_model is not None:
            all_recs['combined_score'] = all_recs['cf_score']
        else:
            all_recs['combined_score'] = 0.5
        
        # Sort by combined score
        all_recs = all_recs.sort_values('combined_score', ascending=False)
        
        # Return top k
        return all_recs.head(k)
    
    def recommend_cbf_only(self, preferences: Dict, k: int = 10):
        """
        Get recommendations using only CBF.
        
        Args:
            preferences: User preferences dictionary
            k: Number of recommendations
            
        Returns:
            DataFrame with recommended places
        """
        if self.cbf_model is None:
            return pd.DataFrame()
        
        return self.cbf_model.recommend_by_preferences(preferences, k=k)
    
    def recommend_cf_only(self, user_id: int, preferences: Dict, k: int = 10):
        """
        Get recommendations using only CF.
        
        Args:
            user_id: User ID
            preferences: User preferences dictionary
            k: Number of recommendations
            
        Returns:
            DataFrame with recommended places
        """
        if self.cf_model is None:
            return pd.DataFrame()
        
        # Get places to recommend from
        places_df = self.cbf_model.places_df if self.cbf_model else None
        if places_df is None:
            places_df = self.cf_model.places_df if hasattr(self.cf_model, 'places_df') else None
        
        if places_df is None:
            return pd.DataFrame()
        
        # Filter by preferences
        filtered_places = filter_places_by_preferences(places_df, preferences)
        
        if len(filtered_places) == 0:
            return pd.DataFrame()
        
        return self.cf_model.recommend_places(user_id, filtered_places, k=k)


if __name__ == "__main__":
    # Test the main recommender
    from .data_loader import load_places_dataset, preprocess_places_data, generate_synthetic_ratings
    
    print("Loading data...")
    places_df = load_places_dataset()
    places_df = preprocess_places_data(places_df)
    
    print("Training CBF model...")
    cbf = CBFRecommender()
    cbf.fit(places_df)
    
    print("Training CF model...")
    ratings_df = generate_synthetic_ratings(places_df, num_users=1000)
    cf = CFRecommender()
    cf.train(ratings_df, places_df, epochs=5)  # Small epochs for testing
    
    print("Creating main recommender...")
    recommender = PlaceRecommender(cbf_model=cbf, cf_model=cf)
    
    # Test recommendations
    preferences = {
        'categories': [1],
        'subcategories': ['temples', 'museums'],
        'min_rating': 4.0,
        'popularity_preference': 'balanced',
        'provinces': None
    }
    
    print("\nGetting combined recommendations...")
    recommendations = recommender.recommend(preferences, user_id=1, k=10)
    print(f"\nTop 10 recommendations:")
    if len(recommendations) > 0:
        print(recommendations[['name', 'ratings', 'combined_score']].head(10))

