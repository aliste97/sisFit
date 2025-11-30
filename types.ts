export interface DailyActivity {
  water: boolean;
  workout: boolean;
  diet: boolean;
}

// Map date string (YYYY-MM-DD) to activity
export type ActivityLog = Record<string, DailyActivity>;

export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
  currentPoints: number;
  lifetimePoints: number;
  logs: ActivityLog;
  processedWeeks: string[]; // Tracks weeks where penalties were already calculated (e.g., "2023-42")
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  emoji: string;
  description: string;
  type: 'solo' | 'joint'; // 'joint' rewards use cumulative points
}

export enum Tab {
  DASHBOARD = 'DASHBOARD',
  REWARDS = 'REWARDS',
  COACH = 'COACH'
}