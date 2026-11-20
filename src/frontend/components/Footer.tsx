'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Mail, Phone, ExternalLink, Loader2, ArrowUpRight } from 'lucide-react';
import { useMessageForm } from '@frontend/hooks/useMessageForm';
import { Honeypot, FormFeedback } from './FormBits';
import BrandMark from './BrandMark';

const PHONES = ['0112583681', '0742004641', '0725772240'];
const EMAIL = 'austinnamuye@gmail.com';
const INSTAGRAM = 'https://www.instagram.com/oloolua_forest_youth_guardians?igsh=MXBkaXpyd2tuMTQ1Mw==';

export default function Footer() {
  const newsletter = useMessageForm('newsletter');

  return (
    <footer className="bg-[#173d2b] text-[#f7f6f0]">
      <div className="max-w-8xl mx-auto container-px pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand + newsletter */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <BrandMark size={44} />
              <span className="flex flex-col leading-none">
                <span className="font-display text-xl font-semibold tracking-tight">Oloolua Youth Guardians</span>
                <span className="text-[0.58rem] text-[#a5b89a] font-semibold tracking-[0.24em] uppercase mt-1.5">
                  Community Forest Association
                </span>
              </span>
            </Link>
            <p className="text-sm text-[#f7f6f0]/65 leading-relaxed max-w-sm">
              We grow native trees, restore Oloolua Forest and support youth livelihoods.
            </p>
            <form onSubmit={newsletter.onSubmit} className="space-y-2.5 relative max-w-sm">
              <label htmlFor="newsletter-email" className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#a5b89a]">
                Newsletter
              </label>
              <Honeypot />
              <div className="flex gap-2">
                <input
                  id="newsletter-email"
                  type="email"
                  name="contact"
                  required
                  placeholder="Your email"
                  className="flex-1 min-w-0 bg-transparent border-b border-[#f7f6f0]/25 px-1 py-2.5 text-sm text-[#f7f6f0] placeholder-[#f7f6f0]/45 focus:outline-none focus:border-[#c3a66b] transition-colors"
                />
                <button
                  type="submit"
                  disabled={newsletter.status === 'sending'}
                  className="px-4 py-2 rounded-full border border-[#c3a66b]/50 text-[#c3a66b] hover:bg-[#c3a66b] hover:text-[#173d2b] disabled:opacity-60 text-xs font-semibold tracking-wide transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  {newsletter.status === 'sending' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Subscribe
                </button>
              </div>
              <FormFeedback status={newsletter.status} message={newsletter.feedback} />
            </form>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#a5b89a] mb-5">Explore</h4>
            <ul className="space-y-3 text-sm">
              {[
                ['Home', '/'],
                ['About Us', '/about'],
                ['Tree Nursery', '/seedlings'],
                ['Activities', '/activities'],
                ['Projects', '/projects'],
                ['Beekeeping', '/beekeeping'],
                ['Workshops', '/workshops'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[#f7f6f0]/65 hover:text-[#f7f6f0] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guardian Hub */}
          <div className="lg:col-span-2">
            <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#a5b89a] mb-5">Guardian Hub</h4>
            <ul className="space-y-3 text-sm">
              {[
                ['AI Guardian', '/portal'],
                ['Nursery', '/portal?tab=nursery'],
                ['Keeper Diary', '/portal?tab=diary'],
                ['Record Activity', '/portal?tab=record'],
                ['Verification', '/portal?tab=verify'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-[#f7f6f0]/65 hover:text-[#f7f6f0] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#a5b89a] mb-5">Contact Us</h4>
            <div className="flex items-start gap-2.5 text-sm text-[#f7f6f0]/70">
              <MapPin className="w-4 h-4 text-[#c3a66b] shrink-0 mt-0.5" strokeWidth={1.7} />
              <span>Oloolua Forest Station, Kajiado North, Kenya</span>
            </div>
            {PHONES.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone}`}
                className="flex items-center gap-2.5 text-sm text-[#f7f6f0]/70 hover:text-[#f7f6f0] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#c3a66b] shrink-0" strokeWidth={1.7} />
                <span>{phone}</span>
              </a>
            ))}
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2.5 text-sm text-[#f7f6f0]/70 hover:text-[#f7f6f0] transition-colors break-all"
            >
              <Mail className="w-4 h-4 text-[#c3a66b] shrink-0" strokeWidth={1.7} />
              <span>{EMAIL}</span>
            </a>
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full border border-[#f7f6f0]/25 text-[#f7f6f0]/80 text-xs font-semibold hover:border-[#c3a66b] hover:text-[#c3a66b] transition-colors"
            >
              Instagram
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-[#f7f6f0]/12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-[#f7f6f0]/45">
          <div>
            &copy; {new Date().getFullYear()} Oloolua Forest Youth Guardians CFA. All rights reserved.
          </div>
          <div className="flex items-center gap-5">
            <Link href="/portal" className="hover:text-[#f7f6f0] transition-colors inline-flex items-center gap-1">
              Sign in <ArrowUpRight className="w-3 h-3" />
            </Link>
            <Link href="/inbox" className="hover:text-[#f7f6f0] transition-colors">
              Team Inbox
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
