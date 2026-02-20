// Rich Text Editor Component using Tiptap

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading2, Quote } from 'lucide-react';
import { useEffect, useRef } from 'react';

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#B01C2E] underline' },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    // `content` here is the one-time initial value; live updates come
    // via the effect below so TipTap v3 never sees a stale prop.
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-4',
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Register the update listener after the editor is ready and clean it up
  // on unmount. Using editor.on/off ensures the latest onChangeRef is always
  // called — avoids the TipTap v3 stale-closure issue with onUpdate option.
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const html = editor.getHTML();
      // Treat a bare empty paragraph as an empty string so the DB stores null.
      const isEmpty = html === '<p></p>' || html === '';
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

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bold') ? 'bg-gray-200' : ''
          }`}
          title="Bold"
          type="button"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('italic') ? 'bg-gray-200' : ''
          }`}
          title="Italic"
          type="button"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('underline') ? 'bg-gray-200' : ''
          }`}
          title="Underline"
          type="button"
        >
          <span className="font-bold underline text-sm">U</span>
        </button>
        
        <div className="w-px bg-gray-300 mx-1" />
        
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
          }`}
          title="Heading 2"
          type="button"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        
        <div className="w-px bg-gray-300 mx-1" />
        
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bulletList') ? 'bg-gray-200' : ''
          }`}
          title="Bullet List"
          type="button"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('orderedList') ? 'bg-gray-200' : ''
          }`}
          title="Numbered List"
          type="button"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        
        <div className="w-px bg-gray-300 mx-1" />
        
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('blockquote') ? 'bg-gray-200' : ''
          }`}
          title="Quote"
          type="button"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('link') ? 'bg-gray-200' : ''
          }`}
          title="Add Link"
          type="button"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
      
      {/* Character Count — derived from plain-text content, no extension needed */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        {editor.state.doc.textContent.length} characters
      </div>
    </div>
  );
}
