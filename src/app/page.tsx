'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { NURSERY_SPECIES_CATALOGUE } from '@/data/species';
import { Reveal, CountUp } from '@/components/Motion';
import { Honeypot, FormFeedback } from '@/components/FormBits';
import { useMessageForm } from '@/lib/useMessageForm';
import {
  TreePine, Users, Globe, ArrowRight, ArrowUpRight, ChevronDown,
  Leaf, Camera, Rocket, Bot, Landmark, Clipboard, Check, Loader2,
  ShieldCheck, ScrollText, ImageIcon, HeartHandshake, MapPin,
} from 'lucide-react';

/* ─────────────── DATA ─────────────── */

const ACTIVITY_CARDS = [
  { img: '/assets/images/forest5.jpeg', label: 'Tree Planting', desc: 'We plant native trees.', href: '/seedlings' },
  { img: '/assets/images/forest6.jpeg', label: 'Seedling Collecting', desc: 'We grow local seedlings.', href: '/seedlings' },
  { img: '/assets/images/workshop.jpg', label: 'Community Workshops', desc: 'We teach practical skills.', href: '/workshops' },
  { img: '/assets/images/bee1.jpeg', label: 'Beekeeping', desc: 'We support bees and honey.', href: '/beekeeping' },
];

const TREE_SPECIES = [
  { img: '/assets/images/silver.jpeg',  name: 'Silver Oak',      sci: 'Grevillea robusta',         local: 'Mukima' },
  { img: '/assets/images/thika_palm.jpg', name: 'Thika Palm',    sci: 'Hyphaene compressa',        local: 'Mkoma' },
  { img: '/assets/images/makhamia.jpg',  name: 'Makhamia',       sci: 'Markhamia lutea',           local: 'Muu' },
  { img: '/assets/images/chestnut.jpg',  name: 'Chestnut',       sci: 'Castanea spp.',             local: 'Chestnut' },
  { img: '/assets/images/drypetes.jpg',  name: 'Drypetes',       sci: 'Drypetes gerrardii',        local: 'Mutanga' },
  { img: '/assets/images/croton.jpeg',   name: 'Croton',         sci: 'Croton megalocarpus',       local: 'Mutonya' },
  { img: '/assets/images/sisal.jpg',     name: 'Sisal',          sci: 'Agave sisalana',            local: 'Mkonge' },
  { img: '/assets/images/acacia.jpeg',   name: 'Acacia',         sci: 'Vachellia spp.',            local: 'Mgunga' },
  { img: '/assets/images/olea.jpeg',    name: 'African Olive',  sci: 'Olea europaea subsp.',      local: 'Mutamaiyu' },
];

const FUTURE_PLANS = [
  { img: '/assets/images/future1.jpeg',  label: 'Canopy Viewing Deck' },
  { img: '/assets/images/future2.jpeg',  label: 'Treehouse & Play Area' },
  { img: '/assets/images/future4.jpeg',  label: 'Tree Observation Platform' },
  { img: '/assets/images/future5.jpeg',  label: 'Eco-Picnic Glamping' },
  { img: '/assets/images/future6.jpeg',  label: 'Meditation & Wellness Hut' },
  { img: '/assets/images/future7.jpeg',  label: 'Outdoor Giant Games' },
  { img: '/assets/images/future8.jpeg',  label: 'Forest Music & Retreat' },
  { img: '/assets/images/future9.jpeg',  label: 'Green Cafe & Picnic Space' },
  { img: '/assets/images/future11.jpeg', label: 'Forest Fitness & Training' },
  { img: '/assets/images/future12.jpeg', label: 'Lakeside Hammock Circle' },
  { img: '/assets/images/future13.jpeg', label: 'Youth Sports & Recreation' },
  { img: '/assets/images/future14.jpeg', label: 'Community Forest Banquets' },
  { img: '/assets/images/future15.jpeg', label: 'Eco-Lounge & Evening Space' },
  { img: '/assets/images/future16.jpeg', label: 'Serenity Hammock Garden' },
];

// Gallery strip: real photos from the forest
const GALLERY_STRIP = [
  '/assets/images/gal2.jpeg', '/assets/images/gal4.jpeg', '/assets/images/gal6.jpeg',
  '/assets/images/gal10.jpeg', '/assets/images/gal13.jpeg', '/assets/images/gal14.jpeg',
  '/assets/images/gal15.jpeg', '/assets/images/gal16.jpeg', '/assets/images/gal17.jpeg',
  '/assets/images/gal19.jpeg', '/assets/images/gal20.jpeg', '/assets/images/gal21.jpeg',
];

/* ─────────────── COMPONENT ─────────────── */

export default function HomePage() {
  const [copiedPaybill, setCopiedPaybill] = useState(false);
  const commitment = useMessageForm('commitment');
  const contact = useMessageForm('contact');

  const copyPaybillDetails = () => {
    navigator.clipboard.writeText('247247 / 813367');
    setCopiedPaybill(true);
    setTimeout(() => setCopiedPaybill(false), 2000);
  };

  return (
    <div className="bg-ivory text-charcoal">
      <Navigation />

      {/* ── HERO ── */}
      <section
        aria-labelledby="hero-title"
        className="relative flex min-h-[calc(100svh-76px)] w-full items-center overflow-hidden bg-[#0f2a1d]"
      >
        {/* Full-bleed forest photograph */}
        <div className="absolute inset-0">
          <Image
            src="/assets/images/hero-oloolua-forest.jpg"
            alt="Sunlight filtering through indigenous trees along a path in Oloolua Forest, Kenya"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="animate-[heroZoom_22s_ease-out_forwards] object-cover object-[center_58%] sm:object-center"
          />
          {/* Layered black wash: darker behind the copy, natural photo colours preserved */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20 sm:from-black/65 sm:via-black/40 sm:to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left_center,rgba(0,0,0,0.28),transparent_62%)]" />
        </div>

        {/* Content, centre-left */}
        <div className="relative z-10 w-full max-w-8xl mx-auto container-px pt-16 pb-32 sm:py-28 lg:py-32">
          <div className="max-w-3xl animate-fade-up text-[#f7f6f0]">
            <p
              className="inline-flex items-center gap-3 text-[0.66rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#d6b66c]"
              style={{ textShadow: '0 1px 12px rgba(0,0,0,0.6)' }}
            >
              <span className="h-px w-8 bg-[#d6b66c]" aria-hidden="true" />
              Community Forest Association
            </p>

            <h1
              id="hero-title"
              className="mt-5 font-display uppercase font-bold text-[2.6rem] leading-[0.92] tracking-[-0.01em] sm:text-[4.2rem] lg:text-[5.2rem] xl:text-[5.6rem]"
              style={{ fontWeight: 700, textShadow: '0 2px 28px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.5)' }}
            >
              <span className="block text-white">Oloolua</span>{' '}
              <span className="mt-1 block text-[#d6b66c]">Youth Guardians</span>
            </h1>

            <p
              className="mt-6 max-w-2xl text-[1rem] sm:text-lg lg:text-xl leading-relaxed text-[#f7f6f0]/90"
              style={{ textShadow: '0 1px 14px rgba(0,0,0,0.6)' }}
            >
              We protect <strong className="font-bold text-[#d6b66c]">Oloolua Forest</strong>. We restore
              native trees. We help young people become{' '}
              <strong className="font-bold text-white">conservation guardians</strong>.
            </p>

            <div
              data-hero-keywords
              className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.6rem] sm:text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#f7f6f0]/80"
              aria-label="Protect nature, restore forests, empower youth"
              style={{ textShadow: '0 1px 10px rgba(0,0,0,0.65)' }}
            >
              <span>Protect Nature</span>
              <span className="text-[#d6b66c]" aria-hidden="true">·</span>
              <span>Restore Forests</span>
              <span className="text-[#d6b66c]" aria-hidden="true">·</span>
              <span>Empower Youth</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/projects"
                className="btn group border border-[#d6b66c] bg-[#d6b66c] text-[#1f1a10] shadow-[0_14px_34px_-16px_rgba(0,0,0,0.8)] hover:-translate-y-0.5 hover:border-[#e4c77f] hover:bg-[#e4c77f]"
              >
                See Our Work
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/#donate"
                className="btn group border border-white/75 bg-white/[0.04] text-[#f7f6f0] backdrop-blur-[2px] hover:border-white hover:bg-white/15"
              >
                Support Us
                <HeartHandshake className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-6" />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.78rem] text-[#f7f6f0]/70">
              <Link href="/portal" className="link-quiet inline-flex items-center gap-1.5 font-medium hover:text-[#f7f6f0]">
                <Bot className="w-4 h-4 text-[#c3a66b]" /> Ask AI Guardian
              </Link>
              <Link href="/portal?tab=record" className="link-quiet inline-flex items-center gap-1.5 font-medium hover:text-[#f7f6f0]">
                <Leaf className="w-4 h-4 text-[#c3a66b]" /> Record Activity
              </Link>
              <Link href="/photogallery" className="link-quiet inline-flex items-center gap-1.5 font-medium hover:text-[#f7f6f0]">
                <Camera className="w-4 h-4 text-[#c3a66b]" /> Photo Gallery
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <a
          href="#stats"
          aria-label="Scroll to explore the forest"
          className="group absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[#f7f6f0]/60 transition-colors hover:text-[#e4d1a4] sm:bottom-7"
        >
          <span className="h-8 w-px bg-gradient-to-b from-transparent to-[#c3a66b]/80" aria-hidden="true" />
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.22em]">Scroll</span>
          <ChevronDown className="h-4 w-4 motion-safe:animate-bounce" strokeWidth={1.5} aria-hidden="true" />
        </a>

        {/* Required attribution for the Oloolua Nature Trail photograph */}
        <a
          href="https://commons.wikimedia.org/wiki/File:Oloolua_Nature_Trail_-Nairobi.jpg"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-6 right-5 z-10 hidden text-[0.55rem] tracking-wide text-[#f7f6f0]/40 transition-colors hover:text-[#f7f6f0]/75 md:block"
        >
          Photo: Cmwaura · CC BY-SA 4.0
        </a>
      </section>

      {/* ── IMPACT STATISTICS ── */}
      <section id="stats" className="border-y border-[#173d2b]/12 bg-[#f2f0e8]">
        <div className="max-w-8xl mx-auto container-px">
          <div className="pt-10 sm:pt-12">
            <h2 className="font-display text-3xl sm:text-4xl text-[#173d2b]">Our Impact</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#173d2b]/12">
            {[
              { icon: <TreePine className="w-5 h-5" />, value: NURSERY_SPECIES_CATALOGUE.length, suffix: '', label: 'Tree species' },
              { icon: <Users className="w-5 h-5" />, value: 30, suffix: '+', label: 'Youth Guardians' },
              { icon: <Globe className="w-5 h-5" />, value: 600, suffix: '+', label: 'Hectares protected' },
            ].map(({ icon, value, suffix, label }) => (
              <div key={label} className="py-8 sm:py-10 px-1 sm:px-6 lg:px-8 flex flex-col gap-2">
                <span className="text-[#c3a66b]">{icon}</span>
                <div className="font-display text-4xl sm:text-5xl font-medium text-[#173d2b] tabular-nums leading-none">
                  <CountUp value={value} suffix={suffix} />
                </div>
                <div className="text-[0.7rem] uppercase tracking-[0.16em] text-[#285b3c]/70 font-medium">{label}</div>
              </div>
            ))}
            <Link href="/portal" className="group py-8 sm:py-10 px-1 sm:px-6 lg:px-8 flex flex-col gap-2 hover:bg-[#173d2b]/[0.03] transition-colors">
              <span className="text-[#c3a66b]"><Bot className="w-5 h-5" /></span>
              <div className="font-display text-2xl sm:text-[1.75rem] font-medium text-[#173d2b] flex items-center gap-2">
                AI Guardian
                <ArrowUpRight className="w-5 h-5 text-[#285b3c] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div className="text-[0.7rem] uppercase tracking-[0.16em] text-[#285b3c]/70 font-medium">
                Live records. Sign in.
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── ACTIVITIES ── */}
      <section className="py-20 sm:py-24 lg:py-28">
        <div className="max-w-8xl mx-auto container-px">
          <Reveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="eyebrow">What We Do</span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[2.9rem] leading-tight text-[#173d2b]">
                Our Conservation Work
              </h2>
            </div>
            <p className="text-sm text-[#3f4a42]/80 max-w-sm leading-relaxed">
              We plant trees, grow seedlings, keep bees and teach communities.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-9">
            {ACTIVITY_CARDS.map(({ img, label, desc, href }, i) => (
              <Reveal key={label} delay={i * 0.07}>
                <Link href={href} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#e6e3d8] rounded-[2px]">
                    <img
                      src={img}
                      alt={label}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f2a1d]/55 via-transparent to-transparent opacity-80" />
                    <span className="absolute left-4 bottom-4 inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#f7f6f0]">
                      {label}
                    </span>
                    <span className="absolute right-4 bottom-4 w-8 h-8 rounded-full border border-[#f7f6f0]/50 flex items-center justify-center text-[#f7f6f0] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-[#3f4a42]/75">{desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY STRIP ── */}
      <section className="py-16 sm:py-20 bg-[#173d2b] text-[#f7f6f0] overflow-hidden">
        <div className="max-w-8xl mx-auto container-px">
          <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-9">
            <div>
              <span className="eyebrow eyebrow-light">Photo Gallery</span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl text-[#f7f6f0]">
                Explore Oloolua Forest
              </h2>
            </div>
            <p className="text-sm text-[#f7f6f0]/55 max-w-sm">
              See the forest and the people who care for it.
            </p>
          </Reveal>
        </div>

        <div className="relative overflow-hidden marquee-mask">
          <div className="marquee-track flex gap-4 w-max animate-[marqueeLeft_55s_linear_infinite]">
            {[...GALLERY_STRIP, ...GALLERY_STRIP].map((src, i) => (
              <Link
                key={i}
                href="/photogallery"
                aria-hidden={i >= GALLERY_STRIP.length}
                tabIndex={i >= GALLERY_STRIP.length ? -1 : undefined}
                className="w-64 sm:w-72 aspect-[4/3] shrink-0 overflow-hidden rounded-[2px] bg-[#0f2a1d]"
              >
                <img
                  src={src}
                  alt={i < GALLERY_STRIP.length ? `Oloolua Forest photograph ${i + 1}` : ''}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.05]"
                />
              </Link>
            ))}
          </div>
        </div>

        <div className="max-w-8xl mx-auto container-px mt-9">
          <Link href="/photogallery" className="btn btn-lighty">
            <Camera className="w-4 h-4 text-[#c3a66b]" />
            View Photo Gallery
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── TREE CATALOGUE ── */}
      <section className="py-20 sm:py-24 lg:py-28">
        <div className="max-w-8xl mx-auto container-px">
          <Reveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="eyebrow">Our Nursery</span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[2.9rem] leading-tight text-[#173d2b]">
                Trees We Grow
              </h2>
            </div>
            <p className="text-sm text-[#3f4a42]/80 max-w-sm leading-relaxed">
              We grow native, fruit and timber trees for the forest and local farms.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-8">
            {TREE_SPECIES.map(({ img, name, sci, local }, i) => (
              <Reveal key={name} delay={(i % 5) * 0.05}>
                <Link href="/seedlings" className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#e6e3d8] rounded-[2px]">
                    <img
                      src={img}
                      alt={name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="pt-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg text-[#173d2b] leading-tight group-hover:text-[#285b3c] transition-colors">
                        {name}
                      </h3>
                    </div>
                    <p className="text-[0.72rem] italic text-[#285b3c]/60 mt-0.5">{sci}</p>
                    <p className="text-[0.65rem] uppercase tracking-[0.16em] text-[#285b3c]/70 mt-2">{local}</p>
                  </div>
                </Link>
              </Reveal>
            ))}

            <Reveal delay={0.2}>
              <Link
                href="/seedlings"
                className="group flex flex-col items-center justify-center aspect-[4/5] border border-dashed border-[#173d2b]/25 hover:border-[#c3a66b] transition-colors rounded-[2px] text-center px-4"
              >
                <Leaf className="w-7 h-7 text-[#c3a66b] mb-3 transition-transform duration-300 group-hover:rotate-12" strokeWidth={1.4} />
                <span className="font-display text-lg text-[#173d2b]">View All Species</span>
                <span className="text-[0.65rem] uppercase tracking-[0.16em] text-[#285b3c]/70 mt-2 flex items-center gap-1">
                  See all species <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── KAI CFA HUB ── */}
      <section className="bg-[#173d2b] text-[#f7f6f0]">
        <div className="max-w-8xl mx-auto container-px py-16 sm:py-20 lg:py-24">
          <Reveal className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-start">
            <div>
              <span className="eyebrow eyebrow-light">Guardian Hub</span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[2.9rem] leading-tight">
                Our Conservation Records
              </h2>
              <p className="mt-5 text-sm sm:text-base text-[#f7f6f0]/60 leading-relaxed max-w-xl">
                Every tree, sale and planting is recorded and checked.
              </p>
              <div className="mt-8">
                <Link href="/portal" className="btn btn-gold">
                  Open AI Guardian
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <ul className="space-y-0 border-t border-[#f7f6f0]/15">
              {[
                { icon: ScrollText, title: 'Clear records', text: 'Every activity is saved in order.' },
                { icon: ImageIcon, title: 'Photo evidence', text: 'Each record can include a photo.' },
                { icon: ShieldCheck, title: 'Independent review', text: 'A second person checks each record.' },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4 py-5 border-b border-[#f7f6f0]/15">
                  <Icon className="w-5 h-5 text-[#c3a66b] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-display text-lg text-[#f7f6f0]">{title}</h3>
                    <p className="text-xs sm:text-sm text-[#f7f6f0]/55 leading-relaxed mt-1">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ── FUTURE PLANS ── */}
      <section className="py-20 sm:py-24 lg:py-28" id="future-plans">
        <div className="max-w-8xl mx-auto container-px">
          <Reveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="eyebrow">Coming Soon</span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[2.9rem] leading-tight text-[#173d2b] flex items-center gap-3">
                <Rocket className="w-7 h-7 text-[#c3a66b]" strokeWidth={1.3} />
                Our Future Projects
              </h2>
            </div>
            <p className="text-sm text-[#3f4a42]/80 max-w-sm leading-relaxed">
              New spaces for learning, rest, play and green jobs.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {FUTURE_PLANS.map(({ img, label }, i) => (
              <Reveal key={label} delay={(i % 4) * 0.05}>
                <div className="group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e6e3d8] rounded-[2px]">
                    <img
                      src={img}
                      alt={label}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#173d2b]">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-12">
            <a href="#donate" className="btn btn-primary">
              <TreePine className="w-4 h-4 text-[#c3a66b]" />
              Support Our Future
            </a>
          </div>
        </div>
      </section>

      {/* ── DONATE ── */}
      <section className="bg-[#f2f0e8] border-y border-[#173d2b]/10" id="donate">
        <div className="max-w-8xl mx-auto container-px py-16 sm:py-20 lg:py-24">
          <Reveal className="max-w-2xl mb-12">
            <span className="eyebrow">Donate</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-[2.9rem] leading-tight text-[#173d2b]">
              Support Oloolua Forest
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#3f4a42]/80 leading-relaxed">
              Your gift plants trees and supports young guardians.
            </p>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Paybill */}
            <div className="bg-[#173d2b] text-[#f7f6f0] p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <Landmark className="w-7 h-7 text-[#c3a66b]" strokeWidth={1.4} />
                <div>
                  <div className="font-display text-xl">Equity Bank</div>
                  <div className="text-[0.65rem] uppercase tracking-[0.2em] text-[#a5b89a] mt-1">M-Pesa Paybill</div>
                </div>
              </div>

              <dl className="mt-7 divide-y divide-[#f7f6f0]/15 border-y border-[#f7f6f0]/15">
                <div className="flex items-center justify-between py-4">
                  <dt className="text-sm text-[#f7f6f0]/60">Paybill Number</dt>
                  <dd className="font-display text-2xl tracking-[0.12em] text-[#c3a66b]">247247</dd>
                </div>
                <div className="flex items-center justify-between py-4">
                  <dt className="text-sm text-[#f7f6f0]/60">Account Number</dt>
                  <dd className="font-display text-2xl tracking-[0.12em] text-[#c3a66b]">813367</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={copyPaybillDetails}
                className="mt-6 w-full py-3.5 rounded-full bg-[#c3a66b] hover:bg-[#d2b77f] text-[#241f15] font-semibold text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                {copiedPaybill ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                <span>{copiedPaybill ? 'Details Copied' : 'Copy Details'}</span>
              </button>
              <p className="mt-4 text-[0.7rem] text-[#f7f6f0]/45 text-center flex items-center justify-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                M-Pesa → Lipa na M-Pesa → Paybill → Enter details above
              </p>
            </div>

            {/* Commitment form */}
            <div className="bg-white border border-[#173d2b]/12 p-7 sm:p-9">
              <h3 className="font-display text-2xl text-[#173d2b]">Pledge your support</h3>
              <form onSubmit={commitment.onSubmit} className="mt-6 space-y-4 relative">
                <Honeypot />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="commit-name" className="text-[0.68rem] uppercase tracking-[0.16em] text-[#285b3c]/80 mb-2 block font-semibold">Full Name</label>
                    <input id="commit-name" name="name" type="text" required maxLength={120} autoComplete="name" placeholder="Your full name" className="w-full bg-[#f7f6f0] border border-[#173d2b]/15 rounded-none px-3.5 py-3 text-sm text-[#252b27] focus:outline-none focus:border-[#285b3c] placeholder-[#252b27]/35" />
                  </div>
                  <div>
                    <label htmlFor="commit-contact" className="text-[0.68rem] uppercase tracking-[0.16em] text-[#285b3c]/80 mb-2 block font-semibold">Email / Phone</label>
                    <input id="commit-contact" name="contact" type="text" required maxLength={160} autoComplete="email" placeholder="Email or phone" className="w-full bg-[#f7f6f0] border border-[#173d2b]/15 rounded-none px-3.5 py-3 text-sm text-[#252b27] focus:outline-none focus:border-[#285b3c] placeholder-[#252b27]/35" />
                  </div>
                </div>
                <div>
                  <label htmlFor="commit-message" className="text-[0.68rem] uppercase tracking-[0.16em] text-[#285b3c]/80 mb-2 block font-semibold">Your Message <span className="normal-case tracking-normal font-normal text-[#285b3c]/50">(optional)</span></label>
                  <input id="commit-message" name="message" type="text" maxLength={2000} placeholder="E.g., in memory of someone, dedicate to a school…" className="w-full bg-[#f7f6f0] border border-[#173d2b]/15 rounded-none px-3.5 py-3 text-sm text-[#252b27] focus:outline-none focus:border-[#285b3c] placeholder-[#252b27]/35" />
                </div>
                <button
                  type="submit"
                  disabled={commitment.status === 'sending'}
                  className="w-full py-3.5 rounded-full bg-[#173d2b] hover:bg-[#285b3c] disabled:opacity-60 disabled:cursor-wait text-[#f7f6f0] font-semibold text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                  {commitment.status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <TreePine className="w-4 h-4 text-[#c3a66b]" />}
                  <span>{commitment.status === 'sending' ? 'Sending...' : 'Send Commitment'}</span>
                </button>
                <FormFeedback status={commitment.status} message={commitment.feedback} />
              </form>
              <p className="mt-4 text-[0.7rem] text-[#252b27]/45 text-center">
                We will reply with a short update.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="py-20 sm:py-24" id="contact">
        <div className="max-w-8xl mx-auto container-px">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-20 items-start">
            <Reveal>
              <span className="eyebrow">Get in Touch</span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl leading-tight text-[#173d2b]">Contact Us</h2>
              <p className="mt-4 text-sm sm:text-base text-[#3f4a42]/80 leading-relaxed max-w-sm">
                Questions, ideas or a partnership? Send us a message.
              </p>
              <div className="mt-8 space-y-3 text-sm text-[#285b3c]">
                <p className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#c3a66b]" /> Oloolua Forest Station, Kajiado North, Kenya
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <form onSubmit={contact.onSubmit} className="space-y-4 relative bg-white border border-[#173d2b]/12 p-7 sm:p-9">
                <Honeypot />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="text-[0.68rem] uppercase tracking-[0.16em] text-[#285b3c]/80 mb-2 block font-semibold">Your Name</label>
                    <input id="contact-name" name="name" type="text" placeholder="Your name" required maxLength={120} autoComplete="name" className="w-full bg-[#f7f6f0] border border-[#173d2b]/15 rounded-none px-3.5 py-3 text-sm text-[#252b27] focus:outline-none focus:border-[#285b3c] placeholder-[#252b27]/35" />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="text-[0.68rem] uppercase tracking-[0.16em] text-[#285b3c]/80 mb-2 block font-semibold">Your Email</label>
                    <input id="contact-email" name="contact" type="email" placeholder="you@example.com" required maxLength={160} autoComplete="email" className="w-full bg-[#f7f6f0] border border-[#173d2b]/15 rounded-none px-3.5 py-3 text-sm text-[#252b27] focus:outline-none focus:border-[#285b3c] placeholder-[#252b27]/35" />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-message" className="text-[0.68rem] uppercase tracking-[0.16em] text-[#285b3c]/80 mb-2 block font-semibold">Your Message</label>
                  <textarea id="contact-message" name="message" rows={5} placeholder="How would you like to get involved?" required maxLength={2000} className="w-full bg-[#f7f6f0] border border-[#173d2b]/15 rounded-none px-3.5 py-3 text-sm text-[#252b27] focus:outline-none focus:border-[#285b3c] placeholder-[#252b27]/35 resize-none" />
                </div>
                <button
                  type="submit"
                  disabled={contact.status === 'sending'}
                  className="w-full py-3.5 rounded-full bg-[#173d2b] hover:bg-[#285b3c] disabled:opacity-60 disabled:cursor-wait text-[#f7f6f0] font-semibold text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                  {contact.status === 'sending' && <Loader2 className="w-4 h-4 animate-spin" />}
                  {contact.status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
                <FormFeedback status={contact.status} message={contact.feedback} />
              </form>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
