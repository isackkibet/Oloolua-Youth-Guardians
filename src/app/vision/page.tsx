import PageLayout from '@frontend/components/PageLayout';
import Link from 'next/link';

export default function VisionPage() {
  return (
    <PageLayout
      title="Our Vision"
      subtitle="A future where healthy forests and thriving communities go together."
      eyebrow="Our Vision"
    >
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto container-px">

          <h2 className="font-display text-3xl sm:text-4xl text-[#173d2b]">A global movement for forests and people</h2>
          <p className="mt-5 text-base text-[#3f4a42] leading-relaxed">
            We want healthy forests, green spaces that improve health, and communities that earn from conservation.
          </p>

          <h3 className="mt-14 font-display text-2xl text-[#173d2b]">Communities lead conservation</h3>
          <p className="mt-3 text-base text-[#3f4a42] leading-relaxed">
            Local people know their land best. Every community should have the tools, knowledge and reason to protect
            nature.
          </p>
          <h4 className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#285b3c]">Why local action works</h4>
          <ul className="mt-3 space-y-2.5">
            {[
              'Communities have deep ties to their land.',
              'Local leaders know what works.',
              'When conservation pays, forests become assets.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[#3f4a42]/90 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-[#c3a66b] shrink-0" /> {item}
              </li>
            ))}
          </ul>
          <h4 className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#285b3c]">How we get there</h4>
          <ul className="mt-3 space-y-2.5">
            {[
              ['Open knowledge:', 'We share our methods and data.'],
              ['Youth and women:', 'We train underrepresented groups.'],
              ['Digital hubs:', 'Simple mobile tools for local records.'],
            ].map(([label, text]) => (
              <li key={label} className="flex items-start gap-2.5 text-sm text-[#3f4a42]/90 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-[#c3a66b] shrink-0" />
                <span><strong className="text-[#173d2b]">{label}</strong> {text}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-14 font-display text-2xl text-[#173d2b]">Green spaces for public health</h3>
          <p className="mt-3 text-base text-[#3f4a42] leading-relaxed">
            We want green spaces treated like schools and hospitals: essential public goods.
          </p>
          <h4 className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#285b3c]">What this looks like</h4>
          <ul className="mt-3 space-y-2.5">
            {[
              ['Healing hubs:', 'Quiet paths and places to rest.'],
              ['Active recreation:', 'Camping, trails and outdoor games.'],
              ['Carbon-smart parks:', 'Green spaces recorded on-chain.'],
            ].map(([label, text]) => (
              <li key={label} className="flex items-start gap-2.5 text-sm text-[#3f4a42]/90 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-[#c3a66b] shrink-0" />
                <span><strong className="text-[#173d2b]">{label}</strong> {text}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-14 font-display text-2xl text-[#173d2b]">Trees as living assets</h3>
          <p className="mt-3 text-base text-[#3f4a42] leading-relaxed">
            Each tree can store its story and growth. Hedera helps us keep these records safe.
          </p>
          <h4 className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#285b3c]">What this makes possible</h4>
          <ul className="mt-3 space-y-2.5">
            {[
              ['Trusted carbon markets:', 'Buyers can check each tree.'],
              ['Eco-tourism:', 'Visitors can collect art linked to trees.'],
              ['Digital museum:', 'Local knowledge and art stored safely.'],
            ].map(([label, text]) => (
              <li key={label} className="flex items-start gap-2.5 text-sm text-[#3f4a42]/90 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-[#c3a66b] shrink-0" />
                <span><strong className="text-[#173d2b]">{label}</strong> {text}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-14 font-display text-2xl text-[#173d2b]">A model for Kenya and beyond</h3>
          <p className="mt-3 text-base text-[#3f4a42] leading-relaxed">
            We want the Oloolua model to help every community forest group in Kenya.
          </p>

          <h3 className="mt-14 font-display text-2xl text-[#173d2b]">Global goals</h3>
          <p className="mt-3 text-base text-[#3f4a42] leading-relaxed">
            Our work supports climate action, health, jobs and equality. We also give partners clear data for their ESG
            reports.
          </p>

          <div className="mt-16 bg-[#173d2b] text-[#f7f6f0] p-8 sm:p-10">
            <h3 className="font-display text-2xl">Join our vision</h3>
            <p className="mt-4 text-sm text-[#f7f6f0]/70 leading-relaxed">
              This work needs everyone. Join us and help build a green future.
            </p>
            <Link href="/#contact" className="btn btn-gold mt-7">Become a Partner</Link>
          </div>

        </div>
      </section>
    </PageLayout>
  );
}
