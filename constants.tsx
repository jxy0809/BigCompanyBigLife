import { GameEvent, GameStats, Location, ShopItem } from './types';
import { Coffee, Gamepad2, BookOpen, Pill, Headphones } from 'lucide-react';

export const CONFIG = {
  MAX_WEEKS: 52,
  BASE_EXPENSE: 2000,
  REVENGE_SPENDING_THRESHOLD: 30, // Sanity below 30 triggers spending
  REVENGE_SPENDING_AMOUNT: 1500,
  BANKRUPTCY_LIMIT: 2, // Weeks allowed in debt
  WEEKEND_SLEEP_STAMINA: 40,
  WEEKEND_SLEEP_SANITY: 15,
  WEEKEND_STUDY_COST: 1500,
  WEEKEND_GIG_MONEY: 3000,
  WEEKEND_GIG_STAMINA_COST: 40,
  WEEKEND_SOCIAL_SANITY: 30,
  WEEKEND_SOCIAL_COST: 1000,
};

export const INITIAL_STATS: GameStats = {
  stamina: 100,
  sanity: 100,
  money: 5000, // Starting bonus
  salary: 3000, // T4 Salary
  level: 1, 
  exp: 0,
  week: 1,
  risk: 0,
  bankruptcyCount: 0,
  location: Location.WORKSTATION,
  attributes: { grind: 5, eq: 5, tech: 5, health: 5, luck: 5 }
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'coffee',
    name: '冰美式',
    description: '续命水。体力+10',
    price: 30,
    effect: (s) => ({ stamina: Math.min(100 + s.attributes.health * 2, s.stamina + 10) }),
    icon: Coffee
  },
  {
    id: 'game',
    name: '3A大作',
    description: '短暂逃避现实。心智+15',
    price: 400,
    effect: (s) => ({ sanity: Math.min(100 + s.attributes.grind * 2, s.sanity + 15) }),
    icon: Gamepad2
  },
  {
    id: 'course',
    name: '极客时间专栏',
    description: '虽然买来不一定看。经验+50',
    price: 200,
    effect: (s) => ({ exp: s.exp + 50 }),
    icon: BookOpen
  },
  {
    id: 'supplements',
    name: '深海鱼油',
    description: '感觉脑子长出来了。体质+1',
    price: 800,
    effect: (s) => ({ attributes: { ...s.attributes, health: s.attributes.health + 1 } }),
    icon: Pill
  },
  {
    id: 'headphones',
    name: '降噪耳机',
    description: '物理屏蔽傻逼。耐艹+1',
    price: 2000,
    effect: (s) => ({ attributes: { ...s.attributes, grind: s.attributes.grind + 1 } }),
    icon: Headphones
  }
];

export const EVENTS: GameEvent[] = [
  // --- WORKSTATION EVENTS ---
  {
    id: 'w_bug',
    location: Location.WORKSTATION,
    title: '紧急 Bug',
    description: '测试在群里疯狂 @你，线上出现白屏，老板正在看着群。',
    options: [
      {
        label: '快速修复',
        effect: (stats) => {
          const cost = Math.max(5, 30 - stats.attributes.tech * 1.5);
          return { stamina: -cost, exp: 10, message: '你凭借肌肉记忆迅速定位并修复了问题。' };
        }
      },
      {
        label: '甩锅给后端',
        requires: (s) => s.attributes.eq > 8,
        effect: () => ({ sanity: 5, risk: -2, message: '“接口返回的数据格式不对。” 你成功转移了矛盾。' })
      }
    ]
  },
  {
    id: 'w_code',
    location: Location.WORKSTATION,
    title: '屎山代码',
    description: '你接手了离职同事的代码，里面充满了 magic number 和拼音变量。',
    options: [
      {
        label: '重构！(Tech > 10)',
        requires: (s) => s.attributes.tech >= 10,
        effect: () => ({ stamina: -20, sanity: 10, exp: 40, message: '你把代码重构得赏心悦目，虽然没人会在意。' })
      },
      {
        label: '能跑就行',
        effect: () => ({ sanity: -5, risk: 2, message: '你在屎山上又堆了一层，祈祷别在自己手里崩掉。' })
      }
    ]
  },

  // --- MEETING ROOM EVENTS ---
  {
    id: 'm_pua',
    location: Location.MEETING_ROOM,
    title: '项目复盘会',
    description: '领导：“我觉得你最近投入度不够，没有把这个项目当成自己的孩子。”',
    options: [
      {
        label: '沉默是金',
        effect: () => ({ sanity: -15, stamina: -5, message: '你默默忍受了半小时的输出，感觉乳腺不通了。' })
      },
      {
        label: '阴阳怪气 (EQ > 12)',
        requires: (s) => s.attributes.eq > 12,
        effect: () => ({ sanity: 5, risk: 5, message: '“好的老板，我会把公司当家，今晚就睡会议室。” 全场尴尬。' })
      }
    ]
  },
  {
    id: 'm_align',
    location: Location.MEETING_ROOM,
    title: '跨部门对齐',
    description: '产品、运营、开发三方对齐，需求变来变去。',
    options: [
      {
        label: '据理力争',
        effect: () => ({ stamina: -10, sanity: -10, exp: 5, message: '吵了一下午，需求终于砍掉了一半。' })
      },
      {
        label: '全盘接受',
        effect: () => ({ stamina: -20, risk: 5, message: '你接下了一个不可能完成的任务，排期排到了明年。' })
      }
    ]
  },

  // --- BOSS OFFICE EVENTS ---
  {
    id: 'b_review',
    location: Location.BOSS_OFFICE,
    title: '绩效谈话',
    description: '老板看着你的绩效表，若有所思。',
    options: [
      {
        label: '展示数据',
        effect: (s) => {
            const success = s.attributes.tech + s.attributes.grind > 20;
            return success 
                ? { exp: 50, money: 500, message: '老板对你的产出表示满意，发了500块奖金。' }
                : { risk: 10, sanity: -10, message: '老板觉得你的产出没有“业务体感”。' };
        }
      },
      {
        label: '哭惨',
        requires: (s) => s.attributes.eq > 10,
        effect: () => ({ risk: -5, message: '你讲述了加班的艰辛，老板勉励了你几句。' })
      }
    ]
  },
  {
    id: 'b_layoff',
    location: Location.BOSS_OFFICE,
    title: '裁员风声',
    description: '隔壁组整个被端了，老板把你叫进去关上了门。',
    options: [
      {
        label: '表忠心',
        effect: () => ({ stamina: -10, sanity: -10, risk: -10, message: '你承诺接下来一个月996，暂时安全了。' })
      },
      {
        label: '无所谓',
        effect: () => ({ risk: 10, sanity: 10, message: '你表现出的淡定让老板摸不清底细，反而不敢动你。' })
      }
    ]
  }
];