import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_STATS, EVENTS } from './constants';
import { GameStats, GameState, GameEvent, OptionEffect, LEVELS, Attributes } from './types';
import StatBar from './components/StatBar';
import EventCard from './components/EventCard';
import ResultView from './components/ResultView';
import CharacterCreation from './components/CharacterCreation';
import EffectsCanvas, { EffectsCanvasHandle } from './components/EffectsCanvas';
import { RotateCcw, Building2, UserCheck, AlertTriangle, Trophy, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [lastResult, setLastResult] = useState<OptionEffect | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<EffectsCanvasHandle>(null);

  // Scroll to top on state change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [gameState]);

  const goToCreation = () => {
    setGameState(GameState.CREATION);
  };

  const finalizeCreation = (attributes: Attributes) => {
    setStats({
      ...INITIAL_STATS,
      attributes: attributes,
      // Attributes influence starting stats slightly
      stamina: 100 + (attributes.health - 5) * 2, 
      sanity: 100 + (attributes.grind - 5) * 2
    });
    setGameState(GameState.MORNING);
    nextDay({
      ...INITIAL_STATS,
      attributes: attributes,
      stamina: 100 + (attributes.health - 5) * 2,
      sanity: 100 + (attributes.grind - 5) * 2
    });
  };

  const nextDay = (currentStats: GameStats) => {
    if (currentStats.days > 365) {
      setGameState(GameState.VICTORY);
      return;
    }

    if (currentStats.stamina <= 0 || currentStats.sanity <= 0) {
      setGameState(GameState.GAME_OVER);
      return;
    }

    // Filter events that have unmet requirements (if any hard requirements exist on the event itself)
    const validEvents = EVENTS.filter(e => !e.requirements || e.requirements(currentStats));
    const randomEvent = validEvents[Math.floor(Math.random() * validEvents.length)];
    
    // Filter options based on attributes (Show/Hide logic handled in EventCard usually, but let's filter purely for logic if needed)
    // Actually, EventCard should render conditional options.

    setCurrentEvent(randomEvent);
    setGameState(GameState.MORNING);
    
    setTimeout(() => {
        setGameState(GameState.EVENT);
    }, 800);
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
    if (diffs.risk) spawn(`风险 ${diffs.risk > 0 ? '+' : ''}${diffs.risk}`, diffs.risk > 0 ? '#f54a45' : '#00b96b');
  };

  const handleOptionSelect = (optionIndex: number, e: React.MouseEvent) => {
    if (!currentEvent) return;

    const selectedOption = currentEvent.options[optionIndex];
    const effect = selectedOption.effect(stats);
    
    const diffs = {
      stamina: effect.stamina || 0,
      sanity: effect.sanity || 0,
      money: effect.money || 0,
      exp: effect.exp || 0,
      risk: effect.risk || 0
    };

    spawnFloatingStats(diffs, e.clientX, e.clientY);

    const newStats = {
      ...stats,
      stamina: Math.min(100 + (stats.attributes.health * 2), stats.stamina + diffs.stamina), // Max stamina based on Health
      sanity: Math.min(100 + (stats.attributes.grind * 2), stats.sanity + diffs.sanity), // Max sanity based on Grind
      money: stats.money + diffs.money,
      exp: stats.exp + diffs.exp,
      risk: Math.max(0, stats.risk + diffs.risk),
    };

    setStats(newStats);
    setLastResult(effect);
    setGameState(GameState.RESULT);
  };

  const handleAfterWork = (action: 'overtime' | 'leave', e: React.MouseEvent) => {
    let finalStats = { ...stats };
    const diffs: Partial<GameStats> = {};

    if (action === 'overtime') {
      // Grind (耐艹) reduces sanity loss from overtime
      const grindSave = Math.floor(stats.attributes.grind / 2); 
      
      diffs.exp = 15;
      diffs.stamina = -15;
      diffs.sanity = Math.min(-1, -5 + grindSave); // Min -1 loss
      diffs.risk = -2;
    } else {
      diffs.stamina = 5;
      diffs.sanity = 10;
      diffs.risk = 2;
    }
    
    spawnFloatingStats(diffs, e.clientX, e.clientY);

    finalStats.exp += diffs.exp || 0;
    
    // Apply caps based on attributes
    const maxStamina = 100 + (stats.attributes.health * 2);
    const maxSanity = 100 + (stats.attributes.grind * 2);

    finalStats.stamina = Math.min(maxStamina, finalStats.stamina + (diffs.stamina || 0));
    finalStats.sanity = Math.min(maxSanity, finalStats.sanity + (diffs.sanity || 0));
    finalStats.risk = Math.max(0, finalStats.risk + (diffs.risk || 0));

    // Daily Living Cost
    finalStats.money -= 100;

    // Check for level up
    const currentLevelIdx = finalStats.level - 1;
    const nextLevelCost = (currentLevelIdx + 1) * 100;
    
    if (finalStats.exp >= nextLevelCost && finalStats.level < LEVELS.length) {
      finalStats.level += 1;
      finalStats.exp = 0;
      finalStats.sanity = maxSanity; // Full heal on promotion
      alert(`恭喜晋升! 你现在是 ${LEVELS[finalStats.level - 1].title}, 薪水涨了!`);
    }

    if (finalStats.days % 30 === 0) {
      const salary = LEVELS[finalStats.level - 1].salary;
      finalStats.money += salary;
    }

    finalStats.days += 1;

    setStats(finalStats);
    nextDay(finalStats);
  };

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
            
            <div className="space-y-4 w-full">
                <button 
                  onClick={goToCreation}
                  className="w-full bg-[#3370ff] hover:bg-[#2b60d9] text-white font-medium py-3.5 px-6 rounded-xl text-base shadow-sm transition-all active:scale-[0.98]"
                >
                  办理入职
                </button>
            </div>
        </div>
      </div>
    );
  }

  if (gameState === GameState.CREATION) {
      return <CharacterCreation onComplete={finalizeCreation} />;
  }

  if (gameState === GameState.GAME_OVER) {
    const reason = stats.stamina <= 0 ? "身体被掏空" : "精神已离职";
    const subtext = stats.stamina <= 0 ? "长期996导致体力透支，被救护车拉走。" : "长期的PUA和无效会议让你彻底崩溃。";

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f5f6f7] p-6 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-sm w-full">
            <div className="w-16 h-16 bg-[#ffeceb] rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-[#f54a45]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1f2329] mb-2">{reason}</h2>
            <p className="text-[#646a73] text-sm mb-8 leading-relaxed">{subtext}</p>
            
            <div className="bg-[#f5f6f7] rounded-xl p-4 mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-[#646a73]">存活天数</span>
                    <span className="text-sm font-bold text-[#1f2329]">{stats.days} 天</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                     <span className="text-xs text-[#646a73]">入职画像</span>
                     <div className="flex space-x-1">
                        <span className="text-[10px] bg-gray-200 px-1 rounded text-gray-600">耐{stats.attributes.grind}</span>
                        <span className="text-[10px] bg-gray-200 px-1 rounded text-gray-600">智{stats.attributes.tech}</span>
                     </div>
                </div>
            </div>

            <button 
              onClick={() => setGameState(GameState.START)}
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
             <div className="w-16 h-16 bg-[#fff9c8] rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={32} className="text-[#ffc60a]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1f2329] mb-2">绩效 S+</h2>
            <p className="text-[#646a73] text-sm mb-6">你成功在大厂苟活了一年。</p>
            
            <div className="p-4 bg-[#f0f9ff] border border-[#d1e9ff] rounded-xl mb-6 text-left">
                <p className="text-xs text-[#3370ff] font-bold mb-1">年度总结</p>
                <p className="text-sm text-[#1f2329]">
                    {stats.attributes.tech > 15 && stats.level >= 6 ? "你成为了行业传说，技术大牛。" : 
                     stats.attributes.grind > 15 ? "你是真正的卷王，公司离不开你。" :
                     stats.attributes.luck > 15 ? "你靠运气一路躺赢，令人嫉妒。" :
                     "你是个合格的大厂螺丝钉。"}
                </p>
            </div>

            <button 
              onClick={() => setGameState(GameState.START)}
              className="w-full bg-[#3370ff] text-white font-medium py-3 rounded-xl hover:bg-[#2b60d9] transition-colors flex items-center justify-center"
            >
              <RotateCcw size={16} className="mr-2" /> 开启下一财年
            </button>
        </div>
      </div>
    );
  }

  if (gameState === GameState.MORNING) {
     return (
        <div className="h-screen flex flex-col bg-[#F5F6F7] max-w-md mx-auto relative shadow-2xl">
            <StatBar stats={stats} />
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-pulse">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <UserCheck size={32} className="text-[#3370ff]" />
                </div>
                <h2 className="text-lg font-bold text-[#1f2329]">Day {stats.days}</h2>
                <p className="text-[#646a73] text-sm mt-2">正在挤地铁上班...</p>
            </div>
        </div>
     )
  }

  return (
    <div className="h-screen flex flex-col bg-[#F5F6F7] max-w-md mx-auto relative shadow-2xl">
      <EffectsCanvas ref={canvasRef} />
      <StatBar stats={stats} />
      
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20" ref={scrollRef}>
        {gameState === GameState.EVENT && currentEvent && (
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
      </div>
    </div>
  );
};

export default App;