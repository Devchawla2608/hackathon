import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';

const Sidebar = ({ chats, currentChatId, onNewChat, onSelectChat }) => {
  const chatTitles = chats.reduce((acc, msg) => {
    if (!acc[msg.chatId]) {
      acc[msg.chatId] = msg.content.slice(0, 30) + '...';
    }
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(chatTitles).map(([chatId, title]) => (
          <button
            key={chatId}
            onClick={() => onSelectChat(chatId)}
            className={`
              w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left mb-1 transition-colors duration-200
              ${currentChatId === chatId
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'}
            `}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="truncate">{title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;