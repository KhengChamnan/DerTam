"""
UI Components for Streamlit app - Clean, Professional Design
Primary color: #01005B with lighter variations
Minimalist approach with reduced emojis
"""
import streamlit as st
import pandas as pd
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
from app_helpers import load_pois_data

# Color palette
PRIMARY = "#01005B"
PRIMARY_LIGHT = "#1a1a7e"
PRIMARY_LIGHTER = "#3333a1"
ACCENT = "#4a90e2"
SUCCESS = "#10b981"
WARNING = "#f59e0b"
ERROR = "#ef4444"
NEUTRAL = "#64748b"

# Set custom CSS for background and text color
st.markdown("""
<style>
body, .main, .stApp {
  background: #fff !important;
  color: #01005B !important;
}
</style>
""", unsafe_allow_html=True)


def render_header():
    """Render clean, modern header"""
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, {PRIMARY} 0%, {PRIMARY_LIGHT} 100%);
                border-radius: 20px;
                padding: 2.5rem 2rem;
                margin-bottom: 2rem;
                box-shadow: 0 10px 40px rgba(1, 0, 91, 0.2);
                text-align: center;">
        <div style="font-size: 2.8rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.5px;">
            Quantum Route Optimizer
        </div>
        <div style="font-size: 1.1rem;
                    color: rgba(255, 255, 255, 0.85);
                    font-weight: 400;">
            AI-powered route planning for optimal tourist experiences
        </div>
    </div>
    """, unsafe_allow_html=True)


def calculate_weights_from_traffic_sensitivity(traffic_sensitivity: float) -> Dict[str, float]:
    """Calculate weights with proper distribution that always sums to 1.0"""
    traffic_sensitivity = max(0.0, min(1.0, traffic_sensitivity))
    
    traffic_weight = traffic_sensitivity * 0.3
    remaining_weight = 1.0 - traffic_weight
    
    preferences_factor = 0.5 - 0.4 * traffic_sensitivity
    distance_factor = 0.3 + 0.2 * traffic_sensitivity
    time_factor = 0.2 + 0.2 * traffic_sensitivity
    
    factor_sum = preferences_factor + distance_factor + time_factor
    if abs(factor_sum - 1.0) > 0.001:
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
    """Render clean, organized sidebar"""
    with st.sidebar:
        # Header
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, {PRIMARY} 0%, {PRIMARY_LIGHT} 100%);
                    color: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(1, 0, 91, 0.3);">
            <div style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.3rem;">
                Smart Route Optimization
            </div>
            <div style="font-size: 0.85rem; opacity: 0.9;">
                Select 2-8 points of interest
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        pois_data = load_pois_data("phnompenh")
        
        if not pois_data:
            st.error("Could not load POIs. Please check data files.")
            return []
        
        # POI selector with custom styling
        st.markdown(f"""
        <style>
            /* Style the multiselect container */
            div[data-baseweb="select"] > div {{
                background-color: white;
                border: 2px solid {PRIMARY_LIGHT};
                border-radius: 10px;
            
            }}
            
            /* Style the multiselect when focused */
            div[data-baseweb="select"]:focus-within > div {{
                border-color: {PRIMARY};
                box-shadow: 0 0 0 3px rgba(1, 0, 91, 0.1);
            }}
            
            /* Style the dropdown menu */
            div[data-baseweb="popover"] {{
                border-radius: 10px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            }}
            
            /* Style the selected tags */
            span[data-baseweb="tag"] {{
                background-color: #e2e8f0 !important;  /* Light grey */
                color: {PRIMARY} !important;           /* Optional: keep text dark blue */
                border-radius: 6px !important;
                font-weight: 500 !important;
            }}
            
            /* Style the label */
            .stMultiSelect label {{
                font-weight: 600 !important;
                color: {PRIMARY} !important;
                font-size: 0.95rem !important;
                margin-bottom: 0.5rem !important;
            }}
        </style>
        """, unsafe_allow_html=True)
        
        poi_options = {f"{poi['name']} ({poi['category']})": poi for poi in pois_data}
        
        selected_poi_names = st.multiselect(
            "Choose your destinations",
            options=list(poi_options.keys()),
            default=[],
            max_selections=8,
            help="Select between 2 and 8 locations for your route",
            placeholder="Search and select locations..."
        )
        
        selected_pois = [poi_options[name] for name in selected_poi_names]
        st.session_state.selected_pois = selected_pois
        
        # Selection status - simple version
        num_selected = len(selected_pois)
        if num_selected == 0:
            status_text = "No selections"
            status_color = NEUTRAL
        elif num_selected < 2:
            status_text = "Add more locations"
            status_color = WARNING
        elif num_selected <= 8:
            status_text = "Ready to optimize"
            status_color = SUCCESS
        else:
            status_text = "Too many selections"
            status_color = ERROR
        
        # Simple status indicator
        st.markdown(f"""
        <div style="display: flex; 
                justify-content: space-between; 
                align-items: center;
                padding: 0.05rem 0;
                margin: 0.05rem 0 0.1rem 0;">
            <div style="font-size: 0.8rem; 
                color: {status_color}; 
                font-weight: 600;">
            {status_text}
            </div>
            <div style="font-size: 1.1rem; 
                font-weight: 700; 
                color: {status_color};">
            {num_selected}/8
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        # Display selected POIs
        if selected_pois:
            st.markdown(f"""
            <div style="border-top: 1px solid #e2e8f0; 
                        padding-top: 0.4rem; 
                        margin-top: 0.4rem;">
                <div style="font-weight: 600; 
                            color: {PRIMARY}; 
                            font-size: 0.95rem; 
                            margin-bottom: 0.7rem;">
                    Selected Route
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            # Category color legend
            category_colors = {
                "Temple": "#9333ea",
                "Museum": ACCENT,
                "Market": WARNING,
                "Park": SUCCESS,
                "Historical": ERROR,
                "Shopping": "#f59e0b"
            }
            
            st.markdown(f"""
            <div style="background: rgba(1, 0, 91, 0.05);
                        border-radius: 8px;
                        padding: 0.75rem;
                        margin: 0.5rem 0 1rem 0;">
                <div style="font-size: 0.75rem; color: {NEUTRAL}; margin-bottom: 0.5rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    Category Colors
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem;">
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <div style="width: 12px; height: 12px; background: #9333ea; border-radius: 3px;"></div>
                        <span style="font-size: 0.75rem; color: {NEUTRAL};">Temple</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <div style="width: 12px; height: 12px; background: {ACCENT}; border-radius: 3px;"></div>
                        <span style="font-size: 0.75rem; color: {NEUTRAL};">Museum</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <div style="width: 12px; height: 12px; background: {WARNING}; border-radius: 3px;"></div>
                        <span style="font-size: 0.75rem; color: {NEUTRAL};">Market</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <div style="width: 12px; height: 12px; background: {SUCCESS}; border-radius: 3px;"></div>
                        <span style="font-size: 0.75rem; color: {NEUTRAL};">Park</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <div style="width: 12px; height: 12px; background: {ERROR}; border-radius: 3px;"></div>
                        <span style="font-size: 0.75rem; color: {NEUTRAL};">Historical</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <div style="width: 12px; height: 12px; background: #f59e0b; border-radius: 3px;"></div>
                        <span style="font-size: 0.75rem; color: {NEUTRAL};">Shopping</span>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            for i, poi in enumerate(selected_pois, 1):
                color = category_colors.get(poi['category'], PRIMARY_LIGHT)
                
                st.markdown(f"""
                <div style="background: white;
                            border-left: 3px solid {color};
                            border-radius: 8px;
                            padding: 0.75rem;
                            margin: 0.5rem 0;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <div style="background: {color};
                                    color: white;
                                    border-radius: 6px;
                                    min-width: 26px;
                                    height: 26px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-weight: 700;
                                    font-size: 0.85rem;">
                            {i}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: #1e293b; font-size: 0.9rem;">
                                {poi['name']}
                            </div>
                            <div style="font-size: 0.75rem; color: {color}; margin-top: 0.1rem;">
                                {poi['category']}
                            </div>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
        
        return selected_pois


def render_preferences_tab() -> Dict:
    """Render clean preferences tab with better organization"""
    
    selected_pois = st.session_state.get('selected_pois', [])
    
    if selected_pois and len(selected_pois) > 0:
        start_lat = selected_pois[0].get('lat', 11.5625)
        start_lon = selected_pois[0].get('lng', 104.9310)
        st.session_state.start_lat = start_lat
        st.session_state.start_lon = start_lon
    else:
        start_lat = st.session_state.get('start_lat', 11.5625)
        start_lon = st.session_state.get('start_lon', 104.9310)
    
    # Starting Location Section
    st.markdown("### Starting Location")
    
    if selected_pois and len(selected_pois) > 0:
        st.markdown(f"""
        <div style="background: linear-gradient(135deg, {PRIMARY} 0%, {PRIMARY_LIGHT} 100%); 
                    border-radius: 12px; 
                    padding: 1.5rem; 
                    color: white; 
                    margin: 1rem 0;
                    box-shadow: 0 4px 16px rgba(1, 0, 91, 0.2);">
            <div style="font-size: 1rem; margin-bottom: 0.8rem; opacity: 0.9; font-weight: 500;">
                Journey Starts At
            </div>
            <div style="font-size: 1.6rem; font-weight: 700; margin-bottom: 1.2rem;">
                {selected_pois[0]['name']}
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="background: rgba(255, 255, 255, 0.12);
                            border-radius: 8px;
                            padding: 0.8rem;">
                    <div style="opacity: 0.85; font-size: 0.8rem; margin-bottom: 0.3rem;">
                        Latitude
                    </div>
                    <div style="font-weight: 700; font-size: 1.2rem;">
                        {start_lat:.4f}°
                    </div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.12);
                            border-radius: 8px;
                            padding: 0.8rem;">
                    <div style="opacity: 0.85; font-size: 0.8rem; margin-bottom: 0.3rem;">
                        Longitude
                    </div>
                    <div style="font-weight: 700; font-size: 1.2rem;">
                        {start_lon:.4f}°
                    </div>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        st.info("Your journey begins at your first selected POI")
    else:
        st.markdown(f"""
        <div style="background: rgba(239, 68, 68, 0.1);
                    border-left: 3px solid {ERROR};
                    border-radius: 8px;
                    padding: 1rem;
                    margin: 1rem 0;">
            <div style="font-size: 1rem; font-weight: 600; color: {ERROR}; margin-bottom: 0.3rem;">
                No Starting Location
            </div>
            <div style="color: {NEUTRAL}; font-size: 0.9rem;">
                Please select POIs in the sidebar to set your starting location
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Time Configuration Section
    st.markdown("### Time Configuration")
    
    col1, col2 = st.columns(2)
    
    with col1:
        saved_preferences = st.session_state.get('user_preferences', {})
        start_time_str = saved_preferences.get('start_time') or st.session_state.get('start_time', "N/A")
        
        if isinstance(start_time_str, str):
            if start_time_str.upper() in ["N/A", "NA", ""]:
                start_time_str = "N/A"
        else:
            start_time_str = start_time_str.strftime("%H:%M:%S") if start_time_str else "N/A"
        
        st.session_state.start_time = start_time_str

        # Calculate and display departure time
        if start_time_str == "N/A":
            display_time = "Not Set"
            time_label = "Please save preferences to set time"
        else:
            try:
                time_parts = start_time_str.split(":")
                hours = int(time_parts[0])
                minutes = int(time_parts[1])
                seconds = int(time_parts[2]) if len(time_parts) > 2 else 0
                start_datetime = datetime(2000, 1, 1, hours, minutes, seconds)
                # Add 10 minutes
                adjusted_time = start_datetime + timedelta(minutes=10)
                display_time = adjusted_time.strftime("%I:%M %p")
                time_label = "Journey starts 10 minutes from save"
            except Exception:
                display_time = start_time_str
                time_label = "Departure time"

        st.markdown("**Departure Time**")
        st.markdown(f"""
        <div style="background: white;
                    border: 2px solid {ACCENT};
                    border-radius: 10px;
                    padding: 1.5rem;
                    margin: 0.5rem 0;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="color: {ACCENT}; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">
                {display_time}
            </div>
            <div style="color: {NEUTRAL}; font-size: 0.85rem;">
                {time_label}
            </div>
        </div>
        """, unsafe_allow_html=True)
        
       
    
    with col2:
        st.markdown("**Trip Duration**")
        
        trip_duration = st.slider(
            "How many hours do you want to spend traveling?",
            min_value=1,
            max_value=12,
            value=8,
            key="trip_duration",
            help="Select the total duration of your trip in hours"
        )
        
        duration_percentage = (trip_duration / 12) * 100
        
        # Calculate end time
        if start_time_str != "N/A":
            try:
                time_parts = start_time_str.split(":")
                hours = int(time_parts[0])
                minutes = int(time_parts[1])
                start_datetime = datetime(2000, 1, 1, hours, minutes)
                end_datetime = start_datetime + timedelta(hours=trip_duration, minutes=10)
                end_time_display = end_datetime.strftime("%I:%M %p")
                time_range = f"Ends at {end_time_display}"
            except Exception:
                time_range = f"{trip_duration} hours of travel"
        else:
            time_range = f"{trip_duration} hours of travel"
        
        st.markdown(f"""
        <div style="background: white;
                    border: 2px solid {PRIMARY};
                    border-radius: 10px;
                    padding: 1.5rem;
                    margin: 0.5rem 0;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="font-size: 2.5rem; font-weight: 700; color: {PRIMARY}; margin-bottom: 0.5rem;">
                {trip_duration} hours
            </div>
            <div style="color: {NEUTRAL}; font-size: 0.85rem; margin-bottom: 1rem;">
                {time_range}
            </div>
            <div style="margin-top: 1rem;">
                <div style="background: #e2e8f0; border-radius: 8px; height: 8px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, {PRIMARY} 0%, {PRIMARY_LIGHT} 100%); 
                                height: 100%; 
                                width: {duration_percentage}%; 
                                transition: width 0.3s ease;">
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; color: {NEUTRAL}; font-size: 0.7rem;">
                    <span>1h</span>
                    <span>6h</span>
                    <span>12h</span>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Traffic & Optimization Section
    st.markdown("### Traffic & Optimization")
    
    st.markdown(f"""
    <div style="background: rgba(74, 144, 226, 0.1);
                border-left: 3px solid {ACCENT};
                border-radius: 8px;
                padding: 1rem;
                margin: 1rem 0;">
        <div style="color: {ACCENT}; font-size: 0.95rem; line-height: 1.6;">
            <strong>Smart Weight Calculation:</strong> Adjust traffic sensitivity below. 
            All other weights are automatically balanced.
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    traffic_sensitivity = st.slider(
        "Traffic Sensitivity Level",
        min_value=0.0,
        max_value=1.0,
        value=st.session_state.get('traffic_sensitivity', 0.5),
        step=0.1,
        help="0 = Ignore traffic | 1 = Avoid all traffic",
        key="traffic_sensitivity"
    )
    
    # Traffic indicator
    traffic_labels = ["Low Priority", "Moderate", "High Priority", "Critical"]
    traffic_idx = min(int(traffic_sensitivity * 4), 3)
    traffic_colors_list = [SUCCESS, WARNING, "#fb923c", ERROR]
    current_traffic_color = traffic_colors_list[traffic_idx]
    
    st.markdown(f"""
    <div style="background: white;
                border: 2px solid {current_traffic_color};
                border-radius: 10px;
                padding: 1rem;
                margin: 1rem 0;
                text-align: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="color: {current_traffic_color}; font-weight: 700; font-size: 1.2rem;">
            {traffic_labels[traffic_idx]}
        </div>
        <div style="color: {NEUTRAL}; font-size: 0.85rem; margin-top: 0.3rem;">
            Traffic avoidance level
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Calculate weights
    calculated_weights = calculate_weights_from_traffic_sensitivity(traffic_sensitivity)
    
    st.markdown("---")
    st.markdown("#### Optimization Weights")
    
    # Weight cards
    weight_items = [
        ("Distance", calculated_weights['distance'], PRIMARY),
        ("Time", calculated_weights['time'], PRIMARY_LIGHT),
        ("Diversity", calculated_weights['preferences'], SUCCESS),
        ("Traffic", calculated_weights['traffic'], WARNING)
    ]
    
    cols = st.columns(4)
    for col, (label, weight, color) in zip(cols, weight_items):
        with col:
            percentage = weight * 100
            st.markdown(f"""
            <div style="background: white;
                        border: 2px solid {color};
                        border-radius: 10px;
                        padding: 1rem;
                        text-align: center;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <div style="font-size: 0.8rem; color: {NEUTRAL}; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">
                    {label}
                </div>
                <div style="font-size: 1.8rem; font-weight: 700; color: {color}; margin-bottom: 0.5rem;">
                    {percentage:.1f}%
                </div>
                <div style="background: #e2e8f0; border-radius: 6px; height: 6px; overflow: hidden;">
                    <div style="background: {color}; height: 100%; width: {percentage}%;"></div>
                </div>
            </div>
            """, unsafe_allow_html=True)
    
    # Build preferences object
    preferences = {
        "province": "Phnom Penh",
        "start_lat": start_lat,
        "start_lon": start_lon,
        "start_time": start_time_str,
        "trip_duration": trip_duration,
        "traffic_sensitivity": traffic_sensitivity,
        "traffic_avoidance": False,
        "preferred_category": None,
        "constraint_weights": {
            "distance": calculated_weights["distance"],
            "time": calculated_weights["time"],
            "preferences": calculated_weights["preferences"],
            "traffic": calculated_weights["traffic"],
            "constraints": 0.2
        }
    }
    
    st.session_state.user_preferences = preferences
    
    st.markdown("---")
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Custom styled save button
    st.markdown(f"""
    <style>
        div[data-testid="stButton"] button[kind="primary"] {{
            background: linear-gradient(135deg, {PRIMARY} 0%, {PRIMARY_LIGHT} 100%) !important;
            border: none !important;
            padding: 0.75rem 2rem !important;
            font-weight: 600 !important;
            font-size: 1.05rem !important;
            border-radius: 10px !important;
            box-shadow: 0 4px 12px rgba(1, 0, 91, 0.3) !important;
            transition: all 0.3s ease !important;
        }}
        div[data-testid="stButton"] button[kind="primary"]:hover {{
            box-shadow: 0 6px 20px rgba(1, 0, 91, 0.4) !important;
            transform: translateY(-2px) !important;
        }}
    </style>
    """, unsafe_allow_html=True)
  
    
    if st.button("💾 Save Preferences", type="primary", use_container_width=True, key="save_preferences_btn"):
        try:
            current_time = datetime.now()
            start_time_calculated = current_time + timedelta(minutes=10)
            start_time_str = start_time_calculated.strftime("%H:%M:%S")
            
            preferences['start_time'] = start_time_str
            st.session_state.start_time = start_time_str
            st.session_state.user_preferences = preferences
            
            preferences_file = Path("data/users/user_preferences.json")
            preferences_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(preferences_file, 'w', encoding='utf-8') as f:
                json.dump(preferences, f, indent=2, ensure_ascii=False)
            
            with open(preferences_file, 'r', encoding='utf-8') as f:
                saved_preferences = json.load(f)
            
            estimated_datetime = start_time_calculated + timedelta(minutes=10)
            estimated_time_str = estimated_datetime.strftime("%H:%M")
            
            st.balloons()
            st.success("Preferences saved successfully!")
            
            st.markdown(f"""
            <div style="background: white;
                        border: 2px solid {SUCCESS};
                        border-radius: 12px;
                        padding: 1.5rem;
                        margin: 1rem 0;
                        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                    <div style="text-align: center; padding: 1rem;">
                        <div style="font-size: 0.8rem; color: {NEUTRAL}; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">
                            Departure Time
                        </div>
                        <div style="font-size: 2.2rem; font-weight: 700; color: {SUCCESS}; font-family: 'Courier New', monospace;">
                            {start_time_str}
                        </div>
                        <div style="font-size: 0.75rem; color: {NEUTRAL}; margin-top: 0.3rem;">
                            Current + 10 min
                        </div>
                    </div>
                    <div style="text-align: center; padding: 1rem;">
                        <div style="font-size: 0.8rem; color: {NEUTRAL}; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">
                            Estimated Current
                        </div>
                        <div style="font-size: 2.2rem; font-weight: 700; color: {ACCENT}; font-family: 'Courier New', monospace;">
                            {estimated_time_str}
                        </div>
                        <div style="font-size: 0.75rem; color: {NEUTRAL}; margin-top: 0.3rem;">
                            Departure + 10 min
                        </div>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            with st.expander("View Saved Configuration"):
                st.json(saved_preferences)
            
            st.rerun()
            
        except Exception as e:
            st.error(f"Error saving preferences: {str(e)}")
    
    return preferences


def render_qaoa_settings() -> Dict:
    """Render clean QAOA settings panel"""
    st.markdown(f"""
    <div style="background: rgba(1, 0, 91, 0.05);
                border-left: 3px solid {PRIMARY};
                border-radius: 8px;
                padding: 1rem;
                margin: 1rem 0;">
        <div style="font-size: 1rem; font-weight: 600; color: {PRIMARY}; margin-bottom: 0.3rem;">
            Quantum Algorithm Configuration
        </div>
        <div style="color: {NEUTRAL}; font-size: 0.9rem;">
            Fine-tune QAOA parameters for optimal performance
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("**Number Of Layers**")
        num_layers = st.number_input(
            "Number of Layers (p)",
            min_value=1,
            max_value=5,
            value=2,
            key="num_layers",
            help="More layers = better optimization but slower",
            label_visibility="collapsed"
        )
        st.caption(f"Using {num_layers} layer{'s' if num_layers > 1 else ''}")
        
    with col2:
        st.markdown("**Measurements**")
        shots = st.number_input(
            "Shots",
            min_value=100,
            max_value=10000,
            value=1024,
            step=100,
            key="shots",
            help="Number of quantum measurements",
            label_visibility="collapsed"
        )
        st.caption(f"{shots:,} measurements")
        
    with col3:
        st.markdown("**Optimizer**")
        optimizer = st.selectbox(
            "Optimizer",
            ["COBYLA", "SPSA"],
            index=0,
            key="optimizer",
            help="Classical optimizer for parameters",
            label_visibility="collapsed"
        )
        st.caption(f"Using {optimizer}")
    
    return {'num_layers': num_layers, 'shots': shots, 'optimizer': optimizer}


def render_optimized_route_summary(optimization_result: Dict):
    """Render the optimized route summary in a clean, dark-themed card"""
    import numpy as np
    
    route_pois = optimization_result['route_pois']
    result = optimization_result['result']
    
    # Calculate total distance
    distance_matrix = np.array(optimization_result['distance_matrix'])
    total_distance = sum(
        distance_matrix[optimization_result['route'][i]][optimization_result['route'][i+1]]
        for i in range(len(optimization_result['route']) - 1)
    )
    
    # Calculate total time
    time_matrix = np.array(optimization_result['time_matrix'])
    total_time = sum(
        time_matrix[optimization_result['route'][i]][optimization_result['route'][i+1]]
        for i in range(len(optimization_result['route']) - 1)
    )
    
    # Get energy value
    energy = result.get('energy', 0)
    if isinstance(energy, complex):
        energy = float(energy.real)
    else:
        energy = float(energy)
    
    # Build route text
    route_text = " → ".join([
        f"{i+1}. {poi['name']}" 
        for i, poi in enumerate(route_pois)
    ])
    
    # Valid solution status
    is_valid = result.get('is_valid', False)
    valid_text = "Yes" if is_valid else "No"
    
    # Render the summary card
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                border-radius: 20px;
                padding: 2.5rem;
                margin: 2rem 0;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                color: white;">
        <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 2rem;">
            <div style="font-size: 1.5rem;">✅</div>
            <div style="font-size: 1.8rem; font-weight: 700; color: white;">
                Optimized Route:
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1rem;">
                <div style="font-size: 1.2rem;">✅</div>
                <div style="font-size: 1.1rem; font-weight: 600; color: white;">
                    Valid Solution
                </div>
                <div style="font-size: 1.1rem; color: #a0a0a0; margin-left: 0.5rem;">
                    {valid_text}
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <div style="font-size: 1rem; font-weight: 600; color: #a0a0a0; margin-bottom: 0.8rem;">
                Route
            </div>
            <div style="font-size: 1.2rem; color: white; line-height: 1.8;">
                {route_text}
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; margin-top: 2rem;">
            <div>
                <div style="font-size: 0.9rem; color: #a0a0a0; margin-bottom: 0.5rem; font-weight: 600;">
                    Total Distance
                </div>
                <div style="font-size: 1.8rem; font-weight: 700; color: white;">
                    {total_distance:.2f} km
                </div>
            </div>
            <div>
                <div style="font-size: 0.9rem; color: #a0a0a0; margin-bottom: 0.5rem; font-weight: 600;">
                    Total Travel Time
                </div>
                <div style="font-size: 1.8rem; font-weight: 700; color: white;">
                    {total_time:.1f} min
                </div>
            </div>
            <div>
                <div style="font-size: 0.9rem; color: #a0a0a0; margin-bottom: 0.5rem; font-weight: 600;">
                    Energy
                </div>
                <div style="font-size: 1.8rem; font-weight: 700; color: white;">
                    {energy:.4f}
                </div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)


def initialize_session_state():
    """Initialize Streamlit session state variables - Backend unchanged"""
    if 'optimization_result' not in st.session_state:
        st.session_state.optimization_result = None
    if 'selected_pois' not in st.session_state:
        st.session_state.selected_pois = []
    if 'user_preferences' not in st.session_state:
        st.session_state.user_preferences = {}
    if 'comparison_result' not in st.session_state:
        st.session_state.comparison_result = None