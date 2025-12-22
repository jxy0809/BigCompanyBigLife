
import { GameEvent, GameStats, Location, ShopItem, EventCategory, TitleConfig, IndustryType, IndustryConfig, EventRarity, Buff } from './types';
import { Coffee, Gamepad2, BookOpen, Pill, Headphones, Sparkles } from 'lucide-react';

export const CONFIG = {
  MAX_WEEKS: 52,
  BASE_EXPENSE: 2000,
  LIFESTYLE_CREEP_RATE: 0.05,
  REVENGE_SPENDING_THRESHOLD: 30,
  REVENGE_SPENDING_AMOUNT: 1500,
  DEBT_LIMIT: 3, 
  BURNOUT_THRESHOLD: 20,
  MASTERY_THRESHOLD: 5,
  TITLE_THRESHOLD: 20,
  ICU_COST: 5000, 
  
  // Weekend Config
  WEEKEND_SLEEP_STAMINA: 40,
  WEEKEND_SLEEP_SANITY: 20,
  WEEKEND_STUDY_COST: 1500,
  WEEKEND_GIG_MONEY: 3000,
  WEEKEND_GIG_STAMINA_COST: 40,
  WEEKEND_SOCIAL_SANITY: 35,
  WEEKEND_SOCIAL_COST: 1200,

  // Small Week Config
  SMALL_WEEK_SANITY_PENALTY: 10,
  SMALL_WEEK_RECOVERY_RATE: 0.05,
  BIG_WEEK_RECOVERY_RATE: 0.20,

  // NPC Config
  RELATIONSHIP_THRESHOLD_BONUS: 80, 
};

// --- BUFFS ---
export const BUFFS: Record<string, (duration: number) => Buff> = {
    MOMENTUM: (d) => ({ id: 'momentum', name: '项目大胜', description: '全组士气高涨', duration: d, isNegative: false, effect: { salaryMod: 1.1, sanityCostMod: 0.8 } }),
    BACK_PAIN: (d) => ({ id: 'back_pain', name: '腰椎劳损', description: '甚至坐立难安', duration: d, isNegative: true, effect: { staminaCostMod: 1.5 } }),
    BOSS_FAVOR: (d) => ({ id: 'boss_favor', name: '领导赏识', description: '老板看你很顺眼', duration: d, isNegative: false, effect: { salaryMod: 1.2, luckMod: 5 } }),
    DEPRESSED: (d) => ({ id: 'depressed', name: '情绪低落', description: '什么都不想做', duration: d, isNegative: true, effect: { sanityCostMod: 1.5, staminaCostMod: 1.2 } }),
    INSOMNIA: (d) => ({ id: 'insomnia', name: '神经衰弱', description: '夜不能寐', duration: d, isNegative: true, effect: { staminaCostMod: 1.3 } }),
    INSPIRED: (d) => ({ id: 'inspired', name: '灵感爆发', description: '下笔如有神', duration: d, isNegative: false, effect: { luckMod: 10 } }),
    NINE_NINE_SIX: (d) => ({ id: '996', name: '996福报', description: '体力消耗大幅增加', duration: d, isNegative: true, effect: { staminaCostMod: 1.3 } }),
};

// --- INDUSTRIES ---
export const INDUSTRIES: Record<IndustryType, IndustryConfig> = {
  [IndustryType.INTERNET]: {
    type: IndustryType.INTERNET,
    name: '互联网大厂',
    description: '高薪、期权、福报。你是一颗高速旋转的螺丝钉。',
    theme: { primaryColor: '#3370ff', secondaryColor: '#e1eaff', bgColor: '#0f172a', textColor: '#1f2329' },
    text: { currency: 'k', progress: '迭代', overtime: '上线', bonus: '期权', fired: '毕业', levelName: 'P' },
    npcs: {
      boss: { id: 'i_boss', name: '架构师老张', role: '技术总监', desc: '发际线是资历的证明' },
      colleague: { id: 'i_col', name: '卷王小李', role: 'PM', desc: '需求狂魔' },
      hr: { id: 'i_hr', name: 'Linda', role: 'HRBP', desc: '降本增效专家' }
    },
    modifiers: {
      salaryMultiplier: 1.2,
      initialSanityPenalty: 10,
      staminaBonus: 0,
      maxSanityCap: 100,
      smallWeek: true,
      eqSalaryScaling: false,
      techSalaryGate: false,
      weeklySanityDrain: 0,
      luckBonus: false
    }
  },
  [IndustryType.REAL_ESTATE]: {
    type: IndustryType.REAL_ESTATE,
    name: '地产巨头',
    description: '高周转、高杠杆。开单吃三年，不开单吃土。',
    theme: { primaryColor: '#b45309', secondaryColor: '#fef3c7', bgColor: '#451a03', textColor: '#451a03' },
    text: { currency: '万', progress: '去化率', overtime: '开盘', bonus: '佣金', fired: '末位淘汰', levelName: 'M' },
    npcs: {
      boss: { id: 'r_boss', name: '王总', role: '区域总', desc: '暴发户气质，只看业绩' },
      colleague: { id: 'r_col', name: '甲方陈经理', role: '甲方爸爸', desc: '催命符' },
      hr: { id: 'r_hr', name: 'Tony', role: '销售总监', desc: '如果不把你榨干就算他输' }
    },
    modifiers: {
      salaryMultiplier: 0.8, 
      initialSanityPenalty: 0,
      staminaBonus: 0,
      maxSanityCap: 100,
      smallWeek: false,
      eqSalaryScaling: true, 
      techSalaryGate: false,
      weeklySanityDrain: 0,
      luckBonus: false
    }
  },
  [IndustryType.PHARMA]: {
    type: IndustryType.PHARMA,
    name: '生物医药',
    description: '严谨、合规、长周期。任何一个数据错误都是致命的。',
    theme: { primaryColor: '#0ea5e9', secondaryColor: '#e0f2fe', bgColor: '#f8fafc', textColor: '#0c4a6e' },
    text: { currency: 'k', progress: '临床进度', overtime: '实验', bonus: '研发奖', fired: '合规劝退', levelName: 'T' },
    npcs: {
      boss: { id: 'p_boss', name: '李教授', role: '首席科学家', desc: '眼里容不得沙子' },
      colleague: { id: 'p_col', name: 'Sarah', role: '合规官', desc: '行走的一票否决权' },
      hr: { id: 'p_hr', name: 'Jason', role: '医药代表', desc: '什么都能搞定' }
    },
    modifiers: {
      salaryMultiplier: 1.0,
      initialSanityPenalty: 0,
      staminaBonus: 0,
      maxSanityCap: 100,
      smallWeek: false,
      eqSalaryScaling: false,
      techSalaryGate: true, 
      weeklySanityDrain: 0,
      luckBonus: false
    }
  },
  [IndustryType.POLICE]: {
    type: IndustryType.POLICE,
    name: '基层警务',
    description: '责任、奉献、连轴转。为人民服务，除了发量。',
    theme: { primaryColor: '#1e3a8a', secondaryColor: '#dbeafe', bgColor: '#172554', textColor: '#1e3a8a' },
    text: { currency: '元', progress: '结案率', overtime: '出警', bonus: '津贴', fired: '停职', levelName: '衔' },
    npcs: {
      boss: { id: 'po_boss', name: '张所', role: '所长', desc: '老烟枪，经验丰富' },
      colleague: { id: 'po_col', name: '老法医', role: '技术科', desc: '见惯了生死' },
      hr: { id: 'po_hr', name: '投诉专业户', role: '市民', desc: '专门给你找麻烦' }
    },
    modifiers: {
      salaryMultiplier: 0.9,
      initialSanityPenalty: 0,
      staminaBonus: 50, 
      maxSanityCap: 100,
      smallWeek: false,
      eqSalaryScaling: false,
      techSalaryGate: false,
      weeklySanityDrain: 5, 
      luckBonus: false
    }
  },
  [IndustryType.DESIGN]: {
    type: IndustryType.DESIGN,
    name: '广告设计',
    description: '五彩斑斓的黑。你的审美永远是错的，甲方永远是对的。',
    theme: { primaryColor: '#9333ea', secondaryColor: '#f3e8ff', bgColor: '#581c87', textColor: '#581c87' },
    text: { currency: 'k', progress: '定稿率', overtime: '改稿', bonus: '项目费', fired: '拉黑', levelName: 'L' },
    npcs: {
      boss: { id: 'd_boss', name: '总监Kevin', role: '创意总监', desc: '只会说“感觉不对”' },
      colleague: { id: 'd_col', name: 'AE小美', role: '客户执行', desc: '两头受气的传话筒' },
      hr: { id: 'd_hr', name: '甲方爸爸', role: '金主', desc: '审美奇葩' }
    },
    modifiers: {
      salaryMultiplier: 1.1,
      initialSanityPenalty: 0,
      staminaBonus: 0,
      maxSanityCap: 50, 
      smallWeek: false,
      eqSalaryScaling: false,
      techSalaryGate: false,
      weeklySanityDrain: 0,
      luckBonus: true 
    }
  }
};

// --- EVENTS REPOSITORY ---

export const UNIVERSAL_CHAINED_EVENTS: Record<string, (ind: IndustryType) => GameEvent> = {
    LOW_STAMINA: (ind) => ({
        id: 'u_faint', category: EventCategory.CHAINED, location: Location.HOSPITAL, industry: ind, rarity: EventRarity.COMMON,
        title: '身体警报',
        description: ind === IndustryType.INTERNET ? '长期熬夜导致你在工位上突然黑视，醒来时已经在医院。' 
                   : ind === IndustryType.POLICE ? '连续蹲点48小时后，你晕倒在抓捕现场。' 
                   : '过度的劳累让你身体机能停摆，强制住院。',
        options: [{ label: '接受治疗', effect: () => ({ stamina: 30, money: -2000, addBuff: BUFFS.BACK_PAIN(8), message: '医生警告你：再这样下去会死的。' }) }]
    }),
    LOW_MONEY: (ind) => ({
        id: 'u_broke', category: EventCategory.CHAINED, location: Location.HOME, industry: ind, rarity: EventRarity.COMMON,
        title: '经济危机',
        description: '房东发来最后通牒，再不交租就卷铺盖走人。信用卡也刷爆了。',
        options: [
            { label: '借网贷', effect: () => ({ money: 5000, risk: 20, sanity: -10, message: '解了燃眉之急，但利息惊人。' }) },
            { label: '睡公司/单位', effect: () => ({ stamina: -20, sanity: -20, message: '在会议室凑合了一晚，腰酸背痛。' }) }
        ]
    }),
    LOW_SANITY: (ind) => ({
        id: 'u_breakdown', category: EventCategory.CHAINED, location: Location.WORKSTATION, industry: ind, rarity: EventRarity.COMMON,
        title: '情绪崩溃',
        description: '一点小事成了压垮骆驼的稻草。你在办公室突然无法控制地大哭（或大怒）。',
        options: [
            { label: '彻底发泄', effect: () => ({ sanity: 50, relationships: { boss: -20, colleague: -20 }, addBuff: BUFFS.DEPRESSED(4), message: '发泄完了，但大家看你的眼神都变了。' }) }
        ]
    })
};

const INTERNET_EVENTS: GameEvent[] = [
    { id: 'i_1', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.INTERNET, title: '核心服务宕机', description: '线上P0级事故！核心交易链路全红，大群里老板在咆哮。', options: [{ label: '定位回滚 (Tech>20)', requires: s => s.attributes.tech > 20, effect: () => ({ exp: 50, sanity: -10, addBuff: BUFFS.BOSS_FAVOR(4), message: '你神一般的操作在5分钟内恢复了服务。' }) }, { label: '疯狂甩锅', effect: () => ({ sanity: 10, risk: 10, message: '你把锅甩给了运维，虽然保住了绩效，但失去了人心。' }) }] },
    { id: 'i_2', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.INTERNET, title: '对齐颗粒度周会', description: '周报会，老板要求对齐颗粒度，打通底层逻辑。', options: [{ label: '讲高级黑话 (EQ>15)', requires: s => s.attributes.eq > 15, effect: () => ({ sanity: 5, relationships: { boss: 5 }, message: '你的一套组合拳把老板忽悠瘸了。' }) }, { label: '昏昏欲睡', effect: () => ({ stamina: -10, sanity: -20, message: '浪费了两个小时生命。' }) }] },
    { id: 'i_3', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET, title: '凌晨3点的需求变更', description: '产品经理站在你身后：老板说这个按钮颜色要改，今晚上线。', options: [{ label: '连夜上线', effect: () => ({ stamina: -40, exp: 30, message: '你看到了凌晨4点的科技园。' }) }, { label: '怒怼PM', effect: () => ({ sanity: 20, risk: 5, message: '爽是爽了，但被记了一笔。' }) }] },
    { id: 'i_4', category: EventCategory.CHOICE, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.INTERNET, title: '期权回购承诺', description: '公司宣布开启期权回购，但需要签竞业协议。', options: [{ label: '入股 (Luck>18)', requires: s => s.attributes.luck > 18, effect: () => ({ money: 50000, addBuff: BUFFS.MOMENTUM(8), message: '赌对了！公司估值翻倍！' }) }, { label: '要现金', effect: () => ({ money: 2000, attributes: { luck: -1 }, message: '落袋为安，虽然可能亏了未来。' }) }] },
    { id: 'i_5', category: EventCategory.ROUTINE, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.INTERNET, title: '年度OKR审计', description: '到了定生死的时刻，PPT写得好不好决定明年工资。', options: [{ label: '数据闭环 (Tech>25)', requires: s => s.attributes.tech > 25, effect: () => ({ salary: 500, money: 5000, message: '你的产出无懈可击，S绩效！' }) }, { label: '勉强凑数', effect: () => ({ stamina: -20, sanity: -10, message: '勉强保住了B绩效。' }) }] },
    { id: 'i_6', category: EventCategory.FATE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET, title: '搬迁偏远园区', description: '公司为了降本，搬到了几十公里外的郊区。', options: [{ label: '坚持通勤', effect: () => ({ maxStamina: -10, money: -500, message: '每天通勤4小时，感觉身体被掏空。' }) }, { label: '离职', effect: () => ({ risk: 100, message: '裸辞风险极大。' }) }] },
    { id: 'i_7', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.HOME, industry: IndustryType.INTERNET, title: '竞品挖角', description: '猎头打来电话，竞品公司开出了涨薪50%的Offer。', options: [{ label: '谈薪 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ money: 3000, salary: 500, message: '拿着Offer找老板，成功加薪留任。' }) }, { label: '礼貌拒绝', effect: () => ({ relationships: { boss: 20 }, message: '老板感动于你的忠诚（虽然不涨工资）。' }) }] },
    { id: 'i_8', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET, title: '全员摸鱼大赛', description: '老板出差了，办公室弥漫着快乐的气息。', options: [{ label: '摸鱼 (Luck>15)', requires: s => s.attributes.luck > 15, effect: () => ({ stamina: 20, sanity: 20, message: '带薪拉屎两小时，爽翻。' }) }, { label: '被抓典型', effect: () => ({ money: -1000, sanity: -30, message: '刚打开游戏就被老板撞见。' }) }] },
    { id: 'i_9', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET, title: '权限被封', description: '你的代码仓库权限突然无法访问，HR在找你。', options: [{ label: '承认违规', effect: () => ({ sanity: -20, risk: 20, message: '写检讨，背处分。' }) }, { label: '找同事代修', effect: () => ({ money: -500, stamina: 10, message: '原来是误操作，虚惊一场。' }) }] },
    { id: 'i_10', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET, title: '双11大促值班', description: '全员通宵值守，此时此刻，稳住就是胜利。', options: [{ label: '死撑', effect: () => ({ stamina: -50, money: 2000, message: '靠红牛续命，拿到了大促红包。' }) }, { label: '偷偷睡觉', effect: () => ({ risk: 30, message: '幸好没出事，否则就完了。' }) }] },
];

const REAL_ESTATE_EVENTS: GameEvent[] = [
    { id: 'r_1', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.REAL_ESTATE, title: '深夜陪甲方应酬', description: '王总暗示：今晚这个局很重要，要把张总陪好。', options: [{ label: '千杯不醉 (Health>25)', requires: s => s.attributes.health > 25, effect: () => ({ money: 8000, stamina: -40, message: '喝吐了三次，但拿下了千万大单。' }) }, { label: '借口溜走', effect: () => ({ money: -2000, sanity: 10, message: '单子飞了，奖金扣光。' }) }] },
    { id: 'r_2', category: EventCategory.ROUTINE, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '销冠挑战', description: '集团发起冲刺，销冠奖励宝马一辆。', options: [{ label: '话术忽悠 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ money: 10000, attributes: { luck: -1 }, message: '虽然良心有点痛，但钱是真香。' }) }, { label: '诚实推销', effect: () => ({ money: 1000, exp: 10, message: '业绩平平，但睡得安稳。' }) }] },
    { id: 'r_3', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '工地突发维权', description: '业主拉横幅闹事，说精装变毛坯。', options: [{ label: '安抚 (EQ>18)', requires: s => s.attributes.eq > 18, effect: () => ({ exp: 50, sanity: -30, addBuff: BUFFS.BOSS_FAVOR(4), message: '凭三寸不烂之舌劝退了业主。' }) }, { label: '报警', effect: () => ({ sanity: -10, attributes: { luck: -1 }, message: '事情闹大了，影响不好。' }) }] },
];

const PHARMA_EVENTS: GameEvent[] = [
    { id: 'p_1', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.PHARMA, title: '临床数据异常', description: '三期临床关键数据对不上，可能整个项目要黄。', options: [{ label: '排查漏洞 (Tech>28)', requires: s => s.attributes.tech > 28, effect: () => ({ exp: 100, level: 1, message: '你发现了统计学逻辑错误，拯救了项目！' }) }, { label: '掩盖数据', effect: () => ({ money: 5000, risk: 50, message: '拿了封口费，但晚上睡不着。' }) }] },
];

const POLICE_EVENTS: GameEvent[] = [
    { id: 'po_1', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '全城搜捕', description: '重大嫌疑人出逃，全员取消休假，48小时连轴转。', options: [{ label: '死磕 (Stamina>30)', requires: s => s.stamina > 30, effect: () => ({ exp: 80, stamina: -60, addBuff: BUFFS.BOSS_FAVOR(4), message: '你熬红了眼，但抓住了人。' }) }, { label: '后勤保障', effect: () => ({ exp: 10, stamina: -10, message: '负责订盒饭。' }) }] },
];

const DESIGN_EVENTS: GameEvent[] = [
    { id: 'd_1', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.DESIGN, title: '五彩斑斓的黑', description: '甲方爸爸提出离谱需求：要大气，要接地气，要五彩斑斓的黑。', options: [{ label: '专业忽悠 (EQ>25)', requires: s => s.attributes.eq > 25, effect: () => ({ money: 2000, sanity: 10, message: '你用专业术语把甲方绕晕了，定稿。' }) }, { label: '改50遍', effect: () => ({ stamina: -50, sanity: -40, message: '改到最后用了第一版。' }) }] },
];

export const getEventsForIndustry = (industry: IndustryType): GameEvent[] => {
    let specific: GameEvent[] = [];
    switch(industry) {
        case IndustryType.INTERNET: specific = INTERNET_EVENTS; break;
        case IndustryType.REAL_ESTATE: specific = REAL_ESTATE_EVENTS; break;
        case IndustryType.POLICE: specific = POLICE_EVENTS; break;
        case IndustryType.PHARMA: specific = PHARMA_EVENTS; break;
        case IndustryType.DESIGN: specific = DESIGN_EVENTS; break;
    }

    const txt = INDUSTRIES[industry].text;
    const routineEvents: GameEvent[] = [
        {
            id: 'routine_ot', category: EventCategory.ROUTINE, location: Location.WORKSTATION, industry: industry, rarity: EventRarity.COMMON,
            title: `紧急${txt.overtime}`, description: `突然来了个急活，今晚必须${txt.overtime}。`,
            options: [
                { label: '冲！', effect: () => ({ stamina: -15, sanity: -5, exp: 10, message: '很累，但有产出。' }) },
                { label: '摸鱼', effect: () => ({ sanity: 5, risk: 5, message: '假装在忙。' }) }
            ]
        },
        {
            id: 'routine_gossip', category: EventCategory.NPC_INTERACTION, location: Location.WORKSTATION, industry: industry, rarity: EventRarity.COMMON,
            title: '茶水间八卦', description: `听说隔壁部门老大要被${txt.fired}了。`,
            options: [
                { label: '打听细节', effect: () => ({ relationships: { colleague: 5 }, risk: 2, message: '吃瓜群众。' }) },
                { label: '不信谣', effect: () => ({ message: '专心工作。' }) }
            ]
        }
    ];

    return [...specific, ...routineEvents];
};

export const BLANK_STATS: GameStats = {
  stamina: 100, maxStamina: 100, sanity: 100, maxSanity: 100, sanityRate: 1, money: 0, salary: 0, expenses: 0,
  level: 1, exp: 0, week: 1, risk: 0, debtWeeks: 0, location: Location.WORKSTATION, industry: IndustryType.INTERNET, 
  attributes: { grind: 1, eq: 1, tech: 1, health: 1, luck: 1 },
  titles: [], relationships: { boss: 30, colleague: 30, hr: 30 }, activeBuffs: [],
  techEventCount: 0, overtimeHours: 0, isSmallWeek: false, reviveUsed: false, legacyPointsUsed: 0
};

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'coffee', name: '咖啡/红牛', description: '续命水。体力+10', price: 30, effect: (s) => ({ stamina: Math.min(s.maxStamina, s.stamina + 10) }), icon: Coffee },
  { id: 'game', name: '3A大作', description: '逃避可耻但有用。心智+20', price: 398, effect: (s) => ({ sanity: Math.min(s.maxSanity, s.sanity + 20) }), icon: Gamepad2 },
  { id: 'course', name: '行业课程', description: '充电。经验+50', price: 500, effect: (s) => ({ exp: s.exp + 50 }), icon: BookOpen },
  { id: 'supplements', name: '保健品', description: '智商税？体质+1', price: 800, effect: (s) => ({ attributes: { ...s.attributes, health: s.attributes.health + 1 } }), icon: Pill },
  { id: 'headphones', name: '降噪耳机', description: '物理结界。耐艹+1', price: 2500, effect: (s) => ({ attributes: { ...s.attributes, grind: s.attributes.grind + 1 } }), icon: Headphones },
  { id: 'leisure_max', name: '上楼休闲', description: '顶级Spa与冥想。体力与心智完全恢复。', price: 15000, effect: (s) => ({ stamina: s.maxStamina, sanity: s.maxSanity }), icon: Sparkles }
];
