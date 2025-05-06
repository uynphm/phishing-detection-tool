from flask import Flask, request, jsonify, session
from flask_cors import CORS
from urllib.parse import urlparse
from enum import Enum
from tld import get_tld, exceptions
from dotenv import load_dotenv
from db import *
from datetime import datetime

import re
import requests
import os
import hashlib

class Threat(Enum):
    INVALID_PROTOCOL = "Invalid URL protocol"
    INVALID_DOMAIN = "Invalid URL domain"
    SUSPICIOUS_AT = "Contains '@' symbol"
    DASHED_DOMAIN = "Hyphen in domain"
    NUMERIC_IP = "Uses raw IP address"
    TOO_MANY_SUBDOMAINS = "Too many subdomains"
    TOO_LONG = "URL is unusually long"
    SUSPICIOUS_KEYWORDS = "Contains suspicious keywords"
    SERVER_ERROR = "Server error"
    GOOGLE_BLACKLISTED = "URL found in Google Safe Browsing blacklist"

load_dotenv()
SAFE_BROWSING_API_KEY = os.getenv("SAFE_BROWSING_API_KEY")
WEB_PROTOCOLS = ['http', 'https']
PHISHING_KEYWORDS = ['login', 'verify', 'bank']

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY") or "dev-secret"
CORS(app, resources={
    r"/api/*": {
        "origins": "http://localhost:5173",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
    }
})

@app.route('/api/testsetup')
def testsetup():
    return jsonify(
        {
            "success": True,
            "message": "test route works!"
        }
    ), 200

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    """Check user's credentials
        payload = {
            "username": string,
            "password": string
        }
        Return {
            "id": string
            "success": True/False, 
            "message": "Login successful/Invalid credentials"
        }
    """
    if request.method == 'OPTIONS':  # ← Preflight handler
        return jsonify({'status': 'ok'}), 200
    
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"id": None, "success": False, "message": "Username and password required"}), 400
    
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    if check_user_credentials(username, hashed_password):
        session['username'] = username  # store in session
        return jsonify({"id": username, "success": True, "message": "Login successful"}), 200
    else:
        return jsonify({"id": None, "success": False, "message": "Invalid credentials"}), 401


@app.route('/api/signup', methods=['POST', 'OPTIONS'])
def signup():
    """Add user's credentials
        payload = {
            "username": string,
            "password": string
        }
        return {
            "success": True/False, 
            "message": "User created successfully/already exists"
        }
    """
    if request.method == 'OPTIONS':  # ← Preflight handler
        return jsonify({'status': 'ok'}), 200

    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password are required"}), 400

    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    success = create_user(username, hashed_password)
    if success:
        session['username'] = username
        return jsonify({"success": True, "message": "User created successfully"}), 201
    else:
        return jsonify({"success": False, "message": "User already exists"}), 409
    

@app.route('/api/logout', methods=['POST', 'OPTIONS'])
def logout():
    if request.method == 'OPTIONS':  # ← Preflight handler
        return jsonify({'status': 'ok'}), 200
    session.pop('username', None)
    return jsonify({"success": True, "message": "Logout successful"}), 200
    

@app.route('/api/scan-url', methods=['POST', 'OPTIONS'])
def scan_url():
    """Scan a given URL for phishing risk using rules and Safe Browsing API
        payload = {"url": "http://example.com"}
        return {
            "url": str,
            "score": float,
            "threats": list[str],
            "timestamp": str (IOS format)
        }
    """
    if request.method == 'OPTIONS':  # ← Preflight handler
        return jsonify({'status': 'ok'}), 200
    
    data = request.json
    url = data.get('url', '').strip()

    if (not url): 
        return jsonify({"error": "No URL provided"}), 400

    score1, threats1 = analyze_url_structure(url)
    score2, threats2 = check_blacklist(url)
    return jsonify({
        "url": url,
        "score": max((score1 + score2)/2, 0),
        "threats": threats1 + threats2
    })

def analyze_url_structure(url: str) -> tuple[float, list[str]]:
    """1. parsing the url check for the patterns"""
    score = 100.0
    threats = []
    try:
        parsed_url = urlparse(url)
        
        # Check for proper scheme and domain
        if not all([parsed_url.scheme in WEB_PROTOCOLS, parsed_url.netloc]): 
            threats.append(Threat.INVALID_PROTOCOL.value)
            threats.append(Threat.INVALID_DOMAIN.value)
            return 0.0, threats
        
        # Check if TLD is valid
        get_tld(url, fail_silently=False)

        #Check for other patterns
        # '@' in URL that often used to obscure real domain
        if '@' in url:
            score -= 20.0
            threats.append(Threat.SUSPICIOUS_AT.value)
        # Hyphen in domain which common in fake lookalike domains
        if '-' in parsed_url.netloc:
            score -= 15.0
            threats.append(Threat.DASHED_DOMAIN.value)
        # IP address instead of domain
        if re.match(r"^\d{1,3}(\.\d{1,3}){3}", parsed_url.netloc):
            score -= 30.0
            threats.append(Threat.NUMERIC_IP.value)
        # Too many dots, suspicious subdomain chaining
        if parsed_url.netloc.count('.') > 3:
            score -= 10.0
            threats.append(Threat.TOO_MANY_SUBDOMAINS.value)
        # Long URL
        if len(url) > 100:
            score -= 10.0
            threats.append(Threat.TOO_LONG.value)
        # Phishing keywords
        if any(keyword in url.lower() for keyword in PHISHING_KEYWORDS):
            score -= 15.0
            threats.append(Threat.SUSPICIOUS_KEYWORDS.value)
    except (exceptions.TldBadUrl, exceptions.TldDomainNotFound):
        threats.append(Threat.INVALID_DOMAIN.value)
        score = 0.0
    except Exception as e:
        print(f"Server error parsing URL: {url} - {e}")
        threats.append(Threat.SERVER_ERROR.value)
        score = 0.0
    return max(score, 0), threats

def check_blacklist(url: str) -> tuple[float, list[str]]:
    """2. check against the PhishTank database to see if the url in it"""
    if (check_with_google_safe_browsing(url)):
        return 100.0, []
    return 0.0, [Threat.GOOGLE_BLACKLISTED.value]

def check_with_google_safe_browsing(url: str) -> bool:
    """Returns True if the URL is not found in Google's Safe Browsing threat list."""
    api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={SAFE_BROWSING_API_KEY}"
    payload = {
        "client": {
            "clientId": "url-checker",
            "clientVersion": "1.0"
        },
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}]
        }
    }
    response = requests.post(api_url, json=payload)
    data = response.json()
    print(f"[SafeBrowsing] Response for {url}: {data}")
    return len(data.get("matches", [])) == 0


@app.route('/api/history', methods=['GET', 'OPTIONS'])
def get_scan_history():
    """ Return the scanned URL of user
        route = http://.../api/history
        return {
            "url": str,
            "score": float,
            "threats": list[str],
            "timestamp": str (IOS format)
        }
    """
    if request.method == 'OPTIONS':  # ← Preflight handler
        return jsonify({'status': 'ok'}), 200
    
    username = session.get('username')
    if not username:
        return jsonify({"error": "Username is missing"}), 400
    return jsonify(scan_history(username))


@app.route('/api/log-scan', methods=['POST', 'OPTIONS'])
def log_scan():
    """Add scanned URL to DB
        payload = {
            "url": str,
            "score": float,
            "threats": list[str],
            "timestamp": str (IOS format)
        }
    """
    if request.method == 'OPTIONS':  # ← Preflight handler
        return jsonify({'status': 'ok'}), 200
    
    data = request.get_json()
    print("Session contents:", session)  # Debug what's in the session
    username = session.get('username')
    url = data.get('url')
    score = data.get('score')
    threats = data.get('threats', [])
    timestamp = data.get('timestamp') or datetime.now().isoformat()

    if not all([username, url, score is not None]):
        return jsonify({"success": False, "message": "Missing required fields (username, url, score)"}), 400

    try:
        insert_scan_db(username, url, score, threats, timestamp)
        return jsonify({"success": True, "message": "Scan logged successfully"}), 200
    except Exception as e:
        print(f"[ERROR] Failed to log scan: {e}")
        return jsonify({"success": False, "message": "Failed to log scan"}), 500



if __name__ == '__main__':
    init_db()
    app.run(port=5001, debug=True)
