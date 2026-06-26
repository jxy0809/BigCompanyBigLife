/**
 * Leaderboard types
 */

export enum LeaderboardType {
  WEEKLY = 'weekly',
  TOTAL = 'total',
  INDUSTRY = 'industry',
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  nickName: string;
  avatar: string;
  score: number;
  meta?: {
    industry?: string;
    level?: number;
    week?: number;
    money?: number;
  };
  isPlayer?: boolean;
}

export interface LeaderboardData {
  type: LeaderboardType;
  entries: LeaderboardEntry[];
  playerRank?: number;
  playerScore?: number;
  totalPlayers: number;
  updatedAt: string;
}
