
export type PipelineStatus = 'idle' | 'running' | 'success' | 'failed';

export interface PipelineStage {
  id: string;
  name: string;
  status: PipelineStatus;
  logs: string[];
}

export interface TestResult {
  url: string;
  timestamp: string;
  jenkinsfile: string;
  seleniumScript: string;
  analysis: string;
  score: number;
}

export interface HistoryItem {
  id: string;
  url: string;
  status: PipelineStatus;
  date: string;
}
