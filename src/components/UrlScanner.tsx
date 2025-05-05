import { useState } from 'react';
import { AlertTriangle, CheckCircle, Shield, Copy, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type ScanResult = {
  url: string;
  safe: boolean;
  score: number;
  threats: string[];
  timestamp: string;
};

const UrlScanner = () => {
  const { darkMode } = useTheme();
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [logMessage, setLogMessage] = useState<{text: string, isError: boolean} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsScanning(true);
    setResult(null);
    setLogMessage(null);

    try {
      const response = await fetch('http://localhost:5001/api/scan-url', {
        method: 'POST',
        credentials: 'include', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('Server responsed with error!')
      }
      // Structure of response
      // {
      //   "url": url,
      //   "score": 90,
      //   "threats": ["URL safe"]
      // }
      const data = await response.json();
      console.log("Scan response:", response);
      
      const result: ScanResult = {
        url,
        safe: data.score > 0.3,
        score: data.score,
        threats: data.threats,
        timestamp: new Date().toISOString()
      };

      // Log scan
      let retries = 3;
      while (retries > 0) {
        try {
          const logResponse = await fetch('http://localhost:5001/api/log-scan', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              username: "guest",
              ...result
            })
          });
          
          const logData = await logResponse.json();
          setLogMessage({
            text: logData.message || 'Scan logged successfully',
            isError: !logResponse.ok
          });
          break; // Exit retry loop if successful
        } catch (logError) {
          retries--;
          if (retries === 0) {
            console.error('Final logging attempt failed:', logError);
            setLogMessage({
              text: 'Failed to save scan history',
              isError: true
            });
          } else {
            // Wait for a short period before retrying
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }

      setResult(result);
    } catch (error) {
      console.error('Error scanning URL:', error);
      setResult({
        url,
        safe: false,
        score: 0,
        threats: ['Server error or threat undetected!'],
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsScanning(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Shield className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>URL Scanner</h2>
        </div>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter a URL to check for phishing"
              className={`w-full px-4 py-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {url && (
              <button
                type="button"
                onClick={copyToClipboard}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </button>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isScanning || !url.trim()}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium text-white ${
              isScanning || !url.trim()
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors duration-150`}
          >
            {isScanning ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                <span>Scan URL</span>
              </>
            )}
          </button>
        </form>
        
        {result && (
          <>
            <div className={`mt-6 p-4 rounded-lg ${
              result.safe
                ? darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                : darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                {result.safe ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <h3 className={`font-medium ${
                    result.safe
                      ? darkMode ? 'text-green-400' : 'text-green-800'
                      : darkMode ? 'text-red-400' : 'text-red-800'
                  }`}>
                    {result.safe ? 'Safe URL Detected' : 'Warning: Potential Phishing URL'}
                  </h3>
                  
                  <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {result.safe
                      ? 'This URL appears to be legitimate and safe to visit.'
                      : 'This URL shows characteristics commonly associated with phishing attempts.'}
                  </p>
                  
                  <div className="mt-3">
                    <div className="text-xs font-medium">
                      Trust Score: {result.score}/100
                    </div>
                    <div className="mt-1 h-2 w-full bg-gray-300 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          result.score > 80 ? 'bg-green-500' : 
                          result.score > 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                  </div>
                  
                  {!result.safe && result.threats.length > 0 && (
                    <div className="mt-3">
                      <h4 className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Detected Threats:
                      </h4>
                      <ul className="mt-1 space-y-1">
                        {result.threats.map((threat, index) => (
                          <li key={index} className={`text-xs flex items-center space-x-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span>•</span>
                            <span>{threat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {logMessage && (
              <div className={`mt-4 p-3 rounded-md flex items-center ${
                logMessage.isError
                  ? darkMode ? 'bg-red-900/30 border border-red-700' : 'bg-red-100 border border-red-200'
                  : darkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-100 border border-green-200'
              }`}>
                {logMessage.isError ? (
                  <AlertTriangle className={`h-5 w-5 mr-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                ) : (
                  <CheckCircle className={`h-5 w-5 mr-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                )}
                <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {logMessage.text}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UrlScanner;