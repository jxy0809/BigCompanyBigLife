import React from 'react';
import { GameStats, LEVELS } from '../types';
import { Shield, Smile, Cpu, Heart, Sparkles, User, Medal } from 'lucide-react';

interface Props {
  stats: GameStats;
}

const RadarChart: React.FC<{ attributes: GameStats['attributes'] }> = ({ attributes }) => {
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
                <polygon points={points} fill="rgba(51, 112, 255, 0.2)" stroke="#3370ff" strokeWidth="2" />
                
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

const ResumeView: React.FC<Props> = ({ stats }) => {
  const currentLevel = LEVELS.find(l => l.id === stats.level) || LEVELS[0];

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
          <div className="w-16 h-16 bg-[#3370ff] rounded-full flex items-center justify-center mx-auto mb-3 shadow-md z-10 relative">
             <User size={32} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-[#1f2329]">{currentLevel.title}</h2>
          <p className="text-[#646a73] text-xs mt-1">入职第 {stats.week} 周</p>
          
          <div className="mt-4 bg-[#f5f6f7] rounded-full h-1.5 overflow-hidden relative">
             <div 
               className="absolute left-0 top-0 h-full bg-[#3370ff]" 
               style={{ width: `${Math.min(100, (stats.exp / (stats.level * 100)) * 100)}%` }}
             ></div>
          </div>
          <div className="flex justify-between text-[10px] text-[#8f959e] mt-1">
             <span>Exp: {stats.exp}</span>
             <span>Next: {stats.level * 100}</span>
          </div>
       </div>

       {/* Radar Chart */}
       <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dee0e3]">
          <h3 className="text-xs font-bold text-[#646a73] mb-2 uppercase tracking-wider">能力雷达</h3>
          <RadarChart attributes={stats.attributes} />
          <div className="grid grid-cols-2 gap-x-4">
            <StatRow label="Tech" value={stats.attributes.tech} icon={Cpu} color={{bg: 'bg-blue-100', text: 'text-blue-500'}} />
            <StatRow label="Grind" value={stats.attributes.grind} icon={Shield} color={{bg: 'bg-gray-100', text: 'text-gray-600'}} />
            <StatRow label="Health" value={stats.attributes.health} icon={Heart} color={{bg: 'bg-red-100', text: 'text-red-500'}} />
            <StatRow label="EQ" value={stats.attributes.eq} icon={Smile} color={{bg: 'bg-orange-100', text: 'text-orange-500'}} />
            <StatRow label="Luck" value={stats.attributes.luck} icon={Sparkles} color={{bg: 'bg-purple-100', text: 'text-purple-500'}} />
          </div>
       </div>

       {/* Titles */}
       {stats.titles.length > 0 && (
         <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dee0e3]">
             <h3 className="text-xs font-bold text-[#646a73] mb-3 uppercase tracking-wider flex items-center">
                 <Medal size={14} className="mr-1" /> 获得称号
             </h3>
             <div className="flex flex-wrap gap-2">
                 {stats.titles.map((t, i) => (
                     <span key={i} className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200 shadow-sm">
                         {t}
                     </span>
                 ))}
             </div>
         </div>
       )}
       
       {/* Financials */}
       <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dee0e3]">
           <h3 className="text-xs font-bold text-[#646a73] mb-2 uppercase tracking-wider">财务状况</h3>
           <div className="flex justify-between mb-2">
               <span className="text-sm text-[#646a73]">当前周薪</span>
               <span className="text-sm font-bold text-[#1f2329]">¥{stats.salary}</span>
           </div>
            <div className="flex justify-between mb-2">
               <span className="text-sm text-[#646a73]">每周开销</span>
               <span className="text-sm font-bold text-[#f54a45]">-¥{Math.floor(stats.expenses)}</span>
           </div>
           <div className="flex justify-between">
               <span className="text-sm text-[#646a73]">被优化风险</span>
               <span className={`text-sm font-bold ${stats.risk > 50 ? 'text-red-500' : 'text-green-500'}`}>{stats.risk}%</span>
           </div>
       </div>
    </div>
  );
};

export default ResumeView;