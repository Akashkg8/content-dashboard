'use client';

import { Menu, X } from 'lucide-react';
import { useRef } from 'react';

import { IconButton } from '@/components/ui/IconButton';

import { Brand } from './Brand';
import { NavLinks } from './NavLinks';

/**
 * Slide-in navigation for small screens, built on the native modal `<dialog>`.
 * `showModal()` gives us, for free: a focus trap (the page behind becomes inert),
 * Escape to close, and focus returning to the menu button on close.
 */
export function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <IconButton
        label="Open menu"
        aria-haspopup="dialog"
        onClick={open}
        className="md:hidden"
        icon={<Menu className="size-5" />}
      />
      <dialog
        ref={dialogRef}
        aria-label="Menu"
        // Clicking the backdrop lands on the dialog element itself, not its content.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="bg-paper text-ink shadow-lift m-0 h-dvh max-h-none w-[min(20rem,85vw)] max-w-none p-0 open:animate-[drawer-in_220ms_cubic-bezier(0.2,0.7,0.2,1)]"
      >
        <div className="flex h-full flex-col px-4 py-5">
          <div className="flex items-center justify-between">
            <Brand className="px-3" />
            <IconButton label="Close menu" onClick={close} icon={<X className="size-5" />} />
          </div>
          <nav aria-label="Main" className="mt-8">
            <NavLinks onNavigate={close} />
          </nav>
        </div>
      </dialog>
    </>
  );
}
