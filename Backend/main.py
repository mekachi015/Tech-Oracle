# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Import CORS middleware
import os
import ollama
from dotenv import load_dotenv

from pydantic import BaseModel, Field

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
    #"http://localhost:8000"
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

class DeviceRepairRequest(BaseModel):
    deviceBrand: str
    deviceModel: str
    deviceModelNumber: str = None
    deviceIssue: str
    additionalInfo: str = None
    operatingSystem: str = None
    ram: str = None
    storage: str = None
    processor: str = None
    graphicsCard: str = None
    modelNumber: str = None
    serialNumber: str = None

@app.get("/")
async def read_root():
    """
    A simple root endpoint to verify the API is running.
    """
    return {"message": "Welcome to Tech Oracle Repair Assistant API!"}

@app.get("/generate")
def generate_response(prompt: str):
        response =ollama.chat(model="llama3", messages=[{"role": "user", "content": prompt}])
        return {"response": response['message']['content']}

@app.post("/generate_repair_guide")
def generate_repair_guide(request_data: DeviceRepairRequest):
    prompts_parts = []
    prompts_parts.append("Gauge the complexity of fixing the issue on a scale of one to ten.")
    prompts_parts.append("Generate a list of tools and components that would be required to repair.")
    prompts_parts.append("Generate a detailed step-by-step guide on how to fix this issue with the tools and components.")
    prompts_parts.append("Generate a detailed step-by-step guide on how to test that the issue is resolved.")
    prompts_parts.append("The details of the device are as follows:")
    prompts_parts.append(f"Device Brand: {request_data.deviceBrand}")
    prompts_parts.append(f"Device Model: {request_data.deviceModel}")
    prompts_parts.append(f"Model Number: {request_data.deviceModelNumber}")
    prompts_parts.append(f"With the following issue: {request_data.deviceIssue}")
    prompts_parts.append(f"And this additional information: {request_data.additionalInfo}")

    if request_data.operatingSystem:
        prompts_parts.append(f"It runs on {request_data.operatingSystem}.")
    if request_data.ram:
        prompts_parts.append(f"It has {request_data.ram} RAM.")
    if request_data.storage:
        prompts_parts.append(f"It has {request_data.storage} storage.")
    if request_data.processor:
        prompts_parts.append(f"The processor is {request_data.processor}.")
    if request_data.graphicsCard:
        prompts_parts.append(f"The graphics card is {request_data.graphicsCard}.")
    if request_data.modelNumber:
        prompts_parts.append(f"The model number is {request_data.modelNumber}.")
    if request_data.serialNumber:
        prompts_parts.append(f"The serial number is {request_data.serialNumber}.")

    full_prompt = "\n".join(prompts_parts)
    print(f"Generated Prompt:\n---\n{full_prompt}\n---")

    try:
        response = ollama.chat(model="llama3", messages=[{"role": "user", "content": full_prompt}])
        ai_response_content = response['message']['content']
        return {"repair_guide": ai_response_content}
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        return {"error": f"Failed to generate response from AI: {str(e)}"}, 500



# You'll add more endpoints here later for:
# - /submit-issue (POST): To receive user info, device details, issue, and files.
# - /repair-cases (GET): To list all repair cases for the technician.
# - /repair-cases/{id} (GET, PUT): To view/update a specific repair case.
# - File upload endpoints (if handled separately from submission)