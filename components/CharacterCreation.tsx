import React, { useState } from 'react';
import { Attributes } from '../types';
import { UserPlus, Minus, Plus, Shield, Smile, Cpu, Heart, Sparkles, ChevronRight } from 'lucide-react';

interface Props {
  onComplete: (attributes: Attributes) => void;
}

const CharacterCreation: React.FC<Props> = ({ onComplete }) => {
  const [points, setPoints] = useState(20);
  const [attrs, setAttrs] = useState<Attributes>({
    grind: 1,
    eq: 1,
    tech: 1,
    health: 1,
    luck: 1
  });

  const handleChange = (key: keyof Attributes, delta: number) => {
    if (delta > 0 && points <= 0) return;
    if (delta < 0 && attrs[key] <= 1) return;
    
    setAttrs(prev => ({ ...prev, [key]: prev[key] + delta }));
    setPoints(prev => prev - delta);
  };

  const statConfig = [
    { key: 'grind', label: '耐艹 (Grind)', icon: Shield, color: 'text-gray-600', desc: '加班抗性，减少心智消耗' },
    { key: 'eq', label: '情商 (EQ)', icon: Smile, color: 'text-orange-500', desc: '解锁话术，化解职场危机' },
    { key: 'tech', label: '智商 (Tech)', icon: Cpu, color: 'text-blue-500', desc: '提升效率，减少体力消耗' },
    { key: 'health', label: '体质 (Body)', icon: Heart, color: 'text-red-500', desc: '不容易猝死，生病概率降低' },
    { key: 'luck', label: '灵气 (Luck)', icon: Sparkles, color: 'text-purple-500', desc: '玄学属性，影响随机事件' },
  ] as const;

  return (
    <div className="h-screen flex flex-col bg-white p-6 relative">
      <div className="mb-6 mt-4">
         <div className="flex items-center space-x-3 mb-2">
            <div className="bg-[#e1eaff] p-2 rounded-xl">
                <UserPlus className="text-[#3370ff]" size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-[#1f2329]">入职画像</h1>
                <p className="text-[#646a73] text-sm">定义你的职场核心竞争力</p>
            </div>
         </div>
      </div>

      <div className="flex justify-between items-center bg-[#f5f6f7] p-4 rounded-xl mb-6 border border-[#dee0e3]">
         <span className="text-[#1f2329] font-medium">可用点数</span>
         <span className={`text-2xl font-bold ${points > 0 ? 'text-[#3370ff]' : 'text-[#8f959e]'}`}>{points}</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
        {statConfig.map((stat) => (
          <div key={stat.key} className="bg-white border border-[#dee0e3] p-4 rounded-xl flex items-center justify-between shadow-sm">
             <div className="flex items-center flex-1">
                <div className={`p-2 rounded-lg bg-opacity-10 mr-3 ${stat.color.replace('text', 'bg')}`}>
                    <stat.icon size={20} className={stat.color} />
                </div>
                <div>
                    <div className="font-bold text-[#1f2329]">{stat.label}</div>
                    <div className="text-[10px] text-[#8f959e]">{stat.desc}</div>
                </div>
             </div>
             
             <div className="flex items-center space-x-3 bg-[#f5f6f7] rounded-lg p-1">
                <button 
                  onClick={() => handleChange(stat.key, -1)}
                  disabled={attrs[stat.key] <= 1}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm disabled:opacity-50 text-[#1f2329]"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-bold text-[#1f2329]">{attrs[stat.key]}</span>
                <button 
                  onClick={() => handleChange(stat.key, 1)}
                  disabled={points <= 0}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm disabled:opacity-50 text-[#3370ff]"
                >
                  <Plus size={14} />
                </button>
             </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={() => onComplete(attrs)}
          disabled={points > 0}
          className="w-full bg-[#3370ff] disabled:bg-[#bbbfc4] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-[0.98]"
        >
           {points > 0 ? `还有 ${points} 点未分配` : '开启大厂生涯'}
           {points === 0 && <ChevronRight size={20} className="ml-2" />}
        </button>
      </div>
    </div>
  );
};

export default CharacterCreation;