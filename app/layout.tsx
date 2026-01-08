import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { auth, currentUser } from '@clerk/nextjs/server'
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import "./globals.css";
import { dark } from "@clerk/themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memory Flow",
  description: "Memory Flow",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, userId } = await auth()


  console.log(isAuthenticated, userId)
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} min-h-screen flex flex-col antialiased font-sans px-2 md:px-8 lg:px-24 xl:px-32`}
      >
        <ClerkProvider
          appearance={{
            theme: dark,
          }}
        >
          <header className="flex items-center self-stretch justify-between py-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-100">Memory Flow</span>
            </div>
            <nav className="text-sm font-medium text-neutral-500 flex items-center gap-6" >
              {/* chancge this to links */}
              <span className="hover:text-white transition-colors cursor-pointer">Words</span>
              <span className="hover:text-white transition-colors cursor-pointer">About</span>
              <SignedOut >
                <SignInButton mode='modal' />
              </SignedOut>
              <SignedIn>
                <UserButton showName />
              </SignedIn>
            </nav>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}


