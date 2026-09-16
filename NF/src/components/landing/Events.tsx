/**
 * Events — what is coming up and what just happened, as a dated list. The
 * date is written as it would be on a notice: day large, month beneath.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { usePublicPastEvents, usePublicUpcomingEvents } from '../../hooks/public';
import type { PublicEvent } from '../../hooks/public/usePublicEvents';
import { Badge, Button, Container, Section, SectionHeading } from '../ui';

const DateBlock: React.FC<{ iso: string }> = ({ iso }) => {
  const d = new Date(iso);
  return (
    <time dateTime={iso} className="flex w-14 shrink-0 flex-col items-center rounded border border-border-rule bg-white py-1.5 tabular">
      <span className="font-display text-2xl font-extrabold leading-none text-content">{d.getDate()}</span>
      <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-content-3">{d.toLocaleDateString('en-KE', { month: 'short' })}</span>
    </time>
  );
};

const EventRow: React.FC<{ event: PublicEvent; past?: boolean }> = ({ event, past = false }) => (
  <li className="flex gap-4 border-t border-border-rule py-5">
    <DateBlock iso={event.start_date} />
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-content">{event.name}</h3>
        {past ? <Badge variant="ink" size="sm">Past</Badge> : event.requires_registration ? <Badge variant="brand" size="sm">Registration</Badge> : null}
      </div>
      {event.purpose && <p className="mt-1 max-w-measure text-sm leading-6 text-content-2">{event.purpose}</p>}
      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-content-3">
        {event.start_time && <span className="tabular">{event.start_time.slice(0, 5)}{event.end_time ? `–${event.end_time.slice(0, 5)}` : ''}</span>}
        {(event.venue_name || event.is_virtual) && (
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{event.is_virtual ? 'Online' : event.venue_name}</span>
        )}
        {event.program_name && event.program_slug && (
          <Link to={`/programs/${event.program_slug}`} className="underline-offset-4 hover:underline">{event.program_name}</Link>
        )}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
        {!past && event.requires_registration && event.registration_link && (
          <a href={event.registration_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-700 underline-offset-4 hover:underline">Register <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
        )}
        {past && <Link to={`/media/events/${event.slug}`} className="inline-flex items-center gap-1 text-brand-700 underline-offset-4 hover:underline">Photographs <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
      </div>
    </div>
  </li>
);

const Events: React.FC = () => {
  const { data: upcoming = [], isLoading: loadingUp } = usePublicUpcomingEvents({ limit: 4 });
  const { data: past = [], isLoading: loadingPast } = usePublicPastEvents({ limit: 3 });
  const loading = loadingUp || loadingPast;

  return (
    <Section ground="ruled-faint" pad="lg" id="events" aria-labelledby="events-title">
      <Container>
        <SectionHeading
          id="events-title"
          title="Events"
          lede="Community activities and programme days across Ganze Sub-county."
          aside={<Button to="/media" variant="secondary" size="sm" trailingIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>Event photographs</Button>}
        />
        {loading && <div className="h-24 animate-pulse rounded bg-surface-paper-3" aria-busy="true" aria-label="Loading events" />}
        {!loading && (
          <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
            <div className="md:col-span-7">
              <h3 className="mb-1 text-sm font-semibold text-content-3">Coming up</h3>
              {upcoming.length === 0 ? (
                <p className="border-t border-border-rule pt-5 text-content-2">Nothing scheduled right now. Follow us or check back soon.</p>
              ) : (
                <ul>{upcoming.map((e) => <EventRow key={e.id} event={e} />)}</ul>
              )}
            </div>
            <div className="md:col-span-5">
              <h3 className="mb-1 text-sm font-semibold text-content-3">Recently</h3>
              {past.length === 0 ? (
                <p className="border-t border-border-rule pt-5 text-content-2">Past events will appear here with their photographs.</p>
              ) : (
                <ul>{past.map((e) => <EventRow key={e.id} event={e} past />)}</ul>
              )}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
};

export default Events;
