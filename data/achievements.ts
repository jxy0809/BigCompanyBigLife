/**
 * P1 成就系统配置 — 18成就
 *
 * 分类：
 *   BEGINNER(6) — 新手向，引导玩家探索核心机制
 *   ADVANCED(6) — 进阶向，要求深度投入
 *   HIDDEN(6)  — 隐藏成就，发现后才能看到
 *
 * 类型约定：
 *   - condition / progress 接收 MetaData（跨局）和可选的 GameStats（当前局）
 *   - 纯跨局成就不依赖 currentRun
 *   - progress.current/target 为 0/1 时表示二元成就（未完成/已完成）
 */

import { MetaData, GameStats } from '../types';

// ── 分类与稀有度枚举 ──────────────────────────────────
export enum AchievementCategory {
  BEGINNER = 'BEGINNER',
  ADVANCED = 'ADVANCED',
  HIDDEN = 'HIDDEN',
}

export enum AchievementTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

// ── 奖励接口 ──────────────────────────────────────────
export interface AchievementReward {
  /** 奖励生涯点数 */
  careerPoints: number;
  /** 解锁称号（可选） */
  badge?: string;
  /** 解锁隐藏内容 ID（可选） */
  unlockContent?: string;
}

// ── 进度追踪 ──────────────────────────────────────────
export interface AchievementProgress {
  current: number;
  target: number;
}

// ── 成就配置（策划数据） ──────────────────────────────
export interface AchievementConfig {
  id: string;
  name: string;
  desc: string;
  category: AchievementCategory;
  tier: AchievementTier;
  /** lucide-react 图标名 */
  icon: string;
  /** 是否已达成 */
  condition: (meta: MetaData, currentRun?: GameStats) => boolean;
  /** 进度追踪；二元成就返回 {current:0|1, target:1} */
  progress: (meta: MetaData, currentRun?: GameStats) => AchievementProgress;
  reward: AchievementReward;
  /** 隐藏成就解锁前不显示名称/描述 */
  isHidden?: boolean;
}

// ── 18 成就配置 ───────────────────────────────────────

export const ACHIEVEMENTS: AchievementConfig[] = [
  // ═══════════════════════════════════════════════════
  // 新手 (6)
  // ═══════════════════════════════════════════════════
  {
    id: 'a_beginner_01',
    name: '初出茅庐',
    desc: '完成第一段职业生涯（存活任意周数后结束）',
    category: AchievementCategory.BEGINNER,
    tier: AchievementTier.BRONZE,
    icon: 'Flag',
    condition: (meta) => meta.gameHistory.length > 0,
    progress: (meta) => ({
      current: Math.min(meta.gameHistory.length, 1),
      target: 1,
    }),
    reward: { careerPoints: 10 },
  },
  {
    id: 'a_beginner_02',
    name: '品类收集者',
    desc: '尝试 3 种不同行业',
    category: AchievementCategory.BEGINNER,
    tier: AchievementTier.BRONZE,
    icon: 'Briefcase',
    condition: (meta) => meta.unlockedIndustries.length >= 3,
    progress: (meta) => ({
      current: Math.min(meta.unlockedIndustries.length, 3),
      target: 3,
    }),
    reward: { careerPoints: 20 },
  },
  {
    id: 'a_beginner_03',
    name: '勤俭节约',
    desc: '单局存款首次突破 10,000',
    category: AchievementCategory.BEGINNER,
    tier: AchievementTier.BRONZE,
    icon: 'PiggyBank',
    condition: (meta) =>
      meta.gameHistory.some((r) => r.money >= 10000),
    progress: (meta) => {
      const max = Math.max(0, ...meta.gameHistory.map((r) => r.money));
      return { current: max, target: 10000 };
    },
    reward: { careerPoints: 15 },
  },
  {
    id: 'a_beginner_04',
    name: '人脉王',
    desc: '任意一段关系中好感度 ≥ 50',
    category: AchievementCategory.BEGINNER,
    tier: AchievementTier.SILVER,
    icon: 'Users',
    condition: (_meta, run) =>
      run != null &&
      (run.relationships.boss >= 50 ||
        run.relationships.colleague >= 50 ||
        run.relationships.hr >= 50),
    progress: (_meta, run) => {
      if (!run) return { current: 0, target: 50 };
      const max = Math.max(
        run.relationships.boss,
        run.relationships.colleague,
        run.relationships.hr,
      );
      return { current: max, target: 50 };
    },
    reward: { careerPoints: 20, badge: '社交花' },
  },
  {
    id: 'a_beginner_05',
    name: '半程马拉松',
    desc: '单局存活 ≥ 26 周',
    category: AchievementCategory.BEGINNER,
    tier: AchievementTier.SILVER,
    icon: 'Timer',
    condition: (meta) =>
      meta.gameHistory.some((r) => r.week >= 26),
    progress: (meta) => {
      const max = Math.max(0, ...meta.gameHistory.map((r) => r.week));
      return { current: max, target: 26 };
    },
    reward: { careerPoints: 30 },
  },
  {
    id: 'a_beginner_06',
    name: '终身学习者',
    desc: '累计完成 10 次“技能进阶”周末活动',
    category: AchievementCategory.BEGINNER,
    tier: AchievementTier.SILVER,
    icon: 'GraduationCap',
    // 依赖新增 meta 字段 studyCount（见下方说明）
    condition: (meta: any) => (meta.studyCount ?? 0) >= 10,
    progress: (meta: any) => ({
      current: Math.min(meta.studyCount ?? 0, 10),
      target: 10,
    }),
    reward: { careerPoints: 25 },
  },

  // ═══════════════════════════════════════════════════
  // 进阶 (6)
  // ═══════════════════════════════════════════════════
  {
    id: 'a_adv_01',
    name: '财富自由',
    desc: '单局存款突破 50,000',
    category: AchievementCategory.ADVANCED,
    tier: AchievementTier.GOLD,
    icon: 'Coins',
    condition: (meta) =>
      meta.gameHistory.some((r) => r.money >= 50000),
    progress: (meta) => {
      const max = Math.max(0, ...meta.gameHistory.map((r) => r.money));
      return { current: max, target: 50000 };
    },
    reward: { careerPoints: 50, badge: '暴发户' },
  },
  {
    id: 'a_adv_02',
    name: '行业巅峰',
    desc: '任意行业达到满级（Lv.7）',
    category: AchievementCategory.ADVANCED,
    tier: AchievementTier.GOLD,
    icon: 'Trophy',
    condition: (meta) =>
      meta.gameHistory.some((r) => r.level >= 7),
    progress: (meta) => {
      const max = Math.max(0, ...meta.gameHistory.map((r) => r.level));
      return { current: max, target: 7 };
    },
    reward: { careerPoints: 60, badge: '行业翘楚' },
  },
  {
    id: 'a_adv_03',
    name: '六边形战士',
    desc: '单局五项属性均 ≥ 20',
    category: AchievementCategory.ADVANCED,
    tier: AchievementTier.GOLD,
    icon: 'Hexagon',
    condition: (_meta, run) =>
      run != null &&
      run.attributes.grind >= 20 &&
      run.attributes.eq >= 20 &&
      run.attributes.tech >= 20 &&
      run.attributes.health >= 20 &&
      run.attributes.luck >= 20,
    progress: (_meta, run) => {
      if (!run) return { current: 0, target: 5 };
      const attrs = run.attributes;
      const count = [
        attrs.grind, attrs.eq, attrs.tech, attrs.health, attrs.luck,
      ].filter((v) => v >= 20).length;
      return { current: count, target: 5 };
    },
    reward: { careerPoints: 80, badge: '多边形战士' },
  },
  {
    id: 'a_adv_04',
    name: '多重身份',
    desc: '累计获得 5 个不同称号',
    category: AchievementCategory.ADVANCED,
    tier: AchievementTier.GOLD,
    icon: 'Award',
    condition: (meta) =>
      new Set(meta.unlockedBadges).size >= 5,
    progress: (meta) => ({
      current: Math.min(new Set(meta.unlockedBadges).size, 5),
      target: 5,
    }),
    reward: { careerPoints: 50 },
  },
  {
    id: 'a_adv_05',
    name: '职场锦鲤',
    desc: '累计生涯点数 ≥ 200',
    category: AchievementCategory.ADVANCED,
    tier: AchievementTier.GOLD,
    icon: 'Star',
    condition: (meta) => meta.totalCareerPoints >= 200,
    progress: (meta) => ({
      current: Math.min(meta.totalCareerPoints, 200),
      target: 200,
    }),
    reward: { careerPoints: 30 },
  },
  {
    id: 'a_adv_06',
    name: '全行业通才',
    desc: '解锁全部 6 个行业',
    category: AchievementCategory.ADVANCED,
    tier: AchievementTier.PLATINUM,
    icon: 'Globe',
    condition: (meta) => meta.unlockedIndustries.length >= 6,
    progress: (meta) => ({
      current: Math.min(meta.unlockedIndustries.length, 6),
      target: 6,
    }),
    reward: { careerPoints: 100, badge: '全能王', unlockContent: 'bonus_industry' },
  },

  // ═══════════════════════════════════════════════════
  // 隐藏 (6)
  // ═══════════════════════════════════════════════════
  {
    id: 'a_hid_01',
    name: '死而复生',
    desc: '使用一次复活机会',
    category: AchievementCategory.HIDDEN,
    tier: AchievementTier.SILVER,
    icon: 'Heart',
    isHidden: true,
    condition: (_meta, run) => run?.reviveUsed === true,
    progress: (_meta, run) => ({
      current: run?.reviveUsed ? 1 : 0,
      target: 1,
    }),
    reward: { careerPoints: 20, badge: '不死小强' },
  },
  {
    id: 'a_hid_02',
    name: '996 受害者',
    desc: '累计经历 10 次小周（单休）',
    category: AchievementCategory.HIDDEN,
    tier: AchievementTier.SILVER,
    icon: 'Clock',
    isHidden: true,
    // 依赖新增 meta 字段 smallWeekCount
    condition: (meta: any) => (meta.smallWeekCount ?? 0) >= 10,
    progress: (meta: any) => ({
      current: Math.min(meta.smallWeekCount ?? 0, 10),
      target: 10,
    }),
    reward: { careerPoints: 30, badge: '福报战士' },
  },
  {
    id: 'a_hid_03',
    name: '负翁',
    desc: '单局连续负债 ≥ 3 周',
    category: AchievementCategory.HIDDEN,
    tier: AchievementTier.SILVER,
    icon: 'TrendingDown',
    isHidden: true,
    condition: (_meta, run) => (run?.debtWeeks ?? 0) >= 3,
    progress: (_meta, run) => ({
      current: Math.min(run?.debtWeeks ?? 0, 3),
      target: 3,
    }),
    reward: { careerPoints: 25, badge: '债多不愁' },
  },
  {
    id: 'a_hid_04',
    name: '命悬一线',
    desc: '体力或心智降至 5 以下仍存活 10+ 周',
    category: AchievementCategory.HIDDEN,
    tier: AchievementTier.GOLD,
    icon: 'Activity',
    isHidden: true,
    condition: (_meta, run) =>
      run != null &&
      (run.stamina <= 5 || run.sanity <= 5) &&
      run.week >= 10,
    progress: (_meta, run) => {
      if (!run) return { current: 0, target: 1 };
      const low = run.stamina <= 5 || run.sanity <= 5 ? 1 : 0;
      const weeks = run.week >= 10 ? 1 : 0;
      return { current: low * weeks, target: 1 };
    },
    reward: { careerPoints: 50, badge: '绝境求生' },
  },
  {
    id: 'a_hid_05',
    name: '天命之子',
    desc: '单局运气属性 ≥ 40',
    category: AchievementCategory.HIDDEN,
    tier: AchievementTier.GOLD,
    icon: 'Clover',
    isHidden: true,
    condition: (_meta, run) => (run?.attributes.luck ?? 0) >= 40,
    progress: (_meta, run) => ({
      current: Math.min(run?.attributes.luck ?? 0, 40),
      target: 40,
    }),
    reward: { careerPoints: 60, badge: '天选之人' },
  },
  {
    id: 'a_hid_06',
    name: '大国工匠',
    desc: '地铁车辆行业满级通关（Lv.7 + 52 周）',
    category: AchievementCategory.HIDDEN,
    tier: AchievementTier.PLATINUM,
    icon: 'Factory',
    isHidden: true,
    condition: (meta) =>
      meta.gameHistory.some(
        (r) =>
          r.industry === 'METRO' && r.level >= 7 && r.week >= 52 && r.victory,
      ),
    progress: (meta) => {
      const done = meta.gameHistory.some(
        (r) =>
          r.industry === 'METRO' && r.level >= 7 && r.week >= 52 && r.victory,
      );
      return { current: done ? 1 : 0, target: 1 };
    },
    reward: { careerPoints: 100, badge: '大国工匠', unlockContent: 'metro_secret' },
  },
];

// ── 工具函数 ──────────────────────────────────────────

/** 按分类筛选成就 */
export function getAchievementsByCategory(
  cat: AchievementCategory,
): AchievementConfig[] {
  return ACHIEVEMENTS.filter((a) => a.category === cat);
}

/** 获得所有非隐藏成就 */
export function getVisibleAchievements(): AchievementConfig[] {
  return ACHIEVEMENTS.filter((a) => !a.isHidden);
}
