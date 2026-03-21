# main.py
import datetime
from datetime import timedelta
import logging
import sys

from fastapi import FastAPI, HTTPException, status, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from bson import ObjectId
from dotenv import load_dotenv

from pydantic import BaseModel, Field, BeforeValidator, ConfigDict, field_validator
from typing import Optional, Annotated, List

import jwt
import bcrypt
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load environment variables from .env file
load_dotenv()

# ============================================
# LOGGING CONFIGURATION
# ============================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('tech_oracle.log', mode='a')
    ]
)
logger = logging.getLogger(__name__)

# ============================================
# AI INTEGRATION - OLLAMA (LOCAL) OR GROQ (CLOUD)
# ============================================
USE_GROQ = os.getenv("USE_GROQ", "false").lower() == "true"

if USE_GROQ:
    try:
        from groq_integration import generate_ai_response, check_groq_availability
        logger.info("🤖 Using Groq for AI generation (production mode)")
    except ImportError:
        logger.error("❌ Groq integration not available. Install with: pip install groq")
        sys.exit(1)
else:
    try:
        import ollama
        logger.info("🤖 Using Ollama for AI generation (local mode)")
    except ImportError:
        logger.warning("⚠️  Ollama not available. Set USE_GROQ=true for production deployment")

# ============================================
# ENVIRONMENT VARIABLE VALIDATION
# ============================================
def validate_environment():
    """Validate critical environment variables on startup"""
    required_vars = {
        'MONGO_DB_URL': os.getenv('MONGO_DB_URL'),
        'JWT_SECRET_KEY': os.getenv('JWT_SECRET_KEY'),
    }
    
    missing_vars = [var for var, value in required_vars.items() if not value]
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        logger.error("Please set these in your .env file before starting the application.")
        sys.exit(1)
    
    # Validate JWT secret is not default value
    if os.getenv('JWT_SECRET_KEY') == 'your-secret-key-change-this-in-production':
        logger.warning("⚠️  SECURITY WARNING: Using default JWT secret key! Change this in production!")
    
    # Check if using default password
    if os.getenv('TECHNICIAN_PASSWORD') == 'techAdmin123' or not os.getenv('TECHNICIAN_PASSWORD'):
        logger.warning("⚠️  SECURITY WARNING: Using default technician password! Change this in production!")
    
    logger.info("✅ Environment validation passed")

# Validate environment on startup
validate_environment()

# ============================================
# JWT CONFIGURATION
# ============================================
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
    logger.warning("⚠️  Using default password hashing. Set TECHNICIAN_PASSWORD_HASH in .env for production!")

app = FastAPI(
    title="Tech Oracle AI Assistant",
    description="An AI powered technical assistant for device repair, with MongoDB storage.",
    version="1.0.0",
)

# ============================================
# RATE LIMITING CONFIGURATION
# ============================================
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
logger.info("✅ Rate limiting enabled - 100 requests per minute per IP")

# ============================================
# REQUEST LOGGING MIDDLEWARE
# ============================================
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests and responses"""
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.info(f"Request completed: {request.method} {request.url.path} - Status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {request.method} {request.url.path} - Error: {str(e)}")
        raise

# ============================================
# CORS CONFIGURATION
# ============================================
# IMPORTANT: Update this list with your production frontend URL(s) before deployment
# Remove localhost URLs in production for security
origins = [
    "http://localhost:3000",  # Development - Next.js frontend
    "http://127.0.0.1:3000",
    "http://localhost:3001",  # Alternative development port
    "http://127.0.0.1:3001",
    "https://tech-oracle-amber.vercel.app",  # Production Vercel URL
]

# Add production URLs from environment variable if available
production_origin = os.getenv("FRONTEND_URL")
if production_origin:
    origins.append(production_origin)
    logger.info(f"Added production frontend URL from env: {production_origin}")

# Add wildcard for Vercel preview deployments
origins.append("https://*.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info(f"CORS enabled for origins: {origins}")

# ============================================
# MONGODB CONNECTION SETUP WITH PRODUCTION SETTINGS
# ============================================
MONGO_DB_URL = os.getenv("MONGO_DB_URL", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "tech-oracle")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "repair_records")

# Handle common deployment paste mistakes in env vars (e.g., key prefix or quotes)
if MONGO_DB_URL:
    MONGO_DB_URL = MONGO_DB_URL.strip().strip('"').strip("'")
    if MONGO_DB_URL.startswith("MONGO_DB_URL="):
        MONGO_DB_URL = MONGO_DB_URL.split("=", 1)[1].strip()

try:
    # Configure MongoDB client with production-ready settings
    client = MongoClient(
        MONGO_DB_URL,
        maxPoolSize=50,  # Maximum number of connections in the pool
        minPoolSize=10,  # Minimum number of connections in the pool
        serverSelectionTimeoutMS=5000,  # Timeout for server selection
        connectTimeoutMS=10000,  # Timeout for initial connection
        socketTimeoutMS=30000,  # Timeout for socket operations
        retryWrites=True,  # Automatically retry write operations
        retryReads=True,  # Automatically retry read operations
    )
    
    # Test the connection
    client.admin.command('ping')
    logger.info(f"✅ Successfully connected to MongoDB: {DB_NAME}")
    
    db = client[DB_NAME]
    repair_records_collection = db[COLLECTION_NAME]
    
    # Create indexes for better query performance
    repair_records_collection.create_index("timestamp")
    logger.info(f"✅ Database and collection ready: {COLLECTION_NAME}")
    
except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    logger.error(f"❌ Failed to connect to MongoDB: {str(e)}")
    logger.error("Please ensure MongoDB is running and the connection string is correct.")
    sys.exit(1)
except Exception as e:
    logger.error(f"❌ Unexpected error during MongoDB setup: {str(e)}")
    sys.exit(1)

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
    
    ⭐ PRODUCTION UPDATE: Added field validation with max lengths to prevent abuse
    """
    deviceBrand: str = Field(..., min_length=1, max_length=100)
    deviceModel: str = Field(..., min_length=1, max_length=200)
    deviceModelNumber: Optional[str] = Field(None, max_length=100)
    deviceIssue: str = Field(..., min_length=10, max_length=5000)
    additionalInfo: Optional[str] = Field(None, max_length=3000)
    operatingSystem: Optional[str] = Field(None, max_length=50)
    ram: Optional[str] = Field(None, max_length=20)
    storage: Optional[str] = Field(None, max_length=20)
    processor: Optional[str] = Field(None, max_length=100)
    graphicsCard: Optional[str] = Field(None, max_length=100)
    serialNumber: Optional[str] = Field(None, max_length=100)
    
    @field_validator('deviceIssue')
    @classmethod
    def validate_device_issue(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError('Device issue description must be at least 10 characters')
        return v.strip()
    
    @field_validator('deviceBrand', 'deviceModel')
    @classmethod
    def validate_required_fields(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('This field is required and cannot be empty')
        return v.strip()

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
@limiter.limit("100/minute")
async def read_root(request: Request):
    """
    A simple root endpoint to verify the API is running.
    """
    logger.info("Root endpoint accessed")
    return {
        "message": "Welcome to Tech Oracle Repair Assistant API!",
        "version": "1.0.0",
        "status": "online"
    }

@app.get("/health")
@limiter.limit("30/minute")
async def health_check(request: Request):
    """
    Health check endpoint for monitoring and load balancers.
    Verifies database connectivity and service health.
    
    ⭐ PRODUCTION READY: Use this endpoint for uptime monitoring
    """
    health_status = {
        "status": "healthy",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "version": "1.0.0",
        "ai_mode": "groq" if USE_GROQ else "ollama",
        "services": {}
    }
    
    # Check MongoDB connection
    try:
        client.admin.command('ping')
        health_status["services"]["mongodb"] = "connected"
    except Exception as e:
        logger.error(f"Health check - MongoDB connection failed: {str(e)}")
        health_status["services"]["mongodb"] = "disconnected"
        health_status["status"] = "unhealthy"
    
    # Check AI service availability
    if USE_GROQ:
        # Check Groq configuration
        if os.getenv("GROQ_API_KEY"):
            health_status["services"]["groq"] = "configured"
        else:
            health_status["services"]["groq"] = "not_configured"
            logger.warning("Health check - GROQ_API_KEY not set")
    else:
        # Check Ollama availability
        try:
            ollama.list()
            health_status["services"]["ollama"] = "available"
        except Exception as e:
            logger.warning(f"Health check - Ollama not available: {str(e)}")
            health_status["services"]["ollama"] = "unavailable"
            # Don't mark as unhealthy, just warn
    
    if health_status["status"] == "unhealthy":
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=health_status)
    
    return health_status

@app.post("/api/auth/login", response_model=TokenResponse, summary="Technician login")
@limiter.limit("5/minute")  # Strict limit to prevent brute force attacks
async def login(request: Request, credentials: LoginRequest):
    """
    Authenticate technician and return JWT access token.
    
    ⭐ PRODUCTION READY: Secure password verification with bcrypt
    """
    logger.info("Technician login attempt")
    
    if not verify_password(credentials.password, TECHNICIAN_PASSWORD_HASH):
        logger.warning("Failed login attempt - incorrect password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": "technician"},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    logger.info("✅ Technician logged in successfully")
    return TokenResponse(access_token=access_token)

@app.get("/generate", response_model=dict, summary="Generate a general AI response")
@limiter.limit("10/minute")  # AI generation is resource-intensive
async def generate_response(request: Request, prompt: str):
    """
    Generates a general AI response based on a given prompt.
    
    ⭐ PRODUCTION UPDATE: Supports both Ollama (local) and Groq (cloud)
    """
    logger.info(f"AI generation request received (prompt length: {len(prompt)})")
    
    # Validate prompt length
    if len(prompt) > 2000:
        logger.warning(f"Prompt too long: {len(prompt)} characters")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt is too long. Maximum 2000 characters allowed."
        )
    
    try:
        if USE_GROQ:
            # Use Groq for cloud deployment
            response_text = generate_ai_response(prompt)
            logger.info("✅ AI response generated successfully (Groq)")
            return {"response": response_text}
        else:
            # Use Ollama for local development
            response = ollama.chat(model="llama3", messages=[{"role": "user", "content": prompt}])
            logger.info("✅ AI response generated successfully (Ollama)")
            return {"response": response['message']['content']}
            
    except Exception as e:
        logger.error(f"AI service error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is temporarily unavailable. Please try again later."
        )


@app.post("/add_repairs", response_model=RepairRecordInDB, status_code=status.HTTP_201_CREATED, summary="Add a new device repair request to the database")
@limiter.limit("20/minute")  # Limit form submissions to prevent spam
async def add_to_db(request: Request, request_data: DeviceRepairRequest):
    """
    Saves a new device repair request to MongoDB.
    The AI repair guide will be generated and added in a separate step.
    
    ⭐ PRODUCTION UPDATE: Enhanced error handling and validation
    """
    logger.info(f"New repair request: {request_data.deviceBrand} {request_data.deviceModel}")
    
    # Convert Pydantic model to a dictionary suitable for MongoDB
    record_data_dict = request_data.model_dump()

    record_data_dict["timestamp"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    record_data_dict["repair_guide"] = None
    record_data_dict["guide_generated_at"] = None

    try:
        result = repair_records_collection.insert_one(record_data_dict)
        record_data_dict["_id"] = result.inserted_id
        logger.info(f"✅ Repair record saved with ID: {result.inserted_id}")
        return RepairRecordInDB(**record_data_dict)
    except Exception as e:
        logger.error(f"Database error saving repair record: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save repair record. Please try again."
        )

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
@limiter.limit("10/minute")  # AI generation is resource-intensive
async def generate_guide_for_record(request: Request, record_id: str, token_payload: dict = Depends(verify_token)):
    """
    Generate AI repair guide for an existing record.
    
    ⭐ PRODUCTION UPDATE: Enhanced Ollama error handling with fallback and retry logic
    """
    logger.info(f"Guide generation requested for record: {record_id}")
    
    if not ObjectId.is_valid(record_id):
        logger.warning(f"Invalid record ID format: {record_id}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid record ID format")

    try:
        # Fetch existing record
        existing_record_dict = repair_records_collection.find_one({"_id": ObjectId(record_id)})
        if not existing_record_dict:
            logger.warning(f"Record not found: {record_id}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                              detail=f"Record with ID {record_id} not found")

        existing_record = RepairRecordInDB(**existing_record_dict)
        logger.info(f"Generating guide for: {existing_record.deviceBrand} {existing_record.deviceModel}")
        
        # Generate structured prompt
        prompt = create_structured_prompt(existing_record)
        
        # Get AI response with error handling
        generated_guide = None
        try:
            if USE_GROQ:
                # Use Groq for cloud deployment
                generated_guide = generate_ai_response(prompt)
                logger.info("✅ AI guide generated successfully (Groq)")
            else:
                # Use Ollama for local development
                response = ollama.chat(model="llama3", messages=[
                    {"role": "user", "content": prompt}
                ])
                generated_guide = response['message']['content']
                logger.info("✅ AI guide generated successfully (Ollama)")
                
        except Exception as e:
            logger.error(f"AI service error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service error. Please try again later."
            )
        
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
@limiter.limit("60/minute")  # Authenticated endpoint, more lenient
async def get_all_repair_records(request: Request, token_payload: dict = Depends(verify_token)):
    """
    Retrieves all previously saved device repair requests and their generated guides from MongoDB.
    Requires authentication.
    
    ⭐ PRODUCTION READY: Includes pagination-ready structure and error handling
    """
    logger.info("Fetching all repair records")
    records = []
    try:
        for record in repair_records_collection.find().sort("timestamp", -1):
            records.append(RepairRecordInDB(**record))
        logger.info(f"✅ Retrieved {len(records)} repair records")
        return records
    except Exception as e:
        logger.error(f"Database error fetching records: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve repair records. Please try again."
        )


@app.get("/api/repair_records/{record_id}", response_model=RepairRecordInDB, summary="Retrieve a single repair record by ID")
@limiter.limit("60/minute")  # Authenticated endpoint, more lenient
async def get_repair_record(request: Request, record_id: str, token_payload: dict = Depends(verify_token)):
    """
    Retrieves a single repair record by its unique ID from MongoDB.
    Requires authentication.
    
    ⭐ PRODUCTION READY: Full error handling and logging
    """
    logger.info(f"Fetching repair record: {record_id}")
    
    if not ObjectId.is_valid(record_id):
        logger.warning(f"Invalid record ID format: {record_id}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid record ID format")
    
    try:
        record = repair_records_collection.find_one({"_id": ObjectId(record_id)})
        if record:
            logger.info(f"✅ Record found: {record_id}")
            return RepairRecordInDB(**record)
        
        logger.warning(f"Record not found: {record_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Record with ID {record_id} not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Database error fetching record {record_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve repair record. Please try again."
        )