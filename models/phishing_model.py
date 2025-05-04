import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import SGDClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

class PhishingDetector:
    def __init__(self):
        self.models = {
            'logistic': None,
            'random_forest': None,
            'mlp': None
        }
        self.scaler = StandardScaler()
        self.model_dir = os.path.dirname(__file__)
        self._load_models()

    def _load_models(self):
        """Load all trained models and scaler if they exist"""
        try:
            # Load scaler
            scaler_path = os.path.join(self.model_dir, 'scaler.joblib')
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
            
            # Load each model
            for model_name in self.models.keys():
                model_path = os.path.join(self.model_dir, f'{model_name}_model.joblib')
                if os.path.exists(model_path):
                    self.models[model_name] = joblib.load(model_path)
                else:
                    # Initialize with default parameters if not found
                    if model_name == 'logistic':
                        self.models[model_name] = SGDClassifier(
                            loss='log',
                            eta0=0.01,
                            learning_rate='constant',
                            max_iter=200,
                            tol=1e-3,
                            random_state=42
                        )
                    elif model_name == 'random_forest':
                        self.models[model_name] = RandomForestClassifier(
                            n_estimators=150,
                            max_depth=20,
                            random_state=42
                        )
                    else:  # mlp
                        self.models[model_name] = MLPClassifier(
                            hidden_layer_sizes=(64,),
                            learning_rate_init=0.0005,
                            max_iter=1000,
                            solver='adam',
                            random_state=42
                        )
        except Exception as e:
            print(f"Error loading models: {str(e)}")
            self._initialize_default_models()

    def _initialize_default_models(self):
        """Initialize models with default parameters"""
        self.models['logistic'] = SGDClassifier(
            loss='log',
            eta0=0.01,
            learning_rate='constant',
            max_iter=200,
            tol=1e-3,
            random_state=42
        )
        self.models['random_forest'] = RandomForestClassifier(
            n_estimators=150,
            max_depth=20,
            random_state=42
        )
        self.models['mlp'] = MLPClassifier(
            hidden_layer_sizes=(64,),
            learning_rate_init=0.0005,
            max_iter=1000,
            solver='adam',
            random_state=42
        )

    def train(self, X, y):
        """Train all models with the provided data"""
        try:
            # Scale the features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train each model
            for model_name, model in self.models.items():
                model.fit(X_scaled, y)
                
                # Save the model
                model_path = os.path.join(self.model_dir, f'{model_name}_model.joblib')
                joblib.dump(model, model_path)
            
            # Save the scaler
            scaler_path = os.path.join(self.model_dir, 'scaler.joblib')
            joblib.dump(self.scaler, scaler_path)
            
            return True
        except Exception as e:
            print(f"Error training models: {str(e)}")
            return False

    def predict(self, features):
        """Get ensemble prediction from all models"""
        try:
            # Convert features to numpy array if it's not already
            features = np.array(features).reshape(1, -1)
            
            # Scale the features
            features_scaled = self.scaler.transform(features)
            
            # Get predictions from each model
            predictions = []
            probabilities = []
            
            for model_name, model in self.models.items():
                if model is not None:
                    pred = model.predict(features_scaled)[0]
                    prob = model.predict_proba(features_scaled)[0][1]
                    predictions.append(pred)
                    probabilities.append(prob)
            
            # Ensemble prediction (majority voting)
            final_pred = np.mean(predictions) > 0.5
            final_prob = np.mean(probabilities)
            
            # Get individual model predictions
            model_predictions = {
                'logistic': bool(predictions[0]),
                'random_forest': bool(predictions[1]),
                'mlp': bool(predictions[2])
            }
            
            return {
                'is_phishing': bool(final_pred),
                'probability': float(final_prob),
                'confidence': float(abs(final_prob - 0.5) * 2),  # Convert to 0-1 scale
                'model_predictions': model_predictions,
                'model_probabilities': {
                    'logistic': float(probabilities[0]),
                    'random_forest': float(probabilities[1]),
                    'mlp': float(probabilities[2])
                }
            }
        except Exception as e:
            print(f"Error making prediction: {str(e)}")
            return {
                'is_phishing': False,
                'probability': 0.0,
                'confidence': 0.0,
                'error': str(e)
            }

    def get_feature_importance(self):
        """Get feature importance scores from Random Forest model"""
        try:
            if self.models['random_forest'] is None:
                return {}
            
            # Get feature names (assuming they're 0-indexed if not provided)
            feature_names = [f"feature_{i}" for i in range(len(self.models['random_forest'].feature_importances_))]
            
            # Create dictionary of feature importance
            importance_dict = dict(zip(feature_names, self.models['random_forest'].feature_importances_))
            
            # Sort by importance
            return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
        except Exception as e:
            print(f"Error getting feature importance: {str(e)}")
            return {} 