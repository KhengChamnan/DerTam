"""
Demo script showing how to use the onboarding and recommendation system
"""

from recommend_places import PlaceRecommendationSystem, recommend_for_new_user
from user_onboarding import UserOnboarding
import pandas as pd


def demo_onboarding_flow():
    """Demonstrate the complete onboarding and recommendation flow"""
    
    print("=" * 70)
    print("DEMO: Complete Onboarding and Recommendation Flow")
    print("=" * 70)
    
    # Initialize system
    system = PlaceRecommendationSystem()
    
    # Show questionnaire structure
    print("\n[Step 1] Onboarding Questions Structure:")
    print("-" * 70)
    questionnaire = system.get_onboarding_questions()
    
    for q_key, q_data in questionnaire.items():
        print(f"\n{q_data['question']}")
        print(f"  Type: {q_data['type']}, Required: {q_data['required']}")
        for opt in q_data['options'][:3]:  # Show first 3 options
            default_marker = " (default)" if opt.get('default') else ""
            desc = f" - {opt.get('description', '')}" if opt.get('description') else ""
            print(f"    • {opt.get('label', opt.get('id', ''))}{desc}{default_marker}")
        if len(q_data['options']) > 3:
            print(f"    ... and {len(q_data['options']) - 3} more options")
    
    # Demo 1: Default preferences (user skips onboarding)
    print("\n" + "=" * 70)
    print("[Demo 1] User skips onboarding - Using default preferences")
    print("=" * 70)
    default_prefs = system.get_default_preferences()
    print("\nDefault Preferences:")
    print(system.onboarding.format_preferences_for_display(default_prefs))
    
    print("\nTop 5 Recommendations:")
    recs = recommend_for_new_user(default_prefs, top_n=5)
    print(recs.to_string(index=False))
    
    # Demo 2: User interested in Tourist Attractions and Restaurants
    print("\n" + "=" * 70)
    print("[Demo 2] User selects: Tourist Attractions + Restaurants, Rating 4.0+, Popular places")
    print("=" * 70)
    prefs1 = system.create_preferences_from_answers(
        categories=[1, 3],  # Tourist Attractions and Restaurants
        min_rating=4.0,
        popularity_preference='popular'
    )
    print("\nUser Preferences:")
    print(system.onboarding.format_preferences_for_display(prefs1))
    
    print("\nTop 5 Recommendations:")
    recs1 = recommend_for_new_user(prefs1, top_n=5)
    print(recs1.to_string(index=False))
    
    # Demo 3: User interested in Hotels, high rating, hidden gems
    print("\n" + "=" * 70)
    print("[Demo 3] User selects: Hotels only, Rating 4.5+, Hidden gems")
    print("=" * 70)
    prefs2 = system.create_preferences_from_answers(
        categories=[2],  # Hotels only
        min_rating=4.5,
        popularity_preference='hidden_gems'
    )
    print("\nUser Preferences:")
    print(system.onboarding.format_preferences_for_display(prefs2))
    
    print("\nTop 5 Recommendations:")
    recs2 = recommend_for_new_user(prefs2, top_n=5)
    print(recs2.to_string(index=False))
    
    # Demo 4: User with location preference
    print("\n" + "=" * 70)
    print("[Demo 4] User selects: Tourist Attractions, Phnom Penh only")
    print("=" * 70)
    try:
        prefs3 = system.create_preferences_from_answers(
            categories=[1],  # Tourist Attractions
            min_rating=4.0,
            popularity_preference='balanced',
            provinces=['Phnom Penh']
        )
        print("\nUser Preferences:")
        print(system.onboarding.format_preferences_for_display(prefs3))
        
        print("\nTop 5 Recommendations:")
        recs3 = recommend_for_new_user(prefs3, top_n=5)
        print(recs3.to_string(index=False))
    except Exception as e:
        print(f"Note: {e}")
        print("(This might fail if province data is not loaded)")
    
    print("\n" + "=" * 70)
    print("Demo Complete!")
    print("=" * 70)
    print("\nTo collect preferences interactively, run:")
    print("  python user_onboarding.py")
    print("\nTo use in your app, import and use:")
    print("  from recommend_places import PlaceRecommendationSystem")
    print("  system = PlaceRecommendationSystem()")
    print("  preferences = system.create_preferences_from_answers(...)")
    print("  recommendations = system.get_recommendations(preferences)")


if __name__ == "__main__":
    demo_onboarding_flow()

