/**
 * P1 事件池扩充 — 120+ 事件（每行业 ≥ 20 个）
 *
 * 涵盖 6 大行业：互联网、地产、医药、警务、设计、地铁
 *
 * 结构约定：
 *   - 每个事件为 GameEvent 对象，可直接被 EventCard 消费
 *   - 选项使用 `effect: (stats) => OptionEffect` 闭包
 *   - 引用 ../constants 中的 BUFFS 工厂
 *   - ID 前缀：i_=internet, r_=realestate, p_=pharma, po_=police, d_=design, m_=metro
 *
 * 事件模板：
 *   文末提供参数化模板（EventTemplate），可通过填充行业名/公司名/NPC 名批量生成
 */

import {
  GameEvent, GameStats, Location, EventCategory, EventRarity, IndustryType,
} from '../types';
import { BUFFS } from '../constants';

// ══════════════════════════════════════════════════════════════
// 互联网大厂 扩充事件 (新增 12 个，合并后 ≥ 22)
// ══════════════════════════════════════════════════════════════

export const INTERNET_EVENTS_EXPANDED: GameEvent[] = [
  {
    id: 'i_11', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.INTERNET,
    title: '黑客马拉松',
    description: '公司举办 48 小时黑客马拉松，奖品是赴硅谷参观。全组熬夜比创意。',
    options: [
      { label: '组队参赛 (Tech>25)', requires: s => s.attributes.tech > 25, effect: () => ({ exp: 80, sanity: -20, addBuff: BUFFS.INSPIRED(4), message: '你的项目拿了全场最佳！' }) },
      { label: '后勤支援', effect: () => ({ relationships: { colleague: 10 }, exp: 20, message: '负责点外卖和买红牛，队友们很感激你。' }) },
      { label: '摸鱼睡觉', effect: () => ({ stamina: 20, sanity: 5, message: '大家熬夜的时候你在补觉。' }) },
    ],
  },
  {
    id: 'i_12', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET,
    title: '开源贡献争议',
    description: '你在 GitHub 上提交的 PR 引发社区激烈讨论，有人质疑方案不兼容。',
    options: [
      { label: '耐心沟通 (EQ>18)', requires: s => s.attributes.eq > 18, effect: () => ({ exp: 40, attributes: { tech: 1 }, message: '你的专业回应赢得了社区尊重。' }) },
      { label: '愤怒回怼', effect: () => ({ sanity: -15, risk: 10, message: '网络骂战升级，同事劝你算了。' }) },
    ],
  },
  {
    id: 'i_13', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET,
    title: '带新人',
    description: 'HR 安排了一个应届实习生给你带教。TA 充满热情但完全不懂 Git。',
    options: [
      { label: '耐心指导 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ exp: 30, relationships: { colleague: 15, hr: 10 }, message: '新人进步飞快，你成了组里的好师傅。' }) },
      { label: '甩文档', effect: () => ({ sanity: 5, exp: 5, message: '"先把 wiki 看完再说。"' }) },
    ],
  },
  {
    id: 'i_14', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.INTERNET,
    title: '产品总监突然离职',
    description: '产品总监留下一句"世界很大我想去看看"就消失了。所有需求瞬间没了 Owner。',
    options: [
      { label: '主动补位 (Grind>20)', requires: s => s.attributes.grind > 20, effect: () => ({ exp: 60, addBuff: BUFFS.BOSS_FAVOR(4), message: '你临危受命主导了关键需求，老板记住了你。' }) },
      { label: '静观其变', effect: () => ({ sanity: -10, message: '混乱持续了两周才稳定。' }) },
    ],
  },
  {
    id: 'i_15', category: EventCategory.FATE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET,
    title: '空调坏了',
    description: '盛夏 38℃，写字楼的中央空调罢工了。办公室变成了蒸笼。',
    options: [
      { label: '远程办公', effect: () => ({ stamina: 10, sanity: 20, risk: 5, message: '回家吹着空调写代码，效率翻倍。' }) },
      { label: '硬扛', effect: () => ({ stamina: -20, sanity: -15, message: '汗流浃背地撑了一天。' }) },
    ],
  },
  {
    id: 'i_16', category: EventCategory.CHOICE, rarity: EventRarity.EPIC, location: Location.BOSS_OFFICE, industry: IndustryType.INTERNET,
    title: '晋升答辩',
    description: '一年一度的晋升窗口开启。你需要做 30 分钟的 PPT 答辩。',
    options: [
      { label: '精心准备 (Tech>30)', requires: s => s.attributes.tech > 30, effect: () => ({ level: 1, salary: 1000, message: '你用数据说服了评委，成功晋升！' }) },
      { label: '佛系参与', effect: () => ({ sanity: -5, message: '没有准备，自然没有结果。' }) },
    ],
  },
  {
    id: 'i_17', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.HOME, industry: IndustryType.INTERNET,
    title: 'AI 替代恐慌',
    description: '公司内部发了一封全员邮件："AI 辅助编程工具将全面推广，预计提升效率 40%。"',
    options: [
      { label: '学习 AI 工具 (Tech>28)', requires: s => s.attributes.tech > 28, effect: () => ({ attributes: { tech: 3 }, exp: 30, message: '你成为首批掌握新工具的人，反而更吃香了。' }) },
      { label: '坐立不安', effect: () => ({ sanity: -30, addBuff: BUFFS.DEPRESSED(4), message: '"完了，我要被 AI 取代了。"' }) },
    ],
  },
  {
    id: 'i_18', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET,
    title: '技术债爆发',
    description: '三年前写的烂代码终于在生产环境炸了。所有人看着日志，不知道从何修起。',
    options: [
      { label: '定位修复 (Tech>32)', requires: s => s.attributes.tech > 32, effect: () => ({ exp: 50, stamina: -30, message: '你凭借对屎山的深刻理解，在半小时内定位了根因。' }) },
      { label: '甩锅运维', effect: () => ({ risk: 15, relationships: { boss: -10 }, message: '"这肯定是环境问题。"' }) },
    ],
  },
  {
    id: 'i_19', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.INTERNET,
    title: '大老板突击巡查',
    description: 'CXO 突然来到工位区，说要"扁平化巡检"。所有人紧张得不敢说话。',
    options: [
      { label: '主动展示成果 (EQ>22)', requires: s => s.attributes.eq > 22, effect: () => ({ addBuff: BUFFS.BOSS_FAVOR(6), money: 1000, message: '你流利的汇报让 CXO 频频点头。' }) },
      { label: '假装调试', effect: () => ({ sanity: -10, message: '你盯着一个完全不相关的 Bug 报告装忙。' }) },
    ],
  },
  {
    id: 'i_20', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.HOME, industry: IndustryType.INTERNET,
    title: '远程办公陷阱',
    description: '公司宣布永久远程办公，但要求安装监控软件追踪屏幕活动。',
    options: [
      { label: '接受监控', effect: () => ({ sanity: -15, stamina: 10, message: '开着监控写代码，总觉得背后有人盯着。' }) },
      { label: '拒绝并回办公室', effect: () => ({ stamina: -10, money: -500, message: '每天通勤 2 小时，但保有隐私。' }) },
    ],
  },
  {
    id: 'i_21', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.INTERNET,
    title: '跨部门踢皮球',
    description: '一个线上 Bug 涉及前端、后端、数据三个团队，大家开始互相推诿。',
    options: [
      { label: '牵头解决 (Grind>18)', requires: s => s.attributes.grind > 18, effect: () => ({ exp: 40, stamina: -15, relationships: { boss: 15 }, message: '你主动拉会协同排查，第二天就修复了。' }) },
      { label: '加入推诿', effect: () => ({ sanity: 5, risk: 3, message: '"不是我们组的问题。"' }) },
    ],
  },
  {
    id: 'i_22', category: EventCategory.FATE, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.INTERNET,
    title: '部门重组',
    description: '公司突然宣布组织架构大调整，你的部门被并入一个新业务线。',
    options: [
      { label: '拥抱变化', effect: () => ({ attributes: { eq: 5, grind: 3 }, message: '你迅速适应了新环境，还当了小组长。' }) },
      { label: '消极抵抗', effect: () => ({ sanity: -20, risk: 25, message: '你的不满被 HR 记录在案。' }) },
      { label: '借机跳槽 (Luck>20)', requires: s => s.attributes.luck > 20, effect: () => ({ money: 5000, salary: 2000, message: '你趁乱投了简历，拿到了更好的 Offer。' }) },
    ],
  },
  {
    id: 'i_23', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.INTERNET,
    title: '代码审查噩梦',
    description: '一个 MR 已经被 review 了 12 轮，每次都有新的 comment。',
    options: [
      { label: '耐心修改 (Grind>22)', requires: s => s.attributes.grind > 22, effect: () => ({ exp: 20, stamina: -10, message: '你强忍怒火改完了第 13 版。' }) },
      { label: '直接合并', effect: () => ({ risk: 20, message: 'Code freeze 之前强行合入，被举报了。' }) },
    ],
  },
  {
    id: 'i_24', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.RARE, location: Location.BOSS_OFFICE, industry: IndustryType.INTERNET,
    title: '压力面试',
    description: '架构师老张突然找你谈话："如果要裁掉组里一个人，你会选谁？"',
    options: [
      { label: '巧妙避开 (EQ>25)', requires: s => s.attributes.eq > 25, effect: () => ({ relationships: { boss: 10 }, message: '"每个人都有不可替代的地方。"老张点了点头。' }) },
      { label: '指向同事', effect: () => ({ relationships: { colleague: -25, boss: -5 }, risk: 10, message: '你说出了名字，但从那以后同事看你的眼神变了。' }) },
    ],
  },
  {
    id: 'i_25', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.INTERNET,
    title: '基础设施迁移',
    description: '自建机房要迁移到公有云，所有服务需要重新部署。时间窗口只有 4 小时。',
    options: [
      { label: '精细化操作 (Tech>35)', requires: s => s.attributes.tech > 35, effect: () => ({ exp: 80, addBuff: BUFFS.BOSS_FAVOR(4), message: '你在 3 小时内完成了全部迁移，零故障！' }) },
      { label: '熬夜盯着', effect: () => ({ stamina: -25, exp: 20, message: '靠着咖啡撑到了天亮。' }) },
    ],
  },
  {
    id: 'i_26', category: EventCategory.FATE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.INTERNET,
    title: '全员大会',
    description: 'CEO 在全员大会上宣布："我们明年上市。"台下有人欢呼，有人冷笑。',
    options: [
      { label: '查阅期权文件', effect: () => ({ attributes: { luck: 5 }, message: '你的期权行权价还行，有得赚。' }) },
      { label: '无动于衷', effect: () => ({ sanity: -5, message: '"上次也是这么说的。"' }) },
    ],
  },
  {
    id: 'i_27', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.INTERNET,
    title: '技术债偿还',
    description: 'PM 终于同意给一个迭代做技术优化。但有很多选择：重构哪个模块？',
    options: [
      { label: '核心链路 (Tech>30)', requires: s => s.attributes.tech > 30, effect: () => ({ exp: 50, attributes: { tech: 2 }, money: 1000, message: '性能提升了 3 倍，团队掌声不断。' }) },
      { label: '随便修修', effect: () => ({ exp: 10, message: '只改了表面问题。' }) },
    ],
  },
  {
    id: 'i_28', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.INTERNET,
    title: '会议地狱',
    description: '从早上 9 点到晚上 7 点，你的日历被各种会议占满。连写代码的时间都没有。',
    options: [
      { label: '推掉会议 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ stamina: 20, exp: 15, message: '你巧妙地拒绝了无效会议，保住了生产力。' }) },
      { label: '边开会边写码', effect: () => ({ stamina: -15, sanity: -10, message: '你在会上心不在焉，两边都没做好。' }) },
    ],
  },
  {
    id: 'i_29', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.HOME, industry: IndustryType.INTERNET,
    title: '远程自由职业',
    description: '朋友拉你一起做一个海外远程项目，每月额外收入可观。',
    options: [
      { label: '接单 (Tech>28)', requires: s => s.attributes.tech > 28, effect: () => ({ money: 8000, stamina: -20, risk: 10, message: '你熬夜完成了项目，美元到账的那一刻真爽。' }) },
      { label: '专心主业', effect: () => ({ relationships: { boss: 5 }, message: '你选择了在一棵树上吊死。' }) },
    ],
  },
  {
    id: 'i_30', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.INTERNET,
    title: '安全漏洞',
    description: '安全团队发现了你的模块存在 SQL 注入漏洞，可能泄露用户数据。',
    options: [
      { label: '紧急修复 (Tech>30)', requires: s => s.attributes.tech > 30, effect: () => ({ exp: 60, risk: -30, message: '你在 2 小时内完成了漏洞修补。' }) },
      { label: '试图掩盖', effect: () => ({ risk: 70, message: '漏洞被外部白帽子发现并公开了。' }) },
    ],
  },
];

// ══════════════════════════════════════════════════════════════
// 地产巨头 扩充事件 (新增 19 个，合并后 ≥ 22)
// ══════════════════════════════════════════════════════════════

export const REAL_ESTATE_EVENTS_EXPANDED: GameEvent[] = [
  {
    id: 'r_4', category: EventCategory.CRISIS, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.REAL_ESTATE,
    title: '土拍大战',
    description: '年度重量级地块挂牌出让，王总点了你的名："这块地必须拿下。"',
    options: [
      { label: '精准预算 (Tech>20)', requires: s => s.attributes.tech > 20, effect: () => ({ money: 15000, exp: 60, addBuff: BUFFS.BOSS_FAVOR(6), message: '你精确计算了对手底线，以最合理价格拿地。' }) },
      { label: '盲目举牌', effect: () => ({ money: -5000, risk: 30, message: '溢价 80% 拿地，王总的脸色很难看。' }) },
    ],
  },
  {
    id: 'r_5', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE,
    title: '房贷政策突变',
    description: '新政出台，首付比例上调。之前交了定金的客户炸锅了。',
    options: [
      { label: '沟通安抚 (EQ>22)', requires: s => s.attributes.eq > 22, effect: () => ({ money: 2000, relationships: { colleague: 10 }, message: '你帮客户找到了新的贷款方案，稳住了局面。' }) },
      { label: '退定金了事', effect: () => ({ money: -3000, message: '退了十几单，奖金泡汤。' }) },
    ],
  },
  {
    id: 'r_6', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE,
    title: '精装变毛坯',
    description: '供应商在装修材料上以次充好，被业主验房时发现了。',
    options: [
      { label: '责令整改', effect: () => ({ money: -2000, relationships: { boss: 10 }, sanity: -10, message: '自掏腰包补了差价，保住了口碑。' }) },
      { label: '推给供应商', effect: () => ({ risk: 20, message: '供应商负责人连夜跑路了。' }) },
    ],
  },
  {
    id: 'r_7', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.REAL_ESTATE,
    title: '竞争对手挖角',
    description: '隔壁碧桂园的销售总亲自给你打电话，开出双倍底薪。',
    options: [
      { label: '谈条件留下 (EQ>25)', requires: s => s.attributes.eq > 25, effect: () => ({ salary: 1000, message: '你用竞争对手的 Offer 谈来了涨薪。' }) },
      { label: '果断跳槽', effect: () => ({ salary: 500, money: 2000, message: '新环境新气象，从头开始。' }) },
      { label: '直接拒绝', effect: () => ({ relationships: { boss: 20 }, message: '忠诚被标记在晋升档案里。' }) },
    ],
  },
  {
    id: 'r_8', category: EventCategory.FATE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE,
    title: '暴雨淹了售楼处',
    description: '台风过境，售楼处的沙盘被水泡了，宣传资料全毁。',
    options: [
      { label: '紧急抢险 (Grind>20)', requires: s => s.attributes.grind > 20, effect: () => ({ exp: 30, stamina: -30, relationships: { boss: 10 }, message: '你带头冲进水里抢救设备，赢得了同事的尊敬。' }) },
      { label: '发朋友圈', effect: () => ({ sanity: 5, message: '"今日售楼处：马尔代夫分店。"' }) },
    ],
  },
  {
    id: 'r_9', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.BOSS_OFFICE, industry: IndustryType.REAL_ESTATE,
    title: '价格战白热化',
    description: '周边三个楼盘同时降价，王总要求你也跟进。',
    options: [
      { label: '降本增效', effect: () => ({ money: 5000, sanity: -20, attributes: { luck: -5 }, message: '砍了营销预算，精装降标。卖得不错，但投诉变多了。' }) },
      { label: '坚持溢价 (EQ>28)', requires: s => s.attributes.eq > 28, effect: () => ({ money: 3000, message: '你用差异化策略维持了价格，吸引了一批高端客户。' }) },
    ],
  },
  {
    id: 'r_10', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.HOME, industry: IndustryType.REAL_ESTATE,
    title: '拆迁钉子户',
    description: '项目地块上有三户坚决不签协议，拿不到地就开不了工。',
    options: [
      { label: '耐心谈判 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ money: 3000, exp: 30, sanity: -15, message: '你花了整整一个星期，终于说服了最后一家签字。' }) },
      { label: '增加补偿', effect: () => ({ money: -5000, message: '钱能解决的问题都不是问题。' }) },
    ],
  },
  {
    id: 'r_11', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE,
    title: '工地安全事故',
    description: '塔吊钢丝绳突然断裂，一名工人坠楼重伤。',
    options: [
      { label: '立即组织救援 (Health>20)', requires: s => s.attributes.health > 20, effect: () => ({ sanity: -30, exp: 40, attributes: { luck: 5 }, message: '你第一时间赶到现场，组织送医并封锁消息，将影响降到最低。' }) },
      { label: '掩盖事故', effect: () => ({ risk: 60, money: -3000, message: '你用钱封住了家属的嘴，但良心受到了谴责。' }) },
    ],
  },
  {
    id: 'r_12', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.REAL_ESTATE,
    title: '开盘再开盘',
    description: '又是集中开盘日，售楼处门口排起了长队——其中一半是托。',
    options: [
      { label: '烘托气氛', effect: () => ({ money: 2000, stamina: -20, message: '你指挥托们在里面假意签约，制造热销假象。' }) },
      { label: '正常接待', effect: () => ({ money: 500, message: '成交量一般，但你问心无愧。' }) },
    ],
  },
  {
    id: 'r_13', category: EventCategory.CRISIS, rarity: EventRarity.EPIC, location: Location.BOSS_OFFICE, industry: IndustryType.REAL_ESTATE,
    title: '集团资金链断裂',
    description: '总部发来内部邮件：下一期债券可能无法兑付，全员暂停发薪。',
    options: [
      { label: '陪公司共渡难关', effect: () => ({ money: -10000, sanity: -40, attributes: { luck: 10 }, message: '你拿出积蓄给公司垫了一个月运营费，最终熬过了危机。' }) },
      { label: '立刻跑路', effect: () => ({ risk: -30, money: -500, message: '你连夜写了简历，猎头电话被打爆。' }) },
    ],
  },
  {
    id: 'r_14', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.REAL_ESTATE,
    title: 'VIP 客户看盘',
    description: '一个神秘客户开着库里南来了，看中了两栋别墅。',
    options: [
      { label: '一对一服务 (EQ>18)', requires: s => s.attributes.eq > 18, effect: () => ({ money: 8000, exp: 30, message: '你细致的服务打动了对方，一次性签了两套。' }) },
      { label: '让新人接待', effect: () => ({ relationships: { colleague: 10 }, message: '新人不小心说错了话，客户拂袖而去。' }) },
    ],
  },
  {
    id: 'r_15', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.HOME, industry: IndustryType.REAL_ESTATE,
    title: '深夜紧急看房',
    description: '凌晨 2 点，一个客户非要现在去看房，说是"吉时"。',
    options: [
      { label: '立即出发 (Grind>25)', requires: s => s.attributes.grind > 25, effect: () => ({ money: 5000, stamina: -25, message: '你深夜带看，对方当场下定。' }) },
      { label: '婉拒', effect: () => ({ sanity: 5, message: '睡个好觉比佣金重要。' }) },
    ],
  },
  {
    id: 'r_16', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.REAL_ESTATE,
    title: '客户要求折扣',
    description: '一个大客户表示如果打 8 折就签 5 套，否则去隔壁买。',
    options: [
      { label: '申请特批 (EQ>22)', requires: s => s.attributes.eq > 22, effect: () => ({ money: 10000, message: '你磨破了嘴皮子从总部拿到了特别折扣，5 套全签。' }) },
      { label: '坚持原价', effect: () => ({ money: 0, message: '客户果然去了隔壁。' }) },
    ],
  },
  {
    id: 'r_17', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE,
    title: '老销售抢单',
    description: '一个玩了十年地产的老油条把你跟踪三个月的客户抢了。',
    options: [
      { label: '向上申诉', effect: () => ({ relationships: { boss: 10 }, risk: 10, message: '老板主持了公道，单子还给你了。' }) },
      { label: '正面硬刚', effect: () => ({ sanity: -15, relationships: { colleague: -20 }, message: '你们在售楼处吵了起来，客户被吓跑了。' }) },
      { label: '吃哑巴亏', effect: () => ({ money: -1000, sanity: -20, message: '忍了，但下次绝对不会。' }) },
    ],
  },
  {
    id: 'r_18', category: EventCategory.CRISIS, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.REAL_ESTATE,
    title: '限购新政落地',
    description: '政府突然宣布限购加码，所有在谈的客户都犹豫了。',
    options: [
      { label: '政策解读 (EQ>30)', requires: s => s.attributes.eq > 30, effect: () => ({ money: 5000, attributes: { eq: 5 }, message: '你整理了详细的政策解读方案，反而成了客户的咨询专家。' }) },
      { label: '等待观望', effect: () => ({ money: -2000, message: '市场冰封了一个月。' }) },
    ],
  },
  {
    id: 'r_19', category: EventCategory.FATE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE,
    title: '交房大典',
    description: '你负责的楼栋终于要交房了，业主们欢天喜地。',
    options: [
      { label: '到场致辞', effect: () => ({ relationships: { colleague: 10, boss: 10 }, exp: 20, message: '你真诚的祝福让业主们自发鼓掌。' }) },
      { label: '让助理搞定', effect: () => ({ exp: 5, message: '你躲过了可能被追骂的环节。' }) },
    ],
  },
  {
    id: 'r_20', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE,
    title: '年终评优',
    description: '区域总经理要选一个优秀员工代表去集团年会。',
    options: [
      { label: '精心准备 (Grind>22)', requires: s => s.attributes.grind > 22, effect: () => ({ level: 1, money: 3000, addBuff: BUFFS.MOMENTUM(8), message: '你的年度总结PPT震惊全场，荣升区域之星。' }) },
      { label: '随意应付', effect: () => ({ message: '重在参与。' }) },
    ],
  },
  {
    id: 'r_21', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE,
    title: '交房延期',
    description: '由于材料供应问题，项目要延期 3 个月交付，准业主群已经炸了。',
    options: [
      { label: '主动通知', effect: () => ({ sanity: -10, attributes: { eq: 3 }, message: '你挨个打电话解释，虽然被骂了很多次，但挽回了信任。' }) },
      { label: '发公告了事', effect: () => ({ risk: 30, message: '无人情味的公告让事件升级成了社会新闻。' }) },
    ],
  },
  {
    id: 'r_22', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.REAL_ESTATE,
    title: '政府考察团',
    description: '市领导带队来项目实地考察，这是展示自己的绝佳机会。',
    options: [
      { label: '完美讲解 (EQ>30)', requires: s => s.attributes.eq > 30, effect: () => ({ level: 1, addBuff: BUFFS.BOSS_FAVOR(10), message: '你的专业讲解让副市长当场称赞。' }) },
      { label: '让王总回答', effect: () => ({ relationships: { boss: 5 }, message: '你没有出头，但也没有犯错。' }) },
    ],
  },
  {
    id: 'r_23', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.REAL_ESTATE,
    title: '样板间火灾',
    description: '楼盘样板间因电路短路起火，虽然没有人员伤亡，但媒体已经闻讯赶来。',
    options: [
      { label: '危机公关 (EQ>28)', requires: s => s.attributes.eq > 28, effect: () => ({ money: -1000, risk: -30, message: '你迅速组织了新闻发布会，态度诚恳，舆论反转。' }) },
      { label: '封锁消息', effect: () => ({ risk: 40, sanity: -15, message: '越是封锁，谣言越多。热搜挂了一整天。' }) },
    ],
  },
];

// ══════════════════════════════════════════════════════════════
// 生物医药 扩充事件 (新增 21 个，合并后 ≥ 22)
// ══════════════════════════════════════════════════════════════

export const PHARMA_EVENTS_EXPANDED: GameEvent[] = [
  {
    id: 'p_2', category: EventCategory.CRISIS, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.PHARMA,
    title: '伦理委员会审查',
    description: '伦理委员会对你的试验方案提出了 57 条修改意见。项目可能被暂停。',
    options: [
      { label: '逐条修改 (Tech>32)', requires: s => s.attributes.tech > 32, effect: () => ({ exp: 80, stamina: -30, attributes: { tech: 2 }, message: '你花了三周时间把所有问题改完，终于过审。' }) },
      { label: '敷衍了事', effect: () => ({ risk: 40, message: '你的方案被退回，项目延期。' }) },
    ],
  },
  {
    id: 'p_3', category: EventCategory.FATE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA,
    title: '实验室污染',
    description: '恒温箱发现霉菌，之前三周培养的细胞全部报废。',
    options: [
      { label: '重新培养 (Grind>18)', requires: s => s.attributes.grind > 18, effect: () => ({ stamina: -20, sanity: -15, exp: 15, message: '从头再来，你已经习惯了。' }) },
      { label: '申请外包', effect: () => ({ money: -3000, message: '花钱省时间。' }) },
    ],
  },
  {
    id: 'p_4', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA,
    title: '专利悬崖',
    description: '核心药物的专利即将到期，仿制药企已经摩拳擦掌。',
    options: [
      { label: '新适应症开发 (Tech>35)', requires: s => s.attributes.tech > 35, effect: () => ({ exp: 100, money: 5000, message: '你发现了老药的新用途，专利延期成功！' }) },
      { label: '降价竞争', effect: () => ({ money: -3000, sanity: -10, message: '利润被严重压缩。' }) },
    ],
  },
  {
    id: 'p_5', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA,
    title: '学术会议投稿',
    description: '年度国际医疗会议征稿，老板希望你投一篇 Oral 报告。',
    options: [
      { label: '精心准备 (Tech>30)', requires: s => s.attributes.tech > 30, effect: () => ({ exp: 50, attributes: { tech: 2 }, addBuff: BUFFS.INSPIRED(4), message: '你的摘要被选为 Highlight 报告！' }) },
      { label: '凑个 Poster', effect: () => ({ exp: 10, message: '至少没白去。' }) },
    ],
  },
  {
    id: 'p_6', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.PHARMA,
    title: 'FDA 飞行检查',
    description: 'FDA 突然宣布现场核查，全公司进入一级战备。',
    options: [
      { label: '全程陪同 (Tech>28)', requires: s => s.attributes.tech > 28, effect: () => ({ exp: 60, stamina: -20, addBuff: BUFFS.BOSS_FAVOR(4), message: '你的专业应对让 FDA 检查官无话可说。' }) },
      { label: '加班准备文件', effect: () => ({ stamina: -30, sanity: -15, message: '连夜补齐了所有缺失的签字。' }) },
    ],
  },
  {
    id: 'p_7', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA,
    title: '实习生搞砸了实验',
    description: '一个实习生把加样顺序搞反了，一个月的 ELISA 数据全部不可用。',
    options: [
      { label: '耐心复盘 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ relationships: { colleague: 10 }, exp: 10, message: '你带着实习生一步步复盘，TA 感激涕零。' }) },
      { label: '严厉批评', effect: () => ({ relationships: { colleague: -15 }, message: '实习生被说哭了，之后见了你就躲。' }) },
    ],
  },
  {
    id: 'p_8', category: EventCategory.FATE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA,
    title: '竞品先一步获批',
    description: '竞争对手的药物比你早拿到了 NMPA 批文，市场先机尽失。',
    options: [
      { label: '分析差异 (Tech>25)', requires: s => s.attributes.tech > 25, effect: () => ({ exp: 30, attributes: { tech: 2 }, message: '你找到了差异化竞争点，后发制人。' }) },
      { label: '自怨自艾', effect: () => ({ sanity: -20, message: '连续一周情绪低落。' }) },
    ],
  },
  {
    id: 'p_9', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA,
    title: '试剂断供',
    description: '关键进口试剂因国际物流问题断供，实验完全停摆。',
    options: [
      { label: '寻找替代 (Tech>28)', requires: s => s.attributes.tech > 28, effect: () => ({ attributes: { tech: 3 }, exp: 40, message: '你找到了国产试剂替代方案，实验重启成功。' }) },
      { label: '等待恢复', effect: () => ({ sanity: -10, money: -1000, message: '干坐了一个月。' }) },
    ],
  },
  {
    id: 'p_10', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA,
    title: 'Nature 投稿机会',
    description: '你的研究数据足够发一篇 Nature，但需要先搞定数据图表。',
    options: [
      { label: '全力以赴 (Grind>30)', requires: s => s.attributes.grind > 30, effect: () => ({ exp: 100, level: 1, addBuff: BUFFS.MOMENTUM(8), message: '论文被 Nature 接收，你在学术圈一夜成名。' }) },
      { label: '目标低点', effect: () => ({ exp: 20, message: '投了 Scientific Reports，也算 SCI。' }) },
    ],
  },
  {
    id: 'p_11', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA,
    title: '专家顾问来访',
    description: '行业泰斗王院士来实验室参观，这是建立人脉的良机。',
    options: [
      { label: '深度交流 (EQ>25)', requires: s => s.attributes.eq > 25, effect: () => ({ exp: 40, attributes: { eq: 3 }, addBuff: BUFFS.INSPIRED(4), message: '你和王院士聊了半小时，加了微信。' }) },
      { label: '默默旁听', effect: () => ({ exp: 10, message: '你只是远远地看着。' }) },
    ],
  },
  {
    id: 'p_12', category: EventCategory.CRISIS, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.PHARMA,
    title: 'III 期数据揭盲',
    description: '双盲试验揭盲的时刻到了。如果结果不显著，公司可能破产。',
    options: [
      { label: '镇定面对 (Tech>35)', requires: s => s.attributes.tech > 35, effect: () => ({ exp: 150, level: 1, addBuff: BUFFS.MOMENTUM(8), message: 'P < 0.001！全世界都在为你欢呼！' }) },
      { label: '祈祷', effect: () => ({ attributes: { luck: 10 }, message: '结果勉强达到阈值。' }) },
    ],
  },
  {
    id: 'p_13', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA,
    title: '动物实验伦理申请',
    description: '需要重新提交动物实验方案，伦理审批繁琐而漫长。',
    options: [
      { label: '认真撰写', effect: () => ({ stamina: -10, exp: 15, message: '你写的方案一次过审。' }) },
      { label: '抄模板', effect: () => ({ risk: 15, message: '被伦理委员会打回来重写。' }) },
    ],
  },
  {
    id: 'p_14', category: EventCategory.FATE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA,
    title: '冷库断电',
    description: '半夜 3 点，低温冰箱报警器响起——储存的药品样本面临危险。',
    options: [
      { label: '深夜赶到 (Grind>25)', requires: s => s.attributes.grind > 25, effect: () => ({ exp: 30, stamina: -20, message: '你深夜赶到实验室转移样本，避免了灾难。' }) },
      { label: '远程指导', effect: () => ({ risk: 25, message: '低温药品融化了三分之一。' }) },
    ],
  },
  {
    id: 'p_15', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA,
    title: '融资路演',
    description: 'CEO 要去见投资人，临时让你准备临床数据的 PPT。',
    options: [
      { label: '完美呈现 (EQ>28)', requires: s => s.attributes.eq > 28, effect: () => ({ level: 1, exp: 60, message: '你的 PPT 帮助公司融到了 B 轮。' }) },
      { label: '凑合应付', effect: () => ({ risk: 10, message: '投资人问的问题你答不上来。' }) },
    ],
  },
  {
    id: 'p_16', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA,
    title: '举报信',
    description: '你发现同事篡改了一个临床数据。合规部门还不知道。',
    options: [
      { label: '匿名举报', effect: () => ({ sanity: -10, attributes: { eq: 3 }, message: '你做了对的事情，虽然被排挤了一段时间。' }) },
      { label: '私下提醒', effect: () => ({ relationships: { colleague: 15 }, risk: 20, message: '同事修改了数据，但你有了把柄。' }) },
      { label: '假装没看见', effect: () => ({ risk: 40, message: '隐患埋下，迟早要爆。' }) },
    ],
  },
  {
    id: 'p_17', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA,
    title: '科室会',
    description: '要去三甲医院给科室主任和医生讲产品。Sarah 说："别丢人。"',
    options: [
      { label: '充分准备 (Tech>22)', requires: s => s.attributes.tech > 22, effect: () => ({ exp: 40, money: 2000, attributes: { eq: 2 }, message: '主任被你专业的数据分析折服，开了处方。' }) },
      { label: '依赖关系', effect: () => ({ money: 500, message: '靠 Sarah 的关系完成了任务。' }) },
    ],
  },
  {
    id: 'p_18', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA,
    title: '培养基污染传开',
    description: '上一轮的污染扩散到了好几个样本，全组的实验都受影响了。',
    options: [
      { label: '带头重做', effect: () => ({ stamina: -30, relationships: { colleague: 10 }, exp: 20, message: '大家一起通宵重做，虽然累但有成就感。' }) },
      { label: '撒手不管', effect: () => ({ relationships: { colleague: -20 }, message: '同事觉得你自私。' }) },
    ],
  },
  {
    id: 'p_19', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.PHARMA,
    title: '实验突破',
    description: '一个偶然的观察让你发现了一个全新的信号通路。',
    options: [
      { label: '深入研究', effect: () => ({ exp: 80, attributes: { tech: 5, luck: 5 }, addBuff: BUFFS.INSPIRED(6), message: '这可能是一个诺奖级别的发现！' }) },
      { label: '记录存档', effect: () => ({ exp: 10, message: '暂且记在实验记录本上。' }) },
    ],
  },
  {
    id: 'p_20', category: EventCategory.CHOICE, rarity: EventRarity.EPIC, location: Location.BOSS_OFFICE, industry: IndustryType.PHARMA,
    title: '首席科学家退休',
    description: '李教授宣布退休，需要有人接班。这是他亲手创办的实验室。',
    options: [
      { label: '申请接班 (Tech>35)', requires: s => s.attributes.tech > 35, effect: () => ({ level: 2, salary: 3000, addBuff: BUFFS.MOMENTUM(10), message: '你成为了新的首席科学家！' }) },
      { label: '支持同事', effect: () => ({ relationships: { colleague: 20 }, message: '你推荐了更资深的同事。' }) },
    ],
  },
  {
    id: 'p_21', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.PHARMA,
    title: 'CRO 公司谈判',
    description: ' 外包 CRO 坐地起价，要涨 30% 的费用。',
    options: [
      { label: '强硬谈判 (EQ>24)', requires: s => s.attributes.eq > 24, effect: () => ({ money: 5000, message: '你用数据说话，逼对方降了 15%。' }) },
      { label: '无奈同意', effect: () => ({ money: -3000, message: '预算又超了。' }) },
    ],
  },
  {
    id: 'p_22', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.PHARMA,
    title: '实验室安全检查',
    description: '安全员来检查实验室是否符合规范。你的试剂摆放有点乱。',
    options: [
      { label: '紧急收拾', effect: () => ({ stamina: -5, message: '勉强通过了检查。' }) },
      { label: '无所谓', effect: () => ({ risk: 15, message: '被开了整改通知书。' }) },
    ],
  },
];

// ══════════════════════════════════════════════════════════════
// 基层警务 扩充事件 (新增 21 个，合并后 ≥ 22)
// ══════════════════════════════════════════════════════════════

export const POLICE_EVENTS_EXPANDED: GameEvent[] = [
  {
    id: 'po_2', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE,
    title: '片区巡逻',
    description: '又是寻常的巡逻日。大街小巷，从早到晚。',
    options: [
      { label: '深入群众', effect: () => ({ relationships: { colleague: 10 }, exp: 20, message: '你和街坊邻居打成一片，收集了不少线索。' }) },
      { label: '开车绕圈', effect: () => ({ stamina: -5, message: '平安无事的一天。' }) },
    ],
  },
  {
    id: 'po_3', category: EventCategory.CRISIS, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.POLICE,
    title: '跨境追捕',
    description: '一名重大嫌犯逃窜到外省，需要配合当地警方抓捕。',
    options: [
      { label: '主动请缨 (Grind>30)', requires: s => s.attributes.grind > 30, effect: () => ({ exp: 80, addBuff: BUFFS.BOSS_FAVOR(6), message: '你带队千里追凶，终于将嫌犯堵在了出租屋里。' }) },
      { label: '后方协调', effect: () => ({ exp: 20, stamina: -10, message: '你负责调度和技术支持。' }) },
    ],
  },
  {
    id: 'po_4', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.HOME, industry: IndustryType.POLICE,
    title: '家庭纠纷',
    description: '接到报警：夫妻打架，孩子在家大哭。',
    options: [
      { label: '耐心调解 (EQ>18)', requires: s => s.attributes.eq > 18, effect: () => ({ exp: 30, relationships: { colleague: 5 }, message: '你用了一个小时化解了矛盾，两口子签了和解书。' }) },
      { label: '依法处理', effect: () => ({ risk: 5, sanity: -5, message: '你依照规定处理了，但当事人不太满意。' }) },
    ],
  },
  {
    id: 'po_5', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.POLICE,
    title: '大型安保任务',
    description: '世界五百强在本地举办峰会，安保等级最高。全员取消休假。',
    options: [
      { label: '现场指挥 (Grind>28)', requires: s => s.attributes.grind > 28, effect: () => ({ exp: 60, addBuff: BUFFS.BOSS_FAVOR(4), message: '在你的调度下，峰会全程零事故。' }) },
      { label: '定点执勤', effect: () => ({ stamina: -30, exp: 20, message: '站了 12 个小时的岗。' }) },
    ],
  },
  {
    id: 'po_6', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE,
    title: '群众求助',
    description: '一位大妈报警说丢了猫。但这个猫是她去世老伴留下的唯一念想。',
    options: [
      { label: '调监控', effect: () => ({ stamina: -15, exp: 20, message: '你调了 6 个小时监控找到了猫。大妈热泪盈眶。' }) },
      { label: '建议找物业', effect: () => ({ risk: 10, message: '大妈很不高兴，说要投诉你。' }) },
    ],
  },
  {
    id: 'po_7', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.POLICE,
    title: '发现大案线索',
    description: '在一次例行检查中，你偶然发现了一个跨境赌博集团的线索。',
    options: [
      { label: '深入侦查 (Tech>25)', requires: s => s.attributes.tech > 25, effect: () => ({ exp: 100, level: 1, addBuff: BUFFS.MOMENTUM(6), message: '你顺藤摸瓜，捣毁了一个上亿元的大赌窝！' }) },
      { label: '转交刑警', effect: () => ({ exp: 15, message: '线索移交了，但功劳不是你的。' }) },
    ],
  },
  {
    id: 'po_8', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.HOME, industry: IndustryType.POLICE,
    title: '深夜出警',
    description: '凌晨 3 点，110 转来一起酒吧斗殴。',
    options: [
      { label: '立即出警', effect: () => ({ stamina: -20, money: 200, message: '你赶到现场控制了局面。' }) },
      { label: '通知巡警', effect: () => ({ risk: 15, message: '出警延迟被督查批评了。' }) },
    ],
  },
  {
    id: 'po_9', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE,
    title: '社区反诈宣传',
    description: '所里要求每人每月完成反诈宣传任务。你被分配到菜市场。',
    options: [
      { label: '接地气讲解 (EQ>15)', requires: s => s.attributes.eq > 15, effect: () => ({ exp: 25, relationships: { colleague: 5 }, message: '你用方言讲的段子让大爷大妈们笑翻了，反诈效果拉满。' }) },
      { label: '发传单', effect: () => ({ exp: 5, message: '"扫码下载反诈App。"' }) },
    ],
  },
  {
    id: 'po_10', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.EPIC, location: Location.BOSS_OFFICE, industry: IndustryType.POLICE,
    title: '立功受奖',
    description: '你在一次抓捕中的英勇表现被上报分局，三等功批下来了。',
    options: [
      { label: '上台领奖', effect: () => ({ level: 1, money: 2000, addBuff: BUFFS.MOMENTUM(8), message: '全场掌声雷动，张所亲自为你授勋。' }) },
      { label: '低调接受', effect: () => ({ relationships: { boss: 5 }, message: '你把荣誉归功于集体。' }) },
    ],
  },
  {
    id: 'po_11', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.POLICE,
    title: '袭警事件',
    description: '处置一起纠纷时，一名醉酒男子挥拳冲向你们。',
    options: [
      { label: '迅速制服 (Health>25)', requires: s => s.attributes.health > 25, effect: () => ({ exp: 40, sanity: -10, message: '你一个反手擒拿干净利落。' }) },
      { label: '呼叫增援', effect: () => ({ stamina: -10, message: '增援赶到前对峙了十几分钟。' }) },
    ],
  },
  {
    id: 'po_12', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.POLICE,
    title: '派出所年终考核',
    description: '年底考核来临，你的卷宗还差 5 份没结。',
    options: [
      { label: '加班补完 (Grind>20)', requires: s => s.attributes.grind > 20, effect: () => ({ exp: 40, stamina: -25, sanity: -10, message: '你连续加班一周，终于全部结案。' }) },
      { label: '申请延期', effect: () => ({ risk: 15, message: '考核打了个折扣。' }) },
    ],
  },
  {
    id: 'po_13', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.POLICE,
    title: '送锦旗',
    description: '你之前帮助过的一对老夫妇送来了一面锦旗："人民卫士"。',
    options: [
      { label: '感动收下', effect: () => ({ sanity: 30, relationships: { colleague: 5, boss: 5 }, message: '老夫妇握着你的手，久久不愿放开。' }) },
      { label: '委婉拒绝', effect: () => ({ message: '"这是我们应该做的。"' }) },
    ],
  },
  {
    id: 'po_14', category: EventCategory.FATE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE,
    title: '暴雨救援',
    description: '暴雨导致马路涵洞积水，有车辆被困。',
    options: [
      { label: '涉水救人', effect: () => ({ stamina: -30, exp: 50, attributes: { luck: 5 }, message: '你在齐胸深的水中推出了一名被困司机。' }) },
      { label: '呼叫消防', effect: () => ({ exp: 10, message: '专业的事交给专业的人。' }) },
    ],
  },
  {
    id: 'po_15', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE,
    title: '老乡说情',
    description: '你抓到一个交通肇事的嫌疑人，结果是你高中同学的弟弟。',
    options: [
      { label: '秉公执法', effect: () => ({ sanity: -10, risk: -10, attributes: { eq: 3 }, message: '你依法处理了，但和老乡的关系凉了。' }) },
      { label: '网开一面', effect: () => ({ risk: 35, relationships: { boss: -15 }, message: '你帮了朋友，但督察在暗中盯着你。' }) },
    ],
  },
  {
    id: 'po_16', category: EventCategory.CHOICE, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.POLICE,
    title: '竞聘副所长',
    description: '派出所副所长岗位空缺，你有机会一试。',
    options: [
      { label: '全力竞聘 (EQ>28)', requires: s => s.attributes.eq > 28, effect: () => ({ level: 1, salary: 1000, addBuff: BUFFS.BOSS_FAVOR(8), message: '你的竞聘演讲有理有据，成功当选！' }) },
      { label: '随意发挥', effect: () => ({ sanity: -10, message: '落选了。' }) },
    ],
  },
  {
    id: 'po_17', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE,
    title: '看守所提审',
    description: '你手中的盗窃案需要提审嫌疑人。',
    options: [
      { label: '审讯突破 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ exp: 40, message: '你用话术突破了嫌疑人的心理防线，他交代了全部犯罪事实。' }) },
      { label: '例行提审', effect: () => ({ exp: 10, message: '嫌疑人依然顽固。' }) },
    ],
  },
  {
    id: 'po_18', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE,
    title: '网络舆情',
    description: '有人在网上发帖说你暴力执法，转发已经过万。',
    options: [
      { label: '配合调查', effect: () => ({ sanity: -20, risk: -20, message: '执法记录仪证明你的一切操作合规。' }) },
      { label: '公开回应 (Luck>15)', requires: s => s.attributes.luck > 15, effect: () => ({ exp: 20, message: '你的回应赢得了网友的谅解。' }) },
    ],
  },
  {
    id: 'po_19', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE,
    title: '新警培训',
    description: '所里来了 3 个警校实习生，张所让你带一下。',
    options: [
      { label: '认真教 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ exp: 20, relationships: { colleague: 15 }, message: '新人们对你佩服得五体投地。' }) },
      { label: '让他们自生自灭', effect: () => ({ message: '"多干就会了。"' }) },
    ],
  },
  {
    id: 'po_20', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.POLICE,
    title: '公安部专项表彰',
    description: '你所在的所因为连续三年辖区零命案被评为优秀派出所。',
    options: [
      { label: '谦虚接受', effect: () => ({ relationships: { boss: 15 }, exp: 30, message: '张所在表彰会上点名表扬了你。' }) },
      { label: '实至名归', effect: () => ({ level: 1, message: '你被推为全国优秀人民警察候选人。' }) },
    ],
  },
  {
    id: 'po_21', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.POLICE,
    title: '执法记录仪坏了',
    description: '出警到一半，你的执法记录仪没电了。这是非常敏感的事。',
    options: [
      { label: '现场记录备份', effect: () => ({ risk: -10, message: '你用手机录像作为补充证据。' }) },
      { label: '冒险继续', effect: () => ({ risk: 25, message: '如果没出事就算了。' }) },
    ],
  },
  {
    id: 'po_22', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.BOSS_OFFICE, industry: IndustryType.POLICE,
    title: '跨省协作邀请',
    description: '邻省公安局发来协作函，邀请你参与一个专案。',
    options: [
      { label: '接受挑战 (Grind>28)', requires: s => s.attributes.grind > 28, effect: () => ({ exp: 70, level: 1, addBuff: BUFFS.MOMENTUM(6), message: '你在专案组大放异彩。' }) },
      { label: '推荐同事', effect: () => ({ relationships: { colleague: 15 }, message: '你把这个机会让给了更需要的同事。' }) },
    ],
  },
];

// ══════════════════════════════════════════════════════════════
// 广告设计 扩充事件 (新增 21 个，合并后 ≥ 22)
// ══════════════════════════════════════════════════════════════

export const DESIGN_EVENTS_EXPANDED: GameEvent[] = [
  {
    id: 'd_2', category: EventCategory.CHOICE, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.DESIGN,
    title: '年度比稿',
    description: '公司参与了一个年度最大的比稿项目，赢了就是千万级客户。',
    options: [
      { label: '创意制胜 (Luck>25)', requires: s => s.attributes.luck > 25, effect: () => ({ exp: 100, money: 5000, level: 1, message: '你的方案打动了所有评委，一举拿下！' }) },
      { label: '稳妥方案', effect: () => ({ exp: 20, message: '客户选了对手。' }) },
    ],
  },
  {
    id: 'd_3', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN,
    title: '字体版权纠纷',
    description: '你用的商业字体没有授权，字体公司发来了律师函。',
    options: [
      { label: '协商购买', effect: () => ({ money: -2000, risk: -30, message: '花钱消灾，亡羊补牢。' }) },
      { label: '抵赖不认', effect: () => ({ risk: 40, message: '律师函又寄来了第二封。' }) },
    ],
  },
  {
    id: 'd_4', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN,
    title: '连改 30 版',
    description: '甲方已经让你改了 30 版海报，每次都推翻重做。',
    options: [
      { label: '佛系改稿 (Grind>25)', requires: s => s.attributes.grind > 25, effect: () => ({ stamina: -20, sanity: -10, money: 1000, message: '你终于改出一个"还是第一版好"的版本。' }) },
      { label: '崩溃罢工', effect: () => ({ sanity: -40, risk: 20, message: '你当场摔了键盘，被 Kevin 训了一顿。' }) },
    ],
  },
  {
    id: 'd_5', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.HOME, industry: IndustryType.DESIGN,
    title: '独立接单',
    description: '一个老客户私下联系你，想绕开公司直接合作。',
    options: [
      { label: '接下私单 (Luck>18)', requires: s => s.attributes.luck > 18, effect: () => ({ money: 5000, risk: 20, message: '偷偷接了单，但要小心被发现。' }) },
      { label: '推给公司', effect: () => ({ relationships: { boss: 10 }, message: 'Kevin 对你的职业操守很满意。' }) },
    ],
  },
  {
    id: 'd_6', category: EventCategory.FATE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN,
    title: '电脑崩溃',
    description: '你的工作电脑在关键时刻蓝屏了，一整天的心血没了。',
    options: [
      { label: '重做一遍 (Health>20)', requires: s => s.attributes.health > 20, effect: () => ({ stamina: -20, sanity: -15, message: '你强忍愤怒，重做了一遍，第二版反而更好。' }) },
      { label: '请求延期', effect: () => ({ risk: 15, message: 'Kevin 的脸色很不好。' }) },
    ],
  },
  {
    id: 'd_7', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.DESIGN,
    title: '创意评审',
    description: 'Kevin 组织了一次内部评审，每个人要讲自己的设计理念。',
    options: [
      { label: '精彩分享 (EQ>22)', requires: s => s.attributes.eq > 22, effect: () => ({ exp: 30, addBuff: BUFFS.INSPIRED(4), message: '你的讲解引起了热烈讨论，有人从你这里获得了灵感。' }) },
      { label: '敷衍了事', effect: () => ({ message: '"就做完了。"' }) },
    ],
  },
  {
    id: 'd_8', category: EventCategory.CHOICE, rarity: EventRarity.EPIC, location: Location.WORKSTATION, industry: IndustryType.DESIGN,
    title: '品牌全案',
    description: '一个新兴品牌找你们做全套 VI，包括 Logo、包装、官网。',
    options: [
      { label: '亲自操刀 (Tech>30)', requires: s => s.attributes.tech > 30, effect: () => ({ exp: 80, money: 3000, level: 1, message: '你做出了让客户惊叹的全套方案。' }) },
      { label: '分给团队', effect: () => ({ relationships: { colleague: 10 }, exp: 20, message: '大家一起完成但效果一般。' }) },
    ],
  },
  {
    id: 'd_9', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.DESIGN,
    title: '客户比你懂设计',
    description: '客户拿着自己用 PPT 做的示意图，要求你"照这个就行"。',
    options: [
      { label: '专业引导 (EQ>25)', requires: s => s.attributes.eq > 25, effect: () => ({ money: 500, exp: 30, message: '你用三套专业方案说服客户："这个更好。"' }) },
      { label: '照做', effect: () => ({ sanity: -20, money: 300, message: '你闭上眼照做了，但把成品从作品集里删掉了。' }) },
    ],
  },
  {
    id: 'd_10', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN,
    title: 'Deadline 提前',
    description: '客户临时把交稿时间提前了一周，而你还有一半没做。',
    options: [
      { label: '加班赶稿 (Grind>20)', requires: s => s.attributes.grind > 20, effect: () => ({ stamina: -40, sanity: -15, money: 2000, message: '熬了三个通宵终于交付。' }) },
      { label: '谈延期 (EQ>18)', requires: s => s.attributes.eq > 18, effect: () => ({ risk: 5, message: '客户勉强同意了延期两天。' }) },
    ],
  },
  {
    id: 'd_11', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.DESIGN,
    title: '社交媒体爆火',
    description: '你为某品牌设计的一张海报被转发了几万次，上了设计类热搜。',
    options: [
      { label: '接受采访', effect: () => ({ exp: 50, addBuff: BUFFS.MOMENTUM(6), attributes: { luck: 5 }, message: '几家媒体找上门来，你的名气暴涨。' }) },
      { label: '保持低调', effect: () => ({ exp: 20, message: '你默默把作品放进了作品集。' }) },
    ],
  },
  {
    id: 'd_12', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN,
    title: '设计软件限免',
    description: '你购买的正版设计软件支付了一笔不小的年费，心疼。',
    options: [
      { label: '继续付费', effect: () => ({ money: -1000, message: '正版软件，值得拥有。' }) },
      { label: '用盗版', effect: () => ({ money: 1000, risk: 15, message: '便宜是便宜，但哪天被查就完了。' }) },
    ],
  },
  {
    id: 'd_13', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.DESIGN,
    title: '老板让你改 PPT',
    description: 'Kevin 让你帮他把述职 PPT 美化一下，但这不属于你的工作范围。',
    options: [
      { label: '认真做', effect: () => ({ relationships: { boss: 15 }, stamina: -10, message: 'Kevin 非常满意，在总监会上夸了你。' }) },
      { label: '敷衍', effect: () => ({ risk: 10, message: 'Kevin 说配色太土了。' }) },
    ],
  },
  {
    id: 'd_14', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.HOME, industry: IndustryType.DESIGN,
    title: '前同事内推',
    description: '一个去了甲方的前同事发来消息："我们市场部缺人，你来不来？"',
    options: [
      { label: '深入了解 (EQ>18)', requires: s => s.attributes.eq > 18, effect: () => ({ money: 2000, salary: 500, message: '甲方爸爸变金主爸爸，待遇不错。' }) },
      { label: '婉拒', effect: () => ({ relationships: { boss: 5 }, message: '暂时没有跳槽的打算。' }) },
    ],
  },
  {
    id: 'd_15', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.DESIGN,
    title: '客户撤单',
    description: '谈了两个月的单子，客户突然说不做了。预算被砍。',
    options: [
      { label: '尝试挽留 (EQ>25)', requires: s => s.attributes.eq > 25, effect: () => ({ money: 1000, message: '你用降价和附加服务保住了单子。' }) },
      { label: '接受现实', effect: () => ({ sanity: -15, money: -1000, message: '白忙一场。' }) },
    ],
  },
  {
    id: 'd_16', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN,
    title: '行业展会',
    description: '设计周在隔壁城市举办，公司问你要不要去看看。',
    options: [
      { label: '主动申请', effect: () => ({ exp: 30, money: -500, message: '你吸收了最新的设计趋势。' }) },
      { label: '懒得跑', effect: () => ({ message: '在家干活。' }) },
    ],
  },
  {
    id: 'd_17', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.DESIGN,
    title: '灵感枯竭',
    description: '你坐在电脑前 4 小时，一个字、一个图形都想不出来。',
    options: [
      { label: '出去转转 (Health>18)', requires: s => s.attributes.health > 18, effect: () => ({ stamina: 10, sanity: 20, addBuff: BUFFS.INSPIRED(4), message: '你在公园散步时突然灵光一现。' }) },
      { label: '硬磨', effect: () => ({ stamina: -15, sanity: -25, message: '盯屏幕盯到眼睛疼，依然空白。' }) },
    ],
  },
  {
    id: 'd_18', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.DESIGN,
    title: '配色之争',
    description: '你和同事在配色方案上产生了严重分歧。客户明天就要看终稿。',
    options: [
      { label: '妥协', effect: () => ({ relationships: { colleague: 10 }, message: '虽然不完全满意，但大家都接受了。' }) },
      { label: '坚持己见 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ exp: 20, message: '你拿出数据说服了同事。' }) },
    ],
  },
  {
    id: 'd_19', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.WORKSTATION, industry: IndustryType.DESIGN,
    title: '作品被抄袭',
    description: '你发现另一个工作室几乎原样复制了你的设计，还拿了广告奖。',
    options: [
      { label: '发声维权', effect: () => ({ sanity: -20, money: 2000, exp: 30, message: '设计圈刷屏讨论这事，你赢了公义但耗尽了精力。' }) },
      { label: '沉默', effect: () => ({ sanity: -15, message: '你默默把委屈咽下去。' }) },
    ],
  },
  {
    id: 'd_20', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.BOSS_OFFICE, industry: IndustryType.DESIGN,
    title: '季度考核',
    description: 'Kevin 找你谈话："你这季度的产出不太行，你自己觉得呢？"',
    options: [
      { label: '自我检讨 (EQ>22)', requires: s => s.attributes.eq > 22, effect: () => ({ exp: 15, relationships: { boss: 5 }, message: '你诚恳的态度让 Kevin 没有追究。' }) },
      { label: '据理力争', effect: () => ({ risk: 20, message: '你和 Kevin 吵了一架，不欢而散。' }) },
    ],
  },
  {
    id: 'd_21', category: EventCategory.CHOICE, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.DESIGN,
    title: '海外创意考察',
    description: '公司组织去日本参观设计事务所，名额只有一个。',
    options: [
      { label: '竞争名额 (EQ>30)', requires: s => s.attributes.eq > 30, effect: () => ({ exp: 80, attributes: { eq: 5, luck: 5 }, message: '你用精彩的陈述赢得了名额，日本之行让你眼界大开。' }) },
      { label: '祝福同事', effect: () => ({ relationships: { colleague: 15 }, message: '你大方地让给了别人。' }) },
    ],
  },
  {
    id: 'd_22', category: EventCategory.FATE, rarity: EventRarity.COMMON, location: Location.WORKSTATION, industry: IndustryType.DESIGN,
    title: '打印店误事',
    description: '明天比稿，你把物料发去打印店，结果他们印错了颜色。',
    options: [
      { label: '连夜重印 (Grind>22)', requires: s => s.attributes.grind > 22, effect: () => ({ stamina: -25, money: -500, message: '你熬夜监督重印，终于在早晨 6 点拿到正确的物料。' }) },
      { label: '硬着头皮用', effect: () => ({ risk: 25, message: '客户看到色差后皱了皱眉。' }) },
    ],
  },
];

// ══════════════════════════════════════════════════════════════
// 地铁车辆垄断 扩充事件 (新增 12 个，合并后 ≥ 22)
// ══════════════════════════════════════════════════════════════

export const METRO_EVENTS_EXPANDED: GameEvent[] = [
  {
    id: 'm_11', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.FACTORY_FLOOR, industry: IndustryType.METRO,
    title: '供应商断供',
    description: '进口轴承德国供应商因制裁停止供货，库存只够两周。',
    options: [
      { label: '国产替代 (Tech>35)', requires: s => s.attributes.tech > 35, effect: () => ({ attributes: { tech: 5, luck: 10 }, exp: 100, message: '你找到了国内一家精密轴承厂，性能完全达标！' }) },
      { label: '紧急采购', effect: () => ({ money: -10000, message: '从第三方高价购买，成本大幅上升。' }) },
    ],
  },
  {
    id: 'm_12', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.FACTORY_FLOOR, industry: IndustryType.METRO,
    title: '新车出厂仪式',
    description: '第 1000 辆自主知识产权地铁列车即将下线，需要举办仪式。',
    options: [
      { label: '上台致辞 (EQ>22)', requires: s => s.attributes.eq > 22, effect: () => ({ exp: 30, relationships: { boss: 15 }, message: '你精彩的演讲让台下掌声不断。' }) },
      { label: '台下鼓掌', effect: () => ({ message: '你在人群中默默地自豪。' }) },
    ],
  },
  {
    id: 'm_13', category: EventCategory.CHOICE, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.METRO,
    title: '出口认证',
    description: '欧洲客户要求通过严格的 EN 标准认证，技术难度很大。',
    options: [
      { label: '攻坚认证 (Tech>38)', requires: s => s.attributes.tech > 38, effect: () => ({ exp: 120, money: 5000, level: 1, message: '你带队攻关 3 个月，终于通过 EN 认证，打开了欧洲市场！' }) },
      { label: '放弃欧洲市场', effect: () => ({ sanity: -10, message: '赵总工的叹息让人心痛。' }) },
    ],
  },
  {
    id: 'm_14', category: EventCategory.FATE, rarity: EventRarity.EPIC, location: Location.BOSS_OFFICE, industry: IndustryType.METRO,
    title: '国家重点实验室',
    description: '国家要在你们集团挂牌"轨道交通国家重点实验室"。',
    options: [
      { label: '申请加入 (Tech>30)', requires: s => s.attributes.tech > 30, effect: () => ({ exp: 60, level: 1, addBuff: BUFFS.MOMENTUM(8), message: '你成为实验室核心成员！' }) },
      { label: '不凑热闹', effect: () => ({ message: '安心做好手头的事。' }) },
    ],
  },
  {
    id: 'm_15', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.FACTORY_FLOOR, industry: IndustryType.METRO,
    title: '环保督查',
    description: '环保部门突击检查，发现涂装车间的废气处理不达标。',
    options: [
      { label: '立即整改', effect: () => ({ money: -3000, risk: -20, message: '花费不小但合规了。' }) },
      { label: '应付检查', effect: () => ({ risk: 30, message: '督察走了，但隐患还在。' }) },
    ],
  },
  {
    id: 'm_16', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.FACTORY_FLOOR, industry: IndustryType.METRO,
    title: '外方专家来访',
    description: '德国西门子的专家团队来访，要讨论下一代列车技术合作。',
    options: [
      { label: '深度技术交流 (Tech>32)', requires: s => s.attributes.tech > 32, effect: () => ({ exp: 50, attributes: { tech: 3, eq: 2 }, message: '你用流利的技术交流赢得了德国专家的尊重。' }) },
      { label: '礼节接待', effect: () => ({ exp: 10, relationships: { boss: 5 }, message: '接待工作做得体面但技术交流不深入。' }) },
    ],
  },
  {
    id: 'm_17', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.FACTORY_FLOOR, industry: IndustryType.METRO,
    title: '暴雨停工',
    description: '连日暴雨导致厂区积水，所有生产线被迫停工。',
    options: [
      { label: '组织排水抢险 (Grind>25)', requires: s => s.attributes.grind > 25, effect: () => ({ exp: 30, stamina: -25, message: '你带队连夜排水，第二天恢复了生产。' }) },
      { label: '等待天气', effect: () => ({ sanity: -10, message: '停工了三天。' }) },
    ],
  },
  {
    id: 'm_18', category: EventCategory.CHOICE, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.METRO,
    title: '院士推荐',
    description: '集团有一位工程院院士推荐名额，赵总工觉得你可以争取。',
    options: [
      { label: '全力评选 (Tech>40)', requires: s => s.attributes.tech > 40, effect: () => ({ level: 2, money: 10000, addBuff: BUFFS.MOMENTUM(10), message: '你成为了工程院院士候选人！' }) },
      { label: '自知之明', effect: () => ({ relationships: { boss: 5 }, message: '"我还差得远。"' }) },
    ],
  },
  {
    id: 'm_19', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.FACTORY_FLOOR, industry: IndustryType.METRO,
    title: '焊接质量抽检不合格',
    description: '质检部门抽检发现一批车体焊缝存在气孔缺陷。',
    options: [
      { label: '返工整改 (Health>20)', requires: s => s.attributes.health > 20, effect: () => ({ stamina: -30, money: -2000, risk: -30, message: '你组织全线返工，虽然辛苦但保证了质量。' }) },
      { label: '降级使用', effect: () => ({ risk: 40, message: '这批车体被放行，但你知道隐患。' }) },
    ],
  },
  {
    id: 'm_20', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.METRO,
    title: '工会谈判',
    description: '工会要求提高夜班津贴，组织工人集体协商。',
    options: [
      { label: '公平协商 (EQ>25)', requires: s => s.attributes.eq > 25, effect: () => ({ relationships: { colleague: 15 }, money: 1000, message: '你提出的方案双方都满意。' }) },
      { label: '强硬拒绝', effect: () => ({ relationships: { colleague: -25 }, risk: 15, message: '工人情绪激动，差点罢工。' }) },
    ],
  },
  {
    id: 'm_21', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.FACTORY_FLOOR, industry: IndustryType.METRO,
    title: '五一劳动节表彰',
    description: '全市五一劳动节大会，你们车间被提名先进集体。',
    options: [
      { label: '代表领奖 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ exp: 40, addBuff: BUFFS.MOMENTUM(6), message: '你代表车间上台，市领导亲自给你颁奖。' }) },
      { label: '让老师傅上', effect: () => ({ relationships: { colleague: 10, boss: 5 }, message: '你把这个露脸的机会让给了即将退休的老张。' }) },
    ],
  },
  {
    id: 'm_22', category: EventCategory.CRISIS, rarity: EventRarity.EPIC, location: Location.FACTORY_FLOOR, industry: IndustryType.METRO,
    title: '高铁订单竞标',
    description: '集团参与了一项 120 列高铁的竞标，赢了就是行业龙头。',
    options: [
      { label: '技术标主力 (Tech>40)', requires: s => s.attributes.tech > 40, effect: () => ({ exp: 150, level: 2, money: 15000, message: '你的技术方案成为胜出的关键！' }) },
      { label: '辅助支持', effect: () => ({ exp: 30, message: '尽了一份力。' }) },
    ],
  },
  {
    id: 'm_23', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.FACTORY_FLOOR, industry: IndustryType.METRO,
    title: '钢轨探伤',
    description: '年度的钢轨超声波探伤任务。需要爬进车底一个焊点一个焊点地检查。',
    options: [
      { label: '亲自上阵 (Health>25)', requires: s => s.attributes.health > 25, effect: () => ({ stamina: -20, exp: 30, message: '你发现了 3 处隐蔽缺陷，赵总工给你竖了大拇指。' }) },
      { label: '安排技工', effect: () => ({ exp: 5, message: '技工完成的报告很详细。' }) },
    ],
  },
  {
    id: 'm_24', category: EventCategory.CRISIS, rarity: EventRarity.RARE, location: Location.FACTORY_FLOOR, industry: IndustryType.METRO,
    title: '高级技工短缺',
    description: '几名老焊工同时退休，年轻技工还不能独立顶岗。交付节点面临风险。',
    options: [
      { label: '亲自带徒 (Grind>30)', requires: s => s.attributes.grind > 30, effect: () => ({ exp: 50, attributes: { eq: 3 }, relationships: { colleague: 15 }, message: '你手把手带了三个月的徒弟，他们终于能独立作业了。' }) },
      { label: '招外包', effect: () => ({ money: -5000, message: '外聘焊工价格高但经验丰富。' }) },
    ],
  },
  {
    id: 'm_25', category: EventCategory.CHOICE, rarity: EventRarity.EPIC, location: Location.MEETING_ROOM, industry: IndustryType.METRO,
    title: '新能源列车研发',
    description: '集团决定研发氢燃料电池列车，这是一个全新的方向。需要骨干加入。',
    options: [
      { label: '加入项目组 (Tech>35)', requires: s => s.attributes.tech > 35, effect: () => ({ exp: 100, level: 1, attributes: { tech: 5 }, message: '你成为新能源项目的核心技术专家！' }) },
      { label: '留守传统线', effect: () => ({ relationships: { boss: 10 }, message: '赵总工需要可靠的人守住现有业务。' }) },
    ],
  },
  {
    id: 'm_26', category: EventCategory.FATE, rarity: EventRarity.RARE, location: Location.MEETING_ROOM, industry: IndustryType.METRO,
    title: '国际轨道交通展',
    description: '柏林轨道交通展邀请你们展出最新车型，这是一个展示实力的舞台。',
    options: [
      { label: '跟团展出 (EQ>20)', requires: s => s.attributes.eq > 20, effect: () => ({ exp: 60, attributes: { luck: 5 }, message: '你们的展台吸引了来自 20 个国家的潜在客户。' }) },
      { label: '留在厂里', effect: () => ({ exp: 10, message: '通过直播看展。' }) },
    ],
  },
  {
    id: 'm_27', category: EventCategory.CRISIS, rarity: EventRarity.COMMON, location: Location.FACTORY_FLOOR, industry: IndustryType.METRO,
    title: '数控机床故障',
    description: '核心数控龙门铣床死机，正在加工的转向架被迫中断。',
    options: [
      { label: '调试维修 (Tech>30)', requires: s => s.attributes.tech > 30, effect: () => ({ exp: 40, stamina: -15, message: '你花了 6 小时恢复了系统。' }) },
      { label: '联系厂商', effect: () => ({ money: -2000, message: '厂商工程师第二天才到。' }) },
    ],
  },
  {
    id: 'm_28', category: EventCategory.NPC_INTERACTION, rarity: EventRarity.COMMON, location: Location.FACTORY_FLOOR, industry: IndustryType.METRO,
    title: '青工技能大赛',
    description: '全集团青工技能大赛开始报名，冠军可以直接破格晋升。',
    options: [
      { label: '全力备战 (Grind>28)', requires: s => s.attributes.grind > 28, effect: () => ({ exp: 60, level: 1, addBuff: BUFFS.MOMENTUM(6), message: '你的焊接速度和质量双双夺冠！' }) },
      { label: '日常训练', effect: () => ({ exp: 15, message: '重在参与。' }) },
    ],
  },
  {
    id: 'm_29', category: EventCategory.ROUTINE, rarity: EventRarity.COMMON, location: Location.MEETING_ROOM, industry: IndustryType.METRO,
    title: '安全生产月',
    description: '六月的安全生产月到了，需要组织全车间的安全培训和演练。',
    options: [
      { label: '创新培训 (EQ>18)', requires: s => s.attributes.eq > 18, effect: () => ({ exp: 30, relationships: { colleague: 10, boss: 10 }, message: '你设计了 VR 全景安全演练，效果拔群。' }) },
      { label: '走过场', effect: () => ({ risk: 5, message: '该做的都做了。' }) },
    ],
  },
  {
    id: 'm_30', category: EventCategory.CHOICE, rarity: EventRarity.COMMON, location: Location.FACTORY_FLOOR, industry: IndustryType.METRO,
    title: '夜班排班冲突',
    description: '车间主任把所有的夜班都排给了年轻人，老员工闹意见了。',
    options: [
      { label: '主动上夜班 (Grind>25)', requires: s => s.attributes.grind > 25, effect: () => ({ stamina: -20, relationships: { colleague: 15 }, money: 1000, message: '你的担当让老员工们竖起大拇指。' }) },
      { label: '公平轮换', effect: () => ({ exp: 10, message: '你提出了合理的轮班方案。' }) },
    ],
  },
];

// ══════════════════════════════════════════════════════════════
// 事件模板 — 参数化批量生成
// ══════════════════════════════════════════════════════════════

/** 模板参数：可替换的文本插值 */
export interface EventTemplateParams {
  industryName: string;   // 行业名称，如"互联网大厂"
  companyName?: string;   // 公司名，如"某互联网公司"
  progressTerm: string;   // 进度术语，如"迭代"/"去化率"
  overtimeTerm: string;   // 加班术语，如"上线"/"开盘"
  bonusTerm: string;      // 奖金术语，如"期权"/"佣金"
  firedTerm: string;      // 裁员术语，如"毕业"/"末位淘汰"
  currencyUnit: string;   // 货币单位，如"k"/"万"
  bossName: string;       // 老板名，如"架构师老张"
  colleagueName: string;  // 同事名，如"卷王小李"
  hrName: string;         // HR 名，如"Linda"
}

/** 模板类型 — 生成器函数签名 */
export type EventTemplate = (p: EventTemplateParams) => GameEvent;

/**
 * 通用模板 1：紧急加班
 * 适用于所有行业，替换行业术语即可。
 */
export const TEMPLATE_EMERGENCY_OT: EventTemplate = (p) => ({
  id: `tmpl_emer_ot_${p.industryName}`,
  category: EventCategory.CRISIS,
  rarity: EventRarity.COMMON,
  location: Location.WORKSTATION,
  title: `今晚必须${p.overtimeTerm}`,
  description: `${p.companyName ?? p.industryName}的大老板临时发话：今天不${p.overtimeTerm}不准走。${p.bossName}已经开始在群里@所有人。`,
  options: [
    {
      label: '熬夜干完',
      effect: () => ({
        stamina: -25,
        sanity: -10,
        exp: 15,
        money: 500,
        message: `顶着黑眼圈终于赶在凌晨 3 点完成了${p.overtimeTerm}。`,
      }),
    },
    {
      label: '找借口溜',
      effect: () => ({
        risk: 15,
        message: `${p.bossName}很不高兴，但没有当面发作。`,
      }),
    },
  ],
});

/**
 * 通用模板 2：年度述职
 * 适用于所有行业。
 */
export const TEMPLATE_ANNUAL_REVIEW: EventTemplate = (p) => ({
  id: `tmpl_annual_${p.industryName}`,
  category: EventCategory.CHOICE,
  rarity: EventRarity.RARE,
  location: Location.MEETING_ROOM,
  title: '年度述职',
  description: `年底了，${p.bossName}要求每人做年度${p.progressTerm}述职。这是定薪定级的关键时刻。`,
  options: [
    {
      label: `包装成果 (EQ>20)`,
      requires: (s) => s.attributes.eq > 20,
      effect: () => ({
        salary: 500,
        money: 1000,
        addBuff: BUFFS.MOMENTUM(6),
        message: `你用精美的 PPT 把 30% 的${p.progressTerm}包装成了 120%，绩效 S。`,
      }),
    },
    {
      label: '实话实说',
      effect: () => ({
        exp: 10,
        message: `虽然坦诚，但在${p.bossName}眼里"不够亮眼"。`,
      }),
    },
    {
      label: '甩锅他人',
      effect: () => ({
        risk: 25,
        relationships: { colleague: -20 },
        message: `${p.colleagueName}被你的甩锅气得不轻。`,
      }),
    },
  ],
});

/**
 * 通用模板 3：裁员风声
 * 适用于所有行业。
 */
export const TEMPLATE_LAYOFF_RUMOR: EventTemplate = (p) => ({
  id: `tmpl_layoff_${p.industryName}`,
  category: EventCategory.CRISIS,
  rarity: EventRarity.RARE,
  location: Location.WORKSTATION,
  title: `${p.firedTerm}名单`,
  description: `小道消息：${p.companyName ?? p.industryName}要裁 20%，${p.firedTerm}名单明天公布。茶水间里人心惶惶。`,
  options: [
    {
      label: '找老板表态 (EQ>22)',
      requires: (s) => s.attributes.eq > 22,
      effect: () => ({
        risk: -20,
        relationships: { boss: 15 },
        message: `${p.bossName}暗示你不在名单上，你松了一口气。`,
      }),
    },
    {
      label: '准备简历',
      effect: () => ({
        money: 500,
        sanity: -15,
        message: `你偷偷更新了简历，虽然最后没被${p.firedTerm}，但已经开始骑驴找马。`,
      }),
    },
    {
      label: '佛系等待',
      effect: () => ({
        sanity: -25,
        message: `整天心神不宁，${p.firedTerm}的焦虑挥之不去。`,
      }),
    },
  ],
});

/**
 * 通用模板 4：奖金发放
 * 适用于所有行业。
 */
export const TEMPLATE_BONUS_DAY: EventTemplate = (p) => ({
  id: `tmpl_bonus_${p.industryName}`,
  category: EventCategory.FATE,
  rarity: EventRarity.COMMON,
  location: Location.WORKSTATION,
  title: `${p.bonusTerm}到账`,
  description: `手机上弹出银行短信：${p.bonusTerm}到账 5000${p.currencyUnit}。辛苦了这么久，这是你应得的。`,
  options: [
    {
      label: '存起来',
      effect: () => ({
        money: 5000,
        message: `理智的你把这笔${p.bonusTerm}存入了定期。`,
      }),
    },
    {
      label: '犒劳自己',
      effect: () => ({
        money: 3000,
        sanity: 20,
        message: `你花 2000${p.currencyUnit}请了自己一顿大餐和按摩，瞬间回血。`,
      }),
    },
    {
      label: '全部花光',
      effect: () => ({
        money: 1000,
        sanity: 30,
        attributes: { luck: -2 },
        message: `疯狂购物后，你的银行卡余额回到解放前，但爽是真的爽。`,
      }),
    },
  ],
});

/** 所有模板的集合 */
export const EVENT_TEMPLATES: Record<string, EventTemplate> = {
  emergencyOT: TEMPLATE_EMERGENCY_OT,
  annualReview: TEMPLATE_ANNUAL_REVIEW,
  layoffRumor: TEMPLATE_LAYOFF_RUMOR,
  bonusDay: TEMPLATE_BONUS_DAY,
};

// ══════════════════════════════════════════════════════════════
// 汇总导出
// ══════════════════════════════════════════════════════════════

/** 所有扩充事件合并后的 Map（按行业索引） */
export const ALL_EXPANDED_EVENTS: Record<IndustryType, GameEvent[]> = {
  [IndustryType.INTERNET]: INTERNET_EVENTS_EXPANDED,
  [IndustryType.REAL_ESTATE]: REAL_ESTATE_EVENTS_EXPANDED,
  [IndustryType.PHARMA]: PHARMA_EVENTS_EXPANDED,
  [IndustryType.POLICE]: POLICE_EVENTS_EXPANDED,
  [IndustryType.DESIGN]: DESIGN_EVENTS_EXPANDED,
  [IndustryType.METRO]: METRO_EVENTS_EXPANDED,
};

/**
 * 从模板批量生成行业事件。
 *
 * @example
 *   const events = batchFromTemplate(TEMPLATE_EMERGENCY_OT, INDUSTRIES[IndustryType.INTERNET]);
 */
export function batchFromTemplate(
  template: EventTemplate,
  params: EventTemplateParams,
): GameEvent[] {
  // 单一模板，可调用多次覆盖不同行业
  return [template(params)];
}

/** 总事件数量统计 */
export function getExpandedEventCount(): number {
  return Object.values(ALL_EXPANDED_EVENTS).reduce(
    (sum, events) => sum + events.length,
    0,
  );
}
