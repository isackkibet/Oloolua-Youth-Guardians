import PageLayout from '@frontend/components/PageLayout';
import Image from 'next/image';
import {
  Satellite, Coins, Sprout, Database, TrendingUp, Hexagon, Palette,
  Globe, Target, Link2, Microscope, ShieldCheck, ClipboardList, Smartphone,
  DollarSign, type LucideIcon,
} from 'lucide-react';

const ICRAF_CARDS: { icon: LucideIcon; title: string; items: string[] }[] = [
  {
    icon: Sprout, title: 'Agroforestry',
    items: ['Choose climate-smart trees', 'Restore soil', 'Support biodiversity'],
  },
  {
    icon: Database, title: 'Data',
    items: ['Model tree growth', 'Estimate carbon', 'Map land use'],
  },
  {
    icon: TrendingUp, title: 'Value',
    items: ['Science plus field data', 'Builds trusted impact records', 'Attracts ESG investors'],
  },
];

const REGEN_CARDS: { icon: LucideIcon; title: string; accent: string; desc: string; items: { label: string; val: string }[] }[] = [
  {
    icon: Hexagon, title: 'Beekeeping', accent: '#c3a66b',
    desc: 'Bees help the forest, and honey helps the community.',
    items: [
      { label: 'Ecosystem', val: 'Bees pollinate trees.' },
      { label: 'Economy', val: 'Youth earn from honey and wax.' },
      { label: 'Records', val: 'Honey batches can be traced.' },
    ],
  },
  {
    icon: Palette, title: 'Arts in Nature', accent: '#285b3c',
    desc: 'Art helps people connect with the forest.',
    items: [
      { label: 'Creative', val: 'Murals and sculptures.' },
      { label: 'Data-Linked', val: 'Art linked to tree groups.' },
      { label: 'Records', val: 'Digital art with real impact data.' },
    ],
  },
];

const PIPELINE: { icon: LucideIcon; label: string }[] = [
  { icon: Sprout, label: '1. Plant' },
  { icon: Smartphone, label: '2. Data' },
  { icon: Microscope, label: '3. Science' },
  { icon: Link2, label: '4. Verify' },
  { icon: DollarSign, label: '5. Value' },
];

export default function ProjectsPage() {
  return (
    <PageLayout showHeader={false}>
      {/* HERO */}
      <section className="relative bg-[#173d2b] text-[#f7f6f0] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/forest5.jpeg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f2a1d]/92 via-[#0f2a1d]/70 to-[#0f2a1d]/25" />
        </div>
        <div className="relative max-w-8xl mx-auto container-px py-24 sm:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#c3a66b]/40 text-[#c3a66b] text-[0.62rem] font-semibold tracking-[0.2em] uppercase">
              Our Projects
            </span>
            <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-[3.9rem] leading-[1.04] font-medium">
              Conservation we can <em className="italic text-[#c3a66b]">measure and trust</em>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-[#f7f6f0]/70 leading-relaxed max-w-2xl font-light">
              We turn conservation work into clear data, trusted records and real value.
            </p>
          </div>
        </div>
      </section>

      {/* Framework Bar */}
      <div className="bg-[#f2f0e8] border-b border-[#173d2b]/10">
        <div className="max-w-8xl mx-auto container-px py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {([
              [Globe, 'ESG Aligned'],
              [Target, 'SDG Goals'],
              [Link2, 'Hedera Guardian'],
              [Microscope, 'Science-Backed'],
            ] as [LucideIcon, string][]).map(([Icon, label]) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={22} className="text-[#285b3c] shrink-0" strokeWidth={1.4} />
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#173d2b]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JAZA MITI */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto container-px">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
            <div>
              <span className="eyebrow">Flagship Project</span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl text-[#173d2b]">Jaza Miti: trees you can track</h2>
              <p className="mt-5 text-base text-[#3f4a42] leading-relaxed">
                Jaza Miti makes every tree easy to track. Local youth record each tree, and the data is saved.
              </p>
              <ul className="mt-8 space-y-0 border-t border-[#173d2b]/15">
                {([
                  { icon: Satellite, title: 'Data capture', desc: 'We record location, species, growth and survival.' },
                  { icon: Coins, title: 'Digital records', desc: 'Each tree gets a secure record on Hedera.' },
                ] as { icon: LucideIcon; title: string; desc: string }[]).map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-4 py-5 border-b border-[#173d2b]/15">
                    <Icon size={22} className="text-[#285b3c] shrink-0 mt-0.5" strokeWidth={1.4} />
                    <div>
                      <h3 className="font-display text-lg text-[#173d2b]">{title}</h3>
                      <p className="mt-1 text-sm text-[#3f4a42]/80 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[#e6e3d8]">
              <img
                src="/assets/images/seedling1.jpeg"
                alt="Tree planting"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ICRAF / CIFOR */}
      <section className="py-20 sm:py-24 bg-[#f2f0e8] border-y border-[#173d2b]/10">
        <div className="max-w-7xl mx-auto container-px">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow justify-center">Science</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl text-[#173d2b]">Science partners</h2>
            <p className="mt-4 text-sm sm:text-base text-[#3f4a42]/80 leading-relaxed">
              We use research from ICRAF and CIFOR to guide our work.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {ICRAF_CARDS.map(({ icon: Icon, title, items }) => (
              <div key={title} className="pt-5 border-t-2 border-[#c3a66b]">
                <Icon size={26} className="text-[#285b3c] mb-4" strokeWidth={1.4} />
                <h3 className="font-display text-xl text-[#173d2b]">{title}</h3>
                <ul className="mt-3 space-y-2">
                  {items.map(i => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#3f4a42]/85">
                      <span className="mt-2 w-1 h-1 rounded-full bg-[#285b3c] shrink-0" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regenerative Strategies */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto container-px">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="eyebrow justify-center">Our Approach</span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl text-[#173d2b]">Work that supports the whole ecosystem</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {REGEN_CARDS.map(({ icon: Icon, title, accent, desc, items }) => (
              <div key={title} className="bg-white border border-[#173d2b]/10 p-7 sm:p-8" style={{ borderTopColor: accent, borderTopWidth: 3 }}>
                <Icon size={28} style={{ color: accent }} className="mb-4" strokeWidth={1.4} />
                <h3 className="font-display text-2xl text-[#173d2b]">{title}</h3>
                <p className="mt-3 text-sm text-[#3f4a42]/85 leading-relaxed">{desc}</p>
                <ul className="mt-5 space-y-2.5 border-t border-[#173d2b]/10 pt-5">
                  {items.map(({ label, val }) => (
                    <li key={label} className="text-sm text-[#3f4a42]/85 leading-relaxed">
                      <strong className="text-[#173d2b]">{label}:</strong> {val}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hedera Guardian */}
      <section className="pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto container-px">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-start">
            <div>
              <span className="eyebrow">Trusted Data</span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl text-[#173d2b]">How we keep records trusted</h2>
              <p className="mt-5 text-base text-[#3f4a42] leading-relaxed">
                Poor data makes conservation hard to trust. Hedera Guardian gives us clear, checked records.
              </p>
              <ul className="mt-8 space-y-0 border-t border-[#173d2b]/15">
                {([
                  { icon: ShieldCheck, title: 'Clear measurement', desc: 'We measure, report and verify our work.' },
                  { icon: ClipboardList, title: 'Rules that protect data', desc: 'Each record follows set rules before it counts.' },
                ] as { icon: LucideIcon; title: string; desc: string }[]).map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-4 py-5 border-b border-[#173d2b]/15">
                    <Icon size={22} className="text-[#285b3c] shrink-0 mt-0.5" strokeWidth={1.4} />
                    <div>
                      <h3 className="font-display text-lg text-[#173d2b]">{title}</h3>
                      <p className="mt-1 text-sm text-[#3f4a42]/80 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#173d2b] text-[#f7f6f0] p-8 sm:p-10">
              <h3 className="font-display text-2xl sm:text-3xl">Why this matters</h3>
              <p className="mt-4 text-sm text-[#f7f6f0]/70 leading-relaxed">
                Public records build investor trust and support ESG reporting.
              </p>
              <p className="mt-4 text-sm text-[#f7f6f0]/70 leading-relaxed">
                <strong className="text-[#f7f6f0]">Vision:</strong> To be a trusted source for conservation in Africa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Flow / Pipeline */}
      <section className="pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto container-px">
          <div className="bg-[#173d2b] text-[#f7f6f0] p-8 sm:p-12">
            <h2 className="font-display text-2xl sm:text-3xl text-[#c3a66b] text-center">How our work fits together</h2>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {PIPELINE.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center border border-[#f7f6f0]/15 py-6 px-3">
                  <Icon size={24} className="text-[#c3a66b] mb-3" strokeWidth={1.4} />
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#f7f6f0]/85">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center text-sm sm:text-base text-[#f7f6f0]/70 leading-relaxed max-w-2xl mx-auto">
              <strong className="text-[#f7f6f0]">Nature thrives.</strong>{' '}
              <strong className="text-[#f7f6f0]">Youth earn.</strong>{' '}
              <strong className="text-[#f7f6f0]">Data builds trust.</strong>{' '}
              <strong className="text-[#f7f6f0]">Investors take part.</strong>
            </p>
            <p className="mt-3 text-center text-[0.6rem] uppercase tracking-[0.18em] text-[#a5b89a]">
              A green model others can copy
            </p>
          </div>
        </div>
      </section>

      {/* Closing note */}
      <div className="bg-[#f2f0e8] border-t border-[#173d2b]/10 py-14">
        <div className="max-w-4xl mx-auto container-px text-center">
          <h3 className="font-display text-2xl text-[#173d2b]">Oloolua Forest Youth Guardians</h3>
          <p className="mt-2 text-sm text-[#3f4a42]/70">Conservation must pay to sustain itself.</p>
        </div>
      </div>
    </PageLayout>
  );
}
