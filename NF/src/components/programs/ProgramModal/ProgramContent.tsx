// ProgramModal/ProgramContent.tsx
// Rich text description with proper HTML rendering

import { Sparkles } from 'lucide-react';
import { RichContent } from '../../ui/RichContent';
import type { ProgramData, ColorScheme } from './types';
import { defaultColorScheme } from './types';

interface ProgramContentProps {
  program: ProgramData;
  colorScheme?: ColorScheme;
  showHeading?: boolean;
}

export function ProgramContent({ 
  program, 
  colorScheme = defaultColorScheme,
  showHeading = true
}: ProgramContentProps) {
  const content = program.fullDescription || program.description;
  
  if (!content) return null;

  return (
    <div className="mb-8">
      {showHeading && (
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className={`h-5 w-5 ${colorScheme.accent}`} />
          About This Program
        </h3>
      )}
      
      <RichContent 
        content={content} 
        className="text-gray-700 leading-relaxed prose-headings:text-gray-900 prose-a:text-[#B01C2E] prose-strong:text-gray-900"
      />
    </div>
  );
}
