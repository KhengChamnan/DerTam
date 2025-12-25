"""
User Profile Vector Creation Module

This module creates user profile vectors from questionnaire responses.
"""

import json
import numpy as np
from typing import List, Dict, Optional


def create_preferences_from_answers(
    selected_subcategories: List[str],
    selected_rating: float,
    selected_popularity: str,
    selected_provinces: Optional[List[str]] = None
) -> Dict:
    """
    Create user preferences dictionary from questionnaire answers.
    
    Args:
        selected_subcategories: List of selected category IDs (e.g., ['temples', 'museums'])
        selected_rating: Minimum rating preference (e.g., 4.0)
        selected_popularity: Popularity preference ('popular', 'hidden_gems', or 'balanced')
        selected_provinces: List of selected province names (e.g., ['Phnom Penh', 'Siem Reap'])
                           If None or empty, means 'anywhere'
    
    Returns:
        Dictionary with user preferences:
        {
            'categories': [1],  # Always 1 for tourist attractions
            'subcategories': ['temples', 'museums'],
            'min_rating': 4.0,
            'popularity_preference': 'balanced',
            'provinces': ['Phnom Penh', 'Siem Reap'] or None,
            'province_ids': [1, 2] or None
        }
    """
    preferences = {
        'categories': [1],  # Tourist Attraction category
        'subcategories': selected_subcategories if selected_subcategories else [],
        'min_rating': selected_rating,
        'popularity_preference': selected_popularity,
        'provinces': selected_provinces if selected_provinces and len(selected_provinces) > 0 else None,
        'province_ids': None  # Will be set if provinces are provided
    }
    
    return preferences


def create_user_profile_vector(preferences: Dict, all_subcategories: List[str]) -> np.ndarray:
    """
    Create a binary user profile vector based on preferences.
    
    Args:
        preferences: User preferences dictionary
        all_subcategories: List of all possible subcategories
        
    Returns:
        Binary numpy array representing user profile
    """
    # Binary encoding for subcategories
    profile_vector = np.zeros(len(all_subcategories))
    
    selected_subcategories = preferences.get('subcategories', [])
    for i, subcat in enumerate(all_subcategories):
        if subcat in selected_subcategories:
            profile_vector[i] = 1.0
    
    return profile_vector


def filter_places_by_preferences(df, preferences: Dict):
    """
    Filter places DataFrame based on user preferences.
    
    Args:
        df: Places DataFrame
        preferences: User preferences dictionary
        
    Returns:
        Filtered DataFrame
    """
    filtered_df = df.copy()
    
    # Filter by minimum rating
    min_rating = preferences.get('min_rating', 0.0)
    if min_rating > 0:
        filtered_df = filtered_df[filtered_df['ratings'] >= min_rating]
    
    # Filter by subcategories
    subcategories = preferences.get('subcategories', [])
    if subcategories:
        # First, filter to only Tourist Attraction category
        filtered_df = filtered_df[filtered_df['category_name'] == 'Tourist Attraction']
        
        # Map subcategories to search patterns in name and description
        subcategory_patterns = {
            'temples': r'Temple|Wat|Pagoda|Pagodas',
            'museums': r'Museum|Museums',
            'parks': r'Park|Parks|Garden|Gardens',
            'monuments': r'Monument|Monuments|Memorial|Statue|Statues',
            'palaces': r'Palace|Palaces|Royal',
            'markets': r'Market|Markets',
            'water_attractions': r'Water|Waterfall|Waterfalls|Beach|Beaches|Lake|River',
            'other_attractions': r'.'  # Match anything if other_attractions is selected
        }
        
        # Build combined pattern for all selected subcategories
        patterns = []
        for subcat in subcategories:
            if subcat in subcategory_patterns:
                patterns.append(subcategory_patterns[subcat])
        
        if patterns:
            # Combine patterns with OR
            combined_pattern = '|'.join(patterns)
            # Search in both name and description
            name_mask = filtered_df['name'].str.contains(combined_pattern, case=False, na=False, regex=True)
            desc_mask = filtered_df['description'].str.contains(combined_pattern, case=False, na=False, regex=True)
            # Match if either name or description contains the pattern
            mask = name_mask | desc_mask
            filtered_df = filtered_df[mask]
    
    # Filter by provinces
    provinces = preferences.get('provinces')
    if provinces:
        filtered_df = filtered_df[filtered_df['province_name'].isin(provinces)]
    
    # Filter by popularity preference
    popularity_pref = preferences.get('popularity_preference', 'balanced')
    if popularity_pref == 'popular':
        # Top 50% by reviews_count
        if len(filtered_df) > 0:
            threshold = filtered_df['reviews_count'].quantile(0.5)
            filtered_df = filtered_df[filtered_df['reviews_count'] >= threshold]
    elif popularity_pref == 'hidden_gems':
        # Bottom 50% by reviews_count
        if len(filtered_df) > 0:
            threshold = filtered_df['reviews_count'].quantile(0.5)
            filtered_df = filtered_df[filtered_df['reviews_count'] <= threshold]
    # 'balanced' means no filtering
    
    return filtered_df


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


def get_all_subcategories(questionnaire):
    """
    Extract all subcategory IDs from questionnaire.
    
    Args:
        questionnaire: Questionnaire dictionary
        
    Returns:
        List of subcategory IDs
    """
    if 'question_1_category' in questionnaire:
        options = questionnaire['question_1_category'].get('options', [])
        return [opt['id'] for opt in options]
    return []


if __name__ == "__main__":
    # Test the user profile module
    print("Testing user profile creation...")
    
    # Load questionnaire
    questionnaire = load_questionnaire()
    all_subcategories = get_all_subcategories(questionnaire)
    print(f"Available subcategories: {all_subcategories}")
    
    # Create preferences from example
    preferences = create_preferences_from_answers(
        selected_subcategories=['temples', 'museums'],
        selected_rating=4.0,
        selected_popularity='balanced',
        selected_provinces=None
    )
    
    print(f"\nUser preferences: {preferences}")
    
    # Create profile vector
    profile_vector = create_user_profile_vector(preferences, all_subcategories)
    print(f"\nProfile vector shape: {profile_vector.shape}")
    print(f"Profile vector: {profile_vector}")

