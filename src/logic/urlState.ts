import type { Level, Motive, SimInput, StageId } from '../data/schema';
import { DEFAULT_INPUT } from './score';

export type Route = 'home' | 'diagnose' | 'simulate' | 'explore' | 'report';
export const ROUTES: Route[] = ['home', 'diagnose', 'simulate', 'explore', 'report'];

const STAGES: StageId[] = ['D-', 'D0', 'D1', 'D2', 'D3', 'D4', 'D5'];
const MOTIVES: Motive[] = ['profit', 'tech', 'people', 'org', 'brand', 'spillover', 'society', 'mission'];

// 短縮キー: c=current, t=target, k=capital, p=patience, f=techFit, s=spaceKnow, v=conviction,
//           m=motives, u=usePublicFunds, o=spaceOnlyValue
interface Compact {
  c: StageId;
  t: StageId;
  k: Level;
  p: Level;
  f: Level;
  s: Level;
  v: Level;
  m: Motive[];
  u: 0 | 1;
  o: 0 | 1;
}

function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): string {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeInput(input: SimInput): string {
  const compact: Compact = {
    c: input.current,
    t: input.target,
    k: input.capital,
    p: input.patience,
    f: input.techFit,
    s: input.spaceKnow,
    v: input.conviction,
    m: input.motives,
    u: input.usePublicFunds ? 1 : 0,
    o: input.spaceOnlyValue ? 1 : 0,
  };
  return toBase64Url(JSON.stringify(compact));
}

const isStage = (v: unknown): v is StageId => typeof v === 'string' && (STAGES as string[]).includes(v);
const isLevel = (v: unknown): v is Level => typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5;
const isMotive = (v: unknown): v is Motive => typeof v === 'string' && (MOTIVES as string[]).includes(v);

/** 復号。失敗したら null（呼び出し側は初期値で開く）。欠けたキーは初期値で補う。 */
export function decodeInput(encoded: string | null | undefined): SimInput | null {
  if (!encoded) return null;
  try {
    const raw: unknown = JSON.parse(fromBase64Url(encoded));
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Partial<Record<keyof Compact, unknown>>;
    const level = (v: unknown, d: Level): Level => (isLevel(v) ? v : d);
    const motives = Array.isArray(r.m) ? (r.m.filter(isMotive) as Motive[]) : DEFAULT_INPUT.motives;
    return {
      current: isStage(r.c) ? r.c : DEFAULT_INPUT.current,
      target: isStage(r.t) ? r.t : DEFAULT_INPUT.target,
      capital: level(r.k, DEFAULT_INPUT.capital),
      patience: level(r.p, DEFAULT_INPUT.patience),
      techFit: level(r.f, DEFAULT_INPUT.techFit),
      spaceKnow: level(r.s, DEFAULT_INPUT.spaceKnow),
      conviction: level(r.v, DEFAULT_INPUT.conviction),
      motives: Array.from(new Set(motives)),
      usePublicFunds: r.u === 1 || r.u === true,
      spaceOnlyValue: r.o === 1 || r.o === true,
    };
  } catch {
    return null;
  }
}

export interface HashState {
  route: Route;
  input: SimInput | null; // null = ハッシュに状態なし
  stageFilter: StageId | null; // 探索画面の絞り込み
}

/** `#simulate?s=...&d=D3` 形式のハッシュを解析する。不明なルートは home。 */
export function parseHash(hash: string): HashState {
  const h = hash.startsWith('#') ? hash.slice(1) : hash;
  const [path, query = ''] = h.split('?', 2);
  const route = (ROUTES as string[]).includes(path) ? (path as Route) : 'home';
  const params = new URLSearchParams(query);
  const input = decodeInput(params.get('s'));
  const d = params.get('d');
  return { route, input, stageFilter: isStage(d) ? d : null };
}

export function inputEquals(a: SimInput, b: SimInput): boolean {
  return encodeInput(a) === encodeInput(b);
}

/** ハッシュ文字列を組み立てる。入力が初期値と同じなら s を省く。 */
export function buildHash(route: Route, input: SimInput, stageFilter: StageId | null = null): string {
  const params = new URLSearchParams();
  if (!inputEquals(input, DEFAULT_INPUT)) params.set('s', encodeInput(input));
  if (stageFilter) params.set('d', stageFilter);
  const q = params.toString();
  return `#${route}${q ? `?${q}` : ''}`;
}

/** 共有 URL（現在のオリジン＋パス＋ハッシュ） */
export function buildShareUrl(input: SimInput, route: Route = 'simulate', baseUrl?: string): string {
  const base = baseUrl ?? (typeof window !== 'undefined' ? window.location.href.split('#')[0] : '');
  const params = new URLSearchParams({ s: encodeInput(input) });
  return `${base}#${route}?${params.toString()}`;
}
