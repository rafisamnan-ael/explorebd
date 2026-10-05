import { useEffect, useMemo, useState } from 'react';
import { heroImages } from '@/data/heroImages';

const INTERVAL_MS = 6000;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = heroImages.length;

  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  // Only mount the active and neighbouring slides to keep initial load light.
  const visible = useMemo(() => new Set([index, (index + 1) % count, (index - 1 + count) % count]), [index, count]);
  const active = heroImages[index];

  return (
    <>
      <div className="hero-slideshow" aria-hidden>
        {heroImages.map((image, i) =>
          visible.has(i) ? (
            <img
              key={image.slug}
              className="hero-slide"
              data-active={i === index}
              src={image.src}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'auto'}
            />
          ) : null,
        )}
        <div className="hero-slide-overlay" />
        <div className="hero-slide-vignette" />
      </div>

      <div className="hero-slide-caption">
        <span className="hero-slide-place">{active.place}</span>
        <span className="hero-slide-line">{active.caption}</span>
      </div>

      <div className="hero-dots" role="tablist" aria-label="Photos">
        {heroImages.map((image, i) => (
          <button
            key={image.slug}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={image.place}
            className="hero-dot"
            data-active={i === index}
            onClick={() => {
              setIndex(i);
              setPaused(true);
            }}
          />
        ))}
      </div>
    </>
  );
}
