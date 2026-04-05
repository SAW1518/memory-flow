import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { auth } from '@clerk/nextjs/server';
import { ClerkProvider } from '@clerk/nextjs';

import './globals.css';
import { dark } from '@clerk/themes';
import { Logo } from '@/app/ui/logo/logo';
import { Navbar } from '@/app/ui/navbar/navbar';

const myFont = localFont({
  src: '../public/jetbrains-mono/fonts/JetBrainsMono-Regular.woff2',
  fallback: ['system-ui'],
});

export const metadata: Metadata = {
  title: 'Memory Flow',
  description: 'Memory Flow',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, userId } = await auth();

  console.log(isAuthenticated, userId);
  return (
    <html lang="en">
      <body
        className={`${myFont.className} flex min-h-screen flex-col px-2 font-sans antialiased md:px-8 lg:px-24 xl:px-36`}
      >
        <ClerkProvider
          appearance={{
            theme: dark,
          }}
        >
          <header className="flex items-center justify-between self-stretch py-8">
            <Logo />
            <Navbar />
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
