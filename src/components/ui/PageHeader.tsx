import { type ReactNode } from 'react';

export interface PageHeaderProps {
  /** Short mono label above the title, like a newspaper section name. */
  kicker: string;
  title: string;
  description?: ReactNode;
  /** Right-aligned controls, such as filter chips or a live badge. */
  actions?: ReactNode;
}

export function PageHeader({ kicker, title, description, actions }: PageHeaderProps) {
  return (
    <header className="border-ink mb-8 flex flex-col gap-4 border-b-2 pb-5 md:flex-row md:items-end md:justify-between">
      <div className="animate-fade-up">
        <p className="text-accent font-mono text-xs font-medium tracking-[0.2em] uppercase">
          {kicker}
        </p>
        <h1 className="font-display mt-2 text-4xl leading-none font-semibold tracking-tight text-balance md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="text-ink-muted mt-3 max-w-2xl text-pretty">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
