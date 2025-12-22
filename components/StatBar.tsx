import React, { useEffect, useRef, useState } from 'react';
import { GameStats, LEVELS, Location } from '../types';
import { Battery, Brain, Wallet, Briefcase, TrendingUp, AlertCircle, Calendar } from 'lucide-react';

interface Props {
  stats: GameStats;
}

const AnimatedNumber: React.FC<{ value: number; prefix?: string; suffix?: string; colorClass?: string }> = ({ value, prefix = '', suffix = '', colorClass = '' }) => {
    const prevValue = useRef(value);
    const [animClass, setAnimClass] = useState('');

    useEffect(() => {
        if (value > prevValue.current) {
            setAnimClass('text-green-500 scale-110');
        } else if (value < prevValue.current) {
            setAnimClass('text-red-500 scale-110');
        }
        
        const timer = setTimeout(() => {
            setAnimClass('');
            prevValue.current = value;
        }, 500);
        return () => clearTimeout(timer);
    }, [value]);

    return (
        <span className={`transition-all duration-300 inline-block ${animClass} ${colorClass}`}>
            {prefix}{value.toLocaleString()}{suffix}
        </span>
    );
};

const StatBar: React.FC<Props> = ({ stats }) => {
  const currentLevel = LEVELS.find(l => l.id === stats.level) || LEVELS[0];
  const maxStamina = stats.maxStamina; // Use variable max
  const maxSanity = 100;

  // Bankruptcy Warning
  const isDebt = stats.money < 0;

  return (
    <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20 border-b border-[#dee0e3] select-none">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
           <div className={`p-1.5 rounded-lg shadow-sm flex items-center space-x-1 ${stats.isSmallWeek ? 'bg-red-500 text-white' : 'bg-[#3370ff] text-white'}`}>
             <Calendar size={14} />
             <span className="text-[10px] font-bold">{stats.isSmallWeek ? '小周(单休)' : '大周(双休)'}</span>
           </div>
           <div>
             <h2 className="text-sm font-bold text-[#1f2329]">Week {stats.week}/52</h2>
           </div>
        </div>
        <div className="flex flex-col items-end">
             <span className="text-xs font-bold text-[#3370ff] bg-[#e1eaff] px-2 py-0.5 rounded text-right">
              {currentLevel.title}
            </span>
             {isDebt && (
                 <span className="text-[10px] text-red-500 font-bold flex items-center animate-pulse mt-1">
                     <AlertCircle size={10} className="mr-1"/> 欠薪周数 ({stats.debtWeeks}/3)
                 </span>
             )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
         {/* Stamina */}
         <div className="bg-[#f5f6f7] rounded-lg p-2 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between z-10 relative">
               <div className="flex items-center text-[#1f2329] text-xs font-medium">
                  <Battery size={12} className="mr-1 text-[#f54a45]" /> 体力
               </div>
               <AnimatedNumber value={Math.floor(stats.stamina)} colorClass={`text-xs font-bold ${stats.stamina < 20 ? 'text-red-600 animate-pulse' : ''}`} />
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-[#f54a45] transition-all duration-500 rounded-bl-lg rounded-br-lg" style={{ width: `${(Math.max(0, stats.stamina) / maxStamina) * 100}%` }}></div>
         </div>

         {/* Sanity */}
         <div className="bg-[#f5f6f7] rounded-lg p-2 flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between z-10 relative">
               <div className="flex items-center text-[#1f2329] text-xs font-medium">
                  <Brain size={12} className="mr-1 text-[#3370ff]" /> 心智
               </div>
               <AnimatedNumber value={Math.floor(stats.sanity)} colorClass="text-xs font-bold" />
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-[#3370ff] transition-all duration-500 rounded-bl-lg rounded-br-lg" style={{ width: `${(Math.max(0, stats.sanity) / maxSanity) * 100}%` }}></div>
         </div>

         {/* Money */}
         <div className={`rounded-lg p-2 flex flex-col justify-between border ${isDebt ? 'bg-red-50 border-red-200' : 'bg-[#f5f6f7] border-transparent'}`}>
            <div className="flex items-center text-[#1f2329] text-xs font-medium">
               <Wallet size={12} className={`mr-1 ${isDebt ? 'text-red-500' : 'text-[#ffc60a]'}`} /> 资产
            </div>
            <AnimatedNumber value={Math.floor(stats.money)} prefix="¥" colorClass={`text-xs font-bold truncate ${isDebt ? 'text-red-600' : ''}`} />
         </div>
      </div>
    </div>
  );
};

export default StatBar;