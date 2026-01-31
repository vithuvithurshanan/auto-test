import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryProps {
    history: HistoryItem[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-white mb-2">Build History</h2>
                <p className="text-slate-400">Archived logs and results from previous automation cycles.</p>
            </header>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900/80 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Target URL</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Engine</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {(history.length > 0 ? history : [
                            { id: '1', url: 'https://demo-shop.io', status: 'success', date: 'Oct 24, 2023' } as HistoryItem,
                            { id: '2', url: 'https://staging.corporate.com', status: 'success', date: 'Oct 22, 2023' } as HistoryItem,
                            { id: '3', url: 'https://beta.app.net', status: 'failed', date: 'Oct 19, 2023' } as HistoryItem,
                        ]).map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2 text-slate-200">
                                        <Globe size={14} className="text-slate-500" />
                                        <span className="font-medium">{item.url}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-sm">Headless Chrome / Jenkins</td>
                                <td className="px-6 py-4 text-slate-400 text-sm">{item.date}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-400 hover:text-blue-300 p-2"><ExternalLink size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;
