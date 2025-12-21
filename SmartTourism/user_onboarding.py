"""
User Onboarding Module for CBF Recommendation System

This module handles collecting user preferences during app onboarding
to enable content-based filtering recommendations for new users.
"""

import pandas as pd
from typing import Dict, List, Optional, Any, Tuple


class UserOnboarding:
    """Handles user preference collection during onboarding"""
    
    # Category mappings (from dataset analysis)
    CATEGORIES = {
        1: "Tourist Attraction",
        2: "Hotel", 
        3: "Restaurant",
        4: "Transportation"
    }
    
    # Tourist Attraction Subcategories based on place name keywords
    TOURIST_ATTRACTION_SUBCATEGORIES = {
        "temples": {
            "id": "temples",
            "label": "Temples",
            "description": "Temples, Wat, Pagodas",
            "keywords": ["temple", "wat", "pagoda", "wat "]
        },
        "museums": {
            "id": "museums",
            "label": "Museums",
            "description": "Museums and cultural centers",
            "keywords": ["museum", "genocide", "cultural center"]
        },
        "parks": {
            "id": "parks",
            "label": "Parks",
            "description": "Parks and gardens",
            "keywords": ["park", "garden"]
        },
        "monuments": {
            "id": "monuments",
            "label": "Monuments & Statues",
            "description": "Monuments, statues, memorials",
            "keywords": ["monument", "statue", "memorial"]
        },
        "palaces": {
            "id": "palaces",
            "label": "Palaces",
            "description": "Royal palaces and historic buildings",
            "keywords": ["palace"]
        },
        "markets": {
            "id": "markets",
            "label": "Markets",
            "description": "Markets and shopping areas",
            "keywords": ["market"]
        },
        "water_attractions": {
            "id": "water_attractions",
            "label": "Water Attractions",
            "description": "Water parks, waterfalls, beaches",
            "keywords": ["waterfall", "water park", "beach", "fountain"]
        },
        "other_attractions": {
            "id": "other_attractions",
            "label": "Other Attractions",
            "description": "Other tourist attractions",
            "keywords": []  # Catch-all for places not matching other categories
        }
    }
    
    # Rating options
    RATING_OPTIONS = {
        "any": 0.0,
        "3.0": 3.0,
        "3.5": 3.5,
        "4.0": 4.0,
        "4.5": 4.5
    }
    
    # Popularity preference options
    POPULARITY_OPTIONS = ["popular", "hidden_gems", "balanced"]
    
    def __init__(self, places_data: Optional[pd.DataFrame] = None):
        """
        Initialize onboarding system
        
        Args:
            places_data: DataFrame with places data (optional, for getting unique provinces)
        """
        self.places_data = places_data
        self._load_provinces()
    
    def _load_provinces(self):
        """Load unique provinces from dataset"""
        if self.places_data is not None:
            self.provinces = sorted(self.places_data['province_name'].unique().tolist())
            # Create province_id mapping
            province_df = self.places_data[['province_id', 'province_name']].drop_duplicates()
            self.province_id_map = dict(zip(province_df['province_name'], province_df['province_id']))
        else:
            self.provinces = []
            self.province_id_map = {}
    
    def get_questionnaire_structure(self) -> Dict[str, Any]:
        """
        Returns the structure of onboarding questions
        
        Returns:
            Dictionary containing question definitions
        """
        # Build subcategory options
        subcategory_options = []
        for key, subcat in self.TOURIST_ATTRACTION_SUBCATEGORIES.items():
            subcategory_options.append({
                "id": subcat["id"],
                "label": subcat["label"],
                "description": subcat["description"]
            })
        
        return {
            "question_1_category": {
                "question": "What types of tourist attractions are you interested in?",
                "type": "multi_select",
                "required": True,
                "options": subcategory_options
            },
            "question_2_rating": {
                "question": "What minimum rating do you prefer?",
                "type": "single_select",
                "required": True,
                "options": [
                    {"id": "any", "label": "Any rating", "value": 0.0},
                    {"id": "3.0", "label": "3.0+ (Average)", "value": 3.0},
                    {"id": "3.5", "label": "3.5+ (Above average)", "value": 3.5},
                    {"id": "4.0", "label": "4.0+ (Good)", "value": 4.0, "default": True},
                    {"id": "4.5", "label": "4.5+ (Excellent)", "value": 4.5}
                ]
            },
            "question_3_popularity": {
                "question": "Do you prefer popular places or hidden gems?",
                "type": "single_select",
                "required": True,
                "options": [
                    {"id": "popular", "label": "Popular places", "description": "Highly reviewed places"},
                    {"id": "hidden_gems", "label": "Hidden gems", "description": "Less reviewed places"},
                    {"id": "balanced", "label": "No preference", "description": "Balanced approach", "default": True}
                ]
            },
            "question_4_location": {
                "question": "Which provinces are you interested in visiting?",
                "type": "multi_select",
                "required": False,
                "options": [{"id": province, "label": province} for province in self.provinces] + 
                          [{"id": "anywhere", "label": "Anywhere", "default": True}]
            }
        }
    
    def validate_preferences(self, preferences: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Validate user preferences
        
        Args:
            preferences: Dictionary containing user preferences
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check required fields - either categories or subcategories must be present
        has_categories = 'categories' in preferences and preferences.get('categories')
        has_subcategories = 'subcategories' in preferences and preferences.get('subcategories')
        
        if not has_categories and not has_subcategories:
            return False, "At least one category or subcategory must be selected"
        
        if 'min_rating' not in preferences:
            return False, "Rating preference is required"
        
        if 'popularity_preference' not in preferences:
            return False, "Popularity preference is required"
        
        # Validate categories if provided
        if has_categories:
            valid_categories = set(self.CATEGORIES.keys())
            user_categories = set(preferences['categories'])
            if not user_categories.issubset(valid_categories):
                return False, f"Invalid category IDs. Valid: {valid_categories}"
        
        # Validate subcategories if provided
        if has_subcategories:
            valid_subcategories = set(self.TOURIST_ATTRACTION_SUBCATEGORIES.keys())
            user_subcategories = set(preferences['subcategories'])
            if not user_subcategories.issubset(valid_subcategories):
                return False, f"Invalid subcategory IDs. Valid: {valid_subcategories}"
        
        # Validate rating
        if preferences['min_rating'] not in self.RATING_OPTIONS.values():
            return False, f"Invalid rating value. Valid: {list(self.RATING_OPTIONS.values())}"
        
        # Validate popularity
        if preferences['popularity_preference'] not in self.POPULARITY_OPTIONS:
            return False, f"Invalid popularity preference. Valid: {self.POPULARITY_OPTIONS}"
        
        # Validate provinces if provided
        if 'provinces' in preferences and preferences['provinces']:
            if not isinstance(preferences['provinces'], list):
                return False, "Provinces must be a list"
            # Check if "anywhere" is selected or valid province names
            if "anywhere" not in preferences['provinces']:
                valid_provinces = set(self.provinces)
                user_provinces = set(preferences['provinces'])
                if not user_provinces.issubset(valid_provinces):
                    return False, f"Invalid province names. Valid: {valid_provinces}"
        
        return True, None
    
    def create_user_preferences(
        self,
        categories: Optional[List[int]] = None,
        subcategories: Optional[List[str]] = None,
        min_rating: float = 4.0,
        popularity_preference: str = "balanced",
        provinces: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Create user preference profile from onboarding answers
        
        Args:
            categories: List of category IDs (1-4) - deprecated, use subcategories for Tourist Attractions
            subcategories: List of tourist attraction subcategory IDs (e.g., ["temples", "museums"])
            min_rating: Minimum rating preference (0.0-5.0)
            popularity_preference: 'popular', 'hidden_gems', or 'balanced'
            provinces: Optional list of province names, or None/empty for all
            
        Returns:
            Dictionary containing user preferences
        """
        # If subcategories are provided, set categories to [1] (Tourist Attraction)
        # Otherwise, use provided categories (for backward compatibility)
        if subcategories:
            final_categories = [1]  # Tourist Attraction category_id
        elif categories:
            final_categories = categories
        else:
            final_categories = [1]  # Default to Tourist Attraction
        
        preferences = {
            'categories': final_categories,
            'subcategories': subcategories if subcategories else None,
            'min_rating': min_rating,
            'popularity_preference': popularity_preference,
            'provinces': provinces if provinces and "anywhere" not in provinces else None
        }
        
        # Convert province names to IDs if provided
        if preferences['provinces']:
            preferences['province_ids'] = [
                self.province_id_map.get(prov, None) 
                for prov in preferences['provinces']
            ]
            preferences['province_ids'] = [pid for pid in preferences['province_ids'] if pid is not None]
        else:
            preferences['province_ids'] = None
        
        # Validate
        is_valid, error = self.validate_preferences(preferences)
        if not is_valid:
            raise ValueError(f"Invalid preferences: {error}")
        
        return preferences
    
    def get_default_preferences(self) -> Dict[str, Any]:
        """
        Get default preferences for users who skip onboarding
        
        Returns:
            Dictionary with default preferences
        """
        return {
            'categories': [1],  # Tourist Attraction only
            'subcategories': list(self.TOURIST_ATTRACTION_SUBCATEGORIES.keys()),  # All subcategories
            'min_rating': 4.0,  # Good rating
            'popularity_preference': 'balanced',
            'provinces': None,  # All provinces
            'province_ids': None
        }
    
    def format_preferences_for_display(self, preferences: Dict[str, Any]) -> str:
        """
        Format user preferences as a readable string
        
        Args:
            preferences: User preferences dictionary
            
        Returns:
            Formatted string
        """
        result = ""
        
        # Show subcategories if available
        if preferences.get('subcategories'):
            subcat_names = [
                self.TOURIST_ATTRACTION_SUBCATEGORIES.get(subcat, {}).get('label', subcat)
                for subcat in preferences['subcategories']
            ]
            result += f"Attraction Types: {', '.join(subcat_names)}\n"
        elif preferences.get('categories'):
            category_names = [self.CATEGORIES.get(cat_id, f"Unknown({cat_id})") 
                             for cat_id in preferences['categories']]
            result += f"Categories: {', '.join(category_names)}\n"
        
        result += f"Minimum Rating: {preferences['min_rating']}+\n"
        result += f"Popularity: {preferences['popularity_preference'].replace('_', ' ').title()}\n"
        
        if preferences.get('provinces'):
            result += f"Provinces: {', '.join(preferences['provinces'])}"
        else:
            result += "Provinces: Anywhere"
        
        return result


def collect_preferences_interactive() -> Dict[str, Any]:
    """
    Interactive function to collect user preferences via command line
    (Useful for testing, but in a real app this would be a UI)
    
    Returns:
        Dictionary containing user preferences
    """
    print("=" * 60)
    print("WELCOME! Let's personalize your recommendations")
    print("=" * 60)
    
    # Load places data to get provinces
    try:
        places_data = pd.read_csv('clean_place_for_ml.csv', encoding='latin1')
        onboarding = UserOnboarding(places_data)
    except FileNotFoundError:
        print("Warning: Could not load places data. Province selection will be limited.")
        onboarding = UserOnboarding()
    
    questionnaire = onboarding.get_questionnaire_structure()
    
    # Question 1: Categories
    print(f"\n{questionnaire['question_1_category']['question']}")
    for opt in questionnaire['question_1_category']['options']:
        print(f"  {opt['id']}. {opt['label']} - {opt['description']}")
    
    category_input = input("\nEnter category IDs (comma-separated, e.g., 1,3): ").strip()
    categories = [int(c.strip()) for c in category_input.split(',') if c.strip().isdigit()]
    
    if not categories:
        print("No valid categories selected. Using defaults.")
        categories = list(onboarding.CATEGORIES.keys())
    
    # Question 2: Rating
    print(f"\n{questionnaire['question_2_rating']['question']}")
    for opt in questionnaire['question_2_rating']['options']:
        marker = " (default)" if opt.get('default') else ""
        print(f"  {opt['id']}. {opt['label']}{marker}")
    
    rating_input = input("\nEnter rating preference (default: 4.0): ").strip()
    min_rating = onboarding.RATING_OPTIONS.get(rating_input, 4.0)
    
    # Question 3: Popularity
    print(f"\n{questionnaire['question_3_popularity']['question']}")
    for opt in questionnaire['question_3_popularity']['options']:
        marker = " (default)" if opt.get('default') else ""
        desc = f" - {opt['description']}" if 'description' in opt else ""
        print(f"  {opt['id']}. {opt['label']}{desc}{marker}")
    
    popularity_input = input("\nEnter popularity preference (default: balanced): ").strip()
    if popularity_input not in onboarding.POPULARITY_OPTIONS:
        popularity_input = "balanced"
    
    # Question 4: Location (optional)
    print(f"\n{questionnaire['question_4_location']['question']} (Optional)")
    print("  anywhere - Anywhere")
    if onboarding.provinces:
        for i, province in enumerate(onboarding.provinces[:10], 1):  # Show first 10
            print(f"  {province}")
        if len(onboarding.provinces) > 10:
            print(f"  ... and {len(onboarding.provinces) - 10} more")
    
    location_input = input("\nEnter province names (comma-separated) or 'anywhere' (default: anywhere): ").strip()
    
    if location_input.lower() == 'anywhere' or not location_input:
        provinces = None
    else:
        provinces = [p.strip() for p in location_input.split(',')]
    
    # Create preferences
    preferences = onboarding.create_user_preferences(
        categories=categories,
        min_rating=min_rating,
        popularity_preference=popularity_input,
        provinces=provinces
    )
    
    print("\n" + "=" * 60)
    print("Your Preferences:")
    print("=" * 60)
    print(onboarding.format_preferences_for_display(preferences))
    print("=" * 60)
    
    return preferences


if __name__ == "__main__":
    # Test the onboarding system
    preferences = collect_preferences_interactive()
    print("\nPreferences dictionary:")
    print(preferences)

