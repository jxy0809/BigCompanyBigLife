import React, { memo, useCallback } from 'react';
import { GameEvent, GameStats, EventCategory } from '../types';
import { User, Zap, Lock, ChevronRight, ChevronLeft, ChevronUp } from 'lucide-react';
import { INDUSTRIES } from '../constants';
import { useGestures } from '../hooks/useGestures';
import { soundManager } from '../audio/SoundManager';

interface Props {
  event: GameEvent;
  stats: GameStats;
  onOptionSelect: (optionIndex: number, e: React.MouseEvent) => void;
}

const getEffectPreview = (effectFn: (s: GameStats) => any, stats: GameStats): string => {
  try {
    const e = effectFn(stats);
    const parts: string[] = [];
    if (e.stamina && e.stamina !== 0) parts.push(`体力${e.stamina > 0 ? '+' : ''}${e.stamina}`);
    if (e.sanity && e.sanity !== 0) parts.push(`心智${e.sanity > 0 ? '+' : ''}${e.sanity}`);
    if (e.money && e.money !== 0) parts.push(`金钱${e.money > 0 ? '+' : ''}${e.money}`);
    if (e.risk && e.risk !== 0) parts.push(`风险${e.risk > 0 ? '+' : ''}${e.risk}`);
    if (e.exp && e.exp !== 0) parts.push(`经验${e.exp > 0 ? '+' : ''}${e.exp}`);
    return parts.slice(0, 3).join(' · ') || '效果未知';
  } catch {
    return '效果未知';
  }
};

const EventCard: React.FC<Props> = ({ event, stats, onOptionSelect }) => {
  const indConfig = INDUSTRIES[stats.industry];
  const themeColor = indConfig.theme.primaryColor;
  const isCrisis = event.category === EventCategory.CRISIS;
  const isFortune = event.category === EventCategory.FATE;

  const gestureHandlers = useGestures({
    onSwipeLeft: () => {
      // If there are exactly 2 options, swipe left = select option 1
      if (event.options.length === 2) {
        const validOption = event.options.findIndex((o, i) => !o.requires || o.requires(stats));
        if (validOption === 1) {
          const fakeEvent = { preventDefault: () => {} } as React.MouseEvent;
          onOptionSelect(1, fakeEvent);
        }
      }
    },
    onSwipeRight: () => {
      // Swipe right = select option 0
      const fakeEvent = { preventDefault: () => {} } as React.MouseEvent;
      onOptionSelect(0, fakeEvent);
    },
  });

  return (
    <div className="flex-1 flex flex-col px-3 py-4 animate-fade-in-up max-w-lg mx-auto w-full select-none touch-manipulation" {...gestureHandlers}>
      {/* Sender Info - Mimic Chat */}
      <div className="flex items-end mb-2 space-x-2">
        <div className="w-8 h-8 rounded-full bg-[#3370ff] flex items-center justify-center text-white shrink-0 shadow-sm">
            <User size={16} />
        </div>
        <div className="flex flex-col">
          <div className="text-xs text-[#1f2329] font-medium">部门群消息</div>
          <div className="text-[10px] text-[#8f959e]">{new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
        {/* Industry Tag */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] bg-[#e1eaff] px-1.5 py-0.5 rounded font-medium" style={{ color: themeColor }}>
            {indConfig.name}
          </span>
          {event.rarity && (
            <span className="text-[10px] bg-[#f5f6f7] px-1.5 py-0.5 rounded text-[#8f959e] font-medium">
              {event.rarity}
            </span>
          )}
        </div>
      </div>

      {/* Message Bubble / Card */}
      <div className={`bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border overflow-hidden mb-4 ${isCrisis ? 'border-red-300 shadow-red-100' : isFortune ? 'border-yellow-300 shadow-yellow-100 shadow-lg' : 'border-[#dee0e3]'}`}>
        <div className={`px-3 py-2.5 border-b flex items-center ${isCrisis ? 'bg-red-50 border-red-200' : isFortune ? 'bg-yellow-50 border-yellow-200' : 'bg-[#f5f6f7] border-[#dee0e3]'}`}>
            <Zap size={14} className={`mr-1.5 shrink-0 ${isCrisis ? 'text-red-500' : isFortune ? 'text-yellow-500' : 'text-[#3370ff]'}`} />
            <h3 className="font-bold text-[#1f2329] text-sm line-clamp-2">{event.title}</h3>
        </div>
        <div className="p-3">
          <p className="text-[#1f2329] text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
            {event.description}
          </p>
        </div>
      </div>

      {/* Swipe hint */}
      {event.options.length >= 2 && (
        <div className="flex items-center justify-center gap-2 mb-2 swipe-hint">
          <ChevronLeft size={12} className="text-[#bbbfc4]" />
          <span className="text-[10px] text-[#8f959e]">滑动选择</span>
          <ChevronRight size={12} className="text-[#bbbfc4]" />
        </div>
      )}

      {/* Options - Action Sheet Style with preview badges */}
      <div className="space-y-2">
        {event.options.map((option, index) => {
          const isLocked = option.requires && !option.requires(stats);
          const effectPreview = getEffectPreview(option.effect, stats);

          if (isLocked) {
             return (
               <div key={index} className="w-full bg-[#f5f6f7] p-3 rounded-xl border border-[#dee0e3] opacity-60 flex justify-between items-center cursor-not-allowed min-h-[44px]">
                  <div className="flex-1 min-w-0">
                    <span className="text-[#8f959e] text-sm font-medium text-left block truncate">{option.label}</span>
                    <span className="text-[10px] text-[#bbbfc4] block truncate">条件未达标</span>
                  </div>
                  <Lock size={14} className="text-[#8f959e] shrink-0 ml-2" />
               </div>
             )
          }

          return (
            <button
              key={index}
              onClick={(e) => {
                soundManager.vibrate(10);
                onOptionSelect(index, e);
              }}
              className="w-full bg-white active:bg-[#e1eaff] p-3.5 rounded-xl border border-[#dee0e3] hover:border-[#3370ff] shadow-sm flex items-center transition-all duration-200 group active:scale-[0.98] min-h-[44px]"
            >
              <div className="flex-1 min-w-0 text-left">
                <span className="text-[#1f2329] text-sm font-medium block truncate">{option.label}</span>
                <span className="text-[10px] text-[#8f959e] block truncate mt-0.5">{effectPreview}</span>
              </div>
              <ChevronRight size={16} className="text-[#bbbfc4] group-hover:text-[#3370ff] shrink-0 ml-2 transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default memo(EventCard);
