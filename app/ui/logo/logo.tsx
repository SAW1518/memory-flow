"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";

export const Logo = () => {
 const pathname = usePathname();
 const isWordPage = pathname === "/word";

 return (
  <div
   className={clsx("flex items-center gap-3 transition-opacity", {
    "opacity-10": isWordPage,
   })}
  >
   <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
    <span className="text-black font-bold text-lg">M</span>
   </div>
   <span className="text-xl font-bold tracking-tight text-neutral-100">
    Memory Flow
   </span>
  </div>
 );
};
