"""
Phishing URL Detection API
This FastAPI application provides an endpoint to detect phishing URLs using BERT model.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
import uvicorn
from models.phishing_model import PhishingDetector

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Phishing URL Detector",
    description="API for detecting phishing URLs using BERT model",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",  # Vite dev server alternative
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",  # React dev server alternative
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Initialize phishing detector model
try:
    logger.info("Initializing phishing detector model...")
    detector = PhishingDetector()
    logger.info("Model initialization complete!")
except Exception as e:
    logger.error(f"Error initializing model: {str(e)}")
    raise

@app.get("/")
async def root():
    return {"message": "Welcome to Phishing URL Detector API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Define the input model for URL validation
class URLInput(BaseModel):
    url: str

@app.post("/api/detect-phishing")
async def detect_phishing(input_data: URLInput):
    """
    Detect if a URL is phishing using BERT model
    """
    try:
        # Validate URL
        if not input_data.url:
            raise HTTPException(status_code=400, detail="URL cannot be empty")
        
        if not input_data.url.startswith(('http://', 'https://')):
            raise HTTPException(status_code=400, detail="URL must start with http:// or https://")
        
        # Get prediction
        result = detector.predict(input_data.url)
        
        return result
        
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error making prediction: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000, reload=False) 