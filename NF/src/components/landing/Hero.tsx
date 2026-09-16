/**
 * Hero — the first page of the book.
 *
 * Ruled paper, the red margin rail, the headline written large in
 * condensed caps, one sentence beneath, the two actions, then the
 * photograph placed as a captioned plate. Slides come from the CMS
 * (hero_content); several slides rotate slowly, one slide simply stands.
 * The mission film opens on request in a lazily loaded modal.
 */
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import clsx from 'clsx';
import { usePublicHeroSlides, usePublicPrograms } from '../../hooks/public';
import { fallbackHeroSlide } from '../../lib/dataMappers';
import { HERO_FALLBACK_IMAGE } from './assets';
import { useReducedMotionPref } from '../../lib/motion';
import { Button, Container, Figure, Section } from '../ui';
import HeroTallies from './HeroTallies';

const MissionVideoModal = React.lazy(() => import('./MissionVideoModal'));

const ROTATE_MS = 7000;

const Hero: React.FC = () => {
  const { data: slides = [] } = usePublicHeroSlides();
  const { data: programs = [] } = usePublicPrograms();
  const reduce = useReducedMotionPref();
  const active = slides.length > 0 ? slides : [fallbackHeroSlide];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [filmOpen, setFilmOpen] = useState(false);

  const slide = active[Math.min(index, active.length - 1)];
  const next = useCallback(() => setIndex((i) => (i + 1) % active.length), [active.length]);

  useEffect(() => {
    if (active.length < 2 || paused || reduce) return;
    const id = window.setInterval(next, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [active.length, paused, reduce, next]);

  const ctaLabel = slide.cta_label || 'Give to the Foundation';
  const ctaHref = slide.cta_href || '/donate';
  const featured = programs.find((p) => p.is_featured) ?? programs[0];
  const caption = featured
    ? `${featured.name} · Ganze Sub-county, Kilifi`
    : 'Ganze Sub-county, Kilifi County';

  return (
    <Section ground="ruled" pad="none" as="header" aria-labelledby="hero-title" className="overflow-hidden">
      <Container className="pt-rule pb-rule-2 md:pt-rule-2 md:pb-rule-3">
        <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
          {/* the writing */}
          <div className="md:col-span-7 md:self-center">
            <h1 id="hero-title" className="font-display uppercase text-display-xl text-content max-w-[14ch]">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="mt-rule max-w-measure text-lg leading-rule text-content-2 md:text-xl">
                {slide.subtitle}
              </p>
            )}
            <div className="mt-rule flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button to={ctaHref.startsWith('/') ? ctaHref : '/donate'} size="lg" trailingIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>
                {ctaLabel}
              </Button>
              <Button to="/programs" size="lg" variant="secondary">
                See the programmes
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setFilmOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded text-[15px] font-medium text-brand-700 underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Watch the mission film (2 min)
            </button>
          </div>

          {/* the plate */}
          <div
            className="md:col-span-5"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <div className="relative">
              {active.map((s, i) => (
                <div
                  key={s.id}
                  className={clsx(
                    'transition-opacity duration-700 ease-out',
                    i === index ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0',
                  )}
                  aria-hidden={i !== index}
                >
                  <Figure
                    src={s.background_image || undefined}
                    fallbackUrl={HERO_FALLBACK_IMAGE}
                    alt={s.title}
                    aspectRatio="4:3"
                    size="card"
                    priority={i === 0}
                    sizes="(min-width: 1024px) 480px, 100vw"
                    caption={caption}
                    detail={active.length > 1 ? `${i + 1} of ${active.length}` : 'Since 2020'}
                  />
                </div>
              ))}
            </div>
            {active.length > 1 && (
              <div className="mt-3 flex items-center gap-2" role="group" aria-label="Hero photographs">
                {active.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show photograph ${i + 1}`}
                    aria-current={i === index}
                    className={clsx('h-2.5 rounded-full transition-all duration-300', i === index ? 'w-6 bg-brand-600' : 'w-2.5 bg-border-strong hover:bg-content-3')}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <HeroTallies programs={programs} className="mt-rule-2" />
      </Container>

      {filmOpen && (
        <Suspense fallback={null}>
          <MissionVideoModal open={filmOpen} onClose={() => setFilmOpen(false)} />
        </Suspense>
      )}
    </Section>
  );
};

export default Hero;
