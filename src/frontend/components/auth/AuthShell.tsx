import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import BrandMark from '@frontend/components/BrandMark';

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="grid min-h-[100svh] bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative flex min-h-[38svh] flex-col justify-between overflow-hidden bg-forest-950 text-white lg:min-h-screen">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/assets/images/hero-oloolua-forest.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 53vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-forest-950/55" />
        </div>

        <div className="relative z-10 flex items-start justify-between gap-6 p-6 sm:p-8 lg:p-12">
          <Link href="/" className="inline-flex items-center gap-3 text-white" aria-label="Oloolua Youth Guardians home">
            <BrandMark size={40} />
            <span className="flex flex-col">
              <span className="font-heading text-sm font-semibold leading-tight">Oloolua Youth Guardians</span>
              <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-sage">Guardian Hub</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-xl p-6 pb-8 sm:p-8 sm:pb-12 lg:p-12 lg:pb-16">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-gold-300">Community Forest Association</p>
          <h2 className="mt-4 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Guardians of Oloolua Forest
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
            We grow native seedlings, restore forest cover and keep community conservation records clear and trustworthy.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-white/70">
            <span>Oloolua Forest</span>
            <span className="h-1 w-1 rounded-full bg-gold-300" aria-hidden="true" />
            <span>Kenya</span>
          </div>
        </div>
      </section>

      <section className="flex min-h-[62svh] flex-col bg-white px-6 py-8 sm:px-10 lg:min-h-screen lg:px-14 lg:py-12 xl:px-20">
        <div className="flex justify-end">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-forest-800 hover:text-forest-950">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to website
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-8 lg:py-12">
          <div className="w-full max-w-[27rem]">
            <BrandMark size={44} />
            <p className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-forest-700">Guardian Hub</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-forest-950">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-forest-900/65">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>

        <p className="text-center text-[0.68rem] text-forest-900/45">
          Access is managed by Oloolua Youth Guardians administrators.
        </p>
      </section>
    </div>
  );
}
