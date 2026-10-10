'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Faustina } from 'next/font/google';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  Quote,
  Type,
  ChevronDown,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Plus,
  Trash2,
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
import { compressImage, formatBytes } from '@/lib/image-compression';

const faustina = Faustina({ subsets: ['latin'], style: ['normal', 'italic'], display: 'swap' });

export interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const PRESET_FONT_SIZES = [
  { label: 'Small (14px)', value: '14px', px: 14 },
  { label: 'Standard (16px)', value: '16px', px: 16 },
  { label: 'Normal Body (18px)', value: '18px', px: 18 },
  { label: 'Medium Lead (20px)', value: '20px', px: 20 },
  { label: 'Large (22px)', value: '22px', px: 22 },
  { label: 'Subheading (24px)', value: '24px', px: 24 },
  { label: 'Section Header (28px)', value: '28px', px: 28 },
  { label: 'Major Heading (32px)', value: '32px', px: 32 },
  { label: 'Display Title (36px)', value: '36px', px: 36 },
  { label: 'Hero Title (44px)', value: '44px', px: 44 },
];

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

  // Table modal & editing state
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableWithHeader, setTableWithHeader] = useState(true);
  const [tableStriped, setTableStriped] = useState(true);
  const [hoverRows, setHoverRows] = useState(0);
  const [hoverCols, setHoverCols] = useState(0);
  const [isInsideTable, setIsInsideTable] = useState(false);

  // Custom text size state
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState<string>('18');
  const [customSizeInput, setCustomSizeInput] = useState<string>('18');

  // Close font size dropdown on outside click
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.font-size-picker-container')) {
        setShowFontSizeDropdown(false);
      }
    };
    if (showFontSizeDropdown) {
      document.addEventListener('mousedown', handleGlobalClick);
      return () => document.removeEventListener('mousedown', handleGlobalClick);
    }
  }, [showFontSizeDropdown]);

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

      // Detect whether selection is inside a table
      const sel = window.getSelection();
      let node: Node | null = sel && sel.rangeCount > 0 ? sel.anchorNode : null;
      let inside = false;
      while (node && node !== editorRef.current) {
        if (node instanceof HTMLElement && node.tagName.toLowerCase() === 'table') {
          inside = true;
          break;
        }
        node = node.parentNode;
      }
      setIsInsideTable(inside);

      // Detect current font size at cursor
      let sizeNode: Node | null = sel && sel.rangeCount > 0 ? sel.anchorNode : null;
      let detectedSize = '';
      while (sizeNode && sizeNode !== editorRef.current) {
        if (sizeNode instanceof HTMLElement && sizeNode.style.fontSize) {
          detectedSize = sizeNode.style.fontSize;
          break;
        }
        sizeNode = sizeNode.parentNode;
      }
      if (detectedSize) {
        const num = parseInt(detectedSize);
        if (num) {
          setCurrentFontSize(`${num}`);
          setCustomSizeInput(`${num}`);
        }
      } else {
        setCurrentFontSize('18');
      }
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

  // Custom Font Size Application & Reset
  const applyCustomFontSize = (sizePx: number | string) => {
    if (isHtmlMode) return;
    editorRef.current?.focus();

    const numeric = typeof sizePx === 'number' ? sizePx : parseInt(sizePx) || 18;
    const clamped = Math.max(8, Math.min(numeric, 120));
    const sizeStr = `${clamped}px`;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    if (range.collapsed) {
      const span = document.createElement('span');
      span.style.fontSize = sizeStr;
      span.innerHTML = '&#8203;';
      range.insertNode(span);
      range.selectNodeContents(span);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      setCurrentFontSize(`${clamped}`);
      setCustomSizeInput(`${clamped}`);
      handleInput();
      setShowFontSizeDropdown(false);
      return;
    }

    try {
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand('fontSize', false, '7');

      if (editorRef.current) {
        const fontTags = editorRef.current.querySelectorAll('font[size="7"]');
        fontTags.forEach((font) => {
          const span = document.createElement('span');
          span.style.fontSize = sizeStr;
          span.innerHTML = font.innerHTML;
          font.parentNode?.replaceChild(span, font);
        });

        const allSpans = editorRef.current.querySelectorAll('span');
        allSpans.forEach((span) => {
          const fSize = span.style.fontSize;
          if (
            fSize === '-webkit-xxx-large' ||
            fSize === 'xxx-large' ||
            fSize === '36pt' ||
            fSize === '48px' ||
            span.getAttribute('size') === '7'
          ) {
            span.style.fontSize = sizeStr;
            span.removeAttribute('size');
          }
        });
      }
    } catch {
      try {
        const contents = range.extractContents();
        const span = document.createElement('span');
        span.style.fontSize = sizeStr;
        span.appendChild(contents);
        range.insertNode(span);
        range.selectNode(span);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (err) {
        console.error('Error applying font size:', err);
      }
    }

    setCurrentFontSize(`${clamped}`);
    setCustomSizeInput(`${clamped}`);
    handleInput();
    setShowFontSizeDropdown(false);
  };

  const resetFontSize = () => {
    if (isHtmlMode) return;
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    let node: Node | null = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node instanceof HTMLElement && node.tagName.toLowerCase() === 'span' && node.style.fontSize) {
        node.style.fontSize = '';
        if (!node.getAttribute('style')?.trim()) {
          node.removeAttribute('style');
        }
      }
      node = node.parentNode;
    }

    const range = sel.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentEl = container.nodeType === Node.ELEMENT_NODE ? (container as HTMLElement) : container.parentElement;
    if (parentEl) {
      parentEl.querySelectorAll('span[style*="font-size"]').forEach((sp) => {
        (sp as HTMLElement).style.fontSize = '';
      });
      parentEl.querySelectorAll('font[size]').forEach((f) => {
        f.removeAttribute('size');
      });
    }

    setCurrentFontSize('18');
    setCustomSizeInput('18');
    setShowFontSizeDropdown(false);
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
    if (file.size > 15 * 1024 * 1024) {
      push('File size exceeds the 15MB limit.', 'error');
      return;
    }

    setUploadingImage(true);
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('tsc_token') : null;

    try {
      // Lossless / high-efficiency compression: reduces payload by up to 90%
      const compressed = await compressImage(file, { maxDimension: 2048, quality: 0.88 });
      const base64Data = compressed.dataUrl;
      setImageUrl(base64Data);

      if (compressed.savedPercentage > 10) {
        push(`Compressed: ${formatBytes(compressed.originalSize)} → ${formatBytes(compressed.compressedSize)} (${compressed.savedPercentage}% saved).`, 'info');
      }

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
    } catch {
      push('Failed to process and compress image.', 'error');
      setUploadingImage(false);
    }
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

  // Table Insertion & Row/Col Manipulation
  const handleOpenTableModal = () => {
    saveSelection();
    setTableRows(3);
    setTableCols(3);
    setTableWithHeader(true);
    setTableStriped(true);
    setIsTableModalOpen(true);
  };

  const handleInsertTable = (customRows?: number, customCols?: number) => {
    setIsTableModalOpen(false);
    restoreSelection();
    editorRef.current?.focus();

    const rowsCount = Math.max(1, Math.min(customRows ?? tableRows, 30));
    const colsCount = Math.max(1, Math.min(customCols ?? tableCols, 12));

    let html = '<div class="table-container my-6 overflow-x-auto rounded-lg border border-slate-200 shadow-xs"><table class="w-full min-w-[360px] border-collapse text-left text-sm sm:text-base">';

    if (tableWithHeader) {
      html += '<thead><tr class="bg-slate-100 border-b border-slate-200 font-semibold text-slate-800">';
      for (let c = 1; c <= colsCount; c++) {
        html += `<th class="border border-slate-200 px-4 py-2.5 font-bold">Header ${c}</th>`;
      }
      html += '</tr></thead>';
    }

    html += '<tbody class="divide-y divide-slate-200 bg-white">';
    for (let r = 1; r <= rowsCount; r++) {
      const rowBg = tableStriped && r % 2 === 0 ? ' class="bg-slate-50/60"' : '';
      html += `<tr${rowBg}>`;
      for (let c = 1; c <= colsCount; c++) {
        html += `<td class="border border-slate-200 px-4 py-2.5 text-slate-700">Cell ${r}.${c}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table></div><p><br /></p>';

    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  const getClosestElement = (selector: string): HTMLElement | null => {
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node instanceof HTMLElement && node.matches(selector)) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  };

  const handleAddTableRow = () => {
    const table = getClosestElement('table');
    const currentTr = getClosestElement('tr');
    if (!table) return;

    const targetRow = currentTr || table.querySelector('tbody tr:last-child') || table.querySelector('tr:last-child');
    if (!targetRow) return;

    const colCount = targetRow.querySelectorAll('th, td').length;
    const newRow = document.createElement('tr');
    newRow.className = 'bg-white hover:bg-slate-50/50';
    for (let i = 0; i < colCount; i++) {
      const td = document.createElement('td');
      td.className = 'border border-slate-200 px-4 py-2.5 text-slate-700';
      td.innerHTML = '<br>';
      newRow.appendChild(td);
    }
    targetRow.parentNode?.insertBefore(newRow, targetRow.nextSibling);
    handleInput();
  };

  const handleDeleteTableRow = () => {
    const currentTr = getClosestElement('tr');
    if (!currentTr) return;
    const table = currentTr.closest('table');
    currentTr.remove();
    if (table && table.querySelectorAll('tr').length === 0) {
      table.closest('.table-container')?.remove() || table.remove();
    }
    handleInput();
  };

  const handleAddTableCol = () => {
    const table = getClosestElement('table');
    if (!table) return;
    const currentCell = getClosestElement('td, th');
    let colIndex = -1;
    if (currentCell && currentCell.parentElement) {
      colIndex = Array.from(currentCell.parentElement.children).indexOf(currentCell);
    }

    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      const isHeader = row.parentElement?.tagName.toLowerCase() === 'thead' || row.querySelector('th') !== null;
      const newCell = document.createElement(isHeader ? 'th' : 'td');
      newCell.className = isHeader
        ? 'border border-slate-200 px-4 py-2.5 font-bold text-slate-800 bg-slate-100'
        : 'border border-slate-200 px-4 py-2.5 text-slate-700';
      newCell.innerHTML = isHeader ? 'New Header' : '<br>';

      if (colIndex >= 0 && row.children[colIndex]) {
        row.children[colIndex].after(newCell);
      } else {
        row.appendChild(newCell);
      }
    });
    handleInput();
  };

  const handleDeleteTableCol = () => {
    const table = getClosestElement('table');
    const currentCell = getClosestElement('td, th');
    if (!table || !currentCell || !currentCell.parentElement) return;

    const colIndex = Array.from(currentCell.parentElement.children).indexOf(currentCell);
    if (colIndex === -1) return;

    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      if (row.children[colIndex]) {
        row.children[colIndex].remove();
      }
    });

    const remainingCells = table.querySelectorAll('td, th');
    if (remainingCells.length === 0) {
      table.closest('.table-container')?.remove() || table.remove();
    }
    handleInput();
  };

  const handleDeleteTable = () => {
    const table = getClosestElement('table');
    if (!table) return;
    table.closest('.table-container')?.remove() || table.remove();
    setIsInsideTable(false);
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

        {/* Custom Text Size Selector */}
        <div className="relative font-size-picker-container px-1 border-r border-hairline">
          <button
            type="button"
            onClick={() => {
              setShowFontSizeDropdown(!showFontSizeDropdown);
              setShowColorPicker(false);
              setShowHighlightPicker(false);
            }}
            className={cn(
              'flex items-center gap-1.5 rounded px-2 py-1 text-xs font-semibold transition-colors cursor-pointer',
              showFontSizeDropdown ? 'bg-brand text-white shadow-xs' : 'text-slate-700 hover:bg-slate-200'
            )}
            title="Choose or Type Custom Text Size"
          >
            <Type className="h-4 w-4 text-brand" />
            <span className="font-mono text-xs font-bold min-w-[28px] text-center">
              {currentFontSize}
              <span className={cn('text-[10px] font-normal ml-0.5', showFontSizeDropdown ? 'text-white/80' : 'text-slate-400')}>px</span>
            </span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {showFontSizeDropdown && (
            <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-hairline bg-white p-3 shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Custom Text Size</p>
                <button
                  type="button"
                  onClick={resetFontSize}
                  className="text-[10px] font-semibold text-brand hover:underline cursor-pointer"
                >
                  Reset Default
                </button>
              </div>

              {/* Precise Steppers & Direct Input */}
              <div className="flex items-center gap-1.5 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    const current = parseInt(customSizeInput) || 18;
                    const next = Math.max(8, current - 2);
                    setCustomSizeInput(String(next));
                    applyCustomFontSize(next);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                  title="Decrease size by 2px"
                >
                  -
                </button>
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={8}
                    max={120}
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        applyCustomFontSize(customSizeInput);
                      }
                    }}
                    placeholder="18"
                    className="w-full h-8 rounded-lg border border-slate-200 px-2 pr-7 text-center text-xs font-bold text-slate-800 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400">px</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const current = parseInt(customSizeInput) || 18;
                    const next = Math.min(120, current + 2);
                    setCustomSizeInput(String(next));
                    applyCustomFontSize(next);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                  title="Increase size by 2px"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => applyCustomFontSize(customSizeInput)}
                  className="h-8 rounded-lg bg-brand px-3 text-xs font-bold text-white hover:bg-brand-dark transition-colors cursor-pointer"
                >
                  Set
                </button>
              </div>

              {/* Standard Presets */}
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Popular Presets</p>
              <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto pr-0.5">
                {PRESET_FONT_SIZES.map((preset) => {
                  const isSelected = currentFontSize === String(preset.px);
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => applyCustomFontSize(preset.px)}
                      className={cn(
                        'flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer',
                        isSelected
                          ? 'bg-brand/10 text-brand font-bold border border-brand/20'
                          : 'text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      <span className="truncate">{preset.label}</span>
                      <span className="font-mono text-[10px] opacity-75">{preset.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
                setShowFontSizeDropdown(false);
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
                setShowFontSizeDropdown(false);
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
          <button
            type="button"
            onClick={handleOpenTableModal}
            className={cn(
              'flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold transition-colors',
              isInsideTable
                ? 'bg-brand text-white shadow-xs'
                : 'bg-brand/5 text-brand hover:bg-brand/10'
            )}
            title="Insert Custom Table (Rows × Columns)"
          >
            <TableIcon className="h-4 w-4" />
            <span>Table</span>
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

      {/* ── TABLE ACTIONS BAR (ACTIVE WHEN CURSOR IS INSIDE TABLE) ── */}
      {isInsideTable && !isHtmlMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand/20 bg-brand-50/70 px-3 py-1.5 text-xs animate-fadeIn">
          <div className="flex items-center gap-1.5 font-semibold text-brand">
            <TableIcon className="h-3.5 w-3.5" />
            <span>Table Controls:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={handleAddTableRow}
              className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
              title="Add New Row Below"
            >
              <Plus className="h-3 w-3 text-emerald-600" />
              <span>Row</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteTableRow}
              className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete Current Row"
            >
              <Minus className="h-3 w-3 text-rose-500" />
              <span>Row</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleAddTableCol}
              className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
              title="Add New Column Right"
            >
              <Plus className="h-3 w-3 text-emerald-600" />
              <span>Col</span>
            </button>
            <button
              type="button"
              onClick={handleDeleteTableCol}
              className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete Current Column"
            >
              <Minus className="h-3 w-3 text-rose-500" />
              <span>Col</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleDeleteTable}
              className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[11px] font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete Entire Table"
            >
              <Trash2 className="h-3 w-3" />
              <span>Remove Table</span>
            </button>
          </div>
        </div>
      )}

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
            onClick={checkActiveFormats}
            className={`${faustina.className} prose-tsc max-w-none min-h-[260px] text-ink text-[17.5px] sm:text-[18.5px] font-medium leading-relaxed outline-none focus:outline-none
              [&_h2]:font-merriweather [&_h2]:font-bold [&_h2]:text-[24px] sm:[&_h2]:text-[28px] [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-brand-dark
              [&_h3]:font-merriweather [&_h3]:font-bold [&_h3]:text-[20px] sm:[&_h3]:text-[24px] [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-brand-dark
              [&_p]:my-3.5 [&_p]:text-[17.5px] sm:[&_p]:text-[18.5px] [&_p]:leading-relaxed
              [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2
              [&_blockquote]:border-l-4 [&_blockquote]:border-gold [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:my-4 [&_blockquote]:text-[18px]
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3.5 [&_li]:my-1.5 [&_li]:text-[17.5px] sm:[&_li]:text-[18.5px]
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3.5 [&_li]:my-1.5 [&_li]:text-[17.5px] sm:[&_li]:text-[18.5px]
              [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:my-4
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-sm sm:[&_table]:text-base
              [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100/90 [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-bold [&_th]:text-ink [&_th]:min-w-[80px]
              [&_td]:border [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-2.5 [&_td]:text-slate-700 [&_td]:min-w-[80px]
              [&_.table-container]:my-4 [&_.table-container]:overflow-x-auto [&_.table-container]:rounded-lg [&_.table-container]:border [&_.table-container]:border-slate-200`}
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

      {/* ── INSERT TABLE MODAL ── */}
      <Modal open={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} title="Insert Custom Table" wide={false}>
        <div className="space-y-4 pt-2">
          {/* Quick Grid Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">Quick Visual Grid</label>
              <span className="text-xs font-bold text-brand">
                {hoverRows > 0 && hoverCols > 0
                  ? `${hoverRows} Rows × ${hoverCols} Columns`
                  : `${tableRows} Rows × ${tableCols} Columns`}
              </span>
            </div>
            <div
              className="inline-grid grid-cols-6 gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200"
              onMouseLeave={() => {
                setHoverRows(0);
                setHoverCols(0);
              }}
            >
              {Array.from({ length: 6 }).map((_, rIdx) =>
                Array.from({ length: 6 }).map((_, cIdx) => {
                  const r = rIdx + 1;
                  const c = cIdx + 1;
                  const isHighlighted =
                    hoverRows > 0 && hoverCols > 0
                      ? r <= hoverRows && c <= hoverCols
                      : r <= tableRows && c <= tableCols;
                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onMouseEnter={() => {
                        setHoverRows(r);
                        setHoverCols(c);
                      }}
                      onClick={() => {
                        setTableRows(r);
                        setTableCols(c);
                      }}
                      className={cn(
                        'h-6 w-6 rounded-md border transition-all cursor-pointer',
                        isHighlighted
                          ? 'border-brand bg-brand/30 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      )}
                      title={`${r} rows × ${c} columns`}
                    />
                  );
                })
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Hover and click squares to select size, or customize row/column counts below.
            </p>
          </div>

          {/* Explicit Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rows Count</label>
              <input
                type="number"
                min={1}
                max={30}
                value={tableRows}
                onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-lg border border-hairline px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Columns Count</label>
              <input
                type="number"
                min={1}
                max={12}
                value={tableCols}
                onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-lg border border-hairline px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Standard Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { r: 2, c: 2, label: '2 × 2' },
                { r: 3, c: 3, label: '3 × 3' },
                { r: 4, c: 3, label: '4 × 3' },
                { r: 5, c: 4, label: '5 × 4' },
                { r: 6, c: 5, label: '6 × 5' },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setTableRows(p.r);
                    setTableCols(p.c);
                  }}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer',
                    tableRows === p.r && tableCols === p.c
                      ? 'border-brand bg-brand/10 text-brand font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2 pt-2 border-t border-hairline">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={tableWithHeader}
                onChange={(e) => setTableWithHeader(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
              />
              <span>Include Header Row (Bold &amp; shaded column headers)</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={tableStriped}
                onChange={(e) => setTableStriped(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
              />
              <span>Alternating Row Colors (Zebra striped rows)</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-hairline">
            <Button variant="outline" size="sm" onClick={() => setIsTableModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleInsertTable()}>
              Insert Table ({tableRows} × {tableCols})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
