/**
 * /maintenance — the status page. It reports what the maintenance system
 * actually says: the active global rule with its message, countdown and
 * live updates, or that everything is running. Nothing on this page is a
 * placeholder countdown.
 */
import React, { Suspense } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Seo from '../lib/seo/Seo';
import { getRouteMeta } from '../lib/seo/routeMeta';
import { useMaintenanceContext } from '../components/maintenance';
import { Button, Container, Section, LoadingSpinner } from '../components/ui';

const MaintenancePlaceholder = React.lazy(() => import('../components/maintenance/MaintenancePlaceholder'));

const Maintenance: React.FC = () => {
  const { rules, isLoading } = useMaintenanceContext();
  const meta = getRouteMeta('/maintenance');
  const active = [...rules].sort((a, b) => b.priority - a.priority);
  const global = active.find((r) => r.scope === 'global');
  const headline = global ?? active[0];

  return (
    <>
      {meta && <Seo meta={meta} />}
      {isLoading ? (
        <LoadingSpinner fullPage text="Checking site status…" />
      ) : headline ? (
        <Suspense fallback={<LoadingSpinner fullPage text={null} />}>
          <MaintenancePlaceholder rule={{ ...headline, severity: 'full_block' }} minHeight="70vh" />
          {active.length > 1 && (
            <Section ground="paper" pad="md" aria-labelledby="other-work">
              <Container>
                <h2 id="other-work" className="font-display uppercase text-display-sm text-content">Also affected</h2>
                <ul className="mt-4 max-w-measure divide-y divide-border">
                  {active.filter((r) => r.id !== headline.id).map((r) => (
                    <li key={r.id} className="py-3">
                      <p className="font-semibold text-content">{r.title}</p>
                      {r.message && <p className="text-sm text-content-2">{r.message}</p>}
                      <p className="mt-1 text-xs text-content-3">{r.scope.replace('_', ' ')} · {r.target_key}</p>
                    </li>
                  ))}
                </ul>
              </Container>
            </Section>
          )}
        </Suspense>
      ) : (
        <Section ground="ruled-faint" pad="lg" className="flex-1">
          <Container>
            <div className="flex max-w-measure flex-col gap-5">
              <CheckCircle2 className="h-8 w-8 text-success-600" aria-hidden="true" />
              <h1 className="font-display uppercase text-display-lg text-content">Everything is running</h1>
              <p className="text-lg leading-8 text-content-2">
                No part of the site is under maintenance right now. If something is not working for you, tell us and we will look into it.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button to="/">Go to the home page</Button>
                <Button to="/#contact" variant="secondary">Contact the office</Button>
              </div>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
};

export default Maintenance;
