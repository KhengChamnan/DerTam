from pydantic import BaseModel, Field
from typing import List, Optional


class Place(BaseModel):
    """Model representing a place with coordinates"""
    id: str = Field(..., description="Unique identifier for the place")
    name: str = Field(..., description="Name of the place")
    latitude: float = Field(..., description="Latitude coordinate", ge=-90, le=90)
    longitude: float = Field(..., description="Longitude coordinate", ge=-180, le=180)
    address: Optional[str] = Field(None, description="Address of the place")
    description: Optional[str] = Field(None, description="Description of the place")


class RouteSegment(BaseModel):
    """Model representing a segment in the optimized route"""
    place: Place
    order: int = Field(..., description="Position in the optimized route (0-indexed)")
    distance_to_next: Optional[float] = Field(None, description="Distance to next place in km")


class OptimizedRouteResponse(BaseModel):
    """Response model for optimized route"""
    day: int = Field(..., description="Day number of the trip")
    total_places: int = Field(..., description="Total number of places in the route")
    total_distance: float = Field(..., description="Total distance of the route in kilometers")
    route: List[RouteSegment] = Field(..., description="Ordered list of places in optimized route")
    algorithm: str = Field(default="Simulated Annealing TSP", description="Algorithm used for optimization")


class PlacesResponse(BaseModel):
    """Response model for list of places"""
    day: int = Field(..., description="Day number of the trip")
    places: List[Place] = Field(..., description="List of places for the day")
    total_count: int = Field(..., description="Total number of places")


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
