'use client';

import { useEffect, useState } from 'react';

/** Track vertical scroll position (header states, progress UIs). */
export function useScrollY(): number {
  const [y, setY] = useState(0);

  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return y;
}
