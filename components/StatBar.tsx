import React, { memo, useEffect, useRef, useState } from 'react';
import { GameStats, LEVELS, Location } from '../types';
import { INDUSTRIES } from '../constants';
import { Battery, Brain, Wallet, TrendingUp, AlertCircle, Calendar, ChevronDown, Zap, Shield } from 'lucide-react';

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

const BuffIcon: React.FC<{ buff: { name: string; isNegative: boolean; duration: number; description: string } }> = ({ buff }) => {
  return (
    <div 
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
        buff.isNegative ? 'bg-red-100 text-red-700 debuff-flash' : 'bg-green-100 text-green-700 buff-glow'
      }`}
      title={`${buff.name}: ${buff.description} (${buff.duration}周)`}
    >
      {buff.isNegative ? <Shield size={10} /> : <Zap size={10} />}
      <span className="truncate max-w-[60px]">{buff.name}</span>
      <span className="opacity-60">{buff.duration}w</span>
    </div>
  );
};

const StatBar: React.FC<Props> = ({ stats }) => {
  const indConfig = INDUSTRIES[stats.industry];
  const currentLevel = LEVELS.find(l => l.id === stats.level) || LEVELS[0];
  const maxStamina = stats.maxStamina;
  const maxSanity = stats.maxSanity;
  const [expanded, setExpanded] = useState(false);

  const isDebt = stats.money < 0;
  const themeColor = indConfig.theme.primaryColor;

  return (
    <div className="bg-white shadow-sm sticky top-0 z-20 border-b border-[#dee0e3] select-none">
      {/* Main Bar */}
      <div 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2.5 cursor-pointer active:bg-[#f5f6f7] transition-colors"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded); }}
      >
        {/* Top Row: Week + Meta */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-1.5">
             <div className="p-1 rounded shadow-sm flex items-center space-x-0.5 text-white" style={{ backgroundColor: stats.isSmallWeek ? '#f54a45' : themeColor }}>
               <Calendar size={12} />
               <span className="text-[9px] font-bold leading-tight">{stats.isSmallWeek ? '大小周' : '双休'}</span>
             </div>
             <h2 className="text-xs font-bold text-[#1f2329]">W{stats.week}/52</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold bg-[#e1eaff] px-1.5 py-0.5 rounded" style={{ color: themeColor }}>
              {indConfig.text.levelName}{stats.level}
            </span>
            {isDebt && (
              <span className="text-[9px] text-red-500 font-bold flex items-center animate-pulse">
                <AlertCircle size={9} className="mr-0.5"/> 欠({stats.debtWeeks}/3)
              </span>
            )}
            <ChevronDown size={14} className={`text-[#8f959e] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
        
        {/* Three Stat Tiles */}
        <div className="grid grid-cols-3 gap-2">
           {/* Stamina */}
           <div className="bg-[#f5f6f7] rounded-lg p-1.5 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between z-10 relative">
                 <div className="flex items-center text-[#1f2329] text-[10px] font-medium">
                    <Battery size={11} className="mr-0.5 text-[#f54a45]" /> 体力
                 </div>
                 <AnimatedNumber value={Math.floor(stats.stamina)} colorClass={`text-[10px] font-bold ${stats.stamina < 20 ? 'text-red-600 animate-pulse' : ''}`} />
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-[#f54a45] transition-all duration-500 rounded-bl-md rounded-br-md" style={{ width: `${(Math.max(0, stats.stamina) / maxStamina) * 100}%` }}></div>
           </div>

           {/* Sanity */}
           <div className="bg-[#f5f6f7] rounded-lg p-1.5 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between z-10 relative">
                 <div className="flex items-center text-[#1f2329] text-[10px] font-medium">
                    <Brain size={11} className="mr-0.5" style={{ color: themeColor }} /> 心智
                 </div>
                 <AnimatedNumber value={Math.floor(stats.sanity)} colorClass="text-[10px] font-bold" />
              </div>
              <div className="absolute bottom-0 left-0 h-1 transition-all duration-500 rounded-bl-md rounded-br-md" style={{ width: `${(Math.max(0, stats.sanity) / maxSanity) * 100}%`, backgroundColor: themeColor }}></div>
           </div>

           {/* Money */}
           <div className={`rounded-lg p-1.5 flex flex-col justify-between border ${isDebt ? 'bg-red-50 border-red-200' : 'bg-[#f5f6f7] border-transparent'}`}>
              <div className="flex items-center text-[#1f2329] text-[10px] font-medium">
                 <Wallet size={11} className={`mr-0.5 ${isDebt ? 'text-red-500' : 'text-[#ffc60a]'}`} /> 资产
              </div>
              <AnimatedNumber value={Math.floor(stats.money)} suffix={indConfig.text.currency} colorClass={`text-[10px] font-bold truncate ${isDebt ? 'text-red-600' : ''}`} />
           </div>
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-[#f5f6f7] bg-[#fafbfc]">
          {/* Active Buffs */}
          {stats.activeBuffs.length > 0 && (
            <div className="pt-2.5">
              <div className="text-[10px] font-bold text-[#8f959e] mb-1.5 flex items-center gap-1">
                <Zap size={10} /> 当前状态
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stats.activeBuffs.map(buff => (
                  <BuffIcon key={buff.id} buff={buff} />
                ))}
              </div>
            </div>
          )}

          {/* Attribute Quick Glance */}
          <div className="pt-2.5">
            <div className="text-[10px] font-bold text-[#8f959e] mb-1.5 flex items-center gap-1">
              <TrendingUp size={10} /> 能力值
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[
                { label: '技术', val: stats.attributes.tech, color: 'bg-blue-500' },
                { label: '卷度', val: stats.attributes.grind, color: 'bg-gray-500' },
                { label: '健康', val: stats.attributes.health, color: 'bg-red-500' },
                { label: '情商', val: stats.attributes.eq, color: 'bg-orange-500' },
                { label: '运气', val: stats.attributes.luck, color: 'bg-purple-500' },
              ].map(attr => (
                <div key={attr.label} className="text-center">
                  <div className="text-[9px] text-[#8f959e] mb-0.5">{attr.label}</div>
                  <div className="relative h-1 bg-[#f5f6f7] rounded-full overflow-hidden">
                    <div className={`absolute left-0 top-0 h-full ${attr.color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, (attr.val / 25) * 100)}%` }}></div>
                  </div>
                  <div className="text-[9px] font-bold text-[#1f2329] mt-0.5">{attr.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk indicator */}
          <div className={`pt-2.5 flex items-center justify-between ${stats.risk > 50 ? 'risk-breathing rounded-lg px-2 py-1 bg-red-50' : ''}`}>
            <div className="text-[10px] font-bold text-[#8f959e] flex items-center gap-1">
              <AlertCircle size={10} /> 被优化风险
            </div>
            <div className={`text-[11px] font-bold ${stats.risk > 50 ? 'text-red-500' : 'text-green-500'}`}>
              {stats.risk}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(StatBar);
