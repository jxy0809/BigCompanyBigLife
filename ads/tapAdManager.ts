/**
 * TapTap 广告管理器
 *
 * 封装 TapTap 小游戏原生广告 SDK（tap.* API），提供：
 * - 激励视频广告（Rewarded Video）——核心功能
 * - 插屏广告（Interstitial）——可选，按需使用
 *
 * 广告位 ID：1054324（竖屏激励视频）
 *
 * 回调模式（与 tap 原生 API 保持一致）:
 * - onReward(): 用户看完广告后获得奖励
 * - 浏览器开发环境自动模拟广告完成
 */

// ── Types ──────────────────────────────────────────────────────────────

export type AdError = {
  errCode?: number;
  errMsg?: string;
};

export type RewardCallback = () => void;

declare const tap: {
  createRewardedVideoAd: (options: { adUnitId: string }) => RewardedVideoAd;
  createInterstitialAd: (options: { adUnitId: string }) => InterstitialAd;
  getSystemInfoSync: () => { screenWidth: number; screenHeight: number };
};

interface RewardedVideoAd {
  onLoad: (cb: () => void) => void;
  onError: (cb: (err: AdError) => void) => void;
  onClose: (cb: (res: { isEnded: boolean }) => void) => void;
  load: () => Promise<void>;
  show: () => Promise<void>;
  destroy: () => void;
}

interface InterstitialAd {
  onLoad: (cb: () => void) => void;
  onError: (cb: (err: AdError) => void) => void;
  onClose: (cb: () => void) => void;
  load: () => Promise<void>;
  show: () => Promise<void>;
  destroy: () => void;
}

// ── Helper ──────────────────────────────────────────────────────────────

function hasTapSDK(): boolean {
  return typeof tap !== 'undefined' && typeof tap.createRewardedVideoAd === 'function';
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── TapAdManager ────────────────────────────────────────────────────────

export class TapAdManager {
  private spaceId = '1054324';
  private rewardedVideoAd: RewardedVideoAd | null = null;
  private interstitialAd: InterstitialAd | null = null;
  private rewardCallback: RewardCallback | null = null;
  private _isInitialized = false;
  private _isReady = false;

  // For browser simulation
  private mockRewardCallback: RewardCallback | null = null;

  get isInitialized() { return this._isInitialized; }
  get isReady() { return this._isReady; }

  /**
   * 初始化广告管理器（主要在游戏启动时调用一次）
   */
  async init(): Promise<void> {
    if (this._isInitialized) return;

    if (!hasTapSDK()) {
      console.log('[TapAdManager] 浏览器/开发模式 - 使用模拟广告');
      this._isInitialized = true;
      this._isReady = true;
      return;
    }

    console.log('[TapAdManager] 初始化 TapTap 广告 SDK，广告位:', this.spaceId);

    try {
      this._initRewardedVideo();
      this._initInterstitial();
      this._isInitialized = true;
      console.log('[TapAdManager] 广告初始化完成');
    } catch (err) {
      console.error('[TapAdManager] 初始化失败:', err);
      throw err;
    }
  }

  /**
   * 绑定奖励回调（用户看完广告后自动调用）
   */
  onReward(callback: RewardCallback): void {
    if (typeof callback !== 'function') {
      console.error('[TapAdManager] onReward 参数必须是函数');
      return;
    }
    this.rewardCallback = callback;

    if (!hasTapSDK()) {
      this.mockRewardCallback = callback;
    }

    console.log('[TapAdManager] 奖励回调已绑定');
  }

  /**
   * 显示激励视频广告
   * 在 TapTap 环境播放真实广告；在浏览器环境模拟 1.5 秒后完成
   *
   * @returns true 表示广告完整看完，可以发放奖励
   */
  async showRewardedVideo(): Promise<{ completed: boolean; skipped: boolean; error?: string }> {
    if (!this._isInitialized) {
      return { completed: false, skipped: false, error: '广告未初始化' };
    }

    // 浏览器/开发模式：模拟广告
    if (!hasTapSDK()) {
      console.log('[TapAdManager] 模拟激励视频广告...');
      await sleep(1500);
      // 80% 概率模拟看完
      if (Math.random() < 0.8) {
        console.log('[TapAdManager] ✅ 模拟广告完整播放');
        this.mockRewardCallback?.();
        return { completed: true, skipped: false };
      } else {
        console.log('[TapAdManager] ⚠️ 模拟用户跳过广告');
        return { completed: false, skipped: true };
      }
    }

    // 真实 TapTap SDK 环境
    if (!this.rewardedVideoAd) {
      return { completed: false, skipped: false, error: '激励视频广告实例未创建' };
    }

    return new Promise((resolve) => {
      let resolved = false;

      const onCloseHandler = (res: { isEnded: boolean }) => {
        if (resolved) return;
        resolved = true;
        if (res.isEnded) {
          console.log('[TapAdManager] ✅ 用户完整观看视频，发放奖励');
          try { this.rewardCallback?.(); } catch (e) { console.error('[TapAdManager] 奖励回调异常:', e); }
          resolve({ completed: true, skipped: false });
        } else {
          console.log('[TapAdManager] ⚠️ 用户提前关闭视频');
          resolve({ completed: false, skipped: true });
        }
      };

      const onErrorHandler = (err: AdError) => {
        if (resolved) return;
        resolved = true;
        console.error('[TapAdManager] 广告出错:', err.errCode, err.errMsg);
        resolve({ completed: false, skipped: false, error: err.errMsg || '广告播放出错' });
      };

      // 重新绑定 onClose/onError（因为上次已消耗）
      if (this.rewardedVideoAd) {
        this.rewardedVideoAd.onClose(onCloseHandler);
        this.rewardedVideoAd.onError(onErrorHandler);
        this.rewardedVideoAd.show().catch((err) => {
          if (!resolved) {
            resolved = true;
            console.error('[TapAdManager] show() 失败:', err);
            resolve({ completed: false, skipped: false, error: String(err) });
          }
        });
      }
    });
  }

  /**
   * 销毁所有广告实例（清理资源）
   */
  destroy(): void {
    try {
      this.rewardedVideoAd?.destroy();
    } catch {}
    try {
      this.interstitialAd?.destroy();
    } catch {}
    this.rewardedVideoAd = null;
    this.interstitialAd = null;
    this.rewardCallback = null;
    this.mockRewardCallback = null;
    this._isInitialized = false;
    this._isReady = false;
    console.log('[TapAdManager] 已销毁');
  }

  // ── Private ──────────────────────────────────────────────────────────

  private _initRewardedVideo(): void {
    console.log('[TapAdManager] 创建激励视频广告实例');

    this.rewardedVideoAd = tap.createRewardedVideoAd({
      adUnitId: this.spaceId,
    });

    this.rewardedVideoAd.onLoad(() => {
      console.log('[TapAdManager] 🎉 激励视频加载成功');
      this._isReady = true;
    });

    this.rewardedVideoAd.onError((err: AdError) => {
      console.error('[TapAdManager] 激励视频加载失败:', err.errCode, err.errMsg);
    });

    // 首次加载
    this.rewardedVideoAd.load().catch((err: Error) => {
      console.error('[TapAdManager] 预加载失败:', err);
    });
  }

  private _initInterstitial(): void {
    console.log('[TapAdManager] 创建插屏广告实例');

    this.interstitialAd = tap.createInterstitialAd({
      adUnitId: this.spaceId,
    });

    this.interstitialAd.onLoad(() => {
      console.log('[TapAdManager] 插屏广告加载成功');
    });

    this.interstitialAd.onError((err: AdError) => {
      console.error('[TapAdManager] 插屏广告加载失败:', err.errCode, err.errMsg);
    });

    this.interstitialAd.load().catch((err: Error) => {
      console.error('[TapAdManager] 插屏预加载失败:', err);
    });
  }
}

// ── Singleton ────────────────────────────────────────────────────────────

export const tapAdManager = new TapAdManager();
