import React from 'react';

export interface Attributes {
  grind: number;  // 耐艹
  eq: number;     // 情商
  tech: number;   // 技术
  health: number; // 体质
  luck: number;   // 灵气
}

export enum Location {
  WORKSTATION = 'WORKSTATION', // 工位
  MEETING_ROOM = 'MEETING_ROOM', // 会议室
  BOSS_OFFICE = 'BOSS_OFFICE', // 老板办公室
  HOME = 'HOME' // 家
}

export interface GameStats {
  stamina: number; 
  sanity: number;
  money: number;
  salary: number;    // Weekly Salary
  level: number;
  exp: number;
  week: number;      // Changed from days to week
  risk: number;
  attributes: Attributes;
  bankruptcyCount: number; // Track weeks in debt
  location: Location;
}

export interface OptionEffect {
  stamina?: number;
  sanity?: number;
  money?: number;
  exp?: number;
  risk?: number;
  attributes?: Partial<Attributes>; // Allow attribute changes
  message: string;
}

export interface GameOption {
  label: string;
  effect: (stats: GameStats) => OptionEffect;
  requires?: (stats: GameStats) => boolean;
}

export interface GameEvent {
  id: string;
  location: Location; // Event bound to a location
  title: string;
  description: string;
  options: GameOption[];
  requirements?: (stats: GameStats) => boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  effect: (stats: GameStats) => Partial<GameStats>;
  icon: React.ElementType;
}

export enum GameState {
  START = 'START',
  CREATION = 'CREATION',
  WEEK_START = 'WEEK_START', // Monday morning
  EVENT = 'EVENT',
  RESULT = 'RESULT',
  WEEKEND = 'WEEKEND',       // Weekend Decision
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum TabView {
  WORK = 'WORK',
  RESUME = 'RESUME',
  SHOP = 'SHOP'
}

export const LEVELS = [
  { id: 1, title: 'T4 实习生', salary: 3000 },
  { id: 2, title: 'T5 初级工程师', salary: 5000 },
  { id: 3, title: 'P5 进阶工程师', salary: 8000 },
  { id: 4, title: 'P6 资深工程师', salary: 12000 },
  { id: 5, title: 'P7 技术专家', salary: 20000 },
  { id: 6, title: 'P8 高级专家', salary: 35000 },
  { id: 7, title: 'P9 资深总监', salary: 60000 },
];