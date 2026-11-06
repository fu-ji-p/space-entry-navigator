import { describe, expect, it } from 'vitest';
import type { SimInput } from '../src/data/schema';
import { DEFAULT_INPUT } from '../src/logic/score';
import { buildHash, buildShareUrl, decodeInput, encodeInput, parseHash } from '../src/logic/urlState';

const sample: SimInput = {
  current: 'D1',
  target: 'D4',
  capital: 2,
  patience: 4,
  techFit: 5,
  spaceKnow: 1,
  conviction: 3,
  motives: ['tech', 'mission'],
  usePublicFunds: true,
  spaceOnlyValue: false,
};

describe('urlState', () => {
  it('符号化と復号が往復で一致する', () => {
    expect(decodeInput(encodeInput(sample))).toEqual(sample);
    expect(decodeInput(encodeInput(DEFAULT_INPUT))).toEqual(DEFAULT_INPUT);
  });

  it('符号化結果は base64url（URL に安全）', () => {
    expect(encodeInput(sample)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('壊れた文字列は null（初期値で開く）', () => {
    expect(decodeInput('%%%')).toBeNull();
    expect(decodeInput('')).toBeNull();
    expect(decodeInput(null)).toBeNull();
    expect(decodeInput(btoa('"string"'))).toBeNull();
  });

  it('不正な値は初期値で補う', () => {
    const bad = btoa(JSON.stringify({ c: 'D9', t: 'D2', k: 9, m: ['tech', 'bogus'], u: 1 }));
    const decoded = decodeInput(bad)!;
    expect(decoded.current).toBe('D-');
    expect(decoded.target).toBe('D2');
    expect(decoded.capital).toBe(3);
    expect(decoded.motives).toEqual(['tech']);
    expect(decoded.usePublicFunds).toBe(true);
    expect(decoded.spaceOnlyValue).toBe(false);
  });

  it('ハッシュの組み立てと解析が往復する', () => {
    const hash = buildHash('simulate', sample);
    expect(hash.startsWith('#simulate?s=')).toBe(true);
    const parsed = parseHash(hash);
    expect(parsed.route).toBe('simulate');
    expect(parsed.input).toEqual(sample);
  });

  it('初期値のときは s を省略し、ルートだけになる', () => {
    expect(buildHash('explore', DEFAULT_INPUT)).toBe('#explore');
    expect(buildHash('explore', DEFAULT_INPUT, 'D3')).toBe('#explore?d=D3');
    expect(parseHash('#explore?d=D3').stageFilter).toBe('D3');
  });

  it('不明なルートは home、状態なしは null', () => {
    const parsed = parseHash('#nowhere');
    expect(parsed.route).toBe('home');
    expect(parsed.input).toBeNull();
    expect(parseHash('').route).toBe('home');
  });

  it('共有 URL はハッシュに状態を含む', () => {
    const url = buildShareUrl(sample, 'simulate', 'https://example.test/app/');
    expect(url.startsWith('https://example.test/app/#simulate?s=')).toBe(true);
    expect(parseHash(url.slice(url.indexOf('#'))).input).toEqual(sample);
  });
});
