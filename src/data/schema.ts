// データファイルが共有する型定義。ロジックと UI はここの型だけに依存する。

export type StageId = 'D-' | 'D0' | 'D1' | 'D2' | 'D3' | 'D4' | 'D5';
export type ActiveStageId = Exclude<StageId, 'D-'>;

export type Motive =
  | 'profit'
  | 'tech'
  | 'people'
  | 'org'
  | 'brand'
  | 'spillover'
  | 'society'
  | 'mission';

export type SliderKey = 'capital' | 'patience' | 'techFit' | 'spaceKnow' | 'conviction';
export type Level = 1 | 2 | 3 | 4 | 5;
export type Relevance = 0 | 1 | 2 | 3;
export type Band = 'low' | 'mid' | 'high'; // 表示用の 3 段階

export type BenefitLayer = 'firm' | 'industry' | 'society';
export type BarrierLayer = 'cost' | 'tech' | 'decision';
export type Layer = BenefitLayer | BarrierLayer;

export type BenefitId =
  | 'B1-1' | 'B1-2' | 'B1-3' | 'B1-4' | 'B1-5' | 'B1-6'
  | 'B2-1' | 'B2-2' | 'B2-3' | 'B2-4' | 'B2-5' | 'B2-6'
  | 'B3-1' | 'B3-2' | 'B3-3' | 'B3-4';

export type BarrierId = 'W1-1' | 'W1-2' | 'W2-1' | 'W2-2' | 'W3';
export type BarrierGroup = 'W1' | 'W2' | 'W3';

export interface SimInput {
  current: StageId;
  target: StageId;
  capital: Level; // 資本余力
  patience: Level; // 時間許容度
  techFit: Level; // 技術親和性
  spaceKnow: Level; // 宇宙固有知の保有
  conviction: Level; // 経営層の納得度
  motives: Motive[];
  usePublicFunds: boolean; // 公的支援を活用する前提
  spaceOnlyValue: boolean; // 宇宙でしか実現できない価値がある
}

export interface SimScores {
  benefits: Record<BenefitId, number>;
  barriers: Record<BarrierId, number>;
  gap: number;
}

export interface StageDef {
  id: StageId;
  name: string;
  summary: string;
  examples: string[];
}

export interface Question {
  stage: ActiveStageId;
  current: string; // 「〜している」
  target: string; // 「〜したい」
}

export interface FrameworkItem<Id extends string = string, L extends Layer = Layer> {
  id: Id;
  layer: L;
  name: string;
  tagline: string; // 【儲かる】の中身
  summary: string; // 2〜3文
  examples?: string[];
  related?: string[]; // 関連項目 ID
  loweredBy?: SliderKey[]; // 障壁のみ: この障壁を下げるスライダー
  distinctNature?: boolean; // W3 のみ true（資源で越えられない）
}

export type BenefitItem = FrameworkItem<BenefitId, BenefitLayer>;
export type BarrierItem = FrameworkItem<BarrierId, BarrierLayer>;

export interface PairDef {
  group: BarrierGroup;
  barriers: BarrierId[];
  benefits: BenefitId[];
  description: string;
}

export interface InsightRule {
  id: string;
  priority: number;
  when: (input: SimInput, scores: SimScores) => boolean;
  title: string;
  body: string;
  fallback?: boolean; // 他のどのルールにも該当しないときだけ表示
}
