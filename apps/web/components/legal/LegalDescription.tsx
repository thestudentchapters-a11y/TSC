'use client';

import { useMemo } from 'react';
import { Scale, Tag } from 'lucide-react';
import { CategoryPill } from '@/components/common/CategoryPill';

interface LegalDescriptionProps {
  content: string[] | string;
  summary?: string;
  topic?: string;
  title?: string;
}

export interface ParsedSection {
  icon?: string;
  title: string;
  content: string;
  paragraphs: string[];
}

export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word, idx) => {
      if (idx > 0 && ['and', 'of', 'in', 'the', 'for', 'to', 'a', 'an', 'at', 'by'].includes(word)) {
        return word;
      }
      if (word === '&') return '&';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function parseLegalContent(raw: string) {
  if (!raw) return { isHtml: false, intro: '', sections: [] as ParsedSection[], plainParagraphs: [] as string[] };

  // Check if content has HTML tags
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return { isHtml: true, html: raw, intro: '', sections: [], plainParagraphs: [] };
  }

  // Regex for matching emoji followed by uppercase section headings
  const emojiSectionRegex = new RegExp(
    '([\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}])\\s*([A-Z0-9&,/—\\-]+?(?:\\s+[A-Z0-9&,/—\\-]+?){0,5}?)(?::|\\.|\\s(?=[A-Z][a-z]|\\b(?:IIT|NIT|BITS|IIM|IISc|DU|BHU|JNU|AIIMS|The|This|Our|It|With|In|At|Offers|Features|Located|Spanning|Legal|Law|Rights|Rule|Act|Notice|Grievance)\\b))',
    'gu'
  );

  const matches: Array<{ icon: string; title: string; index: number; matchLen: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = emojiSectionRegex.exec(raw)) !== null) {
    matches.push({ icon: m[1], title: m[2].trim(), index: m.index, matchLen: m[0].length });
  }

  // If no emoji-headed sections found, check for Markdown or regular paragraphs
  if (matches.length === 0) {
    const plainParagraphs = raw
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    return { isHtml: false, intro: '', sections: [], plainParagraphs };
  }

  const intro = raw.slice(0, matches[0].index).trim();
  const sections: ParsedSection[] = [];

  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const startIndex = cur.index + cur.matchLen;
    const endIndex = next ? next.index : raw.length;
    const body = raw.slice(startIndex, endIndex).trim().replace(/^[:.—\-]\s*/, '');

    const paragraphs = body
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    sections.push({
      icon: cur.icon,
      title: toTitleCase(cur.title),
      content: body,
      paragraphs: paragraphs.length > 0 ? paragraphs : [body],
    });
  }

  return { isHtml: false, intro, sections, plainParagraphs: [] };
}

export function LegalDescription({ content, summary, topic, title }: LegalDescriptionProps) {
  const rawContent = Array.isArray(content) ? content.join('\n\n') : (content || '');
  const parsed = useMemo(() => parseLegalContent(rawContent), [rawContent]);

  return (
    <div className="space-y-8">
      {/* Section Title Header (mirroring campus profile title header) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand">
            <Scale className="h-3.5 w-3.5" />
            <span>Legal Explainer</span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {title ? `About: ${title}` : 'Overview & Legal Analysis'}
          </h2>
        </div>
      </div>

      {/* Lead Intro / Summary (mirroring campus lead intro callout) */}
      {(summary || (!parsed.isHtml && parsed.intro)) && (
        <div className="rounded-xl border border-brand/20 border-l-4 border-l-brand bg-brand-50/40 p-5 sm:p-6 shadow-xs">
          <p className="font-serif text-[19px] sm:text-[20.5px] leading-relaxed text-ink/90 italic">
            {summary || parsed.intro}
          </p>
        </div>
      )}

      {/* HTML Content Render (mirroring campus prose styles) */}
      {parsed.isHtml && parsed.html && (
        <div
          className="prose-tsc max-w-none font-serif text-[19px] sm:text-[21px] leading-[1.85] text-ink/90 space-y-5
            [&_h2]:font-merriweather [&_h2]:font-bold [&_h2]:text-[27px] sm:[&_h2]:text-[33px] [&_h2]:text-brand-dark [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:font-merriweather [&_h3]:font-bold [&_h3]:text-[23px] sm:[&_h3]:text-[27px] [&_h3]:text-brand-dark [&_h3]:mt-8 [&_h3]:mb-3
            [&_p]:my-5 [&_p]:text-[19px] sm:[&_p]:text-[21px] [&_p]:leading-[1.85]
            [&_a]:text-brand [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-brand-dark
            [&_blockquote]:border-l-4 [&_blockquote]:border-gold [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-ink/80 [&_blockquote]:my-6 [&_blockquote]:text-[20px] sm:[&_blockquote]:text-[22px]
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-5 [&_li]:my-2 [&_li]:text-[19px] sm:[&_li]:text-[21px] [&_li]:leading-[1.85]
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-5 [&_li]:my-2 [&_li]:text-[19px] sm:[&_li]:text-[21px] [&_li]:leading-[1.85]
            [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:text-left [&_table]:text-[15px] sm:[&_table]:text-[17px]
            [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100/90 [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-bold [&_th]:text-ink
            [&_td]:border [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-2.5 [&_td]:text-ink/80
            [&_.table-container]:my-6 [&_.table-container]:overflow-x-auto [&_.table-container]:rounded-lg [&_.table-container]:border [&_.table-container]:border-slate-200"
          dangerouslySetInnerHTML={{ __html: parsed.html }}
        />
      )}

      {/* Structured Sections (emoji cards) */}
      {!parsed.isHtml && parsed.sections.length > 0 && (
        <div className="grid gap-6">
          {parsed.sections.map((sec, idx) => (
            <div
              key={idx}
              className="card-base rounded-xl border border-hairline bg-white p-5 sm:p-6 shadow-subtle hover:border-brand/30 transition-colors"
            >
              <div className="flex items-center gap-3 border-b border-hairline pb-3.5 mb-4">
                {sec.icon && (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 border border-brand/15 text-xl shadow-xs">
                    {sec.icon}
                  </span>
                )}
                <div>
                  <h3 className="font-display text-[18px] sm:text-[19px] font-bold tracking-tight text-ink">
                    {sec.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 font-sans text-[16px] sm:text-[16.5px] leading-relaxed text-ink/80">
                {sec.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plain Text Multi-Paragraph Fallback */}
      {!parsed.isHtml && parsed.sections.length === 0 && parsed.plainParagraphs.length > 0 && (
        <div className="space-y-5 font-serif text-[19px] sm:text-[21px] leading-[1.85] text-ink/90">
          {parsed.plainParagraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      )}

      {/* Focus Areas & Topic */}
      {topic && (
        <div className="rounded-xl border border-hairline bg-surface-muted/40 p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted mb-3">
            <Tag className="h-3.5 w-3.5 text-brand" />
            <span>Legal Domain & Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <CategoryPill variant="outline">{topic}</CategoryPill>
          </div>
        </div>
      )}
    </div>
  );
}
