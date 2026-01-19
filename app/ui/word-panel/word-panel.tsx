'use client'
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
export const WordPanel = () => {
 const searchParams = useSearchParams();

 const word = searchParams.get('word');

 if (!word) return null;

 return (
  <div className="min-h-screen bg-[#080808] text-neutral-200 font-sans selection:bg-blue-500/30 selection:text-blue-200 absolute top-0 left-0 right-0" >
   <div className="flex items-center justify-between w-full" >
    <h2 className="text-sm font-bold uppercase text-neutral-500" >Your Collection</h2>
    <p className="text-sm uppercase text-neutral-700 font-mono">0 WORDS</p>
   </div>
  </div>
 )
}