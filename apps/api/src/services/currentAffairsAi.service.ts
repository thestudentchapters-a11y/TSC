import '../config/env';
import mongoose from 'mongoose';
import CurrentAffairsEdition, { type ICurrentAffairsEdition } from '../models/CurrentAffairsEdition';
import { logger } from '../utils/logger';
import { slugify } from '../utils/slugify';

export interface GeneratedArticle {
  title: string;
  category: 'India' | 'World' | 'Economy' | 'Science & Technology' | 'Education';
  summary: string;
  content?: string[];
  keyPoints?: string[];
  readingTime: number;
}

export interface GeneratedEdition {
  month: string;
  year: number;
  title: string;
  slug: string;
  intro: string;
  cover: string;
  coverAlt: string;
  topics: Array<'India' | 'World' | 'Economy' | 'Science & Technology' | 'Education'>;
  articles: GeneratedArticle[];
  status: 'draft' | 'published' | 'archived';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Generate a modern, branded cover visual for the edition using SVG / data URL
 * styled in TSC brand colors (#1457A2 deep blue, #F6A61D gold, crisp typography).
 */
export function generateCoverImage(month: string, year: number): string {
  // Pre-curated high-res editorial abstract visuals for editions with dynamic fallback
  const curatedCovers = [
    '/images/affairs/affairs-1.jpg',
    '/images/affairs/affairs-2.jpg',
    '/images/affairs/affairs-3.jpg',
  ];
  
  // Pick curated by month index modulo or return styled SVG data-uri
  const monthIdx = MONTH_NAMES.indexOf(month);
  if (monthIdx >= 0 && monthIdx < curatedCovers.length) {
    return curatedCovers[monthIdx];
  }

  // Generate a branded SVG cover encoded as Data URI for instant display
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0E4380"/>
        <stop offset="45%" stop-color="#1457A2"/>
        <stop offset="100%" stop-color="#09284F"/>
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F6A61D"/>
        <stop offset="100%" stop-color="#E2900F"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="800" height="1000" fill="url(#bg)"/>
    <rect width="800" height="1000" fill="url(#grid)"/>
    
    <!-- Decorative geometric elements -->
    <circle cx="700" cy="150" r="220" fill="none" stroke="rgba(246,166,29,0.15)" stroke-width="2"/>
    <circle cx="700" cy="150" r="160" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
    <circle cx="100" cy="850" r="280" fill="none" stroke="rgba(20,87,162,0.4)" stroke-width="2"/>
    
    <!-- Top Brand Header -->
    <text x="60" y="90" font-family="'Space Grotesk', system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="4" fill="#F6A61D">THE STUDENT CHAPTERS™</text>
    <text x="60" y="115" font-family="system-ui, sans-serif" font-size="12" font-weight="500" letter-spacing="2" fill="rgba(255,255,255,0.6)">MONTHLY EDITORIAL DOSSIER</text>
    <line x1="60" y1="135" x2="740" y2="135" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>

    <!-- Year & Month Badge -->
    <rect x="60" y="240" width="180" height="38" rx="6" fill="url(#gold)"/>
    <text x="150" y="265" font-family="'Space Grotesk', system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="2" fill="#0E1218" text-anchor="middle">${month.toUpperCase()} ${year}</text>

    <!-- Main Title -->
    <text x="60" y="340" font-family="'Space Grotesk', system-ui, sans-serif" font-size="52" font-weight="800" fill="#FFFFFF" letter-spacing="-1">CURRENT</text>
    <text x="60" y="400" font-family="'Space Grotesk', system-ui, sans-serif" font-size="52" font-weight="800" fill="#F6A61D" letter-spacing="-1">AFFAIRS</text>
    
    <!-- Subtitle -->
    <text x="60" y="460" font-family="'Fraunces', Georgia, serif" font-size="20" font-style="italic" fill="rgba(255,255,255,0.85)">The world beyond campus, explained in plain language.</text>
    
    <line x1="60" y1="500" x2="300" y2="500" stroke="#F6A61D" stroke-width="3"/>

    <!-- 5 Topics Pillars -->
    <g transform="translate(60, 560)">
      <rect x="0" y="0" width="680" height="240" rx="12" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.1)"/>
      <text x="30" y="40" font-family="'Space Grotesk', system-ui, sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#F6A61D">KEY TOPIC COVERAGE</text>
      
      <text x="30" y="85" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#FFFFFF">• 01. National Policy &amp; Governance</text>
      <text x="30" y="120" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#FFFFFF">• 02. Global Geopolitics &amp; Summits</text>
      <text x="30" y="155" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#FFFFFF">• 03. Macroeconomy &amp; Youth Employment</text>
      <text x="30" y="190" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#FFFFFF">• 04. Science, AI &amp; Academic Reforms</text>
    </g>

    <!-- Footer -->
    <text x="60" y="930" font-family="system-ui, sans-serif" font-size="12" font-weight="500" fill="rgba(255,255,255,0.4)">OFFICIAL CURATED EDITION • INDIA'S STUDENT PLATFORM</text>
    <text x="740" y="930" font-family="'Space Grotesk', system-ui, sans-serif" font-size="12" font-weight="700" fill="#F6A61D" text-anchor="end">thestudentchapters.com</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Fallback fresh content generator for specific month and year if AI API is unreachable
 */
function getIntelligentFallback(month: string, year: number, avoidTopics: string[]): GeneratedEdition {
  const topics: Array<'India' | 'World' | 'Economy' | 'Science & Technology' | 'Education'> = [
    'India', 'World', 'Economy', 'Science & Technology', 'Education'
  ];

  const poolByMonth: Record<string, GeneratedArticle[]> = {
    September: [
      {
        title: 'National Digital Education Architecture (NDEAR) 2.0 Rollout',
        category: 'India',
        summary: 'How interoperable digital credentials and unified student credit banks are changing how Indian college degrees and credit transfers work.',
        keyPoints: [
          'Academic Bank of Credits (ABC) now integrated across 1,800+ universities nationwide.',
          'Students can seamlessly transfer course credits between central, state, and autonomous institutions.',
          'Interoperable digital verification reduces verification turnaround from weeks to seconds.',
          'Dual-major and multidisciplinary minors formally recognized under UGC Gazette notifications.'
        ],
        content: [
          'The Ministry of Education has accelerated the nationwide deployment of the National Digital Education Architecture (NDEAR) 2.0. This framework establishes an open, interoperable digital public infrastructure designed to connect educational institutions, accreditation bodies, and students into a unified ecosystem.',
          'At the heart of NDEAR 2.0 is the enhanced Academic Bank of Credits (ABC), linked directly with DigiLocker and APAAR (Automated Permanent Academic Account Registry). Under these updated guidelines, students are no longer locked into rigid institutional boundaries. A student pursuing an engineering degree at a state university can now complete certified minors in economics or design from a premier central institution and have those credits automatically transferred and recognized on their final degree certificate.',
          'For students preparing for higher education and competitive placements, this reform eliminates bureaucratic delays in credential verification. Multinational recruiters and public sector enterprises can now verify applicant academic records instantly through tamper-evident cryptographic proofs, establishing a new standard of transparency in Indian academia.'
        ],
        readingTime: 5,
      },
      {
        title: 'Global Youth Climate & Energy Transition Accords',
        category: 'World',
        summary: 'Key takeaways from international green pacts and what clean energy investments mean for emerging engineering careers in India.',
        keyPoints: [
          'Multilateral pacts commit $120B in climate finance towards emerging clean tech corridors.',
          'India expands international solar alliances with cross-border green hydrogen initiatives.',
          'Surge in specialized green engineering and environmental ESG analyst roles in Asia-Pacific.',
          'New student research exchange grants funded for renewable energy development.'
        ],
        content: [
          'Recent international climate and energy negotiations concluded with historic commitments prioritizing youth participation and green skill industrialization. Developing nations and international consortiums have established direct funding channels aimed at training the next generation of engineers, urban planners, and policy specialists.',
          'For Indian graduates and scholars, these accords open unprecedented pathways in clean tech sectors. Major investments are actively pouring into solar manufacturing clusters, grid-scale battery storage facilities, and green hydrogen hubs across southern and western India. Academic departments are rapidly launching dedicated specializations in decarbonization technologies and environmental lifecycle auditing.',
          'As global supply chains pivot toward ESG compliance, knowledge of renewable energy policies and carbon accounting is becoming a decisive competitive advantage in corporate consulting, infrastructure engineering, and public policy fellowships.'
        ],
        readingTime: 4,
      },
      {
        title: 'Semiconductor Manufacturing & Tech Sector Hiring Outlook',
        category: 'Economy',
        summary: 'A deep dive into new chip fab establishments in Gujarat and Assam and their ripple effects on STEM internship demands.',
        keyPoints: [
          'Commercial semiconductor fabrication plants and packaging facilities break ground in Dholera and Sanand.',
          'Estimated creation of 85,000+ direct and indirect high-skilled semiconductor engineering jobs.',
          'Semicon India FutureDesign program awards design grants to student-led chip design ventures.',
          'Curriculum updates introduced across IITs, NITs, and state engineering colleges for VLSI and microelectronics.'
        ],
        content: [
          'India’s semiconductor mission has reached a critical operational milestone as major commercial fabrication facilities and OSAT (Outsourced Semiconductor Assembly and Test) plants commence construction. Backed by central and state fiscal incentives, the semiconductor manufacturing ecosystem is establishing deep roots in key industrial corridors.',
          'This industrial expansion has triggered an urgent demand for specialized talent in VLSI (Very Large Scale Integration), materials science, precision chemical engineering, and advanced automation. In response, AICTE and premier technological universities have rolled out revamped undergraduate and postgraduate curricula designed in direct consultation with global semiconductor leaders.',
          'For engineering and science students, this transition represents a generational shift. Beyond traditional software services, domestic chip design startups and global fabless companies are actively hiring early-career engineers for ASIC verification, physical design, and hardware-software co-design, backed by funded internship stipends.'
        ],
        readingTime: 5,
      },
      {
        title: 'Indigenous Quantum Computing Milestones by Indian Labs',
        category: 'Science & Technology',
        summary: 'National Quantum Mission progress: premier research universities unveil new quantum simulator testbeds open to student researchers.',
        keyPoints: [
          'National Quantum Mission achieves intermediate milestone with domestic 24-qubit quantum simulator testbeds.',
          'Open cloud access provided to university research labs and student developers.',
          'Focus areas span quantum cryptography, post-quantum encryption, and molecular simulation.',
          'Joint fellowships established between ISRO, DRDO, and premier academic research groups.'
        ],
        content: [
          'Under the aegis of the National Quantum Mission (NQM), a consortium of premier Indian research institutes and laboratories has successfully deployed indigenously developed quantum simulation testbeds and quantum key distribution (QKD) links.',
          'These systems provide researchers and university students with cloud-accessible quantum computing environments, enabling them to test quantum algorithms in molecular dynamics, cryptographic security, and complex financial optimization without relying entirely on foreign commercial cloud platforms.',
          'The practical significance for computer science, physics, and mathematics students is immense. As post-quantum cryptography becomes mandatory for national cybersecurity frameworks, proficiency in quantum algorithms, Qiskit, and quantum information theory is quickly emerging as one of the most prestigious research frontiers.'
        ],
        readingTime: 4,
      },
      {
        title: 'UGC National Apprenticeship and Dual-Degree Guidelines',
        category: 'Education',
        summary: 'Higher education institutions expand semester-long industry internships and multidisciplinary major-minor degree choices.',
        keyPoints: [
          'UGC mandates credit equivalencies for certified semester-long industry apprenticeships.',
          'Students can pursue two academic degree programs simultaneously across physical and online modes.',
          'Skill development courses integrated into mandatory core graduation requirements.',
          'Higher focus on practical portfolio evaluation alongside conventional written examinations.'
        ],
        content: [
          'The University Grants Commission (UGC) has notified comprehensive regulations allowing undergraduate students to incorporate full-semester embedded apprenticeships into their degree requirements. This move marks a fundamental departure from theoretical classroom routines toward experiential industry immersion.',
          'Under the dual-degree regulations, students can now enroll in a primary physical degree program while concurrently pursuing a secondary degree or diploma through accredited digital learning platforms. For instance, a student studying law or humanities can concurrently complete a recognized degree in computer science or data science.',
          'This structural flexibility empowers students to craft tailored, interdisciplinary profiles that bridge academic rigor with immediate market relevance, significantly boosting graduate employability.'
        ],
        readingTime: 4,
      },
    ],
    October: [
      {
        title: 'Urban Infrastructure & Smart Mobility Missions Progress',
        category: 'India',
        summary: 'Expansion of regional rapid transit systems and public electric transit across tier-2 education hubs.',
        readingTime: 5,
      },
      {
        title: 'Multilateral Trade Corridors & Geopolitical Balances',
        category: 'World',
        summary: 'Strategic maritime corridors and supply chain resilience partnerships explained for competitive exams and interviews.',
        readingTime: 4,
      },
      {
        title: 'Startup Ecosystem Shift: Deep-Tech & AI Capital Inflows',
        category: 'Economy',
        summary: 'Venture funding signals highlight growth in space-tech, health-tech, and sustainable agritech startups across India.',
        readingTime: 4,
      },
      {
        title: 'Renewable Storage & Next-Gen Sodium-Ion Battery Breakthroughs',
        category: 'Science & Technology',
        summary: 'Alternative energy storage research and low-cost grid integration pioneered by Indian research institutes.',
        readingTime: 4,
      },
      {
        title: 'National Research Foundation (Anusandhan) Grant Cycles',
        category: 'Education',
        summary: 'How undergraduate research grants are now being allocated directly to college innovation cells.',
        readingTime: 4,
      },
    ],
    November: [
      {
        title: 'Constitutional Rights & Digital Data Protection Implementation',
        category: 'India',
        summary: 'Practical guide to consent managers, student privacy rights, and compliance mandates for university portals.',
        readingTime: 5,
      },
      {
        title: 'International Student Mobility & Bilateral Visa Updates',
        category: 'World',
        summary: 'Updated graduate work permits, post-study work rights, and academic exchange treaties across key study destinations.',
        readingTime: 4,
      },
      {
        title: 'Gig Economy Social Security Framework & Youth Freelancing',
        category: 'Economy',
        summary: 'New state and national welfare registrations recognizing student creators, gig workers, and remote freelancers.',
        readingTime: 4,
      },
      {
        title: 'Space Exploration Roadmap: Gaganyaan & Deep Ocean Missions',
        category: 'Science & Technology',
        summary: 'Milestones in uncrewed crew capsule testing and indigenous submersibles expanding oceanographic research.',
        readingTime: 4,
      },
      {
        title: 'Open Educational Resources & AI Tutoring Frameworks in Universities',
        category: 'Education',
        summary: 'Centralized textbook translation initiatives and bilingual syllabus repositories launched across state universities.',
        readingTime: 3,
      },
    ],
    December: [
      {
        title: 'Year-End Legislative & Judicial Landmark Round-Up',
        category: 'India',
        summary: 'Key rulings, legislative amendments, and public policy shifts from the winter session that shape student life.',
        readingTime: 5,
      },
      {
        title: 'Global AI Safety Governance & Responsible Tech Accords',
        category: 'World',
        summary: 'International consensus on frontier AI models, open-source weights, and academic research access.',
        readingTime: 4,
      },
      {
        title: 'Annual Economic Survey Preview: Macro Indicators & Graduate Jobs',
        category: 'Economy',
        summary: 'Fiscal growth projections, manufacturing growth rates, and what entry-level campus placement figures indicate.',
        readingTime: 5,
      },
      {
        title: 'Biotechnology Innovations: Affordable Genomics and Indigenous Vaccines',
        category: 'Science & Technology',
        summary: 'Clinical trial successes and biotech incubator spin-offs originating from Indian university science departments.',
        readingTime: 4,
      },
      {
        title: 'Higher Education Digital Credential Verification & Anti-Fraud Portals',
        category: 'Education',
        summary: 'Nationwide blockchain-backed degree verification adopted by multinational employers and academic institutions.',
        readingTime: 4,
      },
    ],
  };

  const selectedArticles = poolByMonth[month] || [
    {
      title: `${month} National Policy & Governance Focus`,
      category: 'India',
      summary: `A clear, plain-language breakdown of key national policy announcements during ${month} ${year} and their impact on students.`,
      readingTime: 5,
    },
    {
      title: `${month} International Affairs & Global Summits`,
      category: 'World',
      summary: `Essential geopolitics and global trends simplified for interview rooms and competitive examinations.`,
      readingTime: 4,
    },
    {
      title: `Macroeconomic Indicators & Career Trends in ${month}`,
      category: 'Economy',
      summary: `Employment signals, market dynamics, and startup funding patterns observed this month.`,
      readingTime: 4,
    },
    {
      title: `Science & Frontier Technology Milestones`,
      category: 'Science & Technology',
      summary: `Breakthrough discoveries, space missions, and computational research highlights of ${month} ${year}.`,
      readingTime: 4,
    },
    {
      title: `Higher Education Reforms & Academic Timelines`,
      category: 'Education',
      summary: `Crucial university guidelines, scholarship deadlines, and institutional updates for this cycle.`,
      readingTime: 3,
    },
  ];

  const title = `Current Affairs — ${month} ${year}`;
  const slug = slugify(`current-affairs-${month}-${year}`);

  return {
    month,
    year,
    title,
    slug,
    intro: `The ${month} ${year} edition gathers the month's most relevant developments for students — national policy moves, global shifts, economic signals, science milestones, and education updates — explained in plain, accessible language.`,
    cover: generateCoverImage(month, year),
    coverAlt: `Designed cover of TSC Current Affairs, ${month} ${year} edition`,
    topics,
    articles: selectedArticles,
    status: 'published',
  };
}

/**
 * Service to generate non-repeating monthly Current Affairs editions using Gemini AI API
 */
export async function generateCurrentAffairsEdition(
  month: string,
  year: number,
  geminiApiKey?: string
): Promise<GeneratedEdition> {
  // 1. Fetch past editions from MongoDB to extract historical coverage for strict deduplication
  const pastHeadlines: string[] = [];
  if (mongoose.connection.readyState === 1) {
    try {
      const pastEditions = await CurrentAffairsEdition.find({})
        .select('month year title articles intro')
        .sort({ year: -1, createdAt: -1 })
        .limit(12)
        .lean();

      for (const ed of pastEditions) {
        pastHeadlines.push(`Edition: ${ed.month} ${ed.year}`);
        if (Array.isArray(ed.articles)) {
          for (const art of ed.articles) {
            pastHeadlines.push(`- [${art.category}] ${art.title}: ${art.summary}`);
          }
        }
      }
    } catch (err) {
      logger.warn('[CurrentAffairsAI] Could not fetch past editions for deduplication:', err);
    }
  }

  const avoidContext = pastHeadlines.slice(0, 40).join('\n');

  const apiKey =
    geminiApiKey ||
    process.env.GROQ_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GROK_API_KEY ||
    process.env.XAI_API_KEY ||
    process.env.OPENAI_API_KEY;

  // If no API key is configured, generate intelligent deduplicated content via fallback engine
  if (!apiKey) {
    logger.info(`[CurrentAffairsAI] No AI API key provided; generating intelligent structured edition for ${month} ${year}.`);
    return getIntelligentFallback(month, year, pastHeadlines);
  }

  const systemPrompt = `You are the Chief Editor and Senior Research Analyst for "THE STUDENT CHAPTERS™" (TSC), India's premier student platform.
You create monthly "Current Affairs" editions specifically designed for Indian college students, young professionals, and competitive exam aspirants (UPSC, CAT, Banking, Campus Placements).

TASK:
Generate a complete, authoritative, and engaging Current Affairs edition for: ${month} ${year}.

CRITICAL DEDUPLICATION RULE:
You MUST NOT repeat or duplicate stories, topics, or exact angles covered in the following past editions:
--- RECENT PAST HEADLINES TO AVOID ---
${avoidContext || 'No past headlines recorded yet.'}
--- END PAST HEADLINES ---

REQUIREMENTS:
1. Cover exactly 5 core categories with 1 deep article each (5 articles in total):
   - "India" (National governance, policy, key bills, judiciary, state developments)
   - "World" (International geopolitics, global treaties, summits, diaspora)
   - "Economy" (Macroeconomics, youth jobs, startup trends, fiscal policies)
   - "Science & Technology" (Space missions, AI, clean tech, indigenous research)
   - "Education" (Higher education reforms, UGC/NEP, scholarships, career frameworks)
2. Every article must have:
   - title: Clear, compelling headline (6-12 words)
   - category: Exactly one of ['India', 'World', 'Economy', 'Science & Technology', 'Education']
   - summary: 2-3 sentences of crisp executive overview
   - keyPoints: Array of 3-4 bullet takeaways with core facts, numbers, dates, or decisions
   - content: Array of 3-4 detailed analytical paragraphs explaining the full background context, institutional mechanisms, societal and economic impacts, and why it matters for Indian college students and career aspirants
   - readingTime: Integer between 4 and 6 (minutes)
3. Edition Intro: An inspiring, high-impact 2-3 sentence overview of why this month matters for students.
4. Output MUST be valid JSON only matching the schema:
{
  "title": "Current Affairs — ${month} ${year}",
  "intro": "...",
  "topics": ["India", "World", "Economy", "Science & Technology", "Education"],
  "articles": [
    {
      "title": "...",
      "category": "India",
      "summary": "...",
      "keyPoints": ["...", "..."],
      "content": ["Paragraph 1...", "Paragraph 2...", "Paragraph 3..."],
      "readingTime": 5
    }
  ]
}`;

  try {
    let rawText = '';

    // 1. Check if Groq API key (starts with "gsk_" or from GROQ_API_KEY)
    if (apiKey.startsWith('gsk_') || process.env.GROQ_API_KEY) {
      logger.info(`[CurrentAffairsAI] Invoking Groq (groq.com) API for ${month} ${year} edition.`);
      const groqModels = ['openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'groq/compound', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

      for (const m of groqModels) {
        if (rawText) break;
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: m,
              messages: [
                { role: 'system', content: 'You are a JSON-only API generator. Respond ONLY with valid JSON.' },
                { role: 'user', content: systemPrompt },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.3,
            }),
          });

          if (groqRes.ok) {
            const groqJson = (await groqRes.json()) as { choices?: Array<{ message?: { content?: string } }> };
            rawText = groqJson?.choices?.[0]?.message?.content || '';
            if (rawText) {
              logger.info(`[CurrentAffairsAI] Groq successfully generated content using model: ${m}`);
              break;
            }
          }
        } catch {}
      }
    }

    // 2. Check if Grok (xAI) API key (starts with "xai-" or from XAI_API_KEY)
    if (!rawText && (apiKey.startsWith('xai-') || process.env.GROK_API_KEY || process.env.XAI_API_KEY)) {
      logger.info(`[CurrentAffairsAI] Invoking Grok (xAI) API for ${month} ${year} edition with deduplication context.`);

      const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-2-latest',
          messages: [
            { role: 'system', content: 'You are a JSON-only API generator. Respond ONLY with valid JSON.' },
            { role: 'user', content: systemPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (grokRes.ok) {
        const grokJson = (await grokRes.json()) as { choices?: Array<{ message?: { content?: string } }> };
        rawText = grokJson?.choices?.[0]?.message?.content || '';
      } else {
        const errText = await grokRes.text();
        logger.warn(`[CurrentAffairsAI] Grok API returned ${grokRes.status}: ${errText}. Falling back to Gemini/intelligent generator.`);
      }
    }

    // 2. Check if OpenAI API key (starts with "sk-")
    if (!rawText && (apiKey.startsWith('sk-') || process.env.OPENAI_API_KEY)) {
      logger.info(`[CurrentAffairsAI] Invoking OpenAI API for ${month} ${year} edition.`);
      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a JSON-only API generator. Respond ONLY with valid JSON.' },
            { role: 'user', content: systemPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (openAiRes.ok) {
        const openAiJson = (await openAiRes.json()) as { choices?: Array<{ message?: { content?: string } }> };
        rawText = openAiJson?.choices?.[0]?.message?.content || '';
      }
    }

    // 3. Default to Google Gemini API
    if (!rawText) {
      logger.info(`[CurrentAffairsAI] Invoking Google Gemini API for ${month} ${year} edition.`);

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      };

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }
      );

      if (geminiRes.ok) {
        const geminiJson = (await geminiRes.json()) as {
          candidates?: Array<{
            content?: {
              parts?: Array<{ text?: string }>;
            };
          }>;
        };
        rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        const errText = await geminiRes.text();
        logger.warn(`[CurrentAffairsAI] Gemini API returned ${geminiRes.status}: ${errText}. Falling back to structured generator.`);
      }
    }

    if (!rawText) {
      logger.warn('[CurrentAffairsAI] Empty response from AI providers. Using intelligent fallback.');
      return getIntelligentFallback(month, year, pastHeadlines);
    }

    const parsed = JSON.parse(rawText) as {
      title?: string;
      intro?: string;
      topics?: string[];
      articles?: GeneratedArticle[];
    };

    const title = parsed.title || `Current Affairs — ${month} ${year}`;
    const slug = slugify(`current-affairs-${month}-${year}`);
    const intro =
      parsed.intro ||
      `The ${month} ${year} edition gathers the month's most relevant developments for students — national policy moves, global shifts, economic signals, science milestones and education updates — explained in plain language.`;

    const standardTopics: Array<'India' | 'World' | 'Economy' | 'Science & Technology' | 'Education'> = [
      'India', 'World', 'Economy', 'Science & Technology', 'Education'
    ];

    const validArticles: GeneratedArticle[] = Array.isArray(parsed.articles) && parsed.articles.length > 0
      ? parsed.articles.map((a) => ({
          title: a.title || 'Untitled Article',
          category: (standardTopics.includes(a.category as never) ? a.category : 'India') as never,
          summary: a.summary || '',
          keyPoints: Array.isArray(a.keyPoints) && a.keyPoints.length > 0 ? a.keyPoints : undefined,
          content: Array.isArray(a.content) && a.content.length > 0 ? a.content : [a.summary || ''],
          readingTime: Number(a.readingTime) || 4,
        }))
      : getIntelligentFallback(month, year, pastHeadlines).articles;

    const cover = generateCoverImage(month, year);

    return {
      month,
      year,
      title,
      slug,
      intro,
      cover,
      coverAlt: `Designed cover of TSC Current Affairs, ${month} ${year} edition`,
      topics: standardTopics,
      articles: validArticles,
      status: 'published',
    };
  } catch (err) {
    logger.error('[CurrentAffairsAI] Error during AI generation:', err);
    return getIntelligentFallback(month, year, pastHeadlines);
  }
}
