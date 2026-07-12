'use client';
import type { GeneralWord } from '@prisma/client';
import { TrashIcon } from '@/app/ui/icons/trash';
import { PlayIcon } from '@/app/ui/icons/play';
import { GlobeIcon } from '@/app/ui/icons/globe';
import { UserCheckIcon } from '@/app/ui/icons/user-check';
import { WifiOffIcon } from '@/app/ui/icons/wifi-off';
import Link from 'next/link';

export type WordSources = {
  general: boolean;
  user: boolean;
  offline: boolean;
};

type CardProps = GeneralWord & {
  sources?: WordSources;
  onDelete?: () => void;
};

export const Card = ({ content, sources, onDelete }: CardProps) => {
  return (
    <li className="flex w-full items-center gap-2 rounded-lg border border-transparent bg-neutral-800 p-2 transition-colors has-[a:hover]:bg-neutral-900/50 sm:gap-3">
      {/* Practice link — spans the card up to (and including) the play icon */}
      <Link
        href={`/word?practice=${content}`}
        tabIndex={0}
        className="group flex flex-1 cursor-pointer items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <p className="text-left text-xl font-medium group-hover:text-white">
            {content}
          </p>
          <div className="flex items-center gap-1">
            {sources?.general && (
              <span
                title="General vocabulary"
                className="flex items-center justify-center rounded-full bg-[#1a2e1a] px-2 py-0.5"
              >
                <GlobeIcon className="h-3 w-3 text-emerald-400" />
              </span>
            )}
            {sources?.user && (
              <span
                title="Registered by you"
                className="flex items-center justify-center rounded-full bg-[#1e2a3a] px-2 py-0.5"
              >
                <UserCheckIcon className="h-3 w-3 text-cyan-400" />
              </span>
            )}
            {sources?.offline && (
              <span
                title="Saved offline"
                className="flex items-center justify-center rounded-full bg-[#2a2318] px-2 py-0.5"
              >
                <WifiOffIcon className="h-3 w-3 text-amber-400" />
              </span>
            )}
          </div>
        </div>
        <PlayIcon className="h-4 w-4 flex-shrink-0 transition-colors group-hover:text-green-400 sm:h-5 sm:w-5" />
      </Link>
      {/* Delete — separate button so it no longer triggers navigation.
          Hidden for general-only words (owner-curated, not user-deletable). */}
      {onDelete && (
        <button
          type="button"
          aria-label={`Delete ${content}`}
          onClick={onDelete}
          className="cursor-pointer"
        >
          <TrashIcon className="h-4 w-4 flex-shrink-0 transition-colors hover:text-red-500 sm:h-5 sm:w-5" />
        </button>
      )}
    </li>
  );
};
