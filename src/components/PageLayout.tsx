'use client';

import React from 'react';
import Image from 'next/image';
import Navigation from './Navigation';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  bgImage?: string;
  showHeader?: boolean;
  eyebrow?: string;
}

function PageHeader({
  title,
  subtitle,
  bgImage,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  bgImage?: string;
  eyebrow?: string;
}) {
  return (
    <header className="relative bg-[#173d2b] text-[#f7f6f0] overflow-hidden">
      <div className="max-w-8xl mx-auto container-px">
        <div className={`grid items-stretch ${bgImage ? 'lg:grid-cols-[1.15fr_0.85fr]' : ''}`}>
          <div className="py-16 sm:py-20 lg:py-24 max-w-2xl">
            <div className="eyebrow eyebrow-light mb-5">{[eyebrow ?? 'Oloolua Forest CFA']}</div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.6rem] leading-[1.05] font-medium text-[#f7f6f0]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-5 text-base sm:text-lg text-[#f7f6f0]/65 leading-relaxed font-light max-w-xl">
                {subtitle}
              </p>
            )}
            <div className="mt-8 h-px w-16 bg-[#c3a66b]" />
          </div>

          {bgImage && (
            <div className="relative hidden lg:block min-h-[320px]">
              <Image
                src={bgImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#173d2b] via-[#173d2b]/20 to-transparent" />
            </div>
          )}
        </div>
      </div>
      <div className="h-px w-full bg-[#c3a66b]/30" />
    </header>
  );
}

export default function PageLayout({
  children,
  title,
  subtitle,
  bgImage,
  showHeader = true,
  eyebrow,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col">
      <Navigation />
      {showHeader && title && (
        <PageHeader title={title} subtitle={subtitle} bgImage={bgImage} eyebrow={eyebrow} />
      )}
      {/* The root layout already provides <main> and the site footer. */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
