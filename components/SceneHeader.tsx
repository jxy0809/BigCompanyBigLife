import React from 'react';
import { Location, IndustryType } from '../types';
import { INDUSTRIES } from '../constants';
import { Monitor, Users, Building, Home } from 'lucide-react';

interface Props {
  location: Location;
  industry: IndustryType;
}

const SceneHeader: React.FC<Props> = ({ location, industry }) => {
  const config = INDUSTRIES[industry];
  const themeColor = config.theme.primaryColor;
  
  // Dynamic Locations based on industry context
  const getLocationInfo = () => {
      switch(location) {
          case Location.WORKSTATION:
              return { label: '我的工位', icon: Monitor, desc: '在这里，你只是一个耗材。' };
          case Location.MEETING_ROOM:
              return { label: '会议室', icon: Users, desc: `正在进行${config.text.progress}汇报。` };
          case Location.BOSS_OFFICE:
              return { label: `${config.npcs.boss.role}室`, icon: Building, desc: '生死予夺之地。' };
          case Location.HOME:
              return { label: '出租屋', icon: Home, desc: '虽然只有10平米，但是是自由的。' };
          default:
              return { label: '未知区域', icon: Monitor, desc: '...' };
      }
  }

  const info = getLocationInfo();
  const Icon = info.icon;

  return (
    <div 
        className={`w-full py-3 px-4 border-b border-opacity-10 border-black flex items-center justify-center transition-colors duration-500`}
        style={{ backgroundColor: config.theme.secondaryColor, color: config.theme.textColor }}
    >
       <Icon size={18} className="mr-2" style={{ color: themeColor }} />
       <span className="font-bold text-sm mr-2">{info.label}</span>
       <span className="text-xs opacity-70">| {info.desc}</span>
    </div>
  );
};

export default SceneHeader;