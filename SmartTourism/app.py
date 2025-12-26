"""
Streamlit App for Testing CBF Recommendation System

This app provides an interactive interface to test the content-based filtering
recommendation system with onboarding questionnaire and recommendations display.
"""

import streamlit as st
import pandas as pd
import os
from recommendation_system.recommender import PlaceRecommender
from recommendation_system.cbf_recommender import CBFRecommender
from recommendation_system.cf_recommender import CFRecommender
from recommendation_system.user_profile import create_preferences_from_answers, filter_places_by_preferences
from recommendation_system.data_loader import load_questionnaire

# Page configuration
st.set_page_config(
    page_title="Recommendation System",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
if 'recommender' not in st.session_state:
    st.session_state.recommender = None
if 'initialized' not in st.session_state:
    st.session_state.initialized = False
if 'cbf_model' not in st.session_state:
    st.session_state.cbf_model = None
if 'cf_model' not in st.session_state:
    st.session_state.cf_model = None
if 'questionnaire' not in st.session_state:
    st.session_state.questionnaire = None


def initialize_system():
    """Initialize the recommendation system"""
    if not st.session_state.initialized:
        try:
            with st.spinner("Loading recommendation system..."):
                # Load CBF model
                cbf_model = CBFRecommender()
                cbf_model.load_model('models/cbf_model.pkl')
                st.session_state.cbf_model = cbf_model
                
                # Try to load CF model (optional)
                cf_model = None
                if os.path.exists('models/cf_model/model.keras'):
                    try:
                        cf_model = CFRecommender()
                        cf_model.load_model('models/cf_model')
                        st.session_state.cf_model = cf_model
                    except Exception as e:
                        st.warning(f"CF model not loaded: {e}. Using CBF only.")
                
                # Create recommender
                st.session_state.recommender = PlaceRecommender(
                    cbf_model=cbf_model,
                    cf_model=cf_model,
                    cbf_weight=0.6,
                    cf_weight=0.4
                )
                
                # Load questionnaire
                st.session_state.questionnaire = load_questionnaire('data/questionare.json')
                
                st.session_state.initialized = True
            return True
        except Exception as e:
            st.error(f"Error initializing system: {str(e)}")
            st.info("Make sure 'cbf_model.pkl' exists in models/. Run the notebook to train the model first.")
            import traceback
            st.code(traceback.format_exc())
            return False
    return True


def home_page():

    
    if not initialize_system():
        return
    
    recommender = st.session_state.recommender
    cbf_model = st.session_state.cbf_model
    cf_model = st.session_state.cf_model
    
    # System Information
    st.header("Information Overview")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Total Places", len(cbf_model.places_df))
    
    with col2:
        model_type = "CBF + CF" if cf_model else "CBF Only"
        st.metric("Model Type", model_type)
    
    with col3:
        st.metric("Models Loaded", "✓")
    
    # Dataset Statistics
    st.subheader("Dataset Statistics")
    places_data = cbf_model.places_df
    
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
    
    


def onboarding_page():
    """Display onboarding questionnaire and recommendations"""
    st.title("🎯 Onboarding & Recommendations")
    st.markdown("Complete the questionnaire below to get personalized recommendations")
    
    if not initialize_system():
        return
    
    recommender = st.session_state.recommender
    questionnaire = st.session_state.questionnaire
    
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
            st.caption("Please select at least one attraction type")
        
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
        
        # Get provinces from the places dataset
        cbf_model = st.session_state.cbf_model
        if cbf_model and hasattr(cbf_model, 'places_df') and cbf_model.places_df is not None:
            places_df = cbf_model.places_df
            if 'province_name' in places_df.columns:
                province_names = sorted(places_df['province_name'].dropna().unique().tolist())
            else:
                province_names = []
        else:
            province_names = []
        
        if province_names:
            selected_provinces = st.multiselect(
                "Select provinces (leave empty for 'Anywhere'):",
                province_names,
                key="province_select"
            )
            
            if not selected_provinces:
                selected_provinces = None
        else:
            st.info("Province data not available. All provinces will be included.")
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
                    preferences = create_preferences_from_answers(
                        selected_subcategories=selected_subcategories,
                        selected_rating=selected_rating,
                        selected_popularity=selected_popularity,
                        selected_provinces=selected_provinces
                    )
                    
                    recommendations = recommender.recommend_cbf_only(
                        preferences,
                        k=num_recommendations
                    )
                
                st.success("Recommendations generated successfully!")
                
                # Check if recommendations are empty
                if len(recommendations) == 0:
                    st.warning("No recommendations found matching your preferences. Try adjusting your filters.")
                    return
                
                
                
                # Display recommendations
                st.subheader("🎯 Your Recommendations")
                
                # Format the dataframe for better display
                display_df = recommendations.copy()
                
                # Safely handle columns that might be missing
                if 'ratings' in display_df.columns:
                    display_df['ratings'] = display_df['ratings'].round(2)
                if 'similarity_score' in display_df.columns:
                    display_df['similarity_score'] = display_df['similarity_score'].round(4)
                if 'reviews_count' in display_df.columns:
                    display_df['reviews_count'] = display_df['reviews_count'].astype(int)
                
                # Rename columns for better display (only rename columns that exist)
                rename_dict = {}
                if 'name' in display_df.columns:
                    rename_dict['name'] = 'Place Name'
                if 'province_name' in display_df.columns:
                    rename_dict['province_name'] = 'Province'
                if 'category_name' in display_df.columns:
                    rename_dict['category_name'] = 'Category'
                if 'ratings' in display_df.columns:
                    rename_dict['ratings'] = 'Rating'
                if 'reviews_count' in display_df.columns:
                    rename_dict['reviews_count'] = 'Reviews'
                if 'similarity_score' in display_df.columns:
                    rename_dict['similarity_score'] = 'Similarity Score'
                
                if rename_dict:
                    display_df = display_df.rename(columns=rename_dict)
                
                st.dataframe(
                    display_df,
                    use_container_width=True,
                    hide_index=True
                )
                
                # Download buttons
                csv = recommendations.to_csv(index=False)
                st.download_button(
                    label="Download Recommendations as CSV",
                    data=csv,
                    file_name="recommendations.csv",
                    mime="text/csv"
                )
                
            except Exception as e:
                st.error(f"Error generating recommendations: {str(e)}")


def cf_onboarding_page():
    """Display CF onboarding questionnaire and recommendations"""
    st.title("CF Onboarding & Recommendations")
    st.markdown("Complete the questionnaire below to get personalized recommendations using Collaborative Filtering")
    
    if not initialize_system():
        return
    
    # Check if CF model is available
    cf_model = st.session_state.cf_model
    if cf_model is None:
        st.error("CF model is not available. Please ensure the CF model is trained and saved in 'models/cf_model/'.")
        st.info("The CF model is optional. You can still use CBF recommendations on the 'Onboarding & Recommendations' page.")
        return
    
    recommender = st.session_state.recommender
    questionnaire = st.session_state.questionnaire
    
    # Get available user IDs from CF model
    available_user_ids = sorted(cf_model.user_to_index.keys()) if hasattr(cf_model, 'user_to_index') and cf_model.user_to_index else []
    min_user_id = min(available_user_ids) if available_user_ids else 1
    max_user_id = max(available_user_ids) if available_user_ids else 1000
    
    with st.form("cf_onboarding_form"):
        st.subheader("Step 0: User ID Selection")
        st.write("Select a user ID for collaborative filtering recommendations. CF uses user behavior patterns to make recommendations.")
        
        if available_user_ids:
            user_id = st.number_input(
                "User ID:",
                min_value=min_user_id,
                max_value=max_user_id,
                value=min_user_id,
                step=1,
                key="cf_user_id",
                help=f"Available user IDs: {min_user_id} to {max_user_id}"
            )
            
           
        else:
            user_id = st.number_input(
                "User ID:",
                min_value=1,
                max_value=10000,
                value=1,
                step=1,
                key="cf_user_id",
                help="Enter a user ID. If not in the model, default ratings will be used."
            )
            st.info("User ID mapping not available. Enter any user ID to test.")
        
        
      
        
        
        
        
        num_recommendations = st.slider(
            "Number of recommendations:",
            min_value=5,
            max_value=50,
            value=10,
            key="cf_num_recs"
        )
        
        submitted = st.form_submit_button("Get CF Recommendations")
    
    if submitted:
        try:
            # Get places dataframe
            places_df = st.session_state.cbf_model.places_df if st.session_state.cbf_model else None
            if places_df is None:
                places_df = cf_model.places_df if hasattr(cf_model, 'places_df') else None
            
            if places_df is None:
                st.error("Places data not available.")
                return
            
            # Pure CF mode - use all places
            filtered_places = places_df
            
            # Generate recommendations for the user
            with st.spinner(f"Generating CF recommendations for User {user_id}..."):
                try:
                    recommendations = cf_model.recommend_places(
                        user_id=int(user_id),
                        places_df=filtered_places,
                        k=num_recommendations
                    )
                except Exception as e:
                    st.error(f"Error generating recommendations for User {user_id}: {str(e)}")
                    import traceback
                    st.code(traceback.format_exc())
                    return
            
            # Check if recommendations were generated
            if recommendations is None or len(recommendations) == 0:
                st.warning(f"No recommendations found for this user. Try adjusting your user ID.")
                return
            
            
            
            
            
            # Format the dataframe for better display
            display_df = recommendations.copy()
            
            # Safely handle columns that might be missing
            if 'ratings' in display_df.columns:
                display_df['ratings'] = display_df['ratings'].round(2)
            if 'predicted_rating' in display_df.columns:
                # Convert from 0-1 scale to 0-5 scale for better readability
                display_df['predicted_rating'] = (display_df['predicted_rating'] * 5).round(2)
            if 'reviews_count' in display_df.columns:
                display_df['reviews_count'] = display_df['reviews_count'].astype(int)
            
            # Rename columns for better display
            rename_dict = {}
            if 'name' in display_df.columns:
                rename_dict['name'] = 'Place Name'
            if 'province_name' in display_df.columns:
                rename_dict['province_name'] = 'Province'
            if 'category_name' in display_df.columns:
                rename_dict['category_name'] = 'Category'
            if 'ratings' in display_df.columns:
                rename_dict['ratings'] = 'Rating'
            if 'reviews_count' in display_df.columns:
                rename_dict['reviews_count'] = 'Reviews'
            if 'predicted_rating' in display_df.columns:
                rename_dict['predicted_rating'] = 'Predicted Rating (CF)'
            
            if rename_dict:
                display_df = display_df.rename(columns=rename_dict)
            
            st.dataframe(
                display_df,
                use_container_width=True,
                hide_index=True
            )
            
            # Download button
            csv = recommendations.to_csv(index=False)
            st.download_button(
                label="Download Recommendations as CSV",
                data=csv,
                file_name=f"cf_recommendations_user_{user_id}.csv",
                mime="text/csv"
            )
                
        except Exception as e:
            st.error(f"Error generating CF recommendations: {str(e)}")
            import traceback
            st.code(traceback.format_exc())


def place_based_page():
    """Display place-based recommendations"""
    st.title("Place-Based Recommendations")
    st.markdown("Find similar places to a specific location")
    
    if not initialize_system():
        return
    
    recommender = st.session_state.recommender
    cbf_model = st.session_state.cbf_model
    places_data = cbf_model.places_df
    
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
                # Get place ID
                place_row = places_data[places_data['name'] == selected_place].iloc[0]
                place_id = place_row['placeID']
                
                # Get similar places using CBF
                recommendations = cbf_model.recommend_places(place_id, k=num_recommendations)
                
               
            if isinstance(recommendations, str):
                st.error(recommendations)
            elif len(recommendations) == 0:
                st.warning("No similar places found. Try adjusting your filters.")
            else:
                st.success(f"Found {len(recommendations)} similar places!")
                
                # Format the dataframe
                display_df = recommendations.copy()
                
                # Safely handle columns that might be missing
                if 'ratings' in display_df.columns:
                    display_df['ratings'] = display_df['ratings'].round(2)
                if 'similarity_score' in display_df.columns:
                    display_df['similarity_score'] = display_df['similarity_score'].round(4)
                if 'reviews_count' in display_df.columns:
                    display_df['reviews_count'] = display_df['reviews_count'].astype(int)
                
                # Rename columns (only rename columns that exist)
                rename_dict = {}
                if 'name' in display_df.columns:
                    rename_dict['name'] = 'Place Name'
                if 'province_name' in display_df.columns:
                    rename_dict['province_name'] = 'Province'
                if 'category_name' in display_df.columns:
                    rename_dict['category_name'] = 'Category'
                if 'ratings' in display_df.columns:
                    rename_dict['ratings'] = 'Rating'
                if 'reviews_count' in display_df.columns:
                    rename_dict['reviews_count'] = 'Reviews'
                if 'similarity_score' in display_df.columns:
                    rename_dict['similarity_score'] = 'Similarity Score'
                
                if rename_dict:
                    display_df = display_df.rename(columns=rename_dict)
                
                st.dataframe(
                    display_df,
                    use_container_width=True,
                    hide_index=True
                )
                
                # Download button
                csv = recommendations.to_csv(index=False)
                st.download_button(
                    label="Download Recommendations as CSV",
                    data=csv,
                    file_name=f"similar_to_{selected_place.replace(' ', '_')}.csv",
                    mime="text/csv"
                )
        
        except Exception as e:
            st.error(f"Error finding similar places: {str(e)}")


# Main app
def main():
    """Main app function"""
    # Sidebar navigation
    
    page = st.sidebar.radio(
        "Select a page:",
        ["Home", "Onboarding & Recommendations", "CF Onboarding & Recommendations", "Place-Based Recommendations"],
        key="page_select"
    )
    
    # Route to appropriate page
    if page == "Home":
        home_page()
    elif page == "Onboarding & Recommendations":
        onboarding_page()
    elif page == "CF Onboarding & Recommendations":
        cf_onboarding_page()
    elif page == "Place-Based Recommendations":
        place_based_page()



if __name__ == "__main__":
    main()

