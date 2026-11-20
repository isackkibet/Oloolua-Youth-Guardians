'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';
import BackToTop from './BackToTop';

const CHROME_FREE_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/portal'];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = CHROME_FREE_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  return (
    <>
      <main className="flex-1">{children}</main>
      {!hideChrome && (
        <>
          <Footer />
          <BackToTop />
        </>
      )}
    </>
  );
}
