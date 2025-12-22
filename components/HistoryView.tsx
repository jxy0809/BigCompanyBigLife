
import React from 'react';
import { MetaData, IndustryType } from '../types';
import { INDUSTRIES } from '../constants';
import { Trophy, History, Star, Calendar, Award, Lock } from 'lucide-react';

interface Props {
  meta: MetaData;
  onBack: () => void;
}

const HistoryView: React.FC<Props> = ({ meta }) => {
  // 定义成就分级和颜色
  const tiers = {
    GOLD: { color: '#FFD700', bg: 'bg-yellow-400', glow: 'shadow-[0_0_15px_rgba(255,215,0,0.4)]' },
    SILVER: { color: '#C0C0C0', bg: 'bg-gray-300', glow: 'shadow-[0_0_15px_rgba(192,192,192,0.4)]' },
    BRONZE: { color: '#CD7F32', bg: 'bg-orange-400', glow: 'shadow-[0_0_15px_rgba(205,127,50,0.4)]' },
  };

  const achievements = [
    { 
      id: 'a1', 
      name: '初出茅庐', 
      desc: '开启第一段搬砖生涯', 
      tier: 'BRONZE', 
      condition: (meta.gameHistory?.length || 0) > 0 
    },
    { 
      id: 'a6', 
      name: '生存专家', 
      desc: '累计完成10次生涯', 
      tier: 'BRONZE', 
      condition: (meta.gameHistory?.length || 0) >= 10 
    },
    { 
      id: 'a3', 
      name: '职场锦鲤', 
      desc: '累计生涯点数达200', 
      tier: 'SILVER', 
      condition: (meta.totalCareerPoints || 0) >= 200 
    },
    { 
      id: 'a5', 
      name: '财富自由', 
      desc: '单次存款突破5万', 
      tier: 'SILVER', 
      condition: meta.gameHistory?.some(r => r.money >= 50000) 
    },
    { 
      id: 'a2', 
      name: '年度总冠军', 
      desc: '成功存活至52周', 
      tier: 'GOLD', 
      condition: (meta.highScoreWeeks || 0) >= 52 
    },
    { 
      id: 'a4', 
      name: '行业巅峰', 
      desc: '达到任意行业满级', 
      tier: 'GOLD', 
      condition: meta.gameHistory?.some(r => r.level >= 7) 
    },
  ];

  return (
    <div className="p-4 space-y-6 animate-fade-in-up pb-24">
       {/* 全局统计面板 */}
       <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#dee0e3] flex justify-around text-center">
          <div>
              <div className="text-[10px] text-[#8f959e] uppercase font-bold mb-1 tracking-wider">总生涯点数</div>
              <div className="text-2xl font-black text-[#1f2329] flex items-center justify-center">
                  <Star className="text-[#ffc60a] mr-1 fill-[#ffc60a]" size={18} />
                  {meta.totalCareerPoints || 0}
              </div>
          </div>
          <div className="w-[1px] bg-[#dee0e3] my-2"></div>
          <div>
              <div className="text-[10px] text-[#8f959e] uppercase font-bold mb-1 tracking-wider">最高周数</div>
              <div className="text-2xl font-black text-[#1f2329] flex items-center justify-center">
                  <Calendar className="text-[#3370ff] mr-1" size={18} />
                  {meta.highScoreWeeks || 0}
              </div>
          </div>
       </div>

       {/* 奖杯陈列馆 */}
       <div className="bg-[#1a1c1e] rounded-3xl p-6 shadow-xl border border-[#2d3034]">
          <h3 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center justify-center">
              <Award size={14} className="mr-2 text-yellow-500" /> 搬砖荣誉陈列馆
          </h3>
          
          <div className="grid grid-cols-3 gap-y-8 gap-x-4">
              {achievements.map(a => {
                  const t = tiers[a.tier as keyof typeof tiers];
                  const isUnlocked = a.condition;

                  return (
                      <div key={a.id} className="flex flex-col items-center">
                          <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                              isUnlocked 
                              ? `bg-gradient-to-br from-[#2d3034] to-[#1a1c1e] ${t.glow} border border-gray-700` 
                              : 'bg-[#25282c] border border-gray-800'
                          }`}>
                              <Trophy 
                                  size={28} 
                                  className={`transition-all duration-700 ${
                                      isUnlocked 
                                      ? 'scale-110' 
                                      : 'opacity-10 grayscale scale-90'
                                  }`}
                                  style={{ color: isUnlocked ? t.color : '#4a4d52' }}
                              />
                              {!isUnlocked && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                                      <Lock size={12} className="text-gray-500" />
                                  </div>
                              )}
                              {/* 解锁后的底座装饰 */}
                              {isUnlocked && (
                                  <div className={`absolute -bottom-1 w-8 h-1 rounded-full ${t.bg} opacity-50 blur-[2px]`}></div>
                              )}
                          </div>
                          
                          <div className="mt-3 text-center">
                              <div className={`text-[10px] font-bold mb-0.5 truncate w-20 ${
                                  isUnlocked ? 'text-gray-100' : 'text-gray-600'
                              }`}>
                                  {a.name}
                              </div>
                              <div className={`text-[8px] leading-tight px-1 ${
                                  isUnlocked ? 'text-gray-400' : 'text-gray-700'
                              }`}>
                                  {a.desc}
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
          
          {/* 陈列架底座视觉线条 */}
          <div className="mt-4 h-[2px] w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
       </div>

       {/* 往事记录列表 */}
       <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#646a73] px-1 uppercase tracking-wider flex items-center">
              <History size={14} className="mr-1" /> 搬砖档案
          </h3>
          
          {(!meta.gameHistory || meta.gameHistory.length === 0) ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-[#dee0e3]">
                  <p className="text-[#8f959e] text-xs">暂无历史记录，开启你的赛道人生吧。</p>
              </div>
          ) : (
              meta.gameHistory.map((record, idx) => {
                  const ind = INDUSTRIES[record.industry];
                  return (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-[#dee0e3] shadow-sm flex items-center justify-between group active:scale-[0.98] transition-transform">
                          <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 text-white shadow-inner" style={{ backgroundColor: ind?.theme.primaryColor || '#000' }}>
                                  <Trophy size={18} />
                              </div>
                              <div>
                                  <div className="font-bold text-[#1f2329] text-sm">{ind?.name || '未知行业'}</div>
                                  <div className="text-[10px] text-[#646a73]">{record.date} · {record.ending}</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="text-sm font-black text-[#1f2329]">{record.week} <span className="text-[8px] font-normal">周</span></div>
                              <div className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#f5f6f7] text-[#3370ff] border border-[#e1eaff]">
                                  {ind?.text.levelName}{record.level}
                              </div>
                          </div>
                      </div>
                  );
              })
          )}
       </div>
    </div>
  );
};

export default HistoryView;
