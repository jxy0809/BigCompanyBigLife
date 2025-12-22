import React, { useState, useEffect, useRef } from 'react';
import { BLANK_STATS, EVENTS, CONFIG, SHOP_ITEMS, TITLES } from './constants';
import { GameStats, GameState, GameEvent, OptionEffect, LEVELS, Attributes, TabView, Location, ShopItem, EventCategory } from './types';
import StatBar from './components/StatBar';
import EventCard from './components/EventCard';
import ResultView from './components/ResultView';
import CharacterCreation from './components/CharacterCreation';
import EffectsCanvas, { EffectsCanvasHandle } from './components/EffectsCanvas';
import BottomNav from './components/BottomNav';
import ResumeView from './components/ResumeView';
import ShopView from './components/ShopView';
import WeekendView from './components/WeekendView';
import SceneHeader from './components/SceneHeader';
import { Building2, UserCheck, AlertTriangle, Trophy, RotateCcw, FileBarChart } from 'lucide-react';

const SAVE_KEY = 'big_tech_survival_v1';

const App: React.FC = () => {
  const [stats, setStats] = useState<GameStats>(BLANK_STATS);
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.WORK);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [lastResult, setLastResult] = useState<OptionEffect | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<EffectsCanvasHandle>(null);

  // Load Save
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.week > 0) {
                setStats(parsed);
                setGameState(GameState.WEEK_START);
                setTimeout(() => startWeek(parsed), 100);
            }
        } catch (e) {
            console.error("Failed to load save", e);
        }
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [gameState, activeTab]);

  const saveGame = (s: GameStats) => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  };

  const goToCreation = () => {
    setGameState(GameState.CREATION);
  };

  const finalizeCreation = (attributes: Attributes) => {
    const maxStamina = 50 + attributes.health * 8;
    const initialLevel = Math.min(LEVELS.length, 1 + Math.floor(attributes.tech / 5));
    const initialSalary = LEVELS[initialLevel - 1].salary;
    const initialMoney = 1000 + (attributes.luck * 300) + (attributes.tech * 100);
    const initialSanityRate = Math.max(0.5, 1 - (attributes.eq * 0.02));

    const startStats: GameStats = {
      ...BLANK_STATS,
      attributes: attributes,
      stamina: maxStamina,
      maxStamina: maxStamina,
      sanity: 100,
      sanityRate: initialSanityRate,
      money: initialMoney,
      salary: initialSalary,
      level: initialLevel,
      expenses: CONFIG.BASE_EXPENSE,
      titles: [],
      techEventCount: 0,
      overtimeHours: 0,
      debtWeeks: 0,
      isSmallWeek: false,
    };
    
    setStats(startStats);
    setGameState(GameState.WEEK_START);
    saveGame(startStats);
    startWeek(startStats);
  };

  const startWeek = (currentStats: GameStats) => {
    if (currentStats.week > CONFIG.MAX_WEEKS) {
      setGameState(GameState.VICTORY);
      return;
    }

    // Determine Big/Small Week
    // Week 1 = Big, Week 2 = Small, etc. (Odd = Big, Even = Small)
    const isSmallWeek = currentStats.week % 2 === 0;
    
    // Luck Bypass logic for Small Week
    let luckBypass = false;
    if (isSmallWeek && currentStats.attributes.luck > 15 && Math.random() < 0.2) {
        luckBypass = true;
        alert("🎉 狗屎运爆发！领导今天心情好，宣布本周单休改双休！");
    }

    const finalIsSmallWeek = isSmallWeek && !luckBypass;
    
    // Determine Event Category Weights
    let category = EventCategory.ROUTINE;
    
    if (finalIsSmallWeek) {
        // High chance of small week specific events
        if (Math.random() < 0.7) category = EventCategory.SMALL_WEEK;
        else category = EventCategory.CRISIS;
    } else {
        const rand = Math.random();
        if (rand > 0.90) category = EventCategory.ENCOUNTER; 
        else if (rand > 0.75) category = EventCategory.CRISIS;
        else if (rand > 0.60) category = EventCategory.SURPRISE;
    }

    // Filter events
    const validEvents = EVENTS.filter(e => 
        e.category === category && 
        (!e.requirements || e.requirements(currentStats))
    );
    
    const finalEvents = validEvents.length > 0 ? validEvents : EVENTS.filter(e => e.category === EventCategory.ROUTINE);
    const randomEvent = finalEvents[Math.floor(Math.random() * finalEvents.length)];
    
    const updatedStats = { ...currentStats, isSmallWeek: finalIsSmallWeek, location: randomEvent.location };

    setCurrentEvent(randomEvent);
    setStats(updatedStats);
    
    setGameState(GameState.WEEK_START);
    setTimeout(() => {
        setGameState(GameState.EVENT);
    }, 1500); 
  };

  const spawnFloatingStats = (diffs: Partial<GameStats>, x: number, y: number) => {
    if (!canvasRef.current) return;
    let offset = 0;
    const spawn = (text: string, color: string) => {
        canvasRef.current?.spawnText(x, y - offset, text, color);
        offset += 25;
    };
    if (diffs.stamina) spawn(`体力 ${diffs.stamina > 0 ? '+' : ''}${Math.floor(diffs.stamina)}`, diffs.stamina > 0 ? '#00b96b' : '#f54a45');
    if (diffs.sanity) spawn(`心智 ${diffs.sanity > 0 ? '+' : ''}${Math.floor(diffs.sanity)}`, diffs.sanity > 0 ? '#3370ff' : '#f54a45');
    if (diffs.money) spawn(`金钱 ${diffs.money > 0 ? '+' : ''}${Math.floor(diffs.money)}`, diffs.money > 0 ? '#ffc60a' : '#f54a45');
    if (diffs.exp) spawn(`经验 +${Math.floor(diffs.exp || 0)}`, '#3370ff');
  };

  const handleOptionSelect = (optionIndex: number, e: React.MouseEvent) => {
    if (!currentEvent) return;
    const selectedOption = currentEvent.options[optionIndex];
    const effect = selectedOption.effect(stats);
    
    // Apply stats
    const diffs = {
      stamina: effect.stamina || 0,
      sanity: effect.sanity || 0,
      money: effect.money || 0,
      exp: effect.exp || 0,
      risk: effect.risk || 0
    };
    spawnFloatingStats(diffs, e.clientX, e.clientY);

    // Attribute Growth System
    let newAttr = { ...stats.attributes };
    if (effect.attributes) {
        newAttr = { ...newAttr, ...effect.attributes };
    }
    
    // Mastery
    let techCount = stats.techEventCount;
    if (currentEvent.category === EventCategory.ROUTINE || currentEvent.category === EventCategory.SMALL_WEEK) {
        techCount++;
        if (techCount % CONFIG.MASTERY_THRESHOLD === 0) {
            newAttr.tech += 1;
            setTimeout(() => spawnFloatingStats({exp: 0}, e.clientX, e.clientY - 100), 500);
        }
    }

    // Titles
    const newTitles = [...stats.titles];
    TITLES.forEach(t => {
        const dummyStats = { ...stats, attributes: newAttr }; 
        if (!newTitles.includes(t.name) && t.condition(dummyStats)) {
            newTitles.push(t.name);
            alert(`🎉 解锁称号: [${t.name}]! \n${t.buff}`);
        }
    });

    const newStats = {
      ...stats,
      stamina: Math.min(stats.maxStamina, stats.stamina + diffs.stamina),
      sanity: Math.min(100, stats.sanity + diffs.sanity),
      money: stats.money + diffs.money,
      exp: stats.exp + diffs.exp,
      risk: Math.max(0, stats.risk + diffs.risk),
      attributes: newAttr,
      techEventCount: techCount,
      titles: newTitles
    };

    setStats(newStats);
    setLastResult(effect);
    setGameState(GameState.RESULT);
    saveGame(newStats);
  };

  const handleAfterWork = (action: 'overtime' | 'leave', e: React.MouseEvent) => {
    let finalStats = { ...stats };
    const diffs: Partial<GameStats> = {};

    if (action === 'overtime') {
      const grindSave = Math.floor(stats.attributes.grind / 2); 
      // Tech bonus for overtime efficiency in small weeks
      const techBonus = stats.isSmallWeek ? stats.attributes.tech : 0;
      
      diffs.exp = 15 + techBonus;
      diffs.stamina = -15;
      diffs.sanity = Math.min(-1, (-5 + grindSave) * stats.sanityRate);
      
      finalStats.overtimeHours += 4;
    } else {
      diffs.stamina = 5;
      diffs.sanity = 5;
    }
    
    spawnFloatingStats(diffs, e.clientX, e.clientY);
    
    finalStats.exp += diffs.exp || 0;
    finalStats.stamina += diffs.stamina || 0;
    finalStats.sanity += diffs.sanity || 0;
    
    // ICU CHECK
    if (finalStats.stamina <= 0) {
        if (finalStats.money >= CONFIG.ICU_COST) {
            finalStats.money -= CONFIG.ICU_COST;
            finalStats.stamina = 20; // Recover slightly
            alert(`🏥 突发恶性心律失常！被送进ICU抢救。\n扣除医药费 ¥${CONFIG.ICU_COST}，体力恢复至20。`);
        } else {
            // Cannot afford ICU
            setStats({...finalStats, money: finalStats.money - CONFIG.ICU_COST}); // Show debt
            setGameState(GameState.GAME_OVER);
            localStorage.removeItem(SAVE_KEY);
            return;
        }
    }
    
    // Sanity Check
    if (finalStats.sanity <= 0) {
        setStats(finalStats);
        setGameState(GameState.GAME_OVER);
        localStorage.removeItem(SAVE_KEY);
        return;
    }

    setStats(finalStats);
    setGameState(GameState.WEEKEND);
    saveGame(finalStats);
  };

  const handleWeekendChoice = (choice: 'SLEEP' | 'STUDY' | 'GIG' | 'SOCIAL') => {
      // Logic handled inside WeekendView for UI, but here is the data processor
      let diffs: Partial<GameStats> & { attr?: Partial<Attributes> } = {};
      let msg = "";

      // SMALL WEEK LOGIC OVERRIDE
      if (stats.isSmallWeek) {
          if (choice === 'SLEEP') {
              const recover = Math.floor(CONFIG.WEEKEND_SLEEP_STAMINA * CONFIG.SMALL_WEEK_RECOVERY_RATE);
              diffs = { stamina: recover, sanity: -CONFIG.SMALL_WEEK_SANITY_PENALTY };
              msg = "单休的一天，感觉刚躺下就天黑了。";
          }
          // Only Sleep is allowed in UI for small week usually
      } else {
          // BIG WEEK LOGIC
          switch(choice) {
              case 'SLEEP':
                  diffs = { stamina: CONFIG.WEEKEND_SLEEP_STAMINA, sanity: CONFIG.WEEKEND_SLEEP_SANITY };
                  msg = "睡了一整天，感觉活过来了。";
                  break;
              case 'STUDY':
                  if (stats.money < CONFIG.WEEKEND_STUDY_COST) {
                      alert("钱不够！"); return;
                  }
                  diffs = { money: -CONFIG.WEEKEND_STUDY_COST, attr: { tech: 1 } };
                  msg = "报了个班，技术提升了 (Tech+1)。";
                  break;
              case 'GIG':
                  diffs = { money: CONFIG.WEEKEND_GIG_MONEY, stamina: -CONFIG.WEEKEND_GIG_STAMINA_COST };
                  msg = "接了个私活，累但充实。";
                  break;
              case 'SOCIAL':
                   if (stats.money < CONFIG.WEEKEND_SOCIAL_COST) {
                      alert("钱不够！"); return;
                  }
                  const lucky = Math.random() > 0.7;
                  diffs = { sanity: CONFIG.WEEKEND_SOCIAL_SANITY, money: -CONFIG.WEEKEND_SOCIAL_COST, attr: lucky ? { luck: 1 } : {} };
                  msg = lucky ? "聚会很开心，还认识了大佬 (Luck+1)。" : "聚会很开心。";
                  break;
          }
      }
      
      let newStats = { ...stats };
      newStats.money += diffs.money || 0;
      newStats.stamina = Math.min(newStats.maxStamina, newStats.stamina + (diffs.stamina || 0));
      newStats.sanity = Math.min(100, newStats.sanity + (diffs.sanity || 0));
      if (diffs.attr) {
          newStats.attributes = { ...newStats.attributes, ...diffs.attr };
          if(diffs.attr.tech) newStats.attributes.tech = stats.attributes.tech + 1;
          if(diffs.attr.luck) newStats.attributes.luck = stats.attributes.luck + 1;
      }
      
      processWeeklySettlement(newStats, msg);
  };

  const processWeeklySettlement = (currentStats: GameStats, weekendMsg: string) => {
      // 1. Income
      let netIncome = currentStats.salary;
      // Tax
      if (netIncome > 10000) netIncome -= (netIncome - 10000) * 0.1; 
      if (netIncome > 20000) netIncome -= (netIncome - 20000) * 0.15;
      
      currentStats.money += netIncome;
      
      // 2. Expenses (Lifestyle Creep)
      const dynamicExpense = CONFIG.BASE_EXPENSE + (currentStats.money * CONFIG.LIFESTYLE_CREEP_RATE);
      currentStats.expenses = dynamicExpense;
      currentStats.money -= dynamicExpense;

      // 3. Revenge Spending
      const tankBuff = currentStats.titles.includes('肝帝');
      if (!tankBuff && currentStats.sanity < CONFIG.REVENGE_SPENDING_THRESHOLD) {
          currentStats.money -= CONFIG.REVENGE_SPENDING_AMOUNT;
      }

      // 4. Debt Check
      if (currentStats.money < 0) {
          currentStats.debtWeeks += 1;
      } else {
          currentStats.debtWeeks = 0;
      }

      if (currentStats.debtWeeks >= CONFIG.DEBT_LIMIT) {
          setStats(currentStats);
          setGameState(GameState.GAME_OVER);
          localStorage.removeItem(SAVE_KEY);
          return;
      }

      // 5. Level Up Check
      const nextLevelCost = currentStats.level * 1000 + (currentStats.level * 500); 
      if (currentStats.exp >= nextLevelCost && currentStats.level < LEVELS.length) {
          currentStats.level += 1;
          currentStats.exp = 0;
          currentStats.sanity = 100;
          currentStats.salary = LEVELS[currentStats.level - 1].salary;
          alert(`恭喜晋升! 你现在是 ${LEVELS[currentStats.level - 1].title}, 周薪涨至 ¥${currentStats.salary}!`);
      }

      // 6. Next Week
      currentStats.week += 1;
      setStats(currentStats);
      saveGame(currentStats);
      
      startWeek(currentStats);
  };

  const buyItem = (item: ShopItem) => {
      if (stats.money < item.price) return;
      const effect = item.effect(stats);
      spawnFloatingStats({money: -item.price, ...effect}, window.innerWidth/2, window.innerHeight/2);
      setStats(prev => {
          const s = { ...prev, money: prev.money - item.price, ...effect };
          if (effect.attributes) s.attributes = { ...prev.attributes, ...effect.attributes };
          saveGame(s);
          return s;
      });
  };

  // --- RENDER HELPERS ---
  if (gameState === GameState.START) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-8 relative overflow-hidden">
        <div className="w-full max-w-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-[#3370ff] rounded-2xl flex items-center justify-center shadow-lg mb-8 transform rotate-3">
                <Building2 size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight text-[#1f2329]">大厂生存记</h1>
            <p className="text-[#646a73] mb-12 text-center text-sm">Survival in Big Tech: A Roguelike</p>
            <button 
                onClick={goToCreation}
                className="w-full bg-[#3370ff] hover:bg-[#2b60d9] text-white font-medium py-3.5 px-6 rounded-xl text-base shadow-sm transition-all active:scale-[0.98]"
            >
                {stats.week > 1 ? `继续游戏 (Week ${stats.week})` : '办理入职'}
            </button>
            {stats.week > 1 && (
                 <button 
                 onClick={() => { localStorage.removeItem(SAVE_KEY); setStats(BLANK_STATS); goToCreation(); }}
                 className="mt-4 text-sm text-red-500"
             >
                 重置进度
             </button>
            )}
        </div>
      </div>
    );
  }

  if (gameState === GameState.CREATION) {
      return <CharacterCreation onComplete={finalizeCreation} />;
  }

  if (gameState === GameState.GAME_OVER) {
    const isDebt = stats.debtWeeks >= CONFIG.DEBT_LIMIT || stats.money < -5000;
    const isHealth = stats.stamina <= 0;
    
    let reason = "未知原因";
    let subtext = "";
    
    if (isDebt) {
        reason = "个人破产";
        subtext = "房租断供，花呗逾期，你被踢出了大城市。";
    } else if (isHealth) {
        reason = "ICU 没救回来";
        subtext = "即便变卖了所有家产，也没能填上ICU的窟窿。";
    } else {
        reason = "精神崩溃";
        subtext = "你在工位上突然大哭大笑，被保安架了出去。";
    }

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#444] p-6 text-center grayscale overflow-y-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm max-w-sm w-full grayscale-0 my-8">
            <div className="w-16 h-16 bg-[#ffeceb] rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-[#f54a45]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1f2329] mb-2">{reason}</h2>
            <p className="text-[#646a73] text-sm mb-6 leading-relaxed">{subtext}</p>
            
            <div className="bg-[#f5f6f7] rounded-xl p-4 mb-6 text-left">
                <h3 className="text-xs font-bold text-[#1f2329] mb-3 flex items-center uppercase tracking-wider">
                    <FileBarChart size={12} className="mr-1" /> 耗材报告
                </h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-[#646a73]">存活周数</span>
                        <span className="font-bold">{stats.week} 周</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-[#646a73]">经历小周</span>
                        <span className="font-bold">{Math.floor(stats.week / 2)} 次</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-[#646a73]">累计加班</span>
                        <span className="font-bold">{stats.overtimeHours} 小时</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-[#646a73]">最终职级</span>
                        <span className="text-[#3370ff] font-bold">{LEVELS[stats.level-1].title}</span>
                    </div>
                </div>
            </div>

            <button 
              onClick={() => {setStats(BLANK_STATS); setGameState(GameState.START);}}
              className="w-full bg-[#1f2329] text-white font-medium py-3 rounded-xl hover:bg-black transition-colors flex items-center justify-center"
            >
              <RotateCcw size={16} className="mr-2" /> 投胎重开
            </button>
        </div>
      </div>
    );
  }

  if (gameState === GameState.VICTORY) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#f5f6f7] p-6 text-center">
             <div className="bg-white rounded-2xl p-8 shadow-sm max-w-sm w-full">
                <Trophy size={40} className="text-[#ffc60a] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#1f2329]">幸存者偏差</h2>
                <p className="text-[#646a73] text-sm mb-6">你居然在大厂撑过了一整年（52周）。</p>
                <div className="mb-6 space-y-2">
                    {stats.titles.map(t => (
                        <span key={t} className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded mr-2">{t}</span>
                    ))}
                </div>
                <button 
                  onClick={() => {setStats(BLANK_STATS); setGameState(GameState.START); localStorage.removeItem(SAVE_KEY);}}
                  className="w-full bg-[#3370ff] text-white font-medium py-3 rounded-xl"
                >
                  开启二周目
                </button>
             </div>
        </div>
      );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F5F6F7] max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <EffectsCanvas ref={canvasRef} />
      <StatBar stats={stats} />
      
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24" ref={scrollRef}>
        
        {activeTab === TabView.WORK && (
            <>
                {gameState === GameState.WEEK_START && (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-pulse">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm mb-4 ${stats.isSmallWeek ? 'bg-red-50' : 'bg-white'}`}>
                            <UserCheck size={32} className={`${stats.isSmallWeek ? 'text-red-500' : 'text-[#3370ff]'}`} />
                        </div>
                        <h2 className={`text-lg font-bold ${stats.isSmallWeek ? 'text-red-600' : 'text-[#1f2329]'}`}>Week {stats.week} ({stats.isSmallWeek ? '小周' : '大周'})</h2>
                        <p className="text-[#646a73] text-sm mt-2">{stats.isSmallWeek ? '这周要上6天班，忍忍吧...' : '双休周，好好休息。'}</p>
                        {stats.sanity < CONFIG.BURNOUT_THRESHOLD && (
                            <p className="text-red-500 text-xs mt-2 font-bold">⚠️ 处于职业倦怠期，体力消耗翻倍</p>
                        )}
                    </div>
                )}

                {(gameState === GameState.EVENT || gameState === GameState.RESULT) && currentEvent && (
                    <>
                        <SceneHeader location={stats.location} />
                        {gameState === GameState.EVENT && (
                            <EventCard 
                                event={currentEvent} 
                                stats={stats}
                                onOptionSelect={handleOptionSelect} 
                            />
                        )}
                        {gameState === GameState.RESULT && lastResult && (
                            <ResultView 
                                result={lastResult} 
                                onNext={handleAfterWork} 
                            />
                        )}
                    </>
                )}

                {gameState === GameState.WEEKEND && (
                    <>
                         <SceneHeader location={Location.HOME} />
                         <WeekendView onSelect={handleWeekendChoice} isSmallWeek={stats.isSmallWeek} />
                    </>
                )}
            </>
        )}

        {activeTab === TabView.RESUME && (
            <ResumeView stats={stats} />
        )}

        {activeTab === TabView.SHOP && (
            <ShopView stats={stats} onBuy={buyItem} />
        )}

      </div>

      <BottomNav 
        currentTab={activeTab} 
        onTabChange={setActiveTab} 
        disabled={false} 
      />
    </div>
  );
};

export default App;