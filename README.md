# THE STUDENT CHAPTERS (TSC) — Full-Stack Platform

**India's student & youth media, community and opportunity platform.**
*Your Campus. Your Voice. Your Future.* — Discover. Learn. Connect. Create.

A production-grade monorepo: **Next.js 14 (App Router, TypeScript, Tailwind, Framer Motion)** frontend + **Node/Express (TypeScript, MongoDB/Mongoose, JWT, RBAC)** backend, with a complete admin/newsroom console, member dashboard, search, SEO, seeds and demo mode.

---

## 📁 Repository structure

```
tsc/
├── apps/
│   ├── web/                    # Next.js frontend (app router)
│   │   ├── app/                # All routes (pages, layouts, loading/error states)
│   │   ├── components/         # Reusable components (cards, forms, admin, podcast…)
│   │   ├── lib/                # Site config, data layer, admin registry, utils
│   │   ├── hooks/              # useLocalStorage, useMediaQuery, useScrollY…
│   │   ├── data/               # Bundled demo content (demo-mode fallback)
│   │   ├── types/              # Shared TypeScript content types
│   │   └── public/             # Brand assets, placeholder imagery, placeholder audio
│   └── api/                    # Express + Mongoose backend
│       └── src/
│           ├── config/         # env + db
│           ├── controllers/    # Route handlers
│           ├── middleware/     # auth (JWT + RBAC), validation, rate limits, errors
│           ├── models/         # 23 Mongoose models
│           ├── routes/         # REST routes
│           ├── services/       # Business logic (content, auth, engagement)
│           ├── utils/          # apiError, pagination, slugify, logger
│           ├── validators/     # Zod request schemas
│           └── seeds/          # Demo seed script + data
├── package.json                # npm workspaces
└── README.md
```

## 🚀 Quick start (local)

**Prerequisites:** Node ≥ 18.17, npm ≥ 9, MongoDB (local or Atlas).

```bash
# 1. install everything (workspaces)
npm install

# 2. run the API (optional — the web app runs fine in demo mode without it)
cd apps/api
cp .env.example .env          # set MONGODB_URI + JWT secrets
npm run seed                  # load demo content + demo accounts
npm run dev                   # http://localhost:5000

# 3. run the web app (new terminal)
cd apps/web
cp .env.example .env.local    # set NEXT_PUBLIC_API_URL=http://localhost:5000 (optional)
npm run dev                   # http://localhost:3000
```

**Demo mode:** if `NEXT_PUBLIC_API_URL` is empty (or the API is down), the site renders
with bundled demo content, forms/toasts/auth/admin all work client-side, and admin edits
persist in `localStorage`. Sample content is always labelled **Demo**.

**Seeded demo accounts** (after `npm run seed`):

| Role   | Email              | Password      |
|--------|--------------------|---------------|
| Admin  | admin@tsc.demo     | admin12345    |
| Editor | editor@tsc.demo    | editor12345   |
| Member | member@tsc.demo    | member12345   |

## 🔐 Environment variables

See `apps/web/.env.example` and `apps/api/.env.example`. Summary:

**Web:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_URL`, `NEXT_PUBLIC_KONNECTX_URL`
**API:** `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `CORS_ORIGIN`, optional `CLOUDINARY_*`, optional `SMTP_*` / `MAIL_FROM`

Generate secrets: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
**Never commit real secrets** — `.gitignore` already excludes `.env*`.

## 🗺️ Routes

Homepage sections (locked order): Hero → Ticker → TSC Intro → Latest News → Stories → Campus →
Career & Opportunities → Current Affairs → Podcast → Events → Legal Awareness → Flagship Campaign →
Student Participation → Community/Membership → WhatsApp/KonnectX → Final CTA → Footer.

```
/                       /news, /news/[slug]
/stories, /stories/student|startup|campus, /stories/[slug]
/campus, /campus/[slug]
/podcast, /podcast/[slug]
/events, /events/[slug]
/career, /career/jobs, /career/internships, /career/fellowships, /career/careers
/current-affairs, /current-affairs/[slug]
/legal-awareness, /legal-awareness/[slug]
/campaigns, /campaigns/all-india-career-awareness
/community   /membership   /share-your-story   /share-campus-news
/about  /contact  /search?q=  /login  /register
/dashboard (member)     /admin/** (editor/admin console)
```

Plus: `sitemap.xml`, `robots.txt`, custom 404 & 500, loading skeletons, empty/error states.

## 🛠 REST API (summary)

```
GET/POST/PUT/DELETE  /api/news[/:idOrSlug]        (write: editor+)
GET/POST/PUT/DELETE  /api/stories, /api/campuses, /api/podcasts,
                     /api/events, /api/opportunities, /api/current-affairs,
                     /api/legal-awareness, /api/campaigns, /api/campaign-episodes,
                     /api/categories, /api/tags, /api/media
POST /api/events/:id/register
POST /api/submissions/story     POST /api/submissions/campus
PUT  /api/submissions/:kind(story|campus)/:id      (moderation)
POST /api/contact
POST /api/auth/register|login|refresh|logout
GET/PUT /api/users/me
GET  /api/notifications   PUT /api/notifications/:id/read
POST/GET /api/saved
GET  /api/admin/stats     GET /api/users (admin)  PUT /api/users/:id/role (admin)
GET  /health
```

Every list endpoint supports `?page=&limit=&sort=&status=&category=…` (pagination + filtering),
uses zod validation, rate limiting, mongo-sanitization, centralized error handling and
JWT auth with role-based authorization (member / editor / admin).

## 🧩 Admin console (`/admin`)

Dashboard metrics · News · Stories · Campuses · Podcasts · Events · Jobs · Internships ·
Fellowships · Current Affairs · Legal Awareness · Campaigns · Members · Story Submissions ·
Campus Submissions · Contact Messages · Media · Homepage · Social Links · Settings.

Generic CRUD per collection (create/edit/delete, status draft→published→archived, featured
flag, slugs, SEO fields, tags, images, timestamps) with a review workflow for submissions.
**In demo mode, admin edits persist in your browser**; with the API connected, edits are live
database writes authenticated by JWT.

## 🔒 Security

- bcrypt password hashing, JWT access + refresh tokens (rotation on refresh)
- role-based authorization middleware (member / editor / admin)
- helmet secure headers, CORS allow-list, rate limiting (global + strict form limiter)
- zod validation on all writes, express-mongo-sanitize (query-injection protection)
- honeypot fields on public forms; passwords/secrets never in source

## ♿ Accessibility & performance

Semantic HTML, skip-link, keyboard-navigable nav/dropdowns/drawers/modals, ARIA roles,
visible focus states, alt text everywhere, `prefers-reduced-motion` respected (marquee,
parallax and reveals degrade to simple fades), responsive 360px→4K with zero horizontal
overflow, `next/image` optimization, lazy loading, server components by default, ISR
revalidation, minimal client JS.

## 🎨 Brand

Locked palette from the official logo — blue `#1457A2` / dark `#0E4380`, gold `#F6A61D` / deep
`#D98C0A`, ink `#0C0C0C`, cream `#FAF9F6`, white, slate `#6B7280`, hairline `#E7E5DF`.
Fonts: Space Grotesk (display) + Inter (body) + Fraunces italic (editorial accents).
Icons: Lucide. The uploaded official logo is at `apps/web/public/brand/tsc-logo.jpg`;
the header uses an SVG wordmark that mirrors it (swap freely in `components/layout/Logo.tsx`).

## 🖼 Media & placeholder content

All photography in `apps/web/public/images` is **AI-generated or stock placeholder imagery**
labelled as CMS-replaceable — it is not real TSC photography and must be replaced by the TSC
media team before launch (Admin → Media). Sample editorial content is fictional and marked
“Demo”. `public/audio/tsc-placeholder-audio.wav` is a generated placeholder used by the
podcast player demo (E01).

## ☁️ Deployment

**Web → Vercel**
1. Import the repo; set root directory `apps/web` (or use the monorepo default and adjust).
2. Env vars: `NEXT_PUBLIC_API_URL` (Render API URL), `NEXT_PUBLIC_SITE_URL`, optional WhatsApp/KonnectX links.
3. Deploy — `sitemap.xml`/`robots.txt` generate automatically.

**API → Render**
1. New Web Service → repo, root `apps/api`.
2. Build: `npm install && npm run build -w apps/api` • Start: `npm run start -w apps/api`.
3. Env vars from `apps/api/.env.example` (MongoDB URI, JWT secrets, CLIENT_URL/CORS_ORIGIN = your Vercel URL).

**Database → MongoDB Atlas**
1. Create a free cluster → database user → network access.
2. Copy the connection string into `MONGODB_URI`, run `npm run seed` once (locally or via a Render job).

## ✅ Acceptance checklist highlights

- All homepage sections in the exact required order with verbatim copy
- 30+ routes, all functional with loading/empty/error states
- Stories filtering + search; campus directory filters; career filters; global search
- Auth UI, member dashboard, admin console with CRUD across every content type
- Forms validate and store (API) or confirm (demo) with animated success states
- SEO metadata, OG/Twitter cards, JSON-LD (Organization, WebSite+SearchAction, NewsArticle,
  Event, PodcastEpisode), sitemap, robots
- `.env.example` files with zero real secrets; seed script included

---

Built for THE STUDENT CHAPTERS — *the future isn't something you wait for. You build it.*
