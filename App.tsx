import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_STATS, EVENTS, CONFIG, SHOP_ITEMS } from './constants';
import { GameStats, GameState, GameEvent, OptionEffect, LEVELS, Attributes, TabView, Location, ShopItem } from './types';
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
import { Building2, UserCheck, AlertTriangle, Trophy, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.WORK);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [lastResult, setLastResult] = useState<OptionEffect | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<EffectsCanvasHandle>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [gameState, activeTab]);

  const goToCreation = () => {
    setGameState(GameState.CREATION);
  };

  const finalizeCreation = (attributes: Attributes) => {
    const startStats = {
      ...INITIAL_STATS,
      attributes: attributes,
      stamina: 100 + (attributes.health - 5) * 2, 
      sanity: 100 + (attributes.grind - 5) * 2
    };
    setStats(startStats);
    setGameState(GameState.WEEK_START);
    startWeek(startStats);
  };

  const startWeek = (currentStats: GameStats) => {
    if (currentStats.week > CONFIG.MAX_WEEKS) {
      setGameState(GameState.VICTORY);
      return;
    }

    // Determine Location and Event
    // 1. Filter valid events
    const validEvents = EVENTS.filter(e => !e.requirements || e.requirements(currentStats));
    // 2. Pick one
    const randomEvent = validEvents[Math.floor(Math.random() * validEvents.length)];
    
    // Update State
    setCurrentEvent(randomEvent);
    setStats(prev => ({ ...prev, location: randomEvent.location }));
    
    // Transition
    setGameState(GameState.WEEK_START);
    setTimeout(() => {
        setGameState(GameState.EVENT);
    }, 1500); // Longer delay to see "Morning" screen
  };

  const spawnFloatingStats = (diffs: Partial<GameStats>, x: number, y: number) => {
    if (!canvasRef.current) return;
    let offset = 0;
    const spawn = (text: string, color: string) => {
        canvasRef.current?.spawnText(x, y - offset, text, color);
        offset += 25;
    };
    if (diffs.stamina) spawn(`体力 ${diffs.stamina > 0 ? '+' : ''}${diffs.stamina}`, diffs.stamina > 0 ? '#00b96b' : '#f54a45');
    if (diffs.sanity) spawn(`心智 ${diffs.sanity > 0 ? '+' : ''}${diffs.sanity}`, diffs.sanity > 0 ? '#3370ff' : '#f54a45');
    if (diffs.money) spawn(`金钱 ${diffs.money > 0 ? '+' : ''}${diffs.money}`, diffs.money > 0 ? '#ffc60a' : '#f54a45');
    if (diffs.exp) spawn(`经验 +${diffs.exp}`, '#3370ff');
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

    const maxStamina = 100 + stats.attributes.health * 2;
    const maxSanity = 100 + stats.attributes.grind * 2;

    const newStats = {
      ...stats,
      stamina: Math.min(maxStamina, stats.stamina + diffs.stamina),
      sanity: Math.min(maxSanity, stats.sanity + diffs.sanity),
      money: stats.money + diffs.money,
      exp: stats.exp + diffs.exp,
      risk: Math.max(0, stats.risk + diffs.risk),
    };

    setStats(newStats);
    setLastResult(effect);
    setGameState(GameState.RESULT);
  };

  const handleAfterWork = (action: 'overtime' | 'leave', e: React.MouseEvent) => {
    // Transition to Weekend
    // "Overtime" vs "Leave" here is just a flavor choice after the result, 
    // let's simplify logic: action just adds small stats then goes to Weekend.
    let finalStats = { ...stats };
    const diffs: Partial<GameStats> = {};

    if (action === 'overtime') {
      const grindSave = Math.floor(stats.attributes.grind / 2); 
      diffs.exp = 10;
      diffs.stamina = -10;
      diffs.sanity = Math.min(-1, -5 + grindSave);
    } else {
      diffs.stamina = 5;
      diffs.sanity = 5;
    }
    
    spawnFloatingStats(diffs, e.clientX, e.clientY);
    
    finalStats.exp += diffs.exp || 0;
    finalStats.stamina += diffs.stamina || 0;
    finalStats.sanity += diffs.sanity || 0;
    
    // Check Death
    if (finalStats.stamina <= 0 || finalStats.sanity <= 0) {
        setStats(finalStats);
        setGameState(GameState.GAME_OVER);
        return;
    }

    setStats(finalStats);
    setGameState(GameState.WEEKEND);
  };

  const handleWeekendChoice = (choice: 'SLEEP' | 'STUDY' | 'GIG' | 'SOCIAL') => {
      let diffs: Partial<GameStats> & { attr?: Partial<Attributes> } = {};
      let msg = "";

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
              msg = "报了个班，技术提升了。";
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
              msg = lucky ? "聚会很开心，还认识了大佬(Luck+1)。" : "聚会很开心。";
              break;
      }
      
      // Apply Weekend Diffs
      let newStats = { ...stats };
      newStats.money += diffs.money || 0;
      newStats.stamina += diffs.stamina || 0;
      newStats.sanity += diffs.sanity || 0;
      if (diffs.attr) {
          newStats.attributes = { ...newStats.attributes, ...diffs.attr };
          if(diffs.attr.tech) newStats.attributes.tech = stats.attributes.tech + 1; // Explicit add for nested
          if(diffs.attr.luck) newStats.attributes.luck = stats.attributes.luck + 1;
      }
      
      // Weekly Settlement
      processWeeklySettlement(newStats, msg);
  };

  const processWeeklySettlement = (currentStats: GameStats, weekendMsg: string) => {
      // 1. Income
      currentStats.money += currentStats.salary;
      
      // 2. Expenses
      currentStats.money -= CONFIG.BASE_EXPENSE;

      // 3. Revenge Spending
      let revengeMsg = "";
      if (currentStats.sanity < CONFIG.REVENGE_SPENDING_THRESHOLD) {
          currentStats.money -= CONFIG.REVENGE_SPENDING_AMOUNT;
          revengeMsg = ` 压力过大(心智<${CONFIG.REVENGE_SPENDING_THRESHOLD})，报复性消费扣除 ¥${CONFIG.REVENGE_SPENDING_AMOUNT}。`;
      }

      // 4. Bankruptcy Check
      if (currentStats.money < 0) {
          currentStats.bankruptcyCount += 1;
      } else {
          currentStats.bankruptcyCount = 0; // Reset if positive? Or keep strict? Let's reset.
      }

      if (currentStats.bankruptcyCount >= CONFIG.BANKRUPTCY_LIMIT) {
          setStats(currentStats);
          setGameState(GameState.GAME_OVER);
          return;
      }

      // 5. Level Up Check
      const nextLevelCost = currentStats.level * 100;
      if (currentStats.exp >= nextLevelCost && currentStats.level < LEVELS.length) {
          currentStats.level += 1;
          currentStats.exp = 0;
          currentStats.sanity = 100; // Full heal
          currentStats.salary = LEVELS[currentStats.level - 1].salary;
          alert(`恭喜晋升! 你现在是 ${LEVELS[currentStats.level - 1].title}, 周薪涨至 ¥${currentStats.salary}!`);
      }

      // 6. Next Week
      currentStats.week += 1;
      setStats(currentStats);
      
      // Trigger Next
      startWeek(currentStats);
  };

  const buyItem = (item: ShopItem) => {
      if (stats.money < item.price) return;
      const effect = item.effect(stats);
      
      spawnFloatingStats({money: -item.price, ...effect}, window.innerWidth/2, window.innerHeight/2);
      
      setStats(prev => {
          const s = { ...prev, money: prev.money - item.price, ...effect };
          if (effect.attributes) {
             s.attributes = { ...prev.attributes, ...effect.attributes };
          }
          return s;
      });
  };

  // --- RENDER HELPERS ---
  const isInteracting = gameState === GameState.EVENT || gameState === GameState.RESULT || gameState === GameState.WEEKEND;

  // Render Screens
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
                办理入职
            </button>
        </div>
      </div>
    );
  }

  if (gameState === GameState.CREATION) {
      return <CharacterCreation onComplete={finalizeCreation} />;
  }

  if (gameState === GameState.GAME_OVER) {
    const isBankrupt = stats.bankruptcyCount >= CONFIG.BANKRUPTCY_LIMIT;
    const reason = isBankrupt ? "个人破产" : (stats.stamina <= 0 ? "过劳猝死" : "精神崩溃");
    const subtext = isBankrupt 
        ? "连续两周资不抵债，你被迫退掉出租屋，提桶跑路回老家考公。" 
        : (stats.stamina <= 0 ? "长期996导致体力透支，在工位上倒下。" : "长期的PUA让你彻底疯狂，裸辞去大理摆摊了。");

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#444] p-6 text-center grayscale">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-sm w-full grayscale-0">
            <div className="w-16 h-16 bg-[#ffeceb] rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-[#f54a45]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1f2329] mb-2">{reason}</h2>
            <p className="text-[#646a73] text-sm mb-8 leading-relaxed">{subtext}</p>
            <div className="bg-[#f5f6f7] rounded-xl p-4 mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-[#646a73]">存活周数</span>
                    <span className="text-sm font-bold text-[#1f2329]">Week {stats.week}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-[#646a73]">最终职级</span>
                    <span className="text-sm font-bold text-[#3370ff]">{LEVELS[stats.level-1].title}</span>
                </div>
            </div>
            <button 
              onClick={() => {setStats(INITIAL_STATS); setGameState(GameState.START);}}
              className="w-full bg-[#1f2329] text-white font-medium py-3 rounded-xl hover:bg-black transition-colors flex items-center justify-center"
            >
              <RotateCcw size={16} className="mr-2" /> 重新投递简历
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
                <button 
                  onClick={() => {setStats(INITIAL_STATS); setGameState(GameState.START);}}
                  className="w-full bg-[#3370ff] text-white font-medium py-3 rounded-xl"
                >
                  下一年继续卷
                </button>
             </div>
        </div>
      );
  }

  // MAIN GAME LOOP UI
  return (
    <div className="h-screen flex flex-col bg-[#F5F6F7] max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <EffectsCanvas ref={canvasRef} />
      <StatBar stats={stats} />
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24" ref={scrollRef}>
        
        {/* VIEW: WORK (Main Game Loop) */}
        {activeTab === TabView.WORK && (
            <>
                {gameState === GameState.WEEK_START && (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-pulse">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <UserCheck size={32} className="text-[#3370ff]" />
                        </div>
                        <h2 className="text-lg font-bold text-[#1f2329]">Week {stats.week}</h2>
                        <p className="text-[#646a73] text-sm mt-2">周一综合症犯了...</p>
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
                         <WeekendView onSelect={handleWeekendChoice} />
                    </>
                )}
            </>
        )}

        {/* VIEW: RESUME */}
        {activeTab === TabView.RESUME && (
            <ResumeView stats={stats} />
        )}

        {/* VIEW: SHOP */}
        {activeTab === TabView.SHOP && (
            <ShopView stats={stats} onBuy={buyItem} />
        )}

      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        currentTab={activeTab} 
        onTabChange={setActiveTab} 
        // Only disable switching during critical animations if desired, but general nav should be open
        disabled={false} 
      />
    </div>
  );
};

export default App;