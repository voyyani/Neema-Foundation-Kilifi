import React from 'react';
import clsx from 'clsx';
import type { PublicProgram } from '../../hooks/public/usePublicPrograms';
import { Tally } from '../ui';

/**
 * HeroTallies — three figures under the hero, each with its unit, period
 * and subject. Programme and beneficiary counts come from the CMS where it
 * has them; the shipped claims ("5,000+ beneficiaries", "since 2020") are
 * the Foundation's own and stand in when the CMS has no figure.
 */
const HeroTallies: React.FC<{ programs: PublicProgram[]; className?: string }> = ({ programs, className }) => {
  const activeCount = programs.filter((p) => p.is_active !== false).length;
  const beneficiaries = programs.reduce((sum, p) => sum + (p.beneficiary_count || 0), 0);
  return (
    <dl className={clsx('grid grid-cols-1 gap-y-6 gap-x-8 border-t border-border-rule pt-rule sm:grid-cols-3', className)}>
      <div>
        <dt className="sr-only">People reached</dt>
        <dd>
          <Tally
            size="md"
            value={beneficiaries > 0 ? `${beneficiaries.toLocaleString('en-KE')}+` : '5,000+'}
            unit="people reached"
            period="since 2020"
            subject="across the programmes · Ganze Sub-county"
          />
        </dd>
      </div>
      <div>
        <dt className="sr-only">Programmes</dt>
        <dd>
          <Tally
            size="md"
            value={activeCount > 0 ? activeCount : 4}
            unit={activeCount === 1 ? 'programme' : 'programmes'}
            period="running now"
            subject="health · education · missions · resilience"
          />
        </dd>
      </div>
      <div>
        <dt className="sr-only">Founded</dt>
        <dd>
          <Tally size="md" static value="2020" unit="the year we began" period="registered CBO" subject="Kilifi County, Kenya" />
        </dd>
      </div>
    </dl>
  );
};

export default HeroTallies;
