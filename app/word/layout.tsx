import Link from "next/link";
import { ArrowLeftIcon } from "../ui/icons/arrow-left";

export default function WordLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <main className="bg-neutral-900 mx-24 mt-16" >
   <div className="flex items-center justify-between">
    <Link href="/" className="flex items-center text-sm font-normal  font-mono font-stretch-condensed text-neutral-500 hover:text-white transition-colors cursor-pointer">
     <ArrowLeftIcon size={20} className="mr-2" />
     ESC to exit
    </Link>
    <p className="text-sm uppercase text-neutral-700 font-mono">126 WPM
     Accuracy: 100%
     dsdds
    </p>
   </div>
   {children}
  </main>
 );
}
