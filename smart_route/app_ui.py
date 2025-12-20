"""
UI Components for Streamlit app
Sidebar, tabs, preferences form, and other UI elements
"""
import streamlit as st
import pandas as pd
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
from app_helpers import load_pois_data

 
def render_header():
    """Render page header"""
    st.markdown('<div class="main-header">🗺️ Quantum Route Optimization</div>', unsafe_allow_html=True)
    st.markdown("""
    <div style="text-align: center; margin-bottom: 2rem;">
        <p style="font-size: 1.2rem;">Optimize your route using quantum algorithms</p>
    </div>
    """, unsafe_allow_html=True)


def calculate_weights_from_traffic_sensitivity(traffic_sensitivity: float) -> Dict[str, float]:
    """
    Calculate weights with proper distribution that always sums to 1.0
    
    Strategy:
    - Traffic weight: 0% to 30% (more reasonable max)
    - At low traffic: Preferences matter more
    - At high traffic: Distance and Time matter more
    """
    traffic_sensitivity = max(0.0, min(1.0, traffic_sensitivity))
    
    # Traffic weight: 0% to 30% (reduced from 40% for better balance)
    traffic_weight = traffic_sensitivity * 0.3
    remaining_weight = 1.0 - traffic_weight
    
    # Distribution of remaining weight based on traffic sensitivity
    # At traffic=0: preferences=50%, distance=30%, time=20%
    # At traffic=1: preferences=10%, distance=50%, time=40%
    
    preferences_factor = 0.5 - 0.4 * traffic_sensitivity  # 50% to 10%
    distance_factor = 0.3 + 0.2 * traffic_sensitivity      # 30% to 50%
    time_factor = 0.2 + 0.2 * traffic_sensitivity         # 20% to 40%
    
    # These factors should already sum to 1.0, but verify
    factor_sum = preferences_factor + distance_factor + time_factor
    if abs(factor_sum - 1.0) > 0.001:  # Allow small floating point error
        # Normalize if needed
        preferences_factor /= factor_sum
        distance_factor /= factor_sum
        time_factor /= factor_sum
    
    return {
        "distance": remaining_weight * distance_factor,
        "time": remaining_weight * time_factor,
        "preferences": remaining_weight * preferences_factor,
        "traffic": traffic_weight
    }


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
            "Choose 2-8 POIs to visit:",
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
    
    # Get selected POIs to auto-update start location
    selected_pois = st.session_state.get('selected_pois', [])
    
    # Auto-update start location from first POI if available
    if selected_pois and len(selected_pois) > 0:
        # Always use first POI's coordinates
        start_lat = selected_pois[0].get('lat', 11.5625)
        start_lon = selected_pois[0].get('lng', 104.9310)
        # Update session state
        st.session_state.start_lat = start_lat
        st.session_state.start_lon = start_lon
    else:
        # Default values when no POIs selected
        start_lat = st.session_state.get('start_lat', 11.5625)
        start_lon = st.session_state.get('start_lon', 104.9310)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📍 Starting Location")
        if selected_pois and len(selected_pois) > 0:
            st.info(f"📍 Automatically set to first POI: **{selected_pois[0]['name']}**")
            # Display read-only coordinates
            col_lat, col_lon = st.columns(2)
            with col_lat:
                st.metric("Latitude", f"{start_lat:.4f}")
            with col_lon:
                st.metric("Longitude", f"{start_lon:.4f}")
        else:
            st.warning("⚠️ Please select POIs in the sidebar to set start location")
            # Display NA when no POIs selected
            col_lat, col_lon = st.columns(2)
            with col_lat:
                st.metric("Latitude", "N/A")
            with col_lon:
                st.metric("Longitude", "N/A")
        
        st.subheader("⏰ Time Settings")
        # Get start time from saved preferences, session state, or use default
        saved_preferences = st.session_state.get('user_preferences', {})
        start_time_str = saved_preferences.get('start_time') or st.session_state.get('start_time', "N/A")
        
        if isinstance(start_time_str, str):
            # Already a string in HH:MM:SS format or "N/A"
            if start_time_str.upper() in ["N/A", "NA", ""]:
                start_time_str = "N/A"
        else:
            # If it's a time object, convert to string
            start_time_str = start_time_str.strftime("%H:%M:%S") if start_time_str else "N/A"
        
        # Store in session state for consistency
        st.session_state.start_time = start_time_str
        
        # Display departure time as read-only
        st.metric("Departure Time", start_time_str)
        
        # Calculate and display estimated current time (start_time + 10 minutes)
        if start_time_str and start_time_str.upper() not in ["N/A", "NA", ""]:
            try:
                time_parts = start_time_str.split(":")
                hours = int(time_parts[0])
                minutes = int(time_parts[1])
                seconds = int(time_parts[2]) if len(time_parts) > 2 else 0
                
                start_datetime = datetime(2000, 1, 1, hours, minutes, seconds)
                estimated_datetime = start_datetime + timedelta(minutes=10)
                estimated_time_str = estimated_datetime.strftime("%H:%M")
                
                st.info(f"🕐 Estimated Current Time: **{estimated_time_str}** (10 minutes after departure)")
            except Exception:
                st.info("🕐 Estimated Current Time: N/A")
        else:
            st.info("🕐 Estimated Current Time: N/A")
        
        trip_duration = st.number_input("Total trip duration per day (hours)", min_value=1, max_value=12, value=8, key="trip_duration", 
                                        help="Maximum duration you want to travel in a day")
    
    with col2:
        st.subheader("🚦 Traffic Sensitivity")
        traffic_sensitivity = st.slider(
            "Traffic Sensitivity", 
            min_value=0.0, 
            max_value=1.0, 
            value=st.session_state.get('traffic_sensitivity', 0.5), 
            step=0.1,
            help="Controls how much traffic affects route optimization. 0 = Ignore traffic, 1 = Avoid all traffic. All constraint weights are automatically calculated based on this setting.", 
            key="traffic_sensitivity"
        )
        
        # Calculate all weights automatically based on traffic sensitivity
        calculated_weights = calculate_weights_from_traffic_sensitivity(traffic_sensitivity)
        
        st.subheader("⚖️ Constraint Weights (Auto-calculated)")
        st.info("ℹ️ All weights are automatically calculated based on Traffic Sensitivity. When traffic sensitivity is high, distance and time are prioritized more; when low, category diversity gets more weight.")
        
        # Display calculated weights in a read-only format
        weights_df = pd.DataFrame([
            {"Constraint": "Distance", "Weight": f"{calculated_weights['distance']:.3f}"},
            {"Constraint": "Time", "Weight": f"{calculated_weights['time']:.3f}"},
            {"Constraint": "Category Diversity", "Weight": f"{calculated_weights['preferences']:.3f}"},
            {"Constraint": "Traffic (from Traffic Sensitivity)", "Weight": f"{calculated_weights['traffic']:.3f}"},
            {"Constraint": "Total", "Weight": f"{sum(calculated_weights.values()):.3f}"}
        ])
        st.dataframe(weights_df, use_container_width=True, hide_index=True)
        st.caption("💡 **Category Diversity**: Weight for category diversity in quantum optimization. Controls whether to prefer similar categories (grouped) or diverse categories (mixed). Higher weight = more emphasis on category diversity.")
        
        # Add clarification note about Category Diversity
        with st.expander("ℹ️ About Category Diversity (Quantum/QUBO)", expanded=False):
            st.markdown("""
            **Category Diversity** (Quantum/QUBO): This weight controls whether the optimizer prefers routes with similar categories grouped together, or routes with diverse categories mixed.
            
            **How it works**: Qubit 2 in the QUBO encoding represents category diversity preference:
            - |0⟩ = prefer similar categories (grouped)
            - |1⟩ = prefer diverse categories (mixed)
            
            **Note**: Quantum optimization does NOT prioritize specific categories (like "Temple"). It only considers whether categories should be similar or diverse.
            """)
    
    preferences = {
        "province": "Phnom Penh",
        "start_lat": start_lat,
        "start_lon": start_lon,
        "start_time": start_time_str,
        "trip_duration": trip_duration,
        "traffic_sensitivity": traffic_sensitivity,
        "traffic_avoidance": False,  # Always False, kept for backward compatibility
        "preferred_category": None,  # Not used in quantum optimization
        "constraint_weights": {
            "distance": calculated_weights["distance"],
            "time": calculated_weights["time"],
            "preferences": calculated_weights["preferences"],
            "traffic": calculated_weights["traffic"],
            "constraints": 0.2
        }
    }
    
    # Always update session state for real-time updates
    st.session_state.user_preferences = preferences
    
    # Save Preferences Button
    st.markdown("---")
    if st.button("💾 Save Preferences", type="primary", use_container_width=True, key="save_preferences_btn"):
        try:
            # Calculate current time + 10 minutes as start_time
            current_time = datetime.now()
            start_time_calculated = current_time + timedelta(minutes=10)
            start_time_str = start_time_calculated.strftime("%H:%M:%S")
            
            # Update preferences with calculated start_time
            preferences['start_time'] = start_time_str
            
            # Update session state
            st.session_state.start_time = start_time_str
            st.session_state.user_preferences = preferences
            
            # Save to JSON file
            preferences_file = Path("data/users/user_preferences.json")
            preferences_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(preferences_file, 'w', encoding='utf-8') as f:
                json.dump(preferences, f, indent=2, ensure_ascii=False)
            
            # Read back the saved preferences to confirm
            with open(preferences_file, 'r', encoding='utf-8') as f:
                saved_preferences = json.load(f)
            
            # Calculate estimated time for display (start_time + 10 minutes)
            estimated_datetime = start_time_calculated + timedelta(minutes=10)
            estimated_time_str = estimated_datetime.strftime("%H:%M")
            
            st.success(f"✅ Preferences saved successfully!")
            st.info(f"🕐 Departure Time: **{start_time_str}** (current time + 10 min) | Estimated Current Time: **{estimated_time_str}** (10 minutes after departure)")
            
            # Display saved preferences
            st.subheader("📄 Saved Preferences")
            st.json(saved_preferences)
            
            # Force rerun to update UI
            st.rerun()
            
        except Exception as e:
            st.error(f"❌ Error saving preferences: {str(e)}")
    
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
            "Closing": f"{poi.get('closing_time', 1440)//60:02d}:{poi.get('closing_time', 1440)%60:02d}"
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

