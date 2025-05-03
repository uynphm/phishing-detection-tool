import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ExternalLink, CheckCircle, Lock, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LandingPage = () => {
  const { darkMode } = useTheme();
  const [url, setUrl] = useState('');
  
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      
      {/* Hero Section */}
      <section className="flex-grow pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Hero */}
          <div className="text-center mb-20">
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="relative">
                PhishGuard
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></span>
              </span>
            </h1>
            <p className={`text-xl md:text-2xl max-w-3xl mx-auto mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Protect yourself from online threats with our advanced AI-powered security tools
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-3 text-lg font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150"
              >
                Sign Up Free
              </Link>
              <Link
                to="/login"
                className={`w-full sm:w-auto px-8 py-3 text-lg font-medium rounded-lg border ${
                  darkMode 
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                } transition-colors duration-150`}
              >
                Login
              </Link>
            </div>
          </div>
          
          {/* Quick Scanner */}
          <div className={`max-w-4xl mx-auto mb-20 rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <Shield className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Try Our Scanner</h2>
              </div>
            </div>
            
            <div className="p-6">
              <p className={`mb-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Paste any suspicious URL to instantly analyze it for potential threats
              </p>
              
              <form className="space-y-4">
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
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Analyze</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`px-4 py-3 rounded-lg font-medium ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } transition-colors duration-150`}
                  >
                    Load Sample
                  </button>
                </div>
              </form>
              
              <p className={`mt-3 text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Link to="/signup" className="underline hover:text-blue-500">
                  Create a free account
                </Link>{' '}
                for unlimited scans and detailed reports.
              </p>
            </div>
          </div>
          
          {/* Features */}
          <div className="mb-20">
            <h2 className={`text-3xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Advanced Protection Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <CheckCircle className={`h-10 w-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />,
                  title: "Real-time URL Scanning",
                  description: "Instantly analyze URLs for phishing attempts, malware, and other security threats."
                },
                {
                  icon: <Lock className={`h-10 w-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />,
                  title: "Privacy Protection",
                  description: "Identify privacy risks and data collection practices from websites you visit."
                },
                {
                  icon: <AlertTriangle className={`h-10 w-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />,
                  title: "Advanced Threat Detection",
                  description: "AI-powered analysis identifies even the most sophisticated phishing attempts."
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className={`rounded-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4">
                      {feature.icon}
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </h3>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA Banner */}
          <div className={`rounded-xl overflow-hidden shadow-lg mb-20 ${
            darkMode ? 'bg-gradient-to-r from-blue-900 to-indigo-900' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }`}>
            <div className="px-6 py-10 sm:px-12 sm:py-16">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Stay Protected Online
                </h2>
                <p className="text-blue-100 mb-8">
                  Join thousands of users who trust PhishGuard to keep them safe from online threats.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link
                    to="/signup"
                    className="px-8 py-3 text-lg font-medium rounded-lg bg-white text-blue-600 hover:bg-gray-100 transition-colors duration-150"
                  >
                    Get Started Free
                  </Link>
                  <a 
                    href="https://www.ncsc.gov.uk/section/advice-guidance/you-your-family"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg border border-blue-300 text-white hover:bg-blue-800 transition-colors duration-150"
                  >
                    <span>Security Guidance</span>
                    <ExternalLink className="ml-2 h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default LandingPage;