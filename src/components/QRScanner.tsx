import { useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useTheme } from '../contexts/ThemeContext';
import { Upload, X, AlertTriangle, RefreshCw } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (url: string) => void;
  onScanError?: (error: string) => void;
  clearResult?: () => void;
  onClose: () => void;
}

const QRScanner = ({ onScanSuccess, onScanError, clearResult, onClose }: QRScannerProps) => {
  const { darkMode } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      clearResult?.();
      setScanError(null);
      scanQRCode(file);
    }
  };

  const scanQRCode = async (file: File) => {
    setIsScanning(true);
    setScanError(null);
    // Create a temporary div for scanning
    const tempDiv = document.createElement('div');
    tempDiv.id = 'temp-qr-reader';
    document.body.appendChild(tempDiv);
    
    const html5QrCode = new Html5Qrcode("temp-qr-reader");
    
    try {
      // Scan the QR code
      const result = await html5QrCode.scanFile(file, true);

      if (result) {
        // Validate that the decoded text is a URL
        try {
          new URL(result);
          onScanSuccess(result);
          onClose(); // Close the QR scanner after successful scan
        } catch (e) {
          throw new Error('No QR code detected');
        }
      } else {
        throw new Error('No QR code detected');
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      setScanError('No QR code detected');
      if (onScanError) {
        onScanError('No QR code detected');
      }
    } finally {
      setIsScanning(false);
      // Clean up
      await html5QrCode.clear();
      // Remove the temporary div
      document.body.removeChild(tempDiv);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      clearResult?.();
      setScanError(null);
      scanQRCode(file);
    } else {
      setScanError('No QR code detected');
      if (onScanError) {
        onScanError('No QR code detected');
      }
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    clearResult?.();
  };

  const handleRescan = () => {
    clearSelection();  // Clear the current file and return to upload interface
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Upload QR Code Image</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Upload an image containing a QR code to scan
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          darkMode 
            ? 'border-gray-600 hover:border-gray-500' 
            : 'border-gray-300 hover:border-gray-400'
        } transition-colors duration-150`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className={`h-12 w-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <div className="space-y-2">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Drag and drop an image here, or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-4 py-2 rounded-lg font-medium ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } transition-colors duration-150`}
              >
                Select File
              </button>
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Supports JPG, PNG, GIF
            </p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={previewUrl || ''}
              alt="QR Code preview"
              className="max-h-64 mx-auto rounded-lg"
            />
            <button
              onClick={clearSelection}
              className={`absolute top-2 right-2 p-1 rounded-full ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } transition-colors duration-150`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {isScanning && (
        <div className="mt-4 text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Scanning QR code...
          </p>
        </div>
      )}

      {scanError && (
        <div className={`mt-4 p-4 rounded-lg ${
          darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-3">
            <AlertTriangle className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
            <div className="flex-1">
              <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {scanError}
              </p>
              {selectedFile && (
                <button
                  onClick={handleRescan}
                  className={`mt-2 flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium ${
                    darkMode 
                      ? 'bg-red-800/50 hover:bg-red-800 text-red-300' 
                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                  } transition-colors duration-150`}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner; 