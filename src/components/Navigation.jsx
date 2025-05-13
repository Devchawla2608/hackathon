import React from 'react';
import { MessageSquare, BarChart2, Database, Settings } from 'lucide-react';

const tabs = [
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics' },
  { id: 'data', icon: Database, label: 'Data' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

const Navigation = ({ activeTab, onTabChange }) => {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="px-4">
        <div className="flex space-x-4">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`
                group relative px-3 py-2 hover:text-indigo-600 dark:hover:text-indigo-400
                ${activeTab === id 
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                  : 'text-gray-500 dark:text-gray-400'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;