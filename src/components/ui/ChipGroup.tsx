'use client';

import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number;
}

/** Single-choice filter chips. Each chip is a toggle button with `aria-pressed`. */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: readonly ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors',
              selected
                ? 'border-ink bg-ink text-paper'
                : 'border-line-strong text-ink-muted hover:border-ink hover:text-ink',
            )}
          >
            {option.icon}
            {option.label}
            {option.count !== undefined ? (
              <span className={cn('font-mono text-xs', selected ? 'opacity-80' : 'opacity-70')}>
                {option.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
