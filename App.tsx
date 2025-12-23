
import React, { useState, useEffect, useRef } from 'react';
import { BLANK_STATS, CONFIG, SHOP_ITEMS, INDUSTRIES, getEventsForIndustry, BUFFS } from './constants';
import { GameStats, GameState, GameEvent, OptionEffect, LEVELS, Attributes, TabView, Location, ShopItem, EventCategory, MetaData, IndustryType, EventRarity, GameRecord } from './types';
import StatBar from './components/StatBar';
import EventCard from './components/EventCard';
import ResultView from './components/ResultView';
import CharacterCreation from './components/CharacterCreation';
import EffectsCanvas, { EffectsCanvasHandle } from './components/EffectsCanvas';
import BottomNav from './components/BottomNav';
import ResumeView from './components/ResumeView';
import ShopView from './components/ShopView';
import HistoryView from './components/HistoryView';
import WeekendView from './components/WeekendView';
import SceneHeader from './components/SceneHeader';
import { Building2, Award, QrCode, Sun, RotateCcw, Play } from 'lucide-react';

const SAVE_KEY = 'industry_survival_v1';
const META_KEY = 'industry_meta_v1';

const App: React.FC = () => {
  const [stats, setStats] = useState<GameStats>(BLANK_STATS);
  const [meta, setMeta] = useState<MetaData>({ 
      totalCareerPoints: 0, 
      unlockedBadges: [], 
      highScoreWeeks: 0, 
      gameHistory: [],
      unlockedIndustries: [IndustryType.INTERNET] 
  });
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.WORK);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [lastResult, setLastResult] = useState<OptionEffect | null>(null);
  const [notifications, setNotifications] = useState<{id: number, text: string}[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<EffectsCanvasHandle>(null);

  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    const savedMeta = localStorage.getItem(META_KEY);
    
    if (savedMeta) {
        try { 
            const m = JSON.parse(savedMeta);
            // Ensure unlockedIndustries exists for legacy saves
            if (!m.unlockedIndustries) m.unlockedIndustries = [IndustryType.INTERNET];
            setMeta(m); 
        } catch(e) {}
    }

    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.week > 0) {
                setStats(parsed);
                // Note: We don't auto-start the game state here so user sees the START screen
            }
        } catch (e) {
            console.error("Failed to load save", e);
        }
    }
  }, []);

  const saveGame = (s: GameStats) => localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  
  const saveMeta = (newMeta: MetaData) => {
      localStorage.setItem(META_KEY, JSON.stringify(newMeta));
      setMeta(newMeta);
  }

  // --- Unlock Logic ---
  const checkIndustryUnlock = (currentStats: GameStats) => {
      const survivedWeeks = currentStats.week;
      const currentIndustry = currentStats.industry;
      const alreadyUnlocked = new Set(meta.unlockedIndustries);
      let newUnlock: IndustryType | null = null;

      if (survivedWeeks >= 10) {
          if (currentIndustry === IndustryType.INTERNET && !alreadyUnlocked.has(IndustryType.REAL_ESTATE)) {
              newUnlock = IndustryType.REAL_ESTATE;
          } else if (currentIndustry === IndustryType.REAL_ESTATE && !alreadyUnlocked.has(IndustryType.PHARMA)) {
              newUnlock = IndustryType.PHARMA;
          } else if (currentIndustry === IndustryType.PHARMA && !alreadyUnlocked.has(IndustryType.POLICE)) {
              newUnlock = IndustryType.POLICE;
          } else if (currentIndustry === IndustryType.POLICE && !alreadyUnlocked.has(IndustryType.DESIGN)) {
              newUnlock = IndustryType.DESIGN;
          } else if (currentIndustry === IndustryType.DESIGN && !alreadyUnlocked.has(IndustryType.METRO)) {
              newUnlock = IndustryType.METRO;
          }
      }

      if (newUnlock) {
          const updatedUnlocked = [...meta.unlockedIndustries, newUnlock];
          saveMeta({ ...meta, unlockedIndustries: updatedUnlocked });
          // Optional: Notify user
          // alert(`解锁新行业: ${INDUSTRIES[newUnlock].name}!`);
      }
  };

  const goToCreation = () => {
    if (stats.week > 1) {
      setGameState(GameState.WEEK_START);
      startWeek(stats);
    } else {
      setGameState(GameState.CREATION);
    }
  };

  const startNewGame = () => {
    setGameState(GameState.CREATION);
  };

  const finalizeCreation = (attributes: Attributes, industry: IndustryType, spentLegacyPoints: number) => {
    const indConfig = INDUSTRIES[industry];
    const mods = indConfig.modifiers;
    const maxStamina = 50 + attributes.health * 8 + mods.staminaBonus;
    const initialLevel = Math.min(LEVELS.length, 1 + Math.floor(attributes.tech / 5));
    let initialSalary = (LEVELS[initialLevel - 1] || LEVELS[0]).salary * mods.salaryMultiplier;
    const initialMoney = 1000 + (attributes.luck * 300) + (attributes.tech * 100);

    const startStats: GameStats = {
      ...BLANK_STATS,
      industry, attributes, stamina: maxStamina, maxStamina,
      sanity: Math.max(10, mods.maxSanityCap - mods.initialSanityPenalty),
      maxSanity: mods.maxSanityCap,
      money: initialMoney, salary: initialSalary, level: initialLevel,
      expenses: CONFIG.BASE_EXPENSE, reviveUsed: false, legacyPointsUsed: spentLegacyPoints
    };

    // Metro Entry Oath
    if (industry === IndustryType.METRO) {
        startStats.activeBuffs.push(BUFFS.STABILITY(999)); // Permanent stability
        alert("【入职宣誓】\n我志愿献身大国重器，严守工艺纪律，确保行车安全。\n获得永久Buff: 铁饭碗 (心智消耗-20%, 风险抵御-50)");
    }
    
    setStats(startStats);
    setGameState(GameState.WEEK_START);
    saveGame(startStats);
    startWeek(startStats);
  };

  const startWeek = (currentStats: GameStats) => {
    // Check for unlocks
    checkIndustryUnlock(currentStats);

    if (currentStats.week > CONFIG.MAX_WEEKS) {
      handleGameEnd(currentStats, true);
      return;
    }

    const indConfig = INDUSTRIES[currentStats.industry];
    // Calculate small week. If industry has smallWeek modifier (e.g., Internet), then even weeks are small weeks (work on Sat).
    const isSmallWeek = indConfig.modifiers.smallWeek && (currentStats.week % 2 === 0);

    // Metro Delivery Day Logic (Every 4 weeks)
    if (currentStats.industry === IndustryType.METRO && currentStats.week % 4 === 0) {
        const deliveryEvent: GameEvent = {
            id: 'metro_delivery',
            category: EventCategory.DELIVERY_DAY,
            rarity: EventRarity.EPIC,
            location: Location.FACTORY_FLOOR,
            industry: IndustryType.METRO,
            title: '关键节点交付日',
            description: `本月是第 ${currentStats.week} 周的关键交付节点。全集团都在盯着这次交付。`,
            options: [
                { 
                    label: '提交验收', 
                    effect: (s) => {
                        if (s.attributes.tech > 35) {
                            return { money: 10000, exp: 50, message: '技术指标完美达标！获得节点专项奖金 10,000 元！' };
                        } else if (s.attributes.tech < 20) {
                            return { money: -5000, level: -1, message: '关键指标严重偏差！扣除绩效 5,000 元并通报批评。' };
                        } else {
                            return { message: '验收通过，无功无过。' };
                        }
                    } 
                }
            ]
        };
        
        setCurrentEvent(deliveryEvent);
        setStats({ ...currentStats, location: Location.FACTORY_FLOOR, isSmallWeek });
        setGameState(GameState.WEEK_START);
        setTimeout(() => setGameState(GameState.EVENT), 1200);
        return;
    }

    const pool = getEventsForIndustry(currentStats.industry);
    const selectedEvent = pool[Math.floor(Math.random() * pool.length)];
    const updatedStats = { ...currentStats, location: selectedEvent.location, isSmallWeek };
    setCurrentEvent(selectedEvent);
    setStats(updatedStats);
    setGameState(GameState.WEEK_START);
    setTimeout(() => setGameState(GameState.EVENT), 1500); // Increased duration for animation
  };

  const handleRetire = () => {
    setGameState(GameState.RETIRING);
    setTimeout(() => {
        // Pass explicit ending to avoid closure staleness issues with gameState
        handleGameEnd(stats, true, "提前退休"); 
    }, 3000);
  };

  const handleOptionSelect = (optionIndex: number, e: React.MouseEvent) => {
    if (!currentEvent) return;
    const selectedOption = currentEvent.options[optionIndex];
    const effect = selectedOption.effect(stats);

    // Apply Buff Modifiers to costs/risks
    let staminaDelta = effect.stamina || 0;
    let sanityDelta = effect.sanity || 0;
    let riskDelta = effect.risk || 0;

    stats.activeBuffs.forEach(buff => {
        // Apply multipliers to negative changes (costs)
        if (staminaDelta < 0 && buff.effect.staminaCostMod !== undefined) {
            staminaDelta *= buff.effect.staminaCostMod;
        }
        if (sanityDelta < 0 && buff.effect.sanityCostMod !== undefined) {
            sanityDelta *= buff.effect.sanityCostMod;
        }
        // Apply risk reduction (e.g. risk: -50) to risk increases
        if (riskDelta > 0 && buff.effect.risk !== undefined) {
            riskDelta = Math.max(0, riskDelta + buff.effect.risk);
        }
    });

    const newStats = {
      ...stats,
      stamina: Math.min(stats.maxStamina, stats.stamina + staminaDelta),
      sanity: Math.min(stats.maxSanity, stats.sanity + sanityDelta),
      money: stats.money + (effect.money || 0),
      exp: stats.exp + (effect.exp || 0),
      risk: Math.max(0, stats.risk + riskDelta),
      level: Math.max(1, stats.level + (effect.level || 0)) // Prevent level 0
    };
    
    // Apply buff if any
    if (effect.addBuff) {
        newStats.activeBuffs = [...newStats.activeBuffs, effect.addBuff];
    }
    
    // Process Attributes updates
    if (effect.attributes) {
        newStats.attributes = { ...newStats.attributes, ...effect.attributes };
    }
    // Process Relationship updates
    if (effect.relationships) {
        newStats.relationships = {
            boss: (newStats.relationships.boss || 30) + (effect.relationships.boss || 0),
            colleague: (newStats.relationships.colleague || 30) + (effect.relationships.colleague || 0),
            hr: (newStats.relationships.hr || 30) + (effect.relationships.hr || 0)
        }
    }

    setStats(newStats);
    setLastResult({ ...effect, stamina: staminaDelta, sanity: sanityDelta, risk: riskDelta });
    setGameState(GameState.RESULT);
    saveGame(newStats);
  };

  const handleAfterWork = (action: 'overtime' | 'leave', e: React.MouseEvent) => {
    let finalStats = { ...stats };
    if (action === 'overtime') {
      finalStats.exp += 20; finalStats.stamina -= 20;
    } else {
      finalStats.sanity += 10;
    }
    
    // Buff expiry check
    finalStats.activeBuffs = finalStats.activeBuffs.map(b => ({...b, duration: b.duration - 1})).filter(b => b.duration > 0);

    if (finalStats.stamina <= 0 || finalStats.sanity <= 0) {
        handleGameEnd(finalStats, false); return;
    }
    setStats(finalStats);
    setGameState(GameState.WEEKEND);
    saveGame(finalStats);
  };

  const handleWeekendChoice = (choice: string) => {
      let currentStats = { ...stats };
      currentStats.week += 1;
      setStats(currentStats);
      saveGame(currentStats);
      startWeek(currentStats);
  };

  const handleGameEnd = (endStats: GameStats, isVictory: boolean, specificEnding?: string) => {
      const endingText = specificEnding || (isVictory ? "光荣退休" : "被迫离职");

      const record: GameRecord = {
          date: new Date().toLocaleDateString(),
          industry: endStats.industry,
          week: endStats.week,
          money: endStats.money,
          level: endStats.level,
          ending: endingText,
          victory: isVictory
      };

      const newHistory = [record, ...(meta.gameHistory || [])].slice(0, 20);
      const newTotal = meta.totalCareerPoints + endStats.week;
      const newHigh = Math.max(meta.highScoreWeeks, endStats.week);
      
      saveMeta({
          ...meta,
          gameHistory: newHistory,
          totalCareerPoints: newTotal,
          highScoreWeeks: newHigh,
          unlockedIndustries: meta.unlockedIndustries // Ensure this persists
      });

      setStats(endStats);
      setGameState(isVictory ? GameState.VICTORY : GameState.GAME_OVER);
      localStorage.removeItem(SAVE_KEY);
  };

  const buyItem = (item: ShopItem) => {
      if (stats.money < item.price) return;
      const effect = item.effect(stats);
      setStats(prev => {
          const s = { ...prev, money: prev.money - item.price, ...effect };
          saveGame(s); return s;
      });
  };

  const indConfig = INDUSTRIES[stats.industry];

  if (gameState === GameState.START) {
    const hasActiveRun = stats.week > 1;

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-8 overflow-hidden">
        <div className="w-full max-w-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-lg mb-8 transform rotate-3">
                <Building2 size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight text-[#1f2329]">大厂风云</h1>
            <p className="text-[#646a73] mb-8 text-center text-sm">选择你的赛道，开始内卷。</p>
            <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-xs font-bold mb-8">
                累计生涯点数: {meta.totalCareerPoints}
            </div>
            
            {hasActiveRun ? (
                <div className="w-full space-y-3">
                     <button onClick={goToCreation} className="w-full bg-black text-white font-medium py-3.5 px-6 rounded-xl text-base shadow-sm active:scale-[0.98] flex items-center justify-center">
                        <Play size={18} className="mr-2 fill-current" /> 继续 (Week {stats.week})
                    </button>
                    <button onClick={startNewGame} className="w-full bg-white border border-[#dee0e3] text-[#1f2329] font-medium py-3.5 px-6 rounded-xl text-base shadow-sm active:scale-[0.98] flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <RotateCcw size={18} className="mr-2" /> 重新开始
                    </button>
                </div>
            ) : (
                <button onClick={goToCreation} className="w-full bg-black text-white font-medium py-3.5 px-6 rounded-xl text-base shadow-sm active:scale-[0.98]">
                    新人生
                </button>
            )}

            <button onClick={() => { setActiveTab(TabView.HISTORY); setGameState(GameState.WEEK_START); }} className="mt-8 text-sm text-[#3370ff] font-medium hover:underline">查看往事回顾</button>
        </div>
      </div>
    );
  }

  if (gameState === GameState.CREATION) return <CharacterCreation onComplete={finalizeCreation} availableLegacyPoints={Math.floor(meta.totalCareerPoints / 10)} unlockedIndustries={meta.unlockedIndustries} />;

  if (gameState === GameState.RETIRING) {
      return (
          <div className="h-screen flex flex-col items-center justify-center animate-sunset text-white p-6 overflow-hidden">
              <Sun size={80} className="mb-6 animate-pulse text-yellow-100" />
              <h2 className="text-3xl font-bold mb-4">正在办理退休手续...</h2>
              <p className="text-white/80 text-center max-w-xs">
                  再见了，打卡机。<br/>
                  再见了，KPI。<br/>
                  世界那么大，我想去看看。
              </p>
          </div>
      );
  }

  if (gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) {
      // Industrial Leader Ending for Metro
      if (gameState === GameState.VICTORY && stats.industry === IndustryType.METRO) {
          return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#1e293b] p-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1474487548417-781cb714c2f0?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center"></div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-sm w-full z-10">
                    <Award size={64} className="mx-auto mb-6 text-yellow-400" />
                    <h2 className="text-3xl font-black mb-2 tracking-widest">大国工匠</h2>
                    <p className="text-sm text-gray-300 mb-6 uppercase tracking-wider">Industrial Leader</p>
                    <div className="w-full h-px bg-white/20 mb-6"></div>
                    <div className="text-left space-y-2 mb-8 text-sm">
                        <div className="flex justify-between"><span>工龄</span><span className="font-bold">52 周</span></div>
                        <div className="flex justify-between"><span>最终职级</span><span className="font-bold">总工程师</span></div>
                        <div className="flex justify-between"><span>存款</span><span className="font-bold">{stats.money} 元</span></div>
                    </div>
                    <div className="bg-white p-4 rounded-xl mb-6">
                        <QrCode className="mx-auto text-black" size={80} />
                        <p className="text-[10px] text-black font-bold mt-2">扫码见证荣耀</p>
                    </div>
                    <button onClick={() => setGameState(GameState.START)} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors">开启新征程</button>
                </div>
            </div>
          )
      }

      return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#444] p-6 text-center grayscale">
            <div className="bg-white rounded-2xl p-6 shadow-sm max-w-sm w-full grayscale-0">
                <h2 className="text-2xl font-bold mb-4">{gameState === GameState.VICTORY ? "退休快乐" : "搬砖失败"}</h2>
                <p className="text-gray-500 mb-6">{gameState === GameState.VICTORY ? "你成功摆脱了内卷，开启了第二人生。" : "很遗憾，你没能撑到最后。"}</p>
                <button onClick={() => setGameState(GameState.START)} className="w-full bg-black text-white py-3 rounded-xl">返回主界面</button>
            </div>
        </div>
      );
  }

  return (
    <div className={`h-screen flex flex-col bg-[#F5F6F7] max-w-md mx-auto relative shadow-2xl overflow-hidden`}>
      <StatBar stats={stats} />
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24" ref={scrollRef}>
        {activeTab === TabView.WORK && (
            <>
                {gameState === GameState.WEEK_START && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white animate-curtain-drop">
                        <div className="animate-scale-up text-center">
                            <h1 className="text-6xl font-black tracking-tighter mb-2 italic">WEEK {stats.week}</h1>
                            {stats.isSmallWeek && <div className="text-red-500 font-bold tracking-widest bg-red-900/30 px-3 py-1 rounded inline-block">小周 / SMALL WEEK</div>}
                        </div>
                    </div>
                )}
                {(gameState === GameState.EVENT || gameState === GameState.RESULT) && currentEvent && (
                    <>
                        <SceneHeader location={stats.location} industry={stats.industry} />
                        {gameState === GameState.EVENT ? <EventCard event={currentEvent} stats={stats} onOptionSelect={handleOptionSelect} /> : <ResultView result={lastResult!} onNext={handleAfterWork} onRetire={handleRetire} />}
                    </>
                )}
                {gameState === GameState.WEEKEND && <WeekendView onSelect={handleWeekendChoice} isSmallWeek={stats.isSmallWeek} canOutsource={stats.attributes.tech > 15}/>}
            </>
        )}
        {activeTab === TabView.RESUME && <ResumeView stats={stats} onRetire={handleRetire} />}
        {activeTab === TabView.SHOP && <ShopView stats={stats} onBuy={buyItem} />}
        {activeTab === TabView.HISTORY && <HistoryView meta={meta} onBack={() => setActiveTab(TabView.WORK)} />}
      </div>
      <BottomNav currentTab={activeTab} onTabChange={setActiveTab} disabled={false} />
    </div>
  );
};

export default App;
