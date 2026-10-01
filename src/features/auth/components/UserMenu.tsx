'use client';

import { Heart, LogIn, LogOut, Settings, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { selectFavoriteCount } from '@/features/favorites/selectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useStoreHydrated } from '@/store/useStoreHydrated';

import { signOut } from '../authSlice';
import { Avatar } from './Avatar';
import { SignInForm } from './SignInForm';

/** Header account area: a sign-in button for guests, an account menu once signed in. */
export function UserMenu() {
  const user = useAppSelector((state) => state.auth.user);
  const hydrated = useStoreHydrated();

  // Same size as the avatar, so nothing jumps when saved state loads.
  if (!hydrated) return <span aria-hidden="true" className="ml-1 size-9" />;
  return user ? <AccountMenu /> : <SignInButton />;
}

export function SignInButton({ label = 'Sign in' }: { label?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        className="ml-1"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <LogIn aria-hidden="true" className="size-3.5" />
        {label}
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby="sign-in-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="bg-paper text-ink shadow-lift m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl p-0"
      >
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 id="sign-in-title" className="font-display text-2xl font-semibold">
                Sign in to Dispatch
              </h2>
              <p className="text-ink-muted mt-1 text-sm">Personalize your profile and greeting.</p>
            </div>
            <IconButton label="Close" onClick={close} icon={<X className="size-5" />} />
          </div>
          <SignInForm onSignedIn={close} />
        </div>
      </dialog>
    </>
  );
}

function AccountMenu() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user)!;
  const favoriteCount = useAppSelector(selectFavoriteCount);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={containerRef} className="relative ml-1">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account: ${user.name}`}
        onClick={() => setOpen(!open)}
        className="hover:ring-line-strong rounded-full ring-2 ring-transparent transition"
      >
        <Avatar name={user.name} color={user.avatarColor} />
      </button>
      {open ? (
        <div
          id={menuId}
          className="border-line bg-surface shadow-lift animate-fade-up absolute right-0 z-40 mt-2 w-64 rounded-2xl border p-2"
        >
          <div className="border-line flex items-center gap-3 border-b px-3 pt-2 pb-4">
            <Avatar name={user.name} color={user.avatarColor} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="text-ink-muted truncate text-sm">{user.email}</p>
            </div>
          </div>
          <ul className="py-2">
            <MenuLink href="/profile" icon={<UserRound className="size-4" />} onClick={close}>
              Profile
            </MenuLink>
            <MenuLink href="/favorites" icon={<Heart className="size-4" />} onClick={close}>
              Favorites
              <span className="text-ink-muted ml-auto font-mono text-xs">{favoriteCount}</span>
            </MenuLink>
            <MenuLink href="/settings" icon={<Settings className="size-4" />} onClick={close}>
              Settings
            </MenuLink>
          </ul>
          <button
            type="button"
            onClick={() => {
              close();
              dispatch(signOut());
            }}
            className="hover:bg-surface-sunken border-line flex w-full items-center gap-3 rounded-lg border-t px-3 py-2.5 text-sm"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  onClick,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="hover:bg-surface-sunken flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
      >
        <span aria-hidden="true" className="text-ink-muted">
          {icon}
        </span>
        {children}
      </Link>
    </li>
  );
}
