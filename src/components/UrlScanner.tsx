import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface ScanResult {
  is_phishing: boolean;
  probability: number;
  confidence: number;
  score: number;
  model_predictions: {
    bert: boolean;
  };
  model_probabilities: {
    bert: number;
  };
  is_suspicious: boolean;
}

interface AxiosErrorResponse {
  code?: string;
  response?: {
    status?: number;
    data?: {
      detail?: string;
    };
  };
}

interface ErrorResponse {
  detail: string;
}

const UrlScanner: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<'idle' | 'preparing' | 'analyzing' | 'complete'>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentStage('preparing');

    try {
      // Validate URL format
      if (!url.match(/^https?:\/\/.+/)) {
        throw new Error('Please enter a valid URL starting with http:// or https://');
      }

      // Simulate stages for better UX
      const stages = ['preparing', 'analyzing', 'complete'];
      for (const stage of stages) {
        setCurrentStage(stage as any);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const response = await axios.post<ScanResult | ErrorResponse>(
        'http://127.0.0.1:5000/api/detect-phishing',
        { url },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 15000,
          validateStatus: (status) => status < 500
        }
      );

      if (response.status === 200 && 'is_phishing' in response.data) {
        setResult(response.data as ScanResult);
        setRetryCount(0);

        // Save to history if user is logged in
        if (user) {
          try {
            await axios.post(
              'http://127.0.0.1:5000/api/save-scan',
              {
                url,
                result: response.data,
                userId: user.id
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              }
            );
          } catch (error) {
            console.error('Failed to save scan to history:', error);
          }
        }
      } else {
        const errorData = response.data as ErrorResponse;
        throw new Error(errorData.detail || 'Failed to analyze URL');
      }
    } catch (error) {
      const axiosError = error as AxiosErrorResponse;
      
      // Handle network errors
      if (!axiosError.response) {
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setError(`Network error. Retrying... (${retryCount + 1}/3)`);
          setTimeout(() => handleSubmit(e), 2000); // Retry after 2 seconds
          return;
        } else {
          setError('Network error. Please check your internet connection and try again.');
        }
      } else if (axiosError.code === 'ECONNABORTED') {
        setError('The request timed out. Please try again.');
      } else if (axiosError.response?.status === 404) {
        setError('The scanning service is currently unavailable. Please try again later.');
      } else if (axiosError.response?.status === 400) {
        setError(axiosError.response?.data?.detail || 'Invalid URL format. Please check and try again.');
      } else if (axiosError.response?.status === 500) {
        setError('An error occurred while analyzing the URL. Please try again later.');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Error details:', error);
    } finally {
      setIsLoading(false);
      setCurrentStage('idle');
    }
  };

  const getStageProgress = () => {
    switch (currentStage) {
      case 'preparing': return 30;
      case 'analyzing': return 70;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const getSafetyLevel = (score: number) => {
    if (score >= 80) return { level: 'High', color: 'text-green-500', bg: 'bg-green-100' };
    if (score >= 60) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-red-500', bg: 'bg-red-100' };
  };

  const getRecommendations = (result: ScanResult) => {
    const recommendations = [];
    
    if (result.is_phishing) {
      recommendations.push('Do not enter any personal information on this website');
      recommendations.push('Do not click on any links or download files');
      recommendations.push('Report this URL to your organization\'s IT security team');
    } else if (result.is_suspicious) {
      recommendations.push('Exercise caution when entering personal information');
      recommendations.push('Verify the website\'s authenticity through official channels');
      recommendations.push('Use two-factor authentication if available');
    } else {
      recommendations.push('The website appears to be safe');
      recommendations.push('Still, always be cautious with personal information');
      recommendations.push('Keep your browser and security software up to date');
    }
    
    return recommendations;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col space-y-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to scan"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`p-3 rounded-lg text-white font-semibold ${
              isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Scanning...' : 'Scan URL'}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="bg-blue-600 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getStageProgress()}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {currentStage === 'preparing' && 'Preparing URL analysis...'}
            {currentStage === 'analyzing' && 'Analyzing URL for potential threats...'}
            {currentStage === 'complete' && 'Analysis complete!'}
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <FaExclamationTriangle className="inline-block mr-2" />
          {error}
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {result.is_phishing ? '⚠️ Unsafe URL Detected' : '✅ Safe URL'}
            </h2>
            {result.is_phishing ? (
              <FaExclamationTriangle className="text-red-500 text-3xl" />
            ) : (
              <FaCheckCircle className="text-green-500 text-3xl" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Safety Assessment</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      result.score >= 80 ? 'bg-green-500' :
                      result.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-600">Safety Score: {result.score}%</p>
                  <span className={`text-sm font-medium ${getSafetyLevel(result.score).color}`}>
                    {getSafetyLevel(result.score).level} Safety
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Analysis Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>BERT Model Prediction:</span>
                    <span className={result.model_predictions.bert ? 'text-red-500' : 'text-green-500'}>
                      {result.model_predictions.bert ? 'Unsafe' : 'Safe'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Confidence Level:</span>
                    <span className="text-blue-500">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {getRecommendations(result).map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.is_suspicious && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Suspicious Patterns Detected</h3>
                  <ul className="list-disc list-inside text-sm text-yellow-700">
                    <li>Unusual domain structure</li>
                    <li>Suspicious keywords present</li>
                    <li>Mixed protocol usage</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UrlScanner;