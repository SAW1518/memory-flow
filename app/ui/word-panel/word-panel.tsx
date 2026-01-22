'use client';
import { useSearchParams } from 'next/navigation';
export const WordPanel = () => {
  const searchParams = useSearchParams();

  const word = searchParams.get('word');

  if (!word) return null;

  return (
    <div className="absolute top-0 right-0 left-0 min-h-screen bg-[#080808] font-sans text-neutral-200 selection:bg-blue-500/30 selection:text-blue-200">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-sm font-bold text-neutral-500 uppercase">
          Your Collection
        </h2>
        <p className="font-mono text-sm text-neutral-700 uppercase">0 WORDS</p>
      </div>
    </div>
  );
};
