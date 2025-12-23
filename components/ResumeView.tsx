
import React from 'react';
import { GameStats, LEVELS, IndustryType } from '../types';
import { INDUSTRIES } from '../constants';
import { Shield, Smile, Cpu, Heart, Sparkles, User, Medal, Users, Zap, LogOut } from 'lucide-react';

interface Props {
  stats: GameStats;
  onRetire?: () => void;
}

const RadarChart: React.FC<{ attributes: GameStats['attributes'], color: string }> = ({ attributes, color }) => {
    const size = 200;
    const center = size / 2;
    const radius = 70;
    const stats = [
        { key: 'tech', label: 'Tech', val: attributes.tech },
        { key: 'grind', label: 'Grind', val: attributes.grind },
        { key: 'health', label: 'Health', val: attributes.health },
        { key: 'luck', label: 'Luck', val: attributes.luck },
        { key: 'eq', label: 'EQ', val: attributes.eq },
    ];
    
    // Normalize values (assuming max ~25 for display scaling)
    const points = stats.map((stat, i) => {
        const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2;
        const val = Math.min(25, stat.val) / 25;
        const x = center + Math.cos(angle) * radius * val;
        const y = center + Math.sin(angle) * radius * val;
        return `${x},${y}`;
    }).join(' ');

    const bgPoints = stats.map((_, i) => {
        const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="flex justify-center my-4">
            <svg width={size} height={size} className="overflow-visible">
                {/* Background Web */}
                <polygon points={bgPoints} fill="#f5f6f7" stroke="#dee0e3" strokeWidth="1" />
                {[0.25, 0.5, 0.75].map(scale => {
                     const p = stats.map((_, i) => {
                        const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2;
                        const x = center + Math.cos(angle) * radius * scale;
                        const y = center + Math.sin(angle) * radius * scale;
                        return `${x},${y}`;
                    }).join(' ');
                    return <polygon key={scale} points={p} fill="none" stroke="#dee0e3" strokeWidth="1" strokeDasharray="4 4" />
                })}
                
                {/* Data Blob */}
                <polygon points={points} fill={`${color}33`} stroke={color} strokeWidth="2" />
                
                {/* Labels */}
                {stats.map((stat, i) => {
                    const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2;
                    // Push labels out a bit
                    const labelRadius = radius + 20; 
                    const x = center + Math.cos(angle) * labelRadius;
                    const y = center + Math.sin(angle) * labelRadius;
                    return (
                        <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[10px] fill-[#646a73] font-bold">
                            {stat.label}
                        </text>
                    )
                })}
            </svg>
        </div>
    )
}

const RelationBar: React.FC<{ label: string; role: string; value: number; color: string }> = ({ label, role, value, color }) => (
    <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
            <span className="text-[#646a73]">{label} <span className="opacity-50">({role})</span></span>
            <span className="font-bold text-[#1f2329]">{value}/100</span>
        </div>
        <div className="h-2 bg-[#f5f6f7] rounded-full overflow-hidden">
            <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }}></div>
        </div>
    </div>
);

const ResumeView: React.FC<Props> = ({ stats, onRetire }) => {
  const indConfig = INDUSTRIES[stats.industry];
  const currentLevel = LEVELS.find(l => l.id === stats.level) || LEVELS[0];
  const themeColor = indConfig.theme.primaryColor;

  const StatRow = ({ label, value, icon: Icon, color }: any) => (
    <div className="flex items-center justify-between py-2 border-b border-[#f5f6f7] last:border-0">
       <div className="flex items-center">
          <div className={`p-1.5 rounded mr-3 ${color.bg}`}>
             <Icon size={14} className={color.text} />
          </div>
          <span className="text-xs text-[#1f2329] font-medium">{label}</span>
       </div>
       <span className="font-bold text-sm text-[#1f2329]">{value}</span>
    </div>
  );

  return (
    <div className="p-4 space-y-4 animate-fade-in-up pb-24">
       {/* Header Card */}
       <div className="bg-white rounded-xl p-6 shadow-sm border border-[#dee0e3] text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md z-10 relative" style={{backgroundColor: themeColor}}>
             <User size={32} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#1f2329]">{indConfig.text.levelName}{currentLevel.id} {indConfig.name}从业者</h2>
          <p className="text-[#646a73] text-xs mt-1">入职第 {stats.week} 周</p>
          
          <div className="mt-4 bg-[#f5f6f7] rounded-full h-1.5 overflow-hidden relative">
             <div 
               className="absolute left-0 top-0 h-full" 
               style={{ width: `${Math.min(100, (stats.exp / (stats.level * 100)) * 100)}%`, backgroundColor: themeColor }}
             ></div>
          </div>
          <div className="flex justify-between text-[10px] text-[#8f959e] mt-1">
             <span>Exp: {stats.exp}</span>
             <span>Next: {stats.level * 100}</span>
          </div>
       </div>

       {/* Active Buffs */}
       {stats.activeBuffs.length > 0 && (
           <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dee0e3]">
             <h3 className="text-xs font-bold text-[#646a73] mb-3 uppercase tracking-wider flex items-center">
                 <Zap size={14} className="mr-1" /> 当前状态
             </h3>
             <div className="space-y-2">
                 {stats.activeBuffs.map(buff => (
                     <div key={buff.id} className={`flex justify-between items-center p-2 rounded-lg ${buff.isNegative ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                         <div>
                             <div className="text-xs font-bold">{buff.name}</div>
                             <div className="text-[10px] opacity-80">{buff.description}</div>
                         </div>
                         <div className="text-xs font-bold">{buff.duration}周</div>
                     </div>
                 ))}
             </div>
           </div>
       )}

       {/* NPC Relations */}
       <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dee0e3]">
          <h3 className="text-xs font-bold text-[#646a73] mb-3 uppercase tracking-wider flex items-center">
             <Users size={14} className="mr-1" /> 职场人脉
          </h3>
          <RelationBar label={indConfig.npcs.boss.name} role={indConfig.npcs.boss.role} value={stats.relationships.boss} color="bg-orange-500" />
          <RelationBar label={indConfig.npcs.colleague.name} role={indConfig.npcs.colleague.role} value={stats.relationships.colleague} color="bg-blue-500" />
          <RelationBar label={indConfig.npcs.hr.name} role={indConfig.npcs.hr.role} value={stats.relationships.hr} color="bg-pink-500" />
       </div>

       {/* Radar Chart */}
       <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dee0e3]">
          <h3 className="text-xs font-bold text-[#646a73] mb-2 uppercase tracking-wider">能力雷达</h3>
          <RadarChart attributes={stats.attributes} color={themeColor} />
          <div className="grid grid-cols-2 gap-x-4">
            <StatRow label="Tech" value={stats.attributes.tech} icon={Cpu} color={{bg: 'bg-blue-100', text: 'text-blue-500'}} />
            <StatRow label="Grind" value={stats.attributes.grind} icon={Shield} color={{bg: 'bg-gray-100', text: 'text-gray-600'}} />
            <StatRow label="Health" value={stats.attributes.health} icon={Heart} color={{bg: 'bg-red-100', text: 'text-red-500'}} />
            <StatRow label="EQ" value={stats.attributes.eq} icon={Smile} color={{bg: 'bg-orange-100', text: 'text-orange-500'}} />
            <StatRow label="Luck" value={stats.attributes.luck} icon={Sparkles} color={{bg: 'bg-purple-100', text: 'text-purple-500'}} />
          </div>
       </div>

       {/* Financials */}
       <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dee0e3]">
           <h3 className="text-xs font-bold text-[#646a73] mb-2 uppercase tracking-wider">财务状况</h3>
           <div className="flex justify-between mb-2">
               <span className="text-sm text-[#646a73]">当前周薪</span>
               <span className="text-sm font-bold text-[#1f2329]">{stats.salary}{indConfig.text.currency}</span>
           </div>
            <div className="flex justify-between mb-2">
               <span className="text-sm text-[#646a73]">每周开销</span>
               <span className="text-sm font-bold text-[#f54a45]">- {Math.floor(stats.expenses)}{indConfig.text.currency}</span>
           </div>
           <div className="flex justify-between">
               <span className="text-sm text-[#646a73]">被优化风险</span>
               <span className={`text-sm font-bold ${stats.risk > 50 ? 'text-red-500' : 'text-green-500'}`}>{stats.risk}%</span>
           </div>
       </div>

       {/* Retire Button */}
       <div className="pt-4">
           <button 
                onClick={onRetire}
                className="w-full bg-gray-100 text-gray-500 font-bold py-4 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center space-x-2"
           >
               <LogOut size={18} />
               <span>申请提前退休</span>
           </button>
           <p className="text-center text-[10px] text-gray-400 mt-2">注：累了随时可以走，生活不只有工作。</p>
       </div>
    </div>
  );
};

export default ResumeView;
