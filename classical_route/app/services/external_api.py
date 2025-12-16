import httpx
from typing import List, Optional
from app.models.schemas import Place, PlacesResponse
from app.config import settings


class ExternalAPIClient:
    """Client for interacting with external backend API"""
    
    def __init__(self):
        self.base_url = settings.external_api_base_url.rstrip('/')
        self.timeout = settings.external_api_timeout
    
    async def fetch_places_by_day(self, trip_id: int, day: int, bearer_token: str) -> PlacesResponse:
        """
        Fetch places for a specific trip day from external API.
        
        Args:
            trip_id: Trip ID
            day: Day number of the trip
            bearer_token: Bearer token for authentication
        
        Returns:
            PlacesResponse with list of places
        
        Raises:
            httpx.HTTPError: If the API request fails
            ValueError: If the response format is invalid
        """
        url = f"{self.base_url}/api/trips/{trip_id}/days/{day}"
        
        headers = {
            "Authorization": f"Bearer {bearer_token}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                
                data = response.json()
                
                # Parse response and convert to Place objects
                places = self._parse_places(data)
                
                return PlacesResponse(
                    day=day,
                    places=places,
                    total_count=len(places)
                )
                
            except httpx.HTTPStatusError as e:
                raise httpx.HTTPError(
                    f"Failed to fetch places from external API: {e.response.status_code} - {e.response.text}"
                )
            except httpx.RequestError as e:
                raise httpx.HTTPError(f"Network error while fetching places: {str(e)}")
            except (KeyError, ValueError) as e:
                raise ValueError(f"Invalid response format from external API: {str(e)}")
    
    def _parse_places(self, data: dict) -> List[Place]:
        """
        Parse places data from external API response.
        
        Expected format:
        {
            "success": true,
            "message": "...",
            "data": {
                "places": [...],
                "places_count": 5
            }
        }
        
        Args:
            data: Response data from external API
        
        Returns:
            List of Place objects
        """
        # Extract places array from response
        if "data" in data and isinstance(data["data"], dict) and "places" in data["data"]:
            places_data = data["data"]["places"]
        elif "places" in data:
            places_data = data["places"]
        elif isinstance(data, list):
            places_data = data
        else:
            raise ValueError("Unable to find places array in API response")
        
        # Convert to Place objects
        places = []
        for place_data in places_data:
            try:
                # Extract place_id and convert to string
                place_id = place_data.get("place_id") or place_data.get("id") or place_data.get("_id")
                
                # Extract coordinates (handle string or float)
                latitude = place_data.get("latitude") or place_data.get("lat")
                longitude = place_data.get("longitude") or place_data.get("lon") or place_data.get("lng")
                
                place = Place(
                    id=str(place_id),
                    name=place_data.get("name", "Unknown Place"),
                    latitude=float(latitude),
                    longitude=float(longitude),
                    address=place_data.get("address"),
                    description=place_data.get("description")
                )
                places.append(place)
            except (KeyError, TypeError, ValueError) as e:
                # Skip invalid places but log the error
                print(f"Warning: Skipping invalid place data: {place_data}. Error: {e}")
                continue
        
        if not places:
            raise ValueError("No valid places found in API response")
        
        return places


# Create singleton instance
external_api_client = ExternalAPIClient()
