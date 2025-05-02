import { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Shield, BarChart3, History, Bell, Settings, User, PieChart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import UrlScanner from '../components/UrlScanner';
import QrScanner from '../components/QrScanner';
import ScanHistory from '../components/ScanHistory';

type SidebarLinkProps = {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick: () => void;
};

const SidebarLink = ({ icon, text, active, onClick }: SidebarLinkProps) => {
  const { darkMode } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full space-x-3 p-3 rounded-lg transition-colors duration-150 ${
        active 
          ? darkMode 
            ? 'bg-blue-900/40 text-blue-400' 
            : 'bg-blue-100 text-blue-800'
          : darkMode 
            ? 'text-gray-300 hover:bg-gray-700' 
            : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="font-medium">{text}</span>
    </button>
  );
};

const DashboardPage = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('scanner');
  
  const navigateTo = (path: string, section: string) => {
    navigate(path);
    setActiveSection(section);
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      
      <div className="flex-grow pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Sidebar - Hidden on mobile */}
            <div className="hidden lg:block lg:col-span-3">
              <nav className={`space-y-1 sticky top-20 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-800' : 'bg-blue-100'}`}>
                      <User className={`h-5 w-5 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user?.name}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg space-y-1 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                  <SidebarLink
                    icon={<Shield className="h-5 w-5" />}
                    text="URL Scanner"
                    active={activeSection === 'scanner'}
                    onClick={() => navigateTo('/dashboard', 'scanner')}
                  />
                  <SidebarLink
                    icon={<Bell className="h-5 w-5" />}
                    text="QR Scanner"
                    active={activeSection === 'qr-scanner'}
                    onClick={() => navigateTo('/dashboard/qr', 'qr-scanner')}
                  />
                  <SidebarLink
                    icon={<History className="h-5 w-5" />}
                    text="Scan History"
                    active={activeSection === 'history'}
                    onClick={() => navigateTo('/dashboard/history', 'history')}
                  />
                  <SidebarLink
                    icon={<BarChart3 className="h-5 w-5" />}
                    text="Analytics"
                    active={activeSection === 'analytics'}
                    onClick={() => navigateTo('/dashboard/analytics', 'analytics')}
                  />
                  <SidebarLink
                    icon={<Settings className="h-5 w-5" />}
                    text="Settings"
                    active={activeSection === 'settings'}
                    onClick={() => navigateTo('/dashboard/settings', 'settings')}
                  />
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                  <div className={`rounded-lg overflow-hidden p-4 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                    <h3 className={`text-sm font-medium mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                      Premium Features
                    </h3>
                    <p className={`text-xs mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Upgrade to access advanced security features and unlimited scans.
                    </p>
                    <button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg px-3 py-2 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </nav>
            </div>
            
            {/* Main Content */}
            <main className="lg:col-span-9">
              {/* Mobile navigation */}
              <div className="lg:hidden mb-6 overflow-x-auto">
                <div className="flex space-x-1 min-w-max">
                  <button
                    onClick={() => navigateTo('/dashboard', 'scanner')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      activeSection === 'scanner'
                        ? darkMode 
                          ? 'bg-blue-900/40 text-blue-400' 
                          : 'bg-blue-100 text-blue-800'
                        : darkMode 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Scanner</span>
                  </button>
                  
                  <button
                    onClick={() => navigateTo('/dashboard/qr', 'qr-scanner')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      activeSection === 'qr-scanner'
                        ? darkMode 
                          ? 'bg-blue-900/40 text-blue-400' 
                          : 'bg-blue-100 text-blue-800'
                        : darkMode 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                    <span>QR Scanner</span>
                  </button>
                  
                  <button
                    onClick={() => navigateTo('/dashboard/history', 'history')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      activeSection === 'history'
                        ? darkMode 
                          ? 'bg-blue-900/40 text-blue-400' 
                          : 'bg-blue-100 text-blue-800'
                        : darkMode 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <History className="h-4 w-4" />
                    <span>History</span>
                  </button>
                  
                  <button
                    onClick={() => navigateTo('/dashboard/analytics', 'analytics')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      activeSection === 'analytics'
                        ? darkMode 
                          ? 'bg-blue-900/40 text-blue-400' 
                          : 'bg-blue-100 text-blue-800'
                        : darkMode 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </button>
                  
                  <button
                    onClick={() => navigateTo('/dashboard/settings', 'settings')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      activeSection === 'settings'
                        ? darkMode 
                          ? 'bg-blue-900/40 text-blue-400' 
                          : 'bg-blue-100 text-blue-800'
                        : darkMode 
                          ? 'text-gray-300 hover:bg-gray-800' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
              
              {/* Dashboard welcome header */}
              <div className={`mb-6 p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                </h1>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Stay protected from phishing attempts and malicious URLs with PhishGuard's powerful scanning tools.
                </p>
              </div>
              
              {/* Dashboard content */}
              <div className="space-y-6">
                <Routes>
                  <Route path="/" element={<UrlScanner />} />
                  <Route path="/qr" element={<QrScanner />} />
                  <Route path="/history" element={<ScanHistory />} />
                  <Route path="/analytics" element={
                    <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center space-x-2">
                          <PieChart className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Analytics & Insights</h2>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="text-center py-12">
                          <PieChart className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Analytics data will appear here after you've scanned more URLs.
                          </p>
                        </div>
                      </div>
                    </div>
                  } />
                  <Route path="/settings" element={
                    <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center space-x-2">
                          <Settings className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Settings</h2>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Full Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              defaultValue={user?.name}
                              className={`mt-1 block w-full px-3 py-2 rounded-md ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Email Address
                            </label>
                            <input
                              type="email"
                              id="email"
                              defaultValue={user?.email}
                              className={`mt-1 block w-full px-3 py-2 rounded-md ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'border-gray-300 text-gray-900 placeholder-gray-500'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>
                          
                          <div className="pt-4">
                            <button
                              type="button"
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  } />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;