import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RunTest from './pages/RunTest';
import History from './pages/History';
import Config from './pages/Config';
import { usePipeline } from './hooks/usePipeline';
import { HistoryItem } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Custom hook for pipeline logic
  const pipeline = usePipeline(setHistory);

  // Load history from DB on mount
  useEffect(() => {
    fetch('http://localhost:3001/api/history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
        }
      })
      .catch(err => console.error("Failed to load history:", err));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            history={history}
            onRequestRun={() => setActiveTab('run')}
          />
        )}

        {activeTab === 'run' && (
          <RunTest
            url={pipeline.url}
            setUrl={pipeline.setUrl}
            isTesting={pipeline.isTesting}
            stages={pipeline.stages}
            currentLogs={pipeline.currentLogs}
            result={pipeline.result}
            runPipeline={pipeline.runPipeline}
            handleExportPDF={pipeline.handleExportPDF}
            username={pipeline.username}
            setUsername={pipeline.setUsername}
            password={pipeline.password}
            setPassword={pipeline.setPassword}
            requiresAuth={pipeline.requiresAuth}
            setRequiresAuth={pipeline.setRequiresAuth}
            workflowInstructions={pipeline.workflowInstructions}
            setWorkflowInstructions={pipeline.setWorkflowInstructions}
          />
        )}

        {activeTab === 'history' && (
          <History history={history} />
        )}

        {activeTab === 'config' && (
          <Config />
        )}
      </main>
    </div>
  );
}
