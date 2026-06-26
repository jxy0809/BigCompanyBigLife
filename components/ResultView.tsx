import React, { memo } from 'react';
import { OptionEffect, GameStats } from '../types';
import { CheckCircle2, Clock, Coffee, LogOut, Share2, X, Activity, PlayCircle, Loader2 } from 'lucide-react';
import { tapTapAdClient, AdPlacement, AdLoadState } from '../ads';

interface Props {
  result: OptionEffect;
  stats?: GameStats;
  onNext: (action: 'overtime' | 'leave', e: React.MouseEvent) => void;
  onRetire: () => void;
  onDoubleReward?: (doubledResult: OptionEffect) => void;
}

const ResultView: React.FC<Props> = ({ result, stats, onNext, onRetire, onDoubleReward }) => {
  const [showShare, setShowShare] = React.useState(false);
  const [adState, setAdState] = React.useState<AdLoadState>(AdLoadState.IDLE);
  const [doubled, setDoubled] = React.useState(false);

  // Preload ad when component mounts
  React.useEffect(() => {
    if (tapTapAdClient.canShowAd(AdPlacement.DOUBLE_REWARD) && onDoubleReward) {
      setAdState(AdLoadState.LOADING);
      tapTapAdClient.preloadAd(AdPlacement.DOUBLE_REWARD).then(() => {
        setAdState(AdLoadState.READY);
      });
    }
  }, []);

  const handleDoubleReward = async () => {
    if (adState !== AdLoadState.READY) return;
    setAdState(AdLoadState.SHOWING);
    const adResult = await tapTapAdClient.showAd(AdPlacement.DOUBLE_REWARD);
    if (adResult.completed) {
      const doubledResult: OptionEffect = {
        ...result,
        money: result.money ? result.money * 2 : undefined,
        stamina: result.stamina ? result.stamina * 2 : undefined,
        sanity: result.sanity ? result.sanity * 2 : undefined,
        exp: result.exp ? result.exp * 2 : undefined,
        message: `[双倍奖励] ${result.message}`,
      };
      setDoubled(true);
      onDoubleReward?.(doubledResult);
      setAdState(AdLoadState.COMPLETED);
    } else {
      setAdState(adResult.error ? AdLoadState.FAILED : AdLoadState.SKIPPED);
    }
  };
  
  const getChangeBadge = (val?: number, label?: string) => {
    if (!val) return null;
    const isPositive = val > 0;
    
    let isGoodEvent = isPositive;
    if (label === '风险') isGoodEvent = !isPositive;
    if ((label === '体力' || label === '心智' || label === '金钱') && !isPositive) isGoodEvent = false;

    const colorClass = isGoodEvent 
        ? 'text-[#00b96b] bg-[#e3f9e9] border-[#b7ebc7]'
        : 'text-[#f54a45] bg-[#ffeceb] border-[#ffcacad]';

    const animClass = isGoodEvent ? 'stat-pulse-up' : 'stat-pulse-down';

    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-md border ${colorClass} flex items-center shrink-0 ${animClass}`}>
        {label} {val > 0 ? '+' : ''}{val}
      </span>
    );
  };

  const renderDoubleRewardButton = () => {
    if (doubled || !onDoubleReward) return null;
    if (adState === AdLoadState.IDLE && !tapTapAdClient.canShowAd(AdPlacement.DOUBLE_REWARD)) return null;

    const isFree = tapTapAdClient.isAdFreeToday();
    const reason = tapTapAdClient.getUnavailableReason(AdPlacement.DOUBLE_REWARD);

    return (
      <div className="flex justify-center mb-3">
        <button
          onClick={handleDoubleReward}
          disabled={
            adState === AdLoadState.LOADING ||
            adState === AdLoadState.SHOWING ||
            adState === AdLoadState.COMPLETED
          }
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            adState === AdLoadState.READY
              ? 'bg-[#fff4e5] text-[#ff8c00] border border-[#ffd591] hover:bg-[#ffe7ba]'
              : adState === AdLoadState.COMPLETED
              ? 'bg-[#e3f9e9] text-[#00b96b]'
              : adState === AdLoadState.FAILED
              ? 'bg-[#fff2f0] text-[#f54a45]'
              : 'bg-[#f5f6f7] text-[#8f959e]'
          }`}
        >
          {adState === AdLoadState.LOADING && (
            <Loader2 size={12} className="animate-spin" />
          )}
          {adState === AdLoadState.READY && (
            <PlayCircle size={12} />
          )}
          <span>
            {adState === AdLoadState.LOADING && '加载中...'}
            {adState === AdLoadState.READY && (isFree ? '今日免广告 - 双倍奖励' : '看广告 - 双倍奖励')}
            {adState === AdLoadState.FAILED && '加载失败'}
            {adState === AdLoadState.COMPLETED && '双倍已生效！'}
          </span>
        </button>
        {reason && adState === AdLoadState.IDLE && (
          <div className="ml-2 text-[9px] text-[#bbbfc4] self-center">{reason}</div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col px-3 py-4 animate-fade-in-up max-w-lg mx-auto w-full min-h-0">
        {/* System Notification Style */}
        <div className="flex items-center space-x-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#00b96b] flex items-center justify-center text-white shrink-0 shadow-sm">
                <CheckCircle2 size={14} />
            </div>
             <div className="text-xs text-[#646a73] font-medium">系统反馈</div>
        </div>

        <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border border-[#dee0e3] p-4 mb-4">
            <p className="text-[#1f2329] text-sm font-medium mb-3 leading-relaxed">
              {doubled ? `[双倍] ` : ''}{result.message}
            </p>
            
            <div className="flex flex-wrap gap-1.5">
                {getChangeBadge(result.stamina, '体力')}
                {getChangeBadge(result.sanity, '心智')}
                {getChangeBadge(result.money, '金钱')}
                {getChangeBadge(result.exp, '经验')}
                {getChangeBadge(result.risk, '风险')}
            </div>
        </div>

        <div className="mt-auto pb-20">
            {/* Double Reward Ad Button */}
            {renderDoubleRewardButton()}

            {/* Share Button */}
            <div className="flex justify-center mb-3">
                <button
                    onClick={() => setShowShare(true)}
                    className="flex items-center space-x-1.5 text-xs text-[#3370ff] font-medium hover:underline"
                >
                    <Share2 size={12} />
                    <span>分享战绩</span>
                </button>
            </div>

            <div className="flex items-center justify-center space-x-2 text-[#8f959e] mb-3">
                <Activity size={14} />
                <span className="text-xs font-medium">下班决策时刻</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 mb-3">
                <button
                    onClick={(e) => onNext('overtime', e)}
                    className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-[#dee0e3] hover:border-[#3370ff] hover:bg-[#e1eaff] transition-all active:scale-[0.98] shadow-sm min-h-[44px]"
                >
                    <Clock className="mb-1.5 text-[#3370ff]" size={22} />
                    <span className="text-sm font-bold text-[#1f2329]">主动加班</span>
                    <span className="text-[9px] text-[#646a73] mt-0.5">经验++ 体力--</span>
                </button>
                
                <button
                    onClick={(e) => onNext('leave', e)}
                    className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-[#dee0e3] hover:border-[#00b96b] hover:bg-[#e3f9e9] transition-all active:scale-[0.98] shadow-sm min-h-[44px]"
                >
                    <Coffee className="mb-1.5 text-[#00b96b]" size={22} />
                    <span className="text-sm font-bold text-[#1f2329]">准点下班</span>
                    <span className="text-[9px] text-[#646a73] mt-0.5">心智++ 风险++</span>
                </button>
            </div>

            <button 
                onClick={onRetire}
                className="w-full p-3 bg-transparent rounded-xl border border-dashed border-[#dee0e3] text-[#8f959e] text-xs font-medium hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all flex items-center justify-center space-x-2 group min-h-[44px]"
            >
                <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span>不想干了，申请提前退休</span>
            </button>
        </div>

        {/* Share Card Modal - Mobile Preview */}
        {showShare && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowShare(false)}>
                <div className="bg-white rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    {/* Share Card Header */}
                    <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] p-4 text-white">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-sm font-black tracking-wider">大 厂 风 云</h3>
                                <p className="text-[10px] text-white/60">Big Tech Survival</p>
                            </div>
                            <button onClick={() => setShowShare(false)} className="p-1 text-white/60 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="text-lg font-bold mt-2">{result.message}</div>
                    </div>
                    
                    {/* Share Card Body */}
                    <div className="p-4">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {[
                                { label: '体力变化', val: result.stamina },
                                { label: '心智变化', val: result.sanity },
                                { label: '金钱变化', val: result.money },
                                { label: '经验变化', val: result.exp },
                            ].filter(x => x.val && x.val !== 0).map(x => (
                                <div key={x.label} className="bg-[#f5f6f7] rounded-lg p-2 text-center">
                                    <div className="text-[9px] text-[#8f959e]">{x.label}</div>
                                    <div className={`text-sm font-bold ${(x.val ?? 0) > 0 ? 'text-[#00b96b]' : 'text-[#f54a45]'}`}>
                                        {(x.val ?? 0) > 0 ? '+' : ''}{x.val}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="text-center text-[10px] text-[#8f959e] mb-3">
                            扫码分享你的大厂人生
                        </div>
                        <div className="bg-[#f5f6f7] rounded-xl p-3 flex items-center justify-center">
                            <div className="w-20 h-20 border-2 border-dashed border-[#dee0e3] rounded-lg flex items-center justify-center text-[#8f959e]">
                                <span className="text-[9px]">QR 码占位</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default memo(ResultView);
