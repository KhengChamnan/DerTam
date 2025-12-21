# User Onboarding Guide for CBF Recommendations

## Overview

This system enables content-based filtering (CBF) recommendations for new users who don't have interaction history. When users first download your app, you can collect their preferences through a simple onboarding questionnaire.

## Onboarding Questions

Based on your CBF model features (`category_id`, `ratings`, `reviews_count`), here are the recommended questions:

### Question 1: Category Preference (Required)
**Question**: "What types of places are you most interested in?"

**Options** (multi-select):
- Tourist Attractions (museums, temples, landmarks) - Category ID: 1
- Hotels (accommodations) - Category ID: 2
- Restaurants (dining) - Category ID: 3
- Transportation (travel services) - Category ID: 4

### Question 2: Rating Preference (Required)
**Question**: "What minimum rating do you prefer?"

**Options** (single select):
- Any rating (0+)
- 3.0+ (Average)
- 3.5+ (Above average)
- 4.0+ (Good) - **Recommended default**
- 4.5+ (Excellent)

### Question 3: Popularity Preference (Required)
**Question**: "Do you prefer popular places or hidden gems?"

**Options** (single select):
- Popular places (highly reviewed)
- Hidden gems (less reviewed)
- No preference (balanced) - **Recommended default**

### Question 4: Location Preference (Optional)
**Question**: "Which provinces are you interested in visiting?"

**Options** (multi-select):
- List all 26 provinces
- "Anywhere" option (default)

## Usage Examples

### Basic Usage

```python
from recommend_places import PlaceRecommendationSystem

# Initialize system
system = PlaceRecommendationSystem()

# Create preferences from user answers
preferences = system.create_preferences_from_answers(
    categories=[1, 3],  # Tourist Attractions and Restaurants
    min_rating=4.0,
    popularity_preference='popular',
    provinces=['Phnom Penh']  # Optional
)

# Get recommendations
recommendations = system.get_recommendations(preferences, top_n=10)
print(recommendations)
```

### Using Default Preferences

If a user skips onboarding, use default preferences:

```python
from recommend_places import recommend_for_new_user

# Uses default preferences automatically
recommendations = recommend_for_new_user(top_n=10)
```

### Getting Questionnaire Structure

To build your UI, get the question structure:

```python
system = PlaceRecommendationSystem()
questions = system.get_onboarding_questions()

# questions is a dictionary with all question definitions
for q_key, q_data in questions.items():
    print(q_data['question'])
    for option in q_data['options']:
        print(f"  - {option['label']}")
```

## User Preference Structure

After collecting answers, preferences are stored as:

```python
{
    'categories': [1, 3],  # Selected category IDs
    'min_rating': 4.0,     # Minimum rating threshold
    'popularity_preference': 'popular',  # 'popular', 'hidden_gems', or 'balanced'
    'provinces': ['Phnom Penh'],  # Optional: list of province names
    'province_ids': [1]  # Automatically converted province IDs
}
```

## Default Values

If users skip questions, the system uses these defaults:
- **Categories**: All categories (1, 2, 3, 4)
- **Min Rating**: 4.0 (Good)
- **Popularity**: Balanced
- **Provinces**: All provinces (no filtering)

## Files Created

1. **`user_onboarding.py`** - Handles preference collection and validation
2. **`cbf_recommender.py`** - Enhanced CBF recommender with preference support
3. **`recommend_places.py`** - Main interface for recommendations
4. **`demo_onboarding.py`** - Demo script showing usage examples

## Testing

Run the demo to see examples:

```bash
python demo_onboarding.py
```

Or test interactive preference collection:

```bash
python user_onboarding.py
```

## Integration with Your App

1. **During onboarding**: Collect user answers to the 4 questions
2. **Store preferences**: Save the preferences dictionary (can be JSON)
3. **Get recommendations**: Use `PlaceRecommendationSystem` to get personalized recommendations
4. **Update preferences**: Users can update preferences later, and you can re-run recommendations

## How It Works

1. **Filter places** by user preferences (categories, rating, provinces)
2. **Create user profile vector** from preferences matching CBF feature space
3. **Compute similarity** between user profile and filtered places
4. **Rank and return** top N recommendations

The system handles the cold-start problem by using content-based filtering based on place features rather than user interaction history.

