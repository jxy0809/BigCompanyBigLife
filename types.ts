export interface Attributes {
  grind: number;  // 耐艹 (Resilience/Grind)
  eq: number;     // 情商 (Emotional Intelligence)
  tech: number;   // 智商/技术 (Technical Skill)
  health: number; // 体质 (Physical Health)
  luck: number;   // 灵气 (Luck)
}

export interface GameStats {
  stamina: number; // 体力
  sanity: number;  // 心智
  money: number;   // 财富
  level: number;   // 职级 (internal number, e.g., 1 = T4, 5 = P7)
  exp: number;     // 经验值
  days: number;    // 当前天数
  risk: number;    // 被优化风险 (Hidden stat)
  attributes: Attributes; // Core Attributes
}

export interface OptionEffect {
  stamina?: number;
  sanity?: number;
  money?: number;
  exp?: number;
  risk?: number;
  message: string; // The result text displayed
}

export interface GameOption {
  label: string;
  effect: (stats: GameStats) => OptionEffect;
  requires?: (stats: GameStats) => boolean; // Logic to show/hide option based on stats
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  options: GameOption[];
  requirements?: (stats: GameStats) => boolean; // Optional condition to trigger
}

export enum GameState {
  START = 'START',
  CREATION = 'CREATION', // Attribute allocation
  MORNING = 'MORNING', // Brief morning summary
  EVENT = 'EVENT',     // The main decision
  RESULT = 'RESULT',   // Result of decision
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export const LEVELS = [
  { id: 1, title: 'T4 实习生', salary: 100 },
  { id: 2, title: 'T5 初级工程师', salary: 300 },
  { id: 3, title: 'P5 进阶工程师', salary: 500 },
  { id: 4, title: 'P6 资深工程师', salary: 800 },
  { id: 5, title: 'P7 技术专家', salary: 1500 },
  { id: 6, title: 'P8 高级专家', salary: 3000 },
  { id: 7, title: 'P9 资深总监', salary: 8000 },
];