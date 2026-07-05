'use client';

import { motion, type Variants } from 'framer-motion';

export type Segment = { text: string; className?: string; break?: boolean };

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};

const wordV: Variants = {
  hidden: { opacity: 0, y: '0.5em', filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Reveals text word-by-word with a soft blur + rise. `trigger="mount"` plays
 * on load (hero); `trigger="view"` plays once when scrolled into view.
 * Renders inline <span>s so it drops into any heading/paragraph.
 */
export function WordsReveal({
  segments,
  className,
  trigger = 'view',
}: {
  segments: Segment[];
  className?: string;
  trigger?: 'mount' | 'view';
}) {
  const play =
    trigger === 'mount'
      ? { initial: 'hidden' as const, animate: 'show' as const }
      : {
          initial: 'hidden' as const,
          whileInView: 'show' as const,
          viewport: { once: true, margin: '-80px' },
        };

  return (
    <motion.span variants={container} {...play} className={className} style={{ display: 'inline-block' }}>
      {segments.map((seg, si) =>
        seg.break ? (
          <br key={`b-${si}`} />
        ) : (
          seg.text
            .split(' ')
            .filter(Boolean)
            .map((word, wi) => (
              <span key={`${si}-${wi}`} className="inline-block whitespace-nowrap">
                <motion.span variants={wordV} className={`inline-block ${seg.className ?? ''}`}>
                  {word}
                </motion.span>
                {' '}
              </span>
            ))
        ),
      )}
    </motion.span>
  );
}
