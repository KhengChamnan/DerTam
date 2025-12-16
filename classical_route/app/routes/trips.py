from fastapi import APIRouter, HTTPException, Path, Header
from typing import Annotated
import httpx
import logging

from app.models.schemas import PlacesResponse, OptimizedRouteResponse, ErrorResponse, OptimizeRouteRequest
from app.services.external_api import external_api_client
from app.services.optimizer import route_optimizer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/trips", tags=["trips"])


@router.get(
    "/{trip_id}/days/{day}/places",
    response_model=PlacesResponse,
    summary="Get places for a trip day",
    description="Fetches all places for a specific trip day from the external backend API"
)
async def get_trip_day_places(
    trip_id: Annotated[int, Path(description="Trip ID", ge=1)],
    day: Annotated[int, Path(description="Day number of the trip", ge=1)],
    authorization: Annotated[str, Header(description="Bearer token")]
) -> PlacesResponse:
    """
    Retrieve all places for a specific trip day.
    
    Args:
        trip_id: Trip ID
        day: Day number (must be >= 1)
        authorization: Bearer token from header
    
    Returns:
        PlacesResponse with list of places for the day
    
    Raises:
        HTTPException: If external API fails or returns invalid data
    """
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        
        places_response = await external_api_client.fetch_places_by_day(trip_id, day, token)
        return places_response
        
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch places from external API: {str(e)}"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid data from external API: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.post(
    "/{trip_id}/days/{day}/optimize",
    response_model=OptimizedRouteResponse,
    summary="Optimize route for a trip day",
    description="Fetches places for a specific trip day and returns an optimized route using ML-based TSP algorithm"
)
async def optimize_trip_day_route(
    trip_id: Annotated[int, Path(description="Trip ID", ge=1)],
    day: Annotated[int, Path(description="Day number of the trip", ge=1)],
    authorization: Annotated[str, Header(description="Bearer token")],
    request_body: OptimizeRouteRequest
) -> OptimizedRouteResponse:
    """
    Optimize the route for all places in a specific trip day.
    
    This endpoint:
    1. Accepts user's current location as starting point
    2. Fetches places for the specified trip day from external API with bearer token
    3. Calculates distances from starting point and between all places using Haversine formula
    4. Applies Simulated Annealing TSP algorithm to find optimal route
    5. Returns ordered list of places with distances starting from user's location
    
    Args:
        trip_id: Trip ID
        day: Day number (must be >= 1)
        authorization: Bearer token from header
        request_body: Starting location (user's current lat/long)
    
    Returns:
        OptimizedRouteResponse with optimized route and total distance
    
    Raises:
        HTTPException: If external API fails, no places found, or optimization fails
    """
    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        
        # Step 1: Fetch places from external API
        places_response = await external_api_client.fetch_places_by_day(trip_id, day, token)
        
        if not places_response.places:
            raise HTTPException(
                status_code=404,
                detail=f"No places found for trip {trip_id}, day {day}"
            )
        
        # Step 2: Optimize route using ML-based TSP with starting location
        optimized_route = route_optimizer.optimize_route(
            places=places_response.places,
            day=day,
            start_lat=request_body.starting_location.latitude,
            start_lon=request_body.starting_location.longitude
        )
        
        return optimized_route
        
    except HTTPException:
        # Re-raise HTTPExceptions
        raise
        
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch places from external API: {str(e)}"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=f"Optimization error: {str(e)}"
        )
    except Exception as e:
        logger.exception("Unhandled error during route optimization")
        message = str(e) or repr(e)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during optimization: {type(e).__name__}: {message}"
        )


@router.get(
    "/health",
    summary="Health check",
    description="Check if the route optimization service is running"
)
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Route Optimization API",
        "algorithm": route_optimizer.algorithm_name
    }
