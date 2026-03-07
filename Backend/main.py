# main.py
import datetime

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import os

from pymongo import MongoClient
from bson import ObjectId
import ollama
from dotenv import load_dotenv

from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from typing import Optional, Annotated, List

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="Tech Oracle AI Assistant",
    description="An AI powered technical assistant for device repair, with MongoDB storage.",
    version="0.1.0",
)

# --- CORS Configuration ---
origins = [
    "http://localhost:3000",  # Your React frontend's development URL
    "http://127.0.0.1:3000",
    "http://localhost:3001",  # Alternative port
    "http://127.0.0.1:3001",
    # Add your production frontend URL(s) here when you deploy
    # "https://your-frontend-domain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- End CORS Configuration ---

# --- MongoDB Connection Setup ---
MONGO_DB_URL = os.getenv("MONGO_DB_URL", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "tech-oracle")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "repair_records")

client = MongoClient(MONGO_DB_URL)
db = client[DB_NAME]
repair_records_collection = db[COLLECTION_NAME]

print(f"Connected to MongoDB: {MONGO_DB_URL}, Database: {DB_NAME}, Collection: {COLLECTION_NAME}")
# --- END Of Database setup ---

# Custom type for ObjectId to string conversion for Pydantic
PyObjectId = Annotated[str, BeforeValidator(str)]

class DeviceRepairRequest(BaseModel):
    """
    Model for the initial device repair request from the frontend.
    This is what gets saved first.
    """
    deviceBrand: str
    deviceModel: str
    deviceModelNumber: Optional[str] = None
    deviceIssue: str
    additionalInfo: Optional[str] = None
    operatingSystem: Optional[str] = None
    ram: Optional[str] = None
    storage: Optional[str] = None
    processor: Optional[str] = None
    graphicsCard: Optional[str] = None
    serialNumber: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "deviceBrand": "Dell",
                "deviceModel": "XPS 15",
                "deviceIssue": "Screen flickering",
                "additionalInfo": "Happens randomly."
            }
        }
    )

class RepairRecordInDB(DeviceRepairRequest):
    """
    Model for data stored in MongoDB.
    repair_guide is now Optional as it's added later.
    """
    id: Optional[PyObjectId] = Field(alias="_id", default=None) # MongoDB _id
    repair_guide: Optional[str] = Field(None, description="The AI Generated Repair Guide") # Made Optional
    timestamp: Optional[str] = None # When the record was initially created
    guide_generated_at: Optional[str] = None # When the guide was generated

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "id": "60a1b2c3d4e5f6a7b8c9d0e1",
                "deviceBrand": "Dell",
                "deviceModel": "XPS 15",
                "deviceIssue": "Screen flickering",
                "repair_guide": "1. Check display cable... 2. Update drivers...",
                "timestamp": "2025-08-04T11:00:00.000Z",
                "guide_generated_at": "2025-08-04T11:05:00.000Z",
                "additionalInfo": "Happens randomly."
            }
        }
    )
    
class RepairGuide(BaseModel): # Model for the AI generated repair guide
    complexity:str
    tools: list[str]
    repair_steps: list[str]
    testing_steps: list[str]
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "complexity": "7/10",
                "tools": ["Phillips screwdriver", "Anti-static wrist strap"],
                "repair_steps": ["Power down the device", "Remove the back panel"],
                "testing_steps": ["Power on the device", "Run diagnostics"]
            }
        }
    )
# --- End Pydantic Models ---


# --- API Endpoints ---

@app.get("/")
async def read_root():
    """
    A simple root endpoint to verify the API is running.
    """
    return {"message": "Welcome to Tech Oracle Repair Assistant API!"}

@app.get("/generate", response_model=dict, summary="Generate a general AI response")
async def generate_response(prompt: str):
    """
    Generates a general AI response based on a given prompt.
    """
    try:
        response = ollama.chat(model="llama3", messages=[{"role": "user", "content": prompt}])
        return {"response": response['message']['content']}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate response from AI: {str(e)}")


@app.post("/add_repairs", response_model=RepairRecordInDB, status_code=status.HTTP_201_CREATED, summary="Add a new device repair request to the database")
async def add_to_db(request_data: DeviceRepairRequest): # Accepts only DeviceRepairRequest
    """
    Saves a new device repair request to MongoDB.
    The AI repair guide will be generated and added in a separate step.
    """
    # Convert Pydantic model to a dictionary suitable for MongoDB
    record_data_dict = request_data.model_dump() # No by_alias needed here for _id

    record_data_dict["timestamp"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    record_data_dict["repair_guide"] = None # Explicitly set to None initially
    record_data_dict["guide_generated_at"] = None # No guide generated yet

    try:
        result = repair_records_collection.insert_one(record_data_dict)
        # Update the dictionary with the MongoDB-generated _id
        record_data_dict["_id"] = result.inserted_id
        # Return the saved record, converted back to the Pydantic model for validation/response
        return RepairRecordInDB(**record_data_dict)
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save repair record to database: {str(e)}")

def create_structured_prompt(device_info: RepairRecordInDB) -> str:
    """
    Creates a structured prompt that will generate consistently formatted responses
    """
    prompt_template = """
Create a detailed, step-by-step repair guide for the device issue described below. Please adhere strictly to the following formatting rules to ensure a structured and easily parsable response:

1.  **Delimiters:** Use the specified start and end delimiters for each section of the guide. This is crucial for automated parsing.
2.  **Lists:** Format lists of items (e.g., tools, repair steps, testing steps) as comma-separated values, with each item on a new line.
3.  **Complexity:** Express the complexity of the repair on a scale of 1 to 10, where 1 indicates a very easy repair and 10 indicates an extremely complex repair.

Your response MUST include the following sections, each enclosed within its designated delimiters:

*   **Complexity Level:** `[COMPLEXITY_START] <complexity_value> [COMPLEXITY_END]`
*   **Required Tools and Components:** `[TOOLS_START] <tool_1>,\n<tool_2>,\n... [TOOLS_END]`
*   **Step-by-Step Guide to Fixing the Issue:** `[STEPS_START] <step_1>,\n<step_2>,\n... [STEPS_END]`
*   **Step-by-Step Guide to Testing:** `[TESTING_START] <test_1>,\n<test_2>,\n... [TESTING_END]`

Please ensure that each section is clearly defined and follows the specified format. The response should be comprehensive, covering all aspects of the repair process for the device described below:

Device Information:
- Brand: {brand}
- Model: {model}
- Issue: {issue}
{additional_info}
{specs}
"""
    
    # Build additional info section
    additional_info = ""
    if device_info.additionalInfo:
        additional_info = f"- Additional Details: {device_info.additionalInfo}\n"
    
    # Build specs section
    specs_list = []
    if device_info.operatingSystem:
        specs_list.append(f"- OS: {device_info.operatingSystem}")
    if device_info.ram:
        specs_list.append(f"- RAM: {device_info.ram}")
    if device_info.storage:
        specs_list.append(f"- Storage: {device_info.storage}")
    if device_info.processor:
        specs_list.append(f"- CPU: {device_info.processor}")
    if device_info.graphicsCard:
        specs_list.append(f"- GPU: {device_info.graphicsCard}")
    
    specs = "\n".join(specs_list) if specs_list else ""

    return prompt_template.format(
        complexity="[COMPLEXITY_CONTENT]",  # Placeholder
        tools="[TOOLS_CONTENT]",  # Placeholder
        steps="[STEPS_CONTENT]",  # Placeholder
        testing="[TESTING_CONTENT]",  # Placeholder
        brand=device_info.deviceBrand,
        model=device_info.deviceModel,
        issue=device_info.deviceIssue,
        additional_info=additional_info,
        specs=specs,
    )
@app.post("/generate_guide_for_record/{record_id}", response_model=RepairRecordInDB, summary="Generate and save an AI repair guide for an existing record")
async def generate_guide_for_record(record_id: str):
    if not ObjectId.is_valid(record_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid record ID format")

    try:
        # Fetch existing record
        existing_record_dict = repair_records_collection.find_one({"_id": ObjectId(record_id)})
        if not existing_record_dict:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                              detail=f"Record with ID {record_id} not found")

        existing_record = RepairRecordInDB(**existing_record_dict)
        
        # Generate structured prompt
        prompt = create_structured_prompt(existing_record)
        
        # Get AI response
        response = ollama.chat(model="llama3", messages=[
            {"role": "user", "content": prompt}
        ])
        generated_guide = response['message']['content']
        
        # Store the formatted guide
        update_data = {
            "repair_guide": generated_guide,
            "guide_generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }
        
        # Update database
        result = repair_records_collection.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": update_data}
        )

        if result.modified_count == 0 and result.matched_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                              detail=f"Record with ID {record_id} not found for update")

        # Return updated record
        updated_record = repair_records_collection.find_one({"_id": ObjectId(record_id)})
        return RepairRecordInDB(**updated_record)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating guide: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                          detail=f"Failed to generate repair guide: {str(e)}")


@app.get("/api/repair_records", response_model=List[RepairRecordInDB], summary="Retrieve all saved repair records")
async def get_all_repair_records():
    """
    Retrieves all previously saved device repair requests and their generated guides from MongoDB.
    """
    records = []
    try:
        for record in repair_records_collection.find().sort("timestamp", -1):
            records.append(RepairRecordInDB(**record))
        return records
    except Exception as e:
        print(f"Error fetching records from MongoDB: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve repair records: {str(e)}")


@app.get("/api/repair_records/{record_id}", response_model=RepairRecordInDB, summary="Retrieve a single repair record by ID")
async def get_repair_record(record_id: str):
    """
    Retrieves a single repair record by its unique ID from MongoDB.
    """
    if not ObjectId.is_valid(record_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid record ID format")
    try:
        record = repair_records_collection.find_one({"_id": ObjectId(record_id)})
        if record:
            return RepairRecordInDB(**record)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Record with ID {record_id} not found")
    except Exception as e:
        print(f"Error fetching record {record_id} from MongoDB: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve repair record: {str(e)}")