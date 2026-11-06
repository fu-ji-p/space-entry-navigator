import type { PairDef } from './schema';

// 便益⇔障壁の対応（「表と裏の関係」）。探索画面の対応図と希少性係数で使う。
export const PAIRS: PairDef[] = [
  {
    group: 'W1',
    barriers: ['W1-1', 'W1-2'],
    benefits: ['B1-5'],
    description: 'コストの壁は高いぶん越えた者が少なく、到達した企業は目立ちます。越えたこと自体が競争優位になり得ます。',
  },
  {
    group: 'W2',
    barriers: ['W2-1', 'W2-2'],
    benefits: ['B1-2', 'B1-4', 'B1-3'],
    description: '技術の壁に挑む過程で、他産業とは異なる側面の技術力・組織力が高まり、専門家が育ちます。挑む企業が少ないため、優劣ではなく独自性の高い能力が身につきます。',
  },
  {
    group: 'W3',
    barriers: ['W3'],
    benefits: ['B3-4', 'B2-4'],
    description: '合理性ではなく、使命感や無邪気さで参入の意思決定がなされることがあります。このとき撤退する理由は見えなくなります。それは強みにも弱みにもなり得ます。',
  },
];
