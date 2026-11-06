import { useMemo } from 'react';
import { BARRIERS } from '../data/barriers';
import { ja } from '../data/ja';
import { LAYERS } from '../data/layers';
import type { BarrierId, SimScores } from '../data/schema';
import { toBand } from '../logic/band';
import RatingList, { type RatingRow } from './RatingList';

interface Props {
  scores: SimScores;
  onSelect?: (id: BarrierId) => void;
}

/** 越えるべき障壁を ▲ の 3 段階で一覧表示する */
export default function BarrierChart({ scores, onSelect }: Props) {
  const rows: RatingRow[] = useMemo(
    () =>
      BARRIERS.map((w) => ({
        id: w.id,
        name: w.name,
        tagline: w.tagline,
        layer: w.layer,
        band: toBand(scores.barriers[w.id]),
        distinct: w.distinctNature,
      })),
    [scores],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label={ja.a11y.legend}>
          <li className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: LAYERS.cost.color }} aria-hidden="true" />
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: LAYERS.tech.color }} aria-hidden="true" />
            {ja.simulate.barrierResourceNote}（{LAYERS.cost.label}・{LAYERS.tech.label}）
          </li>
          <li className="flex items-center gap-1">
            <span
              className="inline-block h-3 w-3 rounded-sm border-2 border-dashed"
              style={{ borderColor: LAYERS.decision.color, backgroundColor: `${LAYERS.decision.color}33` }}
              aria-hidden="true"
            />
            {ja.simulate.barrierDistinctNote}（{LAYERS.decision.label}）
          </li>
        </ul>
        <span className="text-gray-600 dark:text-gray-400">{ja.rating.barrierLegend}</span>
      </div>
      <div className="mt-1">
        <RatingList kind="barrier" rows={rows} onSelect={onSelect ? (id) => onSelect(id as BarrierId) : undefined} />
      </div>
    </div>
  );
}
