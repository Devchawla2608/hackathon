import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, AlertCircle, Mic, Download } from 'lucide-react';

const ChatInterface = ({ messages, onSubmitQuery }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loadedRows, setLoadedRows] = useState(150);
  const [isExporting, setIsExporting] = useState(false);
  const messagesEndRef = useRef(null);
  let recognition = null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (!recognition) {
      recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => {
          if (!recognition.recognizing) {
            recognition.start();
          }
        }, 4000);
      };
    }

    if (!isListening) {
      setIsListening(true);
      recognition.start();
    } else {
      setIsListening(false);
      recognition.stop();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmitQuery(input);
      setInput('');
    }
  };

  const convertHTMLTableToCSV = (tableHTML) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(tableHTML, 'text/html');
    const rows = doc.querySelectorAll('tr');
    const csvRows = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('th, td');
      const csvRow = Array.from(cells).map(cell => {
        let text = cell.textContent.trim();
        // Escape quotes and wrap in quotes if contains comma
        if (text.includes(',') || text.includes('"')) {
          text = `"${text.replace(/"/g, '""')}"`;
        }
        return text;
      });
      csvRows.push(csvRow.join(','));
    });

    return csvRows.join('\n');
  };

  const exportToCSV = async (tableData) => {
    setIsExporting(true);
    try {
      const csvContent = convertHTMLTableToCSV(tableData);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderTable = (table) => {
    const rows = table.split('\n');
    const totalRows = rows.length;
    const displayRows = rows.slice(0, loadedRows).join('\n');

    return (
      <div className="mt-4">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              {/* Table headers */}
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <div dangerouslySetInnerHTML={{ __html: displayRows }} />
            </tbody>
          </table>
        </div>
        
        {totalRows > 500 ? (
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Download the file to see more results
            </p>
            <button
              onClick={() => exportToCSV(table)}
              disabled={isExporting}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:bg-gray-400"
            >
              {isExporting ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </span>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export to CSV
                </>
              )}
            </button>
          </div>
        ) : totalRows > loadedRows ? (
          <button
            onClick={() => setLoadedRows(prev => Math.min(prev + 50, totalRows))}
            className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
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
          
          {message.table && renderTable(message.table)}
          
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
            type="button"
            onClick={handleVoiceInput}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
          </button>
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

export default ChatInterface