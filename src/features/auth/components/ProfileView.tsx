'use client';

import { Check, LogOut, UserRound } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { selectFavoriteCount } from '@/features/favorites/selectors';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useStoreHydrated } from '@/store/useStoreHydrated';
import { CATEGORY_LABELS } from '@/types/content';

import { AVATAR_COLORS, signOut, updateProfile, type UserProfile } from '../authSlice';
import { Avatar, AVATAR_STYLES } from './Avatar';
import { Field, inputClasses } from './SignInForm';
import { SignInButton } from './UserMenu';

export const BIO_LIMIT = 280;

export function ProfileView() {
  const user = useAppSelector((state) => state.auth.user);
  const hydrated = useStoreHydrated();

  if (!hydrated) {
    return (
      <>
        <PageHeader kicker="Account" title="Your profile" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <PageHeader kicker="Account" title="Your profile" />
        <EmptyState
          icon={<UserRound className="size-6" />}
          title="You are browsing as a guest"
          description="Sign in to set your name, avatar and bio. It is a demo account stored only in this browser."
          action={<SignInButton label="Sign in to continue" />}
        />
      </>
    );
  }

  // Keyed by email so the form resets if a different person signs in.
  return <ProfileForm key={user.email} user={user} />;
}

function ProfileForm({ user }: { user: UserProfile }) {
  const dispatch = useAppDispatch();
  const id = useId();
  const favoriteCount = useAppSelector(selectFavoriteCount);
  const categories = useAppSelector((state) => state.preferences.categories);

  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [avatarColor, setAvatarColor] = useState(user.avatarColor);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const dirty = name !== user.name || bio !== user.bio || avatarColor !== user.avatarColor;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Your name cannot be empty.');
      return;
    }
    setError('');
    dispatch(updateProfile({ name: name.trim(), bio: bio.trim(), avatarColor }));
    setSaved(true);
  };

  const joined = new Date(user.joinedAt).toLocaleDateString('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <PageHeader kicker="Account" title={`Hello, ${user.name.split(' ')[0]}`} />
      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <aside className="border-line bg-surface h-fit rounded-2xl border p-6 text-center">
          <Avatar name={name || user.name} color={avatarColor} size="lg" className="mx-auto" />
          <p className="font-display mt-4 text-2xl font-semibold">{name || user.name}</p>
          <p className="text-ink-muted text-sm">{user.email}</p>
          {bio ? <p className="mt-4 text-sm text-pretty">{bio}</p> : null}
          <dl className="border-line mt-6 grid grid-cols-2 gap-4 border-t pt-5 text-left">
            <div>
              <dt className="text-ink-muted font-mono text-[0.6875rem] tracking-wider uppercase">
                Favorites
              </dt>
              <dd className="font-display text-2xl font-semibold">{favoriteCount}</dd>
            </div>
            <div>
              <dt className="text-ink-muted font-mono text-[0.6875rem] tracking-wider uppercase">
                Topics
              </dt>
              <dd className="font-display text-2xl font-semibold">{categories.length}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-ink-muted font-mono text-[0.6875rem] tracking-wider uppercase">
                Follows
              </dt>
              <dd className="text-sm">{categories.map((c) => CATEGORY_LABELS[c]).join(', ')}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-ink-muted font-mono text-[0.6875rem] tracking-wider uppercase">
                Member since
              </dt>
              <dd className="text-sm">{joined}</dd>
            </div>
          </dl>
          <Button variant="ghost" className="mt-6 w-full" onClick={() => dispatch(signOut())}>
            <LogOut aria-hidden="true" className="size-4" />
            Sign out
          </Button>
        </aside>

        <form
          onSubmit={submit}
          noValidate
          onChange={() => setSaved(false)}
          className="border-line bg-surface space-y-6 rounded-2xl border p-6"
        >
          <h2 className="font-display text-2xl font-semibold">Edit profile</h2>
          <Field id={`${id}-name`} label="Display name" error={error}>
            <input
              id={`${id}-name`}
              value={name}
              maxLength={60}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-name-error` : undefined}
              className={inputClasses}
            />
          </Field>
          <Field id={`${id}-bio`} label="Bio" hint={`${bio.length} / ${BIO_LIMIT} characters`}>
            <textarea
              id={`${id}-bio`}
              value={bio}
              maxLength={BIO_LIMIT}
              rows={4}
              onChange={(event) => setBio(event.target.value)}
              placeholder="What do you like to read about?"
              className={cn(inputClasses, 'h-auto resize-y py-3')}
            />
          </Field>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Avatar colour</legend>
            <div className="flex flex-wrap gap-3">
              {AVATAR_COLORS.map((color) => (
                <label key={color} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="avatar-color"
                    value={color}
                    checked={avatarColor === color}
                    onChange={() => setAvatarColor(color)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      'peer-focus-visible:outline-accent inline-flex size-10 items-center justify-center rounded-full ring-offset-2 ring-offset-[var(--surface)] peer-checked:ring-2 peer-checked:ring-[var(--ink)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4',
                      AVATAR_STYLES[color],
                    )}
                  >
                    {avatarColor === color ? <Check aria-hidden="true" className="size-4" /> : null}
                  </span>
                  <span className="sr-only">{color}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={!dirty}>
              Save changes
            </Button>
            <p role="status" className="text-social text-sm">
              {saved ? 'Profile saved.' : ''}
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
