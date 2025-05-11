import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Navigation from './components/Navigation';
import { MessageHistory, TabId } from './types';
import { PanelLeftClose, PanelLeft } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('chat');
  const [messageHistory, setMessageHistory] = useState<MessageHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>(Date.now().toString());
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
  };

  const handleSubmitQuery = async (query: string) => {
    try {
      const newMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: query,
        timestamp: new Date(),
      };

      setMessageHistory(prev => [...prev, newMessage]);

      const response = await fetch(`http://127.0.0.1:8000/get_user_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          chat_history: messageHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const aiResponse = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.output || data.sql_query,
        timestamp: new Date(),
        sqlQuery: data.sql_query,
        table: data.table?.body ? JSON.parse(data.table.body) : null,
        chart: data.response_type === 'visualization' ? data : null,
      };

      setMessageHistory(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('Error:', error);
      setMessageHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'error',
        content: 'Failed to connect to the server. Please ensure it is running at http://127.0.0.1:8000',
        timestamp: new Date(),
      }]);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Header />
        <div className="flex h-[calc(100vh-4rem)]">
          <div 
            className={`fixed inset-y-16 left-0 z-30 w-64 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar
              chats={messageHistory}
              currentChatId={currentChatId}
              onNewChat={handleNewChat}
              onSelectChat={(id) => setCurrentChatId(id)}
            />
          </div>
          
          <button
            onClick={toggleSidebar}
            className="fixed bottom-4 left-4 z-40 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-colors duration-200"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </button>

          <div className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
            <main className="h-[calc(100vh-8rem)] p-4">
              <ChatInterface
                messages={messageHistory}
                onSubmitQuery={handleSubmitQuery}
              />
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;