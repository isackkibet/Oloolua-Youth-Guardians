import PageLayout from '@/components/PageLayout';
import Link from 'next/link';

export default function MissionPage() {
  return (
    <PageLayout
      title="Our Mission"
      subtitle="We restore Oloolua Forest and support green jobs."
      eyebrow="Our Mission"
    >
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto container-px">

          <h2 className="font-display text-3xl sm:text-4xl text-[#173d2b]">Conserving, protecting and restoring forests</h2>
          <p className="mt-5 text-base text-[#3f4a42] leading-relaxed">
            Healthy forests support life, water and climate. We plant native trees, create green spaces, train local
            people and record every action.
          </p>

          <h3 className="mt-14 font-display text-2xl text-[#173d2b]">Planting native and medicinal trees</h3>
          <p className="mt-3 text-base text-[#3f4a42] leading-relaxed">
            Native trees fit our climate and support wildlife. Medicinal trees also protect local knowledge.
          </p>
          <h4 className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#285b3c]">Why these trees matter</h4>
          <ul className="mt-3 space-y-2.5">
            {[
              ['Ecological Balance:', 'Native trees support local wildlife.'],
              ['Health Benefits:', 'Medicinal trees protect traditional knowledge.'],
              ['Long-Term Resilience:', 'These trees survive pests and climate stress.'],
            ].map(([label, text]) => (
              <li key={label} className="flex items-start gap-2.5 text-sm text-[#3f4a42]/90 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-[#c3a66b] shrink-0" />
                <span><strong className="text-[#173d2b]">{label}</strong> {text}</span>
              </li>
            ))}
          </ul>
          <h4 className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#285b3c]">What we do</h4>
          <ul className="mt-3 space-y-2.5">
            {[
              'We grow native and medicinal seedlings.',
              'We plant trees in damaged forest areas.',
              'We record each tree on Hedera.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[#3f4a42]/90 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-[#c3a66b] shrink-0" /> {item}
              </li>
            ))}
          </ul>

          <h3 className="mt-14 font-display text-2xl text-[#173d2b]">Green spaces for health</h3>
          <p className="mt-3 text-base text-[#3f4a42] leading-relaxed">
            Green spaces help people rest, move and connect.
          </p>
          <h4 className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#285b3c]">What we offer</h4>
          <ul className="mt-3 space-y-2.5">
            {[
              ['Wellness Hubs:', 'Quiet places for rest and reflection.'],
              ['Active Recreation:', 'Camping, trails and outdoor games.'],
              ['Community Classrooms:', 'Outdoor lessons on nature and climate.'],
            ].map(([label, text]) => (
              <li key={label} className="flex items-start gap-2.5 text-sm text-[#3f4a42]/90 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-[#c3a66b] shrink-0" />
                <span><strong className="text-[#173d2b]">{label}</strong> {text}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-14 font-display text-2xl text-[#173d2b]">Training and green jobs</h3>
          <p className="mt-3 text-base text-[#3f4a42] leading-relaxed">
            Conservation lasts when local people can earn from it. We train youth and community members.
          </p>
          <h4 className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#285b3c]">Our training areas</h4>
          <ul className="mt-3 space-y-2.5">
            {[
              'Seed collection and nursery care.',
              'Sustainability and climate basics.',
              'Hedera and Guardian tools for data.',
              'Eco-tourism and green business.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-[#3f4a42]/90 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-[#c3a66b] shrink-0" /> {item}
              </li>
            ))}
          </ul>

          <h3 className="mt-14 font-display text-2xl text-[#173d2b]">Trusted records with Hedera</h3>
          <p className="mt-3 text-base text-[#3f4a42] leading-relaxed">
            Trust is a barrier to conservation funding. Hedera gives us secure, public records.
          </p>
          <h4 className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#285b3c]">How technology helps</h4>
          <ul className="mt-3 space-y-2.5">
            {[
              ['Clear records:', 'Every tree and training is recorded.'],
              ['ESG data:', 'Organizations can check our impact.'],
              ['Digital art certificates:', 'Local art linked to real conservation.'],
            ].map(([label, text]) => (
              <li key={label} className="flex items-start gap-2.5 text-sm text-[#3f4a42]/90 leading-relaxed">
                <span className="mt-2 w-1 h-1 rounded-full bg-[#c3a66b] shrink-0" />
                <span><strong className="text-[#173d2b]">{label}</strong> {text}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-14 font-display text-2xl text-[#173d2b]">A model others can copy</h3>
          <p className="mt-3 text-base text-[#3f4a42] leading-relaxed">
            Our work supports climate action, health, jobs and equality. Any community forest group in Kenya can copy
            our model.
          </p>

          <div className="mt-16 bg-[#173d2b] text-[#f7f6f0] p-8 sm:p-10">
            <h3 className="font-display text-2xl">Join our mission</h3>
            <p className="mt-4 text-sm text-[#f7f6f0]/70 leading-relaxed">
              Forests need everyone. Join us and help forests and communities thrive.
            </p>
            <Link href="/#contact" className="btn btn-gold mt-7">Get Involved</Link>
          </div>

        </div>
      </section>
    </PageLayout>
  );
}
