import React from 'react';
import { Location } from '../types';
import { Monitor, Users, Building, Home } from 'lucide-react';

interface Props {
  location: Location;
}

const SCENE_CONFIG = {
  [Location.WORKSTATION]: { label: '我的工位', color: 'bg-blue-50 text-blue-600', icon: Monitor, desc: '在这里，你只是一行代码。' },
  [Location.MEETING_ROOM]: { label: 'P8 会议室', color: 'bg-orange-50 text-orange-600', icon: Users, desc: '空气中弥漫着“抓手”的味道。' },
  [Location.BOSS_OFFICE]: { label: '总监办公室', color: 'bg-purple-50 text-purple-600', icon: Building, desc: '生死予夺之地。' },
  [Location.HOME]: { label: '出租屋', color: 'bg-green-50 text-green-600', icon: Home, desc: '虽然只有10平米，但是是自由的。' },
};

const SceneHeader: React.FC<Props> = ({ location }) => {
  const config = SCENE_CONFIG[location] || SCENE_CONFIG[Location.WORKSTATION];
  const Icon = config.icon;

  return (
    <div className={`w-full py-3 px-4 ${config.color} border-b border-opacity-10 border-black flex items-center justify-center transition-colors duration-500`}>
       <Icon size={18} className="mr-2" />
       <span className="font-bold text-sm mr-2">{config.label}</span>
       <span className="text-xs opacity-70">| {config.desc}</span>
    </div>
  );
};

export default SceneHeader;