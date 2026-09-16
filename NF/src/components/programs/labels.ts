import type { PublicProgram } from '../../hooks/public/usePublicPrograms';
import { resolveProgramCover, type ProgramImage } from '../../lib/programImageUtils';

export const CATEGORY_LABEL: Record<string, string> = {
  health: 'Health', education: 'Education', empowerment: 'Empowerment', community: 'Community', other: 'Programme',
};

export const STATUS_LABEL: Record<string, string> = {
  upcoming: 'Starting soon', active: 'Running', paused: 'Paused', completed: 'Completed', archived: 'Archived', draft: '',
};

export const programCover = (p: PublicProgram) =>
  resolveProgramCover((p.images_json ?? []) as ProgramImage[], p.cover_image);
