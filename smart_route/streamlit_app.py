"""
Smart Tourist Route Optimization - Streamlit App
Refactored into modular components for better maintainability
"""
import streamlit as st
import numpy as np
import pandas as pd
import math
from pathlib import Path
from PIL import Image

# Import modular components
from app_ui import (
    render_header, render_sidebar, render_preferences_tab,
    render_qaoa_settings, initialize_session_state, render_optimized_route_summary
)
from app_optimization import run_quantum_optimization, run_comparison
from app_visualization import (
    render_route_map, render_route_details, render_measurement_results,
    render_comparison_maps, render_comparison_charts, render_step_by_step_workflow,
    render_traffic_comparison, render_traffic_aware_route_explanation
)
from app_helpers import validate_poi_selection
from quantum_optimizer.circuit_visualizer import CircuitVisualizer
from comparison.google_maps_comparison import RouteComparison

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
:root {
  --primary: #01005B;
  --primary-light: #1a1a7e;
  --background-light: #fff;
  --background-dark: #18191A;
  --text-light: #01005B;
  --text-dark: #e2e8f0;
}
body, .main, .stApp {
  background: var(--background-light);
  color: var(--text-light);
}
@media (prefers-color-scheme: dark) {
  body, .main, .stApp {
    background: var(--background-dark) !important;
    color: var(--text-dark) !important;
  }
  /* Example: override your custom backgrounds */
  div[data-baseweb="select"] > div {
    background-color: #23272F !important;
    color: var(--text-dark) !important;
    border: 2px solid var(--primary-light) !important;
  }
  /* Add more overrides as needed */
}
        
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
    
    /* Enhanced Tab Styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
        border-radius: 16px 16px 0 0;
        padding: 1rem 1rem 0 1rem;
        margin-bottom: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        border-bottom: 2px solid #e0e0e0;
        display: flex !important;
    }
    
    .stTabs [data-baseweb="tab"] {
        height: 60px;
        padding: 0 1.5rem;
        background-color: transparent;
        border-radius: 12px 12px 0 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: #5a6c7d;
        border: none;
        transition: all 0.3s ease;
        position: relative;
        flex: 1 1 0 !important;
        text-align: center !important;
        min-width: 0 !important;
    }
    
    .stTabs [data-baseweb="tab"]:hover {
        background-color: rgba(31, 119, 180, 0.08);
        color: #1f77b4;
    }
    
    .stTabs [aria-selected="true"] {
        background: linear-gradient(to bottom, #01005B 0%, #1557a0 100%);
        color: white !important;
        box-shadow: 0 4px 12px rgba(31, 119, 180, 0.3);
    }
    
    .stTabs [aria-selected="true"]::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: #1f77b4;
    }
    
    /* Tab content area */
    .stTabs [data-baseweb="tab-panel"] {
        padding: 2rem 1rem 1rem 1rem;
        background: white;
        border-radius: 0 0 16px 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
   </style>
""", unsafe_allow_html=True)

# Initialize session state
initialize_session_state()

# Sidebar - POI Selection
render_sidebar()


# Main content area
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "Preferences", 
    "Optimize", 
    "Results", 
    "Circuit", 
    "Compare"
])

# Tab 1: Preferences
with tab1:
    st.markdown("## Preferences & Settings")
    st.caption("Set your travel preferences and constraints for route optimization.")
    render_preferences_tab()

# Tab 2: Optimize
with tab2:
    st.markdown("## Route Optimization")
    st.caption("Run the quantum optimizer and view your optimized route.")
    
    # Validate POI selection
    is_valid, error_msg = validate_poi_selection(st.session_state.selected_pois)
    if not is_valid:
        st.warning(f" {error_msg}")
        st.stop()
    
    
    # QAOA Settings
    qaoa_config = render_qaoa_settings()
    
    # Optimize button
    if st.button(" Optimize Route with QAOA", type="primary", use_container_width=True):
        with st.spinner(" Optimizing your route..."):
            try:
                optimization_result = run_quantum_optimization(
                    st.session_state.selected_pois,
                    st.session_state.user_preferences,
                    qaoa_config
                )
                
                st.session_state.optimization_result = optimization_result
                
                # Success message
                
                st.markdown("---")
                
                # Display route in a clean, minimal format
                st.subheader("Your Optimized Route")
                
                # Create visual timeline-style route display
                num_stops = len(optimization_result['route_pois'])
                max_stops_per_row = 4  # Maximum stops per row before wrapping
                
                # Prepare all stops data
                all_stops = []
                for i, poi in enumerate(optimization_result['route_pois']):
                    if i == 0:
                        label = "Start"
                    elif i == num_stops - 1:
                        label = "End"
                    else:
                        label = f"Stop {i}"
                    all_stops.append({'label': label, 'name': poi['name'], 'index': i})
                
                # Display stops in rows with snake pattern
                current_idx = 0
                row_num = 0
                
                while current_idx < len(all_stops):
                    # Determine how many stops to show in this row
                    remaining = len(all_stops) - current_idx
                    stops_in_row = min(max_stops_per_row, remaining)
                    
                    # Get stops for this row
                    row_stops = all_stops[current_idx:current_idx + stops_in_row]
                    
                    # Reverse direction for odd rows (2nd, 4th, etc.)
                    is_reversed = row_num % 2 == 1
                    
                    # For reversed rows, we need to display from right to left
                    # So we reverse the order of stops
                    if is_reversed:
                        row_stops_display = list(reversed(row_stops))
                    else:
                        row_stops_display = row_stops
                    
                    # Create columns - need to account for empty columns if not full row
                    total_cols_needed = max_stops_per_row * 2 - 1  # 4 stops + 3 arrows = 7
                    col_specs = []
                    
                    # Add empty columns at start for reversed rows with fewer stops
                    if is_reversed and stops_in_row < max_stops_per_row:
                        empty_cols = (max_stops_per_row - stops_in_row) * 2
                        for _ in range(empty_cols):
                            col_specs.append(0.65)
                    
                    # Add actual stop columns
                    for i in range(stops_in_row):
                        col_specs.append(1)  # Column for stop
                        if i < stops_in_row - 1:
                            col_specs.append(0.3)  # Column for arrow
                    
                    # Add empty columns at end for normal rows with fewer stops
                    if not is_reversed and stops_in_row < max_stops_per_row:
                        empty_cols = (max_stops_per_row - stops_in_row) * 2
                        for _ in range(empty_cols):
                            col_specs.append(0.65)
                    
                    cols = st.columns(col_specs)
                    
                    # Fill the columns
                    col_idx = 0
                    
                    # Skip empty columns at start for reversed rows
                    if is_reversed and stops_in_row < max_stops_per_row:
                        col_idx = (max_stops_per_row - stops_in_row) * 2
                    
                    for i in range(stops_in_row):
                        stop = row_stops_display[i]
                        
                        with cols[col_idx]:
                            st.markdown(f"**{stop['label']}**")
                            st.markdown(f"{stop['name']}")
                        
                        col_idx += 1
                        
                        # Add arrow between stops (not after last stop in row)
                        if i < stops_in_row - 1:
                            arrow_direction = "←" if is_reversed else "→"
                            with cols[col_idx]:
                                st.markdown(f"<div style='text-align: center; font-size: 24px; color: #01005B; padding-top: 20px;'>{arrow_direction}</div>", unsafe_allow_html=True)
                            col_idx += 1
                    
                    # Add down arrow if there are more stops (between rows)
                    if current_idx + stops_in_row < len(all_stops):
                        # Position arrow at the end of current row direction
                        if is_reversed:
                            # Arrow on left for reversed rows
                            st.markdown("<div style='text-align: left; font-size: 24px; color: #01005B; margin: 5px 0 5px 40px;'>↓</div>", unsafe_allow_html=True)
                        else:
                            # Arrow on right for normal rows
                            st.markdown("<div style='text-align: right; font-size: 24px; color: #01005B; margin: 5px 40px 5px 0;'>↓</div>", unsafe_allow_html=True)
                    
                    current_idx += stops_in_row
                    row_num += 1
                
                st.markdown("---")
                
                # Calculate metrics
                distance_matrix = np.array(optimization_result['distance_matrix'])
                total_distance = sum(
                    distance_matrix[optimization_result['route'][i]][optimization_result['route'][i+1]]
                    for i in range(len(optimization_result['route']) - 1)
                )
                
                time_matrix = np.array(optimization_result['time_matrix'])
                total_time = sum(
                    time_matrix[optimization_result['route'][i]][optimization_result['route'][i+1]]
                    for i in range(len(optimization_result['route']) - 1)
                )
                
                energy = optimization_result['result']['energy']
                
                # Format time for better readability
                hours = int(total_time // 60)
                minutes = int(total_time % 60)
                if hours > 0:
                    time_display = f"{hours}h {minutes}m"
                else:
                    time_display = f"{minutes} min"
                
                # Display key metrics in a clean row
                
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    st.metric(
                        label="Total Distance",
                        value=f"{total_distance:.1f} km"
                    )
                
                with col2:
                    st.metric(
                        label="Travel Time",
                        value=time_display
                    )
                
                
                with col3:
                    st.metric(
                        label="Stops",
                        value=len(optimization_result['route_pois'])
                    )
                
                st.markdown("---")
                
                # Guide user to next steps
                st.info("Next Steps: View detailed route map in the 'Results' tab, or explore the quantum circuit in the 'Circuit' tab.")
                
            except Exception as e:
                st.error(f" Error during optimization: {str(e)}")
                st.exception(e)

# Tab 3: Results
with tab3:
    st.markdown("## Optimization Results")
    st.caption("Review the results and details of your optimized route.")
    
    if st.session_state.optimization_result is None:
        st.info(" Please run optimization first in the 'Optimize' tab")
    else:

        result = st.session_state.optimization_result
        route_pois = result['route_pois']
        distance_matrix = np.array(result['distance_matrix'])
        time_matrix = np.array(result['time_matrix'])
        
        # Calculate total_distance and total_time first
        route = result['route']
        total_distance = sum(
            distance_matrix[route[i]][route[i+1]]
            for i in range(len(route) - 1)
        )
        total_time = sum(
            time_matrix[route[i]][route[i+1]]
            for i in range(len(route) - 1)
        )
        
        # User Insight Section (displayed first)
        # Calculate insights
        planned_duration = st.session_state.user_preferences.get('available_time', 480)  # Default 8 hours in minutes
        planned_hours = planned_duration / 60
        
        travel_time_hours = total_time / 60
        remaining_time = planned_duration - total_time
        remaining_hours = remaining_time / 60
        
        # First row of insights
        insight_col1, insight_col2, insight_col3 = st.columns(3)
        
        with insight_col1:
            st.metric(
                label="Total Distance",
                value=f"{total_distance:.2f} km"
            )
        
        with insight_col2:
            st.metric(
                label="Total Travel Time",
                value=f"{total_time:.1f} min"
            )
        
        with insight_col3:
            if remaining_time > 0:
                st.metric(
                    label="Remaining Time",
                    value=f"{remaining_hours:.2f} hours",
                    delta=f"+ {remaining_time:.1f} min",
                    delta_color="normal"
                )
            else:
                st.metric(
                    label="Over Time",
                    value=f"{abs(remaining_hours):.2f} hours",
                    delta=f"- {abs(remaining_time):.1f} min",
                    delta_color="inverse"
                )
        
        # Route summary text
        route_names = " → ".join([poi['name'] for poi in route_pois])
        st.caption(f"**Route:** {route_names}")
        
        st.markdown("---")

        # Route visualization (now displayed after insights)
        st.subheader("Route Map")
        render_route_map(route_pois)
        
        # Route details
        st.subheader(" Route Details")
        render_route_details(
            result['route'], route_pois, distance_matrix, time_matrix
        )
        

# Tab 4: Circuit
with tab4:
    st.markdown("## Quantum Circuit Visualization")
    st.caption("Visualize the quantum circuit and its parameters.")
    
    if st.session_state.optimization_result is None:
        st.info(" Please run optimization first in the 'Optimize' tab")
    else:
        result = st.session_state.optimization_result['result']
        encoding_info = st.session_state.optimization_result.get('encoding_info', {})
        
        # Circuit visualization
        if 'circuit' in result and result['circuit'] is not None:
            visualizer = CircuitVisualizer()
            # Pass num_layers explicitly for proper layer display
            num_layers = result.get('num_layers', 1)
            circuit_details = visualizer.create_detailed_circuit_visualization(
                result['circuit'], 
                result.get('parameters', {}), 
                encoding_info,
                num_layers=num_layers
            )
            
            # Display circuit image
            if 'circuit_image' in circuit_details and circuit_details['circuit_image']:
                image_path = Path(circuit_details['circuit_image'])
                if image_path.exists() and image_path.suffix.lower() in ['.png', '.jpg', '.jpeg', '.gif', '.bmp']:
                    try:
                        with open(image_path, 'rb') as f:
                            img = Image.open(f)
                            img.load()
                            st.image(img, use_container_width=True)
                    except Exception as e:
                        st.warning(f"Could not display circuit image: {str(e)}")
            
            # Qubit mapping
            if 'qubit_mapping' in circuit_details:
                st.subheader(" Qubit Feature Mapping")
                mapping_df = pd.DataFrame([
                    {'Qubit': f'Q{i}', 'Feature': feature}
                    for i, feature in circuit_details['qubit_mapping'].items()
                ])
                st.dataframe(mapping_df, use_container_width=True, hide_index=True)
            
            # Gate details
            if 'gate_details' in circuit_details:
                st.subheader(" Gate Details by Layer")
                for gate in circuit_details['gate_details']:
                    with st.expander(f"Layer {gate['layer']}"):
                        col1, col2 = st.columns(2)
                        with col1:
                            st.write("**Cost Hamiltonian (R_Z):**")
                            st.write(f"γ = {gate['gamma']:.6f}")
                            st.write(f"Rotation Angle: {gate['rz_angle']:.6f} rad")
                            st.write(f"In π units: {gate['rz_angle_pi']}")
                        with col2:
                            st.write("**Mixer Hamiltonian (R_X):**")
                            st.write(f"β = {gate['beta']:.6f}")
                            st.write(f"Rotation Angle: {gate['rx_angle']:.6f} rad")
                            st.write(f"In π units: {gate['rx_angle_pi']}")
        
        # Measurement results
        st.subheader("Measurement Results")
        if 'counts' in result:
            render_measurement_results(result['counts'], encoding_info)
        
        
        # Circuit info
        st.subheader(" Circuit Information")
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Number of Qubits", result.get('num_qubits', 'N/A'))
        with col2:
            st.metric("Number of Layers (p)", result.get('num_layers', 'N/A'))
        with col3:
            # Show iterations with more detail
            iterations = result.get('iterations', 'N/A')
            max_iter = result.get('max_iterations', 'N/A')
            st.metric("Iterations", f"{iterations}" if iterations != 'N/A' else 'N/A', 
                     delta=f"max: {max_iter}" if max_iter != 'N/A' else None,
                     delta_color="off")
        with col4:
            energy = result.get('energy', 0)
            energy = float(energy.real) if isinstance(energy, complex) else float(energy)
            st.metric("Energy", f"{energy:.4f}")
        
        # Show optimization method and additional details
        method = result.get('method', 'unknown')
        optimizer_evals = result.get('optimizer_evals', None)
        
        if method == 'classical_fallback':
            st.warning(" **Note:** Classical fallback solver was used (QAOA initialization failed)")
        

# Tab 5: Compare
with tab5:
    st.markdown("## Classical vs Quantum Comparison")
    st.caption("Compare classical and quantum optimization results side by side.")
    
    # Validate POI selection
    is_valid, error_msg = validate_poi_selection(st.session_state.selected_pois)
    if not is_valid:
        st.warning(f" {error_msg}")
        st.stop()
    
    # Algorithm selection - using Simulated Annealing only
    st.subheader("Comparison Settings")
    st.info("Comparing **Simulated Annealing** (Classical) vs **QAOA** (Quantum)")
    
    col1, col2 = st.columns(2)
    with col1:
        qaoa_layers = st.number_input("QAOA Layers (p)", min_value=1, max_value=5, value=2, key="compare_layers")
    with col2:
        qaoa_shots = st.number_input("QAOA Shots", min_value=100, max_value=10000, value=1024, step=100, key="compare_shots")
    
    # Hardcode to Simulated Annealing
    classical_algorithm = "simulated_annealing"
    
    # Run comparison
    if st.button(" Run Comparison", type="primary", use_container_width=True):
        with st.spinner("Running comparison..."):
            try:
                comparison_result = run_comparison(
                    st.session_state.selected_pois,
                    st.session_state.user_preferences,
                    classical_algorithm,
                    {'num_layers': qaoa_layers, 'shots': qaoa_shots, 'optimizer': 'COBYLA'}
                )
                st.session_state.comparison_result = comparison_result
            except Exception as e:
                st.error(f" Error during comparison: {str(e)}")
                st.exception(e)
    
    # Display comparison results
    if st.session_state.comparison_result:
        comparison = st.session_state.comparison_result
        classical = comparison['classical']
        quantum = comparison['quantum']
        distance_matrix = np.array(comparison['distance_matrix'])
        time_matrix = np.array(comparison['time_matrix'])
        
        # Route comparison maps
        st.subheader(" Route Comparison")
        
        # Show route indices for debugging
        classical_route = classical['result']['route']
        quantum_route = quantum['result']['route']
        
        # Check if routes are different
        routes_are_different = classical_route != quantum_route
        
        
        # Show QAOA preferences and method info
       
        
        render_comparison_maps(
            classical['route_pois'],
            quantum['route_pois'],
            classical['result'].get('algorithm', 'unknown')
        )
        
        # Metrics comparison table
        st.subheader(" Metrics Comparison")
        
        # Get traffic impact metrics if available
        classical_traffic = classical.get('traffic_impact', {})
        quantum_traffic = quantum.get('traffic_impact', {})
        
        # Build comparison data with only the specified metrics
        comparison_data = {
            "Metric": [
                "Total Distance (km)",
                "Total Time (min)"
            ],
            "Classical": [
                f"{classical['quality']['total_distance']:.2f}",
                f"{classical['quality']['total_time']:.1f}" if classical['quality']['total_time'] > 0 else "N/A"
            ],
            "Quantum": [
                f"{quantum['quality']['total_distance']:.2f}",
                f"{quantum['quality']['total_time']:.1f}" if quantum['quality']['total_time'] > 0 else "N/A"
            ]
        }
        
        # Add traffic metrics if available
        if classical_traffic and quantum_traffic:
            comparison_data["Metric"].extend([
                "Traffic Impact Score",
                "High-Traffic Segments",
                "Time Efficiency (min/km)"
            ])
            comparison_data["Classical"].extend([
                f"{classical_traffic.get('traffic_impact_score', 0):.2f}",
                str(classical_traffic.get('high_traffic_segments', 0)),
                f"{classical_traffic.get('time_efficiency', 0):.2f}"
            ])
            comparison_data["Quantum"].extend([
                f"{quantum_traffic.get('traffic_impact_score', 0):.2f}",
                str(quantum_traffic.get('high_traffic_segments', 0)),
                f"{quantum_traffic.get('time_efficiency', 0):.2f}"
            ])
        
        st.dataframe(comparison_data, use_container_width=True)
        
        # Traffic comparison visualization if available
        if classical_traffic and quantum_traffic:
            render_traffic_comparison(
                classical['route'],
                quantum['route'],
                classical['route_pois'],
                quantum['route_pois'],
                classical['quality'],
                quantum['quality'],
                classical_traffic,
                quantum_traffic,
                np.array(comparison['distance_matrix']),
                np.array(comparison['time_matrix'])
            )
            
            # Add traffic-aware route explanation
            encoding_info = comparison.get('encoding_info', {})
            render_traffic_aware_route_explanation(
                classical['route'],
                quantum['route'],
                classical['route_pois'],
                quantum['route_pois'],
                classical_traffic,
                quantum_traffic,
                encoding_info
            )
        
        # Performance charts
        st.subheader(" Performance Visualization")
        render_comparison_charts(
            classical['quality'],
            quantum['quality'],
            classical['result']['execution_time'],
            quantum['result'].get('execution_time', 0)
        )
        
        # Winner summary
        st.subheader(" Summary")
        winner_distance = "Classical" if classical['quality']['total_distance'] < quantum['quality']['total_distance'] else "Quantum"
        winner_time = "Classical" if classical['result']['execution_time'] < quantum['result'].get('execution_time', 0) else "Quantum"
        
        # Travel time comparison (shorter is better)
        classical_travel_time = classical['quality'].get('total_time', 0)
        quantum_travel_time = quantum['quality'].get('total_time', 0)
        winner_travel_time = "Classical" if classical_travel_time < quantum_travel_time else "Quantum"
        
        summary_col1, summary_col2, summary_col3 = st.columns(3)
        with summary_col1:
            st.metric("Best Distance", winner_distance)
        with summary_col2:
            st.metric("Fastest", winner_time)
        with summary_col3:
            st.metric("Travel Time", winner_travel_time)
        
        # Warning if routes are identical
        if not routes_are_different:
            st.warning("**Warning:** Classical and Quantum routes may be identical due to:")
            st.write("This may happen when:")
            st.write("- The shortest distance path is also optimal considering all QAOA preferences")
            st.write("- Traffic and time differences don't create alternative optimal paths")
            st.write("- The POI set is small with limited routing options")
        
    #     # Google Maps Comparison
    #     st.subheader("🗺️ Google Maps / OpenRouteService Comparison")
    #     if st.button("🔄 Compare with External Routing Service", type="secondary"):
    #         with st.spinner("Fetching route from external service..."):
    #             try:
    #                 comparator = RouteComparison(use_openrouteservice=True)
    #                 quantum_route_data = {
    #                     'total_distance_km': quantum['quality']['total_distance'],
    #                     'total_duration_minutes': quantum['quality']['total_time'],
    #                     'route': quantum['result']['route']
    #                 }
    #                 external_route = comparator.get_route_from_service(
    #                     comparison['pois'], quantum['result']['route']
    #                 )
                    
    #                 if external_route.get('success'):
    #                     comparison_result = comparator.compare_routes(quantum_route_data, external_route)
                        
    #                     col1, col2, col3 = st.columns(3)
    #                     with col1:
    #                         st.metric("Our Route Distance", f"{comparison_result['our_route']['distance_km']:.2f} km")
    #                         st.metric("Our Route Time", f"{comparison_result['our_route']['duration_minutes']:.1f} min")
    #                     with col2:
    #                         st.metric("External Service Distance", 
    #                                 f"{comparison_result['external_route']['distance_km']:.2f} km",
    #                                 delta=f"{comparison_result['comparison']['distance_difference_km']:.2f} km")
    #                         st.metric("External Service Time",
    #                                 f"{comparison_result['external_route']['duration_minutes']:.1f} min",
    #                                 delta=f"{comparison_result['comparison']['time_difference_minutes']:.1f} min")
    #                     with col3:
    #                         st.metric("Distance Winner", comparison_result['comparison']['distance_winner'])
    #                         st.metric("Time Winner", comparison_result['comparison']['time_winner'])
                        
    #                     st.write(f"**Service Used:** {comparison_result['external_route']['service']}")
    #                     st.session_state.google_maps_comparison = comparison_result
    #                 else:
    #                     st.warning("Could not fetch route from external service.")
    #             except Exception as e:
    #                 st.error(f"Error comparing with external service: {e}")
        
    #     # Route Difference Analysis
    #     if routes_are_different:
    #         st.subheader("🔍 Route Difference Analysis")
            
    #         # Find positions where routes differ
    #         differences = []
    #         for i, (c_idx, q_idx) in enumerate(zip(classical_route, quantum_route)):
    #             if c_idx != q_idx:
    #                 differences.append({
    #                     'position': i + 1,
    #                     'classical_poi': f"{c_idx} ({classical['route_pois'][i]['name']})",
    #                     'quantum_poi': f"{q_idx} ({quantum['route_pois'][i]['name']})"
    #                 })
            
    #         if differences:
    #             diff_df = pd.DataFrame(differences)
    #             st.dataframe(diff_df, use_container_width=True, hide_index=True)
    #         else:
    #             st.info("Routes visit the same POIs but in different order")
        
    #     # Detailed comparison
    #     with st.expander("🔍 Detailed Comparison"):
    #         col_det1, col_det2 = st.columns(2)
    #         with col_det1:
    #             st.markdown("### Classical Details")
    #             classical_details = {
    #                 'algorithm': classical['result']['algorithm'],
    #                 'route': classical['result']['route'],
    #                 'total_distance': classical['quality']['total_distance'],
    #                 'total_time': classical['quality']['total_time'],
    #                 'execution_time': classical['result']['execution_time'],
    #                 'is_feasible': classical['constraints']['is_feasible'],
    #                 'num_violations': classical['constraints']['num_violations']
    #             }
    #             if 'iterations' in classical['result']:
    #                 classical_details['iterations'] = classical['result']['iterations']
    #             st.json(classical_details)
    #         with col_det2:
    #             st.markdown("### Quantum Details")
    #             quantum_details = {
    #                 'algorithm': 'QAOA',
    #                 'route': quantum['result']['route'],
    #                 'total_distance': quantum['quality']['total_distance'],
    #                 'total_time': quantum['quality']['total_time'],
    #                 'execution_time': quantum['result'].get('execution_time', 0),
    #                 'energy': float(quantum['result'].get('energy', 0).real) if isinstance(quantum['result'].get('energy', 0), complex) else quantum['result'].get('energy', 0),
    #                 'is_feasible': quantum['constraints']['is_feasible'],
    #                 'num_violations': quantum['constraints']['num_violations'],
    #                 'num_qubits': quantum['result'].get('num_qubits', 'N/A'),
    #                 'num_layers': quantum['result'].get('num_layers', 'N/A')
    #             }
    #             if 'decode_info' in quantum['result']:
    #                 quantum_details['decode_info'] = quantum['result']['decode_info']
    #             st.json(quantum_details)
    else:
        st.info("Click 'Run Comparison' to compare classical and quantum optimization results")
