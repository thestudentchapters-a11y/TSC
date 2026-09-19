'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Highlighter,
  Undo,
  Redo,
  Code,
  Eye,
  Minus,
  RemoveFormatting,
  UploadCloud,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';

export interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const PRESET_COLORS = [
  { name: 'Default Dark', value: '#112340' },
  { name: 'Gold / Accent', value: '#D4AF37' },
  { name: 'Navy Blue', value: '#0D47A1' },
  { name: 'Crimson Red', value: '#E11D48' },
  { name: 'Emerald Green', value: '#059669' },
  { name: 'Royal Purple', value: '#7C3AED' },
  { name: 'Warm Amber', value: '#D97706' },
  { name: 'Slate Gray', value: '#64748B' },
  { name: 'Black', value: '#000000' },
];

const PRESET_HIGHLIGHTS = [
  { name: 'None', value: 'transparent' },
  { name: 'Soft Yellow', value: '#FEF08A' },
  { name: 'Soft Green', value: '#BBF7D0' },
  { name: 'Soft Blue', value: '#BAE6FD' },
  { name: 'Soft Pink', value: '#FBCFE8' },
  { name: 'Soft Purple', value: '#E9D5FF' },
];

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = 'Write or paste your article content here…',
  className,
  minHeight = '280px',
}: RichTextEditorProps) {
  const { push } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(value || '');

  // Active styles state for toolbar button highlights
  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikeThrough: boolean;
    orderedList: boolean;
    unorderedList: boolean;
    justifyLeft: boolean;
    justifyCenter: boolean;
    justifyRight: boolean;
  }>({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    orderedList: false,
    unorderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
  });

  // Color picker state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  // Link modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkOpenNewTab, setLinkOpenNewTab] = useState(true);
  const savedSelectionRef = useRef<Range | null>(null);

  // Image modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState<'center' | 'full' | 'left' | 'right'>('center');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sync internal content from incoming value when not focused
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      const currentHtml = editorRef.current.innerHTML;
      if (value !== currentHtml) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setHtmlValue(value || '');
  }, [value, isHtmlMode]);

  // Save current selection for modal restores
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
  };

  // Update active formats
  const checkActiveFormats = useCallback(() => {
    if (!editorRef.current || isHtmlMode) return;
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        orderedList: document.queryCommandState('insertOrderedList'),
        unorderedList: document.queryCommandState('insertUnorderedList'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
      });
    } catch {
      // Ignore if document commands are unavailable
    }
  }, [isHtmlMode]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlValue(html);
      onChange(html);
      checkActiveFormats();
    }
  };

  // Execute standard formatting command
  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    if (isHtmlMode) return;
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleInput();
  };

  // Format blocks (H2, H3, Blockquote, P)
  const formatBlock = (tag: string) => {
    if (isHtmlMode) return;
    editorRef.current?.focus();
    const currentTag = document.queryCommandValue('formatBlock');
    if (currentTag?.toLowerCase() === tag.toLowerCase()) {
      document.execCommand('formatBlock', false, '<p>');
    } else {
      document.execCommand('formatBlock', false, `<${tag}>`);
    }
    handleInput();
  };

  // Color selection
  const applyTextColor = (color: string) => {
    execCmd('foreColor', color);
    setShowColorPicker(false);
  };

  const applyHighlightColor = (color: string) => {
    execCmd('hiliteColor', color);
    setShowHighlightPicker(false);
  };

  // Links
  const handleOpenLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    const text = sel ? sel.toString() : '';
    setLinkText(text);
    setLinkUrl('');
    setLinkOpenNewTab(true);
    setIsLinkModalOpen(true);
  };

  const handleInsertLink = () => {
    setIsLinkModalOpen(false);
    restoreSelection();
    editorRef.current?.focus();

    if (!linkUrl.trim()) return;

    let validUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(validUrl) && !validUrl.startsWith('/') && !validUrl.startsWith('#') && !validUrl.startsWith('mailto:')) {
      validUrl = `https://${validUrl}`;
    }

    if (linkText.trim()) {
      const linkHtml = `<a href="${validUrl}" ${linkOpenNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''} class="text-brand font-medium underline underline-offset-2">${linkText.trim()}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
    } else {
      document.execCommand('createLink', false, validUrl);
    }
    handleInput();
  };

  const handleRemoveLink = () => {
    execCmd('unlink');
  };

  // Inline Images
  const handleOpenImageModal = () => {
    saveSelection();
    setImageUrl('');
    setImageAlt('');
    setImageCaption('');
    setImageAlign('center');
    setIsImageModalOpen(true);
  };

  const handleProcessImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      push('Please select a valid image file (PNG, JPG, WebP, GIF).', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      push('File size exceeds the 10MB limit.', 'error');
      return;
    }

    setUploadingImage(true);
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setImageUrl(base64Data);

      try {
        const res = await fetch(`${api}/api/media/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            file: base64Data,
            altText: imageAlt || file.name.replace(/\.[^/.]+$/, ''),
          }),
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setImageUrl(data.url);
          push('Image uploaded to cloud CDN.', 'success');
        }
      } catch {
        push('Image loaded locally for document.', 'info');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) {
      push('Please provide an image URL or upload an image.', 'error');
      return;
    }

    setIsImageModalOpen(false);
    restoreSelection();
    editorRef.current?.focus();

    const alignCls =
      imageAlign === 'full'
        ? 'w-full my-6'
        : imageAlign === 'left'
          ? 'float-left mr-6 mb-4 max-w-[50%]'
          : imageAlign === 'right'
            ? 'float-right ml-6 mb-4 max-w-[50%]'
            : 'mx-auto my-6 max-w-full block';

    const figureHtml = `
      <figure class="editorial-image-figure my-6 clear-both ${alignCls}">
        <img src="${imageUrl}" alt="${imageAlt || 'Article image'}" class="rounded-xl shadow-md w-full object-cover max-h-[480px]" />
        ${imageCaption ? `<figcaption class="mt-2 text-center text-xs font-medium text-slate-500 italic">${imageCaption}</figcaption>` : ''}
      </figure>
      <p><br /></p>
    `;

    document.execCommand('insertHTML', false, figureHtml);
    handleInput();
  };

  // Toggle HTML Code Mode
  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlValue;
      }
      onChange(htmlValue);
      setIsHtmlMode(false);
    } else {
      if (editorRef.current) {
        const currentHtml = editorRef.current.innerHTML;
        setHtmlValue(currentHtml);
      }
      setIsHtmlMode(true);
    }
  };

  // Word & Reading Time stats
  const calculateStats = (text: string) => {
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanText ? cleanText.split(' ').length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, minutes };
  };

  const stats = calculateStats(htmlValue);

  return (
    <div className={cn('relative flex flex-col rounded-xl border border-hairline bg-white shadow-sm transition-all focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/10', className)}>
      {/* ── RICH TEXT TOOLBAR ── */}
      <div className="flex flex-wrap items-center gap-1 border-b border-hairline bg-slate-50/80 p-2 text-ink">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-hairline">
          <button
            type="button"
            onClick={() => execCmd('undo')}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('redo')}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* Headings / Block Types */}
        <div className="flex items-center gap-0.5 px-1 border-r border-hairline">
          <button
            type="button"
            onClick={() => formatBlock('h2')}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            title="Heading 2 (Section Title)"
          >
            <Heading2 className="h-4 w-4" />
            <span className="hidden sm:inline">H2</span>
          </button>
          <button
            type="button"
            onClick={() => formatBlock('h3')}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            title="Heading 3 (Subheading)"
          >
            <Heading3 className="h-4 w-4" />
            <span className="hidden sm:inline">H3</span>
          </button>
          <button
            type="button"
            onClick={() => formatBlock('blockquote')}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Editorial Quote / Callout"
          >
            <Quote className="h-4 w-4" />
          </button>
        </div>

        {/* Basic Text Styles (Bold, Italic, Underline, Strike) */}
        <div className="flex items-center gap-0.5 px-1 border-r border-hairline">
          <button
            type="button"
            onClick={() => execCmd('bold')}
            className={cn(
              'rounded p-1.5 transition-colors',
              activeFormats.bold ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-200'
            )}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('italic')}
            className={cn(
              'rounded p-1.5 transition-colors',
              activeFormats.italic ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-200'
            )}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('underline')}
            className={cn(
              'rounded p-1.5 transition-colors',
              activeFormats.underline ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-200'
            )}
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('strikeThrough')}
            className={cn(
              'rounded p-1.5 transition-colors',
              activeFormats.strikeThrough ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-200'
            )}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
        </div>

        {/* Text Color & Highlight Pickers */}
        <div className="relative flex items-center gap-0.5 px-1 border-r border-hairline">
          {/* Text Color */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowHighlightPicker(false);
              }}
              className="flex items-center gap-1 rounded p-1.5 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Text Color"
            >
              <Palette className="h-4 w-4 text-brand" />
            </button>
            {showColorPicker && (
              <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-xl border border-hairline bg-white p-2.5 shadow-xl">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Text Color</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => applyTextColor(c.value)}
                      className="h-6 w-6 rounded-md border border-slate-200 transition-transform hover:scale-110"
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 border-t border-hairline pt-2">
                  <span className="text-xs text-slate-500">Custom:</span>
                  <input
                    type="color"
                    onChange={(e) => applyTextColor(e.target.value)}
                    className="h-6 w-8 cursor-pointer rounded border border-slate-200 p-0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Highlight Color */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
              }}
              className="flex items-center gap-1 rounded p-1.5 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Highlight Background"
            >
              <Highlighter className="h-4 w-4 text-amber-500" />
            </button>
            {showHighlightPicker && (
              <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-xl border border-hairline bg-white p-2.5 shadow-xl">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Highlight Text</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {PRESET_HIGHLIGHTS.map((h) => (
                    <button
                      key={h.value}
                      type="button"
                      onClick={() => applyHighlightColor(h.value)}
                      className="flex h-7 items-center justify-center rounded-md border border-slate-200 text-xs font-medium text-slate-700 transition-transform hover:scale-105"
                      style={{ backgroundColor: h.value }}
                    >
                      {h.name.replace('Soft ', '')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hyperlink & Inline Image */}
        <div className="flex items-center gap-0.5 px-1 border-r border-hairline">
          <button
            type="button"
            onClick={handleOpenLinkModal}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            title="Insert Hyperlink (Ctrl+K)"
          >
            <LinkIcon className="h-4 w-4 text-brand" />
            <span className="hidden sm:inline">Link</span>
          </button>
          <button
            type="button"
            onClick={handleRemoveLink}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Remove Link"
          >
            <Unlink className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleOpenImageModal}
            className="flex items-center gap-1 rounded bg-brand/5 px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand/10 transition-colors"
            title="Insert Inline Image"
          >
            <ImageIcon className="h-4 w-4 text-brand" />
            <span>Image</span>
          </button>
        </div>

        {/* Lists & Alignment */}
        <div className="flex items-center gap-0.5 px-1 border-r border-hairline">
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            className={cn(
              'rounded p-1.5 transition-colors',
              activeFormats.unorderedList ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-200'
            )}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            className={cn(
              'rounded p-1.5 transition-colors',
              activeFormats.orderedList ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-200'
            )}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyLeft')}
            className={cn(
              'rounded p-1.5 transition-colors',
              activeFormats.justifyLeft ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-200'
            )}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyCenter')}
            className={cn(
              'rounded p-1.5 transition-colors',
              activeFormats.justifyCenter ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-200'
            )}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('justifyRight')}
            className={cn(
              'rounded p-1.5 transition-colors',
              activeFormats.justifyRight ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-200'
            )}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertHorizontalRule')}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Insert Divider Line"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('removeFormat')}
            className="rounded p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Clear Formatting"
          >
            <RemoveFormatting className="h-4 w-4" />
          </button>
        </div>

        {/* HTML / WYSIWYG Mode Switcher */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={toggleHtmlMode}
            className={cn(
              'flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
              isHtmlMode ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            )}
            title={isHtmlMode ? 'Switch to Visual Editor' : 'Switch to HTML Code Mode'}
          >
            {isHtmlMode ? <Eye className="h-3.5 w-3.5" /> : <Code className="h-3.5 w-3.5" />}
            <span>{isHtmlMode ? 'Visual Editor' : 'HTML Code'}</span>
          </button>
        </div>
      </div>

      {/* ── EDITOR BODY ── */}
      <div className="relative flex-1 p-4" style={{ minHeight }}>
        {isHtmlMode ? (
          <textarea
            id={id}
            value={htmlValue}
            onChange={(e) => {
              setHtmlValue(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="<p>Write your raw HTML here…</p>"
            className="w-full h-full font-mono text-xs leading-relaxed text-slate-800 bg-slate-900/5 p-3 rounded-lg border border-slate-200 focus:outline-none resize-y"
            style={{ minHeight: '260px' }}
          />
        ) : (
          <div
            id={id}
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyUp={checkActiveFormats}
            onMouseUp={checkActiveFormats}
            className="prose-tsc max-w-none min-h-[260px] text-ink text-[16px] leading-relaxed outline-none focus:outline-none
              prose-headings:font-display prose-headings:font-bold prose-headings:text-brand-dark
              prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
              prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2
              prose-p:my-3 prose-p:leading-7
              prose-a:text-brand prose-a:underline prose-a:underline-offset-2
              prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 prose-blockquote:my-4
              prose-ul:list-disc prose-ul:pl-6 prose-ul:my-3
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-3
              prose-img:rounded-xl prose-img:shadow-sm prose-img:my-4"
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* ── FOOTER STATS ── */}
      <div className="flex items-center justify-between border-t border-hairline bg-slate-50/50 px-4 py-2 text-[11px] font-medium text-slate-500">
        <div className="flex items-center gap-3">
          <span>Words: <strong className="text-slate-700">{stats.words}</strong></span>
          <span>•</span>
          <span>Est. Reading Time: <strong className="text-slate-700">{stats.minutes} min</strong></span>
        </div>
        <div className="text-slate-400">
          Tip: Select text to quickly apply colors, links, or styles.
        </div>
      </div>

      {/* ── INSERT LINK MODAL ── */}
      <Modal open={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} title="Insert Hyperlink" wide={false}>
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Link URL (Destination Web Address)</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com or /news/article-slug"
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Display Text (Optional)</label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Click here to read more"
              className="w-full rounded-lg border border-hairline px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={linkOpenNewTab}
              onChange={(e) => setLinkOpenNewTab(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
            />
            <span>Open link in new browser tab</span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-hairline">
            <Button variant="outline" size="sm" onClick={() => setIsLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleInsertLink}>
              Insert Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── INSERT INLINE IMAGE MODAL ── */}
      <Modal open={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} title="Insert Inline Article Image" wide={true}>
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-hairline pb-3">
            <button
              type="button"
              onClick={() => setImageMode('upload')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                imageMode === 'upload' ? 'bg-brand text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload from Computer</span>
            </button>
            <button
              type="button"
              onClick={() => setImageMode('url')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                imageMode === 'url' ? 'bg-brand text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <LinkIcon className="h-4 w-4" />
              <span>Image Web Link (URL)</span>
            </button>
          </div>

          {imageMode === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleProcessImageFile(file);
                }}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-brand/50 hover:bg-brand/5 transition-all"
              >
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    <p className="text-xs font-medium text-slate-600">Uploading image to cloud CDN…</p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Click to upload an image from your device</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-... or /images/..."
                className="w-full rounded-lg border border-hairline px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          )}

          {/* Preview if image URL exists */}
          {imageUrl && (
            <div className="relative rounded-xl border border-hairline p-2 bg-slate-50">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Caption / Subtitle (Optional)</label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="e.g. Students demonstrating prototype at tech expo"
                className="w-full rounded-lg border border-hairline px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Image Alignment</label>
              <select
                value={imageAlign}
                onChange={(e) => setImageAlign(e.target.value as any)}
                className="w-full rounded-lg border border-hairline px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand bg-white"
              >
                <option value="center">Centered (Standard)</option>
                <option value="full">Full Width</option>
                <option value="left">Float Left (Wrap Text)</option>
                <option value="right">Float Right (Wrap Text)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-hairline">
            <Button variant="outline" size="sm" onClick={() => setIsImageModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleInsertImage} disabled={!imageUrl || uploadingImage}>
              Insert Image Into Article
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
