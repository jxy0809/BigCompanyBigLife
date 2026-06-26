import React, { memo } from 'react';
import { CONFIG } from '../constants';
import { BedDouble, BookOpen, Banknote, Beer, AlertTriangle, TrendingUp, Laptop2, PlayCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';
import { tapTapAdClient, AdPlacement, AdLoadState } from '../ads';

interface Props {
  onSelect: (choice: 'SLEEP' | 'STUDY' | 'GIG' | 'SOCIAL' | 'INVEST' | 'OUTSOURCE') => void;
  isSmallWeek: boolean;
  canOutsource: boolean;
  onAdReward?: () => void;
}

const WeekendOption: React.FC<{
  icon: React.ReactNode;
  title: string;
  effect: string;
  onClick: () => void;
  style?: string;
}> = ({ icon, title, effect, onClick, style }) => (
  <button 
    onClick={() => { soundManager.vibrate(10); onClick(); }} 
    className={`flex flex-col items-center justify-center p-3 rounded-xl border shadow-sm transition-all active:scale-[0.97] min-h-[96px] ${
      style || 'bg-white border-[#dee0e3] hover:border-[#3370ff] hover:bg-[#e1eaff]'
    }`}
  >
    <div className="mb-2">{icon}</div>
    <div className="text-xs font-bold text-[#1f2329] text-center leading-tight">{title}</div>
    <div className="text-[9px] text-[#8f959e] mt-1 text-center leading-tight">{effect}</div>
  </button>
);

const WeekendView: React.FC<Props> = ({ onSelect, isSmallWeek, canOutsource, onAdReward }) => {
  const [adState, setAdState] = React.useState<AdLoadState>(AdLoadState.IDLE);

  React.useEffect(() => {
    // Preload ad when component mounts
    if (!isSmallWeek && tapTapAdClient.canShowAd(AdPlacement.WEEKEND_BONUS)) {
      setAdState(AdLoadState.LOADING);
      tapTapAdClient.preloadAd(AdPlacement.WEEKEND_BONUS).then(() => {
        setAdState(AdLoadState.READY);
      });
    }
  }, [isSmallWeek]);

  const handleAdClick = async () => {
    if (adState !== AdLoadState.READY) return;
    soundManager.vibrate(10);
    setAdState(AdLoadState.SHOWING);
    const result = await tapTapAdClient.showAd(AdPlacement.WEEKEND_BONUS);
    if (result.completed) {
      setAdState(AdLoadState.COMPLETED);
      onAdReward?.();
    } else {
      setAdState(result.error ? AdLoadState.FAILED : AdLoadState.SKIPPED);
    }
  };

  const renderAdButton = () => {
    if (isSmallWeek) return null;
    if (!tapTapAdClient.canShowAd(AdPlacement.WEEKEND_BONUS) && adState !== AdLoadState.READY) return null;

    const isFree = tapTapAdClient.isAdFreeToday();

    return (
      <button
        onClick={handleAdClick}
        disabled={adState === AdLoadState.LOADING || adState === AdLoadState.SHOWING || adState === AdLoadState.COMPLETED}
        className={`col-span-2 flex items-center justify-center p-3 rounded-xl border-2 border-dashed transition-all active:scale-[0.97] min-h-[48px] ${
          adState === AdLoadState.COMPLETED
            ? 'bg-[#e3f9e9] border-[#00b96b]'
            : adState === AdLoadState.FAILED
            ? 'bg-[#fff2f0] border-[#f54a45]'
            : 'bg-[#e1eaff] border-[#3370ff] hover:bg-[#c9daff]'
        }`}
      >
        {adState === AdLoadState.LOADING && (
          <>
            <Loader2 size={16} className="text-[#3370ff] animate-spin mr-2" />
            <span className="text-xs font-bold text-[#3370ff]">广告加载中...</span>
          </>
        )}
        {adState === AdLoadState.READY && (
          <>
            <PlayCircle size={16} className="text-[#3370ff] mr-2" />
            <span className="text-xs font-bold text-[#3370ff]">
              {isFree ? '今日免广告 - 直接领取周末加成' : '观看广告 - 领取周末加成'}
            </span>
          </>
        )}
        {adState === AdLoadState.SHOWING && (
          <>
            <Loader2 size={16} className="text-[#3370ff] animate-spin mr-2" />
            <span className="text-xs font-bold text-[#3370ff]">播放中...</span>
          </>
        )}
        {adState === AdLoadState.COMPLETED && (
          <>
            <CheckCircle2 size={16} className="text-[#00b96b] mr-2" />
            <span className="text-xs font-bold text-[#00b96b]">已领取：体力+15 心智+10</span>
          </>
        )}
        {adState === AdLoadState.FAILED && (
          <span className="text-xs text-[#f54a45]">广告加载失败，请稍后重试</span>
        )}
      </button>
    );
  };
  
  if (isSmallWeek) {
      return (
        <div className="flex-1 flex flex-col px-4 py-6 animate-fade-in-up w-full">
            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full mb-3 text-red-600">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-bold text-[#1f2329] mb-2">本周是小周 (单休)</h2>
                <p className="text-[#646a73] text-sm">周六强制加班，你的个人时间被大幅压缩。</p>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-xs text-red-600">
                ⚠️ 周末决策被锁定。你只能选择休息，且恢复效果大幅减弱。
            </div>

            <button onClick={() => onSelect('SLEEP')} className="bg-white p-4 rounded-xl border-2 border-red-200 shadow-sm flex items-center hover:bg-red-50 transition-all min-h-[44px]">
                <div className="bg-blue-100 p-3 rounded-full mr-4 text-blue-600">
                    <BedDouble size={24} />
                </div>
                <div className="text-left flex-1">
                    <div className="font-bold text-[#1f2329]">苟延残喘</div>
                    <div className="text-xs text-[#646a73] mt-1">
                        体力+{(CONFIG.WEEKEND_SLEEP_STAMINA * CONFIG.SMALL_WEEK_RECOVERY_RATE).toFixed(0)}, 
                        心智-{CONFIG.SMALL_WEEK_SANITY_PENALTY} (被剥夺感)
                    </div>
                </div>
            </button>
        </div>
      )
  }

  return (
    <div className="flex-1 flex flex-col px-3 py-4 animate-fade-in-up w-full">
      <div className="mb-4 text-center">
         <h2 className="text-lg font-bold text-[#1f2329] mb-1">周末时光 (双休)</h2>
         <p className="text-[#646a73] text-xs">难得的大周，你决定...</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
         <WeekendOption 
            icon={<BedDouble size={22} className="text-blue-600" />}
            title="疯狂补觉"
            effect={`体力+${CONFIG.WEEKEND_SLEEP_STAMINA} 心智+${CONFIG.WEEKEND_SLEEP_SANITY}`}
            onClick={() => onSelect('SLEEP')}
         />

         <WeekendOption 
            icon={<TrendingUp size={22} className="text-red-600" />}
            title="理财投资"
            effect="高风险高回报"
            onClick={() => onSelect('INVEST')}
         />

         {canOutsource && (
             <WeekendOption 
                icon={<Laptop2 size={22} className="text-indigo-600" />}
                title="接外包"
                effect="Tech>15 双倍工资 体力-50"
                onClick={() => onSelect('OUTSOURCE')}
             />
         )}

         <WeekendOption 
            icon={<BookOpen size={22} className="text-purple-600" />}
            title="技能进阶"
            effect={`Tech+1 金钱-${CONFIG.WEEKEND_STUDY_COST}`}
            onClick={() => onSelect('STUDY')}
         />

         <WeekendOption 
            icon={<Banknote size={22} className="text-green-600" />}
            title="兼职私活"
            effect={`金钱+${CONFIG.WEEKEND_GIG_MONEY} 体力-${CONFIG.WEEKEND_GIG_STAMINA_COST}`}
            onClick={() => onSelect('GIG')}
         />

         <WeekendOption 
            icon={<Beer size={22} className="text-orange-600" />}
            title="社交聚会"
            effect={`心智+${CONFIG.WEEKEND_SOCIAL_SANITY} 金钱-${CONFIG.WEEKEND_SOCIAL_COST}`}
            onClick={() => onSelect('SOCIAL')}
         />

         {renderAdButton()}
      </div>
    </div>
  );
};

export default memo(WeekendView);
