/**
 * Stories — voices from the programmes, quoted from the CMS. Testimonials
 * are set as pull quotes in the pen's colour with the speaker named; other
 * stories are listed by title. Nothing here is written by us.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePublicStories } from '../../hooks/public';
import type { PublicStory } from '../../hooks/public/usePublicStories';
import { Container, Figure, Section, SectionHeading } from '../ui';

const Quote: React.FC<{ story: PublicStory }> = ({ story }) => {
  const text = story.excerpt || story.content?.replace(/<[^>]+>/g, '').slice(0, 280) || story.title;
  const photo = story.author_photo_url || story.author_photo || null;
  return (
    <blockquote className="border-t border-border-rule pt-5">
      <p className="font-display text-display-sm text-content">
        <span aria-hidden="true" className="text-brand-600">“</span>{text}<span aria-hidden="true" className="text-brand-600">”</span>
      </p>
      <footer className="mt-4 flex items-center gap-3">
        {photo && <img src={photo} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" loading="lazy" decoding="async" />}
        <div className="text-sm">
          <p className="font-semibold text-content">{story.author_name ?? 'A member of the community'}</p>
          {story.author_role && <p className="text-content-3">{story.author_role}</p>}
        </div>
      </footer>
    </blockquote>
  );
};

const Stories: React.FC = () => {
  const { data: stories = [], isLoading, error } = usePublicStories();
  const published = stories.filter((s) => s.is_published !== false);
  const quotes = published.filter((s) => s.category === 'testimonial').slice(0, 3);
  const others = published.filter((s) => s.category !== 'testimonial').slice(0, 3);
  const lead = others.find((s) => s.cover_image || s.image_url) ?? others[0];

  if (!isLoading && published.length === 0) return null;

  return (
    <Section ground="paper" pad="lg" id="stories" aria-labelledby="stories-title">
      <Container>
        <SectionHeading id="stories-title" title="From the community" lede="In their own words: the people the programmes serve, and news from Ganze." />
        {isLoading && <div className="h-24 animate-pulse rounded bg-surface-paper-3" aria-busy="true" aria-label="Loading stories" />}
        <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
          {quotes.length > 0 && (
            <div className="space-y-rule md:col-span-6">
              {quotes.map((s) => <Quote key={s.id} story={s} />)}
            </div>
          )}
          {lead && (
            <article className={quotes.length > 0 ? 'md:col-span-5 md:col-start-8' : 'md:col-span-8'}>
              {(lead.cover_image || lead.image_url) && (
                <Figure
                  src={lead.cover_image || lead.image_url || undefined}
                  alt={lead.title}
                  aspectRatio="3:2"
                  size="card"
                  sizes="(min-width: 1024px) 480px, 100vw"
                  caption={lead.published_at ? new Date(lead.published_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : undefined}
                  detail={lead.category}
                />
              )}
              <h3 className="mt-3 font-display uppercase text-display-sm text-content">{lead.title}</h3>
              {lead.excerpt && <p className="mt-2 max-w-measure text-base leading-7 text-content-2">{lead.excerpt}</p>}
              {others.length > 1 && (
                <ul className="mt-5 divide-y divide-border border-t border-border">
                  {others.filter((s) => s.id !== lead.id).map((s) => (
                    <li key={s.id} className="py-3">
                      <Link to="/media" className="group inline-flex items-center gap-2 font-medium text-content underline-offset-4 hover:underline">
                        {s.title} <ArrowRight className="h-4 w-4 text-content-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          )}
        </div>
      </Container>
    </Section>
  );
};

export default Stories;
