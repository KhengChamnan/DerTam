"""
Content-Based Filtering (CBF) Recommender Module

This module implements content-based filtering using:
- TF-IDF vectorization on place descriptions and categories
- Cosine similarity for place-to-place matching
- User preference filtering
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os


class CBFRecommender:
    """
    Content-Based Filtering Recommender
    
    Uses TF-IDF vectorization and cosine similarity to recommend
    places similar to user preferences.
    """
    
    def __init__(self):
        self.tfidf_vectorizer = None
        self.tfidf_matrix = None
        self.cosine_sim = None
        self.cosine_sim_df = None
        self.places_df = None
        self.place_names = None
        
    def fit(self, places_df, text_columns=None):
        """
        Fit the CBF model on places data.
        
        Args:
            places_df: DataFrame with places data
            text_columns: List of column names to use for TF-IDF (default: ['description', 'category_name', 'name'])
        """
        self.places_df = places_df.copy()
        
        if text_columns is None:
            text_columns = ['description', 'category_name', 'name']
        
        # Combine text columns into a single text feature
        combined_text = self.places_df[text_columns].apply(
            lambda x: ' '.join(x.astype(str)), axis=1
        )
        
        # Initialize TF-IDF Vectorizer
        self.tfidf_vectorizer = TfidfVectorizer()
        
        # Fit and transform
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(combined_text)
        
        # Calculate cosine similarity
        self.cosine_sim = cosine_similarity(self.tfidf_matrix)
        
        # Create DataFrame for easier lookup
        self.cosine_sim_df = pd.DataFrame(
            self.cosine_sim,
            index=self.places_df['placeID'],
            columns=self.places_df['placeID']
        )
        
        # Store place names for recommendations
        self.place_names = self.places_df.set_index('placeID')['name'].to_dict()
        
    def recommend_places(self, place_id, k=5, exclude_place=True):
        """
        Recommend places similar to a given place.
        
        Args:
            place_id: ID of the reference place
            k: Number of recommendations to return
            exclude_place: Whether to exclude the reference place from results
            
        Returns:
            DataFrame with recommended places
        """
        if place_id not in self.cosine_sim_df.index:
            return pd.DataFrame()
        
        # Get similarity scores
        similarity_scores = self.cosine_sim_df.loc[place_id].sort_values(ascending=False)
        
        # Exclude the reference place if requested
        if exclude_place:
            similarity_scores = similarity_scores.drop(place_id, errors='ignore')
        
        # Get top k similar places
        top_k_indices = similarity_scores.head(k).index
        
        # Get place details
        recommended_places = self.places_df[
            self.places_df['placeID'].isin(top_k_indices)
        ].copy()
        
        # Add similarity scores
        recommended_places['similarity_score'] = recommended_places['placeID'].map(
            similarity_scores.to_dict()
        )
        
        # Sort by similarity score
        recommended_places = recommended_places.sort_values('similarity_score', ascending=False)
        
        return recommended_places.head(k)
    
    def recommend_by_preferences(self, preferences, k=10):
        """
        Recommend places based on user preferences.
        
        Args:
            preferences: User preferences dictionary
            k: Number of recommendations to return
            
        Returns:
            DataFrame with recommended places
        """
        from .user_profile import filter_places_by_preferences
        
        # Filter places by preferences
        filtered_places = filter_places_by_preferences(self.places_df, preferences)
        
        if len(filtered_places) == 0:
            return pd.DataFrame()
        
        # If user has selected subcategories, find similar places
        # Otherwise, return top-rated places
        if preferences.get('subcategories'):
            # Use the first filtered place as reference and find similar ones
            if len(filtered_places) > 0:
                reference_place = filtered_places.iloc[0]['placeID']
                recommendations = self.recommend_places(reference_place, k=k*2, exclude_place=True)
                
                # Filter recommendations by preferences again
                recommendations = filter_places_by_preferences(recommendations, preferences)
                
                return recommendations.head(k)
        
        # If no subcategories, return top-rated places
        filtered_places = filtered_places.sort_values('ratings', ascending=False)
        return filtered_places.head(k)
    
    def save_model(self, filepath='models/cbf_model.pkl'):
        """
        Save the trained model to disk.
        
        Args:
            filepath: Path to save the model
        """
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        model_data = {
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'tfidf_matrix': self.tfidf_matrix,
            'cosine_sim': self.cosine_sim,
            'cosine_sim_df': self.cosine_sim_df,
            'places_df': self.places_df,
            'place_names': self.place_names
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
    
    def load_model(self, filepath='models/cbf_model.pkl'):
        """
        Load a trained model from disk.
        
        Args:
            filepath: Path to load the model from
        """
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.tfidf_vectorizer = model_data['tfidf_vectorizer']
        self.tfidf_matrix = model_data['tfidf_matrix']
        self.cosine_sim = model_data['cosine_sim']
        self.cosine_sim_df = model_data['cosine_sim_df']
        self.places_df = model_data['places_df']
        self.place_names = model_data['place_names']


def place_recommendation(place_name, similarity_data, items_df, k=5):
    """
    Get recommendations for a place by name.
    
    This function follows the book recommendation example structure.
    
    Args:
        place_name: Name of the place
        similarity_data: DataFrame with similarity scores (cosine_sim_df)
        items_df: DataFrame with place details (name, category, etc.)
        k: Number of recommendations
        
    Returns:
        DataFrame with recommended places
    """
    # Find place ID by name
    place_id = items_df[items_df['name'] == place_name]['placeID'].values
    
    if len(place_id) == 0:
        return pd.DataFrame()
    
    place_id = place_id[0]
    
    # Get similarity scores
    if place_id not in similarity_data.index:
        return pd.DataFrame()
    
    similarity_scores = similarity_data.loc[place_id].sort_values(ascending=False)
    similarity_scores = similarity_scores.drop(place_id, errors='ignore')
    
    # Get top k similar places
    top_k_indices = similarity_scores.head(k).index
    
    # Get place details
    recommended = items_df[items_df['placeID'].isin(top_k_indices)].copy()
    recommended['similarity_score'] = recommended['placeID'].map(similarity_scores.to_dict())
    recommended = recommended.sort_values('similarity_score', ascending=False)
    
    return recommended.head(k)


if __name__ == "__main__":
    # Test the CBF recommender
    from .data_loader import load_places_dataset, preprocess_places_data
    
    print("Loading and preprocessing places data...")
    places_df = load_places_dataset()
    places_df = preprocess_places_data(places_df)
    
    print(f"Loaded {len(places_df)} places")
    
    print("\nFitting CBF model...")
    cbf = CBFRecommender()
    cbf.fit(places_df)
    
    print("Model fitted successfully!")
    print(f"TF-IDF matrix shape: {cbf.tfidf_matrix.shape}")
    print(f"Cosine similarity matrix shape: {cbf.cosine_sim.shape}")
    
    # Test recommendation
    if len(places_df) > 0:
        test_place_id = places_df.iloc[0]['placeID']
        print(f"\nTesting recommendation for place: {places_df.iloc[0]['name']}")
        recommendations = cbf.recommend_places(test_place_id, k=5)
        print(f"\nTop 5 recommendations:")
        print(recommendations[['name', 'ratings', 'similarity_score']].head())




