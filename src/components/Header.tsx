import React from 'react';
import { Database, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full py-4 px-6 transition-colors duration-300 bg-black border-b border-gray-800">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-bold text-white">
            SQLVision
          </h1>
        </div>

        <button
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-white" />
          ) : (
            <Sun className="w-5 h-5 text-white" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;