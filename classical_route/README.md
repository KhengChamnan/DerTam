# Route Optimization API

FastAPI-based route optimization service that fetches places from an external API and optimizes travel routes using ML-based Traveling Salesman Problem (TSP) solver.

## Features

- 🚀 **FastAPI Backend** - Modern, fast, async Python web framework
- 🧠 **ML-Based TSP** - Simulated Annealing algorithm for route optimization
- 📍 **Distance Calculation** - Haversine formula for accurate lat/long distances
- 🔌 **External API Integration** - Fetches place data from your backend
- 📊 **Optimized Routes** - Returns ordered waypoints with distances

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file from the example:
```bash
cp .env.example .env
```

5. Configure your external API URL in `.env`:
```env
EXTERNAL_API_BASE_URL=http://your-backend-api.com
EXTERNAL_API_TIMEOUT=30
HOST=0.0.0.0
PORT=8000
```

## Running the Application

Start the development server:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### 1. Get Places for a Day
```http
GET /api/trips/{day}/places
```

Fetches all places for a specific trip day from your external backend API.

**Example:**
```bash
curl http://localhost:8000/api/trips/1/places
```

**Response:**
```json
{
  "day": 1,
  "places": [
    {
      "id": "1",
      "name": "Eiffel Tower",
      "latitude": 48.8584,
      "longitude": 2.2945,
      "address": "Champ de Mars, Paris",
      "description": "Iconic iron tower"
    }
  ],
  "total_count": 5
}
```

### 2. Optimize Route for a Day
```http
POST /api/trips/{day}/optimize
```

Fetches places and returns an optimized route using Simulated Annealing TSP algorithm.

**Example:**
```bash
curl -X POST http://localhost:8000/api/trips/1/optimize
```

**Response:**
```json
{
  "day": 1,
  "total_places": 5,
  "total_distance": 12.45,
  "route": [
    {
      "place": {
        "id": "1",
        "name": "Eiffel Tower",
        "latitude": 48.8584,
        "longitude": 2.2945
      },
      "order": 0,
      "distance_to_next": 2.3
    },
    {
      "place": {
        "id": "3",
        "name": "Louvre Museum",
        "latitude": 48.8606,
        "longitude": 2.3376
      },
      "order": 1,
      "distance_to_next": 3.8
    }
  ],
  "algorithm": "Simulated Annealing TSP"
}
```

### 3. Health Check
```http
GET /health
```

Check if the service is running.

## External API Requirements

Your external backend API should provide an endpoint that returns places for a specific day. The expected endpoint format is:

```
GET {EXTERNAL_API_BASE_URL}/api/trips/day/{day}/places
```

The response should include place data with at least:
- `id` - Unique identifier
- `name` - Place name
- `latitude` or `lat` - Latitude coordinate
- `longitude`, `lon`, or `lng` - Longitude coordinate

Example external API response formats supported:

**Format 1:**
```json
{
  "places": [
    {"id": "1", "name": "Place 1", "latitude": 48.8584, "longitude": 2.2945}
  ]
}
```

**Format 2:**
```json
{
  "data": {
    "places": [
      {"id": "1", "name": "Place 1", "lat": 48.8584, "lng": 2.2945}
    ]
  }
}
```

**Format 3 (Direct array):**
```json
[
  {"id": "1", "name": "Place 1", "latitude": 48.8584, "longitude": 2.2945}
]
```

## Algorithm Details

The route optimization uses the **Simulated Annealing** algorithm from the `python-tsp` library:

- **Algorithm Type**: Metaheuristic optimization (ML-based)
- **Distance Calculation**: Haversine formula (great-circle distance)
- **Optimization Goal**: Minimize total travel distance
- **Performance**: Optimized for 10-20 places per route
- **Accuracy**: ~95% of optimal solution

## Project Structure

```
classical_route/
├── app/
│   ├── models/
│   │   └── schemas.py          # Pydantic models
│   ├── routes/
│   │   └── trips.py            # API endpoints
│   ├── services/
│   │   ├── external_api.py     # External API client
│   │   └── optimizer.py        # Route optimization service
│   ├── utils/
│   │   └── distance.py         # Distance calculations
│   └── config.py               # Configuration
├── main.py                     # Application entry point
├── requirements.txt            # Python dependencies
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## Development

### Testing the API

You can test the endpoints using the interactive documentation at http://localhost:8000/docs or with curl:

```bash
# Get places for day 1
curl http://localhost:8000/api/trips/1/places

# Optimize route for day 1
curl -X POST http://localhost:8000/api/trips/1/optimize

# Health check
curl http://localhost:8000/health
```

### Modifying the External API Response Parser

If your external API returns a different response format, modify the `_parse_places` method in [app/services/external_api.py](app/services/external_api.py).

## Dependencies

- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **python-tsp** - TSP optimization algorithms
- **numpy** - Numerical computations
- **httpx** - Async HTTP client
- **pydantic** - Data validation
- **pydantic-settings** - Settings management

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
