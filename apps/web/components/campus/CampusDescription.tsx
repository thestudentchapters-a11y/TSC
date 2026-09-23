'use client';

import { useMemo } from 'react';
import { Building2, GraduationCap, Sparkles, Tag } from 'lucide-react';
import { CategoryPill } from '@/components/common/CategoryPill';

interface CampusDescriptionProps {
  description: string;
  categories?: string[];
  campusName?: string;
}

interface ParsedSection {
  icon?: string;
  title: string;
  content: string;
  paragraphs: string[];
}

function toTitleCase(str: string): string {
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

function parseCampusContent(raw: string) {
  if (!raw) return { isHtml: false, intro: '', sections: [] as ParsedSection[], plainParagraphs: [] as string[] };

  // Check if content has HTML tags
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return { isHtml: true, html: raw, intro: '', sections: [], plainParagraphs: [] };
  }

  // Regex for matching emoji followed by uppercase section headings
  const emojiSectionRegex = new RegExp(
    '([\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}])\\s*([A-Z0-9&,/—\\-]+?(?:\\s+[A-Z0-9&,/—\\-]+?){0,5}?)(?::|\\.|\\s(?=[A-Z][a-z]|\\b(?:IIT|NIT|BITS|IIM|IISc|DU|BHU|JNU|AIIMS|The|This|Our|It|With|In|At|Offers|Features|Located|Spanning)\\b))',
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

export function CampusDescription({ description, categories = [], campusName }: CampusDescriptionProps) {
  const parsed = useMemo(() => parseCampusContent(description), [description]);

  return (
    <div className="space-y-8">
      {/* Section Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand">
            <Building2 className="h-3.5 w-3.5" />
            <span>Campus Profile</span>
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            About {campusName || 'the Campus'}
          </h2>
        </div>
      </div>

      {/* HTML Content Render */}
      {parsed.isHtml && parsed.html && (
        <div
          className="prose-tsc max-w-none font-serif text-[17px] sm:text-[18px] leading-8 text-ink/90 space-y-4
            [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:text-brand-dark [&_h2]:mt-8 [&_h2]:mb-4
            [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-xl sm:[&_h3]:text-2xl [&_h3]:text-brand-dark [&_h3]:mt-6 [&_h3]:mb-3
            [&_p]:my-4 [&_p]:leading-8
            [&_a]:text-brand [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-brand-dark
            [&_blockquote]:border-l-4 [&_blockquote]:border-gold [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-ink/80 [&_blockquote]:my-6
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_li]:my-1.5
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_li]:my-1.5"
          dangerouslySetInnerHTML={{ __html: parsed.html }}
        />
      )}

      {/* Lead Intro Paragraph */}
      {!parsed.isHtml && parsed.intro && (
        <div className="rounded-xl border border-brand/20 border-l-4 border-l-brand bg-brand-50/40 p-5 sm:p-6 shadow-xs">
          <p className="font-serif text-[16.5px] sm:text-[17.5px] leading-relaxed text-ink/90 italic">
            {parsed.intro}
          </p>
        </div>
      )}

      {/* Structured Sections (Academics, Research, Campus Life, etc.) */}
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
                  <h3 className="font-display text-[17px] sm:text-[18px] font-bold tracking-tight text-ink">
                    {sec.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-3 font-sans text-[15px] sm:text-[15.5px] leading-relaxed text-ink/80">
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
        <div className="space-y-4 font-serif text-[17px] sm:text-[18px] leading-8 text-ink/90">
          {parsed.plainParagraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      )}

      {/* Focus Areas & Categories */}
      {categories && categories.length > 0 && (
        <div className="rounded-xl border border-hairline bg-surface-muted/40 p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted mb-3">
            <Tag className="h-3.5 w-3.5 text-brand" />
            <span>Key Focus Areas & Disciplines</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <CategoryPill key={c} variant="outline">
                {c}
              </CategoryPill>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
