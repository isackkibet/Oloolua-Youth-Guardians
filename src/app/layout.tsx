import React from 'react';
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import PrivyOAuthReturn from '@/components/guardian/PrivyOAuthReturn';

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Oloolua Youth Guardians | CFA Conservation Hub',
  description:
    'Oloolua Forest Community Forest Association (CFA) Seedling User Group — protecting and restoring natural heritage through indigenous tree nurseries, youth stewardship and community conservation.',
  applicationName: 'Oloolua Youth Guardians',
  keywords: [
    'Oloolua Forest',
    'Kenya conservation',
    'indigenous trees',
    'tree nursery',
    'Community Forest Association',
    'youth guardians',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-ivory text-charcoal flex flex-col min-h-screen antialiased">
        <PrivyOAuthReturn />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
