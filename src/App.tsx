import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import QuerySection from './components/QuerySection';
import ResultsSection from './components/ResultsSection';
import FileUploadSection from './components/FileUploadSection';
import TableSelectorSection from './components/TableSelectorSection';
import TutorialSection from './components/TutorialSection';
import QnASection from './components/QnASection';
import TeamSection from './components/TeamSection';
import { SQLQuery, ChartData } from './types';
import { AlertCircle } from 'lucide-react';

function App() {
  const [currentQuery, setCurrentQuery] = useState<SQLQuery | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [tableHTML, setTableHTML] = useState({});
  const [conversation, setConversation] = useState<string>('');
  const [chart, setChart] = useState<string>('');
  const [table, setTable] = useState<string>('');
  const [sql, setSql] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmitQuery = async (query: string) => {
    try {
      setError(null); // Clear any previous errors
      
      // Generate random confidence for demo
      const confidence = 0.7 + Math.random() * 0.25;
      let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      chatHistory.push({
        role: 'user',
        content: query
      });

      const response = await fetch(`http://127.0.0.1:8000/get_user_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          chat_history: chatHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("response", data);

      if (data['response_type'] === 'conversation') {
        setConversation(data['output']);
        setTable('');
        setSql('');
        setChart('');
        chatHistory.push({
          role: 'user',
          content: data['output']
        });
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        return;
      }

      chatHistory.push({
        role: 'user',
        content: data['sql_query']
      });
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      setTableHTML(JSON.parse(data['table'].body));
      setTable(data['table'].body);
      setSql(data['sql_query']);
      setConversation('');

      setTimeout(() => {
        const sqlQuery = data['sql_query'];
        
        setCurrentQuery({
          id: Math.random().toString(36).substring(2, 9),
          naturalLanguage: query,
          sqlQuery: sqlQuery,
          confidence: confidence,
          timestamp: new Date(),
        });
        
        // Generate mock chart data
        if (query.toLowerCase().includes('sales') || query.toLowerCase().includes('revenue')) {
          setChartData({
            type: 'bar',
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Sales',
                data: [
                  Math.floor(Math.random() * 1000 + 500),
                  Math.floor(Math.random() * 1000 + 500),
                  Math.floor(Math.random() * 1000 + 500),
                  Math.floor(Math.random() * 1000 + 500),
                  Math.floor(Math.random() * 1000 + 500),
                  Math.floor(Math.random() * 1000 + 500),
                ],
                backgroundColor: '#6366F1',
              }
            ]
          });
        } else {
          setChartData(null);
        }
      }, 1500);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to connect to the backend server. Please ensure the server is running at http://127.0.0.1:8000');
      setConversation('');
      setTable('');
      setSql('');
      setChart('');
      setCurrentQuery(null);
      setChartData(null);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}
          <QuerySection onSubmitQuery={handleSubmitQuery} />
          <ResultsSection 
            tableHTML={tableHTML} 
            query={currentQuery} 
            chartData={chartData} 
            chart={chart} 
            table={table} 
            sql={sql} 
            conversation={conversation} 
          />
          <FileUploadSection />
          <TableSelectorSection />
          <TutorialSection />
          <QnASection />
        </main>
        <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 px-4 transition-colors duration-300">
          <div className="container mx-auto text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2025 SQLVision. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;