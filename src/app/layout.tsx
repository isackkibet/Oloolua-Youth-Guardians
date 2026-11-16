import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import PrivyOAuthReturn from '@/components/guardian/PrivyOAuthReturn';

export const metadata: Metadata = {
  title: 'Oloolua Youth Guardians | CFA Conservation Hub',
  description: 'Oloolua Forest Community Forest Association (CFA) Seedling User Group - Protecting and preserving natural heritage through nursery operations and community conservation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b1c14] text-[#f6f2e7] flex flex-col min-h-screen antialiased">
        <PrivyOAuthReturn />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
