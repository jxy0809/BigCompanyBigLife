/**
 * Leaderboard Client
 * Handles score submission and leaderboard fetching through TapTapMCP.
 * P1: Uses real TapTapMCP API with proper types.
 */

import { tapTapMCP, McpLeaderboardEntry } from '../platform/tapTapMCP';
import { LeaderboardType, LeaderboardData, LeaderboardEntry } from './types';
import { GameStats } from '../types';

const LEADERBOARD_IDS: Record<LeaderboardType, string> = {
  [LeaderboardType.WEEKLY]: 'bigcompany_weekly',
  [LeaderboardType.TOTAL]: 'bigcompany_total',
  [LeaderboardType.INDUSTRY]: 'bigcompany_industry',
};

function computeScore(stats: GameStats): number {
  // Score formula: weeks survived * 100 + money/10 + level * 50
  return Math.floor(stats.week * 100 + stats.money / 10 + stats.level * 50);
}

function convertEntry(entry: McpLeaderboardEntry): LeaderboardEntry {
  return {
    rank: entry.rank,
    userId: entry.userId,
    nickName: entry.nickName,
    avatar: entry.avatar,
    score: entry.score,
    meta: entry.meta as LeaderboardEntry['meta'] | undefined,
  };
}

class LeaderboardClient {
  /**
   * Submit the player's current score to all leaderboards.
   */
  async submitScores(stats: GameStats): Promise<void> {
    const score = computeScore(stats);
    const meta = {
      industry: stats.industry,
      level: stats.level,
      week: stats.week,
      money: Math.floor(stats.money),
    };

    // Submit to all leaderboards in parallel
    await Promise.allSettled([
      tapTapMCP.submitScore(LEADERBOARD_IDS[LeaderboardType.WEEKLY], score, meta),
      tapTapMCP.submitScore(LEADERBOARD_IDS[LeaderboardType.TOTAL], score, meta),
      tapTapMCP.submitScore(
        `${LEADERBOARD_IDS[LeaderboardType.INDUSTRY]}_${stats.industry}`,
        score,
        meta,
      ),
    ]);
  }

  /**
   * Get leaderboard data for a specific type.
   */
  async getLeaderboard(
    type: LeaderboardType,
    industryFilter?: string,
  ): Promise<LeaderboardData> {
    let boardId: string;

    if (type === LeaderboardType.INDUSTRY && industryFilter) {
      boardId = `${LEADERBOARD_IDS[type]}_${industryFilter}`;
    } else {
      boardId = LEADERBOARD_IDS[type];
    }

    const result = await tapTapMCP.getLeaderboard(boardId);

    return {
      type,
      entries: (result.entries || []).map(convertEntry),
      playerRank: result.playerRank,
      playerScore: result.playerScore,
      totalPlayers: result.totalPlayers || 0,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get formatted leaderboard entries with proper ranking.
   */
  formatEntries(
    entries: LeaderboardEntry[],
    playerId: string | null,
  ): LeaderboardEntry[] {
    return entries.map((entry) => ({
      ...entry,
      rank: entry.rank,
      isPlayer: entry.userId === playerId,
    })) as LeaderboardEntry[];
  }
}

export const leaderboardClient = new LeaderboardClient();
