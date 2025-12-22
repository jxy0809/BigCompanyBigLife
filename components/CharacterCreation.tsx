import React, { useState, useEffect } from 'react';
import { Attributes, GameStats, LEVELS, IndustryType } from '../types';
import { INDUSTRIES } from '../constants';
import { UserPlus, Minus, Plus, Shield, Smile, Cpu, Heart, Sparkles, ChevronRight, User, Star, Briefcase, Lock } from 'lucide-react';

interface Props {
  onComplete: (attributes: Attributes, industry: IndustryType, spentPoints: number) => void;
  availableLegacyPoints: number;
}

const LOCKED_INDUSTRIES = [IndustryType.REAL_ESTATE, IndustryType.PHARMA, IndustryType.POLICE];

const CharacterCreation: React.FC<Props> = ({ onComplete, availableLegacyPoints }) => {
  const [step, setStep] = useState<'INDUSTRY' | 'ATTR'>('INDUSTRY');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>(IndustryType.INTERNET);
  const [points, setPoints] = useState(20);
  const [attrs, setAttrs] = useState<Attributes>({
    grind: 1,
    eq: 1,
    tech: 1,
    health: 1,
    luck: 1
  });
  const [showSummary, setShowSummary] = useState(false);

  // Auto-spend legacy points into pool
  useEffect(() => {
     setPoints(20 + availableLegacyPoints);
  }, [availableLegacyPoints]);

  const handleChange = (key: keyof Attributes, delta: number) => {
    if (delta > 0 && points <= 0) return;
    if (delta < 0 && attrs[key] <= 1) return;
    
    setAttrs(prev => ({ ...prev, [key]: prev[key] + delta }));
    setPoints(prev => prev - delta);
  };

  const statConfig = [
    { key: 'health', label: '体质 (Health)', icon: Heart, color: 'text-red-500', desc: '决定初始血条' },
    { key: 'tech', label: '技术 (Tech)', icon: Cpu, color: 'text-blue-500', desc: '决定初始钱包与产出' },
    { key: 'grind', label: '耐艹 (Grind)', icon: Shield, color: 'text-gray-600', desc: '加班抗性' },
    { key: 'eq', label: '情商 (EQ)', icon: Smile, color: 'text-orange-500', desc: '决定心智消耗' },
    { key: 'luck', label: '灵气 (Luck)', icon: Sparkles, color: 'text-purple-500', desc: '决定奇遇概率' },
  ] as const;

  if (step === 'INDUSTRY') {
      return (
          <div className="h-screen flex flex-col bg-white p-6 overflow-y-auto">
             <h1 className="text-2xl font-bold text-[#1f2329] mb-2 mt-4">选择你的赛道</h1>
             <p className="text-[#646a73] text-sm mb-6">不同的行业，不同的死法。</p>
             
             <div className="space-y-4 pb-20">
                 {Object.values(INDUSTRIES).map((ind) => {
                     const isLocked = LOCKED_INDUSTRIES.includes(ind.type);
                     const isSelected = selectedIndustry === ind.type;
                     
                     return (
                         <button
                            key={ind.type}
                            onClick={() => !isLocked && setSelectedIndustry(ind.type)}
                            disabled={isLocked}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all relative ${
                                isSelected
                                ? `border-[${ind.theme.primaryColor}] bg-gray-50 ring-1 ring-[${ind.theme.primaryColor}]` 
                                : 'border-[#dee0e3] bg-white'
                            } ${isLocked ? 'opacity-50 grayscale cursor-not-allowed bg-gray-50' : ''}`}
                            style={{ borderColor: isSelected ? ind.theme.primaryColor : undefined }}
                         >
                            {isLocked && (
                                <div className="absolute top-3 right-3 bg-gray-200 text-gray-500 text-[10px] px-2 py-1 rounded-full flex items-center font-medium z-10">
                                    <Lock size={10} className="mr-1" /> 暂未开放
                                </div>
                            )}

                            <div className="flex items-center mb-2">
                                 <div className="p-2 rounded-lg mr-3 text-white" style={{ backgroundColor: ind.theme.primaryColor }}>
                                    <Briefcase size={20} />
                                 </div>
                                 <div>
                                     <h3 className="font-bold text-[#1f2329]">{ind.name}</h3>
                                     <span className="text-[10px] text-[#646a73]">{ind.description}</span>
                                 </div>
                            </div>
                            <div className="text-xs bg-gray-100 p-2 rounded text-[#646a73] leading-relaxed">
                                {ind.type === IndustryType.INTERNET && '周薪+20% | 强制大小周 | 初始心智-10'}
                                {ind.type === IndustryType.REAL_ESTATE && '情商双倍加成 | 经济危机风险 | 低底薪'}
                                {ind.type === IndustryType.PHARMA && '技术门槛高(Tech<10工资减半) | 严谨稳定'}
                                {ind.type === IndustryType.POLICE && '体力上限+50 | 心智自动流失 | 连轴转'}
                                {ind.type === IndustryType.DESIGN && '心智上限减半 | 灵气爆发收益 | 甲方折磨'}
                            </div>
                         </button>
                     );
                 })}
             </div>
             
             <div className="fixed bottom-6 left-6 right-6">
                <button
                onClick={() => setStep('ATTR')}
                className="w-full text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-[0.98]"
                style={{ backgroundColor: INDUSTRIES[selectedIndustry].theme.primaryColor }}
                >
                下一步
                </button>
            </div>
          </div>
      )
  }

  // Attr Step
  const indConfig = INDUSTRIES[selectedIndustry];
  const maxStamina = 50 + attrs.health * 8 + indConfig.modifiers.staminaBonus;
  const initialLevel = Math.min(LEVELS.length, 1 + Math.floor(attrs.tech / 5));
  let initialSalary = LEVELS[initialLevel - 1].salary * indConfig.modifiers.salaryMultiplier;
  if (indConfig.modifiers.techSalaryGate && attrs.tech < 10) initialSalary *= 0.5;

  const initialMoney = 1000 + (attrs.luck * 300) + (attrs.tech * 100);
  
  if (showSummary) {
      return (
          <div className="h-screen flex flex-col bg-white p-8 items-center justify-center animate-fade-in-up">
              <div className="w-20 h-20 bg-[#f5f6f7] rounded-full flex items-center justify-center mb-6">
                  <User size={40} className="text-[#3370ff]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1f2329] mb-4">入职评估报告</h2>
              <p className="text-base text-[#1f2329] font-medium text-center mb-6 px-4 leading-relaxed bg-blue-50 p-4 rounded-xl border border-blue-100">
                  行业：{indConfig.name} <br/>
                  “{indConfig.description}”
              </p>
              
              <div className="w-full bg-[#f5f6f7] rounded-xl p-6 space-y-4 mb-8">
                  <div className="flex justify-between">
                      <span className="text-[#646a73]">体力上限</span>
                      <span className="font-bold">{maxStamina}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-[#646a73]">初始职级</span>
                      <span className="font-bold">{indConfig.text.levelName}{initialLevel}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-[#646a73]">初始周薪</span>
                      <span className="font-bold">{initialSalary}{indConfig.text.currency}</span>
                  </div>
                   <div className="flex justify-between">
                      <span className="text-[#646a73]">初始存款</span>
                      <span className="font-bold">{initialMoney}{indConfig.text.currency}</span>
                  </div>
              </div>

              <button 
                onClick={() => onComplete(attrs, selectedIndustry, availableLegacyPoints)}
                className="w-full text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-transform"
                style={{ backgroundColor: indConfig.theme.primaryColor }}
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
         <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
                <div className="bg-[#e1eaff] p-2 rounded-xl">
                    <UserPlus className="text-[#3370ff]" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#1f2329]">建立档案</h1>
                    <p className="text-[#646a73] text-sm">慎重加点，这将决定你的死法</p>
                </div>
            </div>
            {availableLegacyPoints > 0 && (
                 <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                     <Star size={12} className="mr-1 fill-yellow-600" />
                     前世继承 +{availableLegacyPoints}
                 </div>
            )}
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
          className="w-full disabled:bg-[#bbbfc4] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-[0.98]"
          style={{ backgroundColor: points > 0 ? undefined : indConfig.theme.primaryColor }}
        >
           {points > 0 ? `还有 ${points} 点未分配` : '下一步'}
           {points === 0 && <ChevronRight size={20} className="ml-2" />}
        </button>
      </div>
    </div>
  );
};

export default CharacterCreation;