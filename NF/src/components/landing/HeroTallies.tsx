import React from 'react';
import clsx from 'clsx';
import type { PublicProgram } from '../../hooks/public/usePublicPrograms';
import { usePublicFigures } from '../../hooks/public/usePublicFigures';
import { Tally } from '../ui';

/**
 * HeroTallies — three figures under the hero, each with its unit, period
 * and subject. Figures resolve through usePublicFigures (CMS metric →
 * programme counts → standing claim) so the hero, the programmes page and
 * the impact board never disagree.
 */
const HeroTallies: React.FC<{ programs?: PublicProgram[]; className?: string }> = ({ className }) => {
  const { peopleReached, programmes } = usePublicFigures();
  return (
    <dl className={clsx('grid grid-cols-1 gap-y-6 gap-x-8 border-t border-border-rule pt-rule sm:grid-cols-3', className)}>
      <div>
        <dt className="sr-only">People reached</dt>
        <dd>
          <Tally
            size="md"
            value={peopleReached.value}
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
            value={programmes.value}
            unit={programmes.number === 1 ? 'programme' : 'programmes'}
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
