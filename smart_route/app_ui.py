"""
UI Components for Streamlit app
Sidebar, tabs, preferences form, and other UI elements
"""
import streamlit as st
from typing import Dict, List
from app_helpers import load_pois_data


def render_header():
    """Render page header"""
    st.markdown('<div class="main-header">🗺️ Quantum Route Optimization</div>', unsafe_allow_html=True)
    st.markdown("""
    <div style="text-align: center; margin-bottom: 2rem;">
        <p style="font-size: 1.2rem;">Optimize your route using quantum algorithms</p>
    </div>
    """, unsafe_allow_html=True)


def render_sidebar() -> List[Dict]:
    """Render sidebar with POI selection"""
    with st.sidebar:
        st.header("📍 Select Points of Interest")
        
        pois_data = load_pois_data("phnompenh")
        
        if not pois_data:
            st.error("Could not load POIs. Please check data files.")
            return []
        
        # POI selector
        poi_options = {f"{poi['name']} ({poi['category']})": poi for poi in pois_data}
        selected_poi_names = st.multiselect(
            "Choose 4-8 POIs to visit:",
            options=list(poi_options.keys()),
            default=[],
            max_selections=8
        )
        
        selected_pois = [poi_options[name] for name in selected_poi_names]
        st.session_state.selected_pois = selected_pois
        
        st.info(f"Selected: {len(selected_pois)} POIs")
        
        if selected_pois:
            st.subheader("Selected POIs:")
            for i, poi in enumerate(selected_pois, 1):
                st.write(f"{i}. {poi['name']} ({poi['category']})")
        
        return selected_pois


def render_preferences_tab() -> Dict:
    """Render preferences tab and return user preferences"""
    st.header("User Preferences & Constraints")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📍 Starting Location")
        start_lat = st.number_input("Latitude", value=11.5625, format="%.4f", key="start_lat")
        start_lon = st.number_input("Longitude", value=104.9310, format="%.4f", key="start_lon")
        
        st.subheader("⏰ Time Settings")
        start_time_str = st.time_input("Start Time", value=None, key="start_time")
        if start_time_str:
            start_time_str = start_time_str.strftime("%H:%M:%S")
        else:
            start_time_str = "08:00:00"
        
        trip_duration = st.number_input("Trip Duration (hours)", min_value=1, max_value=12, value=8, key="trip_duration")
        
        st.subheader("📏 Distance Constraints")
        max_distance = st.slider("Max distance from start (km)", 1.0, 20.0, 10.0, step=0.5, key="max_distance")
    
    with col2:
        st.subheader("🚦 Traffic Settings")
        traffic_sensitivity = st.slider(
            "Traffic Sensitivity", min_value=0.0, max_value=1.0, value=0.5, step=0.1,
            help="Higher values prioritize routes with less traffic", key="traffic_sensitivity"
        )
        traffic_avoidance = st.checkbox("Avoid high-traffic routes", value=False, key="traffic_avoidance")
        
        st.subheader("⚖️ Constraint Weights")
        st.markdown("Balance between different objectives:")
        weight_distance = st.slider("Distance", 0.0, 1.0, 0.4, step=0.1, key="weight_distance")
        weight_time = st.slider("Time", 0.0, 1.0, 0.3, step=0.1, key="weight_time")
        weight_preferences = st.slider("Preferences", 0.0, 1.0, 0.2, step=0.1, key="weight_preferences")
        weight_traffic = st.slider("Traffic", 0.0, 1.0, 0.1, step=0.1, key="weight_traffic")
        
        # Normalize weights
        total_weight = weight_distance + weight_time + weight_preferences + weight_traffic
        if total_weight > 0:
            weight_distance /= total_weight
            weight_time /= total_weight
            weight_preferences /= total_weight
            weight_traffic /= total_weight
    
    preferences = {
        "province": "Phnom Penh",
        "start_lat": start_lat,
        "start_lon": start_lon,
        "start_time": start_time_str,
        "trip_duration": trip_duration,
        "max_distance": max_distance,
        "traffic_sensitivity": traffic_sensitivity,
        "traffic_avoidance": traffic_avoidance,
        "constraint_weights": {
            "distance": weight_distance,
            "time": weight_time,
            "preferences": weight_preferences,
            "traffic": weight_traffic,
            "constraints": 0.2
        }
    }
    
    st.session_state.user_preferences = preferences
    st.success("✅ Preferences saved!")
    return preferences


def render_poi_table(pois: List[Dict]):
    """Render POI information table"""
    poi_df_data = []
    for i, poi in enumerate(pois):
        poi_df_data.append({
            "Index": i,
            "Name": poi['name'],
            "Category": poi['category'],
            "Opening": f"{poi.get('opening_time', 0)//60:02d}:{poi.get('opening_time', 0)%60:02d}",
            "Closing": f"{poi.get('closing_time', 1440)//60:02d}:{poi.get('closing_time', 1440)%60:02d}",
            "Duration": f"{poi.get('visit_duration', 60)} min"
        })
    
    st.dataframe(poi_df_data, use_container_width=True)


def render_qaoa_settings() -> Dict:
    """Render QAOA settings and return configuration"""
    st.subheader("⚙️ QAOA Settings")
    col1, col2, col3 = st.columns(3)
    with col1:
        num_layers = st.number_input("Number of Layers (p)", min_value=1, max_value=5, value=2, key="num_layers")
    with col2:
        shots = st.number_input("Shots", min_value=100, max_value=10000, value=1024, step=100, key="shots")
    with col3:
        optimizer = st.selectbox("Optimizer", ["COBYLA", "SPSA"], index=0, key="optimizer")
    
    return {'num_layers': num_layers, 'shots': shots, 'optimizer': optimizer}


def initialize_session_state():
    """Initialize Streamlit session state variables"""
    if 'optimization_result' not in st.session_state:
        st.session_state.optimization_result = None
    if 'selected_pois' not in st.session_state:
        st.session_state.selected_pois = []
    if 'user_preferences' not in st.session_state:
        st.session_state.user_preferences = {}
    if 'comparison_result' not in st.session_state:
        st.session_state.comparison_result = None

