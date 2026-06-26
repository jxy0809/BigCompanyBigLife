/**
 * TapTap MCP (Mobile Cloud Platform) Integration
 * Provides high-level API wrappers for TapTap cloud services.
 * P1: Real API integration with retry, error handling, and localStorage fallback.
 */

import { isTapTap } from './environment';

// ── Types ──────────────────────────────────────────────────────────────

interface McpInitResult {
  success: boolean;
  userId?: string;
  error?: string;
}

interface CloudSaveResult {
  success: boolean;
  error?: string;
}

interface CloudLoadResult {
  success: boolean;
  data?: string;
  error?: string;
}

export interface McpLeaderboardEntry {
  rank: number;
  userId: string;
  nickName: string;
  avatar: string;
  score: number;
  meta?: Record<string, unknown>;
}

export interface McpLeaderboardResult {
  success: boolean;
  entries?: McpLeaderboardEntry[];
  playerRank?: number;
  playerScore?: number;
  totalPlayers?: number;
  error?: string;
}

interface SubmitScoreResult {
  success: boolean;
  error?: string;
}

interface ChallengeData {
  eventType: 'achievement' | 'level_up' | 'game_end' | 'industry_unlock';
  data: Record<string, unknown>;
  timestamp: string;
}

interface CommunityPushPayload {
  type: 'achievement' | 'milestone' | 'game_end';
  title: string;
  message: string;
  extra?: Record<string, unknown>;
}

// ── Retry & Network Helpers ────────────────────────────────────────────

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;
const REQUEST_TIMEOUT_MS = 10000;

class TapTapNetworkError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'TapTapNetworkError';
  }
}

class TapTapTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TapTapTokenError';
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = MAX_RETRIES,
  baseDelay = BASE_DELAY_MS,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(fn(), REQUEST_TIMEOUT_MS);
    } catch (err) {
      lastError = err;
      if (err instanceof TapTapTokenError) {
        // Don't retry token errors
        throw err;
      }
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`[TapTapMCP] Retry ${attempt + 1}/${maxRetries} after ${delay}ms:`, err);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TapTapNetworkError('Request timed out')), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── TapTapMCP Class ────────────────────────────────────────────────────

class TapTapMCP {
  private initialized = false;
  private userId: string | null = null;
  private nickName: string | null = null;
  private avatar: string | null = null;

  /**
   * Initialize MCP client.
   * In TapTap environment, calls native SDK init and fetches user profile.
   * In browser/dev, creates a mock session with localStorage device ID.
   */
  async init(): Promise<McpInitResult> {
    if (this.initialized) {
      return { success: true, userId: this.userId ?? undefined };
    }

    try {
      if (isTapTap() && window.TapTap) {
        await withRetry(async () => {
          await window.TapTap!.init({
            clientId: import.meta.env.VITE_TAPTAP_CLIENT_ID || '',
            clientToken: import.meta.env.VITE_TAPTAP_CLIENT_TOKEN || '',
          });
        });
        const user = await withRetry(() => window.TapTap!.getUserProfile());
        this.userId = user.openId;
        this.nickName = user.nickName;
        this.avatar = user.avatar;
        this.initialized = true;
        console.log('[TapTapMCP] Initialized as TapTap user:', user.nickName);
        return { success: true, userId: user.openId };
      } else {
        // Browser fallback
        let deviceId = localStorage.getItem('taptap_device_id');
        if (!deviceId) {
          deviceId = 'browser_' + crypto.randomUUID();
          localStorage.setItem('taptap_device_id', deviceId);
        }
        this.userId = deviceId;
        this.nickName = localStorage.getItem('taptap_nickname') || '你';
        this.initialized = true;
        console.log('[TapTapMCP] Running in browser mode, deviceId:', deviceId);
        return { success: true, userId: deviceId };
      }
    } catch (err) {
      console.error('[TapTapMCP] Init failed:', err);

      // Fallback to browser mode on TapTap init failure
      if (isTapTap()) {
        let deviceId = localStorage.getItem('taptap_device_id');
        if (!deviceId) {
          deviceId = 'taptap_fallback_' + crypto.randomUUID();
          localStorage.setItem('taptap_device_id', deviceId);
        }
        this.userId = deviceId;
        this.nickName = '你';
        this.initialized = true;
        return { success: true, userId: deviceId };
      }

      return { success: false, error: String(err) };
    }
  }

  /**
   * Cloud save. Writes to TapTap cloud, always caches to localStorage.
   * P1: Added retry logic for cloud save.
   */
  async cloudSave(key: string, data: string): Promise<CloudSaveResult> {
    try {
      if (isTapTap() && window.TapTap) {
        await withRetry(async () => {
          await window.TapTap!.cloudSave(JSON.stringify({ key, data }));
        });
      }
      localStorage.setItem(`cloud_${key}`, data);
      return { success: true };
    } catch (err) {
      console.error('[TapTapMCP] Cloud save failed:', err);
      // Still save locally even if cloud fails
      localStorage.setItem(`cloud_${key}`, data);
      return { success: false, error: String(err) };
    }
  }

  /**
   * Cloud load. Reads from TapTap cloud, falls back to localStorage.
   * P1: Added retry logic and proper error handling.
   */
  async cloudLoad(key: string): Promise<CloudLoadResult> {
    try {
      let data: string | null = null;

      if (isTapTap() && window.TapTap) {
        try {
          const result = await withRetry(() => window.TapTap!.cloudLoad());
          if (result) {
            const parsed = JSON.parse(result);
            data = parsed.key === key ? parsed.data : null;
          }
        } catch (err) {
          console.warn('[TapTapMCP] Cloud load failed, using local cache:', err);
        }
      }

      if (!data) {
        data = localStorage.getItem(`cloud_${key}`);
      }

      return { success: true, data: data || undefined };
    } catch (err) {
      console.error('[TapTapMCP] Cloud load failed:', err);
      return { success: false, error: String(err) };
    }
  }

  /**
   * Delete cloud save entry (used when removing game data).
   */
  async cloudDelete(key: string): Promise<CloudSaveResult> {
    try {
      localStorage.removeItem(`cloud_${key}`);
      if (isTapTap() && window.TapTap) {
        await window.TapTap.cloudSave(JSON.stringify({ key, data: '' }));
      }
      return { success: true };
    } catch (err) {
      console.error('[TapTapMCP] Cloud delete failed:', err);
      return { success: false, error: String(err) };
    }
  }

  /**
   * Submit score to leaderboard.
   * P1: Added retry logic.
   */
  async submitScore(
    leaderboardId: string,
    score: number,
    meta?: Record<string, unknown>,
  ): Promise<SubmitScoreResult> {
    try {
      if (isTapTap() && window.TapTap) {
        await withRetry(() => window.TapTap!.submitScore(leaderboardId, score));
      }
      // Always cache locally for fallback display
      const scores = JSON.parse(localStorage.getItem('local_scores') || '{}');
      scores[leaderboardId] = { score, meta, timestamp: Date.now() };
      localStorage.setItem('local_scores', JSON.stringify(scores));

      return { success: true };
    } catch (err) {
      console.error('[TapTapMCP] Submit score failed:', err);
      // Still cache locally
      const scores = JSON.parse(localStorage.getItem('local_scores') || '{}');
      scores[leaderboardId] = { score, meta, timestamp: Date.now() };
      localStorage.setItem('local_scores', JSON.stringify(scores));
      return { success: false, error: String(err) };
    }
  }

  /**
   * Get leaderboard data.
   * P1: In TapTap environment, returns a more realistic leaderboard built from
   *     local score cache. For production, this would call a game server API.
   *     Falls back to local mock data in browser/dev mode.
   */
  async getLeaderboard(
    leaderboardId: string,
    count = 20,
  ): Promise<McpLeaderboardResult> {
    try {
      return this.getLocalLeaderboard(leaderboardId, count);
    } catch (err) {
      console.error('[TapTapMCP] Get leaderboard failed:', err);
      return { success: false, error: String(err) };
    }
  }

  /**
   * Build leaderboard from locally cached scores.
   * Uses a richer mock pool with dynamic player score insertion.
   */
  private getLocalLeaderboard(
    leaderboardId: string,
    count: number,
  ): McpLeaderboardResult {
    const scores = JSON.parse(localStorage.getItem('local_scores') || '{}');
    const playerScore = scores[leaderboardId];

    // Richer mock pool with themed names
    const mockPool: McpLeaderboardEntry[] = [
      { rank: 0, userId: 'mock_1', nickName: '卷王之王', avatar: '', score: 5200, meta: { level: 7, week: 52 } },
      { rank: 0, userId: 'mock_2', nickName: '996战神', avatar: '', score: 4800, meta: { level: 7, week: 48 } },
      { rank: 0, userId: 'mock_3', nickName: '内卷先锋', avatar: '', score: 3500, meta: { level: 6, week: 40 } },
      { rank: 0, userId: 'mock_4', nickName: '职场老鸟', avatar: '', score: 2800, meta: { level: 5, week: 35 } },
      { rank: 0, userId: 'mock_5', nickName: '社畜楷模', avatar: '', score: 2100, meta: { level: 4, week: 28 } },
      { rank: 0, userId: 'mock_6', nickName: '加班狂魔', avatar: '', score: 1600, meta: { level: 3, week: 22 } },
      { rank: 0, userId: 'mock_7', nickName: '职场新人', avatar: '', score: 1100, meta: { level: 2, week: 15 } },
      { rank: 0, userId: 'mock_8', nickName: '摸鱼大师', avatar: '', score: 800, meta: { level: 2, week: 10 } },
      { rank: 0, userId: 'mock_9', nickName: '搬砖达人', avatar: '', score: 500, meta: { level: 1, week: 8 } },
      { rank: 0, userId: 'mock_10', nickName: '打工人代表', avatar: '', score: 300, meta: { level: 1, week: 4 } },
    ];

    const entries = [...mockPool];

    // Insert player score if exists
    if (playerScore && this.userId) {
      const playerEntry: McpLeaderboardEntry = {
        rank: 0,
        userId: this.userId,
        nickName: this.nickName || '你',
        avatar: this.avatar || '',
        score: playerScore.score,
        meta: playerScore.meta,
      };

      // Remove existing entry for this user
      const existingIdx = entries.findIndex((e) => e.userId === this.userId);
      if (existingIdx >= 0) {
        entries.splice(existingIdx, 1);
      }

      entries.push(playerEntry);
    }

    // Sort by score descending, assign ranks
    entries.sort((a, b) => b.score - a.score);
    entries.forEach((e, i) => (e.rank = i + 1));

    const trimmed = entries.slice(0, count);

    return {
      success: true,
      entries: trimmed,
      playerRank: playerScore
        ? trimmed.findIndex((e) => e.userId === this.userId) + 1 || undefined
        : undefined,
      playerScore: playerScore?.score,
      totalPlayers: entries.length,
    };
  }

  // ── Community / Social Features (P1) ──────────────────────────────────

  /**
   * Push a community dynamic (achievement unlock, milestone reached, game end).
   * In browser mode, logs to console. In TapTap, uses the share bridge.
   */
  async pushCommunityDynamic(payload: CommunityPushPayload): Promise<{ success: boolean; error?: string }> {
    try {
      if (isTapTap() && window.TapTap?.share) {
        await window.TapTap.share({
          title: `[${payload.type}] ${payload.title}`,
          text: payload.message,
        });
      }
      // Log for dev/debug
      console.log('[TapTapMCP] Community push:', payload.type, payload.title);
      return { success: true };
    } catch (err) {
      console.error('[TapTapMCP] Community push failed:', err);
      return { success: false, error: String(err) };
    }
  }

  /**
   * Show rating/review prompt.
   * Returns true if user interacted with the prompt.
   */
  async showRatingPrompt(): Promise<{ shown: boolean; rated: boolean }> {
    const RATING_KEY = 'taptap_rating_prompted';
    const RATED_KEY = 'taptap_has_rated';

    // Don't prompt if already rated
    if (localStorage.getItem(RATED_KEY) === 'true') {
      return { shown: false, rated: true };
    }

    // Don't prompt too frequently (once per 3 games)
    const lastPrompted = parseInt(localStorage.getItem(RATING_KEY) || '0', 10);
    const gameCount = parseInt(localStorage.getItem('taptap_game_count') || '0', 10);
    if (Date.now() - lastPrompted < 3 * 24 * 60 * 60 * 1000 || gameCount % 3 !== 0) {
      return { shown: false, rated: false };
    }

    localStorage.setItem(RATING_KEY, String(Date.now()));

    try {
      if (isTapTap() && window.TapTap?.share) {
        await window.TapTap.share({
          title: '觉得大厂风云好玩吗？',
          text: '如果觉得不错，给个五星好评吧！',
        });
      }
      console.log('[TapTapMCP] Rating prompt shown (dev mode)');
      return { shown: true, rated: false };
    } catch (err) {
      console.error('[TapTapMCP] Rating prompt failed:', err);
      return { shown: false, rated: false };
    }
  }

  /**
   * Mark that the user has already rated the game.
   */
  markRated(): void {
    localStorage.setItem('taptap_has_rated', 'true');
  }

  /**
   * Report challenge data to community challenge system.
   * Used for cross-player challenge events.
   */
  async reportChallenge(challengeData: ChallengeData): Promise<{ success: boolean; error?: string }> {
    try {
      // Store challenge data locally for offline resilience
      const challenges = JSON.parse(localStorage.getItem('taptap_challenges') || '[]');
      challenges.push(challengeData);
      // Keep only last 50
      if (challenges.length > 50) {
        challenges.splice(0, challenges.length - 50);
      }
      localStorage.setItem('taptap_challenges', JSON.stringify(challenges));

      if (isTapTap() && window.TapTap?.share) {
        const titles: Record<string, string> = {
          achievement: '解锁了成就',
          level_up: '晋升了！',
          game_end: '结束了本轮游戏',
          industry_unlock: '解锁了新行业',
        };
        await window.TapTap.share({
          title: `${titles[challengeData.eventType] || '动态'}`,
          text: JSON.stringify(challengeData.data),
        });
      }

      console.log('[TapTapMCP] Challenge reported:', challengeData.eventType);
      return { success: true };
    } catch (err) {
      console.error('[TapTapMCP] Challenge report failed:', err);
      return { success: false, error: String(err) };
    }
  }

  /**
   * Increment game count for tracking (used by rating logic).
   */
  incrementGameCount(): void {
    const count = parseInt(localStorage.getItem('taptap_game_count') || '0', 10);
    localStorage.setItem('taptap_game_count', String(count + 1));
  }

  // ── Getters ───────────────────────────────────────────────────────────

  getUserId(): string | null {
    return this.userId;
  }

  getUserNickName(): string | null {
    return this.nickName;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const tapTapMCP = new TapTapMCP();
