import { useTheme } from '../contexts/ThemeContext';
import { Lightbulb } from 'lucide-react';

const Analytics = () => {
  const { darkMode } = useTheme();
  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2">
          <Lightbulb className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Analysis Result</h2>
        </div>
      </div>
    </div>
  );
};

export default Analytics;