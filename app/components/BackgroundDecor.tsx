'use client';

import { useEffect, useRef, useState } from 'react';

export default function BackgroundDecor() {
  const [appHeight, setAppHeight] = useState('100vh');
  const firstRun = useRef(true);

  useEffect(() => {
    const updateViewportState = () => {
      const currentViewportHeight = window.visualViewport?.height || window.innerHeight;
      setAppHeight(`${currentViewportHeight}px`);
    };

    if (typeof window !== 'undefined') {
      updateViewportState();
      window.addEventListener('resize', updateViewportState);
      window.visualViewport?.addEventListener('resize', updateViewportState);
    }
    return () => {
      window.removeEventListener('resize', updateViewportState);
      window.visualViewport?.removeEventListener('resize', updateViewportState);
    };
  }, []);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
    }
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 #FFDFC4"
      style={{ height: appHeight }}
      aria-hidden
    />
  );
}
