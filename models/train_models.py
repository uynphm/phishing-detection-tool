import pandas as pd
from phishing_model import PhishingDetector
from sklearn.model_selection import train_test_split
import os

def train_models():
    # Find the data file
    data_file = 'final.csv'
    if not os.path.exists(data_file):
        # Try looking in the models directory
        data_file = os.path.join(os.path.dirname(__file__), 'final.csv')
        if not os.path.exists(data_file):
            # Try looking in the parent directory
            data_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'final.csv')
            if not os.path.exists(data_file):
                raise FileNotFoundError("Could not find final.csv. Please ensure it exists in the project directory.")

    # Load the training data
    print(f"Loading data from {data_file}...")
    df = pd.read_csv(data_file)
    X = df.drop(columns=['Result'])
    y = df['Result']

    # Split data into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Initialize the detector
    print("Initializing models...")
    detector = PhishingDetector()

    # Train the models
    print("Training models...")
    success = detector.train(X_train, y_train)

    if success:
        print("Models trained successfully!")
        
        # Test the models
        print("\nTesting models...")
        result = detector.predict(X_test.iloc[0].values)  # Test with first sample
        
        print("\nEnsemble Results:")
        print(f"Is Phishing: {result['is_phishing']}")
        print(f"Probability: {result['probability']:.2%}")
        print(f"Confidence: {result['confidence']:.2%}")
        
        print("\nIndividual Model Results:")
        for model_name, pred in result['model_predictions'].items():
            prob = result['model_probabilities'][model_name]
            print(f"\n{model_name.upper()}:")
            print(f"  Prediction: {'Phishing' if pred else 'Safe'}")
            print(f"  Probability: {prob:.2%}")
        
        # Show feature importance
        importance = detector.get_feature_importance()
        print("\nFeature Importance (from Random Forest):")
        for feature, score in importance.items():
            print(f"{feature}: {score:.4f}")
    else:
        print("Error training models")

if __name__ == "__main__":
    train_models() 