import React from 'react';
import { TabView } from '../types';
import { Briefcase, FileText, ShoppingBag } from 'lucide-react';

interface Props {
  currentTab: TabView;
  onTabChange: (tab: TabView) => void;
  disabled: boolean;
}

const BottomNav: React.FC<Props> = ({ currentTab, onTabChange, disabled }) => {
  const NavItem = ({ tab, icon: Icon, label }: any) => (
    <button 
      onClick={() => !disabled && onTabChange(tab)}
      disabled={disabled}
      className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${
        currentTab === tab ? 'text-[#3370ff]' : 'text-[#8f959e]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon size={20} className="mb-1" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#dee0e3] pb-safe pt-2 px-6 flex justify-between z-30 max-w-md mx-auto">
       <NavItem tab={TabView.WORK} icon={Briefcase} label="搬砖" />
       <NavItem tab={TabView.RESUME} icon={FileText} label="简历" />
       <NavItem tab={TabView.SHOP} icon={ShoppingBag} label="商店" />
    </div>
  );
};

export default BottomNav;