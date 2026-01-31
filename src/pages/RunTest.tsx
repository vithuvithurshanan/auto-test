import React from 'react';
import { Globe, Activity, Play, Code2, CheckCircle2, Terminal as TerminalIcon, Download } from 'lucide-react';
import PipelineStageCard from '../components/PipelineStageCard';
import LogTerminal from '../components/LogTerminal';
import { PipelineStage, TestResult } from '../types';

interface RunTestProps {
    url: string;
    setUrl: (url: string) => void;
    isTesting: boolean;
    stages: PipelineStage[];
    currentLogs: string[];
    result: TestResult | null;
    runPipeline: () => void;
    handleExportPDF: () => void;
    username: string;
    setUsername: (u: string) => void;
    password: string;
    setPassword: (p: string) => void;
    requiresAuth: boolean;
    setRequiresAuth: (r: boolean) => void;
    workflowInstructions: string;
    setWorkflowInstructions: (w: string) => void;
    testMode: 'unit' | 'parallel' | 'full';
    setTestMode: (m: 'unit' | 'parallel' | 'full') => void;
}

const RunTest: React.FC<RunTestProps> = ({
    url, setUrl, isTesting, stages, currentLogs, result, runPipeline, handleExportPDF,
    username, setUsername, password, setPassword, requiresAuth, setRequiresAuth,
    workflowInstructions, setWorkflowInstructions, testMode, setTestMode
}) => {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">Automation Console</h2>
                <p className="text-slate-400">Trigger a new end-to-end automation cycle with AI diagnostics.</p>
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                            <Globe size={18} />
                        </div>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter URL to test (e.g., https://example.com)"
                            className="w-full bg-slate-950 border border-slate-700 text-slate-200 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                            disabled={isTesting}
                        />
                    </div>
                </div>

                {/* Workflow Instructions Input */}
                {/* Workflow Instructions Input */}
                <div className="mt-4">
                    <textarea
                        value={workflowInstructions}
                        onChange={(e) => setWorkflowInstructions(e.target.value)}
                        placeholder="Optional: Enter specific workflow steps (e.g., 'Login, click Profile, update name to John')..."
                        className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-sm p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-600 h-[52px] resize-none pt-4"
                        disabled={isTesting}
                    />
                </div>

                {/* Test Mode Selector */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                    {[
                        { id: 'full', label: 'Full E2E Test', desc: 'Complete flow' },
                        { id: 'unit', label: 'Unit Test', desc: 'Component focus' },
                        { id: 'parallel', label: 'Parallel Load', desc: 'Stress test' }
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setTestMode(mode.id as any)}
                            className={`p-4 rounded-xl border transition-all text-left ${testMode === mode.id
                                ? 'bg-blue-600/20 border-blue-500 shadow-blue-900/20'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                }`}
                            disabled={isTesting}
                        >
                            <div className={`font-bold mb-1 ${testMode === mode.id ? 'text-blue-400' : 'text-slate-300'}`}>
                                {mode.label}
                            </div>
                            <div className="text-xs text-slate-500">{mode.desc}</div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-center space-x-3 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3">
                <input
                    type="checkbox"
                    id="auth-toggle"
                    checked={requiresAuth}
                    onChange={(e) => setRequiresAuth(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-slate-900"
                />
                <label htmlFor="auth-toggle" className="text-slate-300 text-sm font-medium cursor-pointer select-none">
                    Requires Authentication?
                </label>
            </div>

            <button
                onClick={runPipeline}
                disabled={isTesting || !url}
                className={`px-8 py-3 rounded-xl font-bold flex items-center justify-center space-x-3 transition-all ${isTesting || !url
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 active:scale-95'
                    }`}
            >
                {isTesting ? (
                    <>
                        <Activity size={18} className="animate-spin" />
                        <span>Pipeline Running...</span>
                    </>
                ) : (
                    <>
                        <Play size={18} />
                        <span>Execute Pipeline</span>
                    </>
                )}
            </button>



            {
                requiresAuth && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 animate-in fade-in slide-in-from-top-2">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Login Credentials</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Username / Email</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="testuser@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Pipeline Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stages.map(stage => (
                    <PipelineStageCard key={stage.id} stage={stage} />
                ))}
            </div>

            {/* Terminal Output */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-200 flex items-center space-x-2">
                        <Code2 size={20} className="text-blue-400" />
                        <span>Jenkins Live Console Logs</span>
                    </h3>
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Standard Output</span>
                </div>
                <LogTerminal logs={currentLogs} />
            </div>

            {/* Results Section */}
            {
                result && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {result.score < 50 ? (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-rose-500 rounded-full p-2 text-white shadow-lg shadow-rose-500/20">
                                        <Activity size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Pipeline Failed</h3>
                                        <p className="text-rose-400/80 font-medium">Quality Gate blocked deployment due to low stability score.</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center px-8 border-l border-rose-500/20">
                                    <span className="text-slate-400 text-xs font-bold uppercase mb-1">Stability Score</span>
                                    <span className="text-3xl font-black text-rose-400">{result.score}%</span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-emerald-500 rounded-full p-2 text-white shadow-lg shadow-emerald-500/20">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Pipeline Success</h3>
                                        <p className="text-emerald-400/80 font-medium">Headless UI tests verified the target environment.</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center px-8 border-l border-emerald-500/20">
                                    <span className="text-slate-400 text-xs font-bold uppercase mb-1">Stability Score</span>
                                    <span className="text-3xl font-black text-emerald-400">{result.score}%</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left: Code Snippets */}
                            <div className="space-y-6">
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                                        <div className="flex items-center space-x-2">
                                            <TerminalIcon size={18} className="text-slate-400" />
                                            <h4 className="font-semibold text-slate-200">Jenkinsfile (Pipeline-as-code)</h4>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-950">
                                        <pre className="text-xs font-mono text-blue-300 overflow-x-auto p-2">
                                            {result.jenkinsfile}
                                        </pre>
                                    </div>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                                        <div className="flex items-center space-x-2">
                                            <Code2 size={18} className="text-slate-400" />
                                            <h4 className="font-semibold text-slate-200">Selenium Script (Python)</h4>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-950">
                                        <pre className="text-xs font-mono text-emerald-300 overflow-x-auto p-2">
                                            {result.seleniumScript}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Right: AI Analysis */}
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                        <Activity size={18} className="text-white" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white">Headless UI Audit Report</h4>
                                </div>

                                <div className="prose prose-invert prose-slate max-w-none">
                                    <div className="text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/50 p-6 rounded-xl border border-slate-800">
                                        {result.analysis}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-800">
                                    <h5 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Next Recommended Steps</h5>
                                    <ul className="space-y-3">
                                        {['Integrate into Github Actions', 'Add Mobile Viewport Testing', 'Setup Performance Benchmarks'].map((step, i) => (
                                            <li key={i} className="flex items-center space-x-3 text-slate-300">
                                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={handleExportPDF}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center space-x-2 active:scale-[0.98]"
                                >
                                    <Download size={20} />
                                    <span>Export Full Report (PDF)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default RunTest;
