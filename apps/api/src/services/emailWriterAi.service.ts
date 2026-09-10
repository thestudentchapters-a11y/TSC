import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface EmailWriterInput {
  contentType?: 'current-affairs' | 'news' | 'stories' | 'campuses' | 'opportunities' | 'legal' | 'custom';
  contentId?: string;
  title?: string;
  summary?: string;
  topics?: string[];
  month?: string;
  year?: number;
  slug?: string;
  customPrompt?: string;
  tone?: 'engaging' | 'editorial' | 'urgent' | 'inspiring';
}

export interface GeneratedEmailDraft {
  subject: string;
  previewText: string;
  heading: string;
  body: string;
  buttonLabel: string;
  buttonUrl: string;
}

/**
 * High-quality fallback generator when AI API keys are not supplied or network fails.
 */
function generateSmartFallback(input: EmailWriterInput): GeneratedEmailDraft {
  const clientUrl = env.clientUrl || 'https://thestudentchapters.org';
  const title = input.title || 'New Monthly Intelligence & Student Insights';
  const type = input.contentType || 'current-affairs';

  if (type === 'current-affairs') {
    const month = input.month || 'Current';
    const year = input.year || new Date().getFullYear();
    const slug = input.slug || `current-affairs-${month.toLowerCase()}-${year}`;
    const topicsList = (input.topics && input.topics.length > 0)
      ? input.topics.join(', ')
      : 'National Policy, Global Geopolitics, Economy & Hiring, Science & Tech, and Higher Education';

    return {
      subject: `📘 Released: Current Affairs Dossier — ${month} ${year} Edition`,
      previewText: `Explore comprehensive monthly intelligence, policy changes, and career insights for ${month} ${year}.`,
      heading: `Current Affairs — ${month} ${year} Edition is Now Live`,
      body: `Dear Reader,\n\nWe are pleased to announce the release of the **${month} ${year} Edition** of THE STUDENT CHAPTERS™ Monthly Current Affairs Dossier.\n\nThis edition brings together the month's defining developments across **${topicsList}**, synthesized in clear, accessible language tailored for competitive exams, academic interviews, and informed campus conversations.\n\nKey highlights include:\n• In-depth policy breakdown of major educational and national reforms.\n• Strategic macroeconomic indicators and emerging graduate hiring corridors.\n• Verified science, technology, and space breakthroughs by Indian and global researchers.\n\nDive into the full edition online or download the offline reader format below.`,
      buttonLabel: `Read ${month} ${year} Edition`,
      buttonUrl: `${clientUrl}/current-affairs/${slug}`,
    };
  }

  if (type === 'news' || type === 'stories') {
    const slug = input.slug || 'student-journalism';
    return {
      subject: `📰 Featured Story: ${title}`,
      previewText: input.summary || 'Read the latest investigative report from The Student Chapters.',
      heading: title,
      body: `Dear Reader,\n\nA new featured student journalism report has just been published on THE STUDENT CHAPTERS™.\n\n${input.summary || 'Discover in-depth reporting and ground-level stories capturing student innovation, campus developments, and social impact across India.'}\n\nOur editorial team brings you authentic voices and investigative narratives from the heart of universities and student communities.`,
      buttonLabel: 'Read Full Story',
      buttonUrl: `${clientUrl}/news/${slug}`,
    };
  }

  if (type === 'opportunities') {
    return {
      subject: `🎯 New Opportunity: ${title}`,
      previewText: 'Verified internship, fellowship, or research opportunity now open for applications.',
      heading: title,
      body: `Dear Reader,\n\nA verified student opportunity has been posted on the TSC Opportunity Radar.\n\n${input.summary || 'Find detailed eligibility criteria, application deadlines, and stipend information to advance your academic and professional career.'}\n\nExplore all guidelines and submit your application directly.`,
      buttonLabel: 'View Opportunity & Apply',
      buttonUrl: `${clientUrl}/career/careers`,
    };
  }

  // Generic / Custom
  return {
    subject: `📢 Update from TSC: ${title}`,
    previewText: input.summary || 'Important platform update and student briefing from The Student Chapters.',
    heading: title,
    body: `Dear Reader,\n\n${input.summary || input.customPrompt || 'We are excited to share this important announcement with our community of students, educators, and campus leaders.'}\n\nStay connected for more updates, campus intelligence, and independent student journalism.`,
    buttonLabel: 'Explore on TSC',
    buttonUrl: input.slug ? `${clientUrl}/${input.slug}` : `${clientUrl}`,
  };
}

/**
 * Auto-generate high-converting broadcast emails using AI (Groq / Grok / OpenAI / Gemini)
 * with robust error handling and intelligent fallback.
 */
export async function autoWriteBroadcastEmail(input: EmailWriterInput): Promise<GeneratedEmailDraft> {
  const clientUrl = env.clientUrl || 'https://thestudentchapters.org';
  const apiKey =
    process.env.GROQ_API_KEY ||
    process.env.GROK_API_KEY ||
    process.env.XAI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    env.geminiApiKey ||
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    logger.info('[EmailWriterAI] No AI API Key found, generating smart fallback template.');
    return generateSmartFallback(input);
  }

  const prompt = `You are the Lead Editor & Chief Communications Strategist at "THE STUDENT CHAPTERS™" (TSC), India's premier independent student media and academic knowledge network.
Generate a captivating, beautifully formatted broadcast newsletter email notification for our readers (students, educators, scholars, competitive exam aspirants).

Input Content Details:
- Content Type: ${input.contentType || 'current-affairs'}
- Title: ${input.title || 'N/A'}
- Month/Year: ${input.month || ''} ${input.year || ''}
- Summary: ${input.summary || 'N/A'}
- Topics: ${input.topics ? input.topics.join(', ') : 'N/A'}
- Slug: ${input.slug || ''}
- Custom Instructions / Goal: ${input.customPrompt || 'Create a high-open-rate announcement newsletter'}
- Tone: ${input.tone || 'engaging, authoritative, crisp, and inspiring'}
- Base Website URL: ${clientUrl}

Requirements:
1. "subject": Catchy, professional email subject line with an emoji prefix (max 70 chars).
2. "previewText": Compelling inbox preheader snippet (max 100 chars).
3. "heading": Engaging headline for top of email body.
4. "body": 2-4 well-structured paragraphs with bullet points. Double line breaks between paragraphs. Use professional yet conversational tone emphasizing student relevance, exam insights, or career value.
5. "buttonLabel": Action-oriented CTA button text (e.g., "Read Full Edition →", "Explore Story →").
6. "buttonUrl": Full URL linking directly to the resource (e.g., ${clientUrl}/current-affairs/${input.slug || 'latest'}).

Return strictly valid JSON with this schema:
{
  "subject": "...",
  "previewText": "...",
  "heading": "...",
  "body": "...",
  "buttonLabel": "...",
  "buttonUrl": "..."
}`;

  let rawText = '';

  try {
    // 1. Check Groq
    if (apiKey.startsWith('gsk_') || process.env.GROQ_API_KEY) {
      const gKey = apiKey.startsWith('gsk_') ? apiKey : process.env.GROQ_API_KEY;
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are a JSON-only writer. Respond ONLY with valid JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as any;
        rawText = json?.choices?.[0]?.message?.content || '';
      }
    }

    // 2. Check Grok (xAI)
    if (!rawText && (apiKey.startsWith('xai-') || process.env.GROK_API_KEY || process.env.XAI_API_KEY)) {
      const xKey = apiKey.startsWith('xai-') ? apiKey : process.env.GROK_API_KEY || process.env.XAI_API_KEY;
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${xKey}`,
        },
        body: JSON.stringify({
          model: 'grok-2-latest',
          messages: [
            { role: 'system', content: 'You are a JSON-only writer. Respond ONLY with valid JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as any;
        rawText = json?.choices?.[0]?.message?.content || '';
      }
    }

    // 3. Check OpenAI
    if (!rawText && (apiKey.startsWith('sk-') || process.env.OPENAI_API_KEY)) {
      const oKey = apiKey.startsWith('sk-') ? apiKey : process.env.OPENAI_API_KEY;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${oKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a JSON-only writer. Respond ONLY with valid JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as any;
        rawText = json?.choices?.[0]?.message?.content || '';
      }
    }

    // 4. Default to Gemini
    if (!rawText && (env.geminiApiKey || process.env.GEMINI_API_KEY)) {
      const gKey = env.geminiApiKey || process.env.GEMINI_API_KEY;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${gKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.4,
            },
          }),
        }
      );

      if (res.ok) {
        const json = (await res.json()) as any;
        rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    if (rawText) {
      const parsed = JSON.parse(rawText) as GeneratedEmailDraft;
      if (parsed.subject && parsed.body) {
        return {
          subject: parsed.subject,
          previewText: parsed.previewText || parsed.subject,
          heading: parsed.heading || parsed.subject,
          body: parsed.body,
          buttonLabel: parsed.buttonLabel || 'Read More',
          buttonUrl: parsed.buttonUrl || clientUrl,
        };
      }
    }
  } catch (err) {
    logger.error('[EmailWriterAI] Error calling AI providers:', err);
  }

  return generateSmartFallback(input);
}
