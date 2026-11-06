import { useCallback, useEffect, useMemo, useState } from 'react';
import { ATTRIBUTION_TEXT } from './config/attribution';
import { ja } from './data/ja';
import type { SimInput, StageId } from './data/schema';
import { DEFAULT_INPUT } from './logic/score';
import { buildHash, parseHash, ROUTES, type Route } from './logic/urlState';
import Home from './pages/Home';
import Diagnose from './pages/Diagnose';
import Simulate from './pages/Simulate';
import Explore from './pages/Explore';
import Report from './pages/Report';

export type Answers = (boolean | null)[];
const emptyAnswers = (): Answers => [null, null, null, null, null, null];

export default function App() {
  const initial = useMemo(() => parseHash(window.location.hash), []);
  const [route, setRoute] = useState<Route>(initial.route);
  const [input, setInput] = useState<SimInput>(initial.input ?? DEFAULT_INPUT);
  const [stageFilter, setStageFilter] = useState<StageId | null>(initial.stageFilter);
  const [currentAnswers, setCurrentAnswers] = useState<Answers>(emptyAnswers);
  const [targetAnswers, setTargetAnswers] = useState<Answers>(emptyAnswers);

  // ハッシュ → 状態（戻る/進む、共有 URL を開いたとき）
  useEffect(() => {
    const onHash = () => {
      const hs = parseHash(window.location.hash);
      setRoute((prev) => {
        if (prev !== hs.route) window.scrollTo({ top: 0 });
        return hs.route;
      });
      if (hs.input) setInput(hs.input);
      setStageFilter(hs.stageFilter);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // 状態 → ハッシュ（履歴を増やさず置き換える）
  useEffect(() => {
    const h = buildHash(route, input, stageFilter);
    if (window.location.hash !== h) window.history.replaceState(null, '', h);
  }, [route, input, stageFilter]);

  const hrefFor = useCallback(
    (r: Route) => buildHash(r, input, r === 'explore' ? stageFilter : null),
    [input, stageFilter],
  );
  const navigate = useCallback(
    (r: Route, next?: SimInput) => {
      const i = next ?? input;
      if (next) setInput(next);
      setRoute(r);
      window.history.pushState(null, '', buildHash(r, i, r === 'explore' ? stageFilter : null));
      window.scrollTo({ top: 0 });
    },
    [input, stageFilter],
  );

  useEffect(() => {
    document.title = `${ja.nav[route]} | ${ja.app.title}`;
  }, [route]);

  const showFooterDisclaimer = route === 'diagnose' || route === 'explore';
  const showFooterAttribution = route === 'diagnose' || route === 'explore' || route === 'simulate';

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:rounded"
      >
        {ja.a11y.skipToMain}
      </a>
      <header className="no-print border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <a href={hrefFor('home')} className="font-bold text-base sm:text-lg tracking-tight">
            {ja.app.title}
          </a>
          <nav aria-label={ja.a11y.mainNav} className="flex gap-1 overflow-x-auto -mx-1 px-1 w-full sm:w-auto sm:ml-auto">
            {ROUTES.map((r) => {
              const active = r === route;
              return (
                <a
                  key={r}
                  href={hrefFor(r)}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap rounded-md px-2 py-1.5 text-xs sm:px-3 sm:text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-600 text-white dark:bg-blue-500'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  {ja.nav[r]}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        {route === 'home' && <Home navigate={navigate} />}
        {route === 'diagnose' && (
          <Diagnose
            currentAnswers={currentAnswers}
            targetAnswers={targetAnswers}
            setCurrentAnswers={setCurrentAnswers}
            setTargetAnswers={setTargetAnswers}
            input={input}
            navigate={navigate}
          />
        )}
        {route === 'simulate' && <Simulate input={input} setInput={setInput} navigate={navigate} />}
        {route === 'explore' && <Explore stageFilter={stageFilter} setStageFilter={setStageFilter} />}
        {route === 'report' && <Report input={input} />}
      </main>

      {/* 本文に免責・出典を含む画面（ホーム・シミュレーター・レポート）ではフッターで繰り返さない */}
      {(showFooterDisclaimer || showFooterAttribution) && (
        <footer className="no-print border-t border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
          <div className="max-w-6xl mx-auto px-4 py-4 space-y-1">
            {showFooterDisclaimer && <p>{ja.app.disclaimer}</p>}
            {showFooterAttribution && <p>{ATTRIBUTION_TEXT}</p>}
          </div>
        </footer>
      )}
    </div>
  );
}
