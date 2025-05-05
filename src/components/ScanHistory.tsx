import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Search, ArrowUpDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

type ScanRecord = {
  id: string;
  url: string;
  safe: boolean;
  score: number;
  timestamp: string;
  userId: string;
};

const ScanHistory = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Load user's scan history from localStorage
  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        try {
          // TODO: replace with actual username
          const response = await fetch(`http://localhost:5001/api/history?username=${encodeURIComponent('user')}`);
          // const response = await fetch(`http://localhost:5001/api/history?username=${'user'}`);
          if (!response.ok) throw new Error('Failed to fetch history');
          const data = await response.json();

          const formatted: ScanRecord[] = data.map((entry: any, idx: number) => ({
            id: `${idx}-${entry.timestamp}`,
            url: entry.url,
            score: entry.score,
            safe: entry.score > 70,
            timestamp: entry.timestamp,
            userId: user.id
          }));

          setHistory(formatted);
        } catch (err) {
          console.error('Error fetching history:', err);
        }
      }
    };

    fetchHistory();
  }, [user]);
  // useEffect(() => {
  //   if (user) {
  //     const savedHistory = localStorage.getItem(`phishguard_scan_history_${user.id}`);
  //     if (savedHistory) {
  //       setHistory(JSON.parse(savedHistory));
  //     }
  //   }
  // }, [user]);

  // TODO: no need to do this in here, already did it in UrlScanner.tsx
  // Save scan history to localStorage whenever it changes
  // useEffect(() => {
  //   if (user && history.length > 0) {
  //     localStorage.setItem(`phishguard_scan_history_${user.id}`, JSON.stringify(history));
  //   }
  // }, [history, user]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  const filteredAndSortedHistory = history
    .filter(item => item.url.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Clock className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Scan History</h2>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search URLs"
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          
          <button
            onClick={toggleSortOrder}
            className={`flex items-center space-x-1 px-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
        
        {filteredAndSortedHistory.length > 0 ? (
          <div className="space-y-3">
            {filteredAndSortedHistory.map((item) => (
              <div 
                key={item.id}
                className={`p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors duration-150`}
              >
                <div className="flex items-start space-x-3">
                  <div className="pt-0.5">
                    {item.safe ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <h3 className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.url}
                      </h3>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(item.timestamp)}
                      </div>
                    </div>
                    
                    <div className="mt-1 flex items-center space-x-2">
                      <div 
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.safe
                            ? darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-800'
                            : darkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.safe ? 'Safe' : 'Unsafe'}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Score: {item.score}
                        </span>
                        <div className="w-16 h-1.5 bg-gray-300 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              item.score > 80 ? 'bg-green-500' : 
                              item.score > 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchQuery 
              ? 'No results found for your search.' 
              : 'No scan history available yet.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanHistory;