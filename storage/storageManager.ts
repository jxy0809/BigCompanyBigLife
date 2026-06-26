/**
 * Storage Manager
 * Unified storage API with cloud-first, localStorage-fallback strategy.
 * Replaces direct localStorage calls in App.tsx.
 */

import { tapTapMCP } from '../platform/tapTapMCP';
import { GameStats, MetaData } from '../types';

const SAVE_KEY = 'industry_survival_v1';
const META_KEY = 'industry_meta_v1';

interface StorageResult<T> {
  data: T | null;
  fromCloud: boolean;
}

/**
 * Safely write to localStorage, handling QuotaExceededError.
 * Returns true if write succeeded, false if quota was exceeded.
 */
function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    if (err instanceof DOMException && (
      err.name === 'QuotaExceededError' ||
      err.code === 22 || // Firefox
      err.code === 1014  // Older Firefox
    )) {
      console.warn('[Storage] localStorage quota exceeded, attempting cleanup');
      // Try to free space by removing old data
      const keysToRemove = [
        'cloud_industry_survival_v1',
        'cloud_industry_meta_v1',
        'local_scores',
        'taptap_challenges',
      ];
      keysToRemove.forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });
      // Retry write
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        console.error('[Storage] localStorage still full after cleanup');
        return false;
      }
    }
    console.error('[Storage] localStorage write failed:', err);
    return false;
  }
}

class StorageManager {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    await tapTapMCP.init();
    this.initialized = true;
  }

  /**
   * Save game state. Cloud-first, then localStorage cache.
   */
  async saveGame(stats: GameStats): Promise<void> {
    const data = JSON.stringify(stats);
    // Write to cloud (non-blocking)
    tapTapMCP.cloudSave(SAVE_KEY, data).catch((err) => {
      console.warn('[Storage] Cloud save failed, using local only:', err);
    });
    // Always write to localStorage as cache
    safeLocalStorageSet(SAVE_KEY, data);
  }

  /**
   * Load game state. Tries cloud first, falls back to localStorage.
   */
  async loadGame(): Promise<StorageResult<GameStats>> {
    // Try cloud first
    const cloudResult = await tapTapMCP.cloudLoad(SAVE_KEY);
    if (cloudResult.success && cloudResult.data) {
      try {
        const parsed = JSON.parse(cloudResult.data);
        if (parsed && parsed.week > 0) {
          // Sync localStorage cache
          safeLocalStorageSet(SAVE_KEY, cloudResult.data);
          return { data: parsed, fromCloud: true };
        }
      } catch {
        console.warn('[Storage] Failed to parse cloud game data');
      }
    }

    // Fallback to localStorage
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.week > 0) {
          return { data: parsed, fromCloud: false };
        }
      } catch {
        console.error('[Storage] Failed to parse local game data');
      }
    }

    return { data: null, fromCloud: false };
  }

  /**
   * Remove game save (called on game end).
   */
  async removeGame(): Promise<void> {
    localStorage.removeItem(SAVE_KEY);
    // Also remove from cloud
    tapTapMCP.cloudDelete(SAVE_KEY).catch(() => {});
  }

  /**
   * Save meta data (career points, history, etc.).
   */
  async saveMeta(meta: MetaData): Promise<void> {
    const data = JSON.stringify(meta);
    tapTapMCP.cloudSave(META_KEY, data).catch(() => {});
    safeLocalStorageSet(META_KEY, data);
  }

  /**
   * Load meta data.
   */
  async loadMeta(): Promise<StorageResult<MetaData>> {
    const cloudResult = await tapTapMCP.cloudLoad(META_KEY);
    if (cloudResult.success && cloudResult.data) {
      try {
        const parsed = JSON.parse(cloudResult.data);
        safeLocalStorageSet(META_KEY, cloudResult.data);
        return { data: parsed, fromCloud: true };
      } catch {
        console.warn('[Storage] Failed to parse cloud meta data');
      }
    }

    const saved = localStorage.getItem(META_KEY);
    if (saved) {
      try {
        return { data: JSON.parse(saved), fromCloud: false };
      } catch {
        console.error('[Storage] Failed to parse local meta data');
      }
    }

    return { data: null, fromCloud: false };
  }
}

export const storageManager = new StorageManager();
