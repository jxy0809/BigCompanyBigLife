/**
 * TapTap Ad Client (P1)
 * Manages 4 ad placements, frequency control, cooldown, loading states,
 * and ad-free unlock logic. Delegates actual ad playback to TapAdManager.
 */

import { tapAdManager } from './tapAdManager';

// ── Types ──────────────────────────────────────────────────────────────

export enum AdPlacement {
  /** Weekend bonus: watch ad for extra weekend benefit */
  WEEKEND_BONUS = 'weekend_bonus',
  /** Revive: watch ad to revive from game over (once per game) */
  REVIVE = 'revive',
  /** Double reward: watch ad to double event reward */
  DOUBLE_REWARD = 'double_reward',
  /** Shop discount: watch ad for discount on next shop purchase */
  SHOP_DISCOUNT = 'shop_discount',
}

export enum AdLoadState {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
  SHOWING = 'showing',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  FAILED = 'failed',
}

export interface AdPlacementConfig {
  /** Max times per game session */
  maxPerGame: number;
  /** Cooldown between ad shows (seconds) */
  cooldownSeconds: number;
  /** Enable ad-free bypass rules */
  adFreeThreshold?: number; // Number of watches needed
  /** Description for UI */
  description: string;
}

interface AdSessionState {
  loadState: AdLoadState;
  usedCount: number;
  lastShownAt: number;
  isOnCooldown: boolean;
}

// ── Configuration ──────────────────────────────────────────────────────

const AD_CONFIGS: Record<AdPlacement, AdPlacementConfig> = {
  [AdPlacement.WEEKEND_BONUS]: {
    maxPerGame: 3,
    cooldownSeconds: 120, // 2 minutes between ads
    adFreeThreshold: 5,
    description: '观看广告获得额外周末收益',
  },
  [AdPlacement.REVIVE]: {
    maxPerGame: 1, // Only once per game
    cooldownSeconds: 0, // No cooldown since it's one-time
    description: '观看广告获得复活机会',
  },
  [AdPlacement.DOUBLE_REWARD]: {
    maxPerGame: 2,
    cooldownSeconds: 90,
    adFreeThreshold: 4,
    description: '观看广告将本次事件奖励翻倍',
  },
  [AdPlacement.SHOP_DISCOUNT]: {
    maxPerGame: 2,
    cooldownSeconds: 60,
    adFreeThreshold: 3,
    description: '观看广告获得商店8折优惠',
  },
};

const AD_FREE_DAILY_KEY = 'taptap_adfree_date';
const AD_FREE_WATCH_COUNT_KEY = 'taptap_adfree_watch_count';
const AD_FREE_WATCH_TARGET = 3; // Watch N ads to unlock ad-free for the day

// ── Ad Client ──────────────────────────────────────────────────────────

class TapTapAdClient {
  private initialized = false;
  private sessionStates: Map<AdPlacement, AdSessionState> = new Map();
  private stateListeners: Set<(placement: AdPlacement, state: AdSessionState) => void> = new Set();

  /**
   * Initialize ad SDK.
   * Delegates to TapAdManager for actual SDK initialization.
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // Initialize session states for all placements
    Object.values(AdPlacement).forEach((placement) => {
      this.sessionStates.set(placement, {
        loadState: AdLoadState.IDLE,
        usedCount: 0,
        lastShownAt: 0,
        isOnCooldown: false,
      });
    });

    // Initialize the real TapTap AdManager
    try {
      await tapAdManager.init();
      console.log('[AdClient] TapAdManager 初始化完成');
    } catch (err) {
      console.error('[AdClient] TapAdManager 初始化失败:', err);
    }

    this.initialized = true;
  }

  /**
   * Reset session counters (call when starting a new game).
   */
  resetSession(): void {
    Object.values(AdPlacement).forEach((placement) => {
      this.sessionStates.set(placement, {
        loadState: AdLoadState.IDLE,
        usedCount: 0,
        lastShownAt: 0,
        isOnCooldown: false,
      });
    });
  }

  // ── Ad-Free Logic ────────────────────────────────────────────────────

  /**
   * Check if ad-free is active for today.
   * Ad-free is unlocked when the user watches AD_FREE_WATCH_TARGET ads in a day.
   */
  isAdFreeToday(): boolean {
    const saved = localStorage.getItem(AD_FREE_DAILY_KEY);
    if (!saved) return false;
    const savedDate = new Date(saved).toDateString();
    const today = new Date().toDateString();
    return savedDate === today;
  }

  /**
   * Record an ad watch toward ad-free unlock.
   */
  private recordAdFreeWatch(): void {
    if (this.isAdFreeToday()) return;

    const count = parseInt(localStorage.getItem(AD_FREE_WATCH_COUNT_KEY) || '0', 10) + 1;
    localStorage.setItem(AD_FREE_WATCH_COUNT_KEY, String(count));

    if (count >= AD_FREE_WATCH_TARGET) {
      localStorage.setItem(AD_FREE_DAILY_KEY, new Date().toISOString());
      localStorage.removeItem(AD_FREE_WATCH_COUNT_KEY);
      console.log('[AdClient] Ad-free unlocked for today!');
    }
  }

  /**
   * Get remaining watches to unlock ad-free today.
   */
  getAdFreeProgress(): { remaining: number; total: number } {
    const count = parseInt(localStorage.getItem(AD_FREE_WATCH_COUNT_KEY) || '0', 10);
    return {
      remaining: Math.max(0, AD_FREE_WATCH_TARGET - count),
      total: AD_FREE_WATCH_TARGET,
    };
  }

  // ── State Management ─────────────────────────────────────────────────

  private getState(placement: AdPlacement): AdSessionState {
    return this.sessionStates.get(placement) || {
      loadState: AdLoadState.IDLE,
      usedCount: 0,
      lastShownAt: 0,
      isOnCooldown: false,
    };
  }

  private setState(placement: AdPlacement, update: Partial<AdSessionState>): void {
    const current = this.getState(placement);
    const newState = { ...current, ...update };
    this.sessionStates.set(placement, newState);
    this.stateListeners.forEach((listener) => listener(placement, newState));
  }

  /**
   * Subscribe to ad state changes for a specific placement.
   * Returns unsubscribe function.
   */
  onStateChange(
    callback: (placement: AdPlacement, state: AdSessionState) => void,
  ): () => void {
    this.stateListeners.add(callback);
    return () => {
      this.stateListeners.delete(callback);
    };
  }

  // ── Ad Availability ──────────────────────────────────────────────────

  /**
   * Check if an ad can be shown for the given placement.
   */
  canShowAd(placement: AdPlacement): boolean {
    const config = AD_CONFIGS[placement];
    const state = this.getState(placement);

    // Ad-free today means no ads needed
    if (this.isAdFreeToday()) {
      // Return the benefit without showing actual ad
      return false;
    }

    // Check per-game limit
    if (state.usedCount >= config.maxPerGame) return false;

    // Check cooldown
    if (config.cooldownSeconds > 0) {
      const elapsed = (Date.now() - state.lastShownAt) / 1000;
      if (elapsed < config.cooldownSeconds) return false;
    }

    return true;
  }

  /**
   * Get human-readable reason why ad can't be shown (for UI).
   */
  getUnavailableReason(placement: AdPlacement): string | null {
    if (this.isAdFreeToday()) return '今日已免广告';

    const config = AD_CONFIGS[placement];
    const state = this.getState(placement);

    if (state.usedCount >= config.maxPerGame) {
      return `本局已用完（${config.maxPerGame}/${config.maxPerGame}）`;
    }

    if (config.cooldownSeconds > 0 && state.lastShownAt > 0) {
      const remaining = Math.ceil(
        config.cooldownSeconds - (Date.now() - state.lastShownAt) / 1000,
      );
      if (remaining > 0) return `冷却中 (${remaining}秒)`;
    }

    return null;
  }

  /**
   * Get the current load state for a placement.
   */
  getLoadState(placement: AdPlacement): AdLoadState {
    return this.getState(placement).loadState;
  }

  /**
   * Preload an ad for a placement.
   */
  async preloadAd(placement: AdPlacement): Promise<void> {
    if (!this.canShowAd(placement)) return;

    this.setState(placement, { loadState: AdLoadState.LOADING });

    try {
      // In real TapTap, this would call the native ad load API
      if (isTapTap() && window.TapTap) {
        // Preload is handled by the native SDK
        await sleep(200); // Simulated load time
      } else {
        // Simulate loading in browser
        await sleep(300);
      }
      this.setState(placement, { loadState: AdLoadState.READY });
    } catch (err) {
      console.error(`[AdClient] Failed to preload ad for ${placement}:`, err);
      this.setState(placement, { loadState: AdLoadState.ERROR });
    }
  }

  // ── Show Ad ──────────────────────────────────────────────────────────

  /**
   * Show an ad for the given placement.
   * Delegates to TapAdManager for real ad playback.
   * Returns whether the ad was completed (and reward should be granted).
   */
  async showAd(placement: AdPlacement): Promise<{
    completed: boolean;
    skipped: boolean;
    error?: string;
  }> {
    // If ad-free today, grant reward without showing ad
    if (this.isAdFreeToday()) {
      return { completed: true, skipped: false };
    }

    if (!this.canShowAd(placement)) {
      return { completed: false, skipped: false, error: this.getUnavailableReason(placement) || '不可用' };
    }

    this.setState(placement, {
      loadState: AdLoadState.SHOWING,
      lastShownAt: Date.now(),
    });

    try {
      // Delegate to the real TapAdManager (handles both TapTap and browser simulation)
      const result = await tapAdManager.showRewardedVideo();

      if (result.completed) {
        const state = this.getState(placement);
        this.setState(placement, {
          loadState: AdLoadState.COMPLETED,
          usedCount: state.usedCount + 1,
        });

        // Record toward ad-free unlock
        this.recordAdFreeWatch();

        return { completed: true, skipped: false };
      } else if (result.skipped) {
        this.setState(placement, { loadState: AdLoadState.SKIPPED });
        return { completed: false, skipped: true };
      } else {
        this.setState(placement, { loadState: AdLoadState.FAILED });
        return { completed: false, skipped: false, error: result.error };
      }
    } catch (err) {
      console.error(`[AdClient] Failed to show ad for ${placement}:`, err);
      this.setState(placement, { loadState: AdLoadState.FAILED });
      return { completed: false, skipped: false, error: String(err) };
    }
  }

  /**
   * Show a reward ad and call the reward callback only if completed.
   */
  async showRewardAd(
    placement: AdPlacement,
    onReward: () => void,
    onSkip?: () => void,
    onError?: (error: string) => void,
  ): Promise<void> {
    const result = await this.showAd(placement);
    if (result.completed) {
      onReward();
    } else if (result.skipped) {
      onSkip?.();
    } else if (result.error) {
      onError?.(result.error);
    }
  }

  // ── Utility ──────────────────────────────────────────────────────────

  async destroy(): Promise<void> {
    this.sessionStates.clear();
    this.stateListeners.clear();
    this.initialized = false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const tapTapAdClient = new TapTapAdClient();
