import type { BarrierId, BenefitId, Motive } from './schema';

// スコアリングの係数。すべてここで編集できる。

// 資源（スライダー）で下げられる割合 k。W3 だけ小さい（資源では越えきれない）。
export const BARRIER_K: Record<BarrierId, number> = {
  'W1-1': 0.8,
  'W1-2': 0.8,
  'W2-1': 0.8,
  'W2-2': 0.8,
  W3: 0.4,
};

// 段数差 1 段あたり障壁に乗じる増分（1 + GAP_FACTOR × gap）
export const GAP_FACTOR = 0.1;

// 「公的支援を活用する前提」が真のとき障壁に乗じる係数
export const PUBLIC_FUNDS_BARRIER: Partial<Record<BarrierId, number>> = {
  'W1-1': 0.6,
  'W1-2': 0.85,
};

// 「公的支援を活用する前提」が真のとき便益に乗じる係数（踏み台: 希少性は薄れる）
export const PUBLIC_FUNDS_BENEFIT: Partial<Record<BenefitId, number>> = {
  'B2-2': 1.3,
  'B1-5': 0.85,
};

// 「宇宙でしか実現できない価値がある」が真のとき障壁に乗じる係数
export const SPACE_ONLY_BARRIER: Partial<Record<BarrierId, number>> = {
  W3: 0.5,
};

// 「宇宙でしか実現できない価値がある」が真のとき便益に乗じる係数
export const SPACE_ONLY_BENEFIT: Partial<Record<BenefitId, number>> = {
  'B2-6': 1.3,
  'B3-4': 1.3,
};

// 動機に対応する便益に乗じる係数
export const MOTIVE_FACTOR = 1.25;

// 動機 → 便益の対応
export const MOTIVE_BENEFITS: Record<Motive, BenefitId[]> = {
  profit: ['B1-1'],
  tech: ['B1-2'],
  people: ['B1-3'],
  org: ['B1-4'],
  brand: ['B1-5'],
  spillover: ['B1-6'],
  society: ['B3-1', 'B3-2', 'B3-3'],
  mission: ['B3-4'],
};

// 希少性係数: 裏側の障壁スコアが 100 のとき便益に乗じる増分（1 + SCARCITY_FACTOR × W/100）
export const SCARCITY_FACTOR = 0.3;

// スコアの上限
export const SCORE_MAX = 100;

// 便益の基礎点の尺度。関連度 3 のとき 100 × BENEFIT_BASE_SCALE 点を基礎とし、
// 動機・希少性・トグルの係数で 100 まで伸びる余地を残す（1.0 にすると関連度 3 は常に上限に張り付く）。
export const BENEFIT_BASE_SCALE = 0.75;
