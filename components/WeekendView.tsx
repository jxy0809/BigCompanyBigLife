import React from 'react';
import { CONFIG } from '../constants';
import { BedDouble, BookOpen, Banknote, Beer } from 'lucide-react';

interface Props {
  onSelect: (choice: 'SLEEP' | 'STUDY' | 'GIG' | 'SOCIAL') => void;
}

const WeekendView: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="flex-1 flex flex-col px-4 py-6 animate-fade-in-up w-full">
      <div className="mb-6 text-center">
         <h2 className="text-xl font-bold text-[#1f2329] mb-2">周末时光</h2>
         <p className="text-[#646a73] text-sm">终于熬到了周末，你决定...</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
         <button onClick={() => onSelect('SLEEP')} className="bg-white p-4 rounded-xl border border-[#dee0e3] shadow-sm flex items-center hover:border-[#3370ff] transition-all">
            <div className="bg-blue-100 p-3 rounded-full mr-4 text-blue-600">
               <BedDouble size={24} />
            </div>
            <div className="text-left flex-1">
               <div className="font-bold text-[#1f2329]">疯狂补觉</div>
               <div className="text-xs text-[#646a73] mt-1">体力+{CONFIG.WEEKEND_SLEEP_STAMINA}, 心智+{CONFIG.WEEKEND_SLEEP_SANITY}</div>
            </div>
         </button>

         <button onClick={() => onSelect('STUDY')} className="bg-white p-4 rounded-xl border border-[#dee0e3] shadow-sm flex items-center hover:border-[#3370ff] transition-all">
            <div className="bg-purple-100 p-3 rounded-full mr-4 text-purple-600">
               <BookOpen size={24} />
            </div>
            <div className="text-left flex-1">
               <div className="font-bold text-[#1f2329]">技能进阶</div>
               <div className="text-xs text-[#646a73] mt-1">Tech+1, 金钱-{CONFIG.WEEKEND_STUDY_COST}</div>
            </div>
         </button>

         <button onClick={() => onSelect('GIG')} className="bg-white p-4 rounded-xl border border-[#dee0e3] shadow-sm flex items-center hover:border-[#3370ff] transition-all">
            <div className="bg-green-100 p-3 rounded-full mr-4 text-green-600">
               <Banknote size={24} />
            </div>
            <div className="text-left flex-1">
               <div className="font-bold text-[#1f2329]">兼职接私活</div>
               <div className="text-xs text-[#646a73] mt-1">金钱+{CONFIG.WEEKEND_GIG_MONEY}, 体力-{CONFIG.WEEKEND_GIG_STAMINA_COST}</div>
            </div>
         </button>

         <button onClick={() => onSelect('SOCIAL')} className="bg-white p-4 rounded-xl border border-[#dee0e3] shadow-sm flex items-center hover:border-[#3370ff] transition-all">
            <div className="bg-orange-100 p-3 rounded-full mr-4 text-orange-600">
               <Beer size={24} />
            </div>
            <div className="text-left flex-1">
               <div className="font-bold text-[#1f2329]">社交聚会</div>
               <div className="text-xs text-[#646a73] mt-1">心智+{CONFIG.WEEKEND_SOCIAL_SANITY}, 金钱-{CONFIG.WEEKEND_SOCIAL_COST}, 概率加Luck</div>
            </div>
         </button>
      </div>
    </div>
  );
};

export default WeekendView;