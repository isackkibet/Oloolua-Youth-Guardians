'use client';

import PageLayout from '@frontend/components/PageLayout';

const BEE_IMAGES = ['bee1.jpeg', 'bee2.jpeg', 'bee3.jpeg', 'bee5.jpeg', 'bee6.jpeg'];

export default function BeekeepingPage() {
  return (
    <PageLayout
      title="Beekeeping"
      subtitle="We keep bees to help the forest and local livelihoods."
      eyebrow="Beekeeping"
      bgImage="/assets/images/bee1.jpeg"
    >
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto container-px text-center">
          <span className="eyebrow justify-center">Our Apiary</span>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl text-[#173d2b]">Bees help the forest</h2>
          <p className="mt-5 text-base text-[#3f4a42] leading-relaxed">
            Our hives support pollination and give local families extra income.
          </p>
        </div>
      </section>

      <section className="pb-20 sm:pb-24 bg-[#f2f0e8] border-t border-[#173d2b]/10">
        <div className="max-w-7xl mx-auto container-px pt-14">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <span className="eyebrow">Our Apiary</span>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl text-[#173d2b]">Our beekeeping work</h2>
            </div>
            <span className="hidden sm:block text-[0.68rem] uppercase tracking-[0.16em] text-[#285b3c]/60">
              {BEE_IMAGES.length} photos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BEE_IMAGES.map((imgName, i) => (
              <figure
                key={imgName}
                className="group overflow-hidden bg-[#e6e3d8] rounded-[2px]"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={`/assets/images/${imgName}`}
                    alt={`Beekeeping activity at Oloolua Forest ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
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
