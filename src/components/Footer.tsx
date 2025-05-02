import { Shield, Github, Twitter, Facebook } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const { darkMode } = useTheme();
  
  return (
    <footer className={`py-8 ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className="text-lg font-bold">PhishGuard</span>
            </div>
            <p className="text-sm">
              Protecting you from online scams and phishing attempts since 2025.
            </p>
            <div className="flex space-x-4">
              <a href="#" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                <Twitter size={20} />
              </a>
              <a href="#" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                <Facebook size={20} />
              </a>
              <a href="#" className={`hover:${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:underline">Documentation</a></li>
              <li><a href="#" className="text-sm hover:underline">API Reference</a></li>
              <li><a href="#" className="text-sm hover:underline">Blog</a></li>
              <li><a href="#" className="text-sm hover:underline">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:underline">About</a></li>
              <li><a href="#" className="text-sm hover:underline">Careers</a></li>
              <li><a href="#" className="text-sm hover:underline">Press</a></li>
              <li><a href="#" className="text-sm hover:underline">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:underline">Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:underline">Terms of Service</a></li>
              <li><a href="#" className="text-sm hover:underline">Cookie Policy</a></li>
              <li><a href="#" className="text-sm hover:underline">GDPR</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-sm text-center">
            &copy; {new Date().getFullYear()} PhishGuard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;