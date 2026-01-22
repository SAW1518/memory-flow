"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export const Navbar = () => {
 const pathname = usePathname();
 // Check if we are on the /word page (or subpages)
 const isWordPage = pathname.startsWith("/word");

 return (
  <nav
   className={clsx(
    "text-sm font-medium text-neutral-500 flex items-center gap-6 transition-opacity",
    {
     "opacity-25": isWordPage,
    }
   )}
  >
   {/* change this to links */}
   <span className="hover:text-white transition-colors cursor-pointer">
    Words
   </span>
   <span className="hover:text-white transition-colors cursor-pointer">
    About
   </span>
   <SignedOut>
    <SignInButton mode="modal" />
   </SignedOut>
   <SignedIn>
    <UserButton showName />
   </SignedIn>
  </nav>
 );
};
