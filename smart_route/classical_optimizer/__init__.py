"""Classical optimizer module - 100% FREE algorithms"""

from classical_optimizer.feature_engineer import FeatureEngineer
from classical_optimizer.tsp_solver import (
    TSPNearestNeighborSolver,
    TSPTwoOptSolver,
    TSPSimulatedAnnealingSolver,
    ClassicalOptimizer
)

__version__ = "1.0.0"
__all__ = [
    'FeatureEngineer',
    'TSPNearestNeighborSolver',
    'TSPTwoOptSolver',
    'TSPSimulatedAnnealingSolver',
    'ClassicalOptimizer'
]
