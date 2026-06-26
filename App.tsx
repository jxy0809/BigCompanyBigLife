import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { BLANK_STATS, CONFIG, SHOP_ITEMS, INDUSTRIES, getEventsForIndustry, BUFFS } from './constants';
import { GameStats, GameState, GameEvent, OptionEffect, LEVELS, Attributes, TabView, Location, ShopItem, EventCategory, MetaData, IndustryType, EventRarity, GameRecord } from './types';
import StatBar from './components/StatBar';
import EventCard from './components/EventCard';
import ResultView from './components/ResultView';
import CharacterCreation from './components/CharacterCreation';
import EffectsCanvas, { EffectsCanvasHandle } from './components/EffectsCanvas';
import BottomNav from './components/BottomNav';
import ResumeView from './components/ResumeView';
import SceneHeader from './components/SceneHeader';
import { storageManager } from './storage/storageManager';
import { appLifecycle } from './platform/lifecycle';
import { leaderboardClient } from './leaderboard/leaderboardClient';
import { tapTapAdClient, AdPlacement } from './ads';
import { AdLoadState } from './ads';
import { tapTapMCP } from './platform/tapTapMCP';
import { soundManager } from './audio/SoundManager';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';
import RatingPromptModal from './components/RatingPromptModal';
import { Building2, Award, QrCode, Sun, RotateCcw, Play } from 'lucide-react';

// Code-split heavy views
const LeaderboardView = lazy(() => import('./components/LeaderboardView'));
const ShopView = lazy(() => import('./components/ShopView'));
const HistoryView = lazy(() => import('./components/HistoryView'));
const WeekendView = lazy(() => import('./components/WeekendView'));

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
  const [storageReady, setStorageReady] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isCrisisOverlay, setIsCrisisOverlay] = useState(false);
  const [isFortuneGlow, setIsFortuneGlow] = useState(false);
  const [pageTransition, setPageTransition] = useState<string>('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pendingRatingAction, setPendingRatingAction] = useState<(() => void) | null>(null);
  const [reviveAdState, setReviveAdState] = useState<AdLoadState>(AdLoadState.IDLE);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<EffectsCanvasHandle>(null);

  // Initialize storage, lifecycle, and ad client
  useEffect(() => {
    const init = async () => {
      await storageManager.init();
      await tapTapAdClient.init();
      setStorageReady(true);
    };
    init();

    // Set up lifecycle handlers
    appLifecycle.init({
      onPause: () => {
        // Auto-save on pause
        if (stats.week > 0) {
          storageManager.saveGame({ ...stats });
          storageManager.saveMeta({ ...meta });
        }
      },
      onResume: () => {
        console.log('[App] Resumed');
      },
    });

    return () => {
      appLifecycle.destroy();
    };
  }, []);

  // Load saved data after storage is ready
  useEffect(() => {
    if (!storageReady) return;

    const loadData = async () => {
      const gameResult = await storageManager.loadGame();
      const metaResult = await storageManager.loadMeta();

      if (metaResult.data) {
        let m = metaResult.data;
        if (!m.unlockedIndustries) m.unlockedIndustries = [IndustryType.INTERNET];
        setMeta(m);
      }

      if (gameResult.data) {
        setStats(gameResult.data);
      }
    };

    loadData();
  }, [storageReady]);

  const saveGame = useCallback(async (s: GameStats) => {
    await storageManager.saveGame(s);
  }, []);
  
  const saveMeta = useCallback(async (newMeta: MetaData) => {
    await storageManager.saveMeta(newMeta);
    setMeta(newMeta);
  }, []);

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

          // P1: Push community dynamic for industry unlock
          tapTapMCP.pushCommunityDynamic({
            type: 'milestone',
            title: '解锁新行业',
            message: `我成功解锁了${INDUSTRIES[newUnlock].name}行业！`,
          }).catch(() => {});

          // P1: Report challenge data
          tapTapMCP.reportChallenge({
            eventType: 'industry_unlock',
            data: { industry: newUnlock, unlockedCount: updatedUnlocked.length },
            timestamp: new Date().toISOString(),
          }).catch(() => {});
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
    // P1: Reset ad session for new game
    tapTapAdClient.resetSession();
    setReviveAdState(AdLoadState.IDLE);
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

    if (industry === IndustryType.METRO) {
        startStats.activeBuffs.push(BUFFS.STABILITY(999));
        alert("【入职宣誓】\n我志愿献身大国重器，严守工艺纪律，确保行车安全。\n获得永久Buff: 铁饭碗 (心智消耗-20%, 风险抵御-50)");
    }
    
    setStats(startStats);
    setGameState(GameState.WEEK_START);
    saveGame(startStats);
    // P1: Start industry BGM
    soundManager.playBgm(industry);
    startWeek(startStats);
  };

  const startWeek = (currentStats: GameStats) => {
    checkIndustryUnlock(currentStats);

    // P1: Achievement milestone push
    const milestones = [10, 20, 30, 40, 50];
    if (milestones.includes(currentStats.week)) {
      tapTapMCP.pushCommunityDynamic({
        type: 'milestone',
        title: '里程碑达成',
        message: `我已经在大厂风云中坚持了${currentStats.week}周！`,
      }).catch(() => {});

      tapTapMCP.reportChallenge({
        eventType: 'achievement',
        data: { achievement: `survive_${currentStats.week}_weeks`, week: currentStats.week },
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }

    if (currentStats.week > CONFIG.MAX_WEEKS) {
      handleGameEnd(currentStats, true);
      return;
    }

    const indConfig = INDUSTRIES[currentStats.industry];
    const isSmallWeek = indConfig.modifiers.smallWeek && (currentStats.week % 2 === 0);

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
    setTimeout(() => setGameState(GameState.EVENT), 1500);
  };

  const handleRetire = () => {
    soundManager.playSfx('retire');
    setGameState(GameState.RETIRING);
    setTimeout(() => {
        handleGameEnd(stats, true, "提前退休"); 
    }, 3000);
  };

  const handleOptionSelect = (optionIndex: number, e: React.MouseEvent) => {
    if (!currentEvent) return;
    const selectedOption = currentEvent.options[optionIndex];
    const effect = selectedOption.effect(stats);

    let staminaDelta = effect.stamina || 0;
    let sanityDelta = effect.sanity || 0;
    let riskDelta = effect.risk || 0;

    stats.activeBuffs.forEach(buff => {
        if (staminaDelta < 0 && buff.effect.staminaCostMod !== undefined) {
            staminaDelta *= buff.effect.staminaCostMod;
        }
        if (sanityDelta < 0 && buff.effect.sanityCostMod !== undefined) {
            sanityDelta *= buff.effect.sanityCostMod;
        }
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
      level: Math.max(1, stats.level + (effect.level || 0))
    };
    
    if (effect.addBuff) {
        newStats.activeBuffs = [...newStats.activeBuffs, effect.addBuff];
    }
    
    if (effect.attributes) {
        // Add deltas instead of overwriting (was a bug: spread merge would SET values)
        const mergedAttrs = { ...newStats.attributes };
        for (const key of Object.keys(effect.attributes) as (keyof Attributes)[]) {
            const delta = effect.attributes[key];
            if (delta !== undefined) {
                mergedAttrs[key] = (mergedAttrs[key] || 0) + delta;
            }
        }
        newStats.attributes = mergedAttrs;
    }
    if (effect.relationships) {
        newStats.relationships = {
            boss: (newStats.relationships.boss || 30) + (effect.relationships.boss || 0),
            colleague: (newStats.relationships.colleague || 30) + (effect.relationships.colleague || 0),
            hr: (newStats.relationships.hr || 30) + (effect.relationships.hr || 0)
        }
    }

    setStats(newStats);
    setLastResult({ ...effect, stamina: staminaDelta, sanity: sanityDelta, risk: riskDelta });

    // P1: Sound effects based on event category
    const category = currentEvent.category;
    if (category === EventCategory.CRISIS) {
      soundManager.onCrisis();
      setIsScreenShaking(true);
      setIsCrisisOverlay(true);
      setTimeout(() => { setIsScreenShaking(false); setIsCrisisOverlay(false); }, 600);
    } else if (category === EventCategory.FATE) {
      soundManager.onFortune();
      setIsFortuneGlow(true);
      setTimeout(() => setIsFortuneGlow(false), 1000);
    } else if (category === EventCategory.CHOICE) {
      soundManager.playSfx('eventChoice');
    } else {
      soundManager.playSfx('eventRoutine');
    }

    // Money change sound + floating text effect
    if (effect.money && effect.money !== 0) {
      soundManager.onMoneyChange(effect.money);
      if (canvasRef.current) {
        const color = effect.money > 0 ? '#00b96b' : '#f54a45';
        const text = effect.money > 0 ? `+${effect.money}` : `${effect.money}`;
        canvasRef.current.spawnText(window.innerWidth / 2, window.innerHeight * 0.4, text, color);
      }
    }

    // Level up effect
    if (effect.level && effect.level > 0) {
      soundManager.onLevelUp();
    }

    // Buff/debuff sound
    if (effect.addBuff) {
      if (effect.addBuff.isNegative) {
        soundManager.playSfx('debuffApply');
      } else {
        soundManager.playSfx('buffApply');
      }
    }

    // Page transition effect
    setPageTransition('event-result-transition');

    setGameState(GameState.RESULT);
    saveGame(newStats);
  };

  const handleAfterWork = (action: 'overtime' | 'leave', e: React.MouseEvent) => {
    soundManager.onButtonClick();
    let finalStats = { ...stats };
    if (action === 'overtime') {
      finalStats.exp += 20; finalStats.stamina -= 20;
    } else {
      finalStats.sanity += 10;
    }
    
    finalStats.activeBuffs = finalStats.activeBuffs.map(b => ({...b, duration: b.duration - 1})).filter(b => b.duration > 0);

    if (finalStats.stamina <= 0 || finalStats.sanity <= 0) {
        handleGameEnd(finalStats, false); return;
    }
    setStats(finalStats);
    setGameState(GameState.WEEKEND);
    saveGame(finalStats);
  };

  const handleWeekendChoice = (choice: string) => {
      soundManager.onButtonClick();
      let currentStats = { ...stats };

      if (currentStats.isSmallWeek) {
        // ── 小周（单休）：强制"苟延残喘"，恢复极弱 ──
        const staminaRecovery = Math.floor(CONFIG.WEEKEND_SLEEP_STAMINA * CONFIG.SMALL_WEEK_RECOVERY_RATE);
        currentStats.stamina = Math.min(currentStats.maxStamina, currentStats.stamina + staminaRecovery);
        currentStats.sanity = Math.max(0, currentStats.sanity - CONFIG.SMALL_WEEK_SANITY_PENALTY);
      } else {
        // ── 大周（双休）：完整周末选项 ──
        switch (choice) {
          case 'SLEEP':
            // 疯狂补觉：体力+40, 心智+20
            currentStats.stamina = Math.min(currentStats.maxStamina, currentStats.stamina + CONFIG.WEEKEND_SLEEP_STAMINA);
            currentStats.sanity = Math.min(currentStats.maxSanity, currentStats.sanity + CONFIG.WEEKEND_SLEEP_SANITY);
            break;
          case 'STUDY':
            // 技能进阶：技术+1, 金钱-1500
            currentStats.money -= CONFIG.WEEKEND_STUDY_COST;
            currentStats.attributes = { ...currentStats.attributes, tech: currentStats.attributes.tech + 1 };
            break;
          case 'GIG':
            // 兼职私活：金钱+3000, 体力-40
            currentStats.money += CONFIG.WEEKEND_GIG_MONEY;
            currentStats.stamina = Math.max(0, currentStats.stamina - CONFIG.WEEKEND_GIG_STAMINA_COST);
            break;
          case 'SOCIAL':
            // 社交聚会：心智+35, 金钱-1200
            currentStats.sanity = Math.min(currentStats.maxSanity, currentStats.sanity + CONFIG.WEEKEND_SOCIAL_SANITY);
            currentStats.money -= CONFIG.WEEKEND_SOCIAL_COST;
            break;
          case 'OUTSOURCE':
            // 接外包：双倍工资, 体力-50 (已在 WeekendView 中通过 canOutsource 条件控制可见性)
            if (currentStats.attributes.tech > 15) {
              const outsourcePay = currentStats.salary * 2;
              currentStats.money += outsourcePay;
              currentStats.stamina = Math.max(0, currentStats.stamina - 50);
            }
            break;
          case 'INVEST':
            // 理财投资：高风险高回报（运气属性提高胜率）
            {
              const luckBonus = currentStats.attributes.luck || 0;
              const winRate = 0.55 + luckBonus * 0.008; // 基础55%，运气每点+0.8%
              if (Math.random() < winRate) {
                const gain = 2500 + Math.floor(Math.random() * 5500);
                currentStats.money += gain;
              } else {
                const loss = 1000 + Math.floor(Math.random() * 3000);
                currentStats.money -= loss;
              }
            }
            break;
          default:
            break;
        }
      }

      currentStats.week += 1;
      setStats(currentStats);
      saveGame(currentStats);
      startWeek(currentStats);
  };

  /** P1: Handle ad reward for weekend bonus - extra stamina + sanity */
  const handleAdWeekendReward = () => {
    const updated = {
      ...stats,
      stamina: Math.min(stats.maxStamina, stats.stamina + 15),
      sanity: Math.min(stats.maxSanity, stats.sanity + 10),
    };
    setStats(updated);
    saveGame(updated);
  };

  /** P1: Handle double reward from ad - apply doubled stats */
  const handleDoubleReward = (doubledResult: OptionEffect) => {
    // The doubled result has already been applied via handleOptionSelect
    // We track it here for the UI display (marked as doubled)
    setLastResult(doubledResult);
  };

  /** P1: Handle ad discount for shop - tracked locally in ShopView */
  const handleAdDiscount = () => {
    // Discount applied locally in ShopView component
  };

  /** P1: Handle revive via watching ad */
  const handleRevive = async () => {
    // Preload ad if not ready
    if (!tapTapAdClient.canShowAd(AdPlacement.REVIVE) && !tapTapAdClient.isAdFreeToday()) {
      return;
    }

    setReviveAdState(AdLoadState.SHOWING);

    const result = await tapTapAdClient.showAd(AdPlacement.REVIVE);
    if (result.completed) {
      // Revive the player: restore some stamina and sanity
      const revivedStats = {
        ...stats,
        stamina: Math.floor(stats.maxStamina * 0.5),
        sanity: Math.floor(stats.maxSanity * 0.5),
        reviveUsed: true,
      };
      setStats(revivedStats);
      saveGame(revivedStats);
      soundManager.onButtonClick();
      setReviveAdState(AdLoadState.COMPLETED);
      // Go back to weekend/week start
      startWeek(revivedStats);
    } else if (result.skipped) {
      setReviveAdState(AdLoadState.SKIPPED);
    } else {
      setReviveAdState(AdLoadState.FAILED);
    }
  };

  // Preload revive ad when entering GAME_OVER screen
  useEffect(() => {
    if (gameState === GameState.GAME_OVER && !stats.reviveUsed) {
      setReviveAdState(AdLoadState.LOADING);
      tapTapAdClient.preloadAd(AdPlacement.REVIVE).then(() => {
        setReviveAdState(AdLoadState.READY);
      });
    }
  }, [gameState, stats.reviveUsed]);

  /** P1: Handle rating prompt actions */
  const handleRateNow = () => {
    tapTapMCP.markRated();
    setShowRatingModal(false);
    tapTapMCP.pushCommunityDynamic({
      type: 'milestone',
      title: '评价大厂风云',
      message: '给大厂风云五星好评！',
    }).catch(() => {});
  };

  const handleRateLater = () => {
    setShowRatingModal(false);
  };

  const handleGameEnd = async (endStats: GameStats, isVictory: boolean, specificEnding?: string) => {
      // P1: Game over sound effect
      soundManager.onGameOver(isVictory);
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
      
      const newMeta = {
          ...meta,
          gameHistory: newHistory,
          totalCareerPoints: newTotal,
          highScoreWeeks: newHigh,
          unlockedIndustries: meta.unlockedIndustries
      };

      await saveMeta(newMeta);
      await storageManager.removeGame();

      // Submit scores to leaderboard on game end
      leaderboardClient.submitScores(endStats).catch(err => {
        console.warn('[App] Leaderboard score submission failed:', err);
      });

      // P1: Community push on game end
      tapTapMCP.incrementGameCount();
      tapTapMCP.pushCommunityDynamic({
        type: 'game_end',
        title: isVictory ? '成功退休！' : '职场告一段落',
        message: isVictory
          ? `我在《大厂风云》中成功坚守${endStats.week}周，${endStats.money}元光荣退休！`
          : `我在《大厂风云》中坚持了${endStats.week}周，积累${endStats.money}元后离职...`,
        extra: { week: endStats.week, money: endStats.money, level: endStats.level, industry: endStats.industry },
      }).catch(() => {});

      // P1: Challenge data reporting
      tapTapMCP.reportChallenge({
        eventType: 'game_end',
        data: { week: endStats.week, money: endStats.money, level: endStats.level, victory: isVictory, industry: endStats.industry },
        timestamp: new Date().toISOString(),
      }).catch(() => {});

      // P1: Show rating prompt after game end (every 3 games)
      tapTapMCP.showRatingPrompt().then((ratingResult) => {
        if (ratingResult.shown && !ratingResult.rated) {
          // Show modal after a short delay so the game over screen appears first
          setTimeout(() => setShowRatingModal(true), 1500);
        }
      }).catch(() => {});

      // Reset ad session for next game
      tapTapAdClient.resetSession();

      setStats(endStats);
      setGameState(isVictory ? GameState.VICTORY : GameState.GAME_OVER);
  };

  const buyItem = (item: ShopItem) => {
      if (stats.money < item.price) return;
      soundManager.playSfx('shopBuy');
      soundManager.vibrate(10);
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
      <div className="h-screen flex flex-col items-center justify-center bg-white p-8 overflow-hidden select-none">
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
                     <button onClick={() => { soundManager.vibrate(10); goToCreation(); }} className="w-full bg-black text-white font-medium py-3.5 px-6 rounded-xl text-base shadow-sm active:scale-[0.98] flex items-center justify-center">
                        <Play size={18} className="mr-2 fill-current" /> 继续 (Week {stats.week})
                    </button>
                    <button onClick={() => { soundManager.vibrate(10); startNewGame(); }} className="w-full bg-white border border-[#dee0e3] text-[#1f2329] font-medium py-3.5 px-6 rounded-xl text-base shadow-sm active:scale-[0.98] flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <RotateCcw size={18} className="mr-2" /> 重新开始
                    </button>
                </div>
            ) : (
                <button onClick={() => { soundManager.vibrate(10); goToCreation(); }} className="w-full bg-black text-white font-medium py-3.5 px-6 rounded-xl text-base shadow-sm active:scale-[0.98]">
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
      if (gameState === GameState.VICTORY && stats.industry === IndustryType.METRO) {
          return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#1e293b] p-6 text-center text-white relative overflow-hidden metro-ending">
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
        <div className={`h-screen flex flex-col items-center justify-center bg-[#444] p-6 text-center grayscale ${gameState === GameState.VICTORY ? 'victory-transition' : 'death-transition'}`}>
            <div className="bg-white rounded-2xl p-6 shadow-sm max-w-sm w-full grayscale-0">
                <h2 className="text-2xl font-bold mb-4">{gameState === GameState.VICTORY ? "退休快乐" : "搬砖失败"}</h2>
                <p className="text-gray-500 mb-6">{gameState === GameState.VICTORY ? "你成功摆脱了内卷，开启了第二人生。" : "很遗憾，你没能撑到最后。"}</p>

                {/* Revive via ad — only on GAME_OVER (not VICTORY) and not already used */}
                {gameState === GameState.GAME_OVER && !stats.reviveUsed && (
                  <div className="mb-4">
                    <button
                      onClick={handleRevive}
                      disabled={
                        reviveAdState === AdLoadState.LOADING ||
                        reviveAdState === AdLoadState.SHOWING ||
                        reviveAdState === AdLoadState.COMPLETED
                      }
                      className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm transition-all ${
                        reviveAdState === AdLoadState.COMPLETED
                          ? 'bg-green-100 text-green-700'
                          : reviveAdState === AdLoadState.FAILED
                          ? 'bg-red-50 text-red-600'
                          : reviveAdState === AdLoadState.LOADING
                          ? 'bg-blue-50 text-blue-400'
                          : reviveAdState === AdLoadState.SHOWING
                          ? 'bg-blue-50 text-blue-600'
                          : reviveAdState === AdLoadState.READY
                          ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg hover:from-orange-500 hover:to-red-600 active:scale-[0.98]'
                          : 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg hover:from-orange-500 hover:to-red-600 active:scale-[0.98]'
                      }`}
                    >
                      <RotateCcw size={18} className={
                        reviveAdState === AdLoadState.LOADING || reviveAdState === AdLoadState.SHOWING ? 'animate-spin' : ''
                      } />
                      <span>
                        {reviveAdState === AdLoadState.IDLE && '看广告 · 原地复活'}
                        {reviveAdState === AdLoadState.LOADING && '广告加载中...'}
                        {reviveAdState === AdLoadState.READY && '看广告 · 原地复活'}
                        {reviveAdState === AdLoadState.SHOWING && '广告播放中...'}
                        {reviveAdState === AdLoadState.COMPLETED && '✅ 已复活！继续搬砖'}
                        {reviveAdState === AdLoadState.FAILED && '❌ 复活失败'}
                        {reviveAdState === AdLoadState.SKIPPED && '看广告 · 原地复活'}
                      </span>
                    </button>
                    {(reviveAdState === AdLoadState.IDLE || reviveAdState === AdLoadState.READY) && (
                      <p className="text-gray-400 text-xs mt-2">
                        🎬 观看激励广告，体力与心智恢复至 50%（本局仅限 1 次）
                      </p>
                    )}
                    {reviveAdState === AdLoadState.FAILED && (
                      <button
                        onClick={handleRevive}
                        className="text-blue-500 text-xs mt-2 underline"
                      >
                        重新尝试看广告复活
                      </button>
                    )}
                  </div>
                )}

                <button onClick={() => setGameState(GameState.START)} className="w-full bg-black text-white py-3 rounded-xl">返回主界面</button>
            </div>
        </div>
      );
  }

  return (
    <div className={`app-container ${isScreenShaking ? 'screen-shake' : ''} ${isFortuneGlow ? 'fortune-glow' : ''}`}>
      <OfflineBanner />
      {/* P1: Effects canvas for floating text / particles */}
      <EffectsCanvas ref={canvasRef} />
      {/* P1: Crisis red overlay */}
      {isCrisisOverlay && <div className="fixed inset-0 z-40 crisis-overlay pointer-events-none" />}
      <StatBar stats={stats} />
      <div className={`flex-1 overflow-y-auto no-scrollbar pb-24 ${pageTransition}`} ref={scrollRef} onAnimationEnd={() => setPageTransition('')}>
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
                        {gameState === GameState.EVENT ? <EventCard event={currentEvent} stats={stats} onOptionSelect={handleOptionSelect} /> : <ResultView result={lastResult!} onNext={handleAfterWork} onRetire={handleRetire} onDoubleReward={handleDoubleReward} />}
                    </>
                )}
                {gameState === GameState.WEEKEND && (
                  <Suspense fallback={<div className="flex items-center justify-center py-16 text-[#8f959e] text-sm">加载中...</div>}>
                    <WeekendView onSelect={handleWeekendChoice} isSmallWeek={stats.isSmallWeek} canOutsource={stats.attributes.tech > 15} onAdReward={handleAdWeekendReward} />
                  </Suspense>
                )}
            </>
        )}
        {activeTab === TabView.RESUME && (
          <ErrorBoundary boundary="Resume View" fallback={<div className="p-6 text-center text-sm text-[#646a73]">简历加载失败</div>}>
            <ResumeView stats={stats} onRetire={handleRetire} />
          </ErrorBoundary>
        )}
        {activeTab === TabView.SHOP && (
          <ErrorBoundary boundary="Shop View" fallback={<div className="p-6 text-center text-sm text-[#646a73]">商店加载失败</div>}>
            <Suspense fallback={<div className="flex items-center justify-center py-16 text-[#8f959e] text-sm">加载中...</div>}>
              <ShopView stats={stats} onBuy={buyItem} onAdDiscount={handleAdDiscount} />
            </Suspense>
          </ErrorBoundary>
        )}
        {activeTab === TabView.HISTORY && (
          <ErrorBoundary boundary="History View" fallback={<div className="p-6 text-center text-sm text-[#646a73]">历史加载失败</div>}>
            <Suspense fallback={<div className="flex items-center justify-center py-16 text-[#8f959e] text-sm">加载中...</div>}>
              <HistoryView meta={meta} onBack={() => setActiveTab(TabView.WORK)} />
            </Suspense>
          </ErrorBoundary>
        )}
        {activeTab === TabView.LEADERBOARD && (
          <Suspense fallback={<div className="flex items-center justify-center py-16 text-[#8f959e] text-sm">加载中...</div>}>
            <LeaderboardView />
          </Suspense>
        )}
      </div>
      <BottomNav currentTab={activeTab} onTabChange={setActiveTab} disabled={false} />
      <RatingPromptModal visible={showRatingModal} onRate={handleRateNow} onLater={handleRateLater} />
    </div>
  );
};

export default App;
