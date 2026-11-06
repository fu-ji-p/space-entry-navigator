import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BENEFITS } from '../data/benefits';
import { ja } from '../data/ja';
import { LAYERS } from '../data/layers';
import type { BenefitId, SimInput, SimScores } from '../data/schema';
import { usePrefersDark } from '../hooks';
import { bandLevel, toBand } from '../logic/band';
import { motiveBenefitIds } from '../logic/score';
import { AccessibleBar, LayerLegend, LEVEL_TICKS, levelTickLabel, SrTable, TickLabel, type ChartRow } from './charts';

interface Props {
  input: SimInput;
  scores: SimScores;
  onSelect?: (id: BenefitId) => void;
}

export default function BenefitChart({ input, scores, onSelect }: Props) {
  const dark = usePrefersDark();
  const highlight = motiveBenefitIds(input);
  const anyMotive = input.motives.length > 0;
  const rows: ChartRow[] = useMemo(
    () =>
      BENEFITS.map((b) => ({
        id: b.id,
        name: b.name,
        tagline: b.tagline,
        layer: b.layer,
        band: toBand(scores.benefits[b.id]),
        level: bandLevel(scores.benefits[b.id]),
        highlighted: anyMotive ? highlight.has(b.id) : undefined,
      })),
    [scores, anyMotive, highlight],
  );
  const height = rows.length * 26 + 30;

  return (
    <div>
      <LayerLegend layers={['firm', 'industry', 'society']} />
      <div style={{ height }} className="mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 4 }} barCategoryGap={4}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke={dark ? '#374151' : '#e5e7eb'} />
            <XAxis
              type="number"
              domain={[0, 3]}
              ticks={LEVEL_TICKS}
              tickFormatter={levelTickLabel}
              tick={{ fontSize: 12, fill: dark ? '#9ca3af' : '#6b7280' }}
            />
            <YAxis
              type="category"
              dataKey="id"
              width={104}
              interval={0}
              tickLine={false}
              axisLine={false}
              tick={<TickLabel rows={rows} />}
            />
            <Tooltip
              cursor={{ fill: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
              contentStyle={{
                background: dark ? '#111827' : '#fff',
                border: `1px solid ${dark ? '#374151' : '#e5e7eb'}`,
                borderRadius: 6,
                fontSize: 12,
              }}
              formatter={(value: number) => [levelTickLabel(value), ja.simulate.scoreLabel]}
              labelFormatter={(id: string) => {
                const r = rows.find((x) => x.id === id);
                return r ? `${r.id} 【${r.tagline}】${r.name}` : id;
              }}
            />
            <Bar
              dataKey="level"
              shape={<AccessibleBar />}
              isAnimationActive={false}
              onClick={(d: { id?: BenefitId }) => d?.id && onSelect?.(d.id)}
              cursor={onSelect ? 'pointer' : undefined}
            >
              {rows.map((r) => (
                <Cell key={r.id} fill={dark ? LAYERS[r.layer].colorDark : LAYERS[r.layer].color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <SrTable caption={ja.chart.tableCaptionBenefit} rows={rows} />
    </div>
  );
}
