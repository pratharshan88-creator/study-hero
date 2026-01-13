export type RankName = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Legend';

export interface User {
  id: string;
  name: string;
  totalPoints: number;
  currentRank: RankName;
  pin: string; // Stored as string for this demo, in real app should be hash
}

export interface Task {
  id: string;
  subjectName: string;
  estimatedTime: number; // in minutes
  date: string; // ISO date string YYYY-MM-DD
  status: 'pending' | 'completed' | 'failed' | 'waiting_approval';
  actualTime?: number; // in seconds
  approved?: boolean;
}

export interface ScoreLog {
  id: string;
  taskId: string;
  points: number;
  date: string;
}

export interface MonthlyStat {
  month: string; // YYYY-MM
  totalHours: number;
  totalPoints: number;
  rank: RankName;
}

export enum AppView {
  HOME = 'HOME',
  TASK_LIST = 'TASK_LIST',
  TIMER = 'TIMER',
  APPROVAL = 'APPROVAL',
  RANK = 'RANK',
  CERTIFICATES = 'CERTIFICATES',
  SETTINGS = 'SETTINGS'
}

export const RANKS: Record<RankName, { min: number; max: number; color: string }> = {
  Bronze: { min: 0, max: 20, color: 'text-orange-700' },
  Silver: { min: 21, max: 40, color: 'text-slate-400' },
  Gold: { min: 41, max: 60, color: 'text-yellow-500' },
  Diamond: { min: 61, max: 80, color: 'text-cyan-400' },
  Legend: { min: 81, max: 99999, color: 'text-purple-600' },
};
