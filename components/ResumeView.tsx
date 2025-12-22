import React from 'react';
import { GameStats, LEVELS } from '../types';
import { Shield, Smile, Cpu, Heart, Sparkles, User } from 'lucide-react';

interface Props {
  stats: GameStats;
}

const ResumeView: React.FC<Props> = ({ stats }) => {
  const currentLevel = LEVELS.find(l => l.id === stats.level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.id === stats.level + 1);

  const StatRow = ({ label, value, icon: Icon, color }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-[#f5f6f7] last:border-0">
       <div className="flex items-center">
          <div className={`p-1.5 rounded mr-3 ${color.bg}`}>
             <Icon size={16} className={color.text} />
          </div>
          <span className="text-sm text-[#1f2329] font-medium">{label}</span>
       </div>
       <span className="font-bold text-[#1f2329]">{value}</span>
    </div>
  );

  return (
    <div className="p-4 space-y-4 animate-fade-in-up">
       <div className="bg-white rounded-xl p-6 shadow-sm border border-[#dee0e3] text-center">
          <div className="w-20 h-20 bg-[#3370ff] rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
             <User size={40} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#1f2329]">{currentLevel.title}</h2>
          <p className="text-[#646a73] text-xs mt-1">入职第 {stats.week} 周</p>
          
          <div className="mt-4 bg-[#f5f6f7] rounded-full h-2 overflow-hidden relative">
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

       <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dee0e3]">
          <h3 className="text-sm font-bold text-[#646a73] mb-2 uppercase tracking-wider">五维属性</h3>
          <StatRow label="耐艹 (Grind)" value={stats.attributes.grind} icon={Shield} color={{bg: 'bg-gray-100', text: 'text-gray-600'}} />
          <StatRow label="情商 (EQ)" value={stats.attributes.eq} icon={Smile} color={{bg: 'bg-orange-100', text: 'text-orange-500'}} />
          <StatRow label="智商 (Tech)" value={stats.attributes.tech} icon={Cpu} color={{bg: 'bg-blue-100', text: 'text-blue-500'}} />
          <StatRow label="体质 (Health)" value={stats.attributes.health} icon={Heart} color={{bg: 'bg-red-100', text: 'text-red-500'}} />
          <StatRow label="灵气 (Luck)" value={stats.attributes.luck} icon={Sparkles} color={{bg: 'bg-purple-100', text: 'text-purple-500'}} />
       </div>
       
       <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dee0e3]">
           <h3 className="text-sm font-bold text-[#646a73] mb-2 uppercase tracking-wider">财务状况</h3>
           <div className="flex justify-between mb-2">
               <span className="text-sm text-[#646a73]">当前周薪</span>
               <span className="text-sm font-bold text-[#1f2329]">¥{stats.salary}</span>
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