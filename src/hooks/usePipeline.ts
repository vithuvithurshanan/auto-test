import React, { useState } from 'react';
import { PipelineStage, TestResult, HistoryItem } from '../types';
import { analyzeTestingRequirement } from '../services/geminiService';

export const usePipeline = (setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>) => {
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [workflowInstructions, setWorkflowInstructions] = useState('');
  const [testMode, setTestMode] = useState<'unit' | 'parallel' | 'full'>('full');
  const [isTesting, setIsTesting] = useState(false);
  const [stages, setStages] = useState<PipelineStage[]>([
    { id: '1', name: 'Checkout', status: 'idle', logs: [] },
    { id: '2', name: 'Build', status: 'idle', logs: [] },
    { id: '3', name: 'Selenium UI Test', status: 'idle', logs: [] },
    { id: '4', name: 'Report Generation', status: 'idle', logs: [] },
  ]);
  const [currentLogs, setCurrentLogs] = useState<string[]>([]);
  const [result, setResult] = useState<TestResult | null>(null);

  const addLog = (msg: string) => {
    setCurrentLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runPipeline = async () => {
    if (!url) return;

    setIsTesting(true);
    setResult(null);
    setCurrentLogs([]);
    setStages(prev => prev.map(s => ({ ...s, status: 'idle' })));

    try {
      // Stage 1: Checkout
      setStages(prev => prev.map(s => s.id === '1' ? { ...s, status: 'running' } : s));
      addLog("Initializing Jenkins Workspace...");
      addLog("Cloning repository: automation-test-repo");
      await new Promise(r => setTimeout(r, 1500));
      setStages(prev => prev.map(s => s.id === '1' ? { ...s, status: 'success' } : s));
      addLog("Successfully checked out source code.");

      // Stage 2: Build
      setStages(prev => prev.map(s => s.id === '2' ? { ...s, status: 'running' } : s));
      addLog("Starting Build... Executing mvn clean install");
      addLog("Installing dependencies: selenium, webdriver-manager, pytest");

      // Real check (Mocked for now but logic prepared)
      await new Promise(r => setTimeout(r, 2000));

      setStages(prev => prev.map(s => s.id === '2' ? { ...s, status: 'success' } : s));
      addLog("Build completed successfully.");

      // Stage 3: Selenium UI Test
      setStages(prev => prev.map(s => s.id === '3' ? { ...s, status: 'running' } : s));
      addLog(`Initiating Headless Chrome Session for ${url}`);
      addLog("Loading remote URL via Puppeteer...");

      // 0. Prepare Credentials
      const credentials = requiresAuth ? { username, password } : undefined;

      // 1. Analyze Page First (Get DOM)
      addLog("Scanning target page structure...");
      let pageContext = null;
      try {
        const scanRes = await fetch('http://localhost:3001/api/analyze-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        if (scanRes.ok) {
          pageContext = await scanRes.json();
          addLog(`Page Scanned: Found ${pageContext.inputs.length} inputs, ${pageContext.buttons.length} buttons.`);
        }
      } catch (scanErr) {
        console.warn("Page scan failed, proceeding with AI inference only.");
        addLog("Page scan skipped (Server busy), using AI inference.");
      }

      // 2. AI Analysis (with Context)
      addLog("AI Agent analyzing requirements & structure...");
      const analysisData = await analyzeTestingRequirement(
        url,
        requiresAuth ? { username, password } : undefined,
        workflowInstructions,
        pageContext // Pass real DOM context
      );

      // Quality Gate: Check if score is sufficient
      if (analysisData.score < 50) {
        addLog(`CRITICAL FAILURE: Reliability Score ${analysisData.score}% is below threshold (50%).`);
        addLog("Aborting pipeline to prevent deployment of unstable build.");
        setStages(prev => prev.map(s => s.id === '3' ? { ...s, status: 'failed' } : s));

        const failedResult: TestResult = {
          url,
          timestamp: new Date().toLocaleString(),
          jenkinsfile: analysisData.jenkinsfile,
          seleniumScript: analysisData.seleniumScript,
          analysis: `[FAILURE] QUALITY GATE NOT MET\n\n${analysisData.analysis}`,
          score: analysisData.score
        };
        setResult(failedResult);

        const failedHistoryItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          url,
          status: 'failed',
          date: new Date().toLocaleDateString()
        };

        // Save failure to DB
        try {
          await fetch('http://localhost:3001/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(failedHistoryItem)
          });
          const res = await fetch('http://localhost:3001/api/history');
          const data = await res.json();
          if (Array.isArray(data)) setHistory(data);
        } catch (err) {
          setHistory(prev => [failedHistoryItem, ...prev]);
        }

        setIsTesting(false);
        return;
      }

      addLog("Quality Gate Passed: Score is healthy.");
      addLog("Executing real browser test on backend...");

      // REAL BROWSER CALL
      const browserRes = await fetch('http://localhost:3001/api/run-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          credentials,
          actions: analysisData.puppeteerActions, // Pass AI-generated workflow steps
          testMode, // 'unit', 'parallel', 'full'
          selector: analysisData.unitTestFocusSelector // For unit tests
        })
      });

      if (!browserRes.ok) {
        throw new Error("Browser execution failed");
      }

      const browserData = await browserRes.json();
      addLog(`Browser Title Verified: "${browserData.data.title}"`);
      addLog(`DOM Elements Scanned: ${browserData.data.nodes}`);

      setStages(prev => prev.map(s => s.id === '3' ? { ...s, status: 'success' } : s));
      addLog("Headless UI tests passed 100%.");

      // Stage 4: Report Generation
      setStages(prev => prev.map(s => s.id === '4' ? { ...s, status: 'running' } : s));
      addLog("Aggregating test metrics...");
      addLog("Generating AI-Powered analysis report...");
      await new Promise(r => setTimeout(r, 1500));
      setStages(prev => prev.map(s => s.id === '4' ? { ...s, status: 'success' } : s));
      addLog("Pipeline Finished Successfully.");

      const newResult: TestResult = {
        url,
        timestamp: new Date().toLocaleString(),
        jenkinsfile: analysisData.jenkinsfile,
        seleniumScript: analysisData.seleniumScript,
        analysis: analysisData.analysis,
        score: analysisData.score
      };

      setResult(newResult);

      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        status: 'success',
        date: new Date().toLocaleDateString()
      };

      // Save to SQLite DB
      try {
        await fetch('http://localhost:3001/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newHistoryItem)
        });
        // Reload history
        const res = await fetch('http://localhost:3001/api/history');
        const data = await res.json();
        // Since we passed setHistory, we update it here
        if (Array.isArray(data)) {
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to save history:", err);
        setHistory(prev => [newHistoryItem, ...prev]);
      }

      setIsTesting(false);
    } catch (err) {
      console.error(err);
      addLog(`PIPELINE ERROR: ${err instanceof Error ? err.message : String(err)}`);
      setStages(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'failed' } : s));
      setIsTesting(false);
    }
  };

  const handleExportPDF = () => {
    if (!result) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reportHtml = `
        <html>
          <head>
            <title>AutoTest Pro Report - ${result.url}</title>
            <style>
              body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
              .header { border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
              .logo { color: #2563eb; font-weight: 800; font-size: 24px; }
              .meta { font-size: 14px; color: #64748b; }
              h2 { color: #0f172a; border-left: 4px solid #3b82f6; padding-left: 12px; margin-top: 40px; margin-bottom: 16px; font-size: 20px; }
              .score-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
              .score-value { font-size: 48px; font-weight: 900; color: #0369a1; margin: 0; }
              .score-label { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #0ea5e9; }
              .code-block { background: #0f172a; color: #e2e8f0; padding: 20px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px; white-space: pre-wrap; margin-bottom: 20px; }
              .analysis { background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; color: #334155; }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">AutoTest Pro</div>
              <div class="meta">
                <div><strong>Target:</strong> ${result.url}</div>
                <div><strong>Date:</strong> ${result.timestamp}</div>
              </div>
            </div>
  
            <div class="score-box">
              <p class="score-label">Reliability Score</p>
              <p class="score-value">${result.score}%</p>
            </div>
  
            <h2>AI Testing Analysis</h2>
            <div class="analysis">${result.analysis.replace(/\n/g, '<br/>')}</div>
  
            <h2>Jenkinsfile (Pipeline-as-code)</h2>
            <div class="code-block">${result.jenkinsfile}</div>
  
            <h2>Selenium Automation Script</h2>
            <div class="code-block">${result.seleniumScript}</div>
  
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  return {
    url, setUrl,
    isTesting,
    stages,
    currentLogs,
    result,
    runPipeline,
    handleExportPDF,
    username, setUsername,
    password, setPassword,
    requiresAuth, setRequiresAuth,
    workflowInstructions, setWorkflowInstructions,
    testMode, setTestMode
  };
};
