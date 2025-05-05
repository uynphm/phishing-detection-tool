import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import re
from urllib.parse import urlparse

class PhishingDetector:
    def __init__(self):
        # Initialize BERT model (pretrained)
        print("Loading BERT model...")
        self.bert_tokenizer = AutoTokenizer.from_pretrained("adhit-420/bert-phishing-classifier")
        self.bert_model = AutoModelForSequenceClassification.from_pretrained("adhit-420/bert-phishing-classifier")
        self.bert_model.eval()  # Set to evaluation mode
        
        # Enhanced suspicious keywords
        self.suspicious_keywords = {
            'verify', 'secure', 'login', 'signin', 'account', 'password',
            'update', 'confirm', 'validate', 'check', 'security', 'payment',
            'billing', 'subscription', 'renewal', 'expired', 'suspended',
            'locked', 'unlock', 'reset', 'change', 'modify', 'access',
            'bank', 'credit', 'card', 'ssn', 'social', 'security',
            'tax', 'refund', 'claim', 'prize', 'winner', 'lottery',
            'inheritance', 'fund', 'transfer', 'wire', 'urgent', 'immediate'
        }
    
    def predict(self, url: str) -> dict:
        """
        Make prediction using BERT model
        
        Args:
            url: The URL string to analyze
            
        Returns:
            dict: Contains prediction results
        """
        try:
            # Get BERT prediction
            bert_result = self.bert_predict(url)
            
            # Calculate confidence based on probability
            confidence = abs(bert_result['probability'] - 0.5) * 2  # Scale to 0-1
            
            # Calculate safety score (0-100)
            safety_score = int((1 - bert_result['probability']) * 100)
            
            # Check for suspicious patterns
            is_suspicious = self._is_suspicious_url(url)
            
            return {
                "is_phishing": bert_result['prediction'],
                "probability": bert_result['probability'],
                "confidence": float(confidence),
                "score": safety_score,
                "model_predictions": {"bert": bert_result['prediction']},
                "model_probabilities": {"bert": bert_result['probability']},
                "is_suspicious": is_suspicious
            }
            
        except Exception as e:
            print(f"Error in predict: {str(e)}")
            raise
    
    def bert_predict(self, url: str) -> dict:
        """
        Make prediction using BERT model on raw URL
        
        Args:
            url: The URL string to analyze
        """
        # Tokenize URL
        inputs = self.bert_tokenizer(
            url,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True
        )
        
        # Get model prediction
        with torch.no_grad():
            outputs = self.bert_model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)
            
        # Get prediction and probability
        prediction = torch.argmax(logits, dim=1).item()
        probability = probs[0][1].item()  # Probability of being phishing
        
        return {
            "prediction": bool(prediction),
            "probability": float(probability)
        }
    
    def _is_suspicious_url(self, url: str) -> bool:
        """
        Check if URL contains suspicious patterns
        """
        url_lower = url.lower()
        
        # Check for suspicious keywords
        if any(keyword in url_lower for keyword in self.suspicious_keywords):
            return True
            
        # Check for mixed protocols
        if 'http://' in url and 'https://' in url:
            return True
            
        # Check for IP address in domain
        if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url):
            return True
            
        # Check for suspicious TLDs
        suspicious_tlds = {'.xyz', '.top', '.work', '.live', '.world', '.site', '.online', '.click', '.tk', '.ml', '.ga', '.cf'}
        if any(url_lower.endswith(tld) for tld in suspicious_tlds):
            return True
            
        return False 