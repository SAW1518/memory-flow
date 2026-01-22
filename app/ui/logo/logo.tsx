'use client';

import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export const Logo = () => {
  const pathname = usePathname();
  const isWordPage = pathname === '/word';

  return (
    <div
      className={clsx('flex items-center gap-3 transition-opacity', {
        'opacity-10': isWordPage,
      })}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
        <span className="text-lg font-bold text-black">M</span>
      </div>
      <span className="text-xl font-bold tracking-tight text-neutral-100">
        Memory Flow
      </span>
    </div>
  );
};
