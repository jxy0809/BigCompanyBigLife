/**
 * TapTap Environment Detection
 * Detects whether the app is running in TapTap, WeChat, or a standard browser.
 */

export enum PlatformEnv {
  TAPTAP = 'taptap',
  WECHAT = 'wechat',
  BROWSER = 'browser',
}

let detectedEnv: PlatformEnv | null = null;

export function detectPlatform(): PlatformEnv {
  if (detectedEnv) return detectedEnv;

  const ua = navigator.userAgent.toLowerCase();

  // Check for TapTap environment
  if (window.TapTap || ua.includes('taptap')) {
    detectedEnv = PlatformEnv.TAPTAP;
  }
  // Check for WeChat
  else if (ua.includes('micromessenger')) {
    detectedEnv = PlatformEnv.WECHAT;
  }
  // Default to browser
  else {
    detectedEnv = PlatformEnv.BROWSER;
  }

  return detectedEnv;
}

export function isTapTap(): boolean {
  return detectPlatform() === PlatformEnv.TAPTAP;
}

export function isWeChat(): boolean {
  return detectPlatform() === PlatformEnv.WECHAT;
}

export function isBrowser(): boolean {
  return detectPlatform() === PlatformEnv.BROWSER;
}

declare global {
  interface Window {
    TapTap?: TapTapBridge;
  }
}

export interface TapTapBridge {
  /** Initialize SDK */
  init(config: TapTapConfig): Promise<void>;
  /** Get user profile */
  getUserProfile(): Promise<TapTapUser>;
  /** Show leaderboard */
  showLeaderboard(leaderboardId: string): void;
  /** Submit score to leaderboard */
  submitScore(leaderboardId: string, score: number): Promise<void>;
  /** Save data to cloud */
  cloudSave(data: string): Promise<void>;
  /** Load data from cloud */
  cloudLoad(): Promise<string | null>;
  /** Show interstitial ad */
  showInterstitialAd?(): Promise<void>;
  /** Show rewarded ad */
  showRewardedAd?(): Promise<{ success: boolean }>;
  /** Share content */
  share?(content: TapTapShareContent): Promise<void>;
  /** Exit the app */
  exit?(): void;
}

export interface TapTapConfig {
  clientId: string;
  clientToken: string;
  serverUrl?: string;
  isDebug?: boolean;
}

export interface TapTapUser {
  openId: string;
  unionId: string;
  nickName: string;
  avatar: string;
}

export interface TapTapShareContent {
  title: string;
  text: string;
  imageUrl?: string;
  url?: string;
}
