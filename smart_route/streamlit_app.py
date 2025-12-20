"""
Smart Tourist Route Optimization - Streamlit App
Complete UI with POI selection, preferences, and quantum optimization
"""
import streamlit as st
import json
import numpy as np
from pathlib import Path
import sys
from typing import List, Dict, Optional

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from utils.json_data_manager import JSONDataManager
from utils.distance_calculator import DistanceCalculator
from classical_optimizer.feature_engineer import FeatureEngineer
from quantum_optimizer.qubo_encoder import QUBOEncoder
from quantum_optimizer.qaoa_solver import QAOASolver
from quantum_optimizer.route_decoder import RouteDecoder
from quantum_optimizer.circuit_visualizer import CircuitVisualizer
import plotly.graph_objects as go
import plotly.express as px

# Page configuration
st.set_page_config(
    page_title="Quantum Route Optimization",
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
    .metric-card {
        background-color: #f0f2f6;
        border-radius: 10px;
        padding: 1rem;
        margin: 0.5rem 0;
    }
    .stButton>button {
        width: 100%;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'optimization_result' not in st.session_state:
    st.session_state.optimization_result = None
if 'selected_pois' not in st.session_state:
    st.session_state.selected_pois = []
if 'user_preferences' not in st.session_state:
    st.session_state.user_preferences = {}
if 'comparison_result' not in st.session_state:
    st.session_state.comparison_result = None

# Title
st.markdown('<div class="main-header">🗺️ Quantum Route Optimization</div>', unsafe_allow_html=True)
st.markdown("""
<div style="text-align: center; margin-bottom: 2rem;">
    <p style="font-size: 1.2rem;">Optimize your route using quantum algorithms</p>
</div>
""", unsafe_allow_html=True)

# Sidebar - POI Selection
with st.sidebar:
    st.header("📍 Select Points of Interest")
    
    # Load POIs
    data_manager = JSONDataManager()
    pois_data = data_manager.load_pois("phnompenh")
    
    if not pois_data:
        # Try loading from file directly
        base_path = Path(__file__).parent
        poi_file = base_path / "data" / "pois" / "phnompenh_pois.json"
        if poi_file.exists():
            with open(poi_file, 'r') as f:
                data = json.load(f)
                pois_data = data.get('pois', [])
    
    if pois_data:
        # POI selector
        poi_options = {f"{poi['name']} ({poi['category']})": poi for poi in pois_data}
        selected_poi_names = st.multiselect(
            "Choose 4-8 POIs to visit:",
            options=list(poi_options.keys()),
            default=[],
            max_selections=8
        )
        
        # Filter selected POIs
        selected_pois = [poi_options[name] for name in selected_poi_names]
        st.session_state.selected_pois = selected_pois
        
        st.info(f"Selected: {len(selected_pois)} POIs")
        
        # Display selected POIs
        if selected_pois:
            st.subheader("Selected POIs:")
            for i, poi in enumerate(selected_pois, 1):
                st.write(f"{i}. {poi['name']} ({poi['category']})")
    else:
        st.error("Could not load POIs. Please check data files.")
        selected_pois = []

# Main content area
tab1, tab2, tab3, tab4, tab5 = st.tabs(["⚙️ Preferences", "🚀 Optimize", "📊 Results", "🔬 Circuit", "📊 Compare"])

# Tab 1: Preferences
with tab1:
    st.header("User Preferences & Constraints")
    
    col1, col2 = st.columns(2)
    
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("📍 Starting Location")
        start_lat = st.number_input("Latitude", value=11.5625, format="%.4f", key="start_lat")
        start_lon = st.number_input("Longitude", value=104.9310, format="%.4f", key="start_lon")

        st.subheader("⏰ Departure Time")
        start_time_str = st.time_input("Departure Time", value=None, key="start_time")
        if start_time_str:
            start_time_str = start_time_str.strftime("%H:%M:%S")
        else:
            start_time_str = "08:00:00"

        trip_duration = st.number_input("Total Trip Duration per Day (hours)", min_value=1, max_value=12, value=8, key="trip_duration")

        st.subheader("📏 Max Distance Constraint")
        max_distance = st.slider(
            "Max distance from start (km)",
            1.0, 20.0, 10.0, step=0.5, key="max_distance",
            help="If the optimal route exceeds this distance, the algorithm will try to keep within this limit, but may not always be possible if POIs are far apart."
        )

    with col2:
        st.subheader("🚦 Traffic Settings")
        st.markdown("""
        <span style='font-size:0.95em;'>
        <b>Traffic Sensitivity:</b> 0 = Ignore traffic, 1 = Strongly avoid traffic.<br>
        If you check <b>'Avoid high-traffic routes'</b>, traffic sensitivity will be set to 1 and constraints will be auto-adjusted.
        </span>
        """, unsafe_allow_html=True)

        traffic_avoidance = st.checkbox("Avoid high-traffic routes (auto constraint)", value=False, key="traffic_avoidance")

        if traffic_avoidance:
            traffic_sensitivity = 1.0
        else:
            traffic_sensitivity = st.slider(
                "Traffic Sensitivity",
                min_value=0.0,
                max_value=1.0,
                value=0.5,
                step=0.1,
                help="0 = Ignore traffic, 1 = Strongly avoid traffic",
                key="traffic_sensitivity"
            )

        st.subheader("⚖️ Constraint Weights")
        st.markdown("Balance between different objectives:")

        # Preference focus radio
        preference_focus = st.radio(
            "Preference Focus",
            ["Shortest Distance", "Least Time", "Most Attractions", "Least Traffic"],
            index=0,
            key="preference_focus",
            help="Choose what you care about most. This will auto-adjust weights, but you can fine-tune manually."
        )

        # Default weights based on preference
        default_weights = {
            "Shortest Distance": (0.7, 0.1, 0.1, 0.1),
            "Least Time": (0.2, 0.7, 0.05, 0.05),
            "Most Attractions": (0.2, 0.2, 0.5, 0.1),
            "Least Traffic": (0.1, 0.1, 0.1, 0.7)
        }
        d_w, t_w, p_w, tr_w = default_weights[preference_focus]

        # If auto constraint, override weights
        if traffic_avoidance:
            weight_distance = 0.1
            weight_time = 0.1
            weight_preferences = 0.1
            weight_traffic = 0.7
            st.info("Auto constraint enabled: Traffic prioritized, other constraints reduced.")
        else:
            weight_distance = st.slider("Distance", 0.0, 1.0, d_w, step=0.1, key="weight_distance")
            weight_time = st.slider("Time", 0.0, 1.0, t_w, step=0.1, key="weight_time")
            weight_preferences = st.slider("Preferences", 0.0, 1.0, p_w, step=0.1, key="weight_preferences")
            weight_traffic = st.slider("Traffic", 0.0, 1.0, tr_w, step=0.1, key="weight_traffic")

        # Normalize weights
        total_weight = weight_distance + weight_time + weight_preferences + weight_traffic
        if total_weight > 0:
            weight_distance /= total_weight
            weight_time /= total_weight
            weight_preferences /= total_weight
            weight_traffic /= total_weight

    # Save preferences
    st.session_state.user_preferences = {
        "province": "Phnom Penh",
        "start_lat": start_lat,
        "start_lon": start_lon,
        "start_time": start_time_str,
        "trip_duration": trip_duration,
        "max_distance": max_distance,
        "traffic_sensitivity": traffic_sensitivity,
        "traffic_avoidance": traffic_avoidance,
        "preference_focus": preference_focus,
        "constraint_weights": {
            "distance": weight_distance,
            "time": weight_time,
            "preferences": weight_preferences,
            "traffic": weight_traffic,
            "constraints": 0.2  # Weight for constraint violations
        }
    }

    st.success("✅ Preferences saved!")
# Tab 2: Optimize
with tab2:
    st.header("🚀 Route Optimization")
    
    if not st.session_state.selected_pois:
        st.warning("⚠️ Please select 4-8 POIs in the sidebar first!")
        st.stop()
    
    if len(st.session_state.selected_pois) < 4:
        st.error("❌ Please select at least 4 POIs (maximum 8)")
        st.stop()
    
    if len(st.session_state.selected_pois) > 8:
        st.error("❌ Maximum 8 POIs allowed")
        st.stop()
    
    # Display selected POIs
    st.subheader("Selected POIs:")
    poi_df_data = []
    for i, poi in enumerate(st.session_state.selected_pois):
        poi_df_data.append({
            "Index": i,
            "Name": poi['name'],
            "Category": poi['category'],
            "Opening": f"{poi.get('opening_time', 0)//60:02d}:{poi.get('opening_time', 0)%60:02d}",
            "Closing": f"{poi.get('closing_time', 1440)//60:02d}:{poi.get('closing_time', 1440)%60:02d}",
            "Duration": f"{poi.get('visit_duration', 60)} min"
        })
    
    st.dataframe(poi_df_data, use_container_width=True)
    
    # QAOA Settings
    st.subheader("⚙️ QAOA Settings")
    col1, col2, col3 = st.columns(3)
    with col1:
        num_layers = st.number_input("Number of Layers (p)", min_value=1, max_value=5, value=2, key="num_layers")
    with col2:
        shots = st.number_input("Shots", min_value=100, max_value=10000, value=1024, step=100, key="shots")
    with col3:
        optimizer = st.selectbox("Optimizer", ["COBYLA", "SPSA"], index=0, key="optimizer")
    
    # Optimize button
    if st.button("🚀 Optimize Route with QAOA", type="primary", use_container_width=True):
        with st.spinner("Optimizing route..."):
            try:
                # Step 1: Feature Engineering
                st.write("📊 Step 1: Feature Engineering & Validation")
                base_path = Path(__file__).parent
                traffic_path = base_path / "data" / "traffic" / "phnompenh_traffic.json"
                distance_calc = DistanceCalculator(
                    traffic_data_path=str(traffic_path) if traffic_path.exists() else None
                )
                feature_engineer = FeatureEngineer(distance_calc)
                
                prepared_data = feature_engineer.prepare_pois_for_optimization(
                    st.session_state.selected_pois,
                    st.session_state.user_preferences
                )
                
                st.success(f"✅ Validated {len(prepared_data['pois'])} POIs")
                st.json(prepared_data['validation_info'])
                
                # Step 2: Calculate matrices
                st.write("📐 Step 2: Calculating Distance & Time Matrices")
                distance_matrix = prepared_data['distance_matrix']
                time_matrix = prepared_data['time_matrix']
                
                # Get traffic penalty matrix
                traffic_penalty = distance_calc.get_traffic_penalty_matrix(
                    prepared_data['pois'],
                    distance_matrix
                )
                
                # Step 3: QUBO Encoding
                st.write("🔢 Step 3: Encoding to QUBO")
                qubo_encoder = QUBOEncoder(penalty_coefficient=1000.0)
                
                # Convert start_time to minutes
                start_time_str = st.session_state.user_preferences['start_time']
                time_parts = start_time_str.split(':')
                start_time_minutes = int(time_parts[0]) * 60 + int(time_parts[1])
                
                qubo_matrix, encoding_info = qubo_encoder.encode_tsp(
                    prepared_data['pois'],
                    distance_matrix,
                    time_matrix=time_matrix,
                    start_time_minutes=start_time_minutes,
                    max_distance=st.session_state.user_preferences['max_distance'],
                    traffic_penalty_matrix=traffic_penalty,
                    constraint_weights=st.session_state.user_preferences['constraint_weights']
                )
                
                st.success(f"✅ QUBO matrix created: {qubo_matrix.shape}")
                st.json({
                    "num_qubits": encoding_info['num_qubits'],
                    "encoding": encoding_info['encoding'],
                    "penalty_coefficient": encoding_info['penalty_coefficient']
                })
                
                # Step 4: QAOA Solving
                st.write("⚛️ Step 4: Solving with QAOA")
                qaoa_solver = QAOASolver(
                    num_layers=num_layers,
                    shots=shots,
                    optimizer=optimizer,
                    max_iterations=100
                )
                
                result = qaoa_solver.solve(qubo_matrix, len(prepared_data['pois']), encoding_info)
                
                st.success("✅ Optimization complete!")
                
                # Step 5: Decode and display
                st.write("🔍 Step 5: Decoding Route")
                route = result['route']
                route_pois = [prepared_data['pois'][i] for i in route]
                
                st.session_state.optimization_result = {
                    'result': result,
                    'route': route,
                    'route_pois': route_pois,
                    'prepared_data': prepared_data,
                    'encoding_info': encoding_info,
                    'distance_matrix': distance_matrix.tolist(),
                    'time_matrix': time_matrix.tolist()
                }
                
                # Display route
                st.subheader("✅ Optimized Route:")
                route_text = " → ".join([f"{i+1}. {poi['name']}" for i, poi in enumerate(route_pois)])
                st.markdown(f"**Route:** {route_text}")
                
                # Calculate total distance
                total_distance = 0.0
                for i in range(len(route) - 1):
                    total_distance += distance_matrix[route[i]][route[i+1]]
                
                st.metric("Total Distance", f"{total_distance:.2f} km")
                st.metric("Energy", f"{result['energy']:.4f}")
                st.metric("Valid Solution", "✅ Yes" if result['is_valid'] else "❌ No")
                
            except Exception as e:
                st.error(f"❌ Error during optimization: {str(e)}")
                st.exception(e)

# Tab 3: Results
with tab3:
    st.header("📊 Optimization Results")
    
    if st.session_state.optimization_result is None:
        st.info("👈 Please run optimization first in the 'Optimize' tab")
    else:
        result = st.session_state.optimization_result['result']
        route = st.session_state.optimization_result['route']
        route_pois = st.session_state.optimization_result['route_pois']
        prepared_data = st.session_state.optimization_result['prepared_data']
        distance_matrix = np.array(st.session_state.optimization_result['distance_matrix'])
        time_matrix = np.array(st.session_state.optimization_result['time_matrix'])
        
        # Route visualization
        st.subheader("🗺️ Route Map")
        
        # Create map visualization
        fig = go.Figure()
        
        # Add route line
        lats = [float(poi['lat']) for poi in route_pois]  # Ensure float
        lngs = [float(poi['lng']) for poi in route_pois]  # Ensure float
        
        fig.add_trace(go.Scattermapbox(
            mode="lines+markers+text",
            lon=lngs,
            lat=lats,
            text=[f"{i+1}. {poi['name']}" for i, poi in enumerate(route_pois)],
            textposition="top right",
            marker=dict(size=10, color="red"),
            line=dict(width=3, color="blue"),
            name="Route"
        ))
        
        fig.update_layout(
            mapbox=dict(
                style="open-street-map",
                center=dict(lat=float(np.mean(lats)), lon=float(np.mean(lngs))),  # Ensure float
                zoom=12
            ),
            height=600,
            title="Optimized Route"
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Route details table
        st.subheader("📋 Route Details")
        route_details = []
        total_distance = 0.0
        total_time = 0.0
        
        for i, poi_idx in enumerate(route):
            poi = route_pois[i]
            if i > 0:
                prev_idx = route[i-1]
                dist = distance_matrix[prev_idx][poi_idx]
                time_val = time_matrix[prev_idx][poi_idx]
                # Convert to float if complex
                dist = float(dist.real) if isinstance(dist, complex) else float(dist)
                time_val = float(time_val.real) if isinstance(time_val, complex) else float(time_val)
                total_distance += dist
                total_time += time_val
            else:
                dist = 0.0
                time_val = 0.0
            
            route_details.append({
                "Position": i + 1,
                "POI Name": poi['name'],
                "Category": poi['category'],
                "Distance from Previous": f"{dist:.2f} km" if i > 0 else "Start",
                "Travel Time": f"{time_val:.1f} min" if i > 0 else "Start",
                "Visit Duration": f"{poi.get('visit_duration', 60)} min"
            })
        
        st.dataframe(route_details, use_container_width=True)
        
        # Metrics
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            # Ensure total_distance is float
            total_dist_float = float(total_distance.real) if isinstance(total_distance, complex) else float(total_distance)
            st.metric("Total Distance", f"{total_dist_float:.2f} km")
        with col2:
            # Ensure total_time is float
            total_time_float = float(total_time.real) if isinstance(total_time, complex) else float(total_time)
            st.metric("Total Travel Time", f"{total_time_float:.1f} min")
        with col3:
            # Convert energy to float if it's complex
            energy = result.get('energy', 0)
            if isinstance(energy, complex):
                energy = float(energy.real)
            else:
                energy = float(energy)
            st.metric("QAOA Energy", f"{energy:.4f}")
        with col4:
            st.metric("Valid Solution", "✅" if result['is_valid'] else "❌")
        
        # Decoding info
        with st.expander("🔍 Decoding Information"):
            st.json(result['decode_info'])

# Tab 4: Circuit
with tab4:
    st.header("🔬 Quantum Circuit Visualization")
    
    if st.session_state.optimization_result is None:
        st.info("👈 Please run optimization first in the 'Optimize' tab")
    else:
        result = st.session_state.optimization_result['result']
        
        # Measurement results
        st.subheader("📊 Measurement Results")
        if 'counts' in result:
            # Create histogram
            counts = result['counts']
            # Convert counts to ensure all values are real numbers (not complex)
            clean_counts = {}
            for key, value in counts.items():
                # Convert complex to float if needed
                if isinstance(value, complex):
                    clean_counts[key] = float(value.real)
                else:
                    clean_counts[key] = float(value)
            
            sorted_counts = sorted(clean_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            
            fig = go.Figure(data=[
                go.Bar(
                    x=[bitstring[:20] + "..." if len(bitstring) > 20 else bitstring for bitstring, _ in sorted_counts],
                    y=[float(count) for _, count in sorted_counts],  # Ensure float
                    text=[int(count) for _, count in sorted_counts],  # Integer for display
                    textposition='auto'
                )
            ])
            fig.update_layout(
                title="Top 10 Measurement Results",
                xaxis_title="Bitstring",
                yaxis_title="Count",
                height=400
            )
            st.plotly_chart(fig, use_container_width=True)
        
        # QAOA Parameters
        st.subheader("⚙️ QAOA Parameters")
        if 'parameters' in result and result['parameters']:
            # Convert complex numbers to floats for JSON serialization
            clean_params = {}
            for key, value in result['parameters'].items():
                if isinstance(value, complex):
                    clean_params[key] = float(value.real)
                elif isinstance(value, (list, tuple)):
                    clean_params[key] = [float(v.real) if isinstance(v, complex) else float(v) for v in value]
                else:
                    clean_params[key] = float(value) if isinstance(value, (int, float, np.number)) else value
            st.json(clean_params)
        
        # Circuit info
        st.subheader("🔧 Circuit Information")
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Number of Qubits", result.get('num_qubits', 'N/A'))
        with col2:
            st.metric("Number of Layers", result.get('num_layers', 'N/A'))
        with col3:
            st.metric("Iterations", result.get('iterations', 'N/A'))
        
        # Encoding info
        with st.expander("📝 Encoding Information"):
            encoding_info = st.session_state.optimization_result.get('encoding_info', {})
            st.json(encoding_info)

# Tab 5: Compare
with tab5:
    st.header("📊 Classical vs Quantum Comparison")
    
    if not st.session_state.selected_pois:
        st.warning("⚠️ Please select 4-8 POIs in the sidebar first!")
        st.stop()
    
    if len(st.session_state.selected_pois) < 4:
        st.error("❌ Please select at least 4 POIs (maximum 8)")
        st.stop()
    
    # Algorithm selection
    st.subheader("⚙️ Comparison Settings")
    col1, col2 = st.columns(2)
    with col1:
        classical_algorithm = st.selectbox(
            "Classical Algorithm",
            ["nearest_neighbor", "two_opt", "simulated_annealing"],
            index=0,
            key="classical_algorithm"
        )
    with col2:
        qaoa_layers = st.number_input("QAOA Layers (p)", min_value=1, max_value=5, value=2, key="compare_layers")
        qaoa_shots = st.number_input("QAOA Shots", min_value=100, max_value=10000, value=1024, step=100, key="compare_shots")
    
    # Run comparison button
    if st.button("🚀 Run Comparison", type="primary", use_container_width=True):
        with st.spinner("Running comparison..."):
            try:
                # Step 1: Feature Engineering (shared)
                st.write("📊 Step 1: Feature Engineering & Validation")
                base_path = Path(__file__).parent
                traffic_path = base_path / "data" / "traffic" / "phnompenh_traffic.json"
                distance_calc = DistanceCalculator(
                    traffic_data_path=str(traffic_path) if traffic_path.exists() else None
                )
                feature_engineer = FeatureEngineer(distance_calc)
                
                prepared_data = feature_engineer.prepare_pois_for_optimization(
                    st.session_state.selected_pois,
                    st.session_state.user_preferences
                )
                
                # Add user preferences to prepared_data
                prepared_data['user_preferences'] = st.session_state.user_preferences
                
                st.success(f"✅ Validated {len(prepared_data['pois'])} POIs")
                
                # Step 2: Classical Optimization
                st.write("🔧 Step 2: Classical Optimization")
                classical_result = feature_engineer.optimize_classical(
                    prepared_data,
                    algorithm=classical_algorithm
                )
                
                classical_route_pois = [prepared_data['pois'][i] for i in classical_result['route']]
                st.success(f"✅ Classical optimization complete ({classical_result['algorithm']})")
                
                # Step 3: Quantum Optimization
                st.write("⚛️ Step 3: Quantum Optimization")
                distance_matrix = prepared_data['distance_matrix']
                time_matrix = prepared_data['time_matrix']
                
                # Get traffic penalty matrix
                traffic_penalty = distance_calc.get_traffic_penalty_matrix(
                    prepared_data['pois'],
                    distance_matrix
                )
                
                # QUBO Encoding
                qubo_encoder = QUBOEncoder(penalty_coefficient=1000.0)
                start_time_str = st.session_state.user_preferences['start_time']
                time_parts = start_time_str.split(':')
                start_time_minutes = int(time_parts[0]) * 60 + int(time_parts[1])
                
                qubo_matrix, encoding_info = qubo_encoder.encode_tsp(
                    prepared_data['pois'],
                    distance_matrix,
                    time_matrix=time_matrix,
                    start_time_minutes=start_time_minutes,
                    max_distance=st.session_state.user_preferences['max_distance'],
                    traffic_penalty_matrix=traffic_penalty,
                    constraint_weights=st.session_state.user_preferences['constraint_weights']
                )
                
                # QAOA Solving
                qaoa_solver = QAOASolver(
                    num_layers=qaoa_layers,
                    shots=qaoa_shots,
                    optimizer="COBYLA",
                    max_iterations=100
                )
                
                quantum_result = qaoa_solver.solve(qubo_matrix, len(prepared_data['pois']), encoding_info)
                quantum_route_pois = [prepared_data['pois'][i] for i in quantum_result['route']]
                st.success("✅ Quantum optimization complete (QAOA)")
                
                # Step 4: Calculate comparison metrics
                st.write("📈 Step 4: Calculating Comparison Metrics")
                from comparison.metrics import MetricsCalculator
                metrics_calc = MetricsCalculator()
                
                # Evaluate classical solution
                classical_quality = metrics_calc.evaluate_solution_quality(
                    classical_result['route'],
                    prepared_data['pois'],
                    distance_matrix,
                    time_matrix
                )
                
                classical_constraints = metrics_calc.check_constraint_violations(
                    classical_result['route'],
                    prepared_data['pois'],
                    time_matrix,
                    start_time_minutes
                )
                
                # Evaluate quantum solution
                quantum_quality = metrics_calc.evaluate_solution_quality(
                    quantum_result['route'],
                    prepared_data['pois'],
                    distance_matrix,
                    time_matrix
                )
                
                quantum_constraints = metrics_calc.check_constraint_violations(
                    quantum_result['route'],
                    prepared_data['pois'],
                    time_matrix,
                    start_time_minutes
                )
                
                # Store comparison results
                st.session_state.comparison_result = {
                    'classical': {
                        'result': classical_result,
                        'route': classical_result['route'],
                        'route_pois': classical_route_pois,
                        'quality': classical_quality,
                        'constraints': classical_constraints
                    },
                    'quantum': {
                        'result': quantum_result,
                        'route': quantum_result['route'],
                        'route_pois': quantum_route_pois,
                        'quality': quantum_quality,
                        'constraints': quantum_constraints
                    },
                    'prepared_data': prepared_data,
                    'distance_matrix': distance_matrix.tolist(),
                    'time_matrix': time_matrix.tolist()
                }
                
                st.success("✅ Comparison complete!")
                
            except Exception as e:
                st.error(f"❌ Error during comparison: {str(e)}")
                st.exception(e)
    
    # Display comparison results
    if st.session_state.comparison_result:
        comparison = st.session_state.comparison_result
        classical = comparison['classical']
        quantum = comparison['quantum']
        distance_matrix = np.array(comparison['distance_matrix'])
        time_matrix = np.array(comparison['time_matrix'])
        
        # Side-by-side route visualization
        st.subheader("🗺️ Route Comparison")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### 🔧 Classical Route")
            fig_classical = go.Figure()
            lats_c = [float(poi['lat']) for poi in classical['route_pois']]
            lngs_c = [float(poi['lng']) for poi in classical['route_pois']]
            
            fig_classical.add_trace(go.Scattermapbox(
                mode="lines+markers+text",
                lon=lngs_c,
                lat=lats_c,
                text=[f"{i+1}. {poi['name']}" for i, poi in enumerate(classical['route_pois'])],
                textposition="top right",
                marker=dict(size=10, color="blue"),
                line=dict(width=3, color="blue"),
                name="Classical Route"
            ))
            
            fig_classical.update_layout(
                mapbox=dict(
                    style="open-street-map",
                    center=dict(lat=float(np.mean(lats_c)), lon=float(np.mean(lngs_c))),
                    zoom=12
                ),
                height=400,
                title=f"Classical ({classical['result']['algorithm']})"
            )
            st.plotly_chart(fig_classical, use_container_width=True)
            
            # Classical route text
            route_text_c = " → ".join([f"{i+1}. {poi['name']}" for i, poi in enumerate(classical['route_pois'])])
            st.markdown(f"**Route:** {route_text_c}")
        
        with col2:
            st.markdown("### ⚛️ Quantum Route")
            fig_quantum = go.Figure()
            lats_q = [float(poi['lat']) for poi in quantum['route_pois']]
            lngs_q = [float(poi['lng']) for poi in quantum['route_pois']]
            
            fig_quantum.add_trace(go.Scattermapbox(
                mode="lines+markers+text",
                lon=lngs_q,
                lat=lats_q,
                text=[f"{i+1}. {poi['name']}" for i, poi in enumerate(quantum['route_pois'])],
                textposition="top right",
                marker=dict(size=10, color="red"),
                line=dict(width=3, color="red"),
                name="Quantum Route"
            ))
            
            fig_quantum.update_layout(
                mapbox=dict(
                    style="open-street-map",
                    center=dict(lat=float(np.mean(lats_q)), lon=float(np.mean(lngs_q))),
                    zoom=12
                ),
                height=400,
                title="Quantum (QAOA)"
            )
            st.plotly_chart(fig_quantum, use_container_width=True)
            
            # Quantum route text
            route_text_q = " → ".join([f"{i+1}. {poi['name']}" for i, poi in enumerate(quantum['route_pois'])])
            st.markdown(f"**Route:** {route_text_q}")
        
        # Metrics comparison table
        st.subheader("📊 Metrics Comparison")
        
        comparison_data = {
            "Metric": [
                "Total Distance (km)",
                "Total Time (min)",
                "Execution Time (s)",
                "Feasible",
                "Constraint Violations",
                "Average Distance per POI (km)"
            ],
            "Classical": [
                f"{classical['quality']['total_distance']:.2f}",
                f"{classical['quality']['total_time']:.1f}" if classical['quality']['total_time'] > 0 else "N/A",
                f"{classical['result']['execution_time']:.4f}",
                "✅ Yes" if classical['constraints']['is_feasible'] else "❌ No",
                str(classical['constraints']['num_violations']),
                f"{classical['quality']['avg_distance_per_poi']:.2f}"
            ],
            "Quantum": [
                f"{quantum['quality']['total_distance']:.2f}",
                f"{quantum['quality']['total_time']:.1f}" if quantum['quality']['total_time'] > 0 else "N/A",
                f"{quantum['result'].get('execution_time', 0):.4f}",
                "✅ Yes" if quantum['constraints']['is_feasible'] else "❌ No",
                str(quantum['constraints']['num_violations']),
                f"{quantum['quality']['avg_distance_per_poi']:.2f}"
            ]
        }
        
        st.dataframe(comparison_data, use_container_width=True)
        
        # Performance charts
        st.subheader("📈 Performance Visualization")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Distance comparison
            fig_dist = go.Figure(data=[
                go.Bar(
                    x=['Classical', 'Quantum'],
                    y=[classical['quality']['total_distance'], quantum['quality']['total_distance']],
                    marker_color=['blue', 'red'],
                    text=[f"{classical['quality']['total_distance']:.2f} km", 
                          f"{quantum['quality']['total_distance']:.2f} km"],
                    textposition='auto'
                )
            ])
            fig_dist.update_layout(
                title="Total Distance Comparison",
                yaxis_title="Distance (km)",
                height=300
            )
            st.plotly_chart(fig_dist, use_container_width=True)
        
        with col2:
            # Execution time comparison
            exec_time_c = classical['result']['execution_time']
            exec_time_q = quantum['result'].get('execution_time', 0)
            
            fig_time = go.Figure(data=[
                go.Bar(
                    x=['Classical', 'Quantum'],
                    y=[exec_time_c, exec_time_q],
                    marker_color=['blue', 'red'],
                    text=[f"{exec_time_c:.4f} s", f"{exec_time_q:.4f} s"],
                    textposition='auto'
                )
            ])
            fig_time.update_layout(
                title="Execution Time Comparison",
                yaxis_title="Time (seconds)",
                height=300
            )
            st.plotly_chart(fig_time, use_container_width=True)
        
        # Winner summary
        st.subheader("🏆 Summary")
        
        winner_distance = "Classical" if classical['quality']['total_distance'] < quantum['quality']['total_distance'] else "Quantum"
        winner_time = "Classical" if exec_time_c < exec_time_q else "Quantum"
        winner_feasible = "Classical" if classical['constraints']['is_feasible'] and not quantum['constraints']['is_feasible'] else \
                          "Quantum" if quantum['constraints']['is_feasible'] and not classical['constraints']['is_feasible'] else \
                          "Both" if classical['constraints']['is_feasible'] and quantum['constraints']['is_feasible'] else "Neither"
        
        summary_col1, summary_col2, summary_col3 = st.columns(3)
        with summary_col1:
            st.metric("Best Distance", winner_distance)
        with summary_col2:
            st.metric("Fastest", winner_time)
        with summary_col3:
            st.metric("Feasible", winner_feasible)
        # Detailed comparison expander
        with st.expander("🔍 Detailed Comparison"):
            col_det1, col_det2 = st.columns(2)
            
            with col_det1:
                st.markdown("### Classical Details")
                st.json({
                    'algorithm': classical['result']['algorithm'],
                    'route': classical['result']['route'],
                    'total_distance': classical['quality']['total_distance'],
                    'total_time': classical['quality']['total_time'],
                    'execution_time': classical['result']['execution_time'],
                    'is_feasible': classical['constraints']['is_feasible'],
                    'violations': classical['constraints']['violations']
                })
            
            with col_det2:
                st.markdown("### Quantum Details")
                st.json({
                    'algorithm': 'QAOA',
                    'route': quantum['result']['route'],
                    'total_distance': quantum['quality']['total_distance'],
                    'total_time': quantum['quality']['total_time'],
                    'execution_time': quantum['result'].get('execution_time', 0),
                    'energy': quantum['result'].get('energy', 0),
                    'is_feasible': quantum['constraints']['is_feasible'],
                    'violations': quantum['constraints']['violations']
                })
    else:
        st.info("👈 Click 'Run Comparison' to compare classical and quantum optimization results")

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666;">
    <p>🗺️ Quantum Route Optimization | Powered by QAOA 🚀</p>
</div>
""", unsafe_allow_html=True)
