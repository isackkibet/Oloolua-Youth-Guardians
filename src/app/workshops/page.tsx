'use client';

import PageLayout from '@/components/PageLayout';

// From the original workshops.html JS array
const WORKSHOP_IMAGES = [
  "work 60.jpeg", "work1.jpeg", "work10.jpeg", "work11.jpeg", "work12.jpeg",
  "work14.jpeg", "work15.jpeg", "work16.jpeg", "work17.jpeg", "work18.jpeg",
  "work19.jpeg", "work2.jpeg", "work20.jpeg", "work21.jpeg", "work22.jpeg",
  "work24.jpeg", "work26.jpeg", "work27.jpeg", "work29.jpeg", "work3.jpeg",
  "work31.jpeg", "work32.jpeg", "work33.jpeg", "work34.jpeg", "work35.jpeg",
  "work36.jpeg", "work38.jpeg", "work39.jpeg", "work4.jpeg", "work40.jpeg",
  "work41.jpeg", "work42.jpeg", "work43.jpeg", "work44.jpeg", "work45.jpeg",
  "work46.jpeg", "work47.jpeg", "work48.jpeg", "work49.jpeg", "work5.jpeg",
  "work50.jpeg", "work51.jpeg", "work52.jpeg", "work53.jpeg", "work54.jpeg",
  "work55.jpeg", "work56.jpeg", "work57.jpeg", "work58.jpeg", "work6.jpeg",
  "work61.jpeg", "work62.jpeg", "work64.jpeg", "work65.jpeg", "work66.jpeg",
  "work67.jpeg", "work7.jpeg", "work8.jpeg", "work9.jpeg",
].sort((a, b) => {
  const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
  const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
  return numA - numB;
});

export default function WorkshopsPage() {
  return (
    <PageLayout
      title="Community Workshops"
      subtitle="We train local people in conservation and green skills."
      eyebrow="Workshops"
      bgImage="/assets/images/workshop.jpg"
    >
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto container-px text-center">
          <span className="eyebrow justify-center">Training</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl text-[#173d2b]">Learning for a greener future</h2>
          <p className="mt-5 text-base text-[#3f4a42] leading-relaxed">
            Our workshops teach tree care, biodiversity and green business skills.
          </p>
        </div>
      </section>

      <section className="pb-20 sm:pb-24 bg-[#f2f0e8] border-t border-[#173d2b]/10">
        <div className="max-w-7xl mx-auto container-px pt-14">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow">Workshop Photos</span>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl text-[#173d2b]">Our workshops in pictures</h2>
            </div>
            <span className="hidden sm:block text-[0.68rem] uppercase tracking-[0.16em] text-[#285b3c]/60">
              {WORKSHOP_IMAGES.length} photos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {WORKSHOP_IMAGES.map((imgName, i) => (
              <figure key={imgName} className="group overflow-hidden bg-[#e6e3d8] rounded-[2px]">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={`/assets/images/${imgName}`}
                    alt={`Community workshop photograph ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
