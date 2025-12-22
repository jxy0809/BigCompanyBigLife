import React, { useState } from 'react';
import { Attributes, GameStats, LEVELS } from '../types';
import { UserPlus, Minus, Plus, Shield, Smile, Cpu, Heart, Sparkles, ChevronRight, User } from 'lucide-react';

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
  const [showSummary, setShowSummary] = useState(false);

  const handleChange = (key: keyof Attributes, delta: number) => {
    if (delta > 0 && points <= 0) return;
    if (delta < 0 && attrs[key] <= 1) return;
    
    setAttrs(prev => ({ ...prev, [key]: prev[key] + delta }));
    setPoints(prev => prev - delta);
  };

  const statConfig = [
    { key: 'health', label: '体质 (Health)', icon: Heart, color: 'text-red-500', desc: '决定初始血条 (50 + Health*8)' },
    { key: 'tech', label: '技术 (Tech)', icon: Cpu, color: 'text-blue-500', desc: '决定初始钱包与小周产出' },
    { key: 'grind', label: '耐艹 (Grind)', icon: Shield, color: 'text-gray-600', desc: '加班抗性，减少心智消耗' },
    { key: 'eq', label: '情商 (EQ)', icon: Smile, color: 'text-orange-500', desc: '决定心智流失速度' },
    { key: 'luck', label: '灵气 (Luck)', icon: Sparkles, color: 'text-purple-500', desc: '决定初始存款与小周豁免' },
  ] as const;

  // New Derived calculations
  const maxStamina = 50 + attrs.health * 8;
  const initialLevel = Math.min(LEVELS.length, 1 + Math.floor(attrs.tech / 5));
  const initialSalary = LEVELS[initialLevel - 1].salary;
  // Wallet Weight: 1000 + Luck*300 + Tech*100
  const initialMoney = 1000 + (attrs.luck * 300) + (attrs.tech * 100);
  
  const getInitEvaluation = () => {
    let text = "";
    
    if (attrs.tech > 7 && attrs.grind > 7) {
        text += "HR 看到你的简历狂喜：这简直是完美的‘人形电池’！技术好还能卷。";
    } else if (attrs.health < 4) {
        text += "体检医生看着你的报告直摇头：‘小伙子，这身体去互联网怕是有命赚没命花啊。’";
    } else if (attrs.luck > 8) {
        text += "你入职当天，公司的股票就涨了。同事们都觉得你头上有光环。";
    } else if (attrs.eq < 3) {
        text += "面试时你怼了面试官，但因为技术太强还是被录用了，大家私下叫你‘那个刺头’。";
    } else {
        text += "你平平无奇地入职了，就像一颗随时可以被替换的螺丝钉。";
    }
    
    return text;
  };

  if (showSummary) {
      return (
          <div className="h-screen flex flex-col bg-white p-8 items-center justify-center animate-fade-in-up">
              <div className="w-20 h-20 bg-[#f5f6f7] rounded-full flex items-center justify-center mb-6">
                  <User size={40} className="text-[#3370ff]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1f2329] mb-4">入职评估报告</h2>
              <p className="text-base text-[#1f2329] font-medium text-center mb-6 px-4 leading-relaxed bg-blue-50 p-4 rounded-xl border border-blue-100">
                  “{getInitEvaluation()}”
              </p>
              
              <div className="w-full bg-[#f5f6f7] rounded-xl p-6 space-y-4 mb-8">
                  <div className="flex justify-between">
                      <span className="text-[#646a73]">体力上限</span>
                      <span className="font-bold">{maxStamina}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-[#646a73]">初始职级</span>
                      <span className="font-bold">{LEVELS[initialLevel-1].title}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-[#646a73]">初始周薪</span>
                      <span className="font-bold">¥{initialSalary}</span>
                  </div>
                   <div className="flex justify-between">
                      <span className="text-[#646a73]">初始存款</span>
                      <span className="font-bold">¥{initialMoney}</span>
                  </div>
              </div>

              <button 
                onClick={() => onComplete(attrs)}
                className="w-full bg-[#3370ff] text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform"
              >
                  开始搬砖
              </button>
              <button 
                onClick={() => setShowSummary(false)}
                className="mt-4 text-[#646a73] text-sm"
              >
                  返回调整
              </button>
          </div>
      )
  }

  return (
    <div className="h-screen flex flex-col bg-white p-6 relative">
      <div className="mb-6 mt-4">
         <div className="flex items-center space-x-3 mb-2">
            <div className="bg-[#e1eaff] p-2 rounded-xl">
                <UserPlus className="text-[#3370ff]" size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-[#1f2329]">建立档案</h1>
                <p className="text-[#646a73] text-sm">慎重加点，这将决定你的死法</p>
            </div>
         </div>
      </div>

      <div className="flex justify-between items-center bg-[#f5f6f7] p-4 rounded-xl mb-6 border border-[#dee0e3]">
         <span className="text-[#1f2329] font-medium">可用点数</span>
         <span className={`text-2xl font-bold ${points > 0 ? 'text-[#3370ff]' : 'text-[#8f959e]'}`}>{points}</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pb-20">
        {statConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="bg-white border border-[#dee0e3] p-4 rounded-xl flex items-center justify-between shadow-sm">
               <div className="flex items-center flex-1">
                  <div className={`p-2 rounded-lg bg-opacity-10 mr-3 ${stat.color.replace('text', 'bg')}`}>
                      <Icon size={20} className={stat.color} />
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
          );
        })}
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={() => setShowSummary(true)}
          disabled={points > 0}
          className="w-full bg-[#3370ff] disabled:bg-[#bbbfc4] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-[0.98]"
        >
           {points > 0 ? `还有 ${points} 点未分配` : '下一步'}
           {points === 0 && <ChevronRight size={20} className="ml-2" />}
        </button>
      </div>
    </div>
  );
};

export default CharacterCreation;