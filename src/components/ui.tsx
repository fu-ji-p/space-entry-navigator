import type { ReactNode } from 'react';
import { LAYERS } from '../data/layers';
import type { Layer } from '../data/schema';

export function Section({ title, hint, children, className = '' }: { title: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`space-y-3 ${className}`}>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {hint && <p className="text-sm text-gray-600 dark:text-gray-400">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export function LayerBadge({ layer }: { layer: Layer }) {
  const meta = LAYERS[layer];
  return <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${meta.badgeClass}`}>{meta.label}</span>;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  type?: 'button' | 'submit';
  className?: string;
  ariaLabel?: string;
}) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950';
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-gray-950',
    secondary:
      'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800',
    ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
  }[variant];
  return (
    <button type={type} onClick={onClick} className={`${base} ${styles} ${className}`} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

export function LinkButton({ href, children, variant = 'primary' }: { href: string; children: ReactNode; variant?: 'primary' | 'secondary' }) {
  const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';
  const styles =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 dark:text-gray-950'
      : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800';
  return (
    <a href={href} className={`${base} ${styles}`}>
      {children}
    </a>
  );
}

export function Disclaimer({ long = false }: { long?: boolean }) {
  return (
    <div
      role="note"
      className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <p className="font-medium">本ツールの結果は予測ではなく、検討の論点を整理するための地図です。</p>
      {long && <p className="mt-1 text-xs">数値は相対的な目安であり、精度より「どこを考えるべきか」が伝わることを優先しています。類型に優劣はありません。</p>}
    </div>
  );
}
