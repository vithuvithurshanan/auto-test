import React from 'react';
import {
    Terminal as TerminalIcon,
    LayoutDashboard,
    Play,
    Activity,
    Settings
} from 'lucide-react';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    icon, label, active, onClick
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col space-y-8">
            <div className="flex items-center space-x-3 px-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <TerminalIcon className="text-white" size={24} />
                </div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    AutoTest Pro
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                <SidebarItem
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    active={activeTab === 'dashboard'}
                    onClick={() => setActiveTab('dashboard')}
                />
                <SidebarItem
                    icon={<Play size={20} />}
                    label="Run Test"
                    active={activeTab === 'run'}
                    onClick={() => setActiveTab('run')}
                />
                <SidebarItem
                    icon={<Activity size={20} />}
                    label="History"
                    active={activeTab === 'history'}
                    onClick={() => setActiveTab('history')}
                />
                <SidebarItem
                    icon={<Settings size={20} />}
                    label="Config"
                    active={activeTab === 'config'}
                    onClick={() => setActiveTab('config')}
                />
            </nav>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-slate-400 uppercase">System Status</span>
                </div>
                <p className="text-sm text-slate-300">Headless Engine: Online</p>
                <p className="text-xs text-slate-500 mt-1">Jenkins 2.4+ v1.0.3</p>
            </div>
        </aside>
    );
};

export default Sidebar;
