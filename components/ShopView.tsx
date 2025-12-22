import React from 'react';
import { GameStats, ShopItem } from '../types';
import { SHOP_ITEMS } from '../constants';
import { ShoppingBag } from 'lucide-react';

interface Props {
  stats: GameStats;
  onBuy: (item: ShopItem) => void;
}

const ShopView: React.FC<Props> = ({ stats, onBuy }) => {
  return (
    <div className="p-4 animate-fade-in-up pb-24">
      <div className="flex items-center space-x-2 mb-6">
         <div className="bg-[#ffc60a] p-2 rounded-lg text-white">
            <ShoppingBag size={20} />
         </div>
         <div>
             <h2 className="text-xl font-bold text-[#1f2329]">解压杂货铺</h2>
             <p className="text-xs text-[#646a73]">花钱买快乐，虽然短暂。</p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
         {SHOP_ITEMS.map((item) => {
            const canAfford = stats.money >= item.price;
            return (
                <div key={item.id} className="bg-white p-3 rounded-xl border border-[#dee0e3] shadow-sm flex items-center justify-between">
                   <div className="flex items-center flex-1">
                      <div className="bg-[#f5f6f7] p-2 rounded-lg mr-3">
                          <item.icon size={24} className="text-[#1f2329]" />
                      </div>
                      <div>
                          <div className="font-bold text-[#1f2329] text-sm">{item.name}</div>
                          <div className="text-[10px] text-[#8f959e]">{item.description}</div>
                      </div>
                   </div>
                   
                   <button
                     onClick={() => onBuy(item)}
                     disabled={!canAfford}
                     className={`ml-3 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                         canAfford 
                         ? 'bg-[#3370ff] text-white active:scale-95 hover:bg-[#2b60d9]' 
                         : 'bg-[#f5f6f7] text-[#bbbfc4] cursor-not-allowed'
                     }`}
                   >
                     ¥{item.price}
                   </button>
                </div>
            );
         })}
      </div>
    </div>
  );
};

export default ShopView;