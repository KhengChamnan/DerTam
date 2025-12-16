"""
Smart Tourist Route Optimization - Streamlit App
User Input Interface
"""
import streamlit as st

# Page configuration
st.set_page_config(
    page_title="Smart Route Optimization",
    page_icon="🗺️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        padding: 1rem 0;
    }
    .input-section {
        background-color: #f0f2f6;
        border-radius: 10px;
        padding: 2rem;
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Title
st.markdown('<div class="main-header">🗺️ Smart Tourist Route Optimization</div>', unsafe_allow_html=True)
st.markdown("""
<div style="text-align: center; margin-bottom: 2rem;">
    <p style="font-size: 1.2rem;">Plan your perfect trip</p>
</div>
""", unsafe_allow_html=True)

# Main input form
with st.container():
    st.markdown('<div class="input-section">', unsafe_allow_html=True)
    
    st.header("🎯 Tell us about your trip")
    
    # Province selection
    province = st.selectbox(
        "📍 Where do you want to go?",
        ["Phnom Penh", "Siem Reap", "Sihanoukville", "Battambang"],
        index=0
    )
    
    # Start location
    st.subheader("📌 Starting Point")
    col1, col2 = st.columns(2)
    start_lat = col1.number_input("Latitude", value=11.5625, format="%.4f")
    start_lon = col2.number_input("Longitude", value=104.9310, format="%.4f")
    
    # Time settings
    st.subheader("⏰ When and How Long?")
    col1, col2 = st.columns(2)
    start_time = col1.time_input("Start Time", value=None)
    trip_duration = col2.number_input("Trip Duration (hours)", min_value=1, max_value=12, value=8)
    
    # Distance constraint
    max_distance = st.slider("Maximum distance from start (km)", 1.0, 20.0, 10.0, step=0.5)
    
    # Number of POIs
    num_pois = st.slider("How many places would you like to visit?", 3, 6, 4)
    
    # Category preferences
    st.subheader("🎨 What interests you?")
    st.markdown("*Adjust the sliders based on your interests (0 = Not interested, 10 = Very interested)*")
    
    col1, col2 = st.columns(2)
    
    with col1:
        historical = st.slider("🏛️ Historical Sites", 0, 10, 8)
        temple = st.slider("🕌 Temples", 0, 10, 9)
        museum = st.slider("🏛️ Museums", 0, 10, 6)
        market = st.slider("🛒 Markets", 0, 10, 5)
    
    with col2:
        park = st.slider("🌳 Parks", 0, 10, 7)
        mall = st.slider("🏬 Shopping Malls", 0, 10, 3)
        entertainment = st.slider("🎭 Entertainment", 0, 10, 5)
        beach = st.slider("🏖️ Beaches", 0, 10, 6)
    
    st.markdown('</div>', unsafe_allow_html=True)

# Action buttons
col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    if st.button("🚀 Find My Perfect Route", type="primary", use_container_width=True):
        st.success("✅ Your preferences have been recorded!")
        st.info("🔜 Route optimization coming soon...")
        
        # Display collected data
        with st.expander("📋 Your Trip Details"):
            st.write(f"**Destination:** {province}")
            st.write(f"**Starting Point:** {start_lat}, {start_lon}")
            st.write(f"**Start Time:** {start_time}")
            st.write(f"**Duration:** {trip_duration} hours")
            st.write(f"**Max Distance:** {max_distance} km")
            st.write(f"**Number of Places:** {num_pois}")
            st.write("**Interests:**")
            interests = {
                "Historical": historical,
                "Temple": temple,
                "Museum": museum,
                "Market": market,
                "Park": park,
                "Mall": mall,
                "Entertainment": entertainment,
                "Beach": beach
            }
            for category, value in interests.items():
                if value > 0:
                    st.write(f"  - {category}: {value}/10")

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666;">
    <p>🗺️ Smart Tourist Route Optimization | Coming Soon 🚀</p>
</div>
""", unsafe_allow_html=True)
