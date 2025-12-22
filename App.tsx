import React, { useState, useEffect, useRef } from 'react';
import { BLANK_STATS, CONFIG, SHOP_ITEMS, TITLES, INDUSTRIES, getEventsForIndustry, UNIVERSAL_CHAINED_EVENTS } from './constants';
import { GameStats, GameState, GameEvent, OptionEffect, LEVELS, Attributes, TabView, Location, ShopItem, EventCategory, MetaData, IndustryType, EventRarity } from './types';
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
import { Building2, UserCheck, AlertTriangle, Trophy, RotateCcw, FileBarChart, Bell } from 'lucide-react';

const SAVE_KEY = 'industry_survival_v1';
const META_KEY = 'industry_meta_v1';

const App: React.FC = () => {
  const [stats, setStats] = useState<GameStats>(BLANK_STATS);
  const [meta, setMeta] = useState<MetaData>({ totalCareerPoints: 0, unlockedBadges: [], highScoreWeeks: 0 });
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.WORK);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [lastResult, setLastResult] = useState<OptionEffect | null>(null);
  const [notifications, setNotifications] = useState<{id: number, text: string}[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<EffectsCanvasHandle>(null);

  // Load Save & Meta
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
                setGameState(GameState.WEEK_START);
                setTimeout(() => startWeek(parsed), 100);
            }
        } catch (e) {
            console.error("Failed to load save", e);
        }
    }
  }, []);

  // Visual Effects: Pressure Filter & Random Notifications
  useEffect(() => {
    if (stats.sanity < 30 && gameState === GameState.EVENT) {
        const interval = setInterval(() => {
            if (Math.random() < 0.3) {
                spawnNotification();
            }
        }, 3000);
        return () => clearInterval(interval);
    }
  }, [stats.sanity, gameState]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [gameState, activeTab]);

  const saveGame = (s: GameStats) => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  };
  
  const saveMeta = (newMeta: MetaData) => {
      localStorage.setItem(META_KEY, JSON.stringify(newMeta));
      setMeta(newMeta);
  }

  const spawnNotification = () => {
      const ind = INDUSTRIES[stats.industry];
      const msgs = [`${ind.text.overtime}通知`, `[全员] ${ind.text.progress}汇报`, "老板: @你 来看下这个", "系统: 报销驳回", `收到一个${ind.text.progress}会议`];
      const id = Date.now();
      const text = msgs[Math.floor(Math.random() * msgs.length)];
      setNotifications(prev => [...prev, { id, text }]);
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
      }, 3000);
  }

  const goToCreation = () => {
    setGameState(GameState.CREATION);
  };

  const finalizeCreation = (attributes: Attributes, industry: IndustryType, spentLegacyPoints: number) => {
    const indConfig = INDUSTRIES[industry];
    const mods = indConfig.modifiers;

    const maxStamina = 50 + attributes.health * 8 + mods.staminaBonus;
    const initialLevel = Math.min(LEVELS.length, 1 + Math.floor(attributes.tech / 5));
    
    let initialSalary = LEVELS[initialLevel - 1].salary * mods.salaryMultiplier;
    if (mods.techSalaryGate && attributes.tech < 10) initialSalary *= 0.5;

    const initialMoney = 1000 + (attributes.luck * 300) + (attributes.tech * 100);
    const initialSanityRate = Math.max(0.5, 1 - (attributes.eq * 0.02));

    const startStats: GameStats = {
      ...BLANK_STATS,
      industry: industry,
      attributes: attributes,
      stamina: maxStamina,
      maxStamina: maxStamina,
      sanity: Math.max(10, indConfig.modifiers.maxSanityCap - indConfig.modifiers.initialSanityPenalty),
      maxSanity: indConfig.modifiers.maxSanityCap,
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
      relationships: { boss: 30, colleague: 30, hr: 30 },
      activeBuffs: [],
      reviveUsed: false,
      legacyPointsUsed: spentLegacyPoints
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

    // 1. Process Buffs (Decrement duration, remove expired)
    const activeBuffs = currentStats.activeBuffs
        .map(b => ({ ...b, duration: b.duration - 1 }))
        .filter(b => b.duration >= 0);
    
    let updatedStats = { ...currentStats, activeBuffs };

    // 2. Industry Specifics
    const indConfig = INDUSTRIES[updatedStats.industry];
    const isSmallWeek = indConfig.modifiers.smallWeek && updatedStats.week % 2 === 0;
    
    let luckBypass = false;
    // Buff effect on luck?
    const buffLuck = activeBuffs.reduce((acc, b) => acc + (b.effect.luckMod || 0), 0);
    const totalLuck = updatedStats.attributes.luck + buffLuck;

    if (isSmallWeek && totalLuck > 15 && Math.random() < 0.2) {
        luckBypass = true;
        alert("🎉 狗屎运爆发！领导今天心情好，宣布本周单休改双休！");
    }
    const finalIsSmallWeek = isSmallWeek && !luckBypass;
    
    // Auto Sanity Drain (Police)
    if (indConfig.modifiers.weeklySanityDrain > 0) {
        updatedStats.sanity = Math.max(0, updatedStats.sanity - indConfig.modifiers.weeklySanityDrain);
    }

    // 3. CHECK CHAINED EVENTS (Universal)
    // Priority: Stamina > Sanity > Money
    let chainedEvent: GameEvent | null = null;
    if (updatedStats.stamina < 20) chainedEvent = UNIVERSAL_CHAINED_EVENTS.LOW_STAMINA(updatedStats.industry);
    else if (updatedStats.sanity < 20) chainedEvent = UNIVERSAL_CHAINED_EVENTS.LOW_SANITY(updatedStats.industry);
    else if (updatedStats.money < 500) chainedEvent = UNIVERSAL_CHAINED_EVENTS.LOW_MONEY(updatedStats.industry);

    if (chainedEvent) {
        setCurrentEvent(chainedEvent);
        setStats({...updatedStats, location: chainedEvent.location, isSmallWeek: finalIsSmallWeek});
        setGameState(GameState.WEEK_START);
        setTimeout(() => setGameState(GameState.EVENT), 1500);
        return;
    }

    // 4. Dynamic Event Selection (Luck Weighted)
    const pool = getEventsForIndustry(updatedStats.industry);
    
    // Categorize
    const goodEvents = pool.filter(e => e.rarity === EventRarity.EPIC || e.rarity === EventRarity.RARE);
    const normalEvents = pool.filter(e => e.rarity === EventRarity.COMMON || !e.rarity);
    
    // Base Chance for Good Event: 10% + Luck * 1.5% (Max around 40-50%)
    const goodChance = 10 + (totalLuck * 1.5);
    const roll = Math.random() * 100;

    let selectedEvent: GameEvent;
    
    // Force Small Week event if applicable
    if (finalIsSmallWeek && Math.random() < 0.7) {
        // We'll simulate a small week event or pick from pool if labeled
        // For now, let's just pick a "Routine" one but flavor text it? 
        // Or strictly stick to pool logic. Let's use the routine pool for now as fallback
        selectedEvent = normalEvents[Math.floor(Math.random() * normalEvents.length)];
    } else {
        if (roll < goodChance && goodEvents.length > 0) {
            selectedEvent = goodEvents[Math.floor(Math.random() * goodEvents.length)];
        } else {
            selectedEvent = normalEvents[Math.floor(Math.random() * normalEvents.length)];
        }
    }
    
    updatedStats = { ...updatedStats, isSmallWeek: finalIsSmallWeek, location: selectedEvent.location };

    setCurrentEvent(selectedEvent);
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
  };

  const handleOptionSelect = (optionIndex: number, e: React.MouseEvent) => {
    if (!currentEvent) return;
    const selectedOption = currentEvent.options[optionIndex];
    const effect = selectedOption.effect(stats);
    const indConfig = INDUSTRIES[stats.industry];

    const diffs = {
      stamina: effect.stamina || 0,
      sanity: effect.sanity || 0,
      money: effect.money || 0,
      exp: effect.exp || 0,
      risk: effect.risk || 0,
      level: effect.level || 0
    };

    // Apply Buffs to Costs
    const staminaMult = stats.activeBuffs.reduce((acc, b) => acc * (b.effect.staminaCostMod || 1), 1);
    const sanityMult = stats.activeBuffs.reduce((acc, b) => acc * (b.effect.sanityCostMod || 1), 1);
    
    if (diffs.stamina < 0) diffs.stamina *= staminaMult;
    if (diffs.sanity < 0) diffs.sanity *= sanityMult;

    // Design: Luck Bonus
    if (indConfig.modifiers.luckBonus && effect.attributes?.luck) {
        diffs.money += 2000;
        spawnFloatingStats({money: 2000}, e.clientX, e.clientY - 50);
    }

    spawnFloatingStats(diffs, e.clientX, e.clientY);

    let newAttr = { ...stats.attributes };
    if (effect.attributes) newAttr = { ...newAttr, ...effect.attributes };

    let newRel = { ...stats.relationships };
    if (effect.relationships) {
        if(effect.relationships.boss) newRel.boss = Math.min(100, Math.max(0, newRel.boss + effect.relationships.boss));
        if(effect.relationships.colleague) newRel.colleague = Math.min(100, Math.max(0, newRel.colleague + effect.relationships.colleague));
        if(effect.relationships.hr) newRel.hr = Math.min(100, Math.max(0, newRel.hr + effect.relationships.hr));
    }
    
    // Add Buff
    let newBuffs = [...stats.activeBuffs];
    if (effect.addBuff) {
        newBuffs.push(effect.addBuff);
        alert(`🔔 获得状态: ${effect.addBuff.name}\n${effect.addBuff.description}`);
    }

    // Handle Rank Change directly
    let newLevel = stats.level;
    let newSalary = stats.salary;
    if (diffs.level !== 0) {
        newLevel = Math.max(1, Math.min(LEVELS.length, stats.level + diffs.level));
        newSalary = LEVELS[newLevel - 1].salary * indConfig.modifiers.salaryMultiplier;
        if (newLevel > stats.level) {
            alert(`🎉 恭喜晋升! 你现在是 ${indConfig.text.levelName}${newLevel}, 周薪涨至 ${newSalary}${indConfig.text.currency}!`);
        } else if (newLevel < stats.level) {
            alert(`📉 惨遭降职! 你现在是 ${indConfig.text.levelName}${newLevel}, 周薪降至 ${newSalary}${indConfig.text.currency}。`);
        }
    }

    const newStats = {
      ...stats,
      stamina: Math.min(stats.maxStamina, stats.stamina + diffs.stamina),
      sanity: Math.min(stats.maxSanity, stats.sanity + diffs.sanity),
      money: stats.money + diffs.money,
      exp: stats.exp + diffs.exp,
      risk: Math.max(0, stats.risk + diffs.risk),
      level: newLevel,
      salary: newSalary,
      attributes: newAttr,
      relationships: newRel,
      activeBuffs: newBuffs
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
      const techBonus = stats.isSmallWeek ? stats.attributes.tech : 0;
      
      diffs.exp = 15 + techBonus;
      diffs.stamina = -15;
      diffs.sanity = Math.min(-1, (-5 + grindSave) * stats.sanityRate);
      finalStats.overtimeHours += 4;
    } else {
      diffs.stamina = 5;
      diffs.sanity = 5;
    }
    
    // Apply Buffs
    const staminaMult = stats.activeBuffs.reduce((acc, b) => acc * (b.effect.staminaCostMod || 1), 1);
    if (diffs.stamina && diffs.stamina < 0) diffs.stamina *= staminaMult;

    spawnFloatingStats(diffs, e.clientX, e.clientY);
    
    finalStats.exp += diffs.exp || 0;
    finalStats.stamina += diffs.stamina || 0;
    finalStats.sanity += diffs.sanity || 0;
    
    // DEATH CHECKS
    if (finalStats.stamina <= 0) {
        if (finalStats.money >= CONFIG.ICU_COST) {
            finalStats.money -= CONFIG.ICU_COST;
            finalStats.stamina = 20; 
            alert(`🏥 突发急病！被送进ICU抢救。\n扣除医药费 ${CONFIG.ICU_COST}${indConfig.text.currency}，体力恢复至20。`);
        } else {
            handleGameEnd({...finalStats, money: finalStats.money - CONFIG.ICU_COST}, false);
            return;
        }
    }
    
    if (finalStats.sanity <= 0) {
        handleGameEnd(finalStats, false);
        return;
    }

    setStats(finalStats);
    setGameState(GameState.WEEKEND);
    saveGame(finalStats);
  };

  const handleWeekendChoice = (choice: string) => {
      let diffs: Partial<GameStats> & { attr?: Partial<Attributes> } = {};
      let msg = "";

      if (stats.isSmallWeek && choice !== 'SLEEP') {
          return; 
      }

      switch(choice) {
          case 'SLEEP':
              const stamRec = stats.isSmallWeek 
                 ? CONFIG.WEEKEND_SLEEP_STAMINA * CONFIG.SMALL_WEEK_RECOVERY_RATE 
                 : CONFIG.WEEKEND_SLEEP_STAMINA;
              
              diffs = { stamina: stamRec, sanity: stats.isSmallWeek ? -CONFIG.SMALL_WEEK_SANITY_PENALTY : CONFIG.WEEKEND_SLEEP_SANITY };
              msg = stats.isSmallWeek ? "单休的一天，感觉刚躺下就天黑了。" : "睡了一整天，感觉活过来了。";
              break;
          case 'INVEST':
               if (stats.money < 5000) { alert("本金不足5000"); return; }
               const roll = Math.random();
               const cost = 5000;
               if (roll < 0.5) {
                   diffs = { money: -cost * 0.5 };
                   msg = "理财亏损了2500。";
               } else if (roll < 0.9) {
                   diffs = { money: cost * 0.5 };
                   msg = "小赚一笔，盈利2500。";
               } else {
                   diffs = { money: cost * 4 };
                   msg = "押中宝了！资产暴增20000！";
               }
               break;
          case 'OUTSOURCE':
               diffs = { stamina: -50, money: stats.salary * 2, risk: 10 };
               msg = "接了个私活通宵赶工，虽然累但赚了两倍工资。";
               break;
          case 'STUDY':
              if (stats.money < CONFIG.WEEKEND_STUDY_COST) { alert("钱不够！"); return; }
              diffs = { money: -CONFIG.WEEKEND_STUDY_COST, attr: { tech: 1 } };
              msg = "报了个班，技术提升了 (Tech+1)。";
              break;
          case 'GIG':
              diffs = { money: CONFIG.WEEKEND_GIG_MONEY, stamina: -CONFIG.WEEKEND_GIG_STAMINA_COST };
              msg = "接了个私活，累但充实。";
              break;
          case 'SOCIAL':
               if (stats.money < CONFIG.WEEKEND_SOCIAL_COST) { alert("钱不够！"); return; }
              const lucky = Math.random() > 0.7;
              diffs = { sanity: CONFIG.WEEKEND_SOCIAL_SANITY, money: -CONFIG.WEEKEND_SOCIAL_COST, attr: lucky ? { luck: 1 } : {} };
              msg = lucky ? "聚会很开心，还认识了大佬 (Luck+1)。" : "聚会很开心。";
              break;
      }
      
      let newStats = { ...stats };
      newStats.money += diffs.money || 0;
      newStats.stamina = Math.min(newStats.maxStamina, newStats.stamina + (diffs.stamina || 0));
      newStats.sanity = Math.min(newStats.maxSanity, newStats.sanity + (diffs.sanity || 0));
      if (diffs.attr) {
          newStats.attributes = { ...newStats.attributes, ...diffs.attr };
          if(diffs.attr.tech) newStats.attributes.tech = stats.attributes.tech + 1;
          if(diffs.attr.luck) newStats.attributes.luck = stats.attributes.luck + 1;
      }
      
      processWeeklySettlement(newStats, msg);
  };

  const processWeeklySettlement = (currentStats: GameStats, weekendMsg: string) => {
      const indConfig = INDUSTRIES[currentStats.industry];

      // 1. Income Modifiers
      let salaryMult = 1;
      if (currentStats.relationships.boss >= CONFIG.RELATIONSHIP_THRESHOLD_BONUS) salaryMult += 0.2;
      if (indConfig.modifiers.eqSalaryScaling) salaryMult += (currentStats.attributes.eq * 0.05);
      
      // Buff Modifiers
      const buffSalaryMod = currentStats.activeBuffs.reduce((acc, b) => acc * (b.effect.salaryMod || 1), 1);
      salaryMult *= buffSalaryMod;

      let netIncome = currentStats.salary * salaryMult;
      
      // Tax
      if (netIncome > 10000) netIncome -= (netIncome - 10000) * 0.1; 
      if (netIncome > 20000) netIncome -= (netIncome - 20000) * 0.15;
      
      currentStats.money += netIncome;
      
      // 2. Expenses
      const dynamicExpense = CONFIG.BASE_EXPENSE + (currentStats.money * CONFIG.LIFESTYLE_CREEP_RATE);
      currentStats.expenses = dynamicExpense;
      currentStats.money -= dynamicExpense;

      // 3. Revenge Spending
      const tankBuff = currentStats.titles.includes('铁人');
      if (!tankBuff && currentStats.sanity < CONFIG.REVENGE_SPENDING_THRESHOLD) {
          currentStats.money -= CONFIG.REVENGE_SPENDING_AMOUNT;
      }

      // 4. Debt
      if (currentStats.money < 0) currentStats.debtWeeks += 1;
      else currentStats.debtWeeks = 0;

      if (currentStats.debtWeeks >= CONFIG.DEBT_LIMIT) {
          handleGameEnd(currentStats, false);
          return;
      }

      // 5. Level Up
      const nextLevelCost = currentStats.level * 1000 + (currentStats.level * 500); 
      if (currentStats.exp >= nextLevelCost && currentStats.level < LEVELS.length) {
          currentStats.level += 1;
          currentStats.exp = 0;
          currentStats.sanity = 100;
          currentStats.salary = LEVELS[currentStats.level - 1].salary * indConfig.modifiers.salaryMultiplier;
          alert(`恭喜晋升! 你现在是 ${indConfig.text.levelName}${currentStats.level}, 周薪涨至 ${currentStats.salary}${indConfig.text.currency}!`);
      }

      // 6. Next
      currentStats.week += 1;
      setStats(currentStats);
      saveGame(currentStats);
      startWeek(currentStats);
  };

  const handleGameEnd = (endStats: GameStats, isVictory: boolean) => {
      // HR Revive Check
      if (!isVictory && endStats.relationships.hr >= CONFIG.RELATIONSHIP_THRESHOLD_BONUS && !endStats.reviveUsed) {
          if (window.confirm("HR为您争取了一次留职察看机会！是否使用？")) {
              setStats({
                  ...endStats,
                  sanity: 50,
                  stamina: 50,
                  money: Math.max(0, endStats.money),
                  debtWeeks: 0,
                  reviveUsed: true,
                  week: endStats.week 
              });
              alert("复活成功！请珍惜机会。");
              saveGame(endStats); 
              setGameState(GameState.WEEKEND); 
              return;
          }
      }

      const pointsEarned = endStats.week;
      const newTotal = meta.totalCareerPoints + pointsEarned;
      const newHigh = Math.max(meta.highScoreWeeks, endStats.week);
      
      saveMeta({
          ...meta,
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
      spawnFloatingStats({money: -item.price, ...effect}, window.innerWidth/2, window.innerHeight/2);
      setStats(prev => {
          const s = { ...prev, money: prev.money - item.price, ...effect };
          if (effect.attributes) s.attributes = { ...prev.attributes, ...effect.attributes };
          saveGame(s);
          return s;
      });
  };

  // Apply pressure filter class
  const pressureClass = stats.sanity < 30 ? "pressure-filter animate-shake" : "";
  const indConfig = INDUSTRIES[stats.industry];

  if (gameState === GameState.START) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-8 relative overflow-hidden">
        <div className="w-full max-w-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-lg mb-8 transform rotate-3">
                <Building2 size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight text-[#1f2329]">行业生存记</h1>
            <p className="text-[#646a73] mb-8 text-center text-sm">选择你的赛道，开始内卷。</p>
            
            <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-xs font-bold mb-8">
                生涯点数: {meta.totalCareerPoints} (历史最高: {meta.highScoreWeeks}周)
            </div>

            <button 
                onClick={goToCreation}
                className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3.5 px-6 rounded-xl text-base shadow-sm transition-all active:scale-[0.98]"
            >
                {stats.week > 1 ? `继续游戏 (Week ${stats.week})` : '开始新人生'}
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
      return <CharacterCreation onComplete={finalizeCreation} availableLegacyPoints={Math.floor(meta.totalCareerPoints / 10)} />;
  }

  if (gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) {
    const isVictory = gameState === GameState.VICTORY;
    let endingTitle = isVictory ? "幸存者" : "出局";
    let subtext = "";

    if (isVictory) {
        if (stats.money > 1000000) { endingTitle = "财务自由"; subtext = "你靠着行业红利实现了财务自由，提前退休。"; }
        else { subtext = "你苟过了一年，虽然发际线高了，但好歹活下来了。"; }
    } else {
        if (stats.debtWeeks >= CONFIG.DEBT_LIMIT) { endingTitle = "破产"; subtext = "断供失信，你在大城市再无立锥之地。"; }
        else if (stats.stamina <= 0) { endingTitle = "过劳"; subtext = "ICU的账单耗尽了你所有的积蓄。"; }
        else { endingTitle = "崩溃"; subtext = "你在工位上突然大哭，被保安带离了公司。"; }
    }

    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#444] p-6 text-center grayscale overflow-y-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm max-w-sm w-full grayscale-0 my-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isVictory ? 'bg-yellow-100' : 'bg-red-100'}`}>
                {isVictory ? <Trophy size={32} className="text-yellow-600"/> : <AlertTriangle size={32} className="text-red-600" />}
            </div>
            <h2 className="text-2xl font-bold text-[#1f2329] mb-2">{endingTitle}</h2>
            <p className="text-[#646a73] text-sm mb-6 leading-relaxed">{subtext}</p>
            
            <div className="bg-[#f5f6f7] rounded-xl p-4 mb-6 text-left">
                <h3 className="text-xs font-bold text-[#1f2329] mb-3 flex items-center uppercase tracking-wider">
                    <FileBarChart size={12} className="mr-1" /> 战报
                </h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-[#646a73]">行业</span>
                        <span className="font-bold">{indConfig?.name || '未知'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-[#646a73]">存活周数</span>
                        <span className="font-bold">{stats.week} 周</span>
                    </div>
                </div>
            </div>

            <button 
              onClick={() => {setStats(BLANK_STATS); setGameState(GameState.START);}}
              className="w-full bg-[#1f2329] text-white font-medium py-3 rounded-xl hover:bg-black transition-colors flex items-center justify-center"
            >
              <RotateCcw size={16} className="mr-2" /> 
              {isVictory ? '开启二周目' : '投胎重开'}
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col bg-[#F5F6F7] max-w-md mx-auto relative shadow-2xl overflow-hidden ${pressureClass}`}>
      <EffectsCanvas ref={canvasRef} />
      
      {/* Notifications Overlay */}
      <div className="absolute top-16 left-0 right-0 pointer-events-none z-50 flex flex-col items-center space-y-2 px-4">
          {notifications.map(n => (
              <div key={n.id} className="bg-white/90 backdrop-blur text-[#1f2329] text-xs px-4 py-2 rounded-full shadow-lg border border-blue-100 flex items-center animate-fade-in-up">
                  <Bell size={12} className="text-blue-500 mr-2" /> {n.text}
              </div>
          ))}
      </div>

      <StatBar stats={stats} />
      
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24" ref={scrollRef}>
        
        {activeTab === TabView.WORK && (
            <>
                {gameState === GameState.WEEK_START && (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-pulse">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm mb-4 bg-white`}>
                            <UserCheck size={32} style={{ color: indConfig.theme.primaryColor }} />
                        </div>
                        <h2 className={`text-lg font-bold text-[#1f2329]`}>Week {stats.week}</h2>
                        <p className="text-[#646a73] text-sm mt-2">{indConfig.name}的又一周开始了...</p>
                        {stats.activeBuffs.length > 0 && (
                            <div className="flex flex-wrap gap-1 justify-center mt-2 max-w-xs">
                                {stats.activeBuffs.map(b => (
                                    <span key={b.id} className={`text-[10px] px-1.5 py-0.5 rounded border ${b.isNegative ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'}`}>
                                        {b.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {(gameState === GameState.EVENT || gameState === GameState.RESULT) && currentEvent && (
                    <>
                        <SceneHeader location={stats.location} industry={stats.industry} />
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
                         <SceneHeader location={Location.HOME} industry={stats.industry} />
                         <WeekendView 
                            onSelect={handleWeekendChoice} 
                            isSmallWeek={stats.isSmallWeek} 
                            canOutsource={stats.attributes.tech > 15}
                        />
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