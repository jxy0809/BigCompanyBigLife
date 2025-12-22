
import React, { useState, useEffect, useRef } from 'react';
import { BLANK_STATS, CONFIG, SHOP_ITEMS, INDUSTRIES, getEventsForIndustry, UNIVERSAL_CHAINED_EVENTS } from './constants';
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
import { Building2, UserCheck, AlertTriangle, Trophy, RotateCcw, FileBarChart, Bell } from 'lucide-react';

const SAVE_KEY = 'industry_survival_v1';
const META_KEY = 'industry_meta_v1';

const App: React.FC = () => {
  const [stats, setStats] = useState<GameStats>(BLANK_STATS);
  const [meta, setMeta] = useState<MetaData>({ totalCareerPoints: 0, unlockedBadges: [], highScoreWeeks: 0, gameHistory: [] });
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
        try { setMeta(JSON.parse(savedMeta)); } catch(e) {}
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

  // Add missing goToCreation function to handle game start/resume logic.
  const goToCreation = () => {
    if (stats.week > 1) {
      setGameState(GameState.WEEK_START);
      startWeek(stats);
    } else {
      setGameState(GameState.CREATION);
    }
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
    
    setStats(startStats);
    setGameState(GameState.WEEK_START);
    saveGame(startStats);
    startWeek(startStats);
  };

  const startWeek = (currentStats: GameStats) => {
    if (currentStats.week > CONFIG.MAX_WEEKS) {
      handleGameEnd(currentStats, true);
      return;
    }
    const pool = getEventsForIndustry(currentStats.industry);
    const selectedEvent = pool[Math.floor(Math.random() * pool.length)];
    const updatedStats = { ...currentStats, location: selectedEvent.location };
    setCurrentEvent(selectedEvent);
    setStats(updatedStats);
    setGameState(GameState.WEEK_START);
    setTimeout(() => setGameState(GameState.EVENT), 1200); 
  };

  const handleOptionSelect = (optionIndex: number, e: React.MouseEvent) => {
    if (!currentEvent) return;
    const selectedOption = currentEvent.options[optionIndex];
    const effect = selectedOption.effect(stats);
    const newStats = {
      ...stats,
      stamina: Math.min(stats.maxStamina, stats.stamina + (effect.stamina || 0)),
      sanity: Math.min(stats.maxSanity, stats.sanity + (effect.sanity || 0)),
      money: stats.money + (effect.money || 0),
      exp: stats.exp + (effect.exp || 0),
      risk: Math.max(0, stats.risk + (effect.risk || 0))
    };
    setStats(newStats);
    setLastResult(effect);
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

  const handleGameEnd = (endStats: GameStats, isVictory: boolean) => {
      const record: GameRecord = {
          date: new Date().toLocaleDateString(),
          industry: endStats.industry,
          week: endStats.week,
          money: endStats.money,
          level: endStats.level,
          ending: isVictory ? "光荣退休" : "被迫离职",
          victory: isVictory
      };

      const newHistory = [record, ...(meta.gameHistory || [])].slice(0, 20);
      const newTotal = meta.totalCareerPoints + endStats.week;
      const newHigh = Math.max(meta.highScoreWeeks, endStats.week);
      
      saveMeta({
          ...meta,
          gameHistory: newHistory,
          totalCareerPoints: newTotal,
          highScoreWeeks: newHigh
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
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-8 overflow-hidden">
        <div className="w-full max-w-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-lg mb-8 transform rotate-3">
                <Building2 size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight text-[#1f2329]">行业生存记</h1>
            <p className="text-[#646a73] mb-8 text-center text-sm">选择你的赛道，开始内卷。</p>
            <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-xs font-bold mb-8">
                累计生涯点数: {meta.totalCareerPoints}
            </div>
            <button onClick={goToCreation} className="w-full bg-black text-white font-medium py-3.5 px-6 rounded-xl text-base shadow-sm active:scale-[0.98]">
                {stats.week > 1 ? `继续 (Week ${stats.week})` : '新人生'}
            </button>
            <button onClick={() => { setActiveTab(TabView.HISTORY); setGameState(GameState.WEEK_START); }} className="mt-4 text-sm text-[#3370ff] font-medium">查看往事回顾</button>
        </div>
      </div>
    );
  }

  if (gameState === GameState.CREATION) return <CharacterCreation onComplete={finalizeCreation} availableLegacyPoints={Math.floor(meta.totalCareerPoints / 10)} />;

  if (gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#444] p-6 text-center grayscale">
            <div className="bg-white rounded-2xl p-6 shadow-sm max-w-sm w-full grayscale-0">
                <h2 className="text-2xl font-bold mb-4">{gameState === GameState.VICTORY ? "大功告成" : "搬砖失败"}</h2>
                <button onClick={() => setGameState(GameState.START)} className="w-full bg-black text-white py-3 rounded-xl">重来</button>
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
                {gameState === GameState.WEEK_START && <div className="h-full flex items-center justify-center font-bold">Week {stats.week}</div>}
                {(gameState === GameState.EVENT || gameState === GameState.RESULT) && currentEvent && (
                    <>
                        <SceneHeader location={stats.location} industry={stats.industry} />
                        {gameState === GameState.EVENT ? <EventCard event={currentEvent} stats={stats} onOptionSelect={handleOptionSelect} /> : <ResultView result={lastResult!} onNext={handleAfterWork} />}
                    </>
                )}
                {gameState === GameState.WEEKEND && <WeekendView onSelect={handleWeekendChoice} isSmallWeek={stats.isSmallWeek} canOutsource={stats.attributes.tech > 15}/>}
            </>
        )}
        {activeTab === TabView.RESUME && <ResumeView stats={stats} />}
        {activeTab === TabView.SHOP && <ShopView stats={stats} onBuy={buyItem} />}
        {activeTab === TabView.HISTORY && <HistoryView meta={meta} onBack={() => setActiveTab(TabView.WORK)} />}
      </div>
      <BottomNav currentTab={activeTab} onTabChange={setActiveTab} disabled={false} />
    </div>
  );
};

export default App;
