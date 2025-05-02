import { Link } from 'react-router-dom';
import { Shield, Home, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFoundPage = () => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <AlertTriangle className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
          <h1 className={`text-4xl font-extrabold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            404
          </h1>
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Page Not Found
          </h2>
          <p className={`mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150"
            >
              <Home className="h-5 w-5" />
              <span>Return Home</span>
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md ${
                darkMode 
                  ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                  : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
              } transition-colors duration-150`}
            >
              <Shield className="h-5 w-5" />
              <span>Go to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFoundPage;