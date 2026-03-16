'use client';

import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link as LinkIcon, Minus,
  Highlighter, Undo, Redo, Code, Quote,
  Heading1, Heading2, Heading3,
} from 'lucide-react';
import { useEffect, useCallback, useRef } from 'react';
import { ColumnSuggestionList, SuggestionListRef } from './ColumnSuggestion';
import { buildColumnSuggestionExtension } from './columnSuggestionExtension';
import { ColumnVariableNode } from './ColumnVariableNode';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onFocus?: () => void;
  active?: boolean;
  headers?: string[];
}

function ToolbarButton({
  onClick, active, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5" />;
}

export function RichTextEditor({ value, onChange, onFocus, active, headers = [] }: RichTextEditorProps) {
  const headersRef = useRef(headers);
  useEffect(() => { headersRef.current = headers; }, [headers]);

  const columnSuggestionExt = buildColumnSuggestionExtension({
    items({ query }: { query: string }) {
      return headersRef.current
        .filter((h) => h.toLowerCase().includes(query.toLowerCase()))
        .map((h) => ({ label: h }));
    },
    // top-level command — called when user picks an item (click, Enter, Tab)
    command({ editor: ed, range: r, props: p }: { editor: NonNullable<ReturnType<typeof useEditor>>; range: { from: number; to: number }; props: { label: string } }) {
      ed
        .chain()
        .focus()
        .deleteRange(r)
        .insertContent([
          { type: 'columnVariable', attrs: { label: p.label } },
          { type: 'text', text: ' ' },
        ])
        .run();
    },
    render() {
      let component: ReactRenderer<SuggestionListRef>;
      let popup: TippyInstance[];

      return {
        onStart(props) {
          component = new ReactRenderer(ColumnSuggestionList, {
            props,
            editor: props.editor,
          });
          if (!props.clientRect) return;
          popup = tippy('body', {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
            theme: 'dark',
          });
        },
        onUpdate(props) {
          component.updateProps(props);
          if (!props.clientRect) return;
          popup[0]?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect });
        },
        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            popup[0]?.hide();
            return true;
          }
          return component.ref?.onKeyDown(props) ?? false;
        },
        onExit() {
          popup[0]?.destroy();
          component.destroy();
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline' } }),
      ColumnVariableNode,
      columnSuggestionExt,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'min-h-[220px] px-4 py-3 text-sm text-gray-900 focus:outline-none prose max-w-none',
      },
    },
    onUpdate({ editor: e }) {
      onChange(e.getHTML());
    },
    onFocus() {
      onFocus?.();
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-colors ${active ? 'border-green-500/50' : 'border-gray-200'}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo className="w-3.5 h-3.5" /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><Heading1 className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 className="w-3.5 h-3.5" /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code"><Code className="w-3.5 h-3.5" /></ToolbarButton>
        <Divider />
        <label title="Text color" className="relative p-1.5 rounded hover:bg-gray-100 cursor-pointer">
          <span className="text-[11px] font-bold text-gray-500" style={{ fontFamily: 'serif' }}>A</span>
          <input
            type="color"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </label>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} active={editor.isActive('highlight')} title="Highlight"><Highlighter className="w-3.5 h-3.5" /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left"><AlignLeft className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center"><AlignCenter className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right"><AlignRight className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify className="w-3.5 h-3.5" /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><List className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list"><ListOrdered className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote className="w-3.5 h-3.5" /></ToolbarButton>
        <Divider />
        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Insert link"><LinkIcon className="w-3.5 h-3.5" /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule"><Minus className="w-3.5 h-3.5" /></ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      {headers.length > 0 && (
        <div className="px-3 py-1.5 border-t border-gray-200 bg-gray-50">
          <span className="text-[10px] text-gray-400">Type <kbd className="text-gray-500 bg-gray-100 px-1 rounded">@</kbd> to insert a column variable</span>
        </div>
      )}
    </div>
  );
}
