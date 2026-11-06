import type { Layer } from './schema';

// 層ごとの表示情報。色の意味は固定: 企業=青、産業=緑、社会=橙、コスト=灰、技術=紫、意思決定(W3)=赤。
export interface LayerMeta {
  id: Layer;
  label: string;
  kind: 'benefit' | 'barrier';
  color: string; // チャートの棒色（ライト）
  colorDark: string; // チャートの棒色（ダーク）
  badgeClass: string; // Tailwind クラス（ラベル用）
}

export const LAYERS: Record<Layer, LayerMeta> = {
  firm: {
    id: 'firm',
    label: '企業',
    kind: 'benefit',
    color: '#2563eb',
    colorDark: '#60a5fa',
    badgeClass: 'bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100',
  },
  industry: {
    id: 'industry',
    label: '産業',
    kind: 'benefit',
    color: '#059669',
    colorDark: '#34d399',
    badgeClass: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100',
  },
  society: {
    id: 'society',
    label: '社会',
    kind: 'benefit',
    color: '#ea580c',
    colorDark: '#fb923c',
    badgeClass: 'bg-orange-100 text-orange-900 dark:bg-orange-900/50 dark:text-orange-100',
  },
  cost: {
    id: 'cost',
    label: 'コスト',
    kind: 'barrier',
    color: '#6b7280',
    colorDark: '#9ca3af',
    badgeClass: 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
  },
  tech: {
    id: 'tech',
    label: '技術',
    kind: 'barrier',
    color: '#7c3aed',
    colorDark: '#a78bfa',
    badgeClass: 'bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100',
  },
  decision: {
    id: 'decision',
    label: '意思決定',
    kind: 'barrier',
    color: '#dc2626',
    colorDark: '#f87171',
    badgeClass: 'bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-100',
  },
};
