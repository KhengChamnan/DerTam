"""
Optimization workflows for Streamlit app
Quantum and classical optimization logic
"""
import streamlit as st
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from quantum_optimizer.qubo_encoder import QUBOEncoder
from quantum_optimizer.qaoa_solver import QAOASolver
from classical_optimizer.tsp_solver import ClassicalOptimizer
from app_helpers import (
    calculate_matrices, create_feature_matrix, prepare_data_for_classical
)

# Import for traffic debugging
import numpy as np


def _map_constraint_weights_for_qubo(constraint_weights: Dict) -> Dict:
    """
    Map constraint_weights from user preferences format to QUBO format.
    Maps 'preferences' to 'category' for quantum optimization.
    
    Args:
        constraint_weights: Constraint weights dict with 'preferences' key
        
    Returns:
        Constraint weights dict with 'category' key (for QUBO encoder)
    """
    qubo_weights = constraint_weights.copy()
    # Map 'preferences' to 'category' for QUBO encoder
    if 'preferences' in qubo_weights:
        qubo_weights['category'] = qubo_weights.pop('preferences')
    return qubo_weights


def run_quantum_optimization(
    pois: List[Dict],
    user_preferences: Dict,
    qaoa_config: Dict
) -> Dict:
    """
    Run quantum optimization workflow
    
    Returns:
        Dictionary with optimization result and metadata
    """
    # Step 1: Calculate matrices
    st.write("📐 Step 1: Calculating Distance & Time Matrices")
    distance_calc, distance_matrix, time_matrix, traffic_penalty = calculate_matrices(pois)
    st.success(f"✅ Calculated matrices for {len(pois)} POIs")
    
    # Debug: Show traffic penalty matrix statistics
    if traffic_penalty is not None:
        traffic_min = np.min(traffic_penalty[traffic_penalty > 0]) if np.any(traffic_penalty > 0) else 0
        traffic_max = np.max(traffic_penalty) if np.any(traffic_penalty > 0) else 0
        traffic_mean = np.mean(traffic_penalty[traffic_penalty > 0]) if np.any(traffic_penalty > 0) else 0
        traffic_std = np.std(traffic_penalty[traffic_penalty > 0]) if np.any(traffic_penalty > 0) else 0
        
        st.write(f"**Traffic Penalty Stats:** Min={traffic_min:.4f}, Max={traffic_max:.4f}, Mean={traffic_mean:.4f}, Std={traffic_std:.4f}")
        if traffic_std < 0.01:
            st.warning("⚠️ **Warning:** Traffic penalty matrix is nearly uniform (std < 0.01). Routes may not change with traffic sensitivity because all routes have similar traffic penalties.")
        else:
            st.info(f"✅ Traffic penalty has variation (std={traffic_std:.4f}), so traffic sensitivity should affect routes.")
    
    # Step 2: Create feature matrix
    st.write("📊 Step 2: Creating Feature Matrix")
    feature_matrix, feature_info = create_feature_matrix(pois, user_preferences, distance_calc)
    st.success(f"✅ Feature matrix created: {feature_matrix.shape}")
    st.write(f"**Features:** {', '.join(feature_info['feature_names'])}")
    
    # Display feature matrix
    feature_df = pd.DataFrame(
        feature_matrix,
        columns=feature_info['feature_names'],
        index=[poi['name'] for poi in pois]
    )
    st.dataframe(feature_df.style.background_gradient(cmap='viridis'), use_container_width=True)
    
    # Step 3: QUBO Encoding
    st.write("🔢 Step 3: Encoding to QUBO (Feature-Based)")
    qubo_encoder = QUBOEncoder(penalty_coefficient=1000.0)
    # Map 'preferences' to 'category' for QUBO encoder
    qubo_constraint_weights = _map_constraint_weights_for_qubo(user_preferences['constraint_weights'])
    qubo_matrix, encoding_info = qubo_encoder.encode_feature_based(
        feature_matrix, distance_matrix,
        time_matrix=time_matrix,
        traffic_penalty_matrix=traffic_penalty,
        constraint_weights=qubo_constraint_weights,
        num_qubits=4,
        feature_info=feature_info
    )
    
    st.success(f"✅ QUBO matrix created: {qubo_matrix.shape} (Feature-Based, {encoding_info['num_qubits']} qubits)")
    
    # Display qubit mapping
    st.write("**Qubit Feature Mapping:**")
    for qubit_idx, feature in encoding_info['qubit_mapping'].items():
        st.write(f"  Q{qubit_idx}: {feature}")
    
    # Display QUBO matrix
    st.write("**QUBO Matrix:**")
    qubo_df = pd.DataFrame(
        qubo_matrix,
        index=[f"Q{i}" for i in range(qubo_matrix.shape[0])],
        columns=[f"Q{j}" for j in range(qubo_matrix.shape[1])]
    )
    st.dataframe(qubo_df, use_container_width=True)
    
    # Step 4: QAOA Solving
    st.write("⚛️ Step 4: Solving with QAOA")
    qaoa_solver = QAOASolver(
        num_layers=qaoa_config['num_layers'],
        shots=qaoa_config['shots'],
        optimizer=qaoa_config['optimizer'],
        max_iterations=100
    )
    
    result = qaoa_solver.solve(
        qubo_matrix, len(pois), encoding_info,
        distance_matrix=distance_matrix,
        time_matrix=time_matrix,
        traffic_penalty_matrix=traffic_penalty,
        pois=pois
    )
    
    st.success("✅ Optimization complete!")
    
    # Step 5: Decode and display
    st.write("🔍 Step 5: Decoding Route")
    route = result['route']
    route_pois = [pois[i] for i in route]
    
    # Display decoding info
    if 'decode_info' in result and 'preferences' in result['decode_info']:
        st.write("**Decoded Feature Preferences:**")
        for feature, value in result['decode_info']['preferences'].items():
            st.write(f"  {feature}: {'|1⟩' if value == 1 else '|0⟩'}")
    
    return {
        'result': result,
        'route': route,
        'route_pois': route_pois,
        'pois': pois,
        'encoding_info': encoding_info,
        'feature_matrix': feature_matrix.tolist(),
        'feature_info': feature_info,
        'qubo_matrix': qubo_matrix.tolist(),
        'distance_matrix': distance_matrix.tolist(),
        'time_matrix': time_matrix.tolist(),
        'traffic_penalty': traffic_penalty.tolist() if traffic_penalty is not None else None
    }


def run_classical_optimization(
    pois: List[Dict],
    user_preferences: Dict,
    algorithm: str
) -> Tuple[Dict, np.ndarray, np.ndarray]:
    """
    Run classical optimization
    
    Returns:
        (result_dict, distance_matrix, time_matrix)
    """
    # Calculate matrices
    distance_calc, distance_matrix, time_matrix, _ = calculate_matrices(pois)
    
    # Prepare data
    prepared_data = prepare_data_for_classical(pois, user_preferences, distance_matrix, time_matrix)
    
    # Run optimization
    classical_optimizer = ClassicalOptimizer()
    result = classical_optimizer.solve(prepared_data, algorithm=algorithm)
    
    return result, distance_matrix, time_matrix


def run_comparison(
    pois: List[Dict],
    user_preferences: Dict,
    classical_algorithm: str,
    qaoa_config: Dict
) -> Dict:
    """
    Run comparison between classical and quantum optimization
    
    Returns:
        Dictionary with comparison results
    """
    from comparison.metrics import MetricsCalculator
    from app_helpers import time_string_to_minutes
    
    # Step 1: Calculate matrices
    st.write("📐 Step 1: Calculating Distance & Time Matrices")
    distance_calc, distance_matrix, time_matrix, traffic_penalty = calculate_matrices(pois)
    st.success(f"✅ Calculated matrices for {len(pois)} POIs")
    
    # Step 2: Classical Optimization
    st.write("🔧 Step 2: Classical Optimization")
    classical_result, _, _ = run_classical_optimization(pois, user_preferences, classical_algorithm)
    classical_route_pois = [pois[i] for i in classical_result['route']]
    st.success(f"✅ Classical optimization complete ({classical_algorithm})")
    
    # Display classical route for debugging
    with st.expander("🔍 Classical Route Details"):
        st.write(f"**Route Indices:** {classical_result['route']}")
        st.write(f"**Route Names:** {' → '.join([poi['name'] for poi in classical_route_pois])}")
        st.write(f"**Total Distance:** {classical_result.get('total_distance', 0):.2f} km")
        st.write(f"**Execution Time:** {classical_result.get('execution_time', 0):.4f} s")
    
    # Step 3: Create Feature Matrix
    st.write("📊 Step 3: Creating Feature Matrix")
    feature_matrix, feature_info = create_feature_matrix(pois, user_preferences, distance_calc)
    st.success(f"✅ Feature matrix created: {feature_matrix.shape}")
    
    # Step 4: Quantum Optimization
    st.write("⚛️ Step 4: Quantum Optimization")
    qubo_encoder = QUBOEncoder(penalty_coefficient=1000.0)
    # Map 'preferences' to 'category' for QUBO encoder
    qubo_constraint_weights = _map_constraint_weights_for_qubo(user_preferences['constraint_weights'])
    qubo_matrix, encoding_info = qubo_encoder.encode_feature_based(
        feature_matrix, distance_matrix,
        time_matrix=time_matrix,
        traffic_penalty_matrix=traffic_penalty,
        constraint_weights=qubo_constraint_weights,
        num_qubits=4,
        feature_info=feature_info
    )
    
    qaoa_solver = QAOASolver(
        num_layers=qaoa_config['num_layers'],
        shots=qaoa_config['shots'],
        optimizer="COBYLA",
        max_iterations=100
    )
    
    quantum_result = qaoa_solver.solve(
        qubo_matrix, len(pois), encoding_info,
        distance_matrix=distance_matrix,
        time_matrix=time_matrix,
        traffic_penalty_matrix=traffic_penalty,
        pois=pois
    )
    quantum_route_pois = [pois[i] for i in quantum_result['route']]
    st.success("✅ Quantum optimization complete (QAOA - Feature-Based)")
    
    # Display quantum route for debugging
    with st.expander("🔍 Quantum Route Details"):
        st.write(f"**Route Indices:** {quantum_result['route']}")
        st.write(f"**Route Names:** {' → '.join([poi['name'] for poi in quantum_route_pois])}")
        st.write(f"**Total Distance:** {quantum_result.get('total_distance', 0):.2f} km")
        st.write(f"**Energy:** {quantum_result.get('energy', 0):.4f}")
        st.write(f"**Success:** {quantum_result.get('success', False)}")
        
        # Show if using fallback
        if not quantum_result.get('success', True):
            st.warning("⚠️ Quantum solver may have used classical fallback")
        
        # Show measurement results
        if 'decode_info' in quantum_result:
            decode_info = quantum_result['decode_info']
            if 'bitstring' in decode_info:
                st.write(f"**Measured Bitstring:** `{decode_info['bitstring']}`")
            if 'preferences' in decode_info:
                st.write("**Decoded Preferences:**")
                st.json(decode_info['preferences'])
        
        # Show if routes are the same
        if classical_result['route'] == quantum_result['route']:
            st.warning("⚠️ **Routes are identical!** Quantum and Classical produced the same route.")
        else:
            st.success("✅ **Routes are different!** Quantum found a different solution.")
    
    # Step 5: Calculate metrics
    st.write("📈 Step 5: Calculating Comparison Metrics")
    metrics_calc = MetricsCalculator()
    start_time_minutes = time_string_to_minutes(user_preferences.get('start_time', '08:00:00'))
    
    # Evaluate solutions
    classical_quality = metrics_calc.evaluate_solution_quality(
        classical_result['route'], pois, distance_matrix, time_matrix
    )
    classical_constraints = metrics_calc.check_constraint_violations(
        classical_result['route'], pois, time_matrix, start_time_minutes
    )
    
    quantum_quality = metrics_calc.evaluate_solution_quality(
        quantum_result['route'], pois, distance_matrix, time_matrix
    )
    quantum_constraints = metrics_calc.check_constraint_violations(
        quantum_result['route'], pois, time_matrix, start_time_minutes
    )
    
    # Calculate traffic impact metrics
    traffic_factors = distance_calc.traffic_factors if hasattr(distance_calc, 'traffic_factors') else {}
    default_traffic_factor = distance_calc.default_traffic_factor if hasattr(distance_calc, 'default_traffic_factor') else 1.2
    
    classical_traffic_impact = metrics_calc.calculate_traffic_impact(
        classical_result['route'], pois, distance_matrix,
        traffic_factors, default_traffic_factor
    )
    
    quantum_traffic_impact = metrics_calc.calculate_traffic_impact(
        quantum_result['route'], pois, distance_matrix,
        traffic_factors, default_traffic_factor
    )
    
    return {
        'classical': {
            'result': classical_result,
            'route': classical_result['route'],
            'route_pois': classical_route_pois,
            'quality': classical_quality,
            'constraints': classical_constraints,
            'traffic_impact': classical_traffic_impact
        },
        'quantum': {
            'result': quantum_result,
            'route': quantum_result['route'],
            'route_pois': quantum_route_pois,
            'quality': quantum_quality,
            'constraints': quantum_constraints,
            'traffic_impact': quantum_traffic_impact
        },
        'pois': pois,
        'distance_matrix': distance_matrix.tolist(),
        'time_matrix': time_matrix.tolist(),
        'encoding_info': encoding_info
    }

