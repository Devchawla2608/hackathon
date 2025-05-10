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

function App() {
  const [currentQuery, setCurrentQuery] = useState<SQLQuery | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [tableHTML, setTableHTML] = useState({});
const [conversation, setConversation] = useState<string>('');
const [chart, setChart] = useState<string>('');
const [table, setTable] = useState<string>('');
const [sql, setSql] = useState<string>('');


  const handleSubmitQuery = async (query: string) => {
    // In a real application, this would make an API call to process the query
    // Here we're simulating that with a mock response
    
    // Generate random confidence for demo
    const confidence = 0.7 + Math.random() * 0.25;
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    chatHistory.push({
    role: 'user',
    content: query
  });
    let response = await fetch(`http://127.0.0.1:8000/get_user_data`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({query: query,  
      chat_history: chatHistory
}),
  })
  response = await response.json()
  console.log("response" , response)

    if(response['response_type'] == 'conversation'){
      setConversation(response['output'])
    setTable('')
    setSql('')
    setChart('')
    chatHistory.push({
    role: 'user',
    content: response['output']
  });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));

      return;
    }
    chatHistory.push({
    role: 'user',
    content: response['sql_query']
  });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    setTableHTML(JSON.parse(response['table'].body));
    setTable(response['table'].body)
    setSql(response['sql_query'])
    setConversation('')
    setTimeout(() => {
      const sqlQuery = response['sql_query']
      
      setCurrentQuery({
        id: Math.random().toString(36).substring(2, 9),
        naturalLanguage: query,
        sqlQuery:  sqlQuery,
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
  };

  // Helper function to generate mock SQL based on natural language query
  const generateMockSQL = (query: string): string => {
    if (query.toLowerCase().includes('sales by region')) {
      return `SELECT
  r.name AS region,
  SUM(s.amount) AS total_sales,
  COUNT(DISTINCT s.customer_id) AS customer_count
FROM
  sales_data s
JOIN
  regions r ON s.region = r.id
WHERE
  s.date >= DATEADD(MONTH, -3, CURRENT_DATE())
GROUP BY
  r.name
ORDER BY
  total_sales DESC;`;
    } else if (query.toLowerCase().includes('highest profit')) {
      return `SELECT
  p.name AS product_name,
  p.category,
  SUM(s.amount) AS revenue,
  SUM(s.amount) - SUM(s.cost) AS profit,
  (SUM(s.amount) - SUM(s.cost)) / SUM(s.amount) * 100 AS profit_margin
FROM
  sales_data s
JOIN
  products p ON s.product_id = p.id
WHERE
  s.date >= DATEADD(MONTH, -1, CURRENT_DATE())
GROUP BY
  p.name, p.category
ORDER BY
  profit_margin DESC
LIMIT 10;`;
    } else if (query.toLowerCase().includes('customer')) {
      return `SELECT
  c.name AS customer_name,
  SUM(s.amount) AS total_revenue,
  COUNT(s.id) AS transaction_count,
  AVG(s.amount) AS avg_transaction_value
FROM
  customers c
JOIN
  sales_data s ON c.id = s.customer_id
GROUP BY
  c.name
ORDER BY
  total_revenue DESC
LIMIT 10;`;
    } else {
      return `SELECT
  date_trunc('month', s.date) AS month,
  p.category,
  SUM(s.amount) AS revenue
FROM
  sales_data s
JOIN
  products p ON s.product_id = p.id
WHERE
  s.date >= DATEADD(YEAR, -1, CURRENT_DATE())
GROUP BY
  month, p.category
ORDER BY
  month ASC, revenue DESC;`;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <QuerySection onSubmitQuery={handleSubmitQuery} />
          <ResultsSection tableHTML={tableHTML} query={currentQuery} chartData={chartData} chart={chart} table={table} sql={sql} conversation={conversation} />
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