// Rich Text Editor Component using Tiptap

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading2, Quote } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Start typing...',
  minHeight = '200px'
}: RichTextEditorProps) {
  // Keep a stable ref to the latest onChange so TipTap's event listener
  // is never stale regardless of how many times the parent re-renders.
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // HTML source-mode toggle — lets the user paste raw HTML that gets parsed
  // back into Tiptap's WYSIWYG format on switch.
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState(content);

  // Stable references — TipTap compares by identity; recreating these on every
  // render triggers the "Duplicate extension names" warning and unnecessary
  // editor re-initialisation.
  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-[#B01C2E] underline' },
    }),
    Underline,
    Placeholder.configure({ placeholder }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [placeholder]); // placeholder is the only prop that affects extensions

  const editorProps = useMemo(() => ({
    attributes: {
      class: 'prose prose-sm max-w-none focus:outline-none p-4',
      style: `min-height: ${minHeight}`,
    },
  }), [minHeight]);

  const editor = useEditor({
    extensions,
    content,
    editorProps,
  });

  // Register the update listener after the editor is ready.
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const html = editor.getHTML();
      // Consider empty when TipTap has no meaningful text content
      // (covers <p></p>, <p><br></p>, whitespace-only nodes, etc.)
      const textContent = editor.state.doc.textContent.trim();
      const isEmpty = !textContent && (html === '<p></p>' || html === '' || !/\S/.test(html.replace(/<[^>]*>/g, '')));
      onChangeRef.current(isEmpty ? '' : html);
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  // ── Source mode toggle handlers ──────────────────────────────────────────

  const enterSourceMode = () => {
    // Snapshot the current WYSIWYG content into the textarea
    const html = editor.getHTML();
    setSourceHtml(html === '<p></p>' ? '' : html);
    setSourceMode(true);
  };

  const exitSourceMode = () => {
    // Parse the raw HTML back into Tiptap and notify parent
    const trimmed = sourceHtml.trim();
    editor.commands.setContent(trimmed || '', false);
    onChangeRef.current(trimmed);
    setSourceMode(false);
  };

  // ── Toolbar helpers ──────────────────────────────────────────────────────

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
        {/* WYSIWYG controls — hidden in source mode */}
        {!sourceMode && (
          <>
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
              title="Bold"
              type="button"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
              title="Italic"
              type="button"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
              title="Underline"
              type="button"
            >
              <span className="font-bold underline text-sm">U</span>
            </button>

            <div className="w-px bg-gray-300 mx-1" />

            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
              title="Heading 2"
              type="button"
            >
              <Heading2 className="w-4 h-4" />
            </button>

            <div className="w-px bg-gray-300 mx-1" />

            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
              title="Bullet List"
              type="button"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
              title="Numbered List"
              type="button"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <div className="w-px bg-gray-300 mx-1" />

            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
              title="Quote"
              type="button"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={setLink}
              className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
              title="Add Link"
              type="button"
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            <div className="w-px bg-gray-300 mx-1" />
          </>
        )}

        {/* HTML source toggle — always visible */}
        <button
          type="button"
          onClick={sourceMode ? exitSourceMode : enterSourceMode}
          title={sourceMode ? 'Switch to visual editor (applies your HTML)' : 'Edit raw HTML'}
          className={`ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
            sourceMode
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
              : 'text-gray-500 hover:bg-gray-200 border border-transparent'
          }`}
        >
          {'</>'}
          <span className="font-sans">{sourceMode ? 'Apply HTML' : 'HTML'}</span>
        </button>
      </div>

      {/* Source mode: raw HTML textarea */}
      {sourceMode ? (
        <div className="relative">
          <textarea
            value={sourceHtml}
            onChange={(e) => setSourceHtml(e.target.value)}
            className="w-full font-mono text-xs text-gray-800 bg-gray-950 text-green-300 p-4 resize-y focus:outline-none"
            style={{ minHeight }}
            placeholder="Paste or type HTML here, then click 'Apply HTML' to render it…"
            spellCheck={false}
          />
          <p className="absolute bottom-2 right-3 text-xs text-gray-500 pointer-events-none select-none">
            Click <strong className="text-amber-400">&lt;/&gt; Apply HTML</strong> in the toolbar to render
          </p>
        </div>
      ) : (
        /* WYSIWYG editor */
        <EditorContent editor={editor} />
      )}

      {/* Footer: char count or source-mode hint */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between">
        {sourceMode ? (
          <span className="text-amber-600">
            HTML source mode — formatting toolbar is disabled. Click <strong>&lt;/&gt; Apply HTML</strong> to parse and render.
          </span>
        ) : (
          <span>{editor.state.doc.textContent.length} characters</span>
        )}
      </div>
    </div>
  );
}