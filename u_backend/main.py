"""
Phishing URL Detection API
This FastAPI application provides an endpoint to detect phishing URLs using machine learning models.
It extracts features from URLs and uses trained models to predict if a URL is phishing or safe.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
import sys
import os
import re
from urllib.parse import urlparse

# Add the parent directory to Python path to import the models module
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from models.phishing_model import PhishingDetector

# Initialize FastAPI application
app = FastAPI(
    title="Phishing URL Detection API",
    description="API for detecting phishing URLs using machine learning models",
    version="1.0.0"
)

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the phishing detector model
phishing_detector = PhishingDetector()

# Define the input model for URL validation
class URLInput(BaseModel):
    url: str

def extract_features(url: str) -> List[float]:
    """
    Extract 30 features from a URL for phishing detection.
    
    Features include:
    1. URL characteristics (length, special characters)
    2. Domain characteristics (length, dots, hyphens)
    3. Path characteristics (length, special characters)
    4. Query parameters characteristics
    5. Security indicators (HTTPS, www)
    
    Args:
        url (str): The URL to analyze
        
    Returns:
        List[float]: 30 normalized features between 0 and 1
    """
    features = []
    
    # Parse URL into components
    parsed = urlparse(url)
    domain = parsed.netloc
    path = parsed.path
    query = parsed.query
    
    # 1. URL Length (normalized by dividing by 100)
    features.append(len(url) / 100)
    
    # 2. Domain Length (normalized by dividing by 50)
    features.append(len(domain) / 50)
    
    # 3. Number of dots in domain (normalized by dividing by 5)
    features.append(domain.count('.') / 5)
    
    # 4. Number of hyphens in domain (normalized by dividing by 5)
    features.append(domain.count('-') / 5)
    
    # 5. Number of underscores in domain (normalized by dividing by 5)
    features.append(domain.count('_') / 5)
    
    # 6. Number of slashes in URL (normalized by dividing by 10)
    features.append(url.count('/') / 10)
    
    # 7. Number of question marks in URL (normalized by dividing by 5)
    features.append(url.count('?') / 5)
    
    # 8. Number of equal signs in URL (normalized by dividing by 5)
    features.append(url.count('=') / 5)
    
    # 9. Number of @ symbols in URL (normalized by dividing by 2)
    features.append(url.count('@') / 2)
    
    # 10. Number of special characters in URL (normalized by dividing by 20)
    special_chars = len(re.findall(r'[^a-zA-Z0-9\-\.]', url))
    features.append(special_chars / 20)
    
    # 11. Number of digits in domain (normalized by dividing by 10)
    digits = len(re.findall(r'\d', domain))
    features.append(digits / 10)
    
    # 12. Number of letters in domain (normalized by dividing by 50)
    letters = len(re.findall(r'[a-zA-Z]', domain))
    features.append(letters / 50)
    
    # 13. Number of digits in path (normalized by dividing by 10)
    digits = len(re.findall(r'\d', path))
    features.append(digits / 10)
    
    # 14. Number of letters in path (normalized by dividing by 50)
    letters = len(re.findall(r'[a-zA-Z]', path))
    features.append(letters / 50)
    
    # 15. Number of digits in query (normalized by dividing by 10)
    digits = len(re.findall(r'\d', query))
    features.append(digits / 10)
    
    # 16. Number of letters in query (normalized by dividing by 50)
    letters = len(re.findall(r'[a-zA-Z]', query))
    features.append(letters / 50)
    
    # 17. Has IP address in domain (binary feature)
    features.append(1.0 if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain) else 0.0)
    
    # 18. Has HTTPS (binary feature)
    features.append(1.0 if url.startswith('https://') else 0.0)
    
    # 19. Has HTTP (binary feature)
    features.append(1.0 if url.startswith('http://') else 0.0)
    
    # 20. Has www (binary feature)
    features.append(1.0 if 'www.' in domain else 0.0)
    
    # 21. Has subdomain (binary feature)
    features.append(1.0 if len(domain.split('.')) > 2 else 0.0)
    
    # 22. Has port number (binary feature)
    features.append(1.0 if ':' in domain else 0.0)
    
    # 23. Has file extension (binary feature)
    features.append(1.0 if '.' in path.split('/')[-1] else 0.0)
    
    # 24. Has query parameters (binary feature)
    features.append(1.0 if query else 0.0)
    
    # 25. Has anchor (binary feature)
    features.append(1.0 if '#' in url else 0.0)
    
    # 26. Has redirect (binary feature)
    features.append(1.0 if 'redirect' in url.lower() else 0.0)
    
    # 27. Has login (binary feature)
    features.append(1.0 if 'login' in url.lower() else 0.0)
    
    # 28. Has signup (binary feature)
    features.append(1.0 if 'signup' in url.lower() else 0.0)
    
    # 29. Has account (binary feature)
    features.append(1.0 if 'account' in url.lower() else 0.0)
    
    # 30. Has secure (binary feature)
    features.append(1.0 if 'secure' in url.lower() else 0.0)
    
    return features

@app.post("/api/detect-phishing")
async def detect_phishing(url_input: URLInput):
    """
    Detect if a URL is phishing or safe using machine learning models.
    
    Args:
        url_input (URLInput): The URL to analyze
        
    Returns:
        Dict: Contains prediction results including:
            - is_phishing: Boolean indicating if URL is phishing
            - probability: Probability of being phishing
            - confidence: Confidence in the prediction
            - model_predictions: Individual model predictions
            - model_probabilities: Individual model probabilities
            - feature_importance: Importance of each feature
            - extracted_features: The 30 features extracted from URL
            
    Raises:
        HTTPException: If there's an error processing the URL
    """
    try:
        # Extract features from URL
        features = extract_features(url_input.url)
        
        # Convert features to numpy array
        features_array = np.array(features)
        
        # Get prediction from models
        result = phishing_detector.predict(features_array)
        
        # Get feature importance from Random Forest model
        feature_importance = phishing_detector.get_feature_importance()
        
        return {
            "is_phishing": result["is_phishing"],
            "probability": result["probability"],
            "confidence": result["confidence"],
            "model_predictions": result["model_predictions"],
            "model_probabilities": result["model_probabilities"],
            "feature_importance": feature_importance,
            "extracted_features": features
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 