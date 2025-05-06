import { useTheme } from '../contexts/ThemeContext';
import { Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const Analytics = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();

  // State for scan history
  const [history, setHistory] = useState<{ safe: boolean; url: string }[]>([]);

  // Calculate statistics for the pie chart and insights
  const safeCount = history.filter(entry => entry.safe).length;
  const unsafeCount = history.length - safeCount;
  const total = history.length;

  // Function to get insight based on unsafe percentage
  const getInsight = (unsafePercent: number): string => {
    if (total === 0) return `
      <div class="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="text-center">
          <div class="text-gray-400 dark:text-gray-500 mb-2">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p class="text-gray-600 dark:text-gray-300 text-lg">No URLs have been scanned yet</p>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Start scanning URLs to get personalized security insights</p>
        </div>
      </div>`;

    if (unsafeCount === 0) return `
      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6 transform transition-all duration-300 hover:scale-[1.02]">
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-green-100 dark:bg-green-800/50 p-2 rounded-full">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-green-800 dark:text-green-300 text-xl font-bold">Perfect Security Score!</h3>
        </div>
        <p class="text-green-700 dark:text-green-400">Your browsing habits demonstrate excellent security awareness. Continue to verify URLs before clicking and maintain this cautious approach.</p>
      </div>`;

    if (safeCount === 0) return `
      <div class="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6 transform transition-all duration-300 hover:scale-[1.02]">
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-red-100 dark:bg-red-800/50 p-2 rounded-full">
            <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 class="text-red-800 dark:text-red-300 text-xl font-bold">CRITICAL SECURITY ALERT</h3>
        </div>
        <p class="text-red-700 dark:text-red-400">All scanned URLs are unsafe. This suggests you might be visiting high-risk websites. Please review your browsing sources and consider using a security-focused browser extension.</p>
      </div>`;

    if (unsafePercent <= 20) {
      return `
      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-6 transform transition-all duration-300 hover:scale-[1.02]">
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-green-100 dark:bg-green-800/50 p-2 rounded-full">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-green-800 dark:text-green-300 text-xl font-bold">EXCELLENT SECURITY POSTURE</h3>
        </div>
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <p class="text-green-700 dark:text-green-400"><span class="font-bold">${unsafePercent.toFixed(1)}%</span> of your URLs are unsafe, which is well below the average risk level.</p>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <p class="text-green-700 dark:text-green-400">Share your security practices with others and consider enabling additional security features like two-factor authentication.</p>
          </div>
        </div>
      </div>`;
    } else if (unsafePercent <= 40) {
      return `
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6 transform transition-all duration-300 hover:scale-[1.02]">
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-full">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-blue-800 dark:text-blue-300 text-xl font-bold">GOOD SECURITY AWARENESS</h3>
        </div>
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p class="text-blue-700 dark:text-blue-400"><span class="font-bold">${unsafePercent.toFixed(1)}%</span> of your URLs are unsafe, indicating some risky browsing patterns.</p>
          </div>
          <div class="space-y-2">
            <p class="text-blue-700 dark:text-blue-400 font-medium">Key areas to focus on:</p>
            <div class="ml-4 space-y-2">
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <p class="text-blue-600 dark:text-blue-300">Double-check URLs before clicking, especially in emails</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <p class="text-blue-600 dark:text-blue-300">Verify website security certificates</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <p class="text-blue-600 dark:text-blue-300">Consider using a password manager for safer logins</p>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    } else if (unsafePercent <= 60) {
      return `
      <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-6 transform transition-all duration-300 hover:scale-[1.02]">
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-yellow-100 dark:bg-yellow-800/50 p-2 rounded-full">
            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 class="text-yellow-800 dark:text-yellow-300 text-xl font-bold">MODERATE SECURITY RISK</h3>
        </div>
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <p class="text-yellow-700 dark:text-yellow-400"><span class="font-bold">${unsafePercent.toFixed(1)}%</span> of your URLs are unsafe, which is above the recommended threshold.</p>
          </div>
          <div class="space-y-2">
            <p class="text-yellow-700 dark:text-yellow-400 font-medium">Immediate actions recommended:</p>
            <div class="ml-4 space-y-2">
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <p class="text-yellow-600 dark:text-yellow-300">Review your browsing history for patterns in unsafe URLs</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <p class="text-yellow-600 dark:text-yellow-300">Install a reputable security extension</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <p class="text-yellow-600 dark:text-yellow-300">Enable browser security features</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <p class="text-yellow-600 dark:text-yellow-300">Be extra cautious with shortened URLs and redirects</p>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    } else if (unsafePercent <= 80) {
      return `
      <div class="bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 p-6 transform transition-all duration-300 hover:scale-[1.02]">
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-orange-100 dark:bg-orange-800/50 p-2 rounded-full">
            <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 class="text-orange-800 dark:text-orange-300 text-xl font-bold">HIGH SECURITY RISK</h3>
        </div>
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
            <p class="text-orange-700 dark:text-orange-400"><span class="font-bold">${unsafePercent.toFixed(1)}%</span> of your URLs are unsafe, indicating significant exposure to potential threats.</p>
          </div>
          <div class="space-y-2">
            <p class="text-orange-700 dark:text-orange-400 font-medium">Critical recommendations:</p>
            <div class="ml-4 space-y-2">
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                <p class="text-orange-600 dark:text-orange-300">Run a full system security scan</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                <p class="text-orange-600 dark:text-orange-300">Review and update your security software</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                <p class="text-orange-600 dark:text-orange-300">Avoid clicking on suspicious links</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                <p class="text-orange-600 dark:text-orange-300">Consider using a VPN for additional protection</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                <p class="text-orange-600 dark:text-orange-300">Enable browser security features at maximum settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    } else {
      return `
      <div class="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-6 transform transition-all duration-300 hover:scale-[1.02]">
        <div class="flex items-center space-x-3 mb-4">
          <div class="bg-red-100 dark:bg-red-800/50 p-2 rounded-full">
            <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 class="text-red-800 dark:text-red-300 text-xl font-bold">CRITICAL SECURITY RISK</h3>
        </div>
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            <p class="text-red-700 dark:text-red-400"><span class="font-bold">${unsafePercent.toFixed(1)}%</span> of your URLs are unsafe, which is extremely concerning.</p>
          </div>
          <div class="space-y-2">
            <p class="text-red-700 dark:text-red-400 font-medium">Emergency actions required:</p>
            <div class="ml-4 space-y-2">
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <p class="text-red-600 dark:text-red-300">Immediately run a full system security scan</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <p class="text-red-600 dark:text-red-300">Change all passwords, starting with email and financial accounts</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <p class="text-red-600 dark:text-red-300">Enable two-factor authentication everywhere possible</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <p class="text-red-600 dark:text-red-300">Consider using a dedicated security browser</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <p class="text-red-600 dark:text-red-300">Review and update all security software</p>
              </div>
              <div class="flex items-center space-x-2">
                <div class="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <p class="text-red-600 dark:text-red-300">Be extremely cautious with any new links or downloads</p>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    }
  };

  // Fetch user's scan history from backend when user changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        try {
          const response = await fetch(`http://localhost:5001/api/history?username=${encodeURIComponent('user')}`);
          if (!response.ok) throw new Error('Failed to fetch history');
          const data = await response.json();
          setHistory(data.map((entry: any) => ({
            safe: entry.score > 70,
            url: entry.url
          })));
        } catch (err) {
          console.error('Error fetching history:', err);
        }
      }
    };

    fetchHistory();
  }, [user]);

  // Pie chart colors: green for safe, red for unsafe
  const COLORS = ['#4CAF50', '#f44336'];

  // Data for the pie chart
  const pieData = [
    { name: 'Safe', value: safeCount },
    { name: 'Unsafe', value: unsafeCount },
  ];

  // Calculate unsafe percentage for insight
  const unsafePercent = total > 0 ? (unsafeCount / total) * 100 : 0;
  const insight = getInsight(unsafePercent);

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Lightbulb className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Analysis Result</h2>
        </div>
      </div>
      {/* Content */}
      <div className="p-6 flex flex-col items-center">
        {/* Pie chart for safe/unsafe URLs */}
        {total > 0 ? (
          <div style={{ width: 300, height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-6">{insight}</p>
        )}
        {/* Insights section */}
        <div className="p-6 text-center">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white inline-flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            Security Insights
          </h3>
          <div className="max-w-2xl mx-auto">
            <div dangerouslySetInnerHTML={{ __html: insight }} className="prose dark:prose-invert max-w-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;