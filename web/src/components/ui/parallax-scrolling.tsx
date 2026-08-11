/* src/components/ui/parallax-scrolling.tsx */
'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');

    if (triggerElement) {
      // Initialize Lenis for smooth scrolling
      // Lenis v1 option names: `smooth`/`smoothTouch` were removed in favour of
      // `smoothWheel`/`syncTouch`.
      const lenis = new Lenis({
        smoothWheel: true,
        lerp: 0.1,
        syncTouch: false,
      });

      // raf() takes the timestamp the browser hands to the callback.
      const scroll = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(scroll);
      };
      requestAnimationFrame(scroll);

      // Setup GSAP animation for parallax layers
      gsap.utils.toArray<HTMLElement>('[data-parallax-layer]', { scope: triggerElement }).forEach((layer) => {
        const speed = Number(layer.dataset.parallaxSpeed) || 0.5;
        gsap.fromTo(
          layer,
          { y: 0 },
          {
            y: -200 * speed,
            scrollTrigger: {
              trigger: triggerElement,
              scrub: true,
              start: 'top bottom',
              end: 'bottom top',
            },
          }
        );
      });
    }
  }, []);

  return (
    <section ref={parallaxRef} className="relative w-full min-h-screen overflow-hidden" data-parallax-layers>
      {/* Example layers – replace with your own content */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-300 to-green-600" data-parallax-layer data-parallax-speed="0.2" />
      <div className="absolute inset-0 bg-[url('/your-image.jpg')] bg-cover bg-center" data-parallax-layer data-parallax-speed="0.5" />
      <div className="relative container mx-auto px-4 py-32 text-center" data-parallax-layer data-parallax-speed="0.8">
        <h1 className="text-5xl font-bold text-white mb-4">Welcome to Sproutt</h1>
        <p className="text-xl text-white/80">Experience a smooth, immersive scrolling journey.</p>
      </div>
    </section>
  );
}
