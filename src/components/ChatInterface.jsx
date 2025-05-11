import React, { useRef, useEffect } from 'react';
import { Send, User, Bot, AlertCircle } from 'lucide-react';

const ChatInterface = ({ messages, onSubmitQuery }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmitQuery(input);
      setInput('');
    }
  };

  const renderMessage = (message) => {
    const isUser = message.role === 'user';
    const isError = message.role === 'error';

    return (
      <div
        key={message.id}
        className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isError ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
          }`}>
            {isError ? <AlertCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
        )}
        
        <div className={`max-w-[70%] rounded-lg p-3 ${
          isUser 
            ? 'bg-indigo-600 text-white' 
            : isError
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
        }`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {message.sqlQuery && (
            <pre className="mt-2 p-2 bg-gray-800 text-gray-200 rounded overflow-x-auto">
              <code>{message.sqlQuery}</code>
            </pre>
          )}
          
          {message.table && (
            <div className="mt-2 overflow-x-auto">
              <div dangerouslySetInnerHTML={{ __html: message.table }} />
            </div>
          )}
          
          {message.chart && (
            <div className="mt-2 h-64 bg-white rounded-lg p-4">
              {/* Chart visualization would go here */}
              <div className="h-full flex items-center justify-center text-gray-500">
                Chart Visualization Placeholder
              </div>
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your data..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;