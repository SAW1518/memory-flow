'use client';

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export const Navbar = () => {
  const pathname = usePathname();
  // Check if we are on the /word page (or subpages)
  const isWordPage = pathname.startsWith('/word');

  return (
    <nav
      className={clsx(
        'flex items-center gap-6 text-sm font-medium text-neutral-500 transition-opacity',
        {
          'opacity-25': isWordPage,
        }
      )}
    >
      {/* change this to links */}
      <span className="cursor-pointer transition-colors hover:text-white">
        Words
      </span>
      <span className="cursor-pointer transition-colors hover:text-white">
        About
      </span>
      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <UserButton showName />
      </SignedIn>
    </nav>
  );
};
