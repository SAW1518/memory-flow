import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { auth } from '@clerk/nextjs/server'
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import { dark } from "@clerk/themes";
import { Logo } from "@/app/ui/logo/logo";
import { Navbar } from "@/app/ui/navbar/navbar";

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
            <Logo />
            <Navbar />
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}


