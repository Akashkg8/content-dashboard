'use client';

import { useId, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/store/hooks';

import { signIn } from '../authSlice';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const inputClasses =
  'border-line-strong bg-surface focus:border-accent h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition-colors aria-[invalid=true]:border-danger';

/**
 * Mock sign-in: any name and a well-formed email work. No password, because
 * no account exists anywhere; the profile is stored in this browser only.
 */
export function SignInForm({ onSignedIn }: { onSignedIn?: () => void }) {
  const dispatch = useAppDispatch();
  const id = useId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = {
      name: name.trim() ? undefined : 'Enter your name.',
      email: EMAIL_PATTERN.test(email.trim()) ? undefined : 'Enter an email like you@example.com.',
    };
    setErrors(next);
    if (next.name || next.email) return;
    dispatch(signIn({ name, email }));
    onSignedIn?.();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field id={`${id}-name`} label="Name" error={errors.name}>
        <input
          id={`${id}-name`}
          value={name}
          maxLength={60}
          autoComplete="name"
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
          className={inputClasses}
        />
      </Field>
      <Field id={`${id}-email`} label="Email" error={errors.email}>
        <input
          id={`${id}-email`}
          type="email"
          value={email}
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${id}-email-error` : undefined}
          className={inputClasses}
        />
      </Field>
      <p className="text-ink-muted text-xs">
        Demo sign-in. No password needed, and nothing leaves your browser.
      </p>
      <Button type="submit" className="w-full">
        Sign in
      </Button>
    </form>
  );
}

export function Field({
  id,
  label,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-danger text-sm">
          {error}
        </p>
      ) : hint ? (
        <p className="text-ink-muted text-xs">{hint}</p>
      ) : null}
    </div>
  );
}
