import { useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useTheme } from '../contexts/ThemeContext';
import { Upload, X } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (url: string) => void;
  onScanError: (error: string) => void;
  onClose: () => void;
  clearResult: () => void;
}

const QRScanner = ({ onScanSuccess, onScanError, onClose, clearResult }: QRScannerProps) => {
  const { darkMode } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanError(null);
      scanQRCode(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanError(null);
      scanQRCode(file);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const scanQRCode = async (file: File) => {
    try {
      // Create a temporary div for the QR code scanner
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-qr-reader';
      document.body.appendChild(tempDiv);
      
      const html5QrCode = new Html5Qrcode("temp-qr-reader");
      
      try {
        const result = await html5QrCode.scanFile(file, true);
        if (result) {
          // Validate if the result is a URL
          try {
            new URL(result);
            onScanSuccess(result);
            onClose(); // Close the QR scanner after successful scan
          } catch {
            throw new Error('No QR code detected');
          }
        } else {
          throw new Error('No QR code detected');
        }
      } finally {
        // Clean up
        await html5QrCode.stop();
        document.body.removeChild(tempDiv);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No QR code detected';
      setScanError(errorMessage);
      onScanError(errorMessage);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${darkMode ? 'dark' : ''}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 relative ${darkMode ? 'dark' : ''}`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Scan QR Code</h2>
        
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              darkMode 
                ? 'border-gray-600 hover:border-gray-500' 
                : 'border-gray-300 hover:border-gray-400'
            } transition-colors duration-150`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className={`w-12 h-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Drag and drop your QR code image here, or
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-2 text-sm font-medium ${
                    darkMode 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  browse files
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={previewUrl || ''}
                alt="QR Code Preview"
                className="w-full h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
              />
              {/* Close button for selected file */}
              <button
                onClick={clearSelection}
                className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {scanError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{scanError}</span>
                </div>
                <button
                  onClick={clearSelection}
                  className="mt-3 w-full bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400 py-2 px-4 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/70 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Try Again</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner; 