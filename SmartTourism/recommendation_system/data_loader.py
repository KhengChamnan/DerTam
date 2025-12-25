"""
Data Loading and Preprocessing Module

This module handles:
- Loading places dataset
- Data preprocessing
- Generating synthetic user rating data for CF training
"""

import pandas as pd
import numpy as np
import json
import os


def load_places_dataset(file_path='data/dataset_with_descriptions_cleaned.csv'):
    """
    Load the places dataset from CSV file.
    
    Args:
        file_path: Path to the places dataset CSV file
        
    Returns:
        DataFrame with places data
    """
    df = pd.read_csv(file_path, low_memory=False)
    return df


def preprocess_places_data(df):
    """
    Preprocess places data: handle missing values, clean text, etc.
    
    Args:
        df: Places DataFrame
        
    Returns:
        Preprocessed DataFrame
    """
    # Create a copy to avoid modifying original
    df = df.copy()
    
    # Handle missing values in description
    df['description'] = df['description'].fillna('')
    
    # Handle missing values in ratings
    df['ratings'] = pd.to_numeric(df['ratings'], errors='coerce')
    df['ratings'] = df['ratings'].fillna(df['ratings'].mean())
    
    # Handle missing values in reviews_count
    df['reviews_count'] = pd.to_numeric(df['reviews_count'], errors='coerce')
    df['reviews_count'] = df['reviews_count'].fillna(0)
    
    # Ensure placeID is unique and not null
    df = df.dropna(subset=['placeID'])
    df = df.drop_duplicates(subset=['placeID'])
    
    # Clean text fields
    if 'name' in df.columns:
        df['name'] = df['name'].astype(str)
    if 'description' in df.columns:
        df['description'] = df['description'].astype(str)
    if 'category_name' in df.columns:
        df['category_name'] = df['category_name'].astype(str)
    
    return df


def generate_synthetic_ratings(df, num_users=3000, min_ratings_per_user=5, max_ratings_per_user=50):
    """
    Generate synthetic user rating data for collaborative filtering.
    
    The synthetic ratings are generated based on:
    - Place ratings (higher rated places get more positive interactions)
    - Place popularity (more reviews = more user interactions)
    - Random sampling to simulate diverse user preferences
    
    Args:
        df: Places DataFrame
        num_users: Number of synthetic users to generate
        min_ratings_per_user: Minimum number of ratings per user
        max_ratings_per_user: Maximum number of ratings per user
        
    Returns:
        DataFrame with columns: user_id, place_id, rating (normalized 0-1)
    """
    np.random.seed(42)  # For reproducibility
    
    ratings_list = []
    place_ids = df['placeID'].unique()
    place_ratings = df.set_index('placeID')['ratings'].to_dict()
    place_reviews = df.set_index('placeID')['reviews_count'].to_dict()
    
    # Normalize place ratings to 0-5 scale if needed
    max_rating = df['ratings'].max()
    min_rating = df['ratings'].min()
    
    for user_id in range(1, num_users + 1):
        # Determine number of ratings for this user
        num_ratings = np.random.randint(min_ratings_per_user, max_ratings_per_user + 1)
        
        # Select places for this user based on popularity and rating
        # Higher rated places and places with more reviews are more likely to be selected
        place_weights = []
        for place_id in place_ids:
            rating_score = (place_ratings.get(place_id, 3.0) - min_rating) / (max_rating - min_rating + 1e-6)
            review_score = np.log1p(place_reviews.get(place_id, 0)) / (np.log1p(df['reviews_count'].max()) + 1e-6)
            weight = 0.6 * rating_score + 0.4 * review_score + 0.1  # Add small base weight
            place_weights.append(weight)
        
        place_weights = np.array(place_weights)
        place_weights = place_weights / place_weights.sum()
        
        # Sample places for this user
        selected_places = np.random.choice(
            place_ids, 
            size=min(num_ratings, len(place_ids)), 
            replace=False, 
            p=place_weights
        )
        
        # Generate ratings for selected places
        for place_id in selected_places:
            base_rating = place_ratings.get(place_id, 3.0)
            
            # Add some randomness based on user preference
            # Users tend to rate higher for places they like
            if base_rating >= 4.0:
                # High-rated places: mostly positive ratings
                rating = np.random.beta(8, 2)  # Skewed towards 1.0
            elif base_rating >= 3.5:
                # Medium-high: balanced
                rating = np.random.beta(5, 5)
            else:
                # Lower rated: more negative
                rating = np.random.beta(2, 8)  # Skewed towards 0.0
            
            # Normalize to 0-1 scale (for binary classification with sigmoid)
            rating = max(0.0, min(1.0, rating))
            
            ratings_list.append({
                'user_id': user_id,
                'place_id': place_id,
                'rating': rating
            })
    
    ratings_df = pd.DataFrame(ratings_list)
    return ratings_df


def load_questionnaire(file_path='data/questionare.json'):
    """
    Load questionnaire structure from JSON file.
    
    Args:
        file_path: Path to questionnaire JSON file
        
    Returns:
        Dictionary with questionnaire structure
    """
    with open(file_path, 'r') as f:
        questionnaire = json.load(f)
    return questionnaire


def get_provinces_from_dataset(df):
    """
    Get unique provinces from the places dataset.
    
    Args:
        df: Places DataFrame
        
    Returns:
        List of unique province names
    """
    if 'province_name' in df.columns:
        provinces = df['province_name'].dropna().unique().tolist()
        return sorted(provinces)
    return []


if __name__ == "__main__":
    # Test the data loader
    print("Loading places dataset...")
    places_df = load_places_dataset()
    print(f"Loaded {len(places_df)} places")
    
    print("\nPreprocessing data...")
    places_df = preprocess_places_data(places_df)
    print(f"After preprocessing: {len(places_df)} places")
    
    print("\nGenerating synthetic ratings...")
    ratings_df = generate_synthetic_ratings(places_df, num_users=3000)
    print(f"Generated {len(ratings_df)} ratings for {ratings_df['user_id'].nunique()} users")
    
    print("\nSample ratings:")
    print(ratings_df.head())
    
    print("\nProvinces in dataset:")
    provinces = get_provinces_from_dataset(places_df)
    print(f"Found {len(provinces)} provinces: {provinces[:10]}...")

