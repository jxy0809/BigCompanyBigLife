import React from 'react';
import { GameEvent, GameStats } from '../types';
import { User, Zap, Lock } from 'lucide-react';

interface Props {
  event: GameEvent;
  stats: GameStats;
  onOptionSelect: (optionIndex: number, e: React.MouseEvent) => void;
}

const EventCard: React.FC<Props> = ({ event, stats, onOptionSelect }) => {
  return (
    <div className="flex-1 flex flex-col px-4 py-6 animate-fade-in-up max-w-lg mx-auto w-full">
      {/* Sender Info - Mimic Chat */}
      <div className="flex items-end mb-2 space-x-2">
        <div className="w-8 h-8 rounded-full bg-[#3370ff] flex items-center justify-center text-white shrink-0 shadow-sm">
            <User size={16} />
        </div>
        <div className="flex flex-col">
          <div className="text-xs text-[#1f2329] font-medium">部门群消息</div>
          <div className="text-[10px] text-[#8f959e]">{new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
      </div>

      {/* Message Bubble / Card */}
      <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border border-[#dee0e3] overflow-hidden mb-6">
        <div className="px-4 py-3 bg-[#f5f6f7] border-b border-[#dee0e3] flex items-center">
            <Zap size={14} className="text-[#3370ff] mr-2" />
            <h3 className="font-bold text-[#1f2329] text-sm">{event.title}</h3>
        </div>
        <div className="p-4">
          <p className="text-[#1f2329] text-base leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </div>
      </div>

      {/* Options - Action Sheet Style */}
      <div className="space-y-3">
        {event.options.map((option, index) => {
          const isLocked = option.requires && !option.requires(stats);
          if (isLocked) {
             // Optional: Don't show it at all, or show as locked. 
             // Let's show as locked for game feel "Oh I need more EQ"
             return (
               <div key={index} className="w-full bg-[#f5f6f7] p-4 rounded-xl border border-[#dee0e3] opacity-60 flex justify-between items-center cursor-not-allowed">
                  <span className="text-[#8f959e] text-sm font-medium text-left">{option.label} (条件未达标)</span>
                  <Lock size={16} className="text-[#8f959e]" />
               </div>
             )
          }

          return (
            <button
              key={index}
              onClick={(e) => onOptionSelect(index, e)}
              className="w-full bg-white active:bg-[#e1eaff] p-4 rounded-xl border border-[#dee0e3] hover:border-[#3370ff] shadow-sm flex justify-between items-center transition-all duration-200 group active:scale-[0.99]"
            >
              <span className="text-[#1f2329] text-sm font-medium text-left">{option.label}</span>
              <div className="w-5 h-5 rounded-full border border-[#bbb] group-hover:border-[#3370ff] group-active:border-[#3370ff] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3370ff] opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"></div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EventCard;