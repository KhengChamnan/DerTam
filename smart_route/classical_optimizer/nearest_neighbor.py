# classical_optimizer/nearest_neighbor.py

class NearestNeighborSolver:
    def __init__(self):
        pass

    def solve(self, pois, distance_matrix, start_poi_idx=0):
        # Dummy implementation: returns POIs in order
        route = list(range(len(pois)))
        total_distance = 0.0
        for i in range(len(route) - 1):
            total_distance += distance_matrix[route[i]][route[i+1]]
        return route, total_distance
