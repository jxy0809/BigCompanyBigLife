import { GameEvent, GameStats, Location, ShopItem, EventCategory, TitleConfig } from './types';
import { Coffee, Gamepad2, BookOpen, Pill, Headphones } from 'lucide-react';

export const CONFIG = {
  MAX_WEEKS: 52,
  BASE_EXPENSE: 2000,
  LIFESTYLE_CREEP_RATE: 0.05,
  REVENGE_SPENDING_THRESHOLD: 30,
  REVENGE_SPENDING_AMOUNT: 1500,
  DEBT_LIMIT: 3, // 3 weeks of debt = Game Over
  BURNOUT_THRESHOLD: 20,
  MASTERY_THRESHOLD: 5,
  TITLE_THRESHOLD: 20,
  ICU_COST: 5000, // Cost when stamina hits 0
  
  // Weekend Config
  WEEKEND_SLEEP_STAMINA: 40, // Reduced slightly
  WEEKEND_SLEEP_SANITY: 20,
  WEEKEND_STUDY_COST: 1500,
  WEEKEND_GIG_MONEY: 3000,
  WEEKEND_GIG_STAMINA_COST: 40,
  WEEKEND_SOCIAL_SANITY: 35,
  WEEKEND_SOCIAL_COST: 1200,

  // Small Week Config
  SMALL_WEEK_SANITY_PENALTY: 10,
  SMALL_WEEK_RECOVERY_RATE: 0.05, // Only 5% recovery on small week transition
  BIG_WEEK_RECOVERY_RATE: 0.20,
};

export const BLANK_STATS: GameStats = {
  stamina: 100,
  maxStamina: 100,
  sanity: 100,
  sanityRate: 1,
  money: 0, 
  salary: 0,
  expenses: 0,
  level: 1, 
  exp: 0,
  week: 1,
  risk: 0,
  debtWeeks: 0,
  location: Location.WORKSTATION,
  attributes: { grind: 1, eq: 1, tech: 1, health: 1, luck: 1 },
  titles: [],
  techEventCount: 0,
  overtimeHours: 0,
  isSmallWeek: false
};

export const TITLES: TitleConfig[] = [
    { id: 't_god', name: '代码之神', condition: (s) => s.attributes.tech >= 20, description: '技术属性突破20', buff: '所有技术类事件体力消耗减半' },
    { id: 't_social', name: '社交牛逼症', condition: (s) => s.attributes.eq >= 20, description: '情商属性突破20', buff: '甩锅成功率100%' },
    { id: 't_tank', name: '肝帝', condition: (s) => s.attributes.grind >= 20, description: '耐艹属性突破20', buff: '免疫心智崩溃导致的强制消费' },
    { id: 't_koi', name: '职场锦鲤', condition: (s) => s.attributes.luck >= 20, description: '灵气属性突破20', buff: '奇遇事件触发概率翻倍' },
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'coffee',
    name: '冰美式',
    description: '续命水。体力+10',
    price: 30,
    effect: (s) => ({ stamina: Math.min(s.maxStamina, s.stamina + 10) }),
    icon: Coffee
  },
  {
    id: 'game',
    name: '黑神话:悟空',
    description: '逃避可耻但有用。心智+20',
    price: 398,
    effect: (s) => ({ sanity: Math.min(100, s.sanity + 20) }),
    icon: Gamepad2
  },
  {
    id: 'course',
    name: 'AI 架构课',
    description: '虽然看不懂。经验+50',
    price: 500,
    effect: (s) => ({ exp: s.exp + 50 }),
    icon: BookOpen
  },
  {
    id: 'supplements',
    name: '深海鱼油',
    description: '智商税？体质+1',
    price: 800,
    effect: (s) => ({ attributes: { ...s.attributes, health: s.attributes.health + 1 } }),
    icon: Pill
  },
  {
    id: 'headphones',
    name: 'Sony XM5',
    description: '物理结界。耐艹+1',
    price: 2500,
    effect: (s) => ({ attributes: { ...s.attributes, grind: s.attributes.grind + 1 } }),
    icon: Headphones
  }
];

// Helper to generate options quickly
const techOption = (label: string, techReq: number, staminaCost: number, successMsg: string, failMsg: string) => ({
    label,
    effect: (s: GameStats) => {
        const realCost = Math.max(5, staminaCost - s.attributes.tech / 2);
        const finalCost = s.sanity < CONFIG.BURNOUT_THRESHOLD ? realCost * 2 : realCost;
        
        const success = s.attributes.tech >= techReq;
        
        if (success) {
            return { stamina: -finalCost, exp: 20 + techReq * 2, message: successMsg + (s.sanity < CONFIG.BURNOUT_THRESHOLD ? " (倦怠期体力消耗翻倍)" : "") };
        } else {
            return { stamina: -finalCost * 1.5, sanity: -10, risk: 2, message: failMsg };
        }
    }
});

const eqOption = (label: string, eqReq: number, successMsg: string, failMsg: string) => ({
    label,
    requires: (s: GameStats) => s.attributes.eq >= eqReq - 5, // Show if close
    effect: (s: GameStats) => {
        const success = s.attributes.eq >= eqReq;
        return success 
            ? { sanity: 5, risk: -5, message: successMsg }
            : { sanity: -5, risk: 5, message: failMsg };
    }
});

export const EVENTS: GameEvent[] = [
  // --- SMALL WEEK EVENTS (High Pressure, Satire) ---
  {
    id: 'sw_meeting_4pm',
    category: EventCategory.SMALL_WEEK,
    location: Location.MEETING_ROOM,
    title: '周六下午4点的周会',
    description: '周六也要对齐颗粒度。大老板表示：“虽然是单休，但我们要拿出创业公司的狼性，把这个链路打通。”',
    options: [
        { 
            label: '忍气吞声', 
            effect: () => ({ sanity: -15, stamina: -10, message: '你听着满嘴的“赋能、抓手、沉淀”，感觉大脑在萎缩。' }) 
        },
        { 
            label: '当场发疯', 
            effect: () => ({ sanity: 20, risk: 15, message: '你突然开始大笑，并在白板上画了一只佩奇。大家都被你震慑住了，会议提前结束。' }) 
        }
    ]
  },
  {
    id: 'sw_sleep_sunday',
    category: EventCategory.SMALL_WEEK,
    location: Location.HOME,
    title: '消失的周日',
    description: '因为周六加班到半夜，你周日一觉睡到了下午5点。',
    options: [
        { 
            label: '继续躺平', 
            effect: () => ({ stamina: 30, sanity: -5, message: '体力恢复了，但想到明天又是周一，一种巨大的虚无感袭来。' }) 
        }
    ]
  },
  {
    id: 'sw_social_miss',
    category: EventCategory.SMALL_WEEK,
    location: Location.WORKSTATION,
    title: '错过的生活',
    description: '高中同学聚会发来照片，大家都在吃火锅，而你在吃公司发的“加班能量餐”。',
    options: [
        { 
            label: '朋友圈点赞', 
            effect: () => ({ sanity: -10, stamina: -5, message: '你点了个赞，然后继续写“用户心智洞察”报告。' }) 
        }
    ]
  },
  {
    id: 'sw_urgent_demand',
    category: EventCategory.SMALL_WEEK,
    location: Location.WORKSTATION,
    title: '倒排期',
    description: '产品经理周六跑过来说：“老板周一早上要看，这个需求得倒排期，辛苦一下。”',
    options: [
        techOption('通宵赶工', 10, 40, '你用发际线换来了按时上线。', '由于疲劳驾驶，上线后导致全站502。'),
        { label: '硬刚回去', requires: (s) => s.attributes.eq > 15, effect: () => ({ sanity: 10, risk: 10, message: '“你行你上。” 你成功怼回去了，但被记在了小本本上。' }) }
    ]
  },

  // --- ROUTINE (60%) ---
  {
    id: 'r_meeting',
    category: EventCategory.ROUTINE,
    location: Location.MEETING_ROOM,
    title: '无尽的马拉松会议',
    description: '从上午10点开到晚上8点，你的膀胱和精神都在经受考验。',
    options: [
      {
        label: '认真记录',
        effect: (s) => ({ stamina: -15, sanity: -10, exp: 5, message: '你记了三页纸的废话。' })
      },
      eqOption('带薪拉屎', 5, '你躲在厕所刷了半小时抖音，心情愉悦。', '被老板发现不在工位，尴尬。')
    ]
  },
  {
    id: 'r_bug',
    category: EventCategory.ROUTINE,
    location: Location.WORKSTATION,
    title: '修不完的 Bug',
    description: '测试提了一个 "Critical" 级 Bug，说是用户点在这个像素上会崩溃。',
    options: [
        techOption('快速修复', 5, 20, '你一眼看穿了这是 CSS z-index 的问题。', '你改了一行代码，引发了十个新 Bug。'),
        { label: '不管它', effect: () => ({ risk: 5, message: '反正没人会点那个像素。' }) }
    ]
  },
  {
    id: 'r_report',
    category: EventCategory.ROUTINE,
    location: Location.WORKSTATION,
    title: '周报大练兵',
    description: '本周没啥产出，但周报得写出花来。',
    options: [
        { label: '使用 AI 生成', effect: () => ({ stamina: -5, exp: 5, message: 'AI 写的比你好，充满了“赋能、抓手”。' }) },
        techOption('写个自动化脚本', 8, 15, '你写了个脚本自动抓取 Git Log 生成周报。', '脚本跑挂了，还得手写。')
    ]
  },
  {
    id: 'r_lunch',
    category: EventCategory.ROUTINE,
    location: Location.WORKSTATION,
    title: '午餐选择困难',
    description: '在这个美食荒漠，今天吃什么？',
    options: [
        { label: '科技与狠活外卖', effect: () => ({ stamina: 5, health: -1, message: '虽然拉肚子，但便宜。' }) },
        { label: '轻食沙拉 (¥50)', effect: (s) => ({ money: -50, stamina: 10, health: 1, message: '感觉自己很健康，但钱包在流血。' }) }
    ]
  },

  // --- SURPRISE (15%) ---
  {
    id: 's_lottery',
    category: EventCategory.SURPRISE,
    location: Location.MEETING_ROOM,
    title: '年会抽奖',
    description: '公司年会，特等奖是一台 Mac Studio。',
    options: [
        { 
            label: '祈祷 (Luck判定)', 
            effect: (s) => {
                const win = Math.random() * 100 < (s.attributes.luck * 2);
                return win 
                    ? { money: 15000, sanity: 50, message: '你居然中了特等奖！反手挂咸鱼卖了1万5。' } 
                    : { sanity: -5, message: '恭喜你获得了阳光普照奖：公司定制工牌挂绳。' };
            }
        }
    ]
  },
  {
    id: 's_bonus',
    category: EventCategory.SURPRISE,
    location: Location.BOSS_OFFICE,
    title: '项目爆火',
    description: '你参与的小程序突然在朋友圈刷屏了。',
    options: [
        { label: '坐等发钱', effect: () => ({ money: 5000, exp: 100, risk: -10, message: '项目奖金到账，瞬间觉得996值得了。' }) }
    ]
  },
  {
    id: 's_stock',
    category: EventCategory.SURPRISE,
    location: Location.HOME,
    title: '股票解套',
    description: '你被套牢三年的中概股突然暴涨。',
    options: [
        { label: '赶紧抛售', effect: () => ({ money: 8000, sanity: 20, message: '回本了！这就是价值投资（投机）。' }) },
        { label: '贪心再等等', effect: (s) => s.attributes.luck > 8 ? { money: 12000, message: '居然真涨了！赚翻。' } : { sanity: -20, message: '第二天跌停了，白高兴一场。' } }
    ]
  },

  // --- CRISIS (15%) ---
  {
    id: 'c_pot',
    category: EventCategory.CRISIS,
    location: Location.MEETING_ROOM,
    title: '背锅位预定',
    description: '线上事故定责会，P9 正盯着你看。',
    options: [
        eqOption('甩锅给前同事', 10, '“这块代码是离职的王工写的。” 你逃过一劫。', '领导觉得你没有担当，背了C绩效。'),
        { label: '立正挨打', effect: () => ({ risk: 15, sanity: -20, message: '你背了P0事故，绩效悬了。' }) }
    ]
  },
  {
    id: 'c_reorg',
    category: EventCategory.CRISIS,
    location: Location.BOSS_OFFICE,
    title: '架构调整',
    description: '你的部门被裁撤了，你需要内部转岗。',
    options: [
        { 
            label: '接受转岗', 
            effect: () => ({ exp: -500, risk: 5, message: '你去了边缘部门，之前的业务积累全废了(经验大幅减少)。' }) 
        },
        techOption('面试核心组', 15, 30, '凭借过硬的技术，你去了核心架构组！', '面试挂了，只能去打杂。')
    ]
  },
  {
    id: 'c_pip',
    category: EventCategory.CRISIS,
    location: Location.BOSS_OFFICE,
    title: 'PIP 警告',
    description: 'HR 约你谈话：“我们觉得你最近产出不饱和。”',
    options: [
        { label: '签署军令状', effect: () => ({ stamina: -50, sanity: -30, risk: -20, message: '你开始了地狱模式的一个月。' }) },
        { label: '开始刷题', effect: () => ({ tech: 1, risk: 10, message: '你无心工作，准备跑路。' }) }
    ]
  },

  // --- ENCOUNTER (10%) ---
  {
    id: 'e_guru',
    category: EventCategory.ENCOUNTER,
    location: Location.WORKSTATION,
    title: '扫地僧',
    description: '在吸烟区偶遇一位不修边幅的大叔，竟是传说中的T10大佬。',
    options: [
        { label: '请教技术', effect: (s) => ({ attributes: {...s.attributes, tech: s.attributes.tech + 2}, exp: 50, message: '大佬指点了两句，你顿悟了 (Tech +2)。' }) },
        { label: '递根烟', effect: (s) => ({ attributes: {...s.attributes, luck: s.attributes.luck + 1}, message: '结了个善缘 (Luck +1)。' }) }
    ]
  },
  {
    id: 'e_headhunter',
    category: EventCategory.ENCOUNTER,
    location: Location.HOME,
    title: '猎头电话',
    description: '某独角兽公司给你开出了双倍薪资。',
    options: [
        techOption('尝试面试', 12, 20, '面试通过！你拿offer去跟老板提涨薪，老板给你加了薪 (薪资+2000)。', '面试被虐了，还是老实搬砖吧。'),
        { label: '挂断', effect: () => ({ sanity: 5, message: '现在的环境，稳住最重要。' }) }
    ]
  }
];