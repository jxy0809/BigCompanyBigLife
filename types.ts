import React from 'react';
import { LucideIcon } from 'lucide-react';

export enum IndustryType {
  INTERNET = 'INTERNET',
  REAL_ESTATE = 'REAL_ESTATE',
  PHARMA = 'PHARMA',
  POLICE = 'POLICE',
  DESIGN = 'DESIGN'
}

export interface IndustryTheme {
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  textColor: string;
}

export interface IndustryText {
  currency: string; 
  progress: string; 
  overtime: string; 
  bonus: string;    
  fired: string;    
  levelName: string; 
}

export interface NpcConfig {
  id: string;
  name: string;
  role: string;
  desc: string;
}

export interface IndustryConfig {
  type: IndustryType;
  name: string;
  description: string;
  theme: IndustryTheme;
  text: IndustryText;
  npcs: {
    boss: NpcConfig;
    colleague: NpcConfig;
    hr: NpcConfig;
  };
  modifiers: {
    salaryMultiplier: number;
    initialSanityPenalty: number;
    staminaBonus: number;
    maxSanityCap: number;
    smallWeek: boolean; 
    eqSalaryScaling: boolean; 
    techSalaryGate: boolean; 
    weeklySanityDrain: number; 
    luckBonus: boolean; 
  };
}

export interface Attributes {
  grind: number;  
  eq: number;     
  tech: number;   
  health: number; 
  luck: number;   
}

export interface Relationships {
  boss: number;      
  colleague: number; 
  hr: number;        
}

export enum Location {
  WORKSTATION = 'WORKSTATION',
  MEETING_ROOM = 'MEETING_ROOM',
  BOSS_OFFICE = 'BOSS_OFFICE',
  HOME = 'HOME',
  HOSPITAL = 'HOSPITAL' // New
}

export enum EventCategory {
  ROUTINE = 'ROUTINE',   
  CHOICE = 'CHOICE',     // Career Decision
  FATE = 'FATE',         // Major Turn
  CRISIS = 'CRISIS',     
  SMALL_WEEK = 'SMALL_WEEK',
  NPC_INTERACTION = 'NPC_INTERACTION',
  CHAINED = 'CHAINED'    // New: Low stat triggers
}

export enum EventRarity {
    COMMON = 'COMMON',   // Neutral/Bad (50%)
    RARE = 'RARE',       // Good (30%)
    EPIC = 'EPIC'        // Very Good (20%)
}

export interface Buff {
    id: string;
    name: string;
    description: string;
    duration: number; // Weeks remaining
    effect: {
        salaryMod?: number; // 1.1 = +10%
        staminaCostMod?: number; // 1.2 = +20% cost
        sanityCostMod?: number;
        luckMod?: number;
    };
    isNegative: boolean;
}

export interface GameStats {
  // Core Resources
  stamina: number; 
  maxStamina: number; 
  sanity: number;
  maxSanity: number; 
  sanityRate: number; 
  
  // Economy
  money: number;
  salary: number;    
  expenses: number; 

  // Progress
  level: number;
  exp: number;
  week: number;      
  risk: number;
  
  // Context
  industry: IndustryType; 

  // Attributes & Traits
  attributes: Attributes;
  titles: string[]; 
  relationships: Relationships; 
  activeBuffs: Buff[]; // New
  
  // Metadata / Counters
  techEventCount: number; 
  debtWeeks: number; 
  location: Location;
  overtimeHours: number; 
  isSmallWeek: boolean; 
  reviveUsed: boolean; 
  legacyPointsUsed: number; 
}

export interface OptionEffect {
  stamina?: number;
  sanity?: number;
  money?: number;
  exp?: number;
  risk?: number;
  level?: number; // New: Allow events to change rank directly
  attributes?: Partial<Attributes>;
  relationships?: Partial<Relationships>; 
  addBuff?: Buff; // New
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
  rarity?: EventRarity; // New for Luck system
  location: Location; 
  industry?: IndustryType; // Null means universal
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
  INDUSTRY_SELECT = 'INDUSTRY_SELECT',
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
  { id: 1, title: 'Lv1', salary: 3000 },
  { id: 2, title: 'Lv2', salary: 5000 },
  { id: 3, title: 'Lv3', salary: 8000 },
  { id: 4, title: 'Lv4', salary: 12000 },
  { id: 5, title: 'Lv5', salary: 20000 },
  { id: 6, title: 'Lv6', salary: 35000 },
  { id: 7, title: 'Lv7', salary: 60000 },
];

export interface TitleConfig {
    id: string;
    name: string;
    condition: (stats: GameStats) => boolean;
    description: string;
    buff: string;
}

export interface MetaData {
    totalCareerPoints: number;
    unlockedBadges: string[];
    highScoreWeeks: number;
}