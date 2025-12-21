"""
Streamlit App for Testing CBF Recommendation System

This app provides an interactive interface to test the content-based filtering
recommendation system with onboarding questionnaire and recommendations display.
"""

import streamlit as st
import pandas as pd
from recommend_places import PlaceRecommendationSystem

# Page configuration
st.set_page_config(
    page_title="CBF Recommendation System",
    page_icon="📍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
if 'system' not in st.session_state:
    st.session_state.system = None
if 'initialized' not in st.session_state:
    st.session_state.initialized = False


def initialize_system():
    """Initialize the recommendation system"""
    if not st.session_state.initialized:
        try:
            with st.spinner("Loading recommendation system..."):
                st.session_state.system = PlaceRecommendationSystem()
                st.session_state.initialized = True
            return True
        except Exception as e:
            st.error(f"Error initializing system: {str(e)}")
            st.info("Make sure 'cbf_model.pkl' exists. Run the notebook to train the model first.")
            return False
    return True


def home_page():
    """Display home page with overview and system information"""
    st.title("📍 CBF Recommendation System")
    st.markdown("### Welcome to the Content-Based Filtering Recommendation System")
    
    if not initialize_system():
        return
    
    system = st.session_state.system
    
    # System Information
    st.header("📊 System Information")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Total Places", system.recommender.model_package['metadata']['n_places'])
    
    with col2:
        model_type = system.recommender.model_package['metadata']['model_type']
        st.metric("Model Type", "CBF")
    
    with col3:
        training_date = system.recommender.model_package['metadata']['training_date']
        st.metric("Training Date", training_date.split()[0])
    
    # Dataset Statistics
    st.subheader("Dataset Statistics")
    places_data = system.recommender.model_package['places_data']
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("**Category Distribution:**")
        category_dist = places_data['category_name'].value_counts()
        st.bar_chart(category_dist)
    
    with col2:
        st.write("**Rating Statistics:**")
        rating_stats = {
            "Mean": f"{places_data['ratings'].mean():.2f}",
            "Median": f"{places_data['ratings'].median():.2f}",
            "Min": f"{places_data['ratings'].min():.2f}",
            "Max": f"{places_data['ratings'].max():.2f}"
        }
        for key, value in rating_stats.items():
            st.write(f"{key}: {value}")
    
    # Navigation
    st.header("🚀 Quick Navigation")
    st.info("Use the sidebar to navigate to different testing modes:")
    st.markdown("""
    - **Onboarding & Recommendations**: Complete the questionnaire and get personalized recommendations
    - **Place-Based Recommendations**: Find similar places to a specific location
    - **Quick Tests**: Test with pre-configured scenarios
    """)


def onboarding_page():
    """Display onboarding questionnaire and recommendations"""
    st.title("🎯 Onboarding & Recommendations")
    st.markdown("Complete the questionnaire below to get personalized recommendations")
    
    if not initialize_system():
        return
    
    system = st.session_state.system
    questionnaire = system.get_onboarding_questions()
    
    with st.form("onboarding_form"):
        st.subheader("Step 1: Attraction Type Preference")
        st.write(questionnaire['question_1_category']['question'])
        
        subcategory_options = questionnaire['question_1_category']['options']
        selected_subcategories = []
        for opt in subcategory_options:
            if st.checkbox(
                f"{opt['label']} - {opt['description']}",
                key=f"subcat_{opt['id']}",
                value=False
            ):
                selected_subcategories.append(opt['id'])
        
        if not selected_subcategories:
            st.warning("Please select at least one attraction type")
        
        st.divider()
        
        st.subheader("Step 2: Rating Preference")
        st.write(questionnaire['question_2_rating']['question'])
        
        rating_options = questionnaire['question_2_rating']['options']
        rating_labels = [f"{opt['label']}" for opt in rating_options]
        rating_values = [opt['value'] for opt in rating_options]
        
        selected_rating_idx = st.radio(
            "Select minimum rating:",
            range(len(rating_labels)),
            format_func=lambda x: rating_labels[x],
            key="rating_select",
            index=3  # Default to 4.0
        )
        selected_rating = rating_values[selected_rating_idx]
        
        st.divider()
        
        st.subheader("Step 3: Popularity Preference")
        st.write(questionnaire['question_3_popularity']['question'])
        
        popularity_options = questionnaire['question_3_popularity']['options']
        popularity_labels = []
        popularity_values = []
        for opt in popularity_options:
            label = opt['label']
            if 'description' in opt:
                label += f" - {opt['description']}"
            popularity_labels.append(label)
            popularity_values.append(opt['id'])
        
        selected_popularity_idx = st.radio(
            "Select popularity preference:",
            range(len(popularity_labels)),
            format_func=lambda x: popularity_labels[x],
            key="popularity_select",
            index=2  # Default to balanced
        )
        selected_popularity = popularity_values[selected_popularity_idx]
        
        st.divider()
        
        st.subheader("Step 4: Location Preference (Optional)")
        st.write(questionnaire['question_4_location']['question'])
        
        location_options = questionnaire['question_4_location']['options']
        province_names = [opt['label'] for opt in location_options if opt['id'] != 'anywhere']
        
        selected_provinces = st.multiselect(
            "Select provinces (leave empty for 'Anywhere'):",
            province_names,
            key="province_select"
        )
        
        if not selected_provinces:
            selected_provinces = None
        
        st.divider()
        
        num_recommendations = st.slider(
            "Number of recommendations:",
            min_value=5,
            max_value=50,
            value=10,
            key="num_recs"
        )
        
        submitted = st.form_submit_button("Get Recommendations", type="primary")
    
    if submitted:
        if not selected_subcategories:
            st.error("Please select at least one attraction type to get recommendations.")
        else:
            try:
                with st.spinner("Generating recommendations..."):
                    preferences = system.create_preferences_from_answers(
                        subcategories=selected_subcategories,
                        min_rating=selected_rating,
                        popularity_preference=selected_popularity,
                        provinces=selected_provinces
                    )
                    
                    recommendations = system.get_recommendations(
                        preferences,
                        top_n=num_recommendations
                    )
                
                st.success("Recommendations generated successfully!")
                
                # Display preferences summary
                with st.expander("📋 Your Preferences Summary", expanded=False):
                    st.text(system.onboarding.format_preferences_for_display(preferences))
                
                # Display recommendations
                st.subheader("🎯 Your Recommendations")
                
                # Format the dataframe for better display
                display_df = recommendations.copy()
                display_df['ratings'] = display_df['ratings'].round(2)
                display_df['similarity_score'] = display_df['similarity_score'].round(4)
                display_df['reviews_count'] = display_df['reviews_count'].astype(int)
                
                # Rename columns for better display
                display_df = display_df.rename(columns={
                    'name': 'Place Name',
                    'province_name': 'Province',
                    'category_name': 'Category',
                    'ratings': 'Rating',
                    'reviews_count': 'Reviews',
                    'similarity_score': 'Similarity Score'
                })
                
                st.dataframe(
                    display_df,
                    use_container_width=True,
                    hide_index=True
                )
                
                # Download button
                csv = recommendations.to_csv(index=False)
                st.download_button(
                    label="📥 Download Recommendations as CSV",
                    data=csv,
                    file_name="recommendations.csv",
                    mime="text/csv"
                )
                
            except Exception as e:
                st.error(f"Error generating recommendations: {str(e)}")


def place_based_page():
    """Display place-based recommendations"""
    st.title("🔍 Place-Based Recommendations")
    st.markdown("Find similar places to a specific location")
    
    if not initialize_system():
        return
    
    system = st.session_state.system
    places_data = system.recommender.model_package['places_data']
    
    # Place selection
    st.subheader("Select a Place")
    place_names = sorted(places_data['name'].unique().tolist())
    
    selected_place = st.selectbox(
        "Choose a place:",
        place_names,
        key="place_select"
    )
    
    if selected_place:
        # Show place information
        place_info = places_data[places_data['name'] == selected_place].iloc[0]
        
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Category", place_info['category_name'])
        with col2:
            st.metric("Province", place_info['province_name'])
        with col3:
            st.metric("Rating", f"{place_info['ratings']:.2f}")
        with col4:
            st.metric("Reviews", int(place_info['reviews_count']))
    
    # Optional preference filtering
    with st.expander("🔧 Apply Preference Filters (Optional)", expanded=False):
        st.write("Optionally filter results by your preferences")
        
        col1, col2 = st.columns(2)
        
        with col1:
            questionnaire = system.get_onboarding_questions()
            subcategory_options = questionnaire['question_1_category']['options']
            filter_subcategory_labels = [opt['label'] for opt in subcategory_options]
            filter_subcategory_ids_map = {opt['label']: opt['id'] for opt in subcategory_options}
            
            filter_subcategories = st.multiselect(
                "Filter by attraction types:",
                filter_subcategory_labels,
                key="filter_subcats"
            )
            
            filter_subcategory_ids = [
                filter_subcategory_ids_map[label] 
                for label in filter_subcategories
            ] if filter_subcategories else None
        
        with col2:
            filter_min_rating = st.slider(
                "Minimum rating:",
                min_value=0.0,
                max_value=5.0,
                value=0.0,
                step=0.5,
                key="filter_rating"
            )
    
    num_recommendations = st.slider(
        "Number of recommendations:",
        min_value=5,
        max_value=50,
        value=10,
        key="place_num_recs"
    )
    
    if st.button("Find Similar Places", type="primary"):
        try:
            with st.spinner("Finding similar places..."):
                preferences = None
                if filter_subcategory_ids or filter_min_rating > 0:
                    preferences = system.create_preferences_from_answers(
                        subcategories=filter_subcategory_ids if filter_subcategory_ids else None,
                        categories=[1] if filter_subcategory_ids else None,  # Tourist Attraction
                        min_rating=filter_min_rating,
                        popularity_preference='balanced',
                        provinces=None
                    )
                
                recommendations = system.recommender.get_recommendations_for_place(
                    selected_place,
                    top_n=num_recommendations,
                    preferences=preferences
                )
            
            if isinstance(recommendations, str):
                st.error(recommendations)
            else:
                st.success(f"Found {len(recommendations)} similar places!")
                
                # Format the dataframe
                display_df = recommendations.copy()
                display_df['ratings'] = display_df['ratings'].round(2)
                display_df['similarity_score'] = display_df['similarity_score'].round(4)
                display_df['reviews_count'] = display_df['reviews_count'].astype(int)
                
                # Rename columns
                display_df = display_df.rename(columns={
                    'name': 'Place Name',
                    'province_name': 'Province',
                    'category_name': 'Category',
                    'ratings': 'Rating',
                    'reviews_count': 'Reviews',
                    'similarity_score': 'Similarity Score'
                })
                
                st.dataframe(
                    display_df,
                    use_container_width=True,
                    hide_index=True
                )
                
                # Download button
                csv = recommendations.to_csv(index=False)
                st.download_button(
                    label="📥 Download Recommendations as CSV",
                    data=csv,
                    file_name=f"similar_to_{selected_place.replace(' ', '_')}.csv",
                    mime="text/csv"
                )
        
        except Exception as e:
            st.error(f"Error finding similar places: {str(e)}")


def quick_tests_page():
    """Display quick test scenarios"""
    st.title("⚡ Quick Tests")
    st.markdown("Test the system with pre-configured scenarios")
    
    if not initialize_system():
        return
    
    system = st.session_state.system
    
    # Pre-configured test scenarios (using subcategories for Tourist Attractions)
    all_subcategories = list(system.onboarding.TOURIST_ATTRACTION_SUBCATEGORIES.keys())
    test_scenarios = {
        "Temple Lover": {
            "subcategories": ["temples"],
            "min_rating": 4.5,
            "popularity_preference": "popular",
            "provinces": None,
            "description": "User who loves temples"
        },
        "Museum Enthusiast": {
            "subcategories": ["museums"],
            "min_rating": 4.0,
            "popularity_preference": "balanced",
            "provinces": None,
            "description": "User interested in museums"
        },
        "Park Explorer": {
            "subcategories": ["parks", "water_attractions"],
            "min_rating": 3.5,
            "popularity_preference": "hidden_gems",
            "provinces": None,
            "description": "User looking for parks and water attractions"
        },
        "Phnom Penh Cultural Tour": {
            "subcategories": ["temples", "museums", "monuments", "palaces"],
            "min_rating": 4.0,
            "popularity_preference": "balanced",
            "provinces": ["Phnom Penh"],
            "description": "User exploring Phnom Penh cultural sites"
        },
        "All Attractions": {
            "subcategories": all_subcategories,
            "min_rating": 4.0,
            "popularity_preference": "balanced",
            "provinces": None,
            "description": "User interested in all types of tourist attractions"
        }
    }
    
    st.subheader("Select a Test Scenario")
    
    scenario_names = list(test_scenarios.keys())
    selected_scenario_name = st.selectbox(
        "Choose a scenario:",
        scenario_names,
        key="scenario_select"
    )
    
    if selected_scenario_name:
        scenario = test_scenarios[selected_scenario_name]
        
        st.info(f"**Scenario:** {scenario['description']}")
        
        col1, col2 = st.columns(2)
        with col1:
            if 'subcategories' in scenario:
                subcat_labels = [
                    system.onboarding.TOURIST_ATTRACTION_SUBCATEGORIES.get(sc, {}).get('label', sc)
                    for sc in scenario['subcategories']
                ]
                st.write(f"**Attraction Types:** {', '.join(subcat_labels)}")
            elif 'categories' in scenario:
                st.write(f"**Categories:** {[system.onboarding.CATEGORIES.get(c, f'Unknown({c})') for c in scenario['categories']]}")
            st.write(f"**Min Rating:** {scenario['min_rating']}+")
        with col2:
            st.write(f"**Popularity:** {scenario['popularity_preference'].replace('_', ' ').title()}")
            if scenario.get('provinces'):
                st.write(f"**Provinces:** {', '.join(scenario['provinces'])}")
            else:
                st.write("**Provinces:** Anywhere")
        
        num_recommendations = st.slider(
            "Number of recommendations:",
            min_value=5,
            max_value=50,
            value=10,
            key="quick_test_num_recs"
        )
        
        if st.button("Run Test", type="primary"):
            try:
                with st.spinner("Generating recommendations..."):
                    preferences = system.create_preferences_from_answers(
                        subcategories=scenario.get('subcategories'),
                        categories=scenario.get('categories'),
                        min_rating=scenario['min_rating'],
                        popularity_preference=scenario['popularity_preference'],
                        provinces=scenario.get('provinces')
                    )
                    
                    recommendations = system.get_recommendations(
                        preferences,
                        top_n=num_recommendations
                    )
                
                st.success("Test completed successfully!")
                
                # Display recommendations
                st.subheader("📊 Test Results")
                
                # Format the dataframe
                display_df = recommendations.copy()
                display_df['ratings'] = display_df['ratings'].round(2)
                display_df['similarity_score'] = display_df['similarity_score'].round(4)
                display_df['reviews_count'] = display_df['reviews_count'].astype(int)
                
                # Rename columns
                display_df = display_df.rename(columns={
                    'name': 'Place Name',
                    'province_name': 'Province',
                    'category_name': 'Category',
                    'ratings': 'Rating',
                    'reviews_count': 'Reviews',
                    'similarity_score': 'Similarity Score'
                })
                
                st.dataframe(
                    display_df,
                    use_container_width=True,
                    hide_index=True
                )
                
                # Statistics
                st.subheader("📈 Statistics")
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    st.metric("Total Recommendations", len(recommendations))
                with col2:
                    avg_rating = recommendations['ratings'].mean()
                    st.metric("Average Rating", f"{avg_rating:.2f}")
                with col3:
                    avg_similarity = recommendations['similarity_score'].mean()
                    st.metric("Avg Similarity", f"{avg_similarity:.4f}")
                with col4:
                    total_reviews = recommendations['reviews_count'].sum()
                    st.metric("Total Reviews", f"{total_reviews:,}")
                
                # Download button
                csv = recommendations.to_csv(index=False)
                st.download_button(
                    label="📥 Download Results as CSV",
                    data=csv,
                    file_name=f"{selected_scenario_name.replace(' ', '_')}_results.csv",
                    mime="text/csv"
                )
            
            except Exception as e:
                st.error(f"Error running test: {str(e)}")


# Main app
def main():
    """Main app function"""
    # Sidebar navigation
    st.sidebar.title("🧭 Navigation")
    
    page = st.sidebar.radio(
        "Select a page:",
        ["Home", "Onboarding & Recommendations", "Place-Based Recommendations", "Quick Tests"],
        key="page_select"
    )
    
    st.sidebar.divider()
    
    # System status
    if st.session_state.initialized:
        st.sidebar.success("✅ System Ready")
    else:
        st.sidebar.warning("⚠️ System Not Initialized")
    
    st.sidebar.divider()
    st.sidebar.markdown("### About")
    st.sidebar.info(
        "This app tests the Content-Based Filtering (CBF) recommendation system "
        "for tourism places in Cambodia."
    )
    
    # Route to appropriate page
    if page == "Home":
        home_page()
    elif page == "Onboarding & Recommendations":
        onboarding_page()
    elif page == "Place-Based Recommendations":
        place_based_page()
    elif page == "Quick Tests":
        quick_tests_page()


if __name__ == "__main__":
    main()

