"""
Visualization functions for Streamlit app
Maps, charts, and display components
"""
import streamlit as st
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from typing import List, Dict
from pathlib import Path


def render_route_map(route_pois: List[Dict], title: str = "Optimized Route"):
    """Render route on map"""
    fig = go.Figure()
    
    lats = [float(poi['lat']) for poi in route_pois]
    lngs = [float(poi['lng']) for poi in route_pois]
    
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
            center=dict(lat=float(np.mean(lats)), lon=float(np.mean(lngs))),
            zoom=12
        ),
        height=600,
        title=title
    )
    
    st.plotly_chart(fig, use_container_width=True)


def render_route_details(route: List[int], route_pois: List[Dict], 
                        distance_matrix: np.ndarray, time_matrix: np.ndarray):
    """Render route details table"""
    route_details = []
    total_distance = 0.0
    total_time = 0.0
    
    for i, poi_idx in enumerate(route):
        poi = route_pois[i]
        if i > 0:
            prev_idx = route[i-1]
            dist = float(distance_matrix[prev_idx][poi_idx].real) if isinstance(distance_matrix[prev_idx][poi_idx], complex) else float(distance_matrix[prev_idx][poi_idx])
            time_val = float(time_matrix[prev_idx][poi_idx].real) if isinstance(time_matrix[prev_idx][poi_idx], complex) else float(time_matrix[prev_idx][poi_idx])
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
            "Travel Time": f"{time_val:.1f} min" if i > 0 else "Start"
        })
    
    st.dataframe(route_details, use_container_width=True)
    return total_distance, total_time


def render_measurement_results(counts: Dict, encoding_info: Dict):
    """Render measurement results histogram"""
    clean_counts = {}
    for key, value in counts.items():
        clean_counts[key] = float(value.real) if isinstance(value, complex) else float(value)
    
    sorted_counts = sorted(clean_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Show qubit interpretation for top result
    if sorted_counts and encoding_info.get('encoding') == 'feature_based':
        best_bitstring = sorted_counts[0][0]
        st.write(f"**Most Probable State: {best_bitstring}**")
        qubit_mapping = encoding_info.get('qubit_mapping', {})
        st.write("**Interpretation:**")
        for i, (qubit_idx, feature) in enumerate(qubit_mapping.items()):
            if i < len(best_bitstring):
                state = '|1⟩' if best_bitstring[i] == '1' else '|0⟩'
                st.write(f"  Q{qubit_idx} ({feature}): {state}")
    
    fig = go.Figure(data=[
        go.Bar(
            x=[bitstring[:20] + "..." if len(bitstring) > 20 else bitstring for bitstring, _ in sorted_counts],
            y=[float(count) for _, count in sorted_counts],
            text=[int(count) for _, count in sorted_counts],
            textposition='auto'
        )
    ])
    fig.update_layout(
        title="Top 10 Measurement Results",
        xaxis_title="Bitstring (Qubit States)",
        yaxis_title="Count",
        height=400
    )
    st.plotly_chart(fig, use_container_width=True)


def render_comparison_maps(classical_route_pois: List[Dict], quantum_route_pois: List[Dict], 
                          classical_algorithm: str):
    """Render side-by-side comparison maps"""
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 🔧 Classical Route")
        fig_classical = go.Figure()
        lats_c = [float(poi['lat']) for poi in classical_route_pois]
        lngs_c = [float(poi['lng']) for poi in classical_route_pois]
        
        fig_classical.add_trace(go.Scattermapbox(
            mode="lines+markers+text",
            lon=lngs_c, lat=lats_c,
            text=[f"{i+1}. {poi['name']}" for i, poi in enumerate(classical_route_pois)],
            textposition="top right",
            marker=dict(size=10, color="blue"),
            line=dict(width=3, color="blue"),
            name="Classical Route"
        ))
        
        fig_classical.update_layout(
            mapbox=dict(style="open-street-map", center=dict(lat=float(np.mean(lats_c)), lon=float(np.mean(lngs_c))), zoom=12),
            height=400, title=f"Classical ({classical_algorithm})"
        )
        st.plotly_chart(fig_classical, use_container_width=True)
        route_text_c = " → ".join([f"{i+1}. {poi['name']}" for i, poi in enumerate(classical_route_pois)])
        st.markdown(f"**Route:** {route_text_c}")
    
    with col2:
        st.markdown("### ⚛️ Quantum Route")
        fig_quantum = go.Figure()
        lats_q = [float(poi['lat']) for poi in quantum_route_pois]
        lngs_q = [float(poi['lng']) for poi in quantum_route_pois]
        
        fig_quantum.add_trace(go.Scattermapbox(
            mode="lines+markers+text",
            lon=lngs_q, lat=lats_q,
            text=[f"{i+1}. {poi['name']}" for i, poi in enumerate(quantum_route_pois)],
            textposition="top right",
            marker=dict(size=10, color="red"),
            line=dict(width=3, color="red"),
            name="Quantum Route"
        ))
        
        fig_quantum.update_layout(
            mapbox=dict(style="open-street-map", center=dict(lat=float(np.mean(lats_q)), lon=float(np.mean(lngs_q))), zoom=12),
            height=400, title="Quantum (QAOA)"
        )
        st.plotly_chart(fig_quantum, use_container_width=True)
        route_text_q = " → ".join([f"{i+1}. {poi['name']}" for i, poi in enumerate(quantum_route_pois)])
        st.markdown(f"**Route:** {route_text_q}")


def render_comparison_charts(classical_quality: Dict, quantum_quality: Dict,
                            classical_exec_time: float, quantum_exec_time: float):
    """Render comparison charts"""
    col1, col2 = st.columns(2)
    
    with col1:
        fig_dist = go.Figure(data=[
            go.Bar(
                x=['Classical', 'Quantum'],
                y=[classical_quality['total_distance'], quantum_quality['total_distance']],
                marker_color=['blue', 'red'],
                text=[f"{classical_quality['total_distance']:.2f} km", 
                      f"{quantum_quality['total_distance']:.2f} km"],
                textposition='auto'
            )
        ])
        fig_dist.update_layout(title="Total Distance Comparison", yaxis_title="Distance (km)", height=300)
        st.plotly_chart(fig_dist, use_container_width=True)
    
    with col2:
        fig_time = go.Figure(data=[
            go.Bar(
                x=['Classical', 'Quantum'],
                y=[classical_exec_time, quantum_exec_time],
                marker_color=['blue', 'red'],
                text=[f"{classical_exec_time:.4f} s", f"{quantum_exec_time:.4f} s"],
                textposition='auto'
            )
        ])
        fig_time.update_layout(title="Execution Time Comparison", yaxis_title="Time (seconds)", height=300)
        st.plotly_chart(fig_time, use_container_width=True)


def render_traffic_comparison(
    classical_route: List[int],
    quantum_route: List[int],
    classical_route_pois: List[Dict],
    quantum_route_pois: List[Dict],
    classical_quality: Dict,
    quantum_quality: Dict,
    classical_traffic_impact: Dict,
    quantum_traffic_impact: Dict,
    distance_matrix: np.ndarray,
    time_matrix: np.ndarray
):
    """
    Render traffic-aware comparison showing NN vs QAOA advantage
    
    Args:
        classical_route: Classical route indices
        quantum_route: Quantum route indices
        classical_route_pois: Classical route POI dictionaries
        quantum_route_pois: Quantum route POI dictionaries
        classical_quality: Classical quality metrics
        quantum_quality: Quantum quality metrics
        classical_traffic_impact: Classical traffic impact metrics
        quantum_traffic_impact: Quantum traffic impact metrics
        distance_matrix: Distance matrix
        time_matrix: Time matrix with traffic
    """
    st.subheader("🚦 Traffic-Aware Route Comparison")
    
    # Key insight box
    time_saved = classical_quality['total_time'] - quantum_quality['total_time']
    distance_added = quantum_quality['total_distance'] - classical_quality['total_distance']
    time_savings_pct = (time_saved / classical_quality['total_time'] * 100) if classical_quality['total_time'] > 0 else 0
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 🔧 Nearest Neighbor (Classical)")
        st.info(f"""
        **Shortest Path Strategy**
        - Distance: **{classical_quality['total_distance']:.2f} km** (shortest)
        - Time: **{classical_quality['total_time']:.1f} min** (longer due to traffic)
        - Traffic Impact: **{classical_traffic_impact['avg_traffic_factor']:.2f}x** average
        - High-Traffic Segments: **{classical_traffic_impact['high_traffic_segments']}**
        """)
    
    with col2:
        st.markdown("### ⚛️ QAOA (Quantum)")
        st.success(f"""
        **Traffic-Aware Strategy**
        - Distance: **{quantum_quality['total_distance']:.2f} km** (+{distance_added:.2f} km)
        - Time: **{quantum_quality['total_time']:.1f} min** ({time_saved:.1f} min saved, {time_savings_pct:.1f}% faster)
        - Traffic Impact: **{quantum_traffic_impact['avg_traffic_factor']:.2f}x** average
        - High-Traffic Segments: **{quantum_traffic_impact['high_traffic_segments']}**
        """)
    
    # Traffic heatmap for route segments
    st.markdown("### 📊 Traffic Heatmap by Route Segment")
    
    # Prepare data for heatmap
    classical_segments = []
    quantum_segments = []
    
    for i, segment in enumerate(classical_traffic_impact['traffic_segments']):
        classical_segments.append({
            'Segment': f"{segment['from_poi']} → {segment['to_poi']}",
            'Traffic Factor': segment['traffic_factor'],
            'Distance (km)': segment['distance_km'],
            'Time (min)': segment['time_with_traffic_min']
        })
    
    for i, segment in enumerate(quantum_traffic_impact['traffic_segments']):
        quantum_segments.append({
            'Segment': f"{segment['from_poi']} → {segment['to_poi']}",
            'Traffic Factor': segment['traffic_factor'],
            'Distance (km)': segment['distance_km'],
            'Time (min)': segment['time_with_traffic_min']
        })
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### Classical Route Segments")
        classical_df = pd.DataFrame(classical_segments)
        st.dataframe(classical_df.style.background_gradient(
            subset=['Traffic Factor'], 
            cmap='Reds', 
            vmin=1.0, 
            vmax=2.0
        ), use_container_width=True, hide_index=True)
    
    with col2:
        st.markdown("#### Quantum Route Segments")
        quantum_df = pd.DataFrame(quantum_segments)
        st.dataframe(quantum_df.style.background_gradient(
            subset=['Traffic Factor'], 
            cmap='Greens', 
            vmin=1.0, 
            vmax=2.0
        ), use_container_width=True, hide_index=True)
    
    # Comparison chart
    st.markdown("### 📈 Distance vs Time Trade-off")
    
    fig = go.Figure()
    
    # Add classical point
    fig.add_trace(go.Scatter(
        x=[classical_quality['total_distance']],
        y=[classical_quality['total_time']],
        mode='markers+text',
        marker=dict(size=15, color='blue', symbol='circle'),
        text=['NN'],
        textposition='top center',
        name='Nearest Neighbor'
    ))
    
    # Add quantum point
    fig.add_trace(go.Scatter(
        x=[quantum_quality['total_distance']],
        y=[quantum_quality['total_time']],
        mode='markers+text',
        marker=dict(size=15, color='red', symbol='star'),
        text=['QAOA'],
        textposition='top center',
        name='QAOA'
    ))
    
    # Add annotation showing trade-off
    fig.add_annotation(
        x=(classical_quality['total_distance'] + quantum_quality['total_distance']) / 2,
        y=(classical_quality['total_time'] + quantum_quality['total_time']) / 2,
        text=f"Time saved: {time_saved:.1f} min<br>Distance added: {distance_added:.2f} km",
        showarrow=True,
        arrowhead=2,
        bgcolor="rgba(255,255,255,0.8)"
    )
    
    fig.update_layout(
        title="Route Comparison: Distance vs Travel Time",
        xaxis_title="Total Distance (km)",
        yaxis_title="Total Travel Time (minutes)",
        height=400,
        showlegend=True
    )
    
    st.plotly_chart(fig, use_container_width=True)
    
    # Key insight summary
    if time_saved > 0 and distance_added < time_saved * 2:  # Reasonable trade-off
        st.success(f"""
        **✅ Quantum Advantage Demonstrated:**
        
        QAOA found a route that is **{distance_added:.2f} km longer** but saves **{time_saved:.1f} minutes** 
        ({time_savings_pct:.1f}% faster) by avoiding high-traffic segments. 
        
        This demonstrates QAOA's ability to optimize for **multi-objective goals** (distance + traffic) 
        rather than just shortest path like Nearest Neighbor.
        """)
    else:
        st.info("Both routes have similar performance. Try a different scenario with more traffic variation.")


def render_traffic_aware_route_explanation(
    classical_route: List[int],
    quantum_route: List[int],
    classical_route_pois: List[Dict],
    quantum_route_pois: List[Dict],
    classical_traffic_impact: Dict,
    quantum_traffic_impact: Dict,
    encoding_info: Dict = None
):
    """
    Add detailed explanation of why routes differ due to traffic awareness
    """
    with st.expander("🔍 Traffic-Aware Route Analysis", expanded=False):
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("#### 🔧 Nearest Neighbor Route Analysis")
            st.write("**Why shortest distance led to longer time:**")
            
            high_traffic_segments = [s for s in classical_traffic_impact['traffic_segments'] if s['is_high_traffic']]
            
            if high_traffic_segments:
                st.write("**High-traffic segments taken:**")
                for segment in high_traffic_segments:
                    st.write(f"- {segment['from_poi']} → {segment['to_poi']}: "
                           f"Factor {segment['traffic_factor']:.2f}x "
                           f"({segment['time_with_traffic_min']:.1f} min)")
                st.write(f"\n**Total high-traffic segments: {len(high_traffic_segments)}**")
            else:
                st.write("No high-traffic segments in this route.")
            
            st.write(f"\n**Average traffic factor: {classical_traffic_impact['avg_traffic_factor']:.2f}x**")
            st.write(f"**Total traffic impact score: {classical_traffic_impact['traffic_impact_score']:.2f}**")
        
        with col2:
            st.markdown("#### ⚛️ QAOA Route Analysis")
            st.write("**How quantum optimization avoided traffic:**")
            
            if encoding_info and 'qubit_mapping' in encoding_info:
                qubit_mapping = encoding_info.get('qubit_mapping', {})
                st.write("**Qubit states (feature preferences):**")
                for qubit_idx, feature in qubit_mapping.items():
                    if feature == 'traffic':
                        st.write(f"- Q{qubit_idx} (Traffic): Optimized to avoid high-traffic routes")
            
            high_traffic_segments = [s for s in quantum_traffic_impact['traffic_segments'] if s['is_high_traffic']]
            
            if high_traffic_segments:
                st.write(f"\n**High-traffic segments taken: {len(high_traffic_segments)}**")
                for segment in high_traffic_segments:
                    st.write(f"- {segment['from_poi']} → {segment['to_poi']}: "
                           f"Factor {segment['traffic_factor']:.2f}x")
            else:
                st.success("✅ **No high-traffic segments!** QAOA successfully avoided all high-traffic routes.")
            
            st.write(f"\n**Average traffic factor: {quantum_traffic_impact['avg_traffic_factor']:.2f}x**")
            st.write(f"**Total traffic impact score: {quantum_traffic_impact['traffic_impact_score']:.2f}**")
        
        # Comparison summary
        st.markdown("---")
        st.markdown("### 📊 Comparison Summary")
        
        traffic_avoidance_rate = (
            (classical_traffic_impact['high_traffic_segments'] - quantum_traffic_impact['high_traffic_segments']) 
            / max(classical_traffic_impact['high_traffic_segments'], 1) * 100
        ) if classical_traffic_impact['high_traffic_segments'] > 0 else 0
        
        comparison_data = {
            "Metric": [
                "High-Traffic Segments",
                "Average Traffic Factor",
                "Traffic Impact Score",
                "Traffic Avoidance Rate"
            ],
            "Nearest Neighbor": [
                str(classical_traffic_impact['high_traffic_segments']),
                f"{classical_traffic_impact['avg_traffic_factor']:.2f}x",
                f"{classical_traffic_impact['traffic_impact_score']:.2f}",
                "0%"
            ],
            "QAOA": [
                str(quantum_traffic_impact['high_traffic_segments']),
                f"{quantum_traffic_impact['avg_traffic_factor']:.2f}x",
                f"{quantum_traffic_impact['traffic_impact_score']:.2f}",
                f"{traffic_avoidance_rate:.1f}%"
            ]
        }
        
        st.dataframe(pd.DataFrame(comparison_data), use_container_width=True, hide_index=True)


def render_step_by_step_workflow(
    pois: List[Dict],
    user_preferences: Dict,
    feature_matrix: np.ndarray,
    feature_info: Dict,
    qubo_matrix: np.ndarray,
    encoding_info: Dict,
    optimization_result: Dict,
    distance_matrix: np.ndarray,
    time_matrix: np.ndarray
):
    """
    Render comprehensive step-by-step workflow visualization
    Shows maps and visualizations at each step of the optimization process
    """
    st.header("📋 Step-by-Step Optimization Workflow")
    st.markdown("---")
    
    # Step 1: Input POIs on Map
    with st.expander("📍 Step 1: Input - Selected POIs on Map", expanded=True):
        st.markdown("### Selected POIs and Starting Location")
        
        # Create map with all POIs and start location
        fig = go.Figure()
        
        # Add start location
        start_lat = user_preferences.get('start_lat', 11.5625)
        start_lon = user_preferences.get('start_lon', 104.9310)
        
        fig.add_trace(go.Scattermapbox(
            mode="markers+text",
            lon=[start_lon],
            lat=[start_lat],
            text=["🏁 Start"],
            textposition="top right",
            marker=dict(size=15, color="green", symbol="circle"),
            name="Start Location"
        ))
        
        # Add all selected POIs
        poi_lats = [float(poi['lat']) for poi in pois]
        poi_lngs = [float(poi['lng']) for poi in pois]
        poi_names = [poi['name'] for poi in pois]
        
        fig.add_trace(go.Scattermapbox(
            mode="markers+text",
            lon=poi_lngs,
            lat=poi_lats,
            text=[f"{i+1}. {name}" for i, name in enumerate(poi_names)],
            textposition="top right",
            marker=dict(size=12, color="blue", symbol="circle"),
            name="Selected POIs"
        ))
        
        # Center map
        all_lats = [start_lat] + poi_lats
        all_lngs = [start_lon] + poi_lngs
        
        fig.update_layout(
            mapbox=dict(
                style="open-street-map",
                center=dict(lat=float(np.mean(all_lats)), lon=float(np.mean(all_lngs))),
                zoom=12
            ),
            height=500,
            title="Input: Selected POIs and Starting Location"
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # POI details table
        poi_data = []
        for i, poi in enumerate(pois):
            poi_data.append({
                "POI": i + 1,
                "Name": poi['name'],
                "Category": poi['category'],
                "Latitude": f"{poi['lat']:.4f}",
                "Longitude": f"{poi['lng']:.4f}"
            })
        st.dataframe(pd.DataFrame(poi_data), use_container_width=True, hide_index=True)
    
    # Step 2: Feature Matrix Visualization
    with st.expander("📊 Step 2: Feature Matrix Creation", expanded=True):
        st.markdown("### Feature Matrix (POIs × Features)")
        st.write(f"**Shape:** {feature_matrix.shape[0]} POIs × {feature_matrix.shape[1]} Features")
        
        # Create feature matrix heatmap
        feature_df = pd.DataFrame(
            feature_matrix,
            columns=feature_info.get('feature_names', [f'Feature_{i}' for i in range(feature_matrix.shape[1])]),
            index=[poi['name'] for poi in pois]
        )
        
        # Display as heatmap
        fig = go.Figure(data=go.Heatmap(
            z=feature_matrix,
            x=feature_info.get('feature_names', [f'F{i}' for i in range(feature_matrix.shape[1])]),
            y=[poi['name'] for poi in pois],
            colorscale='Viridis',
            text=feature_matrix,
            texttemplate='%{text:.2f}',
            textfont={"size": 10},
            colorbar=dict(title="Feature Value")
        ))
        fig.update_layout(
            title="Feature Matrix Heatmap",
            xaxis_title="Features",
            yaxis_title="POIs",
            height=400
        )
        st.plotly_chart(fig, use_container_width=True)
        
        # Feature matrix table
        st.dataframe(feature_df, use_container_width=True)
        
        # Feature descriptions
        st.markdown("**Feature Descriptions:**")
        st.write("- **Category features**: One-hot encoded (1 if POI belongs to category, 0 otherwise)")
        st.write("- **Distance from start**: Normalized 0-1")
        st.write("- **Opening compatibility**: 0-1 score (1 = fully accessible during trip)")
        st.write("- **Average traffic**: Normalized 0-1 (from traffic data)")
    
    # Step 3: QUBO Encoding Visualization
    with st.expander("🔢 Step 3: QUBO Encoding", expanded=True):
        st.markdown("### QUBO Matrix (Feature-Based Encoding)")
        st.write(f"**Matrix Size:** {qubo_matrix.shape[0]}×{qubo_matrix.shape[1]} (for {encoding_info.get('num_qubits', 4)} qubits)")
        
        # Qubit mapping
        st.markdown("**Qubit Feature Mapping:**")
        qubit_mapping = encoding_info.get('qubit_mapping', {})
        mapping_data = []
        for qubit_idx, feature in qubit_mapping.items():
            mapping_data.append({
                "Qubit": f"Q{qubit_idx}",
                "Feature": feature,
                "|0⟩ State": "Minimize" if feature in ['distance', 'time', 'traffic'] else "Prefer similar",
                "|1⟩ State": "Accept" if feature in ['distance', 'time', 'traffic'] else "Prefer diverse"
            })
        st.dataframe(pd.DataFrame(mapping_data), use_container_width=True, hide_index=True)
        
        # QUBO matrix heatmap
        qubit_labels = [f"Q{i}" for i in range(qubo_matrix.shape[0])]
        fig = go.Figure(data=go.Heatmap(
            z=qubo_matrix,
            x=qubit_labels,
            y=qubit_labels,
            colorscale='RdBu',
            text=qubo_matrix,
            texttemplate='%{text:.3f}',
            textfont={"size": 12},
            colorbar=dict(title="QUBO Coefficient"),
            zmid=0
        ))
        fig.update_layout(
            title="QUBO Matrix (Diagonal = Feature Weights, Off-Diagonal = Interactions)",
            xaxis_title="Qubit",
            yaxis_title="Qubit",
            height=400
        )
        st.plotly_chart(fig, use_container_width=True)
        
        # QUBO matrix table
        qubo_df = pd.DataFrame(
            qubo_matrix,
            index=qubit_labels,
            columns=qubit_labels
        )
        st.dataframe(qubo_df, use_container_width=True)
        
        st.markdown("**QUBO Formula:** E(x) = x^T Q x")
        st.write("Where x is a binary vector representing qubit states (0 or 1)")
    
    # Step 4: QAOA Circuit (if available)
    if 'circuit' in optimization_result.get('result', {}) and optimization_result['result'].get('circuit') is not None:
        with st.expander("⚛️ Step 4: QAOA Circuit Optimization", expanded=True):
            st.markdown("### Quantum Circuit Structure")
            
            result = optimization_result['result']
            num_qubits = encoding_info.get('num_qubits', 4)
            num_layers = result.get('num_layers', 2)
            
            st.write(f"**Number of Qubits:** {num_qubits}")
            st.write(f"**Number of Layers (p):** {num_layers}")
            st.write(f"**Total Parameters:** {2 * num_layers} (γ₁, β₁, ..., γₚ, βₚ)")
            
            # Circuit diagram (if available)
            if 'circuit' in result:
                st.markdown("**Circuit Diagram:**")
                st.info("Circuit visualization is shown in the 'Circuit' tab")
            
            # Parameters
            if 'parameters' in result and result['parameters']:
                st.markdown("**Optimized Parameters:**")
                params_data = []
                import math
                for key, value in result['parameters'].items():
                    val = float(value.real) if isinstance(value, complex) else float(value)
                    params_data.append({
                        "Parameter": key,
                        "Value": f"{val:.6f}",
                        "Angle (rad)": f"{val:.6f}",
                        "Angle (deg)": f"{math.degrees(val):.2f}°",
                        "In π units": f"{val/math.pi:.3f}π" if val != 0 else "0"
                    })
                st.dataframe(pd.DataFrame(params_data), use_container_width=True, hide_index=True)
            
            # Measurement results summary
            if 'counts' in result:
                st.markdown("**Measurement Results:**")
                counts = result['counts']
                total_shots = sum(counts.values()) if isinstance(counts, dict) else 0
                if isinstance(counts, dict) and counts:
                    sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:5]
                    st.write(f"**Total Shots:** {total_shots}")
                    st.write("**Top 5 Measurement Results:**")
                    for bitstring, count in sorted_counts:
                        prob = (count / total_shots * 100) if total_shots > 0 else 0
                        st.write(f"  - `{bitstring}`: {count} counts ({prob:.2f}%)")
    
    # Step 5: Decoding Process
    with st.expander("🔍 Step 5: Decoding Process", expanded=True):
        st.markdown("### From Qubit States to Route Preferences")
        
        result = optimization_result['result']
        decode_info = result.get('decode_info', {})
        
        # Show measurement result
        if 'bitstring' in decode_info:
            bitstring = decode_info['bitstring']
            st.markdown(f"**Measured Bitstring:** `{bitstring}`")
            
            # Interpret qubit states
            st.markdown("**Qubit State Interpretation:**")
            qubit_mapping = encoding_info.get('qubit_mapping', {})
            interpretation_data = []
            for i, (qubit_idx, feature) in enumerate(qubit_mapping.items()):
                if i < len(bitstring):
                    state = int(bitstring[i])
                    interpretation_data.append({
                        "Qubit": f"Q{qubit_idx}",
                        "Feature": feature,
                        "State": f"|{state}⟩",
                        "Binary": state,
                        "Preference": "Accept/Minimize" if state == 1 else "Minimize/Prefer"
                    })
            st.dataframe(pd.DataFrame(interpretation_data), use_container_width=True, hide_index=True)
        
        # Show decoded preferences
        if 'preferences' in decode_info:
            st.markdown("**Decoded Feature Preferences:**")
            prefs_data = []
            for feature, value in decode_info['preferences'].items():
                weight = 0.5 if value == 1 else 1.0
                prefs_data.append({
                    "Feature": feature,
                    "Qubit State": value,
                    "Route Weight": weight,
                    "Meaning": "Accept (weight=0.5)" if value == 1 else "Minimize (weight=1.0)"
                })
            st.dataframe(pd.DataFrame(prefs_data), use_container_width=True, hide_index=True)
        
        st.markdown("**Decoding Algorithm:**")
        st.write("1. Extract most probable bitstring from QAOA measurements")
        st.write("2. Map each qubit state to feature preference")
        st.write("3. Create weighted cost matrix using preferences")
        st.write("4. Apply weighted nearest neighbor algorithm")
        st.write("5. Generate final route sequence")
    
    # Step 6: Final Route Visualization
    with st.expander("🗺️ Step 6: Final Optimized Route", expanded=True):
        st.markdown("### Optimized Route on Map")
        
        route = optimization_result.get('route', list(range(len(pois))))
        route_pois = [pois[i] for i in route]
        
        # Create route map
        fig = go.Figure()
        
        # Add start location
        start_lat = user_preferences.get('start_lat', 11.5625)
        start_lon = user_preferences.get('start_lon', 104.9310)
        
        fig.add_trace(go.Scattermapbox(
            mode="markers+text",
            lon=[start_lon],
            lat=[start_lat],
            text=["🏁 Start"],
            textposition="top right",
            marker=dict(size=15, color="green", symbol="circle"),
            name="Start"
        ))
        
        # Add route path
        route_lats = [float(poi['lat']) for poi in route_pois]
        route_lngs = [float(poi['lng']) for poi in route_pois]
        
        fig.add_trace(go.Scattermapbox(
            mode="lines+markers+text",
            lon=route_lngs,
            lat=route_lats,
            text=[f"{i+1}. {poi['name']}" for i, poi in enumerate(route_pois)],
            textposition="top right",
            marker=dict(size=12, color="red", symbol="circle"),
            line=dict(width=4, color="blue"),
            name="Optimized Route"
        ))
        
        # Center map
        all_lats = [start_lat] + route_lats
        all_lngs = [start_lon] + route_lngs
        
        fig.update_layout(
            mapbox=dict(
                style="open-street-map",
                center=dict(lat=float(np.mean(all_lats)), lon=float(np.mean(all_lngs))),
                zoom=12
            ),
            height=600,
            title="Final Optimized Route"
        )
        
        st.plotly_chart(fig, use_container_width=True)
        
        # Route details
        st.markdown("**Route Sequence:**")
        route_text = " → ".join([f"{i+1}. {poi['name']}" for i, poi in enumerate(route_pois)])
        st.markdown(f"**{route_text}**")
        
        # Calculate metrics
        total_distance = 0.0
        total_time = 0.0
        for i in range(len(route) - 1):
            total_distance += float(distance_matrix[route[i]][route[i+1]])
            total_time += float(time_matrix[route[i]][route[i+1]])
        
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Distance", f"{total_distance:.2f} km")
        with col2:
            st.metric("Total Travel Time", f"{total_time:.1f} min")
        with col3:
            energy = result.get('energy', 0)
            energy = float(energy.real) if isinstance(energy, complex) else float(energy)
            st.metric("QAOA Energy", f"{energy:.4f}")
        with col4:
            st.metric("Valid Solution", "✅ Yes" if result.get('is_valid', False) else "❌ No")
        
        # Route details table
        st.markdown("**Route Details:**")
        render_route_details(route, route_pois, distance_matrix, time_matrix)

