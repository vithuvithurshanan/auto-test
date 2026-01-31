import React from 'react';
import { PipelineStage } from '../types';
import { Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Props {
    stage: PipelineStage;
}

const PipelineStageCard: React.FC<Props> = ({ stage }) => (
    <div className={`p-4 rounded-xl border transition-all ${stage.status === 'running' ? 'border-blue-500 bg-blue-500/10' :
            stage.status === 'success' ? 'border-emerald-500/50 bg-emerald-500/5' :
                stage.status === 'failed' ? 'border-rose-500/50 bg-rose-500/5' :
                    'border-slate-800 bg-slate-900/50 opacity-60'
        }`}>
        <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400">{stage.name}</h4>
            {stage.status === 'running' && <Activity size={16} className="text-blue-400 animate-spin" />}
            {stage.status === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
            {stage.status === 'failed' && <XCircle size={16} className="text-rose-400" />}
            {stage.status === 'idle' && <Clock size={16} className="text-slate-600" />}
        </div>
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${stage.status === 'running' ? 'w-1/2 bg-blue-500 animate-pulse' :
                    stage.status === 'success' ? 'w-full bg-emerald-500' :
                        stage.status === 'failed' ? 'w-full bg-rose-500' :
                            'w-0'
                }`} />
        </div>
    </div>
);

export default PipelineStageCard;
