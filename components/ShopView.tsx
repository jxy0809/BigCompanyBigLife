import React, { memo } from 'react';
import { GameStats, ShopItem } from '../types';
import { SHOP_ITEMS } from '../constants';
import { ShoppingBag, X, PlayCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { tapTapAdClient, AdPlacement, AdLoadState } from '../ads';

interface Props {
  stats: GameStats;
  onBuy: (item: ShopItem) => void;
  onAdDiscount?: () => void;
}

const ShopView: React.FC<Props> = ({ stats, onBuy, onAdDiscount }) => {
  const [confirmItem, setConfirmItem] = React.useState<ShopItem | null>(null);
  const [adState, setAdState] = React.useState<AdLoadState>(AdLoadState.IDLE);
  const [discountActive, setDiscountActive] = React.useState(false);

  // Preload ad
  React.useEffect(() => {
    if (tapTapAdClient.canShowAd(AdPlacement.SHOP_DISCOUNT) && onAdDiscount) {
      setAdState(AdLoadState.LOADING);
      tapTapAdClient.preloadAd(AdPlacement.SHOP_DISCOUNT).then(() => {
        setAdState(AdLoadState.READY);
      });
    }
  }, []);

  const handleAdDiscount = async () => {
    if (adState !== AdLoadState.READY) return;
    setAdState(AdLoadState.SHOWING);
    const result = await tapTapAdClient.showAd(AdPlacement.SHOP_DISCOUNT);
    if (result.completed) {
      setDiscountActive(true);
      onAdDiscount?.();
      setAdState(AdLoadState.COMPLETED);
    } else {
      setAdState(result.error ? AdLoadState.FAILED : AdLoadState.SKIPPED);
    }
  };

  const handleBuyClick = (item: ShopItem) => {
    const price = discountActive ? Math.floor(item.price * 0.8) : item.price;
    if (stats.money >= price) {
      setConfirmItem(item);
    }
  };

  const handleConfirm = () => {
    if (confirmItem) {
      onBuy(confirmItem);
      setConfirmItem(null);
    }
  };

  const renderAdDiscountButton = () => {
    if (discountActive || !onAdDiscount) return null;
    if (adState === AdLoadState.IDLE && !tapTapAdClient.canShowAd(AdPlacement.SHOP_DISCOUNT)) return null;

    const isFree = tapTapAdClient.isAdFreeToday();

    return (
      <button
        onClick={handleAdDiscount}
        disabled={
          adState === AdLoadState.LOADING ||
          adState === AdLoadState.SHOWING ||
          adState === AdLoadState.COMPLETED
        }
        className={`w-full flex items-center justify-center space-x-1.5 p-2.5 rounded-lg text-xs font-bold transition-all mb-3 ${
          adState === AdLoadState.READY
            ? 'bg-[#fff4e5] text-[#ff8c00] border border-[#ffd591] hover:bg-[#ffe7ba]'
            : adState === AdLoadState.COMPLETED
            ? 'bg-[#e3f9e9] text-[#00b96b]'
            : adState === AdLoadState.FAILED
            ? 'bg-[#fff2f0] text-[#f54a45]'
            : 'bg-[#f5f6f7] text-[#8f959e]'
        }`}
      >
        {adState === AdLoadState.LOADING && <Loader2 size={12} className="animate-spin" />}
        {adState === AdLoadState.READY && <PlayCircle size={12} />}
        {adState === AdLoadState.COMPLETED && <CheckCircle2 size={12} />}
        <span>
          {adState === AdLoadState.LOADING && '加载中...'}
          {adState === AdLoadState.READY && (isFree ? '今日免广告 - 领取8折券' : '看广告 - 领取8折券')}
          {adState === AdLoadState.FAILED && '加载失败'}
          {adState === AdLoadState.COMPLETED && '8折券已激活！'}
        </span>
      </button>
    );
  };

  return (
    <div className="p-3 animate-fade-in-up pb-24 relative">
      <div className="flex items-center space-x-2 mb-4">
         <div className="bg-[#ffc60a] p-2 rounded-lg text-white">
            <ShoppingBag size={18} />
         </div>
         <div>
             <h2 className="text-lg font-bold text-[#1f2329]">解压杂货铺</h2>
             <p className="text-[10px] text-[#646a73]">花钱买快乐，虽然短暂。</p>
         </div>
      </div>

      {discountActive && (
        <div className="bg-[#fff4e5] border border-[#ffd591] rounded-lg p-2 mb-3 text-center">
          <span className="text-xs font-bold text-[#ff8c00]">8折优惠已激活！商品价格已更新</span>
        </div>
      )}

      {renderAdDiscountButton()}

      <div className="grid grid-cols-2 gap-2.5">
         {SHOP_ITEMS.map((item) => {
            const price = discountActive ? Math.floor(item.price * 0.8) : item.price;
            const canAfford = stats.money >= price;
            return (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-xl border shadow-sm flex flex-col items-center p-3 text-center ${
                    canAfford ? 'border-[#dee0e3]' : 'border-[#dee0e3] opacity-50'
                  }`}
                >
                   <div className="bg-[#f5f6f7] p-2.5 rounded-lg mb-2">
                       <item.icon size={28} className="text-[#1f2329]" />
                   </div>
                   <div className="font-bold text-[#1f2329] text-xs mb-0.5">{item.name}</div>
                   <div className="text-[9px] text-[#8f959e] mb-2 line-clamp-2">{item.description}</div>
                   
                   <button
                     onClick={() => handleBuyClick(item)}
                     disabled={!canAfford}
                     className={`w-full px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                         canAfford 
                         ? 'bg-[#3370ff] text-white active:scale-95 hover:bg-[#2b60d9]' 
                         : 'bg-[#f5f6f7] text-[#bbbfc4] cursor-not-allowed'
                     }`}
                   >
                     {discountActive ? (
                       <span>
                         <span className="line-through text-[#bbbfc4] mr-1">¥{item.price}</span>
                         ¥{price}
                       </span>
                     ) : (
                       `¥${item.price}`
                     )}
                   </button>
                </div>
            );
         })}
      </div>

      {/* Purchase Confirmation Modal */}
      {confirmItem && (() => {
        const price = discountActive ? Math.floor(confirmItem.price * 0.8) : confirmItem.price;
        return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setConfirmItem(null)}>
            <div 
              className="bg-white rounded-t-2xl w-full max-w-md p-6 animate-slide-up shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-[#1f2329]">确认购买</h3>
                <button onClick={() => setConfirmItem(null)} className="p-1 rounded-full hover:bg-[#f5f6f7]">
                  <X size={20} className="text-[#8f959e]" />
                </button>
              </div>

              <div className="bg-[#f5f6f7] rounded-xl p-4 mb-4 flex items-center">
                <div className="bg-white p-2.5 rounded-lg mr-3">
                  <confirmItem.icon size={28} className="text-[#1f2329]" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#1f2329]">{confirmItem.name}</div>
                  <div className="text-xs text-[#646a73]">{confirmItem.description}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="text-[#646a73]">价格{discountActive ? ' (8折)' : ''}</span>
                <span className="font-bold text-[#f54a45]">
                  {discountActive && <span className="line-through text-[#bbbfc4] mr-1 text-xs">¥{confirmItem.price}</span>}
                  ¥{price}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="text-[#646a73]">余额</span>
                <span className={`font-bold ${stats.money - price < 0 ? 'text-[#f54a45]' : 'text-[#00b96b]'}`}>
                  ¥{stats.money} → ¥{stats.money - price}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmItem(null)}
                  className="flex-1 bg-[#f5f6f7] text-[#1f2329] py-3 rounded-xl text-sm font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-[#3370ff] text-white py-3 rounded-xl text-sm font-bold active:scale-95"
                >
                  确认购买
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default memo(ShopView);
