import React from 'react';
import { Star, X } from 'lucide-react';

interface Props {
  visible: boolean;
  onRate: () => void;
  onLater: () => void;
}

const RatingPromptModal: React.FC<Props> = ({ visible, onRate, onLater }) => {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
      onClick={onLater}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={20}
                className="text-[#ffc60a] fill-[#ffc60a]"
              />
            ))}
          </div>
          <button
            onClick={onLater}
            className="p-1 rounded-full hover:bg-[#f5f6f7]"
          >
            <X size={18} className="text-[#8f959e]" />
          </button>
        </div>

        <div className="text-center mb-5">
          <h3 className="text-lg font-bold text-[#1f2329] mb-2">
            喜欢大厂风云吗？
          </h3>
          <p className="text-sm text-[#646a73] leading-relaxed">
            你的评价对我们很重要！
            <br />
            在 TapTap 给我们一个五星好评吧~
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onLater}
            className="flex-1 bg-[#f5f6f7] text-[#646a73] py-3 rounded-xl text-sm font-medium hover:bg-[#ebecf0] transition-colors"
          >
            下次再说
          </button>
          <button
            onClick={onRate}
            className="flex-1 bg-[#3370ff] text-white py-3 rounded-xl text-sm font-bold active:scale-95 transition-all hover:bg-[#2b60d9]"
          >
            去评价
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingPromptModal;
