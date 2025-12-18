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
    render_poi_table, render_qaoa_settings, initialize_session_state
)
from app_optimization import run_quantum_optimization, run_comparison
from app_visualization import (
    render_route_map, render_route_details, render_measurement_results,
    render_comparison_maps, render_comparison_charts, render_step_by_step_workflow
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
</style>
""", unsafe_allow_html=True)

# Initialize session state
initialize_session_state()

# Render header
render_header()

# Sidebar - POI Selection
render_sidebar()

# Main content area
tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
    "⚙️ Preferences", "🚀 Optimize", "📊 Results", "🔬 Circuit", "📊 Compare", "📋 Workflow"
])

# Tab 1: Preferences
with tab1:
    render_preferences_tab()

# Tab 2: Optimize
with tab2:
    st.header("🚀 Route Optimization")
    
    # Validate POI selection
    is_valid, error_msg = validate_poi_selection(st.session_state.selected_pois)
    if not is_valid:
        st.warning(f"⚠️ {error_msg}")
        st.stop()
    
    # Display selected POIs
    st.subheader("Selected POIs:")
    render_poi_table(st.session_state.selected_pois)
    
    # QAOA Settings
    qaoa_config = render_qaoa_settings()
    
    # Optimize button
    if st.button("🚀 Optimize Route with QAOA", type="primary", use_container_width=True):
        with st.spinner("Optimizing route..."):
            try:
                optimization_result = run_quantum_optimization(
                    st.session_state.selected_pois,
                    st.session_state.user_preferences,
                    qaoa_config
                )
                
                st.session_state.optimization_result = optimization_result
                
                # Display route
                st.subheader("✅ Optimized Route:")
                route_text = " → ".join([
                    f"{i+1}. {poi['name']}" 
                    for i, poi in enumerate(optimization_result['route_pois'])
                ])
                st.markdown(f"**Route:** {route_text}")
                
                # Calculate total distance
                distance_matrix = np.array(optimization_result['distance_matrix'])
                total_distance = sum(
                    distance_matrix[optimization_result['route'][i]][optimization_result['route'][i+1]]
                    for i in range(len(optimization_result['route']) - 1)
                )
                
                st.metric("Total Distance", f"{total_distance:.2f} km")
                st.metric("Energy", f"{optimization_result['result']['energy']:.4f}")
                st.metric("Valid Solution", "✅ Yes" if optimization_result['result']['is_valid'] else "❌ No")
                
            except Exception as e:
                st.error(f"❌ Error during optimization: {str(e)}")
                st.exception(e)

# Tab 3: Results
with tab3:
    st.header("📊 Optimization Results")
    
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
        
        # Decoding info
        with st.expander("🔍 Decoding Information"):
            st.json(result['result']['decode_info'])

# Tab 4: Circuit
with tab4:
    st.header("🔬 Quantum Circuit Visualization")
    
    if st.session_state.optimization_result is None:
        st.info("👈 Please run optimization first in the 'Optimize' tab")
    else:
        result = st.session_state.optimization_result['result']
        encoding_info = st.session_state.optimization_result.get('encoding_info', {})
        
        # Circuit visualization
        if 'circuit' in result and result['circuit'] is not None:
            st.subheader("🔬 QAOA Circuit Diagram")
            visualizer = CircuitVisualizer()
            circuit_details = visualizer.create_detailed_circuit_visualization(
                result['circuit'], result.get('parameters', {}), encoding_info
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
            
            # Circuit parameters
            st.subheader("📐 Circuit Parameters & Rotation Angles")
            if 'summary' in circuit_details:
                st.text(circuit_details['summary'])
            
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
        st.subheader("📊 Measurement Results")
        if 'counts' in result:
            render_measurement_results(result['counts'], encoding_info)
        
        # QAOA Parameters
        st.subheader("⚙️ QAOA Parameters")
        if 'parameters' in result and result['parameters']:
            clean_params = {}
            for key, value in result['parameters'].items():
                if isinstance(value, complex):
                    clean_params[key] = float(value.real)
                elif isinstance(value, (list, tuple)):
                    clean_params[key] = [float(v.real) if isinstance(v, complex) else float(v) for v in value]
                else:
                    clean_params[key] = float(value) if isinstance(value, (int, float, np.number)) else value
            
            params_df_data = []
            for key, value in clean_params.items():
                if isinstance(value, (int, float)):
                    params_df_data.append({
                        'Parameter': key,
                        'Value': f"{value:.6f}",
                        'Angle (rad)': f"{value:.6f}",
                        'Angle (deg)': f"{math.degrees(value):.2f}°",
                        'In π units': f"{value/math.pi:.3f}π" if value != 0 else "0"
                    })
            
            if params_df_data:
                params_df = pd.DataFrame(params_df_data)
                st.dataframe(params_df, use_container_width=True, hide_index=True)
            else:
                st.json(clean_params)
        
        # Circuit info
        st.subheader("🔧 Circuit Information")
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Number of Qubits", result.get('num_qubits', 'N/A'))
        with col2:
            st.metric("Number of Layers (p)", result.get('num_layers', 'N/A'))
        with col3:
            st.metric("Iterations", result.get('iterations', 'N/A'))
        with col4:
            st.metric("Energy", f"{result.get('energy', 0):.4f}")
        
        # Encoding info
        with st.expander("📝 Encoding Information"):
            st.json(encoding_info)
        
        # Decoding info
        if 'decode_info' in result:
            with st.expander("🔍 Decoding Information"):
                st.json(result['decode_info'])

# Tab 5: Compare
with tab5:
    st.header("📊 Classical vs Quantum Comparison")
    
    # Validate POI selection
    is_valid, error_msg = validate_poi_selection(st.session_state.selected_pois)
    if not is_valid:
        st.warning(f"⚠️ {error_msg}")
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
    
    # Run comparison
    if st.button("🚀 Run Comparison", type="primary", use_container_width=True):
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
        
        if not routes_are_different:
            st.warning("⚠️ **Warning:** Classical and Quantum routes are identical! This may indicate:")
            st.write("- Quantum solver is using classical fallback")
            st.write("- Quantum measurement results don't affect route selection")
            st.write("- Both algorithms converged to the same solution")
        
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
        
        # Show quantum measurement info if available
        if 'decode_info' in quantum['result']:
            decode_info = quantum['result']['decode_info']
            with st.expander("🔬 Quantum Measurement Details"):
                if 'bitstring' in decode_info:
                    st.write(f"**Measured Bitstring:** `{decode_info['bitstring']}`")
                if 'preferences' in decode_info:
                    st.write("**Decoded Preferences:**")
                    st.json(decode_info['preferences'])
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
        st.dataframe(comparison_data, use_container_width=True)
        
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

# Tab 6: Step-by-Step Workflow
with tab6:
    st.header("📋 Step-by-Step Optimization Workflow")
    
    if st.session_state.optimization_result is None:
        st.info("👈 Please run optimization first in the 'Optimize' tab to see the step-by-step workflow")
    else:
        result = st.session_state.optimization_result
        
        # Check if we have all required data
        required_keys = ['result', 'route', 'route_pois', 'pois', 'encoding_info', 
                        'feature_matrix', 'feature_info', 'distance_matrix', 'time_matrix']
        missing_keys = [key for key in required_keys if key not in result]
        
        if missing_keys:
            st.warning(f"⚠️ Missing data for workflow visualization: {', '.join(missing_keys)}")
            st.info("Please run optimization again to generate complete workflow data")
        else:
            # Convert lists back to numpy arrays if needed
            import numpy as np
            
            feature_matrix = np.array(result['feature_matrix']) if isinstance(result['feature_matrix'], list) else result['feature_matrix']
            distance_matrix = np.array(result['distance_matrix']) if isinstance(result['distance_matrix'], list) else result['distance_matrix']
            time_matrix = np.array(result['time_matrix']) if isinstance(result['time_matrix'], list) else result['time_matrix']
            
            # Get QUBO matrix from encoding info or reconstruct it
            qubo_matrix = None
            if 'qubo_matrix' in result:
                qubo_matrix = np.array(result['qubo_matrix']) if isinstance(result['qubo_matrix'], list) else result['qubo_matrix']
            elif 'encoding_info' in result:
                # Try to get from encoding_info if stored
                encoding_info = result['encoding_info']
                if 'qubo_matrix' in encoding_info:
                    qubo_matrix = np.array(encoding_info['qubo_matrix']) if isinstance(encoding_info['qubo_matrix'], list) else encoding_info['qubo_matrix']
            
            # If still no QUBO matrix, we need to recreate it (but this shouldn't happen)
            if qubo_matrix is None:
                st.warning("⚠️ QUBO matrix not found. Recreating from feature matrix...")
                try:
                    from quantum_optimizer.qubo_encoder import QUBOEncoder
                    from app_helpers import calculate_matrices
                    
                    distance_calc, dist_mat, time_mat, traffic_penalty = calculate_matrices(result['pois'])
                    encoder = QUBOEncoder()
                    qubo_matrix, encoding_info = encoder.encode_feature_based(
                        feature_matrix, dist_mat,
                        time_matrix=time_mat,
                        traffic_penalty_matrix=traffic_penalty,
                        constraint_weights=st.session_state.user_preferences.get('constraint_weights', {}),
                        num_qubits=4,
                        feature_info=result['feature_info']
                    )
                except Exception as e:
                    st.error(f"Could not recreate QUBO matrix: {e}")
                    st.stop()
            
            # Render step-by-step workflow
            render_step_by_step_workflow(
                pois=result['pois'],
                user_preferences=st.session_state.user_preferences,
                feature_matrix=feature_matrix,
                feature_info=result['feature_info'],
                qubo_matrix=qubo_matrix,
                encoding_info=result['encoding_info'],
                optimization_result=result,
                distance_matrix=distance_matrix,
                time_matrix=time_matrix
            )

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #666;">
    <p>🗺️ Quantum Route Optimization | Powered by QAOA 🚀</p>
</div>
""", unsafe_allow_html=True)
