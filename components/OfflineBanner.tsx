import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * OfflineBanner - shows a banner when the device is offline.
 * Reconnects automatically when the network comes back.
 */
const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 2500);
    };

    // Initial check
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 flex items-center justify-center gap-2 bg-[#e3f9e9] text-[#00b96b] px-3 py-2 rounded-lg text-xs font-bold shadow-lg animate-slide-up max-w-sm mx-auto">
        <Wifi size={14} />
        网络已恢复
      </div>
    );
  }

  return (
    <div className="fixed top-12 left-0 right-0 z-50">
      <div className="flex items-center justify-center gap-2 bg-[#fff2f0] text-[#f54a45] px-3 py-1.5 text-xs font-bold shadow-sm">
        <WifiOff size={12} />
        当前处于离线状态，部分功能可能受限
      </div>
    </div>
  );
};

export default OfflineBanner;
