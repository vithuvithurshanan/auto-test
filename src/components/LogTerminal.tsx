import React, { useEffect, useRef } from 'react';

interface Props {
    logs: string[];
}

const LogTerminal: React.FC<Props> = ({ logs }) => {
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div ref={terminalRef} className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
                <span className="text-slate-600 italic">Waiting for pipeline initiation...</span>
            ) : (
                logs.map((log, i) => (
                    <div key={i} className="mb-1">
                        <span className="text-emerald-500 mr-2">➜</span>
                        <span className="text-slate-300">{log}</span>
                    </div>
                ))
            )}
        </div>
    );
};

export default LogTerminal;
