/**
 * App Lifecycle Management
 * Handles platform lifecycle events: launch, pause, resume, exit.
 */

type LifecycleCallback = () => void;

interface LifecycleHandlers {
  onLaunch?: LifecycleCallback;
  onPause?: LifecycleCallback;
  onResume?: LifecycleCallback;
  onExit?: LifecycleCallback;
}

class AppLifecycle {
  private handlers: LifecycleHandlers = {};
  private mounted = false;

  /**
   * Initialize lifecycle listeners.
   * Call this once when the app mounts.
   */
  init(handlers: LifecycleHandlers): void {
    if (this.mounted) return;
    this.handlers = handlers;
    this.mounted = true;

    // Browser visibility change -> pause/resume
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlers.onPause?.();
      } else {
        this.handlers.onResume?.();
      }
    });

    // Window close/beforeunload -> exit
    window.addEventListener('beforeunload', () => {
      this.handlers.onExit?.();
    });

    // Page hide (mobile browser)
    window.addEventListener('pagehide', () => {
      this.handlers.onPause?.();
    });

    // Page show (mobile browser)
    window.addEventListener('pageshow', () => {
      this.handlers.onResume?.();
    });

    // Trigger launch
    this.handlers.onLaunch?.();

    console.log('[Lifecycle] Initialized, platform:', navigator.platform);
  }

  /**
   * Pause lifecycle (manual trigger).
   */
  pause(): void {
    this.handlers.onPause?.();
  }

  /**
   * Resume lifecycle (manual trigger).
   */
  resume(): void {
    this.handlers.onResume?.();
  }

  /**
   * Cleanup lifecycle listeners.
   */
  destroy(): void {
    this.mounted = false;
    this.handlers = {};
  }
}

export const appLifecycle = new AppLifecycle();
