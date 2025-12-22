import React from 'react';

export interface Attributes {
  grind: number;  // 耐艹
  eq: number;     // 情商
  tech: number;   // 技术
  health: number; // 体质
  luck: number;   // 灵气
}

export enum Location {
  WORKSTATION = 'WORKSTATION',
  MEETING_ROOM = 'MEETING_ROOM',
  BOSS_OFFICE = 'BOSS_OFFICE',
  HOME = 'HOME'
}

export enum EventCategory {
  ROUTINE = 'ROUTINE',   // 常规 (60%)
  SURPRISE = 'SURPRISE', // 惊喜 (15%)
  CRISIS = 'CRISIS',     // 危机 (15%)
  ENCOUNTER = 'ENCOUNTER',// 奇遇 (10%)
  SMALL_WEEK = 'SMALL_WEEK' // 小周专属 (Specific to Small Weeks)
}

export interface GameStats {
  // Core Resources
  stamina: number; 
  maxStamina: number; // Derived from Health (50 + Health * 8)
  sanity: number;
  sanityRate: number; // Derived from EQ
  
  // Economy
  money: number;
  salary: number;    
  expenses: number; // Dynamic weekly expenses

  // Progress
  level: number;
  exp: number;
  week: number;      
  risk: number;
  
  // Attributes & Traits
  attributes: Attributes;
  titles: string[]; // Unlocked titles
  
  // Metadata / Counters
  techEventCount: number; // For mastery tracking
  debtWeeks: number; // Replaces bankruptcyCount for clearer logic
  location: Location;
  overtimeHours: number; // Track for final report
  isSmallWeek: boolean; // Current week status
}

export interface OptionEffect {
  stamina?: number;
  sanity?: number;
  money?: number;
  exp?: number;
  risk?: number;
  attributes?: Partial<Attributes>; 
  message: string;
}

export interface GameOption {
  label: string;
  effect: (stats: GameStats) => OptionEffect;
  requires?: (stats: GameStats) => boolean;
}

export interface GameEvent {
  id: string;
  category: EventCategory;
  location: Location; 
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
  WEEK_START = 'WEEK_START', 
  EVENT = 'EVENT',
  RESULT = 'RESULT',
  WEEKEND = 'WEEKEND',       
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

export interface TitleConfig {
    id: string;
    name: string;
    condition: (stats: GameStats) => boolean;
    description: string;
    buff: string;
}