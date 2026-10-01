'use client';

import { Check, Hash, Plus, X } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';

import { CATEGORY_ICONS, SOURCE_META } from '@/components/content/sourceStyles';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { clearFavorites } from '@/features/favorites/favoritesSlice';
import { resetFeedOrder } from '@/features/feed/feedSlice';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useStoreHydrated } from '@/store/useStoreHydrated';
import { CATEGORIES, CATEGORY_LABELS, SOURCES } from '@/types/content';

import {
  addHashtag,
  MAX_HASHTAGS,
  normalizeHashtag,
  removeHashtag,
  resetPreferences,
  toggleCategory,
  toggleSource,
} from '../preferencesSlice';

const SOURCE_DESCRIPTIONS = {
  news: 'Top headlines from NewsAPI for your categories.',
  movie: 'Movie picks from TMDB, tuned by the movies you favorite.',
  social: 'Posts from people and hashtags you follow, with live updates.',
} as const;

export function SettingsView() {
  const dispatch = useAppDispatch();
  const { categories, sources, hashtags } = useAppSelector((state) => state.preferences);
  const [message, setMessage] = useState('');
  const hydrated = useStoreHydrated();

  const onToggleCategory = (category: (typeof CATEGORIES)[number]) => {
    if (categories.length === 1 && categories.includes(category)) {
      setMessage('Keep at least one category so your feed has something to show.');
      return;
    }
    setMessage('');
    dispatch(toggleCategory(category));
  };

  const onToggleSource = (source: (typeof SOURCES)[number]) => {
    if (sources.length === 1 && sources.includes(source)) {
      setMessage('Keep at least one source turned on.');
      return;
    }
    setMessage('');
    dispatch(toggleSource(source));
  };

  return (
    <>
      <PageHeader
        kicker="Preferences"
        title="Settings"
        description="Choose what goes into your edition. Changes apply right away and are saved on this device."
      />

      <p role="status" aria-live="polite" className="text-danger mb-4 min-h-5 text-sm">
        {message}
      </p>

      {/* Saved preferences load after the first render. Show placeholders until then. */}
      {!hydrated ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading settings">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-10">
            <Section
              title="Categories"
              description="Stories, movie picks and posts from these topics fill your feed."
            >
              <div
                role="group"
                aria-label="Categories"
                className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
              >
                {CATEGORIES.map((category) => {
                  const Icon = CATEGORY_ICONS[category];
                  const on = categories.includes(category);
                  return (
                    <ToggleTile
                      key={category}
                      pressed={on}
                      onClick={() => onToggleCategory(category)}
                      icon={<Icon className="size-5" />}
                      label={CATEGORY_LABELS[category]}
                    />
                  );
                })}
              </div>
            </Section>

            <Section title="Sources" description="Turn whole content types on or off.">
              <div role="group" aria-label="Sources" className="grid gap-3 sm:grid-cols-3">
                {SOURCES.map((source) => {
                  const meta = SOURCE_META[source];
                  return (
                    <ToggleTile
                      key={source}
                      pressed={sources.includes(source)}
                      onClick={() => onToggleSource(source)}
                      icon={<meta.icon className={cn('size-5', meta.text)} />}
                      label={meta.plural}
                      description={SOURCE_DESCRIPTIONS[source]}
                    />
                  );
                })}
              </div>
            </Section>

            <Section
              title="Followed hashtags"
              description="Posts with these hashtags join your feed even outside your categories."
            >
              <HashtagEditor
                hashtags={hashtags}
                onAdd={(tag) => dispatch(addHashtag(tag))}
                onRemove={(tag) => dispatch(removeHashtag(tag))}
              />
            </Section>
          </div>

          <aside className="border-line bg-surface h-fit space-y-4 rounded-2xl border p-5">
            <h2 className="font-display text-xl font-semibold">Your data</h2>
            <p className="text-ink-muted text-sm">
              Preferences, favorites, card order and your profile stay in this browser. Nothing is
              sent to a server.
            </p>
            <ResetButton label="Reset preferences" onConfirm={() => dispatch(resetPreferences())} />
            <ResetButton label="Reset feed order" onConfirm={() => dispatch(resetFeedOrder())} />
            <ResetButton label="Clear favorites" onConfirm={() => dispatch(clearFavorites())} />
            <p className="text-ink-muted border-line border-t pt-4 text-xs">
              Posts come from a built-in sample network. News and movies use NewsAPI and TMDB when
              keys are configured, and sample stories otherwise.
            </p>
          </aside>
        </div>
      )}
    </>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-ink-muted mt-1 mb-4 text-sm">{description}</p>
      {children}
    </section>
  );
}

function ToggleTile({
  pressed,
  onClick,
  icon,
  label,
  description,
}: {
  pressed: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'relative flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
        pressed
          ? 'border-ink bg-surface shadow-card'
          : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
      )}
    >
      <span aria-hidden="true" className="mt-0.5">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block font-medium">{label}</span>
        {description ? (
          <span className="text-ink-muted mt-1 block text-xs">{description}</span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex size-5 items-center justify-center rounded-full border',
          pressed ? 'border-accent bg-accent text-on-accent' : 'border-line-strong',
        )}
      >
        {pressed ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

function HashtagEditor({
  hashtags,
  onAdd,
  onRemove,
}: {
  hashtags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const full = hashtags.length >= MAX_HASHTAGS;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const tag = normalizeHashtag(draft);
    if (!tag) return setError('Use letters, numbers or underscores, up to 30 characters.');
    if (hashtags.includes(tag)) return setError(`You already follow #${tag}.`);
    onAdd(tag);
    setDraft('');
    setError('');
  };

  return (
    <div>
      <form onSubmit={submit} className="flex max-w-md gap-2">
        <label htmlFor="hashtag-input" className="sr-only">
          Hashtag to follow
        </label>
        <div className="relative flex-1">
          <Hash
            aria-hidden="true"
            className="text-ink-muted absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <input
            id="hashtag-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={full ? `Limit of ${MAX_HASHTAGS} reached` : 'cricket'}
            disabled={full}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'hashtag-error' : undefined}
            className="border-line-strong bg-surface focus:border-accent h-10 w-full rounded-full border pr-4 pl-9 text-sm outline-none"
          />
        </div>
        <Button type="submit" disabled={full || !draft.trim()}>
          <Plus aria-hidden="true" className="size-4" />
          Follow
        </Button>
      </form>
      {error ? (
        <p id="hashtag-error" className="text-danger mt-2 text-sm">
          {error}
        </p>
      ) : null}
      <ul aria-label="Followed hashtags" className="mt-4 flex flex-wrap gap-2">
        {hashtags.length === 0 ? (
          <li className="text-ink-muted text-sm">You are not following any hashtags.</li>
        ) : (
          hashtags.map((tag) => (
            <li
              key={tag}
              className="border-social/40 text-social inline-flex items-center gap-1 rounded-full border py-1 pr-1 pl-3 font-mono text-sm"
            >
              #{tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                aria-label={`Unfollow #${tag}`}
                className="hover:bg-surface-sunken inline-flex size-6 items-center justify-center rounded-full"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

/** Two-step button: the first click asks for confirmation, so data is never lost by accident. */
function ResetButton({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  return (
    <Button
      variant={armed ? 'primary' : 'secondary'}
      className="w-full"
      onClick={() => {
        if (armed) onConfirm();
        setArmed(!armed);
      }}
      onBlur={() => setArmed(false)}
    >
      {armed ? `Confirm: ${label.toLowerCase()}` : label}
    </Button>
  );
}
