import React from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import SiteChrome from '@frontend/components/SiteChrome';
import PrivyOAuthReturn from '@frontend/components/guardian/PrivyOAuthReturn';

const display = localFont({
  src: './fonts/playfair-display-latin.woff2',
  variable: '--font-display',
  display: 'swap',
  weight: '400 700',
});

const sans = localFont({
  src: './fonts/inter-latin.woff2',
  variable: '--font-sans',
  display: 'swap',
  weight: '100 900',
});

const heading = localFont({
  src: './fonts/manrope-latin.woff2',
  variable: '--font-heading',
  display: 'swap',
  weight: '400 800',
});

export const metadata: Metadata = {
  title: 'Oloolua Youth Guardians | CFA Conservation Hub',
  description:
    'Oloolua Forest Community Forest Association (CFA) Seedling User Group — protecting and restoring natural heritage through indigenous tree nurseries, youth stewardship and community conservation.',
  applicationName: 'Oloolua Youth Guardians',
  icons: { icon: '/assets/images/oloolua-youth-guardians-round.svg' },
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
    <html lang="en" className={`${display.variable} ${sans.variable} ${heading.variable}`}>
      <body className="bg-ivory text-charcoal flex flex-col min-h-screen antialiased">
        <PrivyOAuthReturn />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
