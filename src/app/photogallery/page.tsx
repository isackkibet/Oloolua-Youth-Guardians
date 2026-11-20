'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PageLayout from '@frontend/components/PageLayout';
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';

// Exact image list from the original photogallery.html JS array
const IMAGE_PATHS = [
  "act0.jpeg","act1.jpeg","act10.jpeg","act11.jpeg","act12.jpeg","act13.jpeg","act14.jpeg","act15.jpeg","act16.jpeg","act2.jpeg","act20.jpeg","act21.jpeg","act22.jpeg","act23.jpeg","act24.jpeg","act25.jpeg","act26.jpeg","act27.jpeg","act28.jpeg","act3.jpeg","act30.jpeg","act31.jpeg","act34.jpeg","act35.jpeg","act36.jpeg","act37.jpeg","act38.jpeg","act39.jpeg","act4.jpeg","act40.jpeg","act41.jpeg","act42.jpeg","act44.jpeg","act45.jpeg","act5.jpeg","act6.jpeg","act7.jpeg","act8.jpeg","act9.jpeg",
  "tur1.jpeg","tur10.jpeg","tur11.jpeg","tur12.jpeg","tur13.jpeg","tur15.jpeg","tur16.jpeg","tur17.jpeg","tur18.jpeg","tur19.jpeg","tur2.jpeg","tur20.jpeg","tur21.jpeg","tur22.jpeg","tur23.jpeg","tur24.jpeg","tur25.jpeg","tur26.jpeg","tur27.jpeg","tur28.jpeg","tur29.jpeg","tur3.jpeg","tur30.jpeg","tur31.jpeg","tur32.jpeg","tur33.jpeg","tur34.jpeg","tur35.jpeg","tur36.jpeg","tur37.jpeg","tur39.jpeg","tur4.jpeg","tur40.jpeg","tur41.jpeg","tur42.jpeg","tur43.jpeg","tur44.jpeg","tur45.jpeg","tur46.jpeg","tur47.jpeg","tur48.jpeg","tur49.jpeg","tur5.jpeg","tur50.jpeg","tur51.jpeg","tur53.jpeg","tur54.jpeg","tur55.jpeg","tur56.jpeg","tur57.jpeg","tur58.jpeg","tur59.jpeg","tur6.jpeg","tur60.jpeg","tur61.jpeg","tur62.jpeg","tur64.jpeg","tur65.jpeg","tur66.jpeg","tur67.jpeg","tur68.jpeg","tur69.jpeg","tur7.jpeg","tur70.jpeg","tur71.jpeg","tur72.jpeg","tur73.jpeg","tur75.jpeg","tur76.jpeg","tur79.jpeg","tur8.jpeg","tur80.jpeg","tur82.jpeg","tur9.jpeg",
  "fin1.jpeg","fin10.jpeg","fin11.jpeg","fin12.jpeg","fin13.jpeg","fin14.jpeg","fin15.jpeg","fin16.jpeg","fin17.jpeg","fin18.jpeg","fin2.jpeg","fin20.jpeg","fin21.jpeg","fin22.jpeg","fin23.jpeg","fin24.jpeg","fin25.jpeg","fin26.jpeg","fin27.jpeg","fin28.jpeg","fin29.jpeg","fin3.jpeg","fin30.jpeg","fin31.jpeg","fin32.jpeg","fin33.jpeg","fin34.jpeg","fin36.jpeg","fin37.jpeg","fin38.jpeg","fin4.jpeg","fin40.jpeg","fin5.jpeg","fin6.jpeg","fin7.jpeg","fin8.jpeg","fin9.jpeg",
  "gal1.jpeg","gal10.jpeg","gal12.jpeg","gal13.jpeg","gal14.jpeg","gal15.jpeg","gal16.jpeg","gal17.jpeg","gal18.jpeg","gal19.jpeg","gal2.jpeg","gal20.jpeg","gal21.jpeg","gal22.jpeg","gal23.jpeg","gal24.jpeg","gal25.jpeg","gal26.jpeg","gal27.jpeg","gal28.jpeg","gal29.jpeg","gal3.jpeg","gal31.jpeg","gal33.jpeg","gal34.jpeg","gal36.jpeg","gal37.jpeg","gal38.jpeg","gal4.jpeg","gal41.jpeg","gal42.jpeg","gal43.jpeg","gal44.jpeg","gal45.jpeg","gal46.jpeg","gal47.jpeg","gal48.jpeg","gal49.jpeg","gal50.jpeg","gal51.jpeg","gal52.jpeg","gal53.jpeg","gal54.jpeg","gal55.jpeg","gal56.jpeg","gal57.jpeg","gal58.jpeg","gal59.jpeg","gal6.jpeg","gal60.jpeg","gal61.jpeg","gal62.jpeg","gal64.jpeg","gal65.jpeg","gal66.jpeg","gal67.jpeg","gal68.jpeg","gal69.jpeg","gal70.jpeg","gal71.jpeg","gal72.jpeg","gal73.jpeg","gal74.jpeg","gal75.jpeg","gal76.jpeg","gal77.jpeg","gal78.jpeg","gal8.jpeg","gal80.jpeg","gal81.jpeg","gal82.jpeg","gal83.jpeg","gal84.jpeg","gal85.jpeg","gal86.jpeg","gal87.jpeg","gal88.jpeg","gal89.jpeg","gal90.jpeg","gal91.jpeg","gal92.jpeg","gal93.jpeg","gal94.jpeg","gal95.jpeg","gal96.jpeg",
  "acacia.jpg","african_cherry.jpg","avocado.JPG","chestnut.jpg","croton_megalocarpus.jpg","drypetes.jpg","jackfruit.jpg","makhamia.jpg","matomoko.jpg","pepper_bark.jpg","silver_oak.jpg","sisal.jpg","teclea.jpg","thika_palm.jpg","toothbrush_tree.jpg",
  "future1.jpeg","future11.jpeg","future12.jpeg","future13.jpeg","future14.jpeg","future15.jpeg","future16.jpeg","future2.jpeg","future4.jpeg","future5.jpeg","future6.jpeg","future7.jpeg","future8.jpeg","future9.jpeg",
];

const CATEGORIES = [
  { id: 'all', label: 'All Photographs' },
  { id: 'activities', label: 'Activities' },
  { id: 'tours', label: 'Forest Tours' },
  { id: 'field', label: 'Field Work' },
  { id: 'forest', label: 'The Forest' },
  { id: 'species', label: 'Tree Species' },
  { id: 'future', label: 'Future Plans' },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

function categoryFor(file: string): Exclude<CategoryId, 'all'> {
  if (file.startsWith('act')) return 'activities';
  if (file.startsWith('tur')) return 'tours';
  if (file.startsWith('fin')) return 'field';
  if (file.startsWith('gal')) return 'forest';
  if (file.startsWith('future')) return 'future';
  return 'species';
}

export default function PhotoGalleryPage() {
  const [active, setActive] = useState<CategoryId>('all');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const photos = useMemo(
    () => IMAGE_PATHS.map((file, index) => ({ file, index, category: categoryFor(file) })),
    []
  );

  const filtered = useMemo(
    () => (active === 'all' ? photos : photos.filter(p => p.category === active)),
    [active, photos]
  );

  const total = filtered.length;
  const current = lightbox !== null ? filtered[lightbox] : null;

  const close = useCallback(() => setLightbox(null), []);
  const next = useCallback(() => setLightbox(i => (i === null ? i : (i + 1) % total)), [total]);
  const prev = useCallback(() => setLightbox(i => (i === null ? i : (i - 1 + total) % total)), [total]);

  // Lock page scroll while the lightbox is open.
  useEffect(() => {
    if (lightbox === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [lightbox]);

  // Keyboard: arrows browse, Home/End jump, Escape closes.
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Home') setLightbox(0);
      if (e.key === 'End') setLightbox(total - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, next, prev, total, close]);

  // Warm the cache for both neighbours so the next tap or swipe is instant.
  useEffect(() => {
    if (lightbox === null) return;
    for (const offset of [1, -1]) {
      const img = new window.Image();
      img.src = `/assets/images/${filtered[(lightbox + offset + total) % total].file}`;
    }
  }, [lightbox, filtered, total]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next();
    else prev();
  };

  return (
    <PageLayout
      title="Photo Gallery"
      subtitle="Photos of the forest and the people who care for it."
      eyebrow="Photo Gallery"
      bgImage="/assets/images/gal4.jpeg"
    >
      {/* Category filter bar */}
      <div className="sticky top-[76px] z-30 bg-[#f7f6f0]/95 backdrop-blur border-b border-[#173d2b]/10">
        <div className="max-w-8xl mx-auto container-px">
          <div className="flex items-center gap-2 overflow-x-auto py-3.5 dark-scroll">
            {CATEGORIES.map(cat => {
              const count = cat.id === 'all' ? photos.length : photos.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActive(cat.id); setLightbox(null); }}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                    active === cat.id
                      ? 'bg-[#173d2b] text-[#f7f6f0]'
                      : 'bg-transparent text-[#285b3c] border border-[#173d2b]/15 hover:border-[#285b3c]'
                  }`}
                >
                  {cat.label}
                  <span className={`ml-2 text-[0.62rem] ${active === cat.id ? 'text-[#c3a66b]' : 'text-[#285b3c]/55'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="py-12 sm:py-16">
        <div className="max-w-8xl mx-auto container-px">
          <div className="flex items-baseline justify-between gap-4 mb-8">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#285b3c]/70" aria-live="polite">
              {total} photos
            </p>
            <p className="hidden sm:block text-[0.68rem] uppercase tracking-[0.14em] text-[#3f4a42]/45">
              Tap an image to open it
            </p>
          </div>

          <div className="columns-2 sm:columns-3 xl:columns-4 gap-4">
            {filtered.map((photo, i) => (
              <button
                key={photo.file}
                onClick={() => setLightbox(i)}
                className="group relative block w-full mb-4 break-inside-avoid overflow-hidden bg-[#e6e3d8] rounded-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c3a66b]"
                aria-label={`Open photo ${i + 1} of ${total}`}
              >
                <img
                  src={`/assets/images/${photo.file}`}
                  alt={`Oloolua Forest photograph ${i + 1}`}
                  loading="lazy"
                  className="w-full h-auto block transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute inset-0 bg-[#0f2a1d]/0 group-hover:bg-[#0f2a1d]/25 transition-colors duration-300" />
                <span className="absolute bottom-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-[#f7f6f0]/90 text-[#173d2b] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Expand size={14} strokeWidth={1.8} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {current && (
        <div
          className="fixed inset-0 z-[100] bg-[#0b1a12]/97 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-[#f7f6f0] shrink-0">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#f7f6f0]/60" aria-live="polite">
              {lightbox! + 1} / {total}
            </span>
            <button
              onClick={close}
              aria-label="Close photo viewer"
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#f7f6f0]/20 text-[#f7f6f0]/80 hover:text-[#c3a66b] hover:border-[#c3a66b]/50 transition-colors"
            >
              <X size={18} strokeWidth={1.6} />
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] hidden sm:inline">Close</span>
            </button>
          </div>

          <div className="relative flex-1 min-h-0 flex items-center justify-center px-3 sm:px-16">
            <button
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-5 z-10 flex items-center justify-center w-11 h-11 rounded-full border border-[#f7f6f0]/20 text-[#f7f6f0]/75 hover:text-[#c3a66b] hover:border-[#c3a66b]/50 transition-colors"
            >
              <ChevronLeft size={22} strokeWidth={1.5} />
            </button>

            <img
              key={current.file}
              src={`/assets/images/${current.file}`}
              alt={`Oloolua Forest photograph ${lightbox! + 1} of ${total}`}
              className="max-w-full max-h-full object-contain select-none"
            />

            <button
              onClick={next}
              aria-label="Next photo"
              className="absolute right-2 sm:right-5 z-10 flex items-center justify-center w-11 h-11 rounded-full border border-[#f7f6f0]/20 text-[#f7f6f0]/75 hover:text-[#c3a66b] hover:border-[#c3a66b]/50 transition-colors"
            >
              <ChevronRight size={22} strokeWidth={1.5} />
            </button>
          </div>

          <div className="shrink-0 px-4 sm:px-6 py-4 text-center">
            <span className="text-[0.6rem] uppercase tracking-[0.2em] text-[#f7f6f0]/40">
              Oloolua Youth Guardians · Photo Gallery
            </span>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
