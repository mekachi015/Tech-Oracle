# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Import CORS middleware
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="Tech Oracle AI Assistant",
    description="An AI powered technical assistant for device repair.",
    version="0.1.0",
)

# --- CORS Configuration ---
# This is crucial for your React frontend to communicate with your Python backend
# when they are running on different ports/origins (e.g., React on 3000, FastAPI on 8000)
origins = [
    "http://localhost:3000",  # Your React frontend's development URL
    "http://127.0.0.1:3000",
    # Add your production frontend URL(s) here when you deploy
    # "https://your-frontend-domain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)
# --- End CORS Configuration ---


@app.get("/")
async def read_root():
    """
    A simple root endpoint to verify the API is running.
    """
    return {"message": "Welcome to Tech Oracle Repair Assistant API!"}

@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok", "service": "Tech Oracle Repair Assistant Backend"}

# You'll add more endpoints here later for:
# - /submit-issue (POST): To receive user info, device details, issue, and files.
# - /repair-cases (GET): To list all repair cases for the technician.
# - /repair-cases/{id} (GET, PUT): To view/update a specific repair case.
# - File upload endpoints (if handled separately from submission)