# main.py
import datetime
from datetime import timedelta

from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

from pymongo import MongoClient
from bson import ObjectId
import ollama
from dotenv import load_dotenv

from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from typing import Optional, Annotated, List

import jwt
import bcrypt

# Load environment variables from .env file
load_dotenv()

# --- JWT Configuration ---
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours

security = HTTPBearer()

# Technician password from environment
TECHNICIAN_PASSWORD_HASH = os.getenv("TECHNICIAN_PASSWORD_HASH")
if not TECHNICIAN_PASSWORD_HASH:
    # Generate a hash for the default password (only for development)
    default_password = os.getenv("TECHNICIAN_PASSWORD", "techAdmin123")
    TECHNICIAN_PASSWORD_HASH = bcrypt.hashpw(default_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    print(f"⚠️  WARNING: Using default password. Set TECHNICIAN_PASSWORD_HASH in .env for production!")

# --- End JWT Configuration ---

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

# --- Authentication Models ---
class LoginRequest(BaseModel):
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# --- Authentication Helper Functions ---
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to verify JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username != "technician":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# --- End Authentication ---

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

@app.post("/api/auth/login", response_model=TokenResponse, summary="Technician login")
async def login(credentials: LoginRequest):
    """
    Authenticate technician and return JWT access token.
    """
    if not verify_password(credentials.password, TECHNICIAN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": "technician"},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return TokenResponse(access_token=access_token)

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
You are a technical repair guide generator. Create a detailed repair guide using EXACTLY this format with these EXACT delimiters.

CRITICAL FORMATTING RULES:
1. Use EXACTLY these delimiters (including the asterisks): **COMPLEXITY_START**, **COMPLEXITY_END**, etc.
2. Do NOT add any text before the first delimiter or after the last delimiter
3. Put each item on a new line within sections
4. Complexity must be a single number from 1-10

You MUST respond in EXACTLY this format:

**COMPLEXITY_START**
7
**COMPLEXITY_END**

**TOOLS_START**
Phillips screwdriver #0
Plastic spudger
Anti-static wrist strap
Replacement display cable
**TOOLS_END**

**STEPS_START**
Power off the device completely and disconnect all cables
Remove the bottom panel using the Phillips screwdriver
Disconnect the battery connector to prevent electrical damage
Locate and carefully disconnect the display cable
Reconnect the display cable firmly ensuring proper seating
Reconnect the battery and test the display
Reassemble the device if display works correctly
**STEPS_END**

**TESTING_START**
Power on the device and check for display output
Test display at different brightness levels
Open and close the lid multiple times to verify cable connection
Run a display diagnostic test if available
**TESTING_END**

Now create a repair guide for this device following the EXACT format above:

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
async def generate_guide_for_record(record_id: str, token_payload: dict = Depends(verify_token)):
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
        
        # Clean up the guide to ensure consistent formatting
        # Remove any text before first delimiter and after last delimiter
        import re
        
        # Find the first delimiter and last delimiter
        first_delimiter = generated_guide.find('**COMPLEXITY_START**')
        last_delimiter = generated_guide.rfind('**TESTING_END**')
        
        if first_delimiter != -1 and last_delimiter != -1:
            # Extract only the content between first and last delimiter (inclusive)
            generated_guide = generated_guide[first_delimiter:last_delimiter + len('**TESTING_END**')].strip()
        
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
async def get_all_repair_records(token_payload: dict = Depends(verify_token)):
    """
    Retrieves all previously saved device repair requests and their generated guides from MongoDB.
    Requires authentication.
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
async def get_repair_record(record_id: str, token_payload: dict = Depends(verify_token)):
    """
    Retrieves a single repair record by its unique ID from MongoDB.
    Requires authentication.
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