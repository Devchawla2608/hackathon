import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, AlertCircle, Mic, Download } from 'lucide-react';

const ChatInterface = ({ messages, onSubmitQuery }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedRows, setLoadedRows] = useState(150);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  let recognition = null;

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Speech Recognition is not supported in this browser.");
      return;
    }

    setIsListening(true);
    let recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-GB";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      setIsLoading(true);
      try {
        await onSubmitQuery(input);
      } finally {
        setIsLoading(false);
      }
      setInput('');
    }
  };

  const exportToCSV = (tableData) => {
    const csvContent = "data:text/csv;charset=utf-8," + tableData;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTable = (table) => {
    const rows = table.split('\n');
    const totalRows = rows.length;
    const displayRows = rows.slice(0, loadedRows).join('\n');

    return (
      <div className="mt-4">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-black sticky top-0">
              {/* Table headers */}
            </thead>
            <tbody className="divide-y divide-gray-800">
              <div dangerouslySetInnerHTML={{ __html: displayRows }} />
            </tbody>
          </table>
        </div>
        
        {totalRows > 500 ? (
          <div className="mt-4 text-center">
            <p className="text-gray-400 mb-2">
              Download the file to see more results
            </p>
            <button
              onClick={() => exportToCSV(table)}
              className="inline-flex items-center px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </button>
          </div>
        ) : totalRows > loadedRows ? (
          <button
            onClick={() => setLoadedRows(prev => Math.min(prev + 50, totalRows))}
            className="mt-4 text-gray-400 hover:underline"
          >
            Load more items...
          </button>
        ) : null}
      </div>
    );
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
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isError ? 'bg-red-900 text-red-200' : 'bg-gray-900 text-gray-300'
          }`}>
            {isError ? <AlertCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
        )}
        
        <div className={`max-w-[70%] rounded-lg p-4 ${
          isUser 
            ? 'bg-black text-white border border-gray-800' 
            : isError
              ? 'bg-red-900 text-red-200 border border-red-800'
              : 'bg-gray-900 text-white border border-gray-800'
        }`}>
          {(message?.sqlQuery == message?.content) ? (
            <p className="whitespace-pre-wrap">Here are your results</p>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
          
          {message.sqlQuery && (
            <div className="mt-2">
              <details className="group">
                <summary className="flex items-center justify-between p-2 bg-gray-900 rounded cursor-pointer">
                  <span className="font-medium">SQL Query</span>
                  <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <pre className="mt-1 p-2 bg-black text-gray-300 rounded overflow-x-auto">
                  <code>{message.sqlQuery}</code>
                </pre>
              </details>
            </div>
          )}

          {message.analysisStatement && (
            <pre className="mt-2 p-2 bg-black text-gray-300 rounded overflow-x-auto">
              <code>{message.analysisStatement}</code>
            </pre>
          )}
          
          {message.table && renderTable(message.table)}
          
          {message.chart && (
            <div className="mt-2 h-64 bg-gray-900 rounded-lg p-4">
              <div className="h-full flex items-center justify-center text-gray-400">
                Chart Visualization Placeholder
              </div>
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-300" />
          </div>
        )}
      </div>
    );
  };

  const LoadingMessage = () => (
    <div className="flex gap-3 mb-4 justify-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-900 text-gray-300">
        <Bot className="w-5 h-5" />
      </div>
      <div className="max-w-[70%] rounded-lg p-4 bg-gray-900">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );

  const WelcomeScreen = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center p-6 max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-900 flex items-center justify-center">
          <Bot className="w-8 h-8 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Hello Deepanshu!</h2>
        <p className="text-gray-400 mb-6">
          How can I assist you with your retail database queries today?
        </p>
        <div className="space-y-2">
          <button 
            onClick={() => setInput('Show me top sales')}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white w-full text-left"
          >
            Show me top sales
          </button>
          <button 
            onClick={() => setInput('What are the recent transactions?')}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white w-full text-left"
          >
            What are the recent transactions?
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-black relative">
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 relative"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 && !isLoading && <WelcomeScreen />}
        {messages.map(renderMessage)}
        {isLoading && <LoadingMessage />}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-800 p-4 bg-black">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your data..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-800 bg-gray-900 text-white focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isLoading}
            className={`p-3 rounded-lg transition-colors duration-200 ${
              isListening
                ? 'bg-red-900 hover:bg-red-800 text-white'
                : 'bg-gray-900 hover:bg-gray-800 text-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-black hover:bg-gray-900 disabled:bg-gray-800 text-white rounded-lg transition-colors duration-200 flex items-center justify-center w-12 border border-gray-800"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;