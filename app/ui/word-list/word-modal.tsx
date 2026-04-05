'use client';

import Link from 'next/link';
import type { GeneralWord } from '@prisma/client';
import { PlayIcon } from '@/app/ui/icons/play';

interface WordModalProps {
  word: GeneralWord;
  onClose: () => void;
}

export function WordModal({ word, onClose }: WordModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-bold uppercase text-neutral-600">word</p>
        <h2 className="mt-2 text-3xl font-bold text-white">{word.content}</h2>
        <div className="mt-6 flex gap-3">
          <Link
            href={`/word?practice=${word.content}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            <PlayIcon className="h-4 w-4" />
            Practice
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-500 transition-colors hover:border-neutral-700 hover:text-neutral-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
