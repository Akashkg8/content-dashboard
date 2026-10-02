'use client';

import { Check, Hash, Languages, Plus, X } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';

import { CATEGORY_ICONS, SOURCE_META } from '@/components/content/sourceStyles';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { clearFavorites } from '@/features/favorites/favoritesSlice';
import { resetFeedOrder } from '@/features/feed/feedSlice';
import { LANGUAGE_NAMES, LANGUAGES } from '@/i18n';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useStoreHydrated } from '@/store/useStoreHydrated';
import { CATEGORIES, SOURCES, type Category, type ContentSource } from '@/types/content';

import {
  addHashtag,
  MAX_HASHTAGS,
  normalizeHashtag,
  removeHashtag,
  resetPreferences,
  setLanguage,
  toggleCategory,
  toggleSource,
} from '../preferencesSlice';

const SOURCE_DESCRIPTION_KEYS = {
  news: 'settings.sourceNews',
  movie: 'settings.sourceMovie',
  social: 'settings.sourceSocial',
} as const;

export function SettingsView() {
  const dispatch = useAppDispatch();
  const { t } = useT();
  const { categories, sources, hashtags, language } = useAppSelector((state) => state.preferences);
  // Keys, not strings, so the message re-translates if the language changes while it shows.
  const [message, setMessage] = useState<'settings.keepCategory' | 'settings.keepSource' | null>(
    null,
  );
  const hydrated = useStoreHydrated();

  const onToggleCategory = (category: Category) => {
    if (categories.length === 1 && categories.includes(category)) {
      setMessage('settings.keepCategory');
      return;
    }
    setMessage(null);
    dispatch(toggleCategory(category));
  };

  const onToggleSource = (source: ContentSource) => {
    if (sources.length === 1 && sources.includes(source)) {
      setMessage('settings.keepSource');
      return;
    }
    setMessage(null);
    dispatch(toggleSource(source));
  };

  return (
    <>
      <PageHeader
        kicker={t('settings.kicker')}
        title={t('settings.title')}
        description={t('settings.description')}
      />

      <p role="status" aria-live="polite" className="text-danger mb-4 min-h-5 text-sm">
        {message ? t(message) : ''}
      </p>

      {/* Saved preferences load after the first render. Show placeholders until then. */}
      {!hydrated ? (
        <div className="space-y-4" aria-busy="true" aria-label={t('settings.loading')}>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-10">
            <Section
              title={t('settings.categoriesTitle')}
              description={t('settings.categoriesDescription')}
            >
              <div
                role="group"
                aria-label={t('settings.categoriesTitle')}
                className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
              >
                {CATEGORIES.map((category) => {
                  const Icon = CATEGORY_ICONS[category];
                  return (
                    <ToggleTile
                      key={category}
                      pressed={categories.includes(category)}
                      onClick={() => onToggleCategory(category)}
                      icon={<Icon className="size-5" />}
                      label={t(`categories.${category}`)}
                    />
                  );
                })}
              </div>
            </Section>

            <Section
              title={t('settings.sourcesTitle')}
              description={t('settings.sourcesDescription')}
            >
              <div
                role="group"
                aria-label={t('settings.sourcesTitle')}
                className="grid gap-3 sm:grid-cols-3"
              >
                {SOURCES.map((source) => {
                  const meta = SOURCE_META[source];
                  return (
                    <ToggleTile
                      key={source}
                      pressed={sources.includes(source)}
                      onClick={() => onToggleSource(source)}
                      icon={<meta.icon className={cn('size-5', meta.text)} />}
                      label={t(meta.pluralKey)}
                      description={t(SOURCE_DESCRIPTION_KEYS[source])}
                    />
                  );
                })}
              </div>
            </Section>

            <Section
              title={t('settings.hashtagsTitle')}
              description={t('settings.hashtagsDescription')}
            >
              <HashtagEditor
                hashtags={hashtags}
                onAdd={(tag) => dispatch(addHashtag(tag))}
                onRemove={(tag) => dispatch(removeHashtag(tag))}
              />
            </Section>

            <Section
              title={t('settings.languageTitle')}
              description={t('settings.languageDescription')}
            >
              <div
                role="radiogroup"
                aria-label={t('settings.languageTitle')}
                className="flex flex-wrap gap-3"
              >
                {LANGUAGES.map((code) => (
                  <label
                    key={code}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 transition-colors',
                      'has-[:focus-visible]:outline-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2',
                      language === code
                        ? 'border-ink bg-surface shadow-card'
                        : 'border-line text-ink-muted hover:border-line-strong',
                    )}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={code}
                      lang={code}
                      checked={language === code}
                      onChange={() => dispatch(setLanguage(code))}
                      className="sr-only"
                    />
                    <Languages aria-hidden="true" className="size-4" />
                    <span lang={code} className="font-medium">
                      {LANGUAGE_NAMES[code]}
                    </span>
                  </label>
                ))}
              </div>
            </Section>
          </div>

          <aside className="border-line bg-surface h-fit space-y-4 rounded-2xl border p-5">
            <h2 className="font-display text-xl font-semibold">{t('settings.yourData')}</h2>
            <p className="text-ink-muted text-sm">{t('settings.dataBody')}</p>
            <ResetButton
              label={t('settings.resetPreferences')}
              onConfirm={() => dispatch(resetPreferences())}
            />
            <ResetButton
              label={t('settings.resetOrder')}
              onConfirm={() => dispatch(resetFeedOrder())}
            />
            <ResetButton
              label={t('settings.clearFavorites')}
              onConfirm={() => dispatch(clearFavorites())}
            />
            <p className="text-ink-muted border-line border-t pt-4 text-xs">
              {t('settings.sampleNote')}
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

type HashtagError =
  { key: 'settings.invalidTag' } | { key: 'settings.alreadyFollowing'; tag: string };

function HashtagEditor({
  hashtags,
  onAdd,
  onRemove,
}: {
  hashtags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}) {
  const { t } = useT();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<HashtagError | null>(null);
  const full = hashtags.length >= MAX_HASHTAGS;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const tag = normalizeHashtag(draft);
    if (!tag) return setError({ key: 'settings.invalidTag' });
    if (hashtags.includes(tag)) return setError({ key: 'settings.alreadyFollowing', tag });
    onAdd(tag);
    setDraft('');
    setError(null);
  };

  const errorText = !error
    ? ''
    : error.key === 'settings.invalidTag'
      ? t(error.key)
      : t(error.key, { tag: error.tag });

  return (
    <div>
      <form onSubmit={submit} className="flex max-w-md gap-2">
        <label htmlFor="hashtag-input" className="sr-only">
          {t('settings.hashtagLabel')}
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
            placeholder={full ? t('settings.limitReached', { max: MAX_HASHTAGS }) : 'cricket'}
            disabled={full}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'hashtag-error' : undefined}
            className="border-line-strong bg-surface focus:border-accent h-10 w-full rounded-full border pr-4 pl-9 text-sm outline-none"
          />
        </div>
        <Button type="submit" disabled={full || !draft.trim()}>
          <Plus aria-hidden="true" className="size-4" />
          {t('settings.follow')}
        </Button>
      </form>
      {error ? (
        <p id="hashtag-error" className="text-danger mt-2 text-sm">
          {errorText}
        </p>
      ) : null}
      <ul aria-label={t('settings.hashtagsTitle')} className="mt-4 flex flex-wrap gap-2">
        {hashtags.length === 0 ? (
          <li className="text-ink-muted text-sm">{t('settings.notFollowing')}</li>
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
                aria-label={t('settings.unfollow', { tag })}
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
  const { t, language } = useT();
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
      {armed ? t('settings.confirm', { action: label.toLocaleLowerCase(language) }) : label}
    </Button>
  );
}
