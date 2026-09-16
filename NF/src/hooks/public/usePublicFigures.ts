/**
 * usePublicFigures — the three headline figures, resolved once for every
 * surface that quotes them (hero tallies, programmes page, impact board).
 *
 * Roadmap 3.8: the CMS must be the source of truth. Resolution order:
 *   1. an active impact metric whose label names the figure
 *      ("people reached", "beneficiaries", "children fed", …)
 *   2. what the programme rows add up to (beneficiary_count, active count)
 *   3. the Foundation's standing claim, carried forward verbatim
 *
 * Every figure says which source it came from so a surface can tell the
 * reader whether it is this year's count or the standing one.
 */
import { useMemo } from 'react';
import { usePublicImpactMetrics } from './usePublicImpactMetrics';
import { usePublicPrograms } from './usePublicPrograms';

export type FigureSource = 'metric' | 'programs' | 'standing';

export interface PublicFigure {
  /** Display value, formatted ("5,000+", "650+", "4") */
  value: string;
  /** Raw number when known */
  number: number | null;
  source: FigureSource;
}

export interface PublicFigures {
  peopleReached: PublicFigure;
  childrenFed: PublicFigure;
  programmes: PublicFigure;
  isLoading: boolean;
  /** True when any figure is a standing claim rather than a live count */
  anyStanding: boolean;
}

const STANDING = {
  peopleReached: 5000,
  childrenFed: 650,
  programmes: 4,
} as const;

const matches = (label: string, patterns: RegExp[]) => patterns.some((p) => p.test(label));

const PEOPLE = [/people\s+reached/i, /beneficiar/i, /lives\s+(touched|reached|changed)/i];
const CHILDREN = [/children\s+(fed|served)/i, /meals?\b/i, /\bfed\b/i];
const PROGRAMMES = [/programme?s?\b/i];

const fmt = (n: number, plus: boolean) => `${n.toLocaleString('en-KE')}${plus ? '+' : ''}`;

export function usePublicFigures(): PublicFigures {
  const { data: metrics = [], isLoading: metricsLoading } = usePublicImpactMetrics();
  const { data: programs = [], isLoading: programsLoading } = usePublicPrograms();

  return useMemo(() => {
    const active = metrics.filter((m) => m.is_active !== false);
    const find = (patterns: RegExp[]) => active.find((m) => matches(m.label, patterns) && m.value > 0);

    const metricFigure = (patterns: RegExp[]): PublicFigure | null => {
      const m = find(patterns);
      if (!m) return null;
      // The admin's suffix ("+", "%", " families") is part of the claim.
      return { value: `${m.value.toLocaleString('en-KE')}${m.suffix ?? ''}`, number: m.value, source: 'metric' };
    };

    const sumBeneficiaries = programs.reduce((s, p) => s + (p.beneficiary_count || 0), 0);
    const activeProgrammes = programs.filter((p) => p.is_active !== false).length;

    const peopleReached: PublicFigure =
      metricFigure(PEOPLE) ??
      (sumBeneficiaries > 0
        ? { value: fmt(sumBeneficiaries, true), number: sumBeneficiaries, source: 'programs' }
        : { value: fmt(STANDING.peopleReached, true), number: STANDING.peopleReached, source: 'standing' });

    const childrenFed: PublicFigure =
      metricFigure(CHILDREN) ??
      { value: fmt(STANDING.childrenFed, true), number: STANDING.childrenFed, source: 'standing' };

    const programmes: PublicFigure =
      activeProgrammes > 0
        ? { value: String(activeProgrammes), number: activeProgrammes, source: 'programs' }
        : metricFigure(PROGRAMMES) ??
          { value: String(STANDING.programmes), number: STANDING.programmes, source: 'standing' };

    return {
      peopleReached,
      childrenFed,
      programmes,
      isLoading: metricsLoading || programsLoading,
      anyStanding: [peopleReached, childrenFed, programmes].some((f) => f.source === 'standing'),
    };
  }, [metrics, programs, metricsLoading, programsLoading]);
}

export default usePublicFigures;
