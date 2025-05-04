/**
 * PhishingDetector Component
 * 
 * This component provides a user interface for detecting phishing URLs.
 * It allows users to input a URL and displays the analysis results from
 * multiple machine learning models.
 */

import React, { useState } from 'react';
import axios from 'axios';

// Define the structure of the API response
interface PhishingResult {
  is_phishing: boolean;          // Overall prediction
  probability: number;           // Probability of being phishing
  confidence: number;           // Confidence in the prediction
  model_predictions: {          // Individual model predictions
    logistic: boolean;
    random_forest: boolean;
    mlp: boolean;
  };
  model_probabilities: {        // Individual model probabilities
    logistic: number;
    random_forest: number;
    mlp: number;
  };
  feature_importance: Record<string, number>;  // Feature importance scores
  extracted_features: number[];  // The 30 features extracted from URL
}

const PhishingDetector: React.FC = () => {
  // State management
  const [url, setUrl] = useState<string>('');  // URL input
  const [result, setResult] = useState<PhishingResult | null>(null);  // Analysis results
  const [loading, setLoading] = useState(false);  // Loading state
  const [error, setError] = useState<string | null>(null);  // Error state

  /**
   * Handle form submission
   * Sends the URL to the backend API and processes the response
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Send URL to backend API
      const response = await axios.post<PhishingResult>('http://localhost:8000/api/detect-phishing', {
        url: url
      });
      
      // Update state with results
      setResult(response.data);
    } catch (err) {
      setError('Error analyzing URL. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <h2 className="text-2xl font-bold mb-6">Phishing URL Detector</h2>
      
      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Enter URL to analyze:
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="https://example.com"
            required
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Analyzing...' : 'Analyze URL'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
          
          {/* Overall Results */}
          <div className="mb-4">
            <p className="text-lg">
              <span className="font-semibold">Status: </span>
              <span className={result.is_phishing ? 'text-red-600' : 'text-green-600'}>
                {result.is_phishing ? 'Phishing Detected' : 'Safe URL'}
              </span>
            </p>
            <p className="text-lg">
              <span className="font-semibold">Probability: </span>
              {(result.probability * 100).toFixed(2)}%
            </p>
            <p className="text-lg">
              <span className="font-semibold">Confidence: </span>
              {(result.confidence * 100).toFixed(2)}%
            </p>
          </div>

          {/* Individual Model Results */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Individual Model Predictions:</h4>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(result.model_predictions).map(([model, prediction]) => (
                <div key={model} className="p-2 bg-gray-50 rounded">
                  <p className="font-medium capitalize">{model}:</p>
                  <p className={prediction ? 'text-red-600' : 'text-green-600'}>
                    {prediction ? 'Phishing' : 'Safe'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Probability: {(result.model_probabilities[model as keyof typeof result.model_probabilities] * 100).toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Importance */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Top 5 Important Features:</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.feature_importance)
                .slice(0, 5)
                .map(([feature, importance]) => (
                  <div key={feature} className="p-2 bg-gray-50 rounded">
                    <p className="font-medium">{feature}:</p>
                    <p className="text-sm text-gray-600">
                      {(importance * 100).toFixed(2)}%
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Extracted Features */}
          <div>
            <h4 className="font-semibold mb-2">Extracted Features:</h4>
            <div className="bg-gray-50 p-4 rounded overflow-x-auto">
              <pre className="text-sm">
                {JSON.stringify(result.extracted_features, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhishingDetector; 