'use client';
import { GeneralWord } from '@/app/lib/types';
import { TrashIcon } from '@/app/ui/icons/trash';
import { PlayIcon } from '@/app/ui/icons/play';
import Link from 'next/link';

export const Card = ({ content, id }: GeneralWord) => {
  return (
    <Link
      href={`/word?practice=${content}`}
      tabIndex={0}
      className="group grid w-full cursor-pointer grid-cols-10 items-center rounded-lg border border-transparent bg-neutral-800 p-2 transition-colors hover:bg-neutral-900/50"
    >
      {/* <div className="col-span-1 hover:text-blue-500 transition-colors" >
    <ZapIcon size={16} />
   </div> */}
      <p className="col-span-9 text-left text-xl font-medium group-hover:text-white">
        {content}
      </p>
      <div className="col-span-1 flex flex-row-reverse gap-2 sm:gap-3">
        <TrashIcon className="h-4 w-4 flex-shrink-0 transition-colors hover:text-red-500 sm:h-5 sm:w-5" />
        <PlayIcon className="h-4 w-4 flex-shrink-0 transition-colors group-hover:text-green-400 sm:h-5 sm:w-5" />
      </div>

      {/*    <button className="col-span-1 flex justify-center hover:text-blue-400 transition-colors">
    <BookOpenIcon size={16} />
   </button> */}
    </Link>
  );
};
