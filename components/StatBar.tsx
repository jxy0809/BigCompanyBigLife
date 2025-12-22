import React from 'react';
import { GameStats, LEVELS } from '../types';
import { Battery, Brain, Wallet, Briefcase } from 'lucide-react';

interface Props {
  stats: GameStats;
}

const StatBar: React.FC<Props> = ({ stats }) => {
  const currentLevel = LEVELS.find(l => l.id === stats.level) || LEVELS[0];

  return (
    <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20 border-b border-[#dee0e3]">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
           <div className="bg-[#3370ff] text-white p-1.5 rounded-lg shadow-sm">
             <Briefcase size={16} />
           </div>
           <div>
             <h2 className="text-sm font-bold text-[#1f2329]">Day {stats.days}</h2>
             <p className="text-xs text-[#646a73]">目标: 365天</p>
           </div>
        </div>
        <div className="flex flex-col items-end">
             <span className="text-xs font-bold text-[#3370ff] bg-[#e1eaff] px-2 py-0.5 rounded text-right">
              {currentLevel.title}
            </span>
             <span className="text-[10px] text-[#8f959e] mt-0.5">距离下一级 {Math.max(0, (stats.level * 100) - stats.exp)} XP</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
         {/* Stamina */}
         <div className="bg-[#f5f6f7] rounded-lg p-2 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between z-10 relative">
               <div className="flex items-center text-[#1f2329] text-xs font-medium">
                  <Battery size={12} className="mr-1 text-[#f54a45]" /> 体力
               </div>
               <span className="text-xs font-bold">{stats.stamina}</span>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-[#f54a45] transition-all duration-500 rounded-bl-lg rounded-br-lg" style={{ width: `${stats.stamina}%` }}></div>
         </div>

         {/* Sanity */}
         <div className="bg-[#f5f6f7] rounded-lg p-2 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between z-10 relative">
               <div className="flex items-center text-[#1f2329] text-xs font-medium">
                  <Brain size={12} className="mr-1 text-[#3370ff]" /> 心智
               </div>
               <span className="text-xs font-bold">{stats.sanity}</span>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-[#3370ff] transition-all duration-500 rounded-bl-lg rounded-br-lg" style={{ width: `${stats.sanity}%` }}></div>
         </div>

         {/* Money */}
         <div className="bg-[#f5f6f7] rounded-lg p-2 flex flex-col justify-between">
            <div className="flex items-center text-[#1f2329] text-xs font-medium">
               <Wallet size={12} className="mr-1 text-[#ffc60a]" /> 资产
            </div>
            <span className="text-xs font-bold mt-1 truncate">¥{stats.money.toLocaleString()}</span>
         </div>
      </div>
    </div>
  );
};

export default StatBar;