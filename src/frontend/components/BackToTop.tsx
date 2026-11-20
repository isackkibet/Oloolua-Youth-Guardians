'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0 })}
      className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#173d2b] text-[#c3a66b] border border-[#c3a66b]/40 shadow-[0_12px_30px_-12px_rgba(15,42,29,0.6)] flex items-center justify-center transition-all duration-300 hover:bg-[#285b3c] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c3a66b] ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" strokeWidth={1.8} />
    </button>
  );
}
