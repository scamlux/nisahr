'use client';

import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface RevealOptions {
  /** Elements to reveal within the scope. Default: `[data-reveal]`. */
  selector?: string;
  y?: number;
  duration?: number;
  stagger?: number;
  /** ScrollTrigger start position. Default `top 85%`. */
  start?: string;
}

/**
 * Scroll-reveals elements matching `selector` inside `scope` using GSAP
 * ScrollTrigger.batch — items animate in (with a stagger) as they enter the
 * viewport, once. Honors `prefers-reduced-motion` (elements stay fully visible).
 *
 * Usage: attach `data-reveal` to the elements and call
 * `useScrollReveal(rootRef)` from the (client) component.
 */
export function useScrollReveal<T extends HTMLElement>(
  scope: RefObject<T | null>,
  { selector = '[data-reveal]', y = 28, duration = 0.7, stagger = 0.09, start = 'top 85%' }: RevealOptions = {},
): void {
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>(selector);
    if (!targets.length) return;

    if (prefersReduced()) {
      gsap.set(targets, { clearProps: 'opacity,transform' });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y });
      ScrollTrigger.batch(targets, {
        start,
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration,
            stagger,
            ease: 'power3.out',
            overwrite: true,
          }),
      });
    }, el);

    return () => ctx.revert();
  }, [scope, selector, y, duration, stagger, start]);
}

/**
 * Subtle scroll-linked parallax for a decorative element (e.g. a hero blob).
 * Moves the target vertically as its scope scrolls through the viewport.
 * No-op under reduced motion.
 */
export function useParallax<T extends HTMLElement>(
  scope: RefObject<T | null>,
  { selector, yPercent = 20 }: { selector: string; yPercent?: number },
): void {
  useEffect(() => {
    const el = scope.current;
    if (!el || prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.to(selector, {
        yPercent,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, [scope, selector, yPercent]);
}
