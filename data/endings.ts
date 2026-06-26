/**
 * P1 多结局系统 — 18 结局（每行业 3 种）
 *
 * 结局类型：
 *   GOOD    好结局 — 特定属性组合 + 路径选择达成
 *   NORMAL  普通结局 — 存活 52 周但未满足好结局条件
 *   BAD     坏结局 — 提前死亡 / 特定负面事件触发
 *
 * 类型约定：
 *   - EndingCondition 返回 boolean 判断当前局是否符合该结局
 *   - EndingFlavor.desc 为结局描述文本（2-3 句）
 *   - EndingFlavor.epilogue 为结算后呈现的短文案
 */

import { IndustryType, GameStats, MetaData } from '../types';

// ── 结局类型枚举 ──────────────────────────────────────
export enum EndingType {
  GOOD = 'GOOD',
  NORMAL = 'NORMAL',
  BAD = 'BAD',
}

// ── 结局描述 ──────────────────────────────────────────
export interface EndingFlavor {
  /** 结局标题 */
  title: string;
  /** 结论性描述（1-2 句） */
  desc: string;
  /** 结算后短文案 */
  epilogue: string;
}

// ── 结局解锁信息 ──────────────────────────────────────
export interface EndingUnlock {
  /** 是否曾在任意历史局中触发过 */
  seen: boolean;
}

// ── 结局触发条件 ──────────────────────────────────────
export interface EndingCondition {
  /** 基于当前局 GameStats 判断是否触发 */
  trigger: (stats: GameStats) => boolean;
  /** 更易于玩家理解的触发条件描述 */
  hint: string;
}

// ── 结局配置（策划数据） ──────────────────────────────
export interface EndingConfig {
  id: string;
  industry: IndustryType;
  type: EndingType;
  flavor: EndingFlavor;
  condition: EndingCondition;
  /** 部分坏结局可被某些方法规避 */
  preventable?: boolean;
  /** 生涯点数奖励 */
  careerPoints: number;
}

// ── 18 结局配置 ───────────────────────────────────────

export const ENDINGS: EndingConfig[] = [
  // ═══════════════════════════════════════════════════
  // 互联网大厂（INTERNET）
  // ═══════════════════════════════════════════════════
  {
    id: 'end_internet_good',
    industry: IndustryType.INTERNET,
    type: EndingType.GOOD,
    flavor: {
      title: '上市敲钟',
      desc: '你押注的期权终于兑现，公司敲钟的那一刻你站在 C 位。股票账户多了一串零，猎头电话被打爆。',
      epilogue: '从此江湖上多了一个传奇。',
    },
    condition: {
      trigger: (s) =>
        s.week >= 52 &&
        s.level >= 7 &&
        s.money >= 50000 &&
        s.attributes.tech >= 25 &&
        s.attributes.luck >= 15,
      hint: '存活 52 周、Lv.7、存款 ≥ 50k、技术 ≥ 25、运气 ≥ 15',
    },
    careerPoints: 100,
  },
  {
    id: 'end_internet_normal',
    industry: IndustryType.INTERNET,
    type: EndingType.NORMAL,
    flavor: {
      title: '光荣毕业',
      desc: '你没有暴富，但也没有倒下。合同到期后你拿了 N+1，平静地递出工卡。明年去哪？再说吧。',
      epilogue: '体面转身，已是不易。',
    },
    condition: {
      trigger: (s) => s.week >= 52,
      hint: '存活 52 周（未达成好结局条件）',
    },
    careerPoints: 50,
  },
  {
    id: 'end_internet_bad',
    industry: IndustryType.INTERNET,
    type: EndingType.BAD,
    flavor: {
      title: '过劳猝死',
      desc: '连续通宵上线后你倒在工位上，显示器还亮着未提交的代码。同事们默默把你抬上救护车，然后继续开会。',
      epilogue: '公司发了封全员邮件，标题是"向奋斗者致敬"。',
    },
    condition: {
      trigger: (s) => s.stamina <= 0 && s.debtWeeks >= 2,
      hint: '体力归零 + 负债 ≥ 2 周',
    },
    preventable: true,
    careerPoints: 5,
  },

  // ═══════════════════════════════════════════════════
  // 地产巨头（REAL_ESTATE）
  // ═══════════════════════════════════════════════════
  {
    id: 'end_realestate_good',
    industry: IndustryType.REAL_ESTATE,
    type: EndingType.GOOD,
    flavor: {
      title: '区域销冠',
      desc: '你拿下了全市年度销冠，奖金多到可以付一套首付。甲方主动挖你过去当总监，你微笑着拒绝。',
      epilogue: '笑傲销售圈的王者。',
    },
    condition: {
      trigger: (s) =>
        s.week >= 52 &&
        s.money >= 80000 &&
        s.attributes.eq >= 30,
      hint: '存活 52 周、存款 ≥ 80k、情商 ≥ 30',
    },
    careerPoints: 100,
  },
  {
    id: 'end_realestate_normal',
    industry: IndustryType.REAL_ESTATE,
    type: EndingType.NORMAL,
    flavor: {
      title: '黯然离场',
      desc: '市场下行，公司裁员潮中你没有幸存。拿着补偿金，你最后一次望向那个沙盘——上面还写着你的名字。',
      epilogue: '地产十年一轮回，你只是其中的一粒沙。',
    },
    condition: {
      trigger: (s) => s.week >= 52,
      hint: '存活 52 周（未达成好结局条件）',
    },
    careerPoints: 50,
  },
  {
    id: 'end_realestate_bad',
    industry: IndustryType.REAL_ESTATE,
    type: EndingType.BAD,
    flavor: {
      title: '烂尾人生',
      desc: '你的项目烂尾了，开发商跑路，你在维权群里眼看着横幅越拉越长。所有积蓄砸在首付上，如今一文不值。',
      epilogue: '又一个烂尾楼的荒草里，埋着一个破碎的梦。',
    },
    condition: {
      trigger: (s) => s.sanity <= 0 && s.risk >= 60,
      hint: '心智归零 + 风险 ≥ 60',
    },
    preventable: true,
    careerPoints: 5,
  },

  // ═══════════════════════════════════════════════════
  // 生物医药（PHARMA）
  // ═══════════════════════════════════════════════════
  {
    id: 'end_pharma_good',
    industry: IndustryType.PHARMA,
    type: EndingType.GOOD,
    flavor: {
      title: '新药上市',
      desc: '你参与的三期临床终于拿到批文，新药正式上市。患者给你寄来感谢信，你第一次觉得——这份工作有意义。',
      epilogue: '你拯救了无数生命，也在拯救自己。',
    },
    condition: {
      trigger: (s) =>
        s.week >= 52 &&
        s.level >= 7 &&
        s.attributes.tech >= 35,
      hint: '存活 52 周、Lv.7、技术 ≥ 35',
    },
    careerPoints: 100,
  },
  {
    id: 'end_pharma_normal',
    industry: IndustryType.PHARMA,
    type: EndingType.NORMAL,
    flavor: {
      title: '平稳交接',
      desc: '项目进入维护期，你把手里的文档整理好交给新人。没有掌声，也没有责难，你默默退了实验室的门卡。',
      epilogue: '科研是一场长跑，你的这一棒已完成。',
    },
    condition: {
      trigger: (s) => s.week >= 52,
      hint: '存活 52 周（未达成好结局条件）',
    },
    careerPoints: 50,
  },
  {
    id: 'end_pharma_bad',
    industry: IndustryType.PHARMA,
    type: EndingType.BAD,
    flavor: {
      title: '数据造假',
      desc: '为了赶 deadline 你篡改了临床数据。东窗事发后，你的职业资格被吊销，被永远钉在学术不端的耻辱柱上。',
      epilogue: '一个谎言，毁掉一生。',
    },
    condition: {
      trigger: (s) => s.risk >= 80 && s.sanity <= 20,
      hint: '风险 ≥ 80 + 心智 ≤ 20',
    },
    preventable: true,
    careerPoints: 5,
  },

  // ═══════════════════════════════════════════════════
  // 基层警务（POLICE）
  // ═══════════════════════════════════════════════════
  {
    id: 'end_police_good',
    industry: IndustryType.POLICE,
    type: EndingType.GOOD,
    flavor: {
      title: '一等功勋章',
      desc: '你带队破获了公安部挂牌督办的大案，一等功勋章挂在胸前。所长拍着你的肩说："局里早就想提拔你了。"',
      epilogue: '人民不会忘记你。',
    },
    condition: {
      trigger: (s) =>
        s.week >= 52 &&
        s.attributes.grind >= 25 &&
        s.attributes.tech >= 20,
      hint: '存活 52 周、耐艹 ≥ 25、技术 ≥ 20',
    },
    careerPoints: 100,
  },
  {
    id: 'end_police_normal',
    industry: IndustryType.POLICE,
    type: EndingType.NORMAL,
    flavor: {
      title: '平安退休',
      desc: '到了年限，你脱下警服，把配枪和警徽整齐地交还。没有大案传奇，只有年复一年的夜晚巡逻和调解邻里纠纷。',
      epilogue: '平凡坚守亦是伟大。',
    },
    condition: {
      trigger: (s) => s.week >= 52,
      hint: '存活 52 周（未达成好结局条件）',
    },
    careerPoints: 50,
  },
  {
    id: 'end_police_bad',
    industry: IndustryType.POLICE,
    type: EndingType.BAD,
    flavor: {
      title: '因公殉职',
      desc: '一次夜间出警，你没能回来。追悼会上，同事们列队敬礼，你的照片被框上黑纱。警笛长鸣。',
      epilogue: '英雄走好。蜡烛再也点不亮回家的路。',
    },
    condition: {
      trigger: (s) => s.stamina <= 0 && s.attributes.health <= 10,
      hint: '体力归零 + 体质 ≤ 10',
    },
    preventable: false,
    careerPoints: 40,
  },

  // ═══════════════════════════════════════════════════
  // 广告设计（DESIGN）
  // ═══════════════════════════════════════════════════
  {
    id: 'end_design_good',
    industry: IndustryType.DESIGN,
    type: EndingType.GOOD,
    flavor: {
      title: '国际大奖',
      desc: '你的作品在戛纳创意节上拿了金狮奖。微博热搜、朋友圈刷屏，客户排队找你。你终于可以说：我从不做五彩斑斓的黑。',
      epilogue: '你的名字，写入了创意史。',
    },
    condition: {
      trigger: (s) =>
        s.week >= 52 &&
        s.level >= 7 &&
        s.attributes.luck >= 25 &&
        s.attributes.eq >= 20,
      hint: '存活 52 周、Lv.7、运气 ≥ 25、情商 ≥ 20',
    },
    careerPoints: 100,
  },
  {
    id: 'end_design_normal',
    industry: IndustryType.DESIGN,
    type: EndingType.NORMAL,
    flavor: {
      title: '自由职业',
      desc: '你厌倦了甲方的反复无常，决定做独立设计师。接私单、画插画、卖素材，虽然收入不稳定，但终于不用再改稿到凌晨三点。',
      epilogue: '自由比什么都贵。',
    },
    condition: {
      trigger: (s) => s.week >= 52,
      hint: '存活 52 周（未达成好结局条件）',
    },
    careerPoints: 50,
  },
  {
    id: 'end_design_bad',
    industry: IndustryType.DESIGN,
    type: EndingType.BAD,
    flavor: {
      title: '灵感枯竭',
      desc: '你盯着屏幕看了一整天，一个字也画不出来。焦虑、失眠、酗酒——你被诊断出重度抑郁，再也拿不起画笔。',
      epilogue: '创造力是一种消耗品。你用光了。',
    },
    condition: {
      trigger: (s) => s.sanity <= 0 && s.attributes.luck <= 5,
      hint: '心智归零 + 运气 ≤ 5',
    },
    preventable: true,
    careerPoints: 5,
  },

  // ═══════════════════════════════════════════════════
  // 地铁车辆垄断（METRO）
  // ═══════════════════════════════════════════════════
  {
    id: 'end_metro_good',
    industry: IndustryType.METRO,
    type: EndingType.GOOD,
    flavor: {
      title: '大国重器',
      desc: '由你主导的新型地铁列车驰骋在全国各大城市，甚至拿下了海外订单。表彰大会上，董事长握住你的手说："你是我们的脊梁。"',
      epilogue: '你的列车，载着这个国家前行。',
    },
    condition: {
      trigger: (s) =>
        s.week >= 52 &&
        s.level >= 7 &&
        s.attributes.tech >= 40,
      hint: '存活 52 周、Lv.7、技术 ≥ 40',
    },
    careerPoints: 120,
  },
  {
    id: 'end_metro_normal',
    industry: IndustryType.METRO,
    type: EndingType.NORMAL,
    flavor: {
      title: '光荣退休',
      desc: '三十年工龄，你从学徒做到老师傅。退休仪式上，车间主任递给你一辆模型列车——"这是你当年参与造的第一辆。"',
      epilogue: '平凡岗位，不凡坚守。',
    },
    condition: {
      trigger: (s) => s.week >= 52,
      hint: '存活 52 周（未达成好结局条件）',
    },
    careerPoints: 50,
  },
  {
    id: 'end_metro_bad',
    industry: IndustryType.METRO,
    type: EndingType.BAD,
    flavor: {
      title: '安全责任事故',
      desc: '由于你的疏忽，一节车厢的焊缝出现裂纹，在运营中发生断裂。数十人受伤，你被带走调查。工厂大门从此对你关闭。',
      epilogue: '一点马虎，毁掉所有人对你的信任。',
    },
    condition: {
      trigger: (s) => s.risk >= 90 && s.attributes.tech <= 10,
      hint: '风险 ≥ 90 + 技术 ≤ 10',
    },
    preventable: true,
    careerPoints: 5,
  },
];

// ── 工具函数 ──────────────────────────────────────────

/** 按行业获取结局列表 */
export function getEndingsByIndustry(
  ind: IndustryType,
): EndingConfig[] {
  return ENDINGS.filter((e) => e.industry === ind);
}

/** 按类型获取结局列表 */
export function getEndingsByType(t: EndingType): EndingConfig[] {
  return ENDINGS.filter((e) => e.type === t);
}

/** 根据当前 stats 判定触发哪种结局（返回配置或 null） */
export function determineEnding(stats: GameStats): EndingConfig | null {
  const candidates = getEndingsByIndustry(stats.industry);

  // 优先检查 BAD 结局（提前触发）
  for (const e of candidates) {
    if (e.type === EndingType.BAD && e.condition.trigger(stats)) return e;
  }

  // 存活 52 周时检查 GOOD/NORMAL
  if (stats.week >= 52) {
    const good = candidates.find(
      (e) => e.type === EndingType.GOOD && e.condition.trigger(stats),
    );
    if (good) return good;
    return candidates.find((e) => e.type === EndingType.NORMAL) ?? null;
  }

  return null;
}
