"""
SatyaDrishti FastAPI Server
Main entrypoint for the Python backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from api.routes.database_api import router as database_router
from api.routes.extraction_api import router as extraction_router

app = FastAPI(
    title="SatyaDrishti Regulatory Intelligence API",
    description="Backend API for Legal Metrology, OCR Verification, and Consumer Protection Enforcement",
    version="1.0.0",
)

# Enable CORS for frontend Vite dev server (default http://localhost:3000 / 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(database_router)
app.include_router(extraction_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SatyaDrishti Regulatory Backend",
        "database": "PostgreSQL / SQLite Storage Engine Active",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
