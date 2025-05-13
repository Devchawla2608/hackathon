import React from 'react';
import { MessageSquare, PlusCircle } from 'lucide-react';

const Sidebar = ({ messages, onNewChat }) => {
  const firstUserMessage = messages.find(message => message.role === 'user');
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {firstUserMessage && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300">
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span className="truncate text-sm">{firstUserMessage.content}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;