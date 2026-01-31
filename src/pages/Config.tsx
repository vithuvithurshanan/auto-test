import React, { useState } from 'react';
import { Server, Terminal as TerminalIcon, Link2, Github, Gitlab, ShieldCheck } from 'lucide-react';

const Config: React.FC = () => {
    const [ghEnabled, setGhEnabled] = useState(false);
    const [glEnabled, setGlEnabled] = useState(false);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">Automation Settings</h2>
                <p className="text-slate-400">Configure global testing parameters and engine behavior.</p>
            </header>

            <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h4 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                        <Server size={20} className="text-blue-400" />
                        <span>Execution Engine</span>
                    </h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                            <div>
                                <p className="text-slate-200 font-medium">Headless Mode</p>
                                <p className="text-sm text-slate-500">Run tests without a GUI to save resources.</p>
                            </div>
                            <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                                <div className="w-4 h-4 bg-white rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                            <div>
                                <p className="text-slate-200 font-medium">Parallel Execution</p>
                                <p className="text-sm text-slate-500">Run multiple tests simultaneously.</p>
                            </div>
                            <div className="w-12 h-6 bg-slate-800 rounded-full flex items-center px-1 cursor-pointer">
                                <div className="w-4 h-4 bg-slate-600 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h4 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                        <TerminalIcon size={20} className="text-blue-400" />
                        <span>Jenkins Integration</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Jenkins Master URL</label>
                            <input type="text" value="http://jenkins.local:8080" className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-3 rounded-xl outline-none" readOnly />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Workspace Root</label>
                            <input type="text" value="/var/lib/jenkins/workspace" className="w-full bg-slate-950 border border-slate-800 text-slate-300 p-3 rounded-xl outline-none" readOnly />
                        </div>
                    </div>
                </div>

                {/* NEW: Other CI/CD Integrations */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                    <h4 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
                        <Link2 size={20} className="text-blue-400" />
                        <span>External CI/CD Connectors</span>
                    </h4>

                    <div className="space-y-6">
                        {/* GitHub Actions */}
                        <div className={`p-6 rounded-2xl border transition-all ${ghEnabled ? 'bg-slate-950 border-blue-500/50' : 'bg-slate-900/40 border-slate-800'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${ghEnabled ? 'bg-blue-500/10' : 'bg-slate-800'}`}>
                                        <Github size={20} className={ghEnabled ? 'text-blue-400' : 'text-slate-500'} />
                                    </div>
                                    <div>
                                        <p className="text-slate-200 font-semibold">GitHub Actions</p>
                                        <p className="text-xs text-slate-500">Automate via .github/workflows</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setGhEnabled(!ghEnabled)}
                                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${ghEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-800 justify-start'}`}
                                >
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </button>
                            </div>
                            {ghEnabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Personal Access Token</label>
                                        <div className="relative">
                                            <input type="password" value="ghp_************************" className="w-full bg-slate-900 border border-slate-800 text-slate-400 text-sm p-2 rounded-lg outline-none" readOnly />
                                            <ShieldCheck className="absolute right-2 top-2 text-emerald-500" size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Repository</label>
                                        <input type="text" placeholder="owner/repo-name" className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-sm p-2 rounded-lg outline-none" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* GitLab CI */}
                        <div className={`p-6 rounded-2xl border transition-all ${glEnabled ? 'bg-slate-950 border-orange-500/50' : 'bg-slate-900/40 border-slate-800'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${glEnabled ? 'bg-orange-500/10' : 'bg-slate-800'}`}>
                                        <Gitlab size={20} className={glEnabled ? 'text-orange-400' : 'text-slate-500'} />
                                    </div>
                                    <div>
                                        <p className="text-slate-200 font-semibold">GitLab CI/CD</p>
                                        <p className="text-xs text-slate-500">Automate via .gitlab-ci.yml</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setGlEnabled(!glEnabled)}
                                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${glEnabled ? 'bg-orange-600 justify-end' : 'bg-slate-800 justify-start'}`}
                                >
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </button>
                            </div>
                            {glEnabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Runner Registration Token</label>
                                        <div className="relative">
                                            <input type="password" value="glrt-************************" className="w-full bg-slate-900 border border-slate-800 text-slate-400 text-sm p-2 rounded-lg outline-none" readOnly />
                                            <ShieldCheck className="absolute right-2 top-2 text-emerald-500" size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Project ID</label>
                                        <input type="text" placeholder="e.g. 12345678" className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-sm p-2 rounded-lg outline-none" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Config;
