from flask import Flask, request, jsonify
from flask_cors import CORS
from urllib.parse import urlparse
from enum import Enum
from tld import get_tld, exceptions
from dotenv import load_dotenv

import re
import requests
import os

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
    PHISHTANK_BLACKLISTED = "URL found in PhishTank blacklist"

load_dotenv()
SAFE_BROWSING_API_KEY = os.getenv("SAFE_BROWSING_API_KEY")
DB_PATH = os.getenv("DATABASE_URL", "url_scanner.db")

WEB_PROTOCOLS = ['http', 'https']
PHISHING_KEYWORDS = ['login', 'verify', 'bank']

app = Flask(__name__)
CORS(app)

phishtank_blacklist = set()

@app.route('/api/testsetup')
def testsetup():
    return jsonify(
        {
            "success": True,
            "message": "test route works!"
        }
    ), 200

@app.route('/api/scan-url', methods=['POST'])
def scan_url():
    data = request.json
    url = data.get('url', '').strip()

    if (not url): 
        return jsonify({"error": "No URL provided"}), 400
    
    score1, threats1 = analyze_url_structure(url)
    score2, threats2 = check_blacklist(url)
    # score3, threats3 = predict_with_ml(url)

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
    return 0.0, [Threat.PHISHTANK_BLACKLISTED.value]

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



if __name__ == '__main__':
    app.run(debug=True)
