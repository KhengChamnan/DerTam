from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.trips import router as trips_router
from app.config import settings


# Create FastAPI application
app = FastAPI(
    title="Route Optimization API",
    description="ML-based route optimization service using Simulated Annealing TSP algorithm",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this in production to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(trips_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Route Optimization API",
        "version": "1.0.0",
        "docs": "/docs",
        "algorithm": "Simulated Annealing TSP"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "external_api": settings.external_api_base_url
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
