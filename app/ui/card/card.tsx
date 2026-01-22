"use client";
import { GeneralWord } from "@/app/lib/types";
import { ZapIcon } from "@/app/ui/icons/zap";
import { TrashIcon } from "@/app/ui/icons/trash";
import { BookOpenIcon } from "@/app/ui/icons/book-open";
import { PlayIcon } from "@/app/ui/icons/play";
import Link from "next/link";

export const Card = ({ content, id }: GeneralWord) => {


  return (
    <Link
      href={`/word?practice=${content}`}
      tabIndex={0}
      className="group grid grid-cols-10 w-full bg-neutral-800 p-2 rounded-lg items-center cursor-pointer transition-colors border border-transparent hover:bg-neutral-900/50 "
    >
      {/* <div className="col-span-1 hover:text-blue-500 transition-colors" >
    <ZapIcon size={16} />
   </div> */}
      <p className="col-span-9 text-xl font-medium group-hover:text-white text-left">{content}</p>
      <div className="flex col-span-1 gap-3 flex-row-reverse">
        <TrashIcon
          className="col-span-1 justify-center hover:text-red-500 transition-colors"
          size={16}
        />
        <PlayIcon
          className="col-span-1 flex justify-center group-hover:text-green-400 transition-colors"
          size={16}
        />
      </div>

      {/*    <button className="col-span-1 flex justify-center hover:text-blue-400 transition-colors">
    <BookOpenIcon size={16} />
   </button> */}
    </Link>
  );
};
