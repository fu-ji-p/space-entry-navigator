import { useMemo } from 'react';
import { BENEFITS } from '../data/benefits';
import { ja } from '../data/ja';
import type { BenefitId, SimInput, SimScores } from '../data/schema';
import { toBand } from '../logic/band';
import { motiveBenefitIds } from '../logic/score';
import RatingList, { LayerLegend, type RatingRow } from './RatingList';

interface Props {
  input: SimInput;
  scores: SimScores;
  onSelect?: (id: BenefitId) => void;
}

/** 期待できる便益を ★ の 3 段階で一覧表示する */
export default function BenefitChart({ input, scores, onSelect }: Props) {
  const highlight = motiveBenefitIds(input);
  const anyMotive = input.motives.length > 0;
  const rows: RatingRow[] = useMemo(
    () =>
      BENEFITS.map((b) => ({
        id: b.id,
        name: b.name,
        tagline: b.tagline,
        layer: b.layer,
        band: toBand(scores.benefits[b.id]),
        highlighted: anyMotive ? highlight.has(b.id) : undefined,
      })),
    [scores, anyMotive, highlight],
  );

  return (
    <div>
      <LayerLegend layers={['firm', 'industry', 'society']} note={ja.rating.benefitLegend} />
      <div className="mt-1">
        <RatingList kind="benefit" rows={rows} onSelect={onSelect ? (id) => onSelect(id as BenefitId) : undefined} />
      </div>
    </div>
  );
}
