import type { InsightRule } from './schema';
import { atLeast } from '../logic/band';

// 考察ルール。条件を満たしたものを優先度順に最大 MAX_INSIGHTS 件表示する。
// 条件はスコアの段階（低・中・高）で書く。閾値は bands.ts にある。
// 本文は論文の考察を平易に言い換えたもので、自由に編集してよい。
export const MAX_INSIGHTS = 5;

export const INSIGHT_RULES: InsightRule[] = [
  {
    id: 'unknown-high',
    priority: 1,
    when: (_i, s) => atLeast(s.barriers.W3, 'high'),
    title: '最大の壁は「腹落ち」かもしれません',
    body:
      '最大の壁は資金でも技術でもなく、「なぜ我が社が宇宙か」が腹落ちしないことになり得ます。この壁は資源を足しても下がりにくい性質を持ちます。宇宙に取り組む理由を社内の言葉で言えるかどうかが分かれ目になりやすいところです。',
  },
  {
    id: 'mission-driven',
    priority: 2,
    when: (i, s) => i.motives.includes('mission') && atLeast(s.barriers.W3, 'mid'),
    title: '使命感で決める参入は、撤退理由が見えにくくなります',
    body:
      '合理性より使命感で決めた参入は、撤退する理由が見えにくくなります。続ける力になる一方で、引き際の判断を難しくもします。それは強みにも弱みにもなり得ます。',
  },
  {
    id: 'space-only',
    priority: 3,
    when: (i) => i.spaceOnlyValue,
    title: '宇宙が目的ではなく手段になります',
    body:
      '宇宙でしか解けない課題があるなら、宇宙は目的ではなく手段になります。このとき参画は「するかどうか」ではなく「いつか」の問いに変わり得ます。',
  },
  {
    id: 'scarcity',
    priority: 4,
    when: (i, s) => !i.usePublicFunds && atLeast(s.barriers['W1-1'], 'high'),
    title: '高いコストの壁の先には、競合が少ないかもしれません',
    body:
      'コストの壁が高いほど、その先にいる企業は少なくなります。越えたこと自体が「知られる」便益になり得ます。壁の高さは、裏返せば希少性です。',
  },
  {
    id: 'stepping-stone',
    priority: 5,
    when: (i) => i.usePublicFunds,
    title: '公的資金は壁を壊すのではなく、踏み台をつくります',
    body:
      '公的資金はコストの壁を低くしますが、資金が行き渡ると越えた先の希少性は薄れやすくなります。公的資金を踏み台に、早く壁を越える設計が要るかもしれません。',
  },
  {
    id: 'tech-growth',
    priority: 6,
    when: (i, s) => atLeast(s.barriers['W2-1'], 'mid') && (i.motives.includes('tech') || i.motives.includes('org')),
    title: '技術の壁に挑む過程で、独自性の高い能力が育ちます',
    body:
      '技術の壁に挑む過程で、他産業とは異なる側面の技術力・組織力が育ち得ます。挑む企業が少ないほど、優劣ではなく独自性の高い能力になりやすいところです。',
  },
  {
    id: 'efficiency-only',
    priority: 7,
    when: (i) => i.target === 'D1',
    title: '業務効率化が中心になり、定量化しにくくなります',
    body:
      '宇宙を外部インフラとして使う段階では、便益は業務効率化が中心で、定量化しにくい傾向があります。それでも組織の技術探索力は高まり得ます。次の一歩を描くかどうかを、あらかじめ決めておくとよいかもしれません。',
  },
  {
    id: 'big-leap',
    priority: 8,
    when: (_i, s) => s.gap >= 3,
    title: '一足飛びは、複数の壁が同時に立ちやすくなります',
    body:
      '現在地から離れた類型を目指すと、時間・知・機会の壁が同時に立ちやすくなります。中間の類型を経由する道筋も検討に値します。類型に優劣はなく、目的地までの道の描き方の問題です。',
  },
  {
    id: 'spillover-focus',
    priority: 9,
    when: (i) => i.motives.includes('spillover') && i.target === 'D5',
    title: '専業化すると、環流先の本業がなくなります',
    body:
      '宇宙専業になると、技術や知見を環流させる先の本業がなくなります。本業への環流を狙うなら、宇宙機能組込型からサプライチェーン参入型（D2〜D4）の方が整合的かもしれません。',
  },
  {
    id: 'low-conviction',
    priority: 10,
    when: (i) => i.conviction <= 2,
    title: '納得度が低いままでは、意思決定で止まりやすくなります',
    body:
      '経営層の納得度が低いまま進めると、他の壁を越えても意思決定のところで止まりやすくなります。まず「なぜ我が社か」を言語化するところから始めるとよいかもしれません。',
  },
  {
    id: 'cluster',
    priority: 11,
    when: (i) => i.target === 'D4' || i.target === 'D5',
    title: '地域クラスターの近さで、参入ハードルが変わります',
    body:
      '宇宙産業へ供給する側に回る場合、地域クラスターに近いかどうかで参入ハードルが変わり得ます。個社ではなく地域で取り組む選択肢を確認しておく価値があります。',
  },
  {
    id: 'balanced',
    priority: 12,
    fallback: true,
    when: () => true,
    title: '便益と障壁は表裏です',
    body:
      '便益と障壁は表と裏の関係にあります。障壁が低く見える類型は、便益も小さくなりやすいところです。どの壁を越える覚悟があるかが、どの便益を狙えるかを決めます。',
  },
];
