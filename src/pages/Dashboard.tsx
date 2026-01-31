import React from 'react';
import { Activity, CheckCircle2, Clock, ChevronRight, Play } from 'lucide-react';
import { HistoryItem } from '../types';

interface DashboardProps {
    history: HistoryItem[];
    onRequestRun: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ history, onRequestRun }) => {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Platform Overview</h2>
                    <p className="text-slate-400">Manage your Jenkins pipeline and Selenium headless tests.</p>
                </div>
                <button
                    onClick={onRequestRun}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-blue-900/40"
                >
                    <Play size={18} />
                    <span>New Automation Run</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <div className="bg-blue-500/10 p-3 rounded-lg"><Activity className="text-blue-400" size={24} /></div>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">+12%</span>
                    </div>
                    <div>
                        <h3 className="text-slate-400 text-sm font-medium">Total Runs</h3>
                        <p className="text-2xl font-bold text-white">{history.length + 128}</p>
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <div className="bg-emerald-500/10 p-3 rounded-lg"><CheckCircle2 className="text-emerald-400" size={24} /></div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">Avg 98%</span>
                    </div>
                    <div>
                        <h3 className="text-slate-400 text-sm font-medium">Success Rate</h3>
                        <p className="text-2xl font-bold text-white">99.4%</p>
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <div className="bg-purple-500/10 p-3 rounded-lg"><Clock className="text-purple-400" size={24} /></div>
                        <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">Fast</span>
                    </div>
                    <div>
                        <h3 className="text-slate-400 text-sm font-medium">Avg Runtime</h3>
                        <p className="text-2xl font-bold text-white">42s</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="font-semibold text-slate-200">Recent Activity</h3>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">View All</button>
                </div>
                <div className="divide-y divide-slate-800">
                    {history.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <div>
                                    <p className="text-sm font-medium text-slate-200">{item.url}</p>
                                    <p className="text-xs text-slate-500">{item.date} • Headless Selenium</p>
                                </div>
                            </div>
                            <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors"><ChevronRight size={18} /></button>
                        </div>
                    ))}
                    {history.length === 0 && (
                        <div className="p-6 text-center text-slate-500">No recent activity</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
