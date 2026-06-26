import { useRef, useCallback } from 'react';

interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
}

interface GestureConfig {
  swipeThreshold?: number;
  longPressDelay?: number;
}

export function useGestures(
  handlers: GestureHandlers,
  config: GestureConfig = {}
) {
  const { swipeThreshold = 50, longPressDelay = 500 } = config;

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const moved = useRef(false);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      moved.current = false;
      isLongPress.current = false;

      if (handlers.onLongPress) {
        longPressTimer.current = setTimeout(() => {
          if (!moved.current) {
            isLongPress.current = true;
            handlers.onLongPress?.();
          }
        }, longPressDelay);
      }
    },
    [handlers, longPressDelay]
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      moved.current = true;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (isLongPress.current || !touchStart.current) return;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;
      const dt = Date.now() - touchStart.current.time;

      // Only trigger swipe if fast enough (< 300ms) and moved enough
      if (dt > 300) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > swipeThreshold) {
          if (dx > 0) {
            handlers.onSwipeRight?.();
          } else {
            handlers.onSwipeLeft?.();
          }
        }
      } else {
        if (Math.abs(dy) > swipeThreshold) {
          if (dy > 0) {
            handlers.onSwipeDown?.();
          } else {
            handlers.onSwipeUp?.();
          }
        }
      }

      touchStart.current = null;
    },
    [handlers, swipeThreshold]
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
