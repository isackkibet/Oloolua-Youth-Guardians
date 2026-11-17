'use client';

import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import { PlusCircle, MapPin, BookOpen, ArrowRight } from 'lucide-react';

// Static illustrations of our field work. Per PRD v1.2 (B4) every static
// example is labelled "Example"; official records live in the Keeper Diary.
const EXAMPLES = [
  { title: 'Tree Nursery Sowing & Potting', location: 'Oloolua Forest Station', category: 'Propagation' },
  { title: 'Riverine Zone Croton Reforestation', location: 'Oloolua Stream Bank', category: 'Out-planting' },
  { title: 'Apiculture & Hive Maintenance', location: 'Forest Buffer Apiary', category: 'Beekeeping' },
  { title: 'Community Seedling Distribution', location: 'Oloolua Primary School', category: 'Dispatch' },
];

export default function ActivitiesPage() {
  return (
    <PageLayout
      title="Conservation Activities"
      subtitle="See the work our youth guardians do. Official records are checked before they count."
      eyebrow="Our Work"
    >
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto container-px">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="eyebrow">Field Work</span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl text-[#173d2b]">Our work in the field</h2>
              <p className="mt-3 text-sm text-[#3f4a42]/80 max-w-xl leading-relaxed">
                These examples show our nursery and field work. Every official record is checked.
              </p>
            </div>
            <Link
              href="/portal?tab=record"
              className="btn btn-primary shrink-0 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4 text-[#c3a66b]" />
              Record Activity
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-9">
            {EXAMPLES.map((act, i) => (
              <div key={act.title} className="pt-5 border-t border-[#173d2b]/15">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#285b3c]">
                    {String(i + 1).padStart(2, '0')} · {act.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[0.6rem] font-semibold uppercase tracking-[0.12em] bg-[#173d2b]/[0.06] text-[#285b3c]">
                    Example
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl text-[#173d2b]">{act.title}</h3>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-[#3f4a42]/70">
                  <MapPin className="w-4 h-4 text-[#c3a66b]" strokeWidth={1.6} />
                  <span>{act.location}</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/portal?tab=diary"
            className="group mt-14 flex items-center gap-4 p-6 sm:p-7 bg-[#f2f0e8] border border-[#173d2b]/12 hover:border-[#c3a66b] transition-colors"
          >
            <BookOpen className="w-7 h-7 text-[#c3a66b] shrink-0" strokeWidth={1.4} />
            <div className="flex-1">
              <div className="font-display text-xl text-[#173d2b] group-hover:text-[#285b3c] transition-colors">
                View the Keeper Diary
              </div>
              <div className="text-sm text-[#3f4a42]/70">
                Checked records in the Guardian Hub. Sign in to view.
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#285b3c] transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
