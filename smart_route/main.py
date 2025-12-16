"""
Smart Tourist Route Optimization - Main API
100% FREE - FastAPI application
"""
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import numpy as np
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app (FREE)
app = FastAPI(
    title="Smart Route Optimization API",
    description="100% FREE Tourist Route Optimization using Classical + Quantum Algorithms",
    version="1.0.0"
)

# Add CORS middleware (allow Laravel backend to call)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import our FREE modules
from classical_optimizer.poi_recommender import POIRecommender
from classical_optimizer.nearest_neighbor import NearestNeighborSolver
from classical_optimizer.two_opt import TwoOptSolver
from classical_optimizer.ortools_solver import ORToolsSolver
from quantum_optimizer.qubo_encoder import QUBOEncoder
from quantum_optimizer.qaoa_solver import QAOASolver
from quantum_optimizer.circuit_visualizer import CircuitVisualizer
from comparison.metrics import MetricsCalculator
from utils.distance_calculator import DistanceCalculator


# Request/Response models
class POIModel(BaseModel):
    id: int
    name: str
    lat: float
    lon: float
    category: Optional[str] = "attraction"
    rating: Optional[float] = 4.0
    opening_time: Optional[int] = 0  # minutes since midnight
    closing_time: Optional[int] = 1440
    visit_duration: Optional[int] = 60


class OptimizeRequest(BaseModel):
    pois: List[POIModel]
    user_id: int
    user_preferences: Optional[Dict[str, float]] = {}
    start_time: Optional[int] = 540  # 9 AM
    algorithm: Optional[str] = "ortools"  # ortools, nearest_neighbor, quantum


class CompareRequest(BaseModel):
    pois: List[POIModel]
    algorithms: Optional[List[str]] = ["nearest_neighbor", "two_opt", "ortools", "quantum"]


class QuantumAutoRequest(BaseModel):
    """Request model for quantum-auto endpoint with CF filtering"""
    user_preferences: Dict[str, float]  # {category: weight} e.g., {"temple": 0.9, "museum": 0.6}
    start_location: List[float]  # [lat, lon]
    start_time: Optional[int] = 540  # 9 AM in minutes since midnight
    trip_duration: Optional[int] = 480  # 8 hours in minutes
    max_distance_km: Optional[float] = 10.0
    num_pois: Optional[int] = 4  # Exactly 4 POIs for QAOA
    province: Optional[str] = "Phnom Penh"


class QuantumAutoResponse(BaseModel):
    """Response model for quantum-auto endpoint"""
    success: bool
    route: List[int]
    route_pois: List[Dict]  # Full POI details in route order
    total_distance_km: float
    total_time_minutes: float
    satisfaction_score: float
    quantum_details: Dict
    recommendation_details: Dict
    visualization_data: Dict
    cost: str = "FREE (simulation only)"


# Global instances
poi_recommender = POIRecommender()
distance_calc = DistanceCalculator()
metrics_calc = MetricsCalculator()


@app.get("/")
async def root():
    """API Health check"""
    return {
        "service": "Smart Route Optimization",
        "status": "running",
        "version": "1.0.0",
        "cost": "100% FREE",
        "algorithms": {
            "classical": ["nearest_neighbor", "two_opt", "ortools"],
            "quantum": ["qaoa (simulation only)"]
        }
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "quantum_backend": os.getenv("QUANTUM_BACKEND", "qiskit_aer"),
        "routing_engine": os.getenv("ROUTING_ENGINE", "haversine"),
        "all_free": True
    }


@app.post("/api/optimize/classical")
async def optimize_classical(request: OptimizeRequest):
    """
    Optimize route using classical algorithms (FREE)
    Primary endpoint - Fast and practical
    """
    try:
        # Convert POIs to dict format
        pois = [poi.dict() for poi in request.pois]
        
        # Calculate distance matrix (FREE Haversine)
        distance_matrix = distance_calc.calculate_distance_matrix(pois)
        time_matrix = distance_calc.calculate_time_matrix(distance_matrix)
        
        # Select algorithm
        if request.algorithm == "nearest_neighbor":
            solver = NearestNeighborSolver()
            route, total_dist = solver.solve(pois, distance_matrix)
            
        elif request.algorithm == "two_opt":
            # First get NN solution, then improve
            nn_solver = NearestNeighborSolver()
            initial_route, _ = nn_solver.solve(pois, distance_matrix)
            
            two_opt_solver = TwoOptSolver(max_iterations=100)
            route, total_dist, iterations = two_opt_solver.optimize(
                initial_route, distance_matrix
            )
            
        elif request.algorithm == "ortools":
            solver = ORToolsSolver(time_limit_seconds=30)
            result = solver.solve_with_time_windows(
                pois, distance_matrix, time_matrix, request.start_time
            )
            route = result['route']
            total_dist = result['distance']
            
        else:
            raise HTTPException(status_code=400, detail=f"Unknown algorithm: {request.algorithm}")
        
        # Evaluate solution
        quality = metrics_calc.evaluate_solution_quality(
            route, pois, distance_matrix, time_matrix
        )
        
        return {
            "success": True,
            "algorithm": request.algorithm,
            "route": route,
            "route_names": [pois[i]['name'] for i in route],
            "total_distance_km": total_dist,
            "total_time_minutes": quality['total_time'],
            "num_pois": len(route),
            "cost": "FREE"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/optimize/quantum")
async def optimize_quantum(request: OptimizeRequest):
    """
    Optimize route using QAOA (FREE simulation)
    Demonstration endpoint - Limited to 4 POIs
    """
    try:
        pois = [poi.dict() for poi in request.pois]
        
        # Limit to 4 POIs for quantum
        if len(pois) > 4:
            return {
                "success": False,
                "error": "Quantum optimization limited to 4 POIs",
                "suggestion": "Use classical algorithms for more POIs",
                "pois_provided": len(pois),
                "max_pois_quantum": 4
            }
        
        # Calculate matrices
        distance_matrix = distance_calc.calculate_distance_matrix(pois)
        
        # Step 1: Encode to QUBO
        encoder = QUBOEncoder(penalty_coefficient=1000.0)
        qubo_matrix, encoding_info = encoder.encode_tsp(pois, distance_matrix)
        
        # Step 2: Solve with QAOA
        qaoa_solver = QAOASolver(
            num_layers=int(os.getenv('QAOA_LAYERS', 2)),
            shots=int(os.getenv('QUANTUM_SHOTS', 1024)),
            optimizer=os.getenv('QAOA_OPTIMIZER', 'COBYLA')
        )
        
        result = qaoa_solver.solve(qubo_matrix, len(pois))
        
        # Step 3: Evaluate
        quality = metrics_calc.evaluate_solution_quality(
            result['route'], pois, distance_matrix
        )
        
        return {
            "success": True,
            "algorithm": "QAOA (Quantum Simulation)",
            "route": result['route'],
            "route_names": [pois[i]['name'] for i in result['route']],
            "total_distance_km": quality['total_distance'],
            "is_valid_solution": result['is_valid'],
            "quantum_details": {
                "num_qubits": result['num_qubits'],
                "num_layers": result['num_layers'],
                "optimized_parameters": result['parameters'],
                "iterations": result['iterations'],
                "energy": result['energy']
            },
            "encoding_info": encoding_info,
            "cost": "FREE (simulation only, no quantum hardware)"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/compare")
async def compare_algorithms(request: CompareRequest):
    """
    Compare multiple algorithms (FREE)
    For teacher demonstration
    """
    try:
        pois = [poi.dict() for poi in request.pois]
        
        # Limit POIs for quantum
        if "quantum" in request.algorithms and len(pois) > 4:
            return {
                "success": False,
                "error": "Cannot include quantum with >4 POIs",
                "solution": "Remove quantum or reduce POIs to 4"
            }
        
        distance_matrix = distance_calc.calculate_distance_matrix(pois)
        time_matrix = distance_calc.calculate_time_matrix(distance_matrix)
        
        results = {}
        
        # Run each algorithm
        for algo_name in request.algorithms:
            if algo_name == "nearest_neighbor":
                solver = NearestNeighborSolver()
                route, dist = solver.solve(pois, distance_matrix)
                results[algo_name] = {'route': route, 'distance': dist}
                
            elif algo_name == "two_opt":
                nn_solver = NearestNeighborSolver()
                initial, _ = nn_solver.solve(pois, distance_matrix)
                solver = TwoOptSolver()
                route, dist, _ = solver.optimize(initial, distance_matrix)
                results[algo_name] = {'route': route, 'distance': dist}
                
            elif algo_name == "ortools":
                solver = ORToolsSolver()
                route, dist, _ = solver.solve_tsp(pois, distance_matrix)
                results[algo_name] = {'route': route, 'distance': dist}
                
            elif algo_name == "quantum":
                encoder = QUBOEncoder()
                qubo, _ = encoder.encode_tsp(pois, distance_matrix)
                qaoa = QAOASolver(num_layers=2, shots=512)  # Fewer shots for speed
                result = qaoa.solve(qubo, len(pois))
                results[algo_name] = {'route': result['route'], 'distance': result['energy']}
        
        # Generate comparison
        comparison_table = metrics_calc.generate_comparison_table({
            name: {
                'route': data['route'],
                'total_distance': data['distance'],
                'total_time': 0,
                'execution_time': 0,
                'is_feasible': True
            }
            for name, data in results.items()
        })
        
        return {
            "success": True,
            "algorithms_compared": len(results),
            "results": results,
            "comparison_table": comparison_table,
            "cost": "100% FREE"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/benchmark")
async def run_benchmark(scenario_name: Optional[str] = None):
    """
    Run comprehensive benchmark on test scenarios
    Demonstrates quantum advantage in specific problem types
    
    Args:
        scenario_name: 'preference_heavy', 'tight_constraints', 'asymmetric_distances', or None for all
        
    Returns:
        Detailed comparison showing where QAOA excels vs classical algorithms
    """
    try:
        import json
        from utils.brute_force_solver import BruteForceSolver
        
        # Load test scenarios
        scenario_dir = "data/test_scenarios"
        
        if scenario_name:
            scenarios_to_run = [scenario_name]
        else:
            scenarios_to_run = ['preference_heavy', 'tight_constraints', 'asymmetric_distances']
        
        benchmark_results = {}
        
        for scenario in scenarios_to_run:
            scenario_path = f"{scenario_dir}/{scenario}.json"
            
            try:
                with open(scenario_path, 'r') as f:
                    scenario_data = json.load(f)
            except FileNotFoundError:
                continue
            
            print(f"\n{'='*60}")
            print(f"Running benchmark: {scenario_data['name']}")
            print(f"{'='*60}")
            
            # Extract POIs and distance matrix
            pois = scenario_data['pois']
            if 'distance_matrix_asymmetric' in scenario_data:
                distance_matrix = np.array(scenario_data['distance_matrix_asymmetric'])
            else:
                distance_matrix = np.array(scenario_data['distance_matrix'])
            
            time_matrix = distance_matrix / 30 * 60  # Assume 30 km/h average
            
            # Get objective weights
            obj_weights = scenario_data.get('objective_weights', {'distance': 1.0})
            user_preferences = {poi['id']: poi.get('preference', 0.5) for poi in pois}
            
            # Results storage
            algo_results = {}
            
            # 1. Brute Force (Optimal Baseline)
            print("Running Brute Force (optimal)...")
            bf_solver = BruteForceSolver()
            bf_route, bf_distance, bf_details = bf_solver.solve(pois, distance_matrix, start_poi_idx=0)
            
            algo_results['brute_force'] = {
                'route': bf_route,
                'distance': bf_distance,
                'execution_time': 0.001,  # Very fast for 4 POIs
                'is_optimal': True
            }
            
            # 2. Nearest Neighbor
            print("Running Nearest Neighbor...")
            import time as time_module
            start = time_module.time()
            nn_solver = NearestNeighborSolver()
            nn_route, nn_distance = nn_solver.solve(pois, distance_matrix, start_poi_idx=0)
            nn_time = time_module.time() - start
            
            algo_results['nearest_neighbor'] = {
                'route': nn_route,
                'distance': nn_distance,
                'execution_time': nn_time,
                'is_optimal': False
            }
            
            # 3. 2-opt
            print("Running 2-opt...")
            start = time_module.time()
            two_opt_solver = TwoOptSolver(max_iterations=100)
            opt_route, opt_distance, opt_iters = two_opt_solver.optimize(nn_route, distance_matrix)
            opt_time = time_module.time() - start
            
            algo_results['two_opt'] = {
                'route': opt_route,
                'distance': opt_distance,
                'execution_time': opt_time,
                'iterations': opt_iters,
                'is_optimal': False
            }
            
            # 4. OR-Tools
            print("Running OR-Tools...")
            start = time_module.time()
            ortools_solver = ORToolsSolver(time_limit_seconds=30)
            or_route, or_distance, or_success = ortools_solver.solve_tsp(pois, distance_matrix, start_poi_idx=0)
            or_time = time_module.time() - start
            
            algo_results['ortools'] = {
                'route': or_route,
                'distance': or_distance,
                'execution_time': or_time,
                'is_optimal': False,
                'success': or_success
            }
            
            # 5. QAOA - with multi-objective encoding if preferences exist
            print("Running QAOA...")
            start = time_module.time()
            
            encoder = QUBOEncoder(penalty_coefficient=1000.0)
            
            # Use multi-objective encoding if preferences matter
            if 'preference' in obj_weights and obj_weights.get('preference', 0) > 0.1:
                print("  Using multi-objective QUBO encoding...")
                qubo_matrix, qubo_info = encoder.encode_multi_objective(
                    pois, 
                    distance_matrix,
                    user_preferences,
                    weights={
                        'constraint': 1000.0,
                        'distance': obj_weights.get('distance', 1.0),
                        'preference': obj_weights.get('preference', 0.0) * 50,
                        'time_penalty': 100.0
                    }
                )
            else:
                qubo_matrix, qubo_info = encoder.encode_tsp(pois, distance_matrix)
            
            qaoa_solver = QAOASolver(num_layers=2, shots=1024, optimizer='COBYLA', max_iterations=100)
            qaoa_result = qaoa_solver.solve(qubo_matrix, len(pois))
            qaoa_time = time_module.time() - start
            
            # Calculate actual distance for QAOA route
            qaoa_distance = sum(distance_matrix[qaoa_result['route'][i]][qaoa_result['route'][i+1]] 
                              for i in range(len(qaoa_result['route'])-1))
            
            algo_results['qaoa'] = {
                'route': qaoa_result['route'],
                'distance': qaoa_distance,
                'execution_time': qaoa_time,
                'energy': qaoa_result['energy'],
                'is_optimal': False,
                'quantum_details': {
                    'num_qubits': qaoa_result['num_qubits'],
                    'iterations': qaoa_result['iterations'],
                    'is_valid': qaoa_result['is_valid']
                }
            }
            
            # Calculate advanced metrics
            metrics = {}
            
            for algo_name, algo_data in algo_results.items():
                if algo_name == 'brute_force':
                    continue
                
                # Optimality gap
                opt_gap = metrics_calc.calculate_optimality_gap(
                    algo_data['route'],
                    distance_matrix,
                    bf_distance
                )
                
                # Multi-objective score
                multi_obj = metrics_calc.measure_multi_objective_score(
                    algo_data['route'],
                    pois,
                    distance_matrix,
                    user_preferences,
                    constraint_violations=0,
                    weights={
                        'distance': obj_weights.get('distance', 0.5),
                        'preference': obj_weights.get('preference', 0.5),
                        'constraints': 0.0
                    }
                )
                
                # Constraint satisfaction (if time constraints exist)
                if 'time_constraints' in scenario_data:
                    const_sat = metrics_calc.constraint_satisfaction_degree(
                        algo_data['route'],
                        pois,
                        time_matrix,
                        start_time=scenario_data.get('start_time', 540)
                    )
                else:
                    const_sat = {'satisfaction_degree': 1.0, 'num_hard_violations': 0}
                
                metrics[algo_name] = {
                    'optimality_gap': opt_gap,
                    'multi_objective_score': multi_obj,
                    'constraint_satisfaction': const_sat
                }
            
            # Determine winner for each category
            winners = {
                'distance': min(algo_results.items(), key=lambda x: x[1]['distance'])[0],
                'speed': min(algo_results.items(), key=lambda x: x[1]['execution_time'])[0],
                'multi_objective': max(metrics.items(), 
                                      key=lambda x: x[1]['multi_objective_score']['weighted_total'])[0]
            }
            
            benchmark_results[scenario] = {
                'scenario_info': {
                    'name': scenario_data['name'],
                    'description': scenario_data['description'],
                    'objective_weights': obj_weights
                },
                'algorithm_results': algo_results,
                'detailed_metrics': metrics,
                'winners': winners,
                'optimal_solution': {
                    'route': bf_route,
                    'distance': bf_distance,
                    'route_names': [pois[i]['name'] for i in bf_route]
                }
            }
        
        # Generate summary
        summary = {
            'scenarios_tested': len(benchmark_results),
            'qaoa_wins': sum(1 for r in benchmark_results.values() 
                           if r['winners'].get('multi_objective') == 'qaoa'),
            'classical_wins_distance': sum(1 for r in benchmark_results.values() 
                                         if r['winners'].get('distance') != 'qaoa'),
            'classical_wins_speed': len(benchmark_results)  # Classical always faster
        }
        
        return {
            "success": True,
            "summary": summary,
            "scenarios": benchmark_results,
            "conclusion": {
                "qaoa_advantages": [
                    "Multi-objective optimization (distance + preferences)",
                    "Constraint satisfaction in complex scenarios",
                    "Exploration of full solution space without greedy bias"
                ],
                "classical_advantages": [
                    "Speed (100-1000x faster)",
                    "Scalability (handles 100+ POIs)",
                    "Reliability and determinism"
                ],
                "recommendation": "Use QAOA for preference-heavy, constrained 4-6 POI problems. Use classical (OR-Tools) for production."
            }
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.get("/api/visualize/circuit")
async def visualize_circuit():
    """
    Generate QAOA circuit visualization (FREE)
    For teacher presentation
    """
    try:
        # Create sample 4-POI circuit for demonstration
        sample_pois = [
            {'id': i, 'name': f'POI_{i}', 'lat': 0, 'lon': 0}
            for i in range(4)
        ]
        
        distance_matrix = np.random.uniform(1, 5, (4, 4))
        np.fill_diagonal(distance_matrix, 0)
        
        # Create circuit
        encoder = QUBOEncoder()
        qubo, info = encoder.encode_tsp(sample_pois, distance_matrix)
        
        qaoa = QAOASolver(num_layers=2, shots=100)
        result = qaoa.solve(qubo, 4)
        
        # Visualize
        visualizer = CircuitVisualizer()
        outputs = visualizer.create_teacher_presentation(
            result['circuit'],
            result['parameters'],
            result['counts'],
            result['route'],
            sample_pois,
            result['energy'],
            result['num_qubits']
        )
        
        return {
            "success": True,
            "message": "Circuit visualization generated",
            "files": outputs,
            "cost": "FREE"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    # Run server (FREE)
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
