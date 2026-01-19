"use client";
import { GeneralWord } from "@/app/lib/types";
import { ZapIcon } from "@/app/ui/icons/zap";
import { TrashIcon } from "@/app/ui/icons/trash";
import { BookOpenIcon } from "@/app/ui/icons/book-open";
import { PlayIcon } from "@/app/ui/icons/play";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export const Card = ({ content, id }: GeneralWord) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const handleCardClick = () => {
    const params = new URLSearchParams(searchParams);
    params.set("word", content);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <button key={id} onClick={handleCardClick} className="group grid grid-cols-10 bg-neutral-800 p-2 rounded-lg items-centercursor-pointer transition-colors border border-transparent hover:bg-neutral-900/50 ">
      {/* <div className="col-span-1 hover:text-blue-500 transition-colors" >
    <ZapIcon size={16} />
   </div> */}
      <p className="col-span-8 text-xl font-medium group-hover:text-white text-l text-left">{content}</p>
      <TrashIcon className="col-span-1 flex justify-center hover:text-red-500 transition-colors" size={16} />
      {/*    <button className="col-span-1 flex justify-center hover:text-blue-400 transition-colors">
    <BookOpenIcon size={16} />
   </button> */}
      <PlayIcon className="col-span-1 flex justify-center group-hover:text-green-400 transition-colors" size={16} />
    </button>
  );
};
