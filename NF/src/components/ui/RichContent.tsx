// components/ui/RichContent.tsx
// Safely renders HTML/Markdown content with proper sanitization
import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface RichContentProps {
  content: string;
  format?: 'html' | 'plain';
  className?: string;
}

/**
 * RichContent Component
 * 
 * Safely renders HTML content with DOMPurify sanitization.
 * Use this for any user-generated or CMS content that may contain HTML.
 * 
 * @example
 * <RichContent content={program.fullDescription} />
 * <RichContent content={story.content} format="html" className="prose-sm" />
 */
export function RichContent({ content, format = 'html', className = '' }: RichContentProps) {
  const sanitizedHtml = useMemo(() => {
    if (!content) return '';
    
    // Sanitize HTML content
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'strong', 'b', 'em', 'i', 'u',
        'a', 'blockquote', 'pre', 'code',
        'img', 'figure', 'figcaption',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel',
        'src', 'alt', 'title', 'width', 'height',
        'class', 'id',
      ],
      // Force all links to open in new tab
      FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
      ADD_ATTR: ['target'],
    });
  }, [content]);
  
  // For plain text, just render as paragraph
  if (format === 'plain' || !content) {
    return <p className={className}>{content || ''}</p>;
  }
  
  return (
    <div 
      className={`prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-red-700 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

export default RichContent;
