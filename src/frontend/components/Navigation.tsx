'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bot, ArrowUpRight } from 'lucide-react';
import BrandMark from './BrandMark';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Mission', href: '/mission' },
  { name: 'Vision', href: '/vision' },
  { name: 'Activities', href: '/activities' },
  { name: 'Projects', href: '/projects' },
  { name: 'Seedlings', href: '/seedlings' },
  { name: 'Beekeeping', href: '/beekeeping' },
  { name: 'Gallery', href: '/photogallery' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <nav
      className={`sticky top-0 z-50 bg-ivory/95 backdrop-blur-md border-b transition-shadow duration-300 ${
        scrolled ? 'border-[#173d2b]/15 shadow-[0_12px_40px_-24px_rgba(15,42,29,0.55)]' : 'border-transparent'
      }`}
    >
      <div className="max-w-8xl mx-auto container-px">
        <div className="flex justify-between items-center gap-4 h-[76px]">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <BrandMark size={44} className="transition-transform duration-300 group-hover:rotate-[-4deg]" />
            <span className="flex flex-col min-w-0 leading-none">
              <span className="font-display text-[1.22rem] sm:text-[1.35rem] font-semibold text-[#173d2b] tracking-tight truncate">
                Oloolua Youth Guardians
              </span>
              <span className="hidden sm:block text-[0.6rem] text-[#285b3c]/75 font-semibold tracking-[0.24em] uppercase mt-1">
                Community Forest Association
              </span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden xl:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3 py-2 text-[0.78rem] font-medium tracking-wide transition-colors ${
                    isActive ? 'text-[#173d2b]' : 'text-[#285b3c]/85 hover:text-[#173d2b]'
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute left-3 right-3 -bottom-0.5 h-px bg-[#c3a66b] transition-transform duration-300 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/#donate"
              className="hidden lg:inline-flex text-[0.78rem] font-semibold tracking-wide text-[#173d2b] hover:text-[#285b3c] px-2 py-1.5 transition-colors"
            >
              Donate
            </Link>
            <Link
              href="/portal"
              aria-label="Open AI Guardian"
              aria-current={pathname === '/portal' ? 'page' : undefined}
              className="hidden sm:inline-flex items-center gap-2 pl-4 pr-3.5 py-2.5 rounded-full bg-[#173d2b] text-[#f7f6f0] text-[0.75rem] font-semibold tracking-wide hover:bg-[#285b3c] transition-colors"
            >
              <Bot className="w-4 h-4 text-[#c3a66b]" strokeWidth={1.8} />
              <span>AI Guardian</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#a5b89a]" />
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden p-2.5 rounded-full text-[#173d2b] hover:bg-[#173d2b]/5 transition-colors"
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
            >
              {isOpen ? <X className="w-6 h-6" strokeWidth={1.6} /> : <Menu className="w-6 h-6" strokeWidth={1.6} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / tablet menu */}
      <div
        id="mobile-nav"
        className={`xl:hidden overflow-hidden transition-[max-height,opacity] duration-400 ease-out border-t border-[#173d2b]/10 bg-ivory ${
          isOpen ? 'max-h-[85vh] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-px py-5">
          <ul className="divide-y divide-[#173d2b]/10">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between py-3.5 font-display text-xl transition-colors ${
                      isActive ? 'text-[#c3a66b]' : 'text-[#173d2b] hover:text-[#285b3c]'
                    }`}
                  >
                    {link.name}
                    <ArrowUpRight className="w-4 h-4 opacity-40" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex flex-col gap-2.5">
            <Link
              href="/portal"
              onClick={() => setIsOpen(false)}
              className="btn btn-primary w-full"
            >
              <Bot className="w-4 h-4 text-[#c3a66b]" />
              Guardian Hub
            </Link>
            <Link href="/#donate" onClick={() => setIsOpen(false)} className="btn btn-outline w-full">
              Donate
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
