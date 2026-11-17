'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import { PlusCircle, ArrowRight, Search, Bot } from 'lucide-react';
import { NURSERY_SPECIES_CATALOGUE } from '@/data/species';

export default function SeedlingsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filteredSpecies = NURSERY_SPECIES_CATALOGUE.filter((item) => {
    if (activeFilter !== 'all' && !item.categories.includes(activeFilter)) return false;
    if (!q) return true;
    return [item.name, item.sci, item.eco, ...item.tags, ...item.uses.flatMap(u => [u.title, u.text])]
      .some(text => text.toLowerCase().includes(q));
  });

  return (
    <PageLayout
      title="Seedlings & Species"
      subtitle={`We grow ${NURSERY_SPECIES_CATALOGUE.length} native and farm tree species.`}
      eyebrow="Our Nursery"
      bgImage="/assets/images/seedling1.jpeg"
    >
      <section className="py-14 sm:py-16">
        <div className="max-w-7xl mx-auto container-px space-y-12">

          {/* Guardian live records */}
          <Link
            href="/portal?tab=nursery"
            className="group flex flex-col sm:flex-row sm:items-center gap-4 p-6 bg-[#173d2b] text-[#f7f6f0] hover:bg-[#1f4731] transition-colors"
          >
            <div className="w-11 h-11 rounded-full border border-[#c3a66b]/40 flex items-center justify-center text-[#c3a66b] shrink-0">
              <Bot className="w-5 h-5" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <div className="font-display text-xl">See live nursery records in the Guardian Hub</div>
              <div className="text-sm text-[#f7f6f0]/60 mt-1">
                Sign in to ask AI Guardian or view nursery records.
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#c3a66b] shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Record activity CTA row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#173d2b]/12">
            <div>
              <h2 className="font-display text-3xl text-[#173d2b]">Our tree species</h2>
              <p className="mt-1.5 text-sm text-[#3f4a42]/75">
                Native and farm trees grown by Oloolua Youth Guardians.
              </p>
            </div>
            <Link href="/portal?tab=record" className="btn btn-outline shrink-0 self-start sm:self-auto">
              <PlusCircle className="w-4 h-4" />
              Record Activity
            </Link>
          </div>

          {/* Filters + search */}
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: `All (${NURSERY_SPECIES_CATALOGUE.length})` },
                { id: 'medicinal', label: 'Medicinal' },
                { id: 'timber', label: 'Timber' },
                { id: 'food', label: 'Food' },
                { id: 'ornamental', label: 'Ornamental' },
                { id: 'fodder', label: 'Fodder' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                    activeFilter === f.id
                      ? 'bg-[#173d2b] text-[#f7f6f0]'
                      : 'bg-transparent text-[#285b3c] border border-[#173d2b]/18 hover:border-[#285b3c]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="w-4 h-4 text-[#285b3c]/60 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <label htmlFor="species-search" className="sr-only">Search species</label>
                <input
                  id="species-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, use or scientific name"
                  className="w-full bg-white border border-[#173d2b]/15 rounded-full pl-11 pr-4 py-3 text-sm text-[#252b27] placeholder-[#252b27]/35 focus:outline-none focus:border-[#285b3c]"
                />
              </div>
              <p className="text-xs uppercase tracking-[0.14em] text-[#285b3c]/70" aria-live="polite">
                Showing {filteredSpecies.length} of {NURSERY_SPECIES_CATALOGUE.length} species
              </p>
            </div>
          </div>

          {filteredSpecies.length === 0 && (
            <div className="p-10 bg-[#f2f0e8] border border-dashed border-[#173d2b]/25 text-center space-y-3">
              <p className="font-display text-xl text-[#173d2b]">No species match &ldquo;{query}&rdquo;.</p>
              <button
                type="button"
                onClick={() => { setQuery(''); setActiveFilter('all'); }}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-[#285b3c] hover:text-[#c3a66b] transition-colors"
              >
                Clear search and filters
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {filteredSpecies.map((sp) => (
              <article
                key={sp.name}
                className="group flex flex-col bg-white border border-[#173d2b]/10"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#e6e3d8]">
                  <img
                    src={sp.img}
                    alt={sp.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute top-3 right-3 flex flex-wrap gap-1">
                    {sp.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-1 rounded-full text-[0.6rem] font-semibold uppercase tracking-[0.1em] bg-[#f7f6f0]/90 text-[#173d2b] backdrop-blur-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                  <div>
                    <h3 className="font-display text-xl text-[#173d2b] leading-tight group-hover:text-[#285b3c] transition-colors">
                      {sp.name}
                    </h3>
                    <p className="text-[0.72rem] italic text-[#285b3c]/65 mt-1">{sp.sci}</p>

                    <div className="mt-4 space-y-3 text-xs text-[#3f4a42]/90">
                      {sp.uses.map((u, uIdx) => (
                        <div key={uIdx}>
                          <span className="font-semibold text-[#285b3c] text-[0.7rem] uppercase tracking-[0.1em]">{u.title}</span>
                          <p className="text-[0.78rem] text-[#3f4a42]/80 leading-relaxed mt-1">{u.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {sp.eco && (
                    <div className="pt-3 border-t border-[#173d2b]/10 text-[0.72rem] text-[#285b3c]/80 italic leading-relaxed">
                      {sp.eco}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
