import { useTheme } from '../contexts/ThemeContext';
import { Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const Analytics = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [history, setHistory] = useState<{ safe: boolean }[]>([]);

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
          setHistory(data.map((entry: any) => ({
            safe: entry.score > 70
          })));
        } catch (err) {
          console.error('Error fetching history:', err);
        }
      }
    };

    fetchHistory();
  }, [user]);

  const safeCount = history.filter(entry => entry.safe).length;
  const unsafeCount = history.length - safeCount;
  const total = history.length;
  const COLORS = ['#4CAF50', '#f44336'];


  const pieData = [
    { name: 'Safe', value: safeCount },
    { name: 'Unsafe', value: unsafeCount },
  ];

  // Generate insights
  let insight = '';
  if (total === 0) {
    insight = 'No URLs have been scanned yet.';
  } else if (unsafeCount === 0) {
    insight = 'All scanned URLs are safe. Great job!';
  } else if (safeCount === 0) {
    insight = 'All scanned URLs are unsafe. Be cautious!';
  } else {
    const unsafePercent = ((unsafeCount / total) * 100).toFixed(1);
    insight = `${unsafePercent}% of your scanned URLs are unsafe. Stay vigilant!`;
  }

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
        <h3 className="text-lg font-semibold mb-2 mt-8">Insights</h3>
        <p>{insight}</p>
      </div>
    </div>
  );
};

export default Analytics;