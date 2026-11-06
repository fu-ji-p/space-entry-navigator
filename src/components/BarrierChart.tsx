import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BARRIERS } from '../data/barriers';
import { ja } from '../data/ja';
import { LAYERS } from '../data/layers';
import type { BarrierId, SimScores } from '../data/schema';
import { usePrefersDark } from '../hooks';
import { AccessibleBar, SrTable, TickLabel, type ChartRow } from './charts';

interface Props {
  scores: SimScores;
  onSelect?: (id: BarrierId) => void;
}

export default function BarrierChart({ scores, onSelect }: Props) {
  const dark = usePrefersDark();
  const rows: ChartRow[] = useMemo(
    () =>
      BARRIERS.map((w) => ({
        id: w.id,
        name: w.name,
        tagline: w.tagline,
        layer: w.layer,
        score: scores.barriers[w.id],
        distinct: w.distinctNature,
      })),
    [scores],
  );
  const height = rows.length * 34 + 30;

  return (
    <div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="凡例">
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
      <div style={{ height }} className="mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 4 }} barCategoryGap={6}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke={dark ? '#374151' : '#e5e7eb'} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: dark ? '#9ca3af' : '#6b7280' }} />
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
              formatter={(value: number) => [Math.round(value), ja.simulate.scoreLabel]}
              labelFormatter={(id: string) => {
                const r = rows.find((x) => x.id === id);
                return r ? `${r.id} 【${r.tagline}】${r.name}` : id;
              }}
            />
            <Bar
              dataKey="score"
              shape={<AccessibleBar />}
              isAnimationActive={false}
              onClick={(d: { id?: BarrierId }) => d?.id && onSelect?.(d.id)}
              cursor={onSelect ? 'pointer' : undefined}
            >
              {rows.map((r) => (
                <Cell key={r.id} fill={dark ? LAYERS[r.layer].colorDark : LAYERS[r.layer].color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <SrTable caption={ja.chart.tableCaptionBarrier} rows={rows} />
    </div>
  );
}
