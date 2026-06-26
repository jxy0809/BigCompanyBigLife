/**
 * TapTap Platform Module
 * Facade that exports all platform-related functionality.
 */

export { detectPlatform, isTapTap, isWeChat, isBrowser, PlatformEnv } from './environment';
export type { TapTapBridge, TapTapConfig, TapTapUser, TapTapShareContent } from './environment';
export { tapTapMCP } from './tapTapMCP';
export type { McpLeaderboardEntry, McpLeaderboardResult } from './tapTapMCP';
export { appLifecycle } from './lifecycle';
