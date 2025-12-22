import { GameEvent, GameStats, Location, ShopItem, EventCategory, TitleConfig, IndustryType, IndustryConfig, EventRarity, Buff } from './types';
import { Coffee, Gamepad2, BookOpen, Pill, Headphones } from 'lucide-react';

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

// 1. Universal Chained Events (Triggers when stats are low)
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

// 2. Industry Specific Events
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
    // New Events
    { id: 'i_11', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET, title: '接手前任屎山代码', description: '前任留下的代码连注释都没有，跑起来全靠运气。', options: [{ label: '重构 (Tech>28)', requires: s => s.attributes.tech > 28, effect: () => ({ exp: 80, attributes: { tech: 3 }, message: '你重构了核心模块，代码像诗一样优雅。' }) }, { label: '缝缝补补', effect: () => ({ stamina: -20, risk: 10, message: '又堆了一座屎山，祈祷别塌。' }) }] },
    { id: 'i_12', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.INTERNET, title: '被要求“主动”优化产出', description: '老板暗示你最近产出不够饱和，需要“主动”一点。', options: [{ label: '精美PPT (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ sanity: 20, message: 'PPT做得太好了，老板忘了你代码写得烂。' }) }, { label: '埋头苦干', effect: () => ({ stamina: -30, message: '干得最多，被骂得最惨。' }) }] },
    { id: 'i_13', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.HOME, industry: IndustryType.INTERNET, title: '周六下午的团建爬山', description: '说是自愿参加，但大群里已经在接龙了。', options: [{ label: '积极参加', effect: () => ({ stamina: -30, relationships: { boss: 15 }, message: '累得半死，但在老板面前刷了脸。' }) }, { label: '借口生病', effect: () => ({ stamina: 20, relationships: { boss: -10 }, message: '享受了难得的周末，但被标记为“不合群”。' }) }] },
    { id: 'i_14', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET, title: '内网匿名吐槽被开盒', description: '你在内网吐槽食堂难吃，结果被HR约谈了。', options: [{ label: '运气好 (Luck>22)', requires: s => s.attributes.luck > 22, effect: () => ({ sanity: 10, message: '系统刚好故障，没查到是你。' }) }, { label: '被约谈', effect: () => ({ sanity: -40, money: -5000, message: '年终奖大概率没了。' }) }] },
    { id: 'i_15', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET, title: '公司推行全员 996', description: '为了降本增效，公司宣布开启“奋斗模式”。', options: [{ label: '忍气吞声', effect: () => ({ money: 1000, addBuff: BUFFS.NINE_NINE_SIX(8), message: '虽然有加班费，但身体被掏空。' }) }, { label: '准点下班', effect: () => ({ sanity: 20, exp: 0, message: '心态稳了，但晋升无望。' }) }] },
    { id: 'i_16', category: EventCategory.FATE, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.INTERNET, title: 'GitHub 项目意外爆火', description: '你随手写的开源小工具上了热榜第一。', options: [{ label: '运营 (Tech>30)', requires: s => s.attributes.tech > 30, effect: () => ({ level: 2, attributes: { luck: 10 }, message: '业界知名度大增，连升两级！' }) }, { label: '没精力维护', effect: () => ({ sanity: -5, message: '看着issue堆积如山，只能装死。' }) }] },
    { id: 'i_17', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET, title: '监控 IP 在线率被查', description: '行政开始查考勤时长，精确到分钟。', options: [{ label: '找人代挂', effect: () => ({ money: -500, stamina: 10, message: '花小钱买个安心。' }) }, { label: '硬熬', effect: () => ({ stamina: -20, sanity: -10, message: '在工位上枯坐到晚上10点。' }) }] },
    { id: 'i_18', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.HOME, industry: IndustryType.INTERNET, title: '获得大厂架构师内推', description: '前同事在隔壁大厂混得不错，想捞你过去。', options: [{ label: '面试 (Tech>25)', requires: s => s.attributes.tech > 25, effect: () => ({ money: 5000, level: 1, message: '跳槽成功，薪资普涨！' }) }, { label: '遗憾落选', effect: () => ({ sanity: -20, message: '面试被虐得体无完肤。' }) }] },
    { id: 'i_19', category: EventCategory.CHOICE, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.INTERNET, title: '加入“核心攻坚小组”', description: '公司要搞封闭开发，两个月不回家。', options: [{ label: '熬夜突围 (Health>28)', requires: s => s.attributes.health > 28, effect: () => ({ exp: 100, money: 8000, message: '项目上线，你成了功臣。' }) }, { label: '申请退出', effect: () => ({ level: -1, stamina: 20, message: '保住了狗命，但被边缘化了。' }) }] },
    { id: 'i_20', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET, title: '全员取消下午茶福利', description: '降本增效，连零食柜都空了。', options: [{ label: '发帖抱怨', effect: () => ({ sanity: 10, relationships: { boss: -5 }, message: '嘴上爽了，但被HR记住了。' }) }, { label: '默默接受', effect: () => ({ sanity: -5, message: '连这点快乐都没了。' }) }] },
];

const REAL_ESTATE_EVENTS: GameEvent[] = [
    { id: 'r_1', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.REAL_ESTATE, title: '深夜陪甲方应酬', description: '王总暗示：今晚这个局很重要，要把张总陪好。', options: [{ label: '千杯不醉 (Health>25)', requires: s => s.attributes.health > 25, effect: () => ({ money: 8000, stamina: -40, message: '喝吐了三次，但拿下了千万大单。' }) }, { label: '借口溜走', effect: () => ({ money: -2000, sanity: 10, message: '单子飞了，奖金扣光。' }) }] },
    { id: 'r_2', category: EventCategory.ROUTINE, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '销冠挑战', description: '集团发起冲刺，销冠奖励宝马一辆。', options: [{ label: '话术忽悠 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ money: 10000, attributes: { luck: -1 }, message: '虽然良心有点痛，但钱是真香。' }) }, { label: '诚实推销', effect: () => ({ money: 1000, exp: 10, message: '业绩平平，但睡得安稳。' }) }] },
    { id: 'r_3', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '工地突发维权', description: '业主拉横幅闹事，说精装变毛坯。', options: [{ label: '安抚 (EQ>18)', requires: s => s.attributes.eq > 18, effect: () => ({ exp: 50, sanity: -30, addBuff: BUFFS.BOSS_FAVOR(4), message: '凭三寸不烂之舌劝退了业主。' }) }, { label: '报警', effect: () => ({ sanity: -10, attributes: { luck: -1 }, message: '事情闹大了，影响不好。' }) }] },
    { id: 'r_4', category: EventCategory.FATE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.REAL_ESTATE, title: '土地竞拍失利', description: '准备了半年的方案，在竞拍中输给了对手。', options: [{ label: '连夜改方案', effect: () => ({ stamina: -30, risk: 10, message: '试图亡羊补牢。' }) }, { label: '摆烂', effect: () => ({ sanity: 20, stamina: 10, message: '反正不是我的锅。' }) }] },
    { id: 'r_5', category: EventCategory.FATE, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '政策限购突袭', description: '突发限购政策，客户都在退定金。', options: [{ label: '回笼资金 (Luck>15)', requires: s => s.attributes.luck > 15, effect: () => ({ money: 5000, message: '凭直觉提前操作了一波，止损。' }) }, { label: '资金链断裂', effect: () => ({ money: -8000, message: '这周白干了。' }) }] },
    { id: 'r_6', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.RARE, location: Location.BOSS_OFFICE, industry: IndustryType.REAL_ESTATE, title: '老板私人聚会', description: '王总喊你去他家打牌，这是进入核心圈子的机会。', options: [{ label: '高情商 (EQ>25)', requires: s => s.attributes.eq > 25, effect: () => ({ salary: 500, stamina: -20, addBuff: BUFFS.BOSS_FAVOR(8), message: '你会来事儿，王总把你当自己人。' }) }, { label: '默默吃菜', effect: () => ({ message: '你是个透明人。' }) }] },
    { id: 'r_7', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '供应商讨债', description: '承建商堵门要工程款。', options: [{ label: '动用人脉', effect: () => ({ sanity: -20, exp: 20, message: '暂时压下去了。' }) }, { label: '强制扣款', effect: () => ({ money: -5000, message: '从你的项目款里先垫付。' }) }] },
    { id: 'r_8', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '样板间违建', description: '有人举报样板间违建，城管来了。', options: [{ label: '快速改建 (Tech>15)', requires: s => s.attributes.tech > 15, effect: () => ({ money: -2000, exp: 30, message: '连夜拆除违规部分。' }) }, { label: '停工整顿', effect: () => ({ salary: -2000, message: '本周工资没了。' }) }] },
    { id: 'r_9', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.HOME, industry: IndustryType.REAL_ESTATE, title: '跨行机会', description: '有个物业管理的工作机会，稳定但钱少。', options: [{ label: '转型 (Tech>20)', requires: s => s.attributes.tech > 20, effect: () => ({ stamina: 20, salary: -1000, message: '虽然钱少了，但不用陪酒了。' }) }, { label: '坚守', effect: () => ({ sanity: -10, message: '富贵险中求。' }) }] },
    { id: 'r_10', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '内部认购', description: '公司新盘内部认购，买到就是赚到。', options: [{ label: '借钱买', effect: () => ({ money: -20000, addBuff: BUFFS.MOMENTUM(20), message: '背上巨债，但未来可期。' }) }, { label: '放弃', effect: () => ({ message: '没钱是硬伤。' }) }] },
    // New Events
    { id: 'r_11', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '承建商讨要垫资', description: '包工头带着几十号人坐在售楼处门口吃盒饭。', options: [{ label: '饭局搞定 (EQ>22)', requires: s => s.attributes.eq > 22, effect: () => ({ exp: 40, money: -1000, message: '一顿酒喝得称兄道弟，暂时劝回去了。' }) }, { label: '强制停工', effect: () => ({ level: -1, sanity: -30, message: '事情闹大，上面对你很不满意。' }) }] },
    { id: 'r_12', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '对手造谣楼盘风水', description: '谣言说你们楼盘地基下有古墓，阴气重。', options: [{ label: '做法事 (Luck>20)', requires: s => s.attributes.luck > 20, effect: () => ({ money: -2000, attributes: { luck: 10 }, message: '请了大师做场法事，反而成了营销热点。' }) }, { label: '不予理睬', effect: () => ({ money: -5000, message: '谣言越传越真，销量下滑。' }) }] },
    { id: 'r_13', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.BOSS_OFFICE, industry: IndustryType.REAL_ESTATE, title: '帮老板亲戚安排面试', description: '老板的小舅子想来混个闲职。', options: [{ label: '安排妥当 (EQ>18)', requires: s => s.attributes.eq > 18, effect: () => ({ relationships: { boss: 30 }, message: '老板拍了拍你的肩膀，眼神赞许。' }) }, { label: '公事公办', effect: () => ({ sanity: 10, relationships: { boss: -10 }, message: '你守住了底线，但得罪了人。' }) }] },
    { id: 'r_14', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '深夜工地噪音被投诉', description: '为了赶工期通宵施工，周围居民炸锅了。', options: [{ label: '搞定居委会 (EQ>15)', requires: s => s.attributes.eq > 15, effect: () => ({ exp: 20, money: -1000, message: '送了点礼品，暂时安抚住了。' }) }, { label: '罚款停工', effect: () => ({ money: -3000, message: '环保局开了罚单，得不偿失。' }) }] },
    { id: 'r_15', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '发现项目安全隐患', description: '承重墙钢筋标号好像不对。', options: [{ label: '强制整改 (Tech>20)', requires: s => s.attributes.tech > 20, effect: () => ({ exp: 50, money: -2000, message: '虽然延误了工期，但避免了重大事故。' }) }, { label: '视而不见', effect: () => ({ money: 2000, risk: 30, message: '省了成本，但埋下了定时炸弹。' }) }] },
    { id: 'r_16', category: EventCategory.FATE, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.REAL_ESTATE, title: '获得优质地块情报', description: '有内幕消息说某块地要通地铁。', options: [{ label: '建议拿地 (Luck>25)', requires: s => s.attributes.luck > 25, effect: () => ({ money: 10000, level: 1, message: '公司大赚，你直接晋升！' }) }, { label: '错过时机', effect: () => ({ message: '消息不准，还好没动。' }) }] },
    { id: 'r_17', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '销售中心被业主围堵', description: '几十号业主情绪激动，要冲进办公室。', options: [{ label: '冲在前面 (Health>20)', requires: s => s.attributes.health > 20, effect: () => ({ exp: 60, stamina: -30, message: '你受了点皮肉伤，但保住了售楼处。' }) }, { label: '后门溜走', effect: () => ({ sanity: 10, level: -1, message: '领导觉得你没有担当。' }) }] },
    { id: 'r_18', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.BOSS_OFFICE, industry: IndustryType.REAL_ESTATE, title: '被派往外地偏远项目', description: '鸟不拉屎的地方，说是去拓荒。', options: [{ label: '接受外派', effect: () => ({ money: 4000, stamina: -20, message: '补助很高，但生活条件极差。' }) }, { label: '拒绝执行', effect: () => ({ sanity: 20, level: -2, message: '你留在了总部，但被边缘化。' }) }] },
    { id: 'r_19', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '资金链紧张缓发工资', description: '财务说账上没钱了，工资拖半个月。', options: [{ label: '带头安抚', effect: () => ({ level: 1, sanity: -20, message: '你成了老板的“自己人”。' }) }, { label: '一起闹', effect: () => ({ money: 2000, risk: 20, message: '按闹分配，工资发了，但被记仇。' }) }] },
    { id: 'r_20', category: EventCategory.FATE, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE, title: '项目获得鲁班奖', description: '这是建筑行业的奥斯卡。', options: [{ label: '简历镀金 (Tech>25)', requires: s => s.attributes.tech > 25, effect: () => ({ level: 1, exp: 100, message: '身价倍增，猎头电话被打爆。' }) }, { label: '跟着混荣誉', effect: () => ({ exp: 20, message: '虽然没出力，但也能沾点光。' }) }] },
];

const PHARMA_EVENTS: GameEvent[] = [
    { id: 'p_1', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.PHARMA, title: '临床数据异常', description: '三期临床关键数据对不上，可能整个项目要黄。', options: [{ label: '排查漏洞 (Tech>28)', requires: s => s.attributes.tech > 28, effect: () => ({ exp: 100, level: 1, message: '你发现了统计学逻辑错误，拯救了项目！' }) }, { label: '掩盖数据', effect: () => ({ money: 5000, risk: 50, message: '拿了封口费，但晚上睡不着。' }) }] },
    { id: 'p_2', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA, title: '学术推广会', description: '周末要去外地开学术会，其实就是当提包小弟。', options: [{ label: '连飞三城', effect: () => ({ stamina: -40, money: 3000, message: '累成狗，但出差补贴很香。' }) }, { label: '派下属去', effect: () => ({ sanity: 10, relationships: { boss: -10 }, message: '自己舒服了，但领导觉得你懒。' }) }] },
    { id: 'p_3', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA, title: 'GCP突击检查', description: '药监局空降检查，文档如果不合规就完了。', options: [{ label: '完美文档 (Tech>20)', requires: s => s.attributes.tech > 20, effect: () => ({ sanity: 20, exp: 30, message: '教科书般的合规记录。' }) }, { label: '现场伪造', effect: () => ({ sanity: -50, risk: 40, message: '在红线边缘疯狂试探。' }) }] },
    { id: 'p_4', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA, title: '仪器故障', description: '几百万的质谱仪坏了，工程师下周才能来。', options: [{ label: '手动修复', effect: () => ({ stamina: -20, attributes: { tech: 1 }, message: '动手能力Max。' }) }, { label: '等待', effect: () => ({ exp: -10, message: '项目进度延后。' }) }] },
    { id: 'p_5', category: EventCategory.FATE, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA, title: '竞品抢跑', description: '对手的新药提前获批了，我们还在二期。', options: [{ label: '调整策略 (Luck>20)', requires: s => s.attributes.luck > 20, effect: () => ({ money: 2000, message: '走了差异化路线，反而发现了新蓝海。' }) }, { label: '研发失败', effect: () => ({ money: -5000, sanity: -40, message: '前期投入打了水漂。' }) }] },
    { id: 'p_6', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.BOSS_OFFICE, industry: IndustryType.PHARMA, title: '举报信', description: '有人举报医药代表违规操作，牵连到你。', options: [{ label: '平息风波 (EQ>25)', requires: s => s.attributes.eq > 25, effect: () => ({ sanity: -30, money: -1000, message: '花钱消灾。' }) }, { label: '停职调查', effect: () => ({ money: -3000, message: '本周工资归零。' }) }] },
    { id: 'p_7', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA, title: '核心人才离职', description: '组里的技术骨干要走。', options: [{ label: '挽留 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ exp: 40, stamina: -10, message: '感情留人成功。' }) }, { label: '自己兼任', effect: () => ({ stamina: -40, attributes: { tech: 2 }, message: '在这个岗位上你成长飞快。' }) }] },
    { id: 'p_8', category: EventCategory.ROUTINE, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA, title: '国际药学会', description: '有机会去参加国际顶级会议。', options: [{ label: '英文演讲', effect: () => ({ exp: 60, attributes: { luck: 5 }, addBuff: BUFFS.INSPIRED(4), message: '技惊四座，结识了大佬。' }) }, { label: '混吃混喝', effect: () => ({ stamina: 20, message: '就当旅游了。' }) }] },
    { id: 'p_9', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA, title: '集采谈判', description: '灵魂砍价现场，价格要被砍掉90%。', options: [{ label: '保住利润 (EQ>15)', requires: s => s.attributes.eq > 15, effect: () => ({ money: 1000, sanity: -20, message: '艰难守住了底线。' }) }, { label: '谈崩', effect: () => ({ money: -2000, message: '奖金全无。' }) }] },
    { id: 'p_10', category: EventCategory.FATE, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.PHARMA, title: '新药获批', description: '十年磨一剑，新药终于拿到批文了！', options: [{ label: '庆功宴 (Luck>15)', requires: s => s.attributes.luck > 15, effect: () => ({ money: 20000, sanity: 50, addBuff: BUFFS.MOMENTUM(10), message: '奖金拿到手软！' }) }, { label: '邮件通知', effect: () => ({ sanity: 5, message: '由于公司亏损，奖金减半。' }) }] },
    // New Events
    { id: 'p_11', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.PHARMA, title: '专利即将到期', description: '核心药品的专利保护期只剩一个月了。', options: [{ label: '迭代新品 (Tech>30)', requires: s => s.attributes.tech > 30, effect: () => ({ money: 10000, level: 1, message: '新一代产品无缝衔接，市场份额稳住了。' }) }, { label: '降价竞争', effect: () => ({ money: -5000, exp: 20, message: '利润腰斩，日子难过了。' }) }] },
    { id: 'p_12', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA, title: '培养皿被污染', description: '实习生没关好安全柜，一个月的细胞全废了。', options: [{ label: '挽回数据 (Tech>25)', requires: s => s.attributes.tech > 25, effect: () => ({ stamina: -30, attributes: { tech: 5 }, message: '靠着技术手段抢救了一部分实验结果。' }) }, { label: '全部重做', effect: () => ({ stamina: -50, sanity: -20, message: '连续通宵半个月，心态崩了。' }) }] },
    { id: 'p_13', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.BOSS_OFFICE, industry: IndustryType.PHARMA, title: '举报信面临内审', description: '有人匿名举报你收受回扣。', options: [{ label: '自证清白 (EQ>25)', requires: s => s.attributes.eq > 25, effect: () => ({ sanity: 30, exp: 20, message: '你拿出了完整的合规记录，狠狠打了举报者的脸。' }) }, { label: '无法解释', effect: () => ({ level: -2, money: -3000, message: '百口莫辩，被降职处理。' }) }] },
    { id: 'p_14', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA, title: '深夜学术酒会', description: '与其说是学术交流，不如说是拼酒大会。', options: [{ label: '拿下专家 (Health>22)', requires: s => s.attributes.health > 22, effect: () => ({ exp: 50, stamina: -40, message: '喝倒了三个主任，建立了深厚的革命友谊。' }) }, { label: '滴酒不沾', effect: () => ({ sanity: 10, exp: 5, message: '保持了清醒，但显得很不合群。' }) }] },
    { id: 'p_15', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.PHARMA, title: '发现竞品临床造假', description: '你在数据对比中发现了对手的致命漏洞。', options: [{ label: '匿名举报 (Luck>20)', requires: s => s.attributes.luck > 20, effect: () => ({ money: 3000, level: 1, message: '对手产品被撤回，公司市场份额大增。' }) }, { label: '保持沉默', effect: () => ({ message: '多一事不如少一事。' }) }] },
    { id: 'p_16', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA, title: '药监专家现场核查', description: '最严厉的“飞检”，没有任何准备时间。', options: [{ label: '汇报无误 (Tech>20)', requires: s => s.attributes.tech > 20, effect: () => ({ exp: 50, sanity: 20, message: '你的专业能力给专家留下了深刻印象。' }) }, { label: '答非所问', effect: () => ({ level: -1, sanity: -30, message: '一问三不知，给公司丢大人了。' }) }] },
    { id: 'p_17', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA, title: '长期接触化学品', description: '最近实验室通风系统坏了，味道很大。', options: [{ label: '身体无恙 (Health>28)', requires: s => s.attributes.health > 28, effect: () => ({ message: '你的免疫系统扛住了。' }) }, { label: '皮肤过敏', effect: () => ({ money: -2000, stamina: -30, message: '去医院挂水一周，花了不少钱。' }) }] },
    { id: 'p_18', category: EventCategory.FATE, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.PHARMA, title: '发表顶级医学论文', description: '你的研究成果登上了柳叶刀/NEJM。', options: [{ label: '业界封神 (Tech>35)', requires: s => s.attributes.tech > 35, effect: () => ({ level: 2, attributes: { luck: 20 }, message: '一夜成名，各路Offer纷至沓来。' }) }, { label: '被拒稿', effect: () => ({ sanity: -40, message: '审稿人把你批得一无是处。' }) }] },
    { id: 'p_19', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA, title: '偏远山区义诊推广', description: '公司组织的公益活动，条件艰苦。', options: [{ label: '积极响应', effect: () => ({ level: 1, sanity: 30, message: '虽然累，但收获了感动和晋升积分。' }) }, { label: '拒绝去', effect: () => ({ level: -1, message: '领导觉得你缺乏社会责任感。' }) }] },
    { id: 'p_20', category: EventCategory.CHOICE, rarity: EventRarity.EPIC, location: Location.HOME, industry: IndustryType.PHARMA, title: '收到竞争对手 Offer', description: '对方开出双倍薪水，但要求带走核心数据。', options: [{ label: '带数据跳槽', effect: () => ({ money: 20000, risk: 50, message: '赚了一大笔，但时刻担心警察敲门。' }) }, { label: '拒绝诱惑', effect: () => ({ relationships: { boss: 50 }, message: '老板知道后，把你列为核心培养对象。' }) }] },
];

const POLICE_EVENTS: GameEvent[] = [
    { id: 'po_1', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '全城搜捕', description: '重大嫌疑人出逃，全员取消休假，48小时连轴转。', options: [{ label: '死磕 (Stamina>30)', requires: s => s.stamina > 30, effect: () => ({ exp: 80, stamina: -60, addBuff: BUFFS.BOSS_FAVOR(4), message: '你熬红了眼，但抓住了人。' }) }, { label: '后勤保障', effect: () => ({ exp: 10, stamina: -10, message: '负责订盒饭。' }) }] },
    { id: 'po_2', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '奇葩纠纷', description: '邻居因为一只鸡打起来了，要求警方主持公道。', options: [{ label: '和稀泥 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ sanity: 20, exp: 20, message: '双方握手言和。' }) }, { label: '暴力拆解', effect: () => ({ sanity: -30, risk: 10, message: '被投诉态度不好。' }) }] },
    { id: 'po_3', category: EventCategory.FATE, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '命案并案', description: '你发现这个案子和十年前的悬案有联系。', options: [{ label: '深挖 (Tech>25)', requires: s => s.attributes.tech > 25, effect: () => ({ level: 1, exp: 100, message: '立功了！二等功起步！' }) }, { label: '走访', effect: () => ({ stamina: -30, message: '线索断了。' }) }] },
    { id: 'po_4', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '节假日值班', description: '别人过节你过关。', options: [{ label: '坚守', effect: () => ({ stamina: -20, sanity: -20, message: '看着朋友圈的烟花发呆。' }) }, { label: '请假', effect: () => ({ sanity: 30, risk: 5, message: '陪家人吃了个饭，但所长脸色难看。' }) }] },
    { id: 'po_5', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.HOME, industry: IndustryType.POLICE, title: '错过相亲', description: '因为临时出警，放了相亲对象鸽子。', options: [{ label: '事业为重', effect: () => ({ exp: 10, relationships: { boss: 5 }, message: '对象拉黑了你，但案子破了。' }) }, { label: '感到孤独', effect: () => ({ sanity: -40, message: '注孤生啊。' }) }] },
    { id: 'po_6', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '糖衣炮弹', description: '嫌疑人家属塞给你一个厚厚的信封。', options: [{ label: '反侦查 (Luck>20)', requires: s => s.attributes.luck > 20, effect: () => ({ money: 1000, exp: 50, message: '录音录像固定证据，反将一军。' }) }, { label: '严词拒绝', effect: () => ({ sanity: 10, message: '问心无愧。' }) }] },
    { id: 'po_7', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '深夜袭警', description: '盘查车辆时，对方突然掏出匕首。', options: [{ label: '制服 (Health>25)', requires: s => s.attributes.health > 25, effect: () => ({ exp: 50, stamina: -30, message: '空手夺白刃，帅炸。' }) }, { label: '呼叫支援', effect: () => ({ stamina: -10, message: '安全第一，人跑了。' }) }] },
    { id: 'po_8', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '看监控', description: '为了找个小偷，看了100个小时监控视频。', options: [{ label: '火眼金睛 (Tech>20)', requires: s => s.attributes.tech > 20, effect: () => ({ stamina: -40, attributes: { tech: 2 }, message: '锁定了嫌疑人！' }) }, { label: '看到眼瞎', effect: () => ({ stamina: -50, sanity: -10, addBuff: BUFFS.INSOMNIA(4), message: '头晕眼花，毫无收获。' }) }] },
    { id: 'po_9', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.BOSS_OFFICE, industry: IndustryType.POLICE, title: '立功评选', description: '年底评选个人二等功。', options: [{ label: '运气不错 (Luck>15)', requires: s => s.attributes.luck > 15, effect: () => ({ salary: 200, money: 5000, message: '评上了！奖金真香。' }) }, { label: '陪跑', effect: () => ({ sanity: -40, message: '名额被那个关系户占了。' }) }] },
    { id: 'po_10', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '师父的嘱托', description: '老张都要退休了，还在教你写卷宗。', options: [{ label: '虚心学习', effect: () => ({ attributes: { tech: 5, eq: 5 }, message: '受益匪浅。' }) }, { label: '嫌啰嗦', effect: () => ({ sanity: -5, message: '左耳进右耳出。' }) }] },
    // New Events
    { id: 'po_11', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '深夜森林搜救', description: '几个驴友不听劝，被困在了深山老林里。', options: [{ label: '成功救回 (Health>30)', requires: s => s.attributes.health > 30, effect: () => ({ exp: 60, stamina: -50, message: '背着人走了十公里山路，腿都断了。' }) }, { label: '负责联络', effect: () => ({ exp: 10, message: '你在山脚下负责指挥联络。' }) }] },
    { id: 'po_12', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '家属无理取闹', description: '家属在所里大吵大闹，说警察打人。', options: [{ label: '耐心化解 (EQ>22)', requires: s => s.attributes.eq > 22, effect: () => ({ sanity: 30, exp: 20, message: '你用耐心和证据说服了家属，化解了舆情。' }) }, { label: '依法严办', effect: () => ({ sanity: -20, risk: 10, message: '虽然合规，但被投诉态度生硬。' }) }] },
    { id: 'po_13', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '发现战友违规行为', description: '你偶然发现同事在办案时违规操作。', options: [{ label: '向上举报', effect: () => ({ level: 1, sanity: -40, message: '你维护了正义，但失去了朋友。' }) }, { label: '替他隐瞒', effect: () => ({ relationships: { colleague: 30 }, risk: 30, message: '讲义气，但背上了雷。' }) }] },
    { id: 'po_14', category: EventCategory.CHOICE, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '被选入专案组卧底', description: '这是个极度危险但立大功的机会。', options: [{ label: '完美伪装 (EQ>28)', requires: s => s.attributes.eq > 28, effect: () => ({ level: 2, money: 10000, message: '任务圆满成功，荣立一等功，连升两级！' }) }, { label: '拒绝参加', effect: () => ({ message: '平平淡淡才是真。' }) }] },
    { id: 'po_15', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.HOME, industry: IndustryType.POLICE, title: '压力太大导致失眠', description: '闭上眼就是案发现场的画面。', options: [{ label: '看医生', effect: () => ({ money: -1000, sanity: 40, message: '心理疏导很有用。' }) }, { label: '强撑', effect: () => ({ maxStamina: -10, sanity: -20, message: '身体机能开始下降。' }) }] },
    { id: 'po_16', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '救助路边临产孕妇', description: '巡逻时遇到孕妇临盆，救护车来不及了。', options: [{ label: '成功接生 (Tech>15)', requires: s => s.attributes.tech > 15, effect: () => ({ sanity: 50, attributes: { luck: 20 }, message: '母子平安，你成了全城的英雄。' }) }, { label: '呼救等待', effect: () => ({ sanity: 10, message: '帮忙疏导交通，尽力了。' }) }] },
    { id: 'po_17', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '连续参加反诈宣传', description: '进社区发传单，讲得口干舌燥。', options: [{ label: '苦口婆心', effect: () => ({ exp: 30, sanity: -10, message: '大爷大妈终于下载了反诈APP。' }) }, { label: '敷衍了事', effect: () => ({ message: '发完传单就走了。' }) }] },
    { id: 'po_18', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '出警摔坏了手机', description: '抓捕过程中手机飞出去摔碎了。', options: [{ label: '自费修理', effect: () => ({ money: -3000, message: '心疼，半个月工资没了。' }) }, { label: '申请报销', effect: () => ({ sanity: -10, message: '流程走了半年还在审批中。' }) }] },
    { id: 'po_19', category: EventCategory.FATE, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.POLICE, title: '获得全市大比武冠军', description: '你的体能和射击成绩震惊了全系统。', options: [{ label: '职业巅峰 (Health>35)', requires: s => s.attributes.health > 35, effect: () => ({ level: 1, exp: 100, message: '实至名归，提拔重用。' }) }, { label: '止步复赛', effect: () => ({ exp: 20, message: '强中自有强中手。' }) }] },
    { id: 'po_20', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.HOME, industry: IndustryType.POLICE, title: '深夜突发警讯(小周)', description: '刚睡下，紧急集合哨响了。', options: [{ label: '立即归队', effect: () => ({ stamina: -30, level: 1, message: '关键时刻冲得上，领导看在眼里。' }) }, { label: '没听见', effect: () => ({ level: -1, attributes: { luck: -5 }, message: '严重违纪，背了处分。' }) }] },
];

const DESIGN_EVENTS: GameEvent[] = [
    { id: 'd_1', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.DESIGN, title: '五彩斑斓的黑', description: '甲方爸爸提出离谱需求：要大气，要接地气，要五彩斑斓的黑。', options: [{ label: '专业忽悠 (EQ>25)', requires: s => s.attributes.eq > 25, effect: () => ({ money: 2000, sanity: 10, message: '你用专业术语把甲方绕晕了，定稿。' }) }, { label: '改50遍', effect: () => ({ stamina: -50, sanity: -40, message: '改到最后用了第一版。' }) }] },
    { id: 'd_2', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN, title: '软件崩溃', description: 'PS未响应，而你没保存。', options: [{ label: '自动备份 (Luck>18)', requires: s => s.attributes.luck > 18, effect: () => ({ sanity: 10, message: '天无绝人之路，有自动备份！' }) }, { label: '重画', effect: () => ({ stamina: -60, sanity: -50, message: '一边哭一边画。' }) }] },
    { id: 'd_3', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN, title: '遭遇抄袭', description: '你的方案被竞争对手原封不动抄袭了。', options: [{ label: '起诉', effect: () => ({ money: -2000, exp: 50, message: '赢了官司，但耗尽精力。' }) }, { label: '认栽改稿', effect: () => ({ stamina: -30, sanity: -30, message: '这种事太常见了。' }) }] },
    { id: 'd_4', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.HOME, industry: IndustryType.DESIGN, title: '深夜催图', description: '凌晨2点，AE夺命连环Call。', options: [{ label: '装睡', effect: () => ({ stamina: 20, sanity: 5, risk: 10, message: '假装没听见。' }) }, { label: '起来改', effect: () => ({ money: 500, stamina: -30, message: '卑微乙方的日常。' }) }] },
    { id: 'd_5', category: EventCategory.FATE, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.DESIGN, title: '行业大奖', description: '你的作品入围了年度设计金奖。', options: [{ label: '斩获金奖 (Tech>30)', requires: s => s.attributes.tech > 30, effect: () => ({ level: 2, money: 10000, addBuff: BUFFS.BOSS_FAVOR(8), message: '身价暴涨！' }) }, { label: '未入围', effect: () => ({ sanity: -10, message: '陪跑了。' }) }] },
    { id: 'd_6', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN, title: '拖欠尾款', description: '项目做完了，甲方失联了。', options: [{ label: '要债 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ money: 5000, message: '堵在甲方公司门口，终于要回来了。' }) }, { label: '当买教训', effect: () => ({ money: -5000, sanity: -20, message: '血汗钱没了。' }) }] },
    { id: 'd_7', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.DESIGN, title: '审美冲突', description: '你的设计太超前，被老板喷得一无是处。', options: [{ label: '坚持自我', effect: () => ({ attributes: { luck: 10 }, sanity: -20, addBuff: BUFFS.INSPIRED(4), message: '虽然被骂，但你觉得你是对的。' }) }, { label: '迎合大众', effect: () => ({ money: 2000, attributes: { luck: -5 }, message: '土是土了点，但能赚钱。' }) }] },
    { id: 'd_8', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.HOSPITAL, industry: IndustryType.DESIGN, title: '颈椎病', description: '长期低头画图，脖子动不了了。', options: [{ label: '游泳恢复 (Health>20)', requires: s => s.attributes.health > 20, effect: () => ({ maxStamina: 5, money: -1000, message: '办了张健身卡。' }) }, { label: '忍痛', effect: () => ({ maxStamina: -10, addBuff: BUFFS.BACK_PAIN(8), message: '贴个膏药继续干。' }) }] },
    { id: 'd_9', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.HOME, industry: IndustryType.DESIGN, title: '私活', description: '朋友介绍了个私活，钱多事少。', options: [{ label: '接单 (Tech>20)', requires: s => s.attributes.tech > 20, effect: () => ({ money: 3000, stamina: -30, message: '赚外快真香。' }) }, { label: '拒绝', effect: () => ({ stamina: 10, message: '想多活几年。' }) }] },
    { id: 'd_10', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN, title: '公司倒闭', description: '老板跑路了，资产清算。', options: [{ label: '搬设备抵债', effect: () => ({ money: 1000, message: '抢了个数位板回家。' }) }, { label: '颗粒无收', effect: () => ({ sanity: -50, message: '两个月工资没了。' }) }] },
    // New Events
    { id: 'd_11', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN, title: '未授权字体被起诉', description: '你用了一款“免费”字体，结果收到了律师函。', options: [{ label: '私下了结 (Luck>20)', requires: s => s.attributes.luck > 20, effect: () => ({ money: -1000, message: '对方只要了一点赔偿金，算你运气好。' }) }, { label: '赔偿巨款', effect: () => ({ money: -10000, level: -1, message: '公司赔了一大笔钱，你被降级。' }) }] },
    { id: 'd_12', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN, title: '电脑显卡烧毁', description: '渲染图跑了一半，机箱冒烟了。', options: [{ label: '买高端显卡', effect: () => ({ money: -8000, attributes: { tech: 5 }, message: '生产力工具升级，效率提升。' }) }, { label: '买二手', effect: () => ({ money: -1000, risk: 10, message: '凑合用吧，随时可能再坏。' }) }] },
    { id: 'd_13', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.DESIGN, title: 'Logo 放大 10 倍要求', description: '甲方指着屏幕说：我要logo大，还要留白。', options: [{ label: '说服对方 (EQ>25)', requires: s => s.attributes.eq > 25, effect: () => ({ sanity: 20, message: '你用专业美学理论教育了甲方。' }) }, { label: '照做', effect: () => ({ exp: -50, sanity: -30, message: '作品集里又多了一张垃圾。' }) }] },
    { id: 'd_14', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN, title: '参加设计周展览', description: '行业年度盛会，大咖云集。', options: [{ label: '投递作品', effect: () => ({ exp: 50, attributes: { luck: 10 }, message: '虽然没获奖，但露了脸。' }) }, { label: '看展学习', effect: () => ({ stamina: -20, attributes: { tech: 5 }, message: '开阔了眼界。' }) }] },
    { id: 'd_15', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN, title: '咖啡洒在键盘上', description: '手一抖，一杯冰美式倒在了机械键盘上。', options: [{ label: '趁机换新', effect: () => ({ money: -1500, message: '换了个更好的键盘，打字更有劲了。' }) }, { label: '擦干继续用', effect: () => ({ sanity: -20, message: '按键变得黏糊糊的，极其难受。' }) }] },
    { id: 'd_16', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.HOME, industry: IndustryType.DESIGN, title: '接到公益设计项目', description: '为流浪动物机构设计海报，没有钱。', options: [{ label: '认真做', effect: () => ({ level: 1, exp: 60, attributes: { luck: 20 }, message: '作品刷爆朋友圈，赢得了口碑。' }) }, { label: '随便应付', effect: () => ({ exp: 10, message: '完成了任务，无事发生。' }) }] },
    { id: 'd_17', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.HOME, industry: IndustryType.DESIGN, title: '深夜灵感爆发', description: '凌晨三点，突然想到了绝妙的创意。', options: [{ label: '画出神作 (Tech>28)', requires: s => s.attributes.tech > 28, effect: () => ({ money: 5000, stamina: -40, message: '这可能是你职业生涯的最佳作品。' }) }, { label: '睡着了', effect: () => ({ message: '梦里什么都有，醒来一场空。' }) }] },
    { id: 'd_18', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN, title: '甲方破产尾款难收', description: '项目做完了，甲方公司倒闭了。', options: [{ label: '法律起诉', effect: () => ({ sanity: -30, money: -1000, message: '官司赢了，但钱不知道什么时候能拿到。' }) }, { label: '自认倒霉', effect: () => ({ money: -5000, message: '白干了三个月。' }) }] },
    { id: 'd_19', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN, title: '同事说你审美土', description: '隔壁组的设计师嘲笑你的配色像番茄炒蛋。', options: [{ label: '犀利反击 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ sanity: 20, message: '你嘲笑他的设计像性冷淡，完胜。' }) }, { label: '回家偷摸哭', effect: () => ({ sanity: -40, message: '自信心受挫。' }) }] },
    { id: 'd_20', category: EventCategory.FATE, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.DESIGN, title: '作品被知名博主转发', description: '你的设计被百万粉大V转发点赞。', options: [{ label: '意外走红 (Luck>25)', requires: s => s.attributes.luck > 25, effect: () => ({ money: 8000, level: 1, message: '私单接到手软！' }) }, { label: '没带水印', effect: () => ({ sanity: -10, message: '火了图，没火人，亏大了。' }) }] },
];

// Combine all into a retrieval function
export const getEventsForIndustry = (industry: IndustryType): GameEvent[] => {
    let specific: GameEvent[] = [];
    switch(industry) {
        case IndustryType.INTERNET: specific = INTERNET_EVENTS; break;
        case IndustryType.REAL_ESTATE: specific = REAL_ESTATE_EVENTS; break;
        case IndustryType.POLICE: specific = POLICE_EVENTS; break;
        case IndustryType.PHARMA: specific = PHARMA_EVENTS; break;
        case IndustryType.DESIGN: specific = DESIGN_EVENTS; break;
    }

    // Generic Templates Reskinned (The Routine filler - 10 templates x 5 industries = 50 variations)
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
            id: 'routine_check', category: EventCategory.ROUTINE, location: Location.BOSS_OFFICE, industry: industry, rarity: EventRarity.COMMON,
            title: `${txt.progress}汇报`, description: `老板要看最新的${txt.progress}。`,
            options: [
                { label: '精心准备 (EQ>10)', requires: s=>s.attributes.eq>10, effect: () => ({ relationships: { boss: 5 }, message: '汇报很成功。' }) },
                { label: '糊弄', effect: () => ({ risk: 5, message: '老板皱了皱眉。' }) }
            ]
        },
        {
            id: 'routine_teambuild', category: EventCategory.ROUTINE, location: Location.MEETING_ROOM, industry: industry, rarity: EventRarity.COMMON,
            title: '团建聚餐', description: '部门组织聚餐，必须参加。',
            options: [
                { label: '积极社交', effect: () => ({ money: -200, relationships: { colleague: 10 }, message: '拉近了关系。' }) },
                { label: '角落玩手机', effect: () => ({ sanity: 5, message: '社恐的胜利。' }) }
            ]
        },
        {
            id: 'routine_training', category: EventCategory.ROUTINE, location: Location.MEETING_ROOM, industry: industry, rarity: EventRarity.COMMON,
            title: '业务培训', description: '强制参加的业务技能培训。',
            options: [
                { label: '认真听讲', effect: () => ({ exp: 20, stamina: -10, message: '学到了一些皮毛。' }) },
                { label: '补觉', effect: () => ({ stamina: 10, risk: 2, message: '睡得很香。' }) }
            ]
        },
        {
            id: 'routine_gossip', category: EventCategory.NPC_INTERACTION, location: Location.WORKSTATION, industry: industry, rarity: EventRarity.COMMON,
            title: '茶水间八卦', description: `听说隔壁部门老大要被${txt.fired}了。`,
            options: [
                { label: '打听细节', effect: () => ({ relationships: { colleague: 5 }, risk: 2, message: '吃瓜群众。' }) },
                { label: '不信谣', effect: () => ({ message: '专心工作。' }) }
            ]
        },
         {
            id: 'routine_bonus_delay', category: EventCategory.CRISIS, location: Location.WORKSTATION, industry: industry, rarity: EventRarity.COMMON,
            title: `${txt.bonus}延期`, description: `财务通知，本季度的${txt.bonus}要延后发放。`,
            options: [
                { label: '抱怨', effect: () => ({ sanity: -10, message: '士气低落。' }) },
                { label: '忍耐', effect: () => ({ message: '习惯了。' }) }
            ]
        },
        {
            id: 'routine_newbie', category: EventCategory.ROUTINE, location: Location.WORKSTATION, industry: industry, rarity: EventRarity.COMMON,
            title: '带新人', description: '分配给你一个实习生，啥也不会。',
            options: [
                { label: '手把手教 (Tech>15)', requires: s=>s.attributes.tech>15, effect: () => ({ stamina: -20, relationships: { colleague: 10 }, message: '收了个徒弟。' }) },
                { label: '放养', effect: () => ({ risk: 5, message: '新人闯祸了，你还得背锅。' }) }
            ]
        },
         {
            id: 'routine_system_update', category: EventCategory.ROUTINE, location: Location.WORKSTATION, industry: industry, rarity: EventRarity.COMMON,
            title: '系统更新', description: '办公系统升级，不仅难用还总崩溃。',
            options: [
                { label: '吐槽', effect: () => ({ sanity: 5, message: '骂完心里舒服多了。' }) },
                { label: '适应', effect: () => ({ exp: 5, message: '被迫适应。' }) }
            ]
        },
         {
            id: 'routine_health_check', category: EventCategory.FATE, location: Location.HOSPITAL, industry: industry, rarity: EventRarity.COMMON,
            title: '年度体检', description: '又到了一年一度看体检报告的时候。',
            options: [
                { label: '查看', effect: () => ({ sanity: -10, message: '结节、增生、脂肪肝...看不下去了。' }) }
            ]
        },
        {
            id: 'routine_rain', category: EventCategory.ROUTINE, location: Location.HOME, industry: industry, rarity: EventRarity.COMMON,
            title: '暴雨通勤', description: '暴雨导致交通瘫痪，迟到就在眼前。',
            options: [
                { label: '打车', effect: () => ({ money: -100, sanity: 5, message: '花钱保全勤。' }) },
                { label: '挤地铁', effect: () => ({ stamina: -20, sanity: -10, message: '浑身湿透，狼狈不堪。' }) }
            ]
        }
    ];

    return [...specific, ...routineEvents];
};

export const BLANK_STATS: GameStats = {
  stamina: 100,
  maxStamina: 100,
  sanity: 100,
  maxSanity: 100,
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
  industry: IndustryType.INTERNET, 
  attributes: { grind: 1, eq: 1, tech: 1, health: 1, luck: 1 },
  titles: [],
  relationships: { boss: 30, colleague: 30, hr: 30 },
  activeBuffs: [], // New
  techEventCount: 0,
  overtimeHours: 0,
  isSmallWeek: false,
  reviveUsed: false,
  legacyPointsUsed: 0
};

export const TITLES: TitleConfig[] = [
    { id: 't_god', name: '行业大牛', condition: (s) => s.attributes.tech >= 20, description: '技术属性突破20', buff: '所有技术类事件体力消耗减半' },
    { id: 't_social', name: '交际花', condition: (s) => s.attributes.eq >= 20, description: '情商属性突破20', buff: '甩锅成功率100%' },
    { id: 't_tank', name: '铁人', condition: (s) => s.attributes.grind >= 20, description: '耐艹属性突破20', buff: '免疫心智崩溃导致的强制消费' },
    { id: 't_koi', name: '锦鲤', condition: (s) => s.attributes.luck >= 20, description: '灵气属性突破20', buff: '奇遇事件触发概率翻倍' },
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'coffee',
    name: '咖啡/红牛',
    description: '续命水。体力+10',
    price: 30,
    effect: (s) => ({ stamina: Math.min(s.maxStamina, s.stamina + 10) }),
    icon: Coffee
  },
  {
    id: 'game',
    name: '3A大作',
    description: '逃避可耻但有用。心智+20',
    price: 398,
    effect: (s) => ({ sanity: Math.min(s.maxSanity, s.sanity + 20) }),
    icon: Gamepad2
  },
  {
    id: 'course',
    name: '行业课程',
    description: '充电。经验+50',
    price: 500,
    effect: (s) => ({ exp: s.exp + 50 }),
    icon: BookOpen
  },
  {
    id: 'supplements',
    name: '保健品',
    description: '智商税？体质+1',
    price: 800,
    effect: (s) => ({ attributes: { ...s.attributes, health: s.attributes.health + 1 } }),
    icon: Pill
  },
  {
    id: 'headphones',
    name: '降噪耳机',
    description: '物理结界。耐艹+1',
    price: 2500,
    effect: (s) => ({ attributes: { ...s.attributes, grind: s.attributes.grind + 1 } }),
    icon: Headphones
  }
];