import { useState } from 'react';
import { Camera, AlertTriangle, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const QrScanner = () => {
  const { darkMode } = useTheme();
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const startScanner = () => {
    setCameraActive(true);
    setIsScanning(true);
  };

  const stopScanner = () => {
    setCameraActive(false);
    setIsScanning(false);
  };

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Camera className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>QR Code Scanner</h2>
        </div>
      </div>
      
      <div className="p-6">
        {!cameraActive ? (
          <div className="text-center space-y-4">
            <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Camera className={`h-12 w-12 mx-auto mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Scan QR codes to check for phishing URLs. Your camera will open to scan the code.
              </p>
            </div>
            
            <button
              onClick={startScanner}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150"
            >
              <Camera className="h-5 w-5" />
              <span>Open Camera</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {/* This would be replaced with actual camera feed in a real implementation */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isScanning ? (
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                ) : (
                  <div className="text-center p-4">
                    <Camera className="h-10 w-10 mx-auto mb-2 text-white" />
                    <p className="text-white text-sm">Point your camera at a QR code</p>
                  </div>
                )}
              </div>
              
              {/* Scanning overlay with corners */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-2/3 h-2/3 relative">
                  {/* Top-left corner */}
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-blue-500"></div>
                  {/* Top-right corner */}
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-blue-500"></div>
                  {/* Bottom-left corner */}
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-blue-500"></div>
                  {/* Bottom-right corner */}
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-blue-500"></div>
                </div>
              </div>
              
              {/* Scanning line animation */}
              <div className="absolute inset-x-0 top-1/4 h-0.5 bg-blue-500 animate-scan"></div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={stopScanner}
                className="flex-1 px-4 py-3 rounded-lg font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors duration-150"
              >
                Cancel
              </button>
            </div>
            
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-100'}`}>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                    Scanning Tips
                  </h3>
                  <ul className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                    <li className="flex items-center space-x-1">
                      <span>•</span>
                      <span>Ensure good lighting for best results</span>
                    </li>
                    <li className="flex items-center space-x-1">
                      <span>•</span>
                      <span>Hold your device steady</span>
                    </li>
                    <li className="flex items-center space-x-1">
                      <span>•</span>
                      <span>Position QR code within the frame</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrScanner;