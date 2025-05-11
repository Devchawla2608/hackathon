import React from 'react';
import { MessageSquare } from 'lucide-react';

const Sidebar = ({ messages }) => {
  const chatGroups = messages.reduce((groups, message) => {
    if (message.role === 'user') {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    }
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(chatGroups).reverse().map(([date, messages]) => (
          <div key={date} className="mb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{date}</div>
            {messages.reverse().map((message) => (
              <div
                key={message.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm">{message.content}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;