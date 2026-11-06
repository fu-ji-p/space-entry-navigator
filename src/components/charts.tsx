import { BANDS, BAND_LEVEL } from '../data/bands';
import { ja } from '../data/ja';
import { LAYERS } from '../data/layers';
import type { Band, Layer } from '../data/schema';

export interface ChartRow {
  id: string;
  name: string;
  tagline: string;
  layer: Layer;
  band: Band; // 表示用の段階
  level: 1 | 2 | 3; // 棒の長さ（段階の序数）
  highlighted?: boolean;
  distinct?: boolean;
}

export const LEVEL_TICKS = BANDS.map((b) => BAND_LEVEL[b]);
export const levelTickLabel = (level: number): string => {
  const band = BANDS.find((b) => BAND_LEVEL[b] === level);
  return band ? ja.bands[band] : '';
};

/** チャート直下に置く同内容の表（スクリーンリーダー用） */
export function SrTable({ caption, rows }: { caption: string; rows: ChartRow[] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{ja.chart.colId}</th>
          <th scope="col">{ja.chart.colName}</th>
          <th scope="col">{ja.chart.colLayer}</th>
          <th scope="col">{ja.chart.colScore}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.id}</td>
            <td>
              【{r.tagline}】{r.name}
              {r.highlighted ? `（${ja.simulate.motiveMatch}）` : ''}
            </td>
            <td>{LAYERS[r.layer].label}</td>
            <td>{ja.bands[r.band]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Recharts の Bar に渡す形状。棒ごとに aria-label を付ける。 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AccessibleBar(props: any) {
  const { x, y, width, height, fill, payload } = props as {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    payload: ChartRow;
  };
  const w = Math.max(0, width);
  const label = ja.chart.ariaBar(payload.name, payload.tagline, ja.bands[payload.band]);
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={height}
        fill={fill}
        fillOpacity={payload.distinct ? 0.45 : 1}
        rx={3}
        role="img"
        aria-label={label}
        style={{ transition: 'width 300ms ease, opacity 200ms ease' }}
        stroke={payload.highlighted ? '#111827' : payload.distinct ? fill : 'none'}
        strokeWidth={payload.highlighted || payload.distinct ? 2 : 0}
        strokeDasharray={payload.distinct && !payload.highlighted ? '6 3' : undefined}
        opacity={payload.highlighted === false ? 0.55 : 1}
      />
    </g>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TickLabel(props: any) {
  const { x, y, payload, rows } = props as { x: number; y: number; payload: { value: string }; rows: ChartRow[] };
  const row = rows.find((r) => r.id === payload.value);
  if (!row) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-4} y={0} dy={4} textAnchor="end" className="fill-gray-900 dark:fill-gray-100" fontSize={12}>
        <tspan fontWeight={row.highlighted ? 700 : 500}>{row.tagline}</tspan>
      </text>
    </g>
  );
}

export function LayerLegend({ layers }: { layers: Layer[] }) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs" aria-label="凡例">
      {layers.map((l) => (
        <li key={l} className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: LAYERS[l].color }} aria-hidden="true" />
          {LAYERS[l].label}
        </li>
      ))}
    </ul>
  );
}
