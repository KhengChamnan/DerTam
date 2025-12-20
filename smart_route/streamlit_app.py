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
    .stTabs [data-baseweb="tab-list"] {
        background: #f0f2f6;
        border-radius: 12px 12px 0 0;
        padding: 0.5rem 0.5rem 0 0.5rem;
        margin-bottom: 1rem;
    }
    .stTabs [data-baseweb="tab"] {
        font-size: 1.1rem;
        font-weight: 600;
        color: #01005B;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
initialize_session_state()

# Render header
render_header()

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
    # Display optimized route summary if available
    if st.session_state.optimization_result:
        render_optimized_route_summary(st.session_state.optimization_result)
        
        # Add reset button to optimize again
        if st.button("🔄 Optimize Again", type="secondary", use_container_width=True):
            st.session_state.optimization_result = None
            st.rerun()
    else:
        # Validate POI selection
        is_valid, error_msg = validate_poi_selection(st.session_state.selected_pois)
        if not is_valid:
            st.warning(f"⚠️ {error_msg}")
            st.stop()
        
        # QAOA Settings
        qaoa_config = render_qaoa_settings()
        
        # Optimize button
        if st.button("Optimize Route with QAOA", type="primary", use_container_width=True):
            with st.spinner("Optimizing route..."):
                try:
                    optimization_result = run_quantum_optimization(
                        st.session_state.selected_pois,
                        st.session_state.user_preferences,
                        qaoa_config
                    )
                    
                    st.session_state.optimization_result = optimization_result
                    st.rerun()
                    
                except Exception as e:
                    st.error(f"❌ Error during optimization: {str(e)}")
                    st.exception(e)

# Tab 3: Results
with tab3:
    st.markdown("## Optimization Results")
    st.caption("Review the results and details of your optimized route.")
    
    if st.session_state.optimization_result is None:
        st.info("👈 Please run optimization first in the 'Optimize' tab")
    else:
        result = st.session_state.optimization_result
        route_pois = result['route_pois']
        distance_matrix = np.array(result['distance_matrix'])
        time_matrix = np.array(result['time_matrix'])
        
        # Route visualization
        st.subheader("🗺️ Route Map")
        render_route_map(route_pois)
        
        # Route details
        st.subheader("📋 Route Details")
        total_distance, total_time = render_route_details(
            result['route'], route_pois, distance_matrix, time_matrix
        )
        
        # Metrics
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Distance", f"{total_distance:.2f} km")
        with col2:
            st.metric("Total Travel Time", f"{total_time:.1f} min")
        with col3:
            energy = result['result'].get('energy', 0)
            energy = float(energy.real) if isinstance(energy, complex) else float(energy)
            st.metric("QAOA Energy", f"{energy:.4f}")
        with col4:
            st.metric("Valid Solution", "✅" if result['result']['is_valid'] else "❌")

# Tab 4: Circuit
with tab4:
    st.markdown("## Quantum Circuit Visualization")
    st.caption("Visualize the quantum circuit and its parameters.")
    
    if st.session_state.optimization_result is None:
        st.info("👈 Please run optimization first in the 'Optimize' tab")
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
                st.subheader("🔗 Qubit Feature Mapping")
                mapping_df = pd.DataFrame([
                    {'Qubit': f'Q{i}', 'Feature': feature}
                    for i, feature in circuit_details['qubit_mapping'].items()
                ])
                st.dataframe(mapping_df, use_container_width=True, hide_index=True)
            
            # Gate details
            if 'gate_details' in circuit_details:
                st.subheader("⚙️ Gate Details by Layer")
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
        st.subheader("🔧 Circuit Information")
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
            st.warning("⚠️ **Note:** Classical fallback solver was used (QAOA initialization failed)")
        

# Tab 5: Compare
with tab5:
    st.markdown("## Classical vs Quantum Comparison")
    st.caption("Compare classical and quantum optimization results side by side.")
    
    # Validate POI selection
    is_valid, error_msg = validate_poi_selection(st.session_state.selected_pois)
    if not is_valid:
        st.warning(f"⚠️ {error_msg}")
        st.stop()
    
    # Algorithm selection
    st.subheader("Comparison Settings")
    col1, col2 = st.columns(2)
    with col1:
        classical_algorithm = st.selectbox(
            "Classical Algorithm",
            ["nearest_neighbor", "two_opt", "simulated_annealing"],
            index=0,
            key="classical_algorithm",
            help="Select a pure classical algorithm (no QAOA) for comparison"
        )
    with col2:
        qaoa_layers = st.number_input("QAOA Layers (p)", min_value=1, max_value=5, value=2, key="compare_layers")
        qaoa_shots = st.number_input("QAOA Shots", min_value=100, max_value=10000, value=1024, step=100, key="compare_shots")
    
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
        
        # Route comparison maps
        st.subheader("🗺️ Route Comparison")
        
        # Show route indices for debugging
        classical_route = classical['result']['route']
        quantum_route = quantum['result']['route']
        
        # Check if routes are different
        routes_are_different = classical_route != quantum_route
        
        # Show comparison method explanation
        with st.expander("ℹ️ How Classical vs QAOA Comparison Works", expanded=False):
            st.markdown("""
            **Classical Algorithm (Raw Distance):**
            - Uses ONLY the distance matrix
            - No preference weights, traffic, or time considerations
            - Greedily selects nearest unvisited POI
            
            **QAOA Algorithm (Quantum-Weighted):**
            - Uses quantum circuit to optimize preference qubits
            - Qubit measurements determine feature preferences:
              - `|0⟩` = minimize/avoid (weight = 1.0)
              - `|1⟩` = accept/deprioritize (weight = 0.2)
            - Creates weighted cost matrix including distance, time, traffic, and category
            - Applies weighted nearest neighbor with QAOA-derived preferences
            
            **When routes are identical:**
            - The shortest distance path is also optimal for QAOA preferences
            - Small POI sets have limited routing alternatives
            - Traffic/time data may not vary enough to affect routes
            """)
        
        if not routes_are_different:
            st.warning("⚠️ **Warning:** Classical and Quantum routes are identical!")
            st.write("This may happen when:")
            st.write("- The shortest distance path is also optimal considering all QAOA preferences")
            st.write("- Traffic and time differences don't create alternative optimal paths")
            st.write("- The POI set is small with limited routing options")
        
        # Display route indices
        col_route1, col_route2 = st.columns(2)
        with col_route1:
            st.markdown("**Classical Route Indices:**")
            st.code(f"{classical_route}")
            st.markdown("**Classical Route Names:**")
            route_text_c = " → ".join([f"{i+1}. {poi['name']}" for i, poi in enumerate(classical['route_pois'])])
            st.write(route_text_c)
        
        with col_route2:
            st.markdown("**Quantum Route Indices:**")
            st.code(f"{quantum_route}")
            st.markdown("**Quantum Route Names:**")
            route_text_q = " → ".join([f"{i+1}. {poi['name']}" for i, poi in enumerate(quantum['route_pois'])])
            st.write(route_text_q)
        
        # Show QAOA preferences and method info
        method = quantum['result'].get('method', 'unknown')
        if method == 'qaoa':
            st.success("✅ **QAOA Optimization** - Quantum measurements determined route preferences")
        elif method == 'classical_fallback':
            st.warning("⚠️ **Classical Fallback** - QAOA used NumPyMinimumEigensolver (Sampler unavailable)")
        
        # Show quantum measurement info if available
        if 'decode_info' in quantum['result']:
            decode_info = quantum['result']['decode_info']
            with st.expander("🔬 Quantum Measurement Details"):
                if 'bitstring' in decode_info:
                    st.write(f"**Measured Bitstring:** `{decode_info['bitstring']}`")
                if 'preferences' in decode_info:
                    st.write("**QAOA-Decoded Preferences (from qubit states):**")
                    prefs = decode_info['preferences']
                    pref_display = []
                    for feature, value in prefs.items():
                        state = "|0⟩" if value == 0 else "|1⟩"
                        meaning = "minimize/avoid" if value == 0 else "accept/deprioritize"
                        pref_display.append({
                            "Feature": feature.capitalize(),
                            "Qubit State": state,
                            "Effect": meaning
                        })
                    st.dataframe(pref_display, use_container_width=True, hide_index=True)
                if 'counts' in quantum['result']:
                    counts = quantum['result']['counts']
                    if isinstance(counts, dict):
                        sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:5]
                        st.write("**Top 5 Measurement Results:**")
                        for bitstring, count in sorted_counts:
                            st.write(f"  - `{bitstring}`: {count} counts")
        
        render_comparison_maps(
            classical['route_pois'],
            quantum['route_pois'],
            classical['result'].get('algorithm', 'unknown')
        )
        
        # Metrics comparison table
        st.subheader("📊 Metrics Comparison")
        
        # Get traffic impact metrics if available
        classical_traffic = classical.get('traffic_impact', {})
        quantum_traffic = quantum.get('traffic_impact', {})
        
        comparison_data = {
            "Metric": [
                "Total Distance (km)", "Total Time (min)", "Execution Time (s)",
                "Feasible", "Constraint Violations", "Average Distance per POI (km)"
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
        
        # Add traffic metrics if available
        if classical_traffic and quantum_traffic:
            comparison_data["Metric"].extend([
                "Traffic Impact Score",
                "Average Traffic Factor",
                "High-Traffic Segments",
                "Time Efficiency (min/km)"
            ])
            comparison_data["Classical"].extend([
                f"{classical_traffic.get('traffic_impact_score', 0):.2f}",
                f"{classical_traffic.get('avg_traffic_factor', 0):.2f}x",
                str(classical_traffic.get('high_traffic_segments', 0)),
                f"{classical_traffic.get('time_efficiency', 0):.2f}"
            ])
            comparison_data["Quantum"].extend([
                f"{quantum_traffic.get('traffic_impact_score', 0):.2f}",
                f"{quantum_traffic.get('avg_traffic_factor', 0):.2f}x",
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
        st.subheader("📈 Performance Visualization")
        render_comparison_charts(
            classical['quality'],
            quantum['quality'],
            classical['result']['execution_time'],
            quantum['result'].get('execution_time', 0)
        )
        
        # Winner summary
        st.subheader("🏆 Summary")
        winner_distance = "Classical" if classical['quality']['total_distance'] < quantum['quality']['total_distance'] else "Quantum"
        winner_time = "Classical" if classical['result']['execution_time'] < quantum['result'].get('execution_time', 0) else "Quantum"
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
        
        # Google Maps Comparison
        st.subheader("🗺️ Google Maps / OpenRouteService Comparison")
        if st.button("🔄 Compare with External Routing Service", type="secondary"):
            with st.spinner("Fetching route from external service..."):
                try:
                    comparator = RouteComparison(use_openrouteservice=True)
                    quantum_route_data = {
                        'total_distance_km': quantum['quality']['total_distance'],
                        'total_duration_minutes': quantum['quality']['total_time'],
                        'route': quantum['result']['route']
                    }
                    external_route = comparator.get_route_from_service(
                        comparison['pois'], quantum['result']['route']
                    )
                    
                    if external_route.get('success'):
                        comparison_result = comparator.compare_routes(quantum_route_data, external_route)
                        
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.metric("Our Route Distance", f"{comparison_result['our_route']['distance_km']:.2f} km")
                            st.metric("Our Route Time", f"{comparison_result['our_route']['duration_minutes']:.1f} min")
                        with col2:
                            st.metric("External Service Distance", 
                                    f"{comparison_result['external_route']['distance_km']:.2f} km",
                                    delta=f"{comparison_result['comparison']['distance_difference_km']:.2f} km")
                            st.metric("External Service Time",
                                    f"{comparison_result['external_route']['duration_minutes']:.1f} min",
                                    delta=f"{comparison_result['comparison']['time_difference_minutes']:.1f} min")
                        with col3:
                            st.metric("Distance Winner", comparison_result['comparison']['distance_winner'])
                            st.metric("Time Winner", comparison_result['comparison']['time_winner'])
                        
                        st.write(f"**Service Used:** {comparison_result['external_route']['service']}")
                        st.session_state.google_maps_comparison = comparison_result
                    else:
                        st.warning("Could not fetch route from external service.")
                except Exception as e:
                    st.error(f"Error comparing with external service: {e}")
        
        # Route Difference Analysis
        if routes_are_different:
            st.subheader("🔍 Route Difference Analysis")
            
            # Find positions where routes differ
            differences = []
            for i, (c_idx, q_idx) in enumerate(zip(classical_route, quantum_route)):
                if c_idx != q_idx:
                    differences.append({
                        'position': i + 1,
                        'classical_poi': f"{c_idx} ({classical['route_pois'][i]['name']})",
                        'quantum_poi': f"{q_idx} ({quantum['route_pois'][i]['name']})"
                    })
            
            if differences:
                diff_df = pd.DataFrame(differences)
                st.dataframe(diff_df, use_container_width=True, hide_index=True)
            else:
                st.info("Routes visit the same POIs but in different order")
        
        # Detailed comparison
        with st.expander("🔍 Detailed Comparison"):
            col_det1, col_det2 = st.columns(2)
            with col_det1:
                st.markdown("### Classical Details")
                classical_details = {
                    'algorithm': classical['result']['algorithm'],
                    'route': classical['result']['route'],
                    'total_distance': classical['quality']['total_distance'],
                    'total_time': classical['quality']['total_time'],
                    'execution_time': classical['result']['execution_time'],
                    'is_feasible': classical['constraints']['is_feasible'],
                    'num_violations': classical['constraints']['num_violations']
                }
                if 'iterations' in classical['result']:
                    classical_details['iterations'] = classical['result']['iterations']
                st.json(classical_details)
            with col_det2:
                st.markdown("### Quantum Details")
                quantum_details = {
                    'algorithm': 'QAOA',
                    'route': quantum['result']['route'],
                    'total_distance': quantum['quality']['total_distance'],
                    'total_time': quantum['quality']['total_time'],
                    'execution_time': quantum['result'].get('execution_time', 0),
                    'energy': float(quantum['result'].get('energy', 0).real) if isinstance(quantum['result'].get('energy', 0), complex) else quantum['result'].get('energy', 0),
                    'is_feasible': quantum['constraints']['is_feasible'],
                    'num_violations': quantum['constraints']['num_violations'],
                    'num_qubits': quantum['result'].get('num_qubits', 'N/A'),
                    'num_layers': quantum['result'].get('num_layers', 'N/A')
                }
                if 'decode_info' in quantum['result']:
                    quantum_details['decode_info'] = quantum['result']['decode_info']
                st.json(quantum_details)
    else:
        st.info("👈 Click 'Run Comparison' to compare classical and quantum optimization results")

