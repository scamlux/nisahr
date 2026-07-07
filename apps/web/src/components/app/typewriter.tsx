'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Client-side "streaming" reveal. The mock provider (default, zero-key) returns
 * a full string instantly, so there is nothing to truly stream — this animates
 * the same text word-by-word for the streaming-chat feel, identically across
 * every provider. When `stream` is false the text renders immediately (history).
 */
export function Typewriter({
  text,
  stream,
  onDone,
  speed = 18,
}: {
  text: string;
  stream: boolean;
  onDone?: () => void;
  speed?: number;
}) {
  const [count, setCount] = useState(stream ? 0 : text.length);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!stream) {
      setCount(text.length);
      return;
    }
    // Reveal by character index on a fixed interval; cheap and smooth.
    let i = 0;
    const step = Math.max(1, Math.round(text.length / 90)); // finish long msgs in ~90 ticks
    const id = setInterval(() => {
      i = Math.min(text.length, i + step);
      setCount(i);
      if (i >= text.length) {
        clearInterval(id);
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
      }
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, stream]);

  const shown = stream ? text.slice(0, count) : text;
  const streaming = stream && count < text.length;
  return (
    <span>
      {shown}
      {streaming && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-primary/70 align-middle" />}
    </span>
  );
}
