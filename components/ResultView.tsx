
import React from 'react';
import { OptionEffect } from '../types';
import { CheckCircle2, Clock, LogOut, Activity, Coffee } from 'lucide-react';

interface Props {
  result: OptionEffect;
  onNext: (action: 'overtime' | 'leave', e: React.MouseEvent) => void;
  onRetire: () => void;
}

const ResultView: React.FC<Props> = ({ result, onNext, onRetire }) => {
  const getChangeBadge = (val?: number, label?: string) => {
    if (!val) return null;
    const isPositive = val > 0;
    
    let isGoodEvent = isPositive;
    if (label === '风险') isGoodEvent = !isPositive;
    if ((label === '体力' || label === '心智' || label === '金钱') && !isPositive) isGoodEvent = false;

    const colorClass = isGoodEvent 
        ? 'text-[#00b96b] bg-[#e3f9e9] border-[#b7ebc7]' // Green
        : 'text-[#f54a45] bg-[#ffeceb] border-[#ffcacad]'; // Red

    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-md border ${colorClass} flex items-center`}>
        {label} {val > 0 ? '+' : ''}{val}
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 animate-fade-in-up max-w-lg mx-auto w-full">
        {/* System Notification Style */}
        <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#00b96b] flex items-center justify-center text-white shrink-0 shadow-sm">
                <CheckCircle2 size={16} />
            </div>
             <div className="text-xs text-[#646a73] font-medium">系统反馈</div>
        </div>

        <div className="bg-white rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm border border-[#dee0e3] p-5 mb-8">
            <p className="text-[#1f2329] text-base font-medium mb-4 leading-relaxed">{result.message}</p>
            
            <div className="flex flex-wrap gap-2">
                {getChangeBadge(result.stamina, '体力')}
                {getChangeBadge(result.sanity, '心智')}
                {getChangeBadge(result.money, '金钱')}
                {getChangeBadge(result.exp, '经验')}
                {getChangeBadge(result.risk, '风险')}
            </div>
        </div>

        <div className="mt-auto">
            <div className="flex items-center justify-center space-x-2 text-[#8f959e] mb-4">
                <Activity size={14} />
                <span className="text-xs font-medium">下班决策时刻</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                    onClick={(e) => onNext('overtime', e)}
                    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-[#dee0e3] hover:border-[#3370ff] hover:bg-[#e1eaff] transition-all active:scale-[0.98] shadow-sm"
                >
                    <Clock className="mb-2 text-[#3370ff]" size={24} />
                    <span className="text-sm font-bold text-[#1f2329]">主动加班</span>
                    <span className="text-[10px] text-[#646a73] mt-1 bg-[#f5f6f7] px-2 py-0.5 rounded">经验++ 体力--</span>
                </button>
                
                <button
                    onClick={(e) => onNext('leave', e)}
                    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-[#dee0e3] hover:border-[#00b96b] hover:bg-[#e3f9e9] transition-all active:scale-[0.98] shadow-sm"
                >
                    <Coffee className="mb-2 text-[#00b96b]" size={24} />
                    <span className="text-sm font-bold text-[#1f2329]">准点下班</span>
                    <span className="text-[10px] text-[#646a73] mt-1 bg-[#f5f6f7] px-2 py-0.5 rounded">心智++ 风险++</span>
                </button>
            </div>

            <button 
                onClick={onRetire}
                className="w-full p-3 bg-transparent rounded-xl border border-dashed border-[#dee0e3] text-[#8f959e] text-xs font-medium hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200 transition-all flex items-center justify-center space-x-2 group"
            >
                <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span>不想干了，申请提前退休</span>
            </button>
        </div>
    </div>
  );
};

export default ResultView;
