/**
 * ProgramPlate — a programme as a captioned plate: the photograph, the
 * name in condensed caps, the one-line summary, who it serves and how
 * many. Used on the home page, the programmes index and related lists.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import type { PublicProgram } from '../../hooks/public/usePublicPrograms';
import { Badge, Figure } from '../ui';
import { CATEGORY_LABEL, STATUS_LABEL, programCover } from './labels';

const ProgramPlate: React.FC<{ program: PublicProgram; lead?: boolean; className?: string }> = ({ program, lead = false, className }) => {
  const image = programCover(program);
  const count = program.beneficiary_count && program.beneficiary_count > 0 ? program.beneficiary_count.toLocaleString('en-KE') : null;
  const status = program.program_status && program.program_status !== 'active' ? STATUS_LABEL[program.program_status] : '';
  return (
    <article className={clsx('group', className)}>
      <Link to={`/programs/${program.slug}`} className="block rounded focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none">
        <Figure
          src={image || undefined}
          alt={program.name}
          aspectRatio={lead ? '16:9' : '4:3'}
          size={lead ? 'hero' : 'card'}
          sizes={lead ? '(min-width: 1024px) 720px, 100vw' : '(min-width: 1024px) 380px, 100vw'}
          caption={program.beneficiary_where || 'Ganze Sub-county'}
          detail={CATEGORY_LABEL[program.category] ?? 'Programme'}
          imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
        <h3 className={clsx('mt-3 font-display uppercase text-content', lead ? 'text-display-md' : 'text-display-sm')}>
          {program.name}
          {status && <Badge variant="ink" size="sm" className="ml-2 align-middle font-sans normal-case">{status}</Badge>}
        </h3>
      </Link>
      <p className="mt-2 max-w-measure text-base leading-7 text-content-2">{program.summary || program.description}</p>
      {(program.beneficiary_who || count) && (
        <p className="mt-2 text-sm text-content-3">
          {count && <span className="tabular font-semibold text-content">{count}+ </span>}
          {program.beneficiary_who ?? 'people'}
        </p>
      )}
      <Link to={`/programs/${program.slug}`} className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-semibold text-brand-700 underline-offset-4 hover:underline">
        {program.cta_label || 'About this programme'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
};

export default ProgramPlate;
