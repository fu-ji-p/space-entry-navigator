import { useEffect, useState } from 'react';

/** 一定時間だけ true になるフラグ（「コピーしました」表示用） */
export function useFlash(ms = 1800): [string | null, (msg: string) => void] {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (msg === null) return;
    const t = window.setTimeout(() => setMsg(null), ms);
    return () => window.clearTimeout(t);
  }, [msg, ms]);
  return [msg, setMsg];
}
