import type { ActiveStageId, BarrierId, BenefitId, Relevance, StageId } from './schema';

type Row = Record<ActiveStageId, Relevance>;

const row = (d0: Relevance, d1: Relevance, d2: Relevance, d3: Relevance, d4: Relevance, d5: Relevance): Row => ({
  D0: d0,
  D1: d1,
  D2: d2,
  D3: d3,
  D4: d4,
  D5: d5,
});

// 類型×便益 関連度（0〜3）。列は D0, D1, D2, D3, D4, D5 の順。
export const BENEFIT_RELEVANCE: Record<BenefitId, Row> = {
  'B1-1': row(2, 1, 2, 3, 3, 3),
  'B1-2': row(0, 1, 2, 2, 3, 3),
  'B1-3': row(1, 1, 2, 2, 3, 3),
  'B1-4': row(1, 1, 2, 2, 3, 3),
  'B1-5': row(2, 1, 2, 2, 3, 3),
  'B1-6': row(1, 1, 2, 2, 3, 2),
  'B2-1': row(2, 1, 2, 3, 3, 3),
  'B2-2': row(2, 1, 1, 2, 3, 3),
  'B2-3': row(1, 1, 1, 2, 3, 3),
  'B2-4': row(1, 0, 1, 3, 2, 3),
  'B2-5': row(1, 0, 1, 1, 3, 2),
  'B2-6': row(1, 0, 1, 3, 2, 3),
  'B3-1': row(1, 2, 2, 3, 1, 2),
  'B3-2': row(1, 1, 2, 2, 3, 3),
  'B3-3': row(1, 0, 1, 1, 2, 3),
  'B3-4': row(1, 0, 1, 2, 2, 3),
};

// 類型×障壁 基礎障壁（0〜3）。列は D0, D1, D2, D3, D4, D5 の順。
export const BARRIER_BASE: Record<BarrierId, Row> = {
  'W1-1': row(2, 1, 2, 2, 3, 3),
  'W1-2': row(1, 1, 2, 2, 3, 3),
  'W2-1': row(1, 1, 2, 2, 3, 3),
  'W2-2': row(0, 1, 1, 2, 3, 3),
  W3: row(1, 1, 2, 3, 3, 3),
};

// D-（未関与）はすべて 0。目標類型にのみ使う。
export function benefitRelevance(id: BenefitId, stage: StageId): Relevance {
  return stage === 'D-' ? 0 : BENEFIT_RELEVANCE[id][stage];
}

export function barrierBase(id: BarrierId, stage: StageId): Relevance {
  return stage === 'D-' ? 0 : BARRIER_BASE[id][stage];
}
