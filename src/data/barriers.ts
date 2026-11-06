import type { BarrierItem } from './schema';

// 障壁 W（3層5項目）。loweredBy はその障壁を下げる自社状況スライダー。
// W3 だけが distinctNature: true（資源では越えきれない、性質の異なる障壁）。
export const BARRIERS: BarrierItem[] = [
  {
    id: 'W1-1',
    layer: 'cost',
    name: '資本の障壁',
    tagline: '初期投資が大きい',
    summary:
      '宇宙産業は初期投資が大きいことが多く、他産業と比べてコストが高くなりがちです。政策資金・公的需要による市場形成（B2-2）は、これを補うための政府施策の側面も大きいものです。',
    loweredBy: ['capital'],
    related: ['B2-2', 'B1-5'],
  },
  {
    id: 'W1-2',
    layer: 'cost',
    name: '時間の障壁',
    tagline: '時間がかかる',
    summary:
      '開発から事業化までのリードタイムが長く、軌道上実証を必要とする新技術は実証機会や打上げ機会が少ないことも課題です。既存事業と時間感覚が合わず、既存の意思決定プロセスに乗らないこともあります。',
    loweredBy: ['patience'],
    related: ['W2-2', 'B1-5'],
  },
  {
    id: 'W2-1',
    layer: 'tech',
    name: '知の障壁',
    tagline: '勝手が違う',
    summary:
      '求められる技術分野は他産業と重なる部分がありますが、技術の優劣ではなく、考慮すべき観点が固有です。宇宙環境に耐える設計、模擬試験のノウハウ、輸送機会の確保に加え、許認可制度や国際調整など、地上産業にはない固有の知が求められます。',
    loweredBy: ['techFit', 'spaceKnow'],
    related: ['B1-2', 'B1-4', 'B1-3', 'B2-1'],
  },
  {
    id: 'W2-2',
    layer: 'tech',
    name: '機会の障壁',
    tagline: 'タイミングがある',
    summary:
      '地上試験、打上げ、通信などは、いつでもどこでも実施できるものではなく、タイミングが合わなければ待ち時間が生じます。火星と地球の距離が約 2 年 2 か月ごとに最短になるように、機会そのものが限られる場合があります。',
    loweredBy: ['spaceKnow'],
    related: ['W1-2'],
  },
  {
    id: 'W3',
    layer: 'decision',
    name: '未知の障壁',
    tagline: '腹落ちしない',
    summary:
      'ここまでの障壁が合わさり、「なぜ我が社が宇宙に取り組むのか」について納得感のある共通理解を築けず、意思決定が容易ではなくなります。宇宙産業は不確実性が特に高く、合理的な判断が難しい領域です。資源を投じれば越えられるコストや技術の障壁とはレイヤーが異なります。',
    loweredBy: ['conviction'],
    distinctNature: true,
    related: ['B3-4', 'B2-4', 'B2-6'],
  },
];

export const BARRIER_BY_ID = Object.fromEntries(BARRIERS.map((w) => [w.id, w])) as Record<
  BarrierItem['id'],
  BarrierItem
>;
