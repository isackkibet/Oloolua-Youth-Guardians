import PageLayout from '@frontend/components/PageLayout';
import Link from 'next/link';
import {
  TreePine, Leaf, Sprout, Globe, Lightbulb, Settings, Brain,
  GraduationCap, BarChart3, Palette, Coins, HeartHandshake,
  type LucideIcon,
} from 'lucide-react';

const HOW_WE_WORK: { icon: LucideIcon; title: string; items: string[] }[] = [
  { icon: TreePine, title: 'Nature & Conservation', items: ['Plant native trees', 'Restore damaged forest', 'Protect green spaces'] },
  { icon: Brain, title: 'Wellness & Community', items: ['Create spaces for rest', 'Run community events', 'Build safe places to learn'] },
  { icon: GraduationCap, title: 'Training & Empowerment', items: ['Teach sustainable skills', 'Train nursery workers', 'Build long-term skills'] },
  { icon: BarChart3, title: 'Technology & Transparency', items: ['Track our work', 'Use trusted data', 'Show clear results'] },
  { icon: Palette, title: 'Art & Storytelling', items: ['Use art to explain conservation', 'Support local artists', 'Share stories that inspire'] },
  { icon: Coins, title: 'Green Economy', items: ['Create youth jobs', 'Support green businesses', 'Help conservation pay'] },
];

const WHAT_WE_DO: { icon: LucideIcon; label: string }[] = [
  { icon: Sprout, label: 'Tree nursery and seedling care' },
  { icon: TreePine, label: 'Tree planting and forest restoration' },
  { icon: Leaf, label: 'Green space development' },
  { icon: Brain, label: 'Wellness, camping and recreation' },
  { icon: GraduationCap, label: 'Community training' },
  { icon: BarChart3, label: 'Conservation data tracking' },
  { icon: Palette, label: 'Art and storytelling' },
  { icon: Coins, label: 'Green jobs' },
  { icon: HeartHandshake, label: 'Partnerships' },
];

export default function AboutPage() {
  return (
    <PageLayout
      title="Oloolua Youth Guardians"
      subtitle="We protect Oloolua Forest and help young people build green livelihoods."
      eyebrow="About Us"
    >
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto container-px">

          {/* The Problem We Face */}
          <span className="eyebrow">The Challenge</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl text-[#173d2b]">Why the forest needs us</h2>
          <p className="mt-4 text-base text-[#3f4a42] leading-relaxed max-w-3xl">
            <strong className="text-[#173d2b]">Oloolua Forest</strong> is shrinking. Trees, wildlife and community benefits are being lost.
          </p>

          <div className="mt-10 grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'The Problem',
                intro: 'We are losing:',
                items: ['Green spaces', 'Wildlife', 'Connection to nature'],
              },
              {
                title: 'The Causes',
                intro: 'This happens because of:',
                items: ['Deforestation', 'Low awareness', 'Weak tracking', 'Few local benefits'],
              },
              {
                title: 'The Effects',
                intro: 'This leads to:',
                items: ['A hotter climate', 'Less wildlife', 'Fewer youth opportunities', 'Poorer health'],
              },
            ].map(({ title, intro, items }) => (
              <div key={title} className="pt-5 border-t-2 border-[#c3a66b]">
                <h3 className="font-display text-xl text-[#173d2b]">{title}</h3>
                <p className="mt-2 text-sm text-[#3f4a42]">{intro}</p>
                <ul className="mt-3 space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[#3f4a42]/85">
                      <span className="mt-2 w-1 h-1 rounded-full bg-[#285b3c] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Our Solution */}
          <span className="eyebrow mt-20">Our Response</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl text-[#173d2b]">Our solution</h2>
          <p className="mt-4 text-base text-[#3f4a42] leading-relaxed max-w-3xl">
            We connect <strong className="text-[#173d2b]">nature, people and opportunity</strong>.
          </p>

          {/* WHY We Exist */}
          <div className="mt-16 bg-[#173d2b] text-[#f7f6f0] p-8 sm:p-10">
            <h2 className="font-display text-2xl sm:text-3xl flex items-center gap-2.5">
              <Lightbulb className="w-6 h-6 text-[#c3a66b]" strokeWidth={1.5} /> Why we exist
            </h2>
            <p className="mt-5 font-display text-xl text-[#f7f6f0]/90">
              Protecting nature should also improve lives.
            </p>
            <p className="mt-3 text-sm text-[#f7f6f0]/65">Green spaces support:</p>
            <div className="mt-5 grid sm:grid-cols-2 gap-x-10 gap-y-3">
              {['Mental health', 'Physical health', 'Community', 'Local income'].map((item) => (
                <div key={item} className="flex items-center gap-2.5 text-sm text-[#f7f6f0]/80 border-b border-[#f7f6f0]/12 pb-2.5">
                  <Leaf className="w-4 h-4 text-[#a5b89a] shrink-0" /> {item}
                </div>
              ))}
            </div>
          </div>

          {/* HOW We Create Change */}
          <span className="eyebrow mt-20">Our Approach</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl text-[#173d2b] flex items-center gap-3">
            <Settings className="w-7 h-7 text-[#c3a66b]" strokeWidth={1.3} /> How we create change
          </h2>
          <p className="mt-4 text-base text-[#3f4a42] leading-relaxed max-w-3xl">
            We use <strong className="text-[#173d2b]">community action, technology and art</strong>.
          </p>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-9">
            {HOW_WE_WORK.map(({ icon: Icon, title, items }) => (
              <div key={title} className="pt-5 border-t border-[#173d2b]/15">
                <h3 className="font-display text-xl text-[#173d2b] flex items-center gap-2.5">
                  <Icon className="w-5 h-5 text-[#285b3c]" strokeWidth={1.5} /> {title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {items.map((i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#3f4a42]/85">
                      <span className="mt-2 w-1 h-1 rounded-full bg-[#c3a66b] shrink-0" /> {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* WHAT We Do */}
          <span className="eyebrow mt-20">In the Field</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl text-[#173d2b]">What we do</h2>
          <p className="mt-4 text-base text-[#3f4a42] leading-relaxed">Our work includes:</p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-x-10 gap-y-3">
            {WHAT_WE_DO.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-[#3f4a42] border-b border-[#173d2b]/10 pb-3">
                <Icon size={17} className="text-[#285b3c] shrink-0" strokeWidth={1.6} /> {label}
              </li>
            ))}
          </ul>

          {/* Vision for the Future */}
          <span className="eyebrow mt-20">Looking Ahead</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl text-[#173d2b] flex items-center gap-3">
            <Globe className="w-7 h-7 text-[#c3a66b]" strokeWidth={1.3} /> Our vision
          </h2>
          <p className="mt-4 text-base text-[#3f4a42] leading-relaxed">We want a future where:</p>
          <ul className="mt-5 space-y-2.5 max-w-2xl">
            {[
              'Communities protect nature',
              'Every action is tracked',
              'Green spaces improve health',
              'Conservation creates youth jobs',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[#3f4a42]/85">
                <span className="mt-2 w-1 h-1 rounded-full bg-[#285b3c] shrink-0" /> {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-[#3f4a42] leading-relaxed max-w-3xl">
            We align with Kenya&apos;s <strong className="text-[#173d2b]">15 billion tree goal</strong>, the{' '}
            <strong className="text-[#173d2b]">SDGs</strong> and{' '}
            <strong className="text-[#173d2b]">ESG principles</strong>.
          </p>

          {/* Join Us CTA */}
          <div className="mt-16 bg-[#f2f0e8] border border-[#173d2b]/12 p-8 sm:p-10 text-center">
            <h3 className="font-display text-2xl text-[#173d2b] flex items-center justify-center gap-2.5">
              <HeartHandshake className="w-6 h-6 text-[#c3a66b]" strokeWidth={1.5} /> Join us
            </h3>
            <p className="mt-4 text-sm text-[#3f4a42] leading-relaxed max-w-2xl mx-auto">
              Change happens when people work together. <strong className="text-[#173d2b]">You can be part of it.</strong>
            </p>
            <p className="mt-3 text-sm text-[#3f4a42] leading-relaxed max-w-2xl mx-auto">
              Together, we can restore forests and create green opportunities.
            </p>
            <Link href="/#contact" className="btn btn-primary mt-7">Get Involved</Link>
          </div>

        </div>
      </section>
    </PageLayout>
  );
}
