import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Container, Section } from '../ui';

/**
 * GalleryHeader — the top of an album, event or programme gallery: a way
 * back, the title, the facts (date, place, count) on one ruled line, and
 * the description if the CMS has one.
 */
const GalleryHeader: React.FC<{
  id: string;
  back?: { to: string; label: string };
  title: string;
  description?: string | null;
  facts?: (string | null | undefined)[];
  actions?: React.ReactNode;
}> = ({ id, back = { to: '/media', label: 'All photographs' }, title, description, facts = [], actions }) => (
  <Section ground="ruled" pad="none" as="header" aria-labelledby={id}>
    <Container className="pt-6 pb-rule md:pt-rule md:pb-rule-2">
      <Link to={back.to} className="inline-flex items-center gap-1.5 text-sm font-medium text-content-3 underline-offset-4 hover:text-content hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {back.label}
      </Link>
      <h1 id={id} className="mt-rule font-display uppercase text-display-lg text-content max-w-[18ch]">{title}</h1>
      {facts.filter(Boolean).length > 0 && (
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm tabular text-content-3">
          {facts.filter(Boolean).map((f, i) => <span key={i}>{i > 0 && <span aria-hidden="true" className="mr-3">·</span>}{f}</span>)}
        </p>
      )}
      {description && <p className="mt-4 max-w-measure text-base leading-rule text-content-2 md:text-lg">{description}</p>}
      {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
    </Container>
  </Section>
);

export default GalleryHeader;
