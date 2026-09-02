/**
 * TSC demo content — bundled seed data used when the API is not configured
 * and by the API seed script (mirrored in apps/api/src/seeds).
 *
 * ⚠ DEMO CONTENT NOTICE:
 * Every item below is clearly-fictional sample content for preview and
 * development only. It is NOT real TSC reporting. Replace everything via
 * the admin panel (/admin) or the seed scripts before launch.
 * The homepage copy in `app/page.tsx` / section components IS the real
 * TSC site copy supplied by the brand.
 */
import type {
  Article, Story, Campus, PodcastEpisode, TscEvent, Opportunity,
  CurrentAffairsEdition, LegalArticle, Campaign, StorySubmissionRecord,
  CampusSubmissionRecord, ContactMessageRecord, MemberRecord, NotificationRecord,
} from '@/types/content';

/* ─────────────────────────── NEWS ─────────────────────────── */
export const demoArticles: Article[] = [
  {
    id: 'n1', slug: 'digital-library-project-students', featured: true, status: 'published', demo: true,
    title: 'New Digital Library Project Brings Thousands of Resources to Students',
    excerpt: 'A student-led digital library initiative is making thousands of books, journals and course materials freely accessible — starting with campuses that needed it the most.',
    category: 'Education', tags: ['Digital Library', 'Access to Education', 'Student Initiative'],
    author: 'TSC Newsroom (Demo)', date: '2026-08-30', readingTime: 4,
    image: '/images/news/news-1.jpg',
    imageAlt: 'Students studying at computer terminals in a modern university digital library',
    content: [
      'For many students, the biggest barrier to learning is not motivation — it is access. A new student-led digital library project is trying to change that, one campus at a time.',
      'The initiative, currently live at three demo campuses, brings together thousands of open-access books, journals, previous-year papers and course notes in a single searchable platform built and maintained by student volunteers.',
      'Organisers say the next step is a shared catalogue that any campus community can join and contribute to. TSC will keep tracking this project as it grows. [Demo article — replace with real TSC reporting via the admin panel.]',
    ],
  },
  {
    id: 'n2', slug: 'young-innovators-national-science-fair', featured: false, status: 'published', demo: true,
    title: 'Young Innovators Win Recognition at National Science Fair',
    excerpt: 'Student teams from across the country presented low-cost solutions to everyday problems — from water conservation to accessible learning tools.',
    category: 'Student News', tags: ['Science Fair', 'Innovation', 'Achievements'],
    author: 'Demo Correspondent — Aarav K.', date: '2026-08-27', readingTime: 3,
    image: '/images/stories/story-3.jpg',
    imageAlt: 'Students collaborating over a tablet while working on a science project',
    content: [
      'The hall was full of prototypes, posters and nervous energy. At this year\'s National Science Fair (demo edition), student teams presented solutions that were simple, low-cost and deeply practical.',
      'Projects ranged from rainwater-harvesting kits assembled from household materials to a braille learning board built by a first-year team. Judges repeatedly highlighted one theme: students solving problems they see around them every day.',
      'TSC congratulates every participant. Got an achievement worth sharing? Tell us — your story could feature next. [Demo article.]',
    ],
  },
  {
    id: 'n3', slug: 'students-lead-cleanliness-drive', featured: false, status: 'published', demo: true,
    title: 'Students Lead Community Cleanliness Drive Across City Wards',
    excerpt: 'Over one weekend, student volunteers across city wards came together for a cleanliness and awareness drive — proving that campus energy can reach far beyond campus gates.',
    category: 'Youth & Society', tags: ['Community Service', 'Volunteering', 'Environment'],
    author: 'TSC Newsroom (Demo)', date: '2026-08-24', readingTime: 3,
    image: '/images/news/news-2.jpg',
    imageAlt: 'Student volunteers in gloves collecting litter during a community cleanliness drive',
    content: [
      'Early on a Sunday morning, while most of the city slept, groups of students in gloves and caps fanned out across municipal wards with bags, brooms and awareness posters.',
      'The drive — organised by campus volunteer clubs (demo) — combined cleaning with door-to-door conversations about waste segregation, covering several neighbourhoods in a single weekend.',
      'For many volunteers, it was a reminder that being a student is not just about studying. It is about showing up. [Demo article.]',
    ],
  },
  {
    id: 'n4', slug: 'student-team-builds-ai-study-companion', featured: false, status: 'published', demo: true,
    title: 'Student Team Builds AI Study Companion for Exam Preparation',
    excerpt: 'A four-member student team has built an AI-powered study companion that turns lengthy notes into interactive quizzes and revision plans.',
    category: 'Technology & Innovation', tags: ['AI', 'EdTech', 'Student Projects'],
    author: 'Demo Correspondent — Priya S.', date: '2026-08-20', readingTime: 4,
    image: '/images/news/news-3.jpg',
    imageAlt: 'Student developers working together on laptops in the evening',
    content: [
      'It started as a hostel-room experiment: could a small team of students build a tool that makes revision less painful? Eight months later, their AI study companion (demo) does exactly that.',
      'The app converts class notes into summaries, flashcards and timed quizzes, and builds a spaced-repetition plan around exam dates. The team says the hardest part was not the AI — it was designing something students would actually use daily.',
      'The project is currently in closed beta across two demo campuses. [Demo article.]',
    ],
  },
  {
    id: 'n5', slug: 'universities-expand-support-services', featured: false, status: 'published', demo: true,
    title: 'Universities Expand Mental Health & Academic Support for Students',
    excerpt: 'From peer-support circles to extended counselling hours, institutions are quietly expanding the support systems available to students on campus.',
    category: 'Education', tags: ['Mental Health', 'Wellbeing', 'Campus Life'],
    author: 'TSC Newsroom (Demo)', date: '2026-08-15', readingTime: 4,
    image: '/images/news/news-5.jpg',
    imageAlt: 'A student in a calm conversation with a campus counsellor',
    content: [
      'Academic pressure, placements, family expectations — student life carries real weight. A growing number of institutions (demo) are responding by strengthening the support systems around students.',
      'Changes include extended counselling hours, trained peer-support circles, quiet study and rest spaces, and clearer processes for academic emergencies.',
      'If your campus has taken a step worth celebrating, share it with TSC. [Demo article.]',
    ],
  },
  {
    id: 'n6', slug: 'hackathon-season-record-participation', featured: false, status: 'published', demo: true,
    title: 'Hackathon Season Kicks Off With Record Campus Participation',
    excerpt: 'Weekend hackathons are drawing bigger crowds than fest concerts — and students are here for the build, not just the prizes.',
    category: 'Technology & Innovation', tags: ['Hackathon', 'Coding', 'Events'],
    author: 'Demo Correspondent — Aarav K.', date: '2026-08-10', readingTime: 3,
    image: '/images/news/news-4.jpg',
    imageAlt: 'Student teams working at tables during a hackathon',
    content: [
      'Tables strewn with cables, coffee cups and borrowed chargers — hackathon season is officially here, and participation numbers (demo) are the highest campuses have seen.',
      'What is changing, say organisers, is the mix: designers, business students and first-time coders are joining in numbers that rival the engineering crowd.',
      'TSC\'s events calendar lists hackathons open to students across India. [Demo article.]',
    ],
  },
  {
    id: 'n7', slug: 'student-councils-transparency-reforms', featured: false, status: 'published', demo: true,
    title: 'Student Councils Push for More Transparent Evaluation Reforms',
    excerpt: 'A recurring theme across campuses: students want clearer evaluation criteria, published answer keys and timely feedback.',
    category: 'Youth & Society', tags: ['Student Rights', 'Governance', 'Reform'],
    author: 'TSC Newsroom (Demo)', date: '2026-08-05', readingTime: 3,
    image: '/images/campus/campus-6.jpg',
    imageAlt: 'Students and faculty in discussion inside a classroom',
    content: [
      'Across demo campuses this semester, one demand has surfaced again and again: transparency in evaluation.',
      'Student councils are requesting published marking schemes, access to answer scripts within a fixed window, and structured feedback on projects and viva assessments.',
      'TSC\'s Legal Awareness section explains the rules and recourse available to students in such situations. [Demo article.]',
    ],
  },
  {
    id: 'n8', slug: 'campus-fests-go-green', featured: false, status: 'published', demo: true,
    title: 'Campus Fests Go Green: Reusable Sets, Digital Tickets and Cleaner Celebrations',
    excerpt: 'Fest season is getting a sustainability makeover as student committees rethink how India\'s biggest campus celebrations are run.',
    category: 'Student News', tags: ['Sustainability', 'Fests', 'Campus Life'],
    author: 'Demo Correspondent — Priya S.', date: '2026-07-28', readingTime: 3,
    image: '/images/events/event-3.jpg',
    imageAlt: 'Students celebrating at a college cultural festival',
    content: [
      'The annual fest is a campus\'s biggest moment — and, traditionally, its biggest pile of waste. This year, several demo fest committees decided to change that.',
      'Reusable stage sets, digital tickets, water refill stations and volunteer-run waste-sorting teams turned out to be easier to adopt than expected.',
      'Celebration and responsibility, organisers say, are not opposites. [Demo article.]',
    ],
  },
];

/* ─────────────────────────── STORIES ─────────────────────────── */
export const demoStories: Story[] = [
  {
    id: 's1', slug: 'student-who-turned-problem-into-solution', category: 'student', featured: true, status: 'published', demo: true,
    title: 'The Student Who Turned a Problem Into a Solution',
    dek: 'Meet the young minds creating solutions for problems around them.',
    image: '/images/stories/story-3.jpg', imageAlt: 'Students collaborating on a solution over a tablet',
    author: 'Demo Writer — Meera R.', authorRole: 'TSC Stories (Demo)', campus: 'Nalanda Institute of Technology (Demo)',
    date: '2026-08-22', readingTime: 5,
    quote: { text: 'I did not start because I wanted to build a product. I started because the problem would not leave me alone.', person: 'Demo student innovator' },
    content: [
      'Every campus has that one student who cannot walk past a broken thing without stopping. This is a story about one of them. (Demo story.)',
      'It began with a complaint everyone had accepted as normal. Then a prototype built from scavenged parts. Then a small pilot, a failed version, a better version — and finally a solution that the people around them actually use.',
      'The journey was not linear. There were dead ends, borrowed equipment, exams that interrupted everything, and moments of nearly quitting. What kept it going was simple: the problem stayed real.',
      'TSC tells these stories because the next solution-builder might be reading this in a classroom right now. [Demo story — publish real journeys via the admin panel.]',
    ],
  },
  {
    id: 's2', slug: 'from-classroom-to-startup', category: 'startup', featured: true, status: 'published', demo: true,
    title: 'From Classroom to Startup',
    dek: 'How a college idea became the beginning of an entrepreneurial journey.',
    image: '/images/stories/story-2.jpg', imageAlt: 'Student founders working on code and ideas together',
    author: 'Demo Writer — Kabir J.', authorRole: 'TSC Stories (Demo)', campus: 'Vidya Vihar Central University (Demo)',
    date: '2026-08-18', readingTime: 6,
    quote: { text: 'The classroom gave us the idea. The campus gave us our first users.', person: 'Demo student founder' },
    content: [
      'Nobody starts a company in a classroom. But a lot of companies start as classroom problems — assignments, projects, the irritating gap between what exists and what should exist.',
      'This is the story of one such journey (demo): a semester project that refused to end with a grade, the first hundred users from the hostel next door, and the slow realisation that building something is a full-time education in itself.',
      'There were co-founder arguments, a pivot nobody wanted to admit was needed, and the first rupee of revenue that felt bigger than any placement offer.',
      'The startup is still early. The journey is already worth telling. [Demo story.]',
    ],
  },
  {
    id: 's3', slug: 'inside-a-campus-thats-building-something-different', category: 'campus', featured: true, status: 'published', demo: true,
    title: "Inside a Campus That's Building Something Different",
    dek: 'Discover the people and communities transforming campus life.',
    image: '/images/stories/story-4.jpg', imageAlt: 'Students walking across a green university campus',
    author: 'Demo Writer — Meera R.', authorRole: 'TSC Stories (Demo)', campus: 'Coastal University of Arts & Sciences (Demo)',
    date: '2026-08-12', readingTime: 5,
    content: [
      'Some campuses you walk into and immediately feel a rhythm — workshops on weekends, clubs that actually build things, corridors where ideas are argued over chai.',
      'This story (demo) goes inside one such campus to meet the communities creating that rhythm: the makers club that meets at midnight, the research group that mentors first-years, the culture collective that turns the auditorium into a stage for anyone with something to say.',
      'The lesson: a campus is not different because of its buildings. It is different because of what its students refuse to leave undone. [Demo story.]',
    ],
  },
  {
    id: 's4', slug: 'from-a-small-town-to-a-national-stage', category: 'student', featured: false, status: 'published', demo: true,
    title: 'From a Small Town to a National Stage',
    dek: 'A journey of preparation, self-doubt, and finally being heard.',
    image: '/images/stories/story-1.jpg', imageAlt: 'A student receiving an award on stage as the audience applauds',
    author: 'Demo Writer — Ananya T.', authorRole: 'TSC Stories (Demo)', campus: 'Sagar Public University (Demo)',
    date: '2026-08-05', readingTime: 4,
    content: [
      'The first time they spoke on a mic, the voice shook. The second time, less. By the national round (demo competition), the room listened.',
      'This is a story about the distance between a small town and a national stage — and how that distance is crossed one prepared evening at a time.',
      'It is also a story about the people who helped: a teacher who stayed back after class, a sibling who was the first audience, a friend who never missed a practice round. [Demo story.]',
    ],
  },
  {
    id: 's5', slug: 'the-interview-that-changed-how-i-see-failure', category: 'student', featured: false, status: 'published', demo: true,
    title: 'The Interview That Changed How I See Failure',
    dek: 'What a rejection call taught one student about starting again.',
    image: '/images/stories/story-5.jpg', imageAlt: 'A student studying alone late at night in a warm library',
    author: 'Demo Writer — Kabir J.', authorRole: 'TSC Stories (Demo)', campus: 'Sunrise Engineering College (Demo)',
    date: '2026-07-30', readingTime: 4,
    content: [
      'The rejection email was polite, brief and devastating — exactly the kind every student dreads in placement season.',
      'But the follow-up conversation (a feedback call the student almost did not take) reframed everything: the gap was not ability, it was preparation strategy.',
      'Six months later, the same story has a different ending — and a completely different relationship with the word "no". [Demo story.]',
    ],
  },
  {
    id: 's6', slug: 'the-hostel-room-studio', category: 'startup', featured: false, status: 'published', demo: true,
    title: 'The Hostel Room Studio',
    dek: 'How three friends turned a hostel room into a production studio between classes.',
    image: '/images/campaign/campaign-3.jpg', imageAlt: 'Young founders at work in a startup workspace',
    author: 'Demo Writer — Ananya T.', authorRole: 'TSC Stories (Demo)', campus: 'Himalayan Polytechnic & Research Institute (Demo)',
    date: '2026-07-22', readingTime: 5,
    content: [
      'Two beds pushed aside, one borrowed mic, a blanket on the wall for sound damping — that was version one of the studio.',
      'What followed is a story about creative problem-solving with zero budget: clients found through Instagram DMs, deliveries negotiated around class timetables, and equipment bought one freelance project at a time.',
      'Today the "studio" has a real address. But the founders say the hustle was the best curriculum they ever had. [Demo story.]',
    ],
  },
  {
    id: 's7', slug: 'when-a-class-project-became-a-company', category: 'startup', featured: false, status: 'published', demo: true,
    title: 'When a Class Project Became a Company',
    dek: 'A semester assignment, an understanding mentor, and twelve months of saying "what if".',
    image: '/images/stories/story-6.jpg', imageAlt: 'A confident student presenting to an audience',
    author: 'Demo Writer — Meera R.', authorRole: 'TSC Stories (Demo)', campus: 'Vidya Vihar Central University (Demo)',
    date: '2026-07-15', readingTime: 5,
    content: [
      'The brief was simple: propose a solution to a local problem. The submission was due Friday. The company, as it turned out, was due a year later.',
      'This demo story tracks the strange, wonderful path from assignment to incorporation — including the moment the team realised their classmates were genuinely their first paying users.',
      'Their advice to other student founders is refreshingly unglamorous: finish the assignment first. Then keep going. [Demo story.]',
    ],
  },
  {
    id: 's8', slug: 'the-library-that-never-sleeps', category: 'campus', featured: false, status: 'published', demo: true,
    title: 'The Library That Never Sleeps',
    dek: 'Open all night, powered by students — inside a campus reading-room movement.',
    image: '/images/campus/campus-4.jpg', imageAlt: 'Students studying in a classic university library at night',
    author: 'Demo Writer — Kabir J.', authorRole: 'TSC Stories (Demo)', campus: 'Nalanda Institute of Technology (Demo)',
    date: '2026-07-08', readingTime: 4,
    content: [
      'At 2 a.m., the reading room is fuller than most classrooms are at noon. Exam season? Yes. But also — a culture.',
      'This demo story explores how a student-run night library initiative changed how one campus studies: volunteer-managed shifts, a silence code everyone respects, and chai that appears mysteriously at midnight.',
      'Sometimes the best campus infrastructure is the kind students build themselves. [Demo story.]',
    ],
  },
  {
    id: 's9', slug: 'how-one-club-turned-a-quiet-campus-into-a-stage', category: 'campus', featured: false, status: 'published', demo: true,
    title: 'How One Club Turned a Quiet Campus Into a Stage',
    dek: 'Open mics, street theatre and a lot of courage — the story of a campus culture collective.',
    image: '/images/events/event-3.jpg', imageAlt: 'A crowd of students enjoying a performance at a campus cultural night',
    author: 'Demo Writer — Ananya T.', authorRole: 'TSC Stories (Demo)', campus: 'Coastal University of Arts & Sciences (Demo)',
    date: '2026-06-30', readingTime: 4,
    content: [
      'For years, the auditorium was booked twice a year. Then a handful of students asked a dangerous question: what if we used it every month?',
      'The demo story of a culture collective that started with a nervous open mic and grew into a movement — poetry, debate, music, theatre — that gave a quiet campus its voice.',
      'The secret, the founders say, was the first five minutes rule: make the first five minutes so welcoming that nobody fears the stage. [Demo story.]',
    ],
  },
];

/* ─────────────────────────── CAMPUSES ─────────────────────────── */
export const demoCampuses: Campus[] = [
  {
    id: 'c1', slug: 'vidya-vihar-central-university', demo: true,
    name: 'Vidya Vihar Central University', university: 'Vidya Vihar Central University', city: 'Pune', state: 'Maharashtra', type: 'Central University',
    description: 'A demo campus known for its student incubator, weekend makers meets and an active research circle. [Demo campus — replace with real campus profiles via admin.]',
    image: '/images/campus/campus-1.jpg', imageAlt: 'Red-brick academic building on a green university campus',
    categories: ['Campus News', 'Student Achievements', 'Campus Life'],
    latestStory: { title: 'From Classroom to Startup', slug: 'from-classroom-to-startup', date: '2026-08-18' },
    upcomingEvent: { title: 'Education Fair: Courses, Colleges & Careers', slug: 'education-fair-courses-colleges-careers', date: '2026-09-12' },
    counts: { stories: 2, events: 2, contributors: 9 },
  },
  {
    id: 'c2', slug: 'nalanda-institute-of-technology', demo: true,
    name: 'Nalanda Institute of Technology', university: 'Nalanda Institute of Technology', city: 'Patna', state: 'Bihar', type: 'Technical Institute',
    description: 'A demo engineering campus with a thriving hackathon culture and a student-run night library. [Demo campus — replace with real campus profiles via admin.]',
    image: '/images/campus/campus-2.jpg', imageAlt: 'Students walking together on a university pathway',
    categories: ['Campus Events', 'Clubs & Communities', 'Student Initiatives'],
    latestStory: { title: 'The Library That Never Sleeps', slug: 'the-library-that-never-sleeps', date: '2026-07-08' },
    upcomingEvent: { title: 'Career Awareness Workshop', slug: 'career-awareness-workshop', date: '2026-09-18' },
    counts: { stories: 2, events: 2, contributors: 7 },
  },
  {
    id: 'c3', slug: 'coastal-university-of-arts-and-sciences', demo: true,
    name: 'Coastal University of Arts & Sciences', university: 'Coastal University of Arts & Sciences', city: 'Kochi', state: 'Kerala', type: 'State University',
    description: 'A demo campus celebrated for its culture collectives, debate society and waterfront campus life. [Demo campus — replace with real campus profiles via admin.]',
    image: '/images/campus/campus-3.jpg', imageAlt: 'A group of students enjoying campus life outside an academic block',
    categories: ['Campus Life', 'Clubs & Communities', 'Campus News'],
    latestStory: { title: "Inside a Campus That's Building Something Different", slug: 'inside-a-campus-thats-building-something-different', date: '2026-08-12' },
    upcomingEvent: { title: 'Yuva Cultural Night', slug: 'yuva-cultural-night', date: '2026-10-11' },
    counts: { stories: 2, events: 2, contributors: 8 },
  },
  {
    id: 'c4', slug: 'sagar-public-university', demo: true,
    name: 'Sagar Public University', university: 'Sagar Public University', city: 'Bhopal', state: 'Madhya Pradesh', type: 'State University',
    description: 'A demo campus with strong social-science research groups and a growing student leadership programme. [Demo campus — replace with real campus profiles via admin.]',
    image: '/images/campus/campus-4.jpg', imageAlt: 'Students reading between bookshelves in a classic library',
    categories: ['Student Achievements', 'Student Initiatives', 'Campus News'],
    latestStory: { title: 'From a Small Town to a National Stage', slug: 'from-a-small-town-to-a-national-stage', date: '2026-08-05' },
    upcomingEvent: { title: 'Leadership Bootcamp for Student Councils', slug: 'leadership-bootcamp-student-councils', date: '2026-10-02' },
    counts: { stories: 1, events: 1, contributors: 6 },
  },
  {
    id: 'c5', slug: 'himalayan-polytechnic-and-research-institute', demo: true,
    name: 'Himalayan Polytechnic & Research Institute', university: 'Himalayan Polytechnic & Research Institute', city: 'Dehradun', state: 'Uttarakhand', type: 'Polytechnic',
    description: 'A demo polytechnic campus where media, making and mountains meet — home to a student production studio. [Demo campus — replace with real campus profiles via admin.]',
    image: '/images/campus/campus-5.jpg', imageAlt: 'Students working with books and laptops in a modern study space',
    categories: ['Clubs & Communities', 'Campus Events', 'Campus Life'],
    latestStory: { title: 'The Hostel Room Studio', slug: 'the-hostel-room-studio', date: '2026-07-22' },
    upcomingEvent: { title: 'Founders\u2019 Meetup & Networking Evening', slug: 'founders-meetup-networking-evening', date: '2026-09-26' },
    counts: { stories: 1, events: 1, contributors: 5 },
  },
  {
    id: 'c6', slug: 'sunrise-engineering-college', demo: true,
    name: 'Sunrise Engineering College', university: 'Sunrise Engineering College', city: 'Hyderabad', state: 'Telangana', type: 'Engineering College',
    description: 'A demo engineering college with an active E-Cell and one of the loudest fest seasons in the region. [Demo campus — replace with real campus profiles via admin.]',
    image: '/images/campus/campus-6.jpg', imageAlt: 'An instructor engaging with students in a classroom',
    categories: ['Campus Events', 'Student Achievements', 'Clubs & Communities'],
    latestStory: { title: 'The Interview That Changed How I See Failure', slug: 'the-interview-that-changed-how-i-see-failure', date: '2026-07-30' },
    upcomingEvent: { title: 'Pitch Your Idea: Student Startup Competition', slug: 'pitch-your-idea-startup-competition', date: '2026-10-24' },
    counts: { stories: 1, events: 1, contributors: 6 },
  },
];

/* ─────────────────────────── PODCAST ─────────────────────────── */
export const demoEpisodes: PodcastEpisode[] = [
  {
    id: 'p1', slug: 'what-nobody-tells-you-about-your-first-startup', episodeNumber: 1, featured: true, demo: true,
    title: 'What Nobody Tells You About Your First Startup',
    description: 'A candid conversation with a student founder about the unglamorous middle — between the big idea and the first real milestone. Co-founders, first users, first mistakes. [Demo episode.]',
    guest: 'Ishaan Verma', guestRole: 'Founder, [Demo Startup] • Final-year student',
    category: 'Founder Stories', durationLabel: '38:12', date: '2026-08-25',
    image: '/images/hero/hero-podcast.jpg', imageAlt: 'Two microphones set up for a podcast recording',
    audioUrl: '/audio/tsc-placeholder-audio.wav', videoUrl: null,
    platforms: { youtube: null, spotify: null, apple: null },
    transcript: [
      '[00:00] Host: Welcome to TSC Podcast — conversations that matter. [Demo transcript — full transcript publishes with the real episode.]',
      '[00:42] Guest: The idea was the easy part. Everything after the idea was the education.',
      '[12:10] Guest: Our first hundred users were all classmates. They were also our harshest critics.',
      '[26:55] Host: What would you tell your first-year self?',
    ],
  },
  {
    id: 'p2', slug: 'the-gap-year-that-changed-everything', episodeNumber: 2, featured: false, demo: true,
    title: 'The Gap Year That Changed Everything',
    description: 'A student voices episode on choosing an unconventional pause — and what a year away from the syllabus actually taught one young person. [Demo episode.]',
    guest: 'Riya Chatterjee', guestRole: 'Student & writer',
    category: 'Student Voices', durationLabel: '31:40', date: '2026-08-11',
    image: '/images/podcast/podcast-1.jpg', imageAlt: 'A modern podcast recording setup with microphone and laptop',
    audioUrl: null, videoUrl: null,
    platforms: { youtube: null, spotify: null, apple: null },
    transcript: ['[Demo transcript placeholder — publishes with the real episode.]'],
  },
  {
    id: 'p3', slug: 'breaking-into-tech-without-a-cs-degree', episodeNumber: 3, featured: false, demo: true,
    title: 'Breaking Into Tech Without a CS Degree',
    description: 'A career conversation about routes into technology careers from non-traditional backgrounds — portfolios, projects and the skills that actually matter. [Demo episode.]',
    guest: 'Aman Khanna', guestRole: 'Software engineer & mentor',
    category: 'Career Conversations', durationLabel: '44:05', date: '2026-07-28',
    image: '/images/podcast/podcast-2.jpg', imageAlt: 'A microphone on a wooden desk in a recording studio',
    audioUrl: null, videoUrl: null,
    platforms: { youtube: null, spotify: null, apple: null },
    transcript: ['[Demo transcript placeholder — publishes with the real episode.]'],
  },
  {
    id: 'p4', slug: 'ideas-are-cheap-execution-is-everything', episodeNumber: 4, featured: false, demo: true,
    title: 'Ideas Are Cheap. Execution Is Everything.',
    description: 'An ideas & perspectives episode on why the world is full of unbuilt ideas — and what separates people who build from people who plan. [Demo episode.]',
    guest: 'Dr. Nandita Rao', guestRole: 'Educator & innovation researcher',
    category: 'Ideas & Perspectives', durationLabel: '29:58', date: '2026-07-14',
    image: '/images/podcast/podcast-3.jpg', imageAlt: 'Recording equipment for a podcast session',
    audioUrl: null, videoUrl: null,
    platforms: { youtube: null, spotify: null, apple: null },
    transcript: ['[Demo transcript placeholder — publishes with the real episode.]'],
  },
  {
    id: 'p5', slug: 'studying-smart-science-over-superstition', episodeNumber: 5, featured: false, demo: true,
    title: 'Studying Smart: Science Over Superstition',
    description: 'Spaced repetition, active recall, sleep and stress — an evidence-based conversation about how students actually learn better. [Demo episode.]',
    guest: 'Vikram Shetty', guestRole: 'Learning researcher',
    category: 'Ideas & Perspectives', durationLabel: '36:22', date: '2026-06-30',
    image: '/images/podcast/podcast-4.jpg', imageAlt: 'A podcast studio desk with microphones and headphones',
    audioUrl: null, videoUrl: null,
    platforms: { youtube: null, spotify: null, apple: null },
    transcript: ['[Demo transcript placeholder — publishes with the real episode.]'],
  },
  {
    id: 'p6', slug: 'from-campus-radio-to-community-building', episodeNumber: 6, featured: false, demo: true,
    title: 'From Campus Radio to Community Building',
    description: 'A student voices episode about how a tiny campus radio project grew into a community platform — and the lessons in leadership along the way. [Demo episode.]',
    guest: 'Zoya Ahmed', guestRole: 'Campus radio founder',
    category: 'Student Voices', durationLabel: '33:47', date: '2026-06-16',
    image: '/images/podcast/podcast-5.jpg', imageAlt: 'A young creator recording a podcast in a home studio',
    audioUrl: null, videoUrl: null,
    platforms: { youtube: null, spotify: null, apple: null },
    transcript: ['[Demo transcript placeholder — publishes with the real episode.]'],
  },
];

/* ─────────────────────────── EVENTS ─────────────────────────── */
export const demoEvents: TscEvent[] = [
  {
    id: 'e1', slug: 'career-awareness-workshop', featured: true, status: 'upcoming', demo: true,
    title: 'Career Awareness Workshop',
    dek: 'Helping students discover careers beyond the conventional path.',
    description: [
      'Most students choose careers from a list of five they have actually heard of. This workshop (demo) exists to stretch that list — with real professionals, real journeys and honest conversations about what different careers actually look like day to day.',
      'Sessions include career discovery frameworks, live Q&A with professionals from unexpected fields, and a planning exercise every participant takes home.',
    ],
    date: '2026-09-18', time: '10:00 AM – 4:00 PM', venue: 'Seminar Hall A, Nalanda Institute of Technology (Demo)', city: 'Patna', state: 'Bihar',
    organizer: 'TSC Career Awareness Team (Demo)', category: 'Career',
    image: '/images/events/event-1.jpg', imageAlt: 'A speaker addressing students at a career workshop',
    registrationUrl: null, registrationDeadline: '2026-09-15',
  },
  {
    id: 'e2', slug: 'founders-meetup-networking-evening', featured: false, status: 'upcoming', demo: true,
    title: "Founders' Meetup & Networking Evening",
    dek: 'Student founders, builders and the merely curious — one room, zero gatekeeping.',
    description: [
      'An evening of lightning talks by student founders (demo), speed networking, and open tables for anyone hunting co-founders, feedback or first customers.',
      'No backgrounds required. Bring questions, leave with contacts.',
    ],
    date: '2026-09-26', time: '5:30 PM – 8:30 PM', venue: 'Innovation Hub, [Demo Venue]', city: 'Bengaluru', state: 'Karnataka',
    organizer: 'Demo E-Cell Collective', category: 'Networking',
    image: '/images/events/event-4.jpg', imageAlt: 'Audience listening to a speaker at a networking seminar',
    registrationUrl: null, registrationDeadline: '2026-09-22',
  },
  {
    id: 'e3', slug: 'education-fair-courses-colleges-careers', featured: false, status: 'upcoming', demo: true,
    title: 'Education Fair: Courses, Colleges & Careers',
    dek: 'Meet institutions, explore programmes and ask the questions brochures never answer.',
    description: [
      'A demo education fair bringing together institutions, course providers and career counsellors under one roof — designed around student questions, not sales pitches.',
      'Includes dedicated sessions on admissions timelines, scholarships and portfolio building.',
    ],
    date: '2026-09-12', time: '9:00 AM – 6:00 PM', venue: 'Main Auditorium, [Demo Campus]', city: 'Ranchi', state: 'Jharkhand',
    organizer: 'Demo Education Collective', category: 'Education',
    image: '/images/campus/campus-1.jpg', imageAlt: 'A university campus building where an education fair is hosted',
    registrationUrl: null, registrationDeadline: '2026-09-10',
  },
  {
    id: 'e4', slug: 'national-student-hackathon-2026', featured: true, status: 'upcoming', demo: true,
    title: 'National Student Hackathon 2026',
    dek: 'Thirty-six hours, real problem statements, and a hall full of people who build.',
    description: [
      'The demo edition of a national student hackathon: tracks in education, civic tech, sustainability and open innovation. Mentors on site, honest judging, and demos that actually work (mostly).',
      'Open to all full-time students. Teams of up to four.',
    ],
    date: '2026-10-04', time: '8:00 AM (Day 1) – 6:00 PM (Day 2)', venue: 'Tech Park Block, Coastal University (Demo)', city: 'Kochi', state: 'Kerala',
    organizer: 'Demo Tech Communities', category: 'Technology',
    image: '/images/events/event-2.jpg', imageAlt: 'Students gathered at tables during a hackathon event',
    registrationUrl: null, registrationDeadline: '2026-09-27',
  },
  {
    id: 'e5', slug: 'leadership-bootcamp-student-councils', featured: false, status: 'upcoming', demo: true,
    title: 'Leadership Bootcamp for Student Councils',
    dek: 'Two days of governance, communication and getting things done inside institutions.',
    description: [
      'A demo bootcamp for student council members: running meetings that end in decisions, representing voices that disagree, budgeting for events, and building teams that outlast tenures.',
    ],
    date: '2026-10-02', time: '9:30 AM – 5:00 PM', venue: 'Convention Centre, Sagar Public University (Demo)', city: 'Bhopal', state: 'Madhya Pradesh',
    organizer: 'Demo Leadership Foundation', category: 'Leadership',
    image: '/images/events/event-1.jpg', imageAlt: 'Students taking notes during a leadership workshop session',
    registrationUrl: null, registrationDeadline: '2026-09-28',
  },
  {
    id: 'e6', slug: 'yuva-cultural-night', featured: false, status: 'upcoming', demo: true,
    title: 'Yuva Cultural Night',
    dek: 'Music, theatre, poetry and dance — a stage built by students, for students.',
    description: [
      'The demo edition of a student cultural night: open-mic warm-ups, band performances, a street-theatre showcase and the annual poetry slam finale.',
    ],
    date: '2026-10-11', time: '5:00 PM – 10:00 PM', venue: 'Open Air Theatre, Coastal University (Demo)', city: 'Kochi', state: 'Kerala',
    organizer: 'Demo Culture Collective', category: 'Culture',
    image: '/images/events/event-3.jpg', imageAlt: 'A crowd enjoying a performance at a college cultural night',
    registrationUrl: null, registrationDeadline: '2026-10-08',
  },
  {
    id: 'e7', slug: 'pitch-your-idea-startup-competition', featured: false, status: 'upcoming', demo: true,
    title: 'Pitch Your Idea: Student Startup Competition',
    dek: 'Five minutes, five slides, one idea — and a room of people who might join it.',
    description: [
      'A demo pitch competition for student entrepreneurs: pitching workshops, a qualifying round, and a final showcase before a jury of founders and educators.',
    ],
    date: '2026-10-24', time: '10:00 AM – 7:00 PM', venue: 'E-Cell Arena, Sunrise Engineering College (Demo)', city: 'Hyderabad', state: 'Telangana',
    organizer: 'Demo E-Cell Network', category: 'Entrepreneurship',
    image: '/images/campaign/campaign-3.jpg', imageAlt: 'Young founders presenting their startup idea',
    registrationUrl: null, registrationDeadline: '2026-10-18',
  },
  {
    id: 'e8', slug: 'summer-coding-sprint', featured: false, status: 'past', demo: true,
    title: 'Summer Coding Sprint',
    dek: 'A four-week remote sprint where 200 students shipped their first projects.',
    description: [
      'The demo summer sprint paired beginners with mentors and one goal: ship something real. This event has concluded — highlights and project gallery coming to TSC Stories. [Demo event.]',
    ],
    date: '2026-08-15', time: 'Remote • Evenings', venue: 'Online', city: 'Remote', state: 'Pan-India',
    organizer: 'Demo Tech Communities', category: 'Technology',
    image: '/images/news/news-4.jpg', imageAlt: 'Students coding together during a sprint',
    registrationUrl: null, registrationDeadline: '2026-08-01',
  },
];

/* ─────────────────────────── OPPORTUNITIES ─────────────────────────── */
export const demoOpportunities: Opportunity[] = [
  {
    id: 'o1', slug: 'graduate-trainee-operations-brightcart', type: 'Job', mode: 'On-site', featured: true, active: true, demo: true,
    title: 'Graduate Trainee — Operations', organization: 'BrightCart [Demo Org]',
    location: 'Bengaluru, Karnataka', eligibility: '2026 graduates • Any degree',
    deadline: '2026-09-20', postedOn: '2026-08-20',
    description: 'A demo early-career programme rotating trainees across supply-chain, cataloguing and vendor operations, with mentorship and a structured 12-month pathway.',
    skills: ['Communication', 'Excel / Sheets', 'Problem Solving', 'Ownership'],
    applicationUrl: null,
  },
  {
    id: 'o2', slug: 'junior-content-writer-demo-media', type: 'Job', mode: 'Hybrid', featured: false, active: true, demo: true,
    title: 'Junior Content Writer', organization: 'Demo Media House',
    location: 'Mumbai, Maharashtra', eligibility: '0–2 years • Any graduate',
    deadline: '2026-09-30', postedOn: '2026-08-24',
    description: 'Write explainers, campus features and social copy for a youth publication (demo listing). Strong editing instincts matter more than experience.',
    skills: ['Writing', 'Editing', 'Research', 'SEO Basics'],
    applicationUrl: null,
  },
  {
    id: 'o3', slug: 'community-manager-early-career-demo-edtech', type: 'Job', mode: 'Remote', featured: false, active: true, demo: true,
    title: 'Community Manager (Early Career)', organization: 'Demo EdTech',
    location: 'Remote (India)', eligibility: 'Freshers welcome',
    deadline: '2026-10-05', postedOn: '2026-08-28',
    description: 'Run student communities, campus ambassador loops and engagement campaigns for a learning platform (demo listing).',
    skills: ['Community Building', 'Social Media', 'Events', 'Empathy'],
    applicationUrl: null,
  },
  {
    id: 'o4', slug: 'product-design-intern-nimbus-labs', type: 'Internship', mode: 'Remote', featured: true, active: true, demo: true,
    title: 'Product Design Intern', organization: 'Nimbus Labs [Demo Org]',
    location: 'Remote (India)', eligibility: 'Students • 3rd year+',
    deadline: '2026-09-15', postedOn: '2026-08-15',
    description: 'A demo 3-month design internship: ship real UI for a student-facing product with weekly design reviews and a portfolio-worthy capstone.',
    skills: ['Figma', 'UI Design', 'User Research', 'Prototyping'],
    applicationUrl: null,
  },
  {
    id: 'o5', slug: 'media-journalism-internship-demo-newsroom', type: 'Internship', mode: 'On-site', featured: false, active: true, demo: true,
    title: 'Media & Journalism Intern', organization: 'Demo Newsroom',
    location: 'New Delhi', eligibility: 'Students • Any stream',
    deadline: '2026-09-25', postedOn: '2026-08-22',
    description: 'A demo newsroom internship covering education and youth affairs: pitching, reporting, fact-checking and publishing with senior editors.',
    skills: ['Reporting', 'Writing', 'Fact-checking', 'Curiosity'],
    applicationUrl: null,
  },
  {
    id: 'o6', slug: 'research-intern-climate-policy-demo-institute', type: 'Internship', mode: 'Remote', featured: false, active: true, demo: true,
    title: 'Research Intern (Climate Policy)', organization: 'Demo Policy Institute',
    location: 'Remote (India)', eligibility: 'Postgraduate students',
    deadline: '2026-10-10', postedOn: '2026-08-18',
    description: 'Support a demo research project on climate policy and youth participation — literature reviews, data cleaning and a co-authored policy brief.',
    skills: ['Research', 'Data Analysis', 'Academic Writing'],
    applicationUrl: null,
  },
  {
    id: 'o7', slug: 'youth-leadership-fellowship-2026', type: 'Fellowship', mode: 'Hybrid', featured: true, active: true, demo: true,
    title: 'Youth Leadership Fellowship 2026', organization: 'Demo Foundation',
    location: 'Multiple cities • Hybrid', eligibility: 'Ages 18–25',
    deadline: '2026-09-30', postedOn: '2026-08-10',
    description: 'A demo six-month fellowship combining training, mentorship and a funded community project for young changemakers.',
    skills: ['Leadership', 'Project Design', 'Community Work'],
    applicationUrl: null,
  },
  {
    id: 'o8', slug: 'social-innovation-fellowship-demo-lab', type: 'Fellowship', mode: 'On-site', featured: false, active: true, demo: true,
    title: 'Social Innovation Fellowship', organization: 'Demo Innovation Lab',
    location: 'Pune, Maharashtra', eligibility: 'Students & recent graduates',
    deadline: '2026-10-15', postedOn: '2026-08-26',
    description: 'A demo fellowship for student teams building solutions to community problems — stipend, workspace and mentor support included.',
    skills: ['Ideation', 'Prototyping', 'Field Research', 'Teamwork'],
    applicationUrl: null,
  },
  {
    id: 'o9', slug: 'undergraduate-research-fellowship-demo-university', type: 'Fellowship', mode: 'On-site', featured: false, active: true, demo: true,
    title: 'Undergraduate Research Fellowship', organization: 'Demo University',
    location: 'Bhopal, Madhya Pradesh', eligibility: 'Undergraduates • 2nd year+',
    deadline: '2026-10-20', postedOn: '2026-08-12',
    description: 'A demo summer research fellowship pairing undergraduates with faculty labs across sciences, social sciences and humanities.',
    skills: ['Research', 'Academic Writing', 'Discipline-specific'],
    applicationUrl: null,
  },
  {
    id: 'o10', slug: 'merit-cum-means-scholarship-demo-trust', type: 'Scholarship', mode: 'Remote', featured: false, active: true, demo: true,
    title: 'Merit-cum-Means Scholarship', organization: 'Demo Education Trust',
    location: 'Pan-India', eligibility: 'Family income criteria apply',
    deadline: '2026-09-28', postedOn: '2026-08-14',
    description: 'A demo scholarship supporting tuition and living costs for meritorious students with financial need.',
    skills: ['Academic Merit'],
    applicationUrl: null,
  },
  {
    id: 'o11', slug: 'women-in-stem-scholarship-demo-foundation', type: 'Scholarship', mode: 'Remote', featured: false, active: true, demo: true,
    title: 'Women in STEM Scholarship', organization: 'Demo Foundation',
    location: 'Pan-India', eligibility: 'Women students in STEM',
    deadline: '2026-10-08', postedOn: '2026-08-20',
    description: 'A demo scholarship recognising women pursuing STEM degrees, with mentorship alongside financial support.',
    skills: ['Academic Merit', 'Leadership Potential'],
    applicationUrl: null,
  },
  {
    id: 'o12', slug: 'community-changemaker-scholarship', type: 'Scholarship', mode: 'Remote', featured: false, active: true, demo: true,
    title: 'Community Changemaker Scholarship', organization: 'Demo Youth Collective',
    location: 'Pan-India', eligibility: 'Students leading community initiatives',
    deadline: '2026-10-30', postedOn: '2026-08-29',
    description: 'A demo scholarship for students who have led measurable community or campus initiatives — impact over marks.',
    skills: ['Community Impact', 'Initiative'],
    applicationUrl: null,
  },
];

/* ─────────────────────────── CURRENT AFFAIRS ─────────────────────────── */
export const demoEditions: CurrentAffairsEdition[] = [
  {
    id: 'ca1', slug: 'current-affairs-september-2026', month: 'September', year: 2026, demo: true, pdfUrl: null,
    title: 'Current Affairs — September 2026',
    intro: 'The September (demo) edition gathers the month\'s most relevant developments for students — national policy moves, global shifts, economic signals, science milestones and education updates — explained in plain language.',
    cover: '/images/affairs/affairs-1.jpg', coverAlt: 'Designed cover of TSC Current Affairs, September 2026 edition',
    topics: ['India', 'World', 'Economy', 'Science & Technology', 'Education'],
    articles: [
      { title: 'National Education Policy implementation: where things stand', category: 'India', summary: 'A plain-language status update on policy implementation milestones that affect students.', readingTime: 5 },
      { title: 'Global summits and what they mean for young people', category: 'World', summary: 'Key takeaways from this season\'s international gatherings, minus the jargon.', readingTime: 4 },
      { title: 'Youth employment signals to watch', category: 'Economy', summary: 'Hiring trends, sector movements and what the data suggests for first-job seekers.', readingTime: 4 },
      { title: 'India\'s space and AI milestones this month', category: 'Science & Technology', summary: 'The launches, models and research wins that made headlines — explained simply.', readingTime: 4 },
      { title: 'Exam calendars and academic session changes', category: 'Education', summary: 'Announcements from boards and universities that shift timelines for students.', readingTime: 3 },
    ],
  },
  {
    id: 'ca2', slug: 'current-affairs-august-2026', month: 'August', year: 2026, demo: true, pdfUrl: null,
    title: 'Current Affairs — August 2026',
    intro: 'The August (demo) edition: monsoon-session policy news, global economic currents, campus-relevant science and the education headlines students actually asked about.',
    cover: '/images/affairs/affairs-2.jpg', coverAlt: 'Designed cover of TSC Current Affairs, August 2026 edition',
    topics: ['India', 'World', 'Economy', 'Science & Technology', 'Education'],
    articles: [
      { title: 'Legislative changes students should know about', category: 'India', summary: 'What passed, what stalled and what it means for young citizens.', readingTime: 5 },
      { title: 'The world in August: three stories that matter', category: 'World', summary: 'Beyond the headlines — the context students need for exams and interviews.', readingTime: 4 },
      { title: 'Inflation, rates and the cost of being a student', category: 'Economy', summary: 'How macroeconomic moves land on hostel budgets and education loans.', readingTime: 4 },
      { title: 'Research from Indian labs that made global news', category: 'Science & Technology', summary: 'Celebrating work from campus-adjacent laboratories.', readingTime: 4 },
      { title: 'Skill councils and new certification frameworks', category: 'Education', summary: 'New pathways recognising skills alongside degrees.', readingTime: 3 },
    ],
  },
  {
    id: 'ca3', slug: 'current-affairs-july-2026', month: 'July', year: 2026, demo: true, pdfUrl: null,
    title: 'Current Affairs — July 2026',
    intro: 'The July (demo) edition kicks off the academic year with the stories that set the stage — policy, economy, science and the world beyond campus.',
    cover: '/images/affairs/affairs-3.jpg', coverAlt: 'Designed cover of TSC Current Affairs, July 2026 edition',
    topics: ['India', 'World', 'Economy', 'Science & Technology', 'Education'],
    articles: [
      { title: 'Admissions season: the big picture changes', category: 'India', summary: 'Process updates across boards and universities this cycle.', readingTime: 5 },
      { title: 'Geopolitics simplified for interview rooms', category: 'World', summary: 'Five global dynamics, explained in five minutes each.', readingTime: 5 },
      { title: 'Startup funding and what it means for internships', category: 'Economy', summary: 'Follow the money to understand hiring seasons.', readingTime: 4 },
      { title: 'Green tech milestones worth knowing', category: 'Science & Technology', summary: 'Climate tech progress with Indian connections.', readingTime: 4 },
      { title: 'Digital university initiatives expand', category: 'Education', summary: 'Online degrees, credible alternatives and how to evaluate them.', readingTime: 4 },
    ],
  },
];

/* ─────────────────────────── LEGAL AWARENESS ─────────────────────────── */
export const demoLegalArticles: LegalArticle[] = [
  {
    id: 'l1', slug: 'your-rights-on-campus-a-starter-guide', topic: 'Student Rights', demo: true, date: '2026-08-20', readingTime: 5,
    title: 'Your Rights on Campus: A Starter Guide',
    summary: 'Understand your rights within educational institutions — from fair evaluation to grievance redressal.',
    keyPoints: ['Institutions typically publish student rights and codes of conduct — know where to find yours', 'Fair and transparent evaluation is a reasonable expectation; ask for published criteria', 'Most institutions must maintain grievance redressal mechanisms', 'Documentation (records, receipts, written communication) is your best friend'],
    content: [
      'Campuses run on rules — but rules exist to protect students as much as institutions. Understanding the basics of your position inside an educational institution is the first step to navigating it confidently.',
      'This starter guide (demo content) walks through commonly recognised student rights: access to published evaluation criteria, grievance redressal channels, protection from arbitrary disciplinary action, and avenues for appeal.',
      'Because rules vary by institution and state, treat this as a map, not an answer — and always check your own institution\'s statutes and the applicable university/UGC frameworks.',
    ],
  },
  {
    id: 'l2', slug: 'understanding-disciplinary-proceedings', topic: 'Student Rights', demo: true, date: '2026-08-05', readingTime: 5,
    title: 'Understanding Disciplinary Proceedings in Institutions',
    summary: 'What to expect if you ever face disciplinary action — notice, hearing, representation and appeal.',
    keyPoints: ['You should generally receive written notice of any allegation', 'Principles of natural justice: hear the other side before deciding', 'You may be allowed a representative or witness in many processes', 'Appeal routes usually exist — deadlines matter'],
    content: [
      'Nobody expects to face disciplinary proceedings — which is exactly why students should know the basics before they ever need them.',
      'This explainer (demo content) outlines the typical anatomy of a disciplinary process in educational institutions: the notice, the opportunity to respond, the hearing, the decision and the appeal.',
      'The golden rule: respond in writing, keep copies, respect deadlines, and seek proper guidance early.',
    ],
  },
  {
    id: 'l3', slug: 'student-guide-to-staying-safe-online', topic: 'Cyber Safety', demo: true, date: '2026-08-24', readingTime: 4,
    title: "A Student's Guide to Staying Safe Online",
    summary: 'Know what to do when things go wrong online — from scams to harassment to stolen accounts.',
    keyPoints: ['Use unique passwords and two-factor authentication everywhere', 'Never share OTPs — no legitimate service asks for them', 'Screenshot and report harassment; most platforms have escalation routes', 'India has a national cybercrime reporting portal for online fraud and abuse'],
    content: [
      'Between classes, internships and social lives, students live online — which makes basic cyber hygiene as essential as any subject on the syllabus.',
      'This guide (demo content) covers the essentials: recognising phishing and job scams targeting students, securing accounts with strong passwords and 2FA, handling online harassment, and where to report cybercrime in India.',
      'The one habit that prevents most disasters: pause before you click, share or pay.',
    ],
  },
  {
    id: 'l4', slug: 'what-to-do-if-your-account-gets-hacked', topic: 'Cyber Safety', demo: true, date: '2026-07-30', readingTime: 4,
    title: 'What To Do If Your Account Gets Hacked',
    summary: 'A calm, step-by-step response plan for the worst-case scenario.',
    keyPoints: ['Act fast: change passwords from a different, trusted device', 'Use "forgot password" and recovery emails/phones to reclaim access', 'Check active sessions and connected apps; revoke unfamiliar ones', 'Inform close contacts so impersonation scams spread no further'],
    content: [
      'The message arrives from a friend: "Did you just send me this link?" Your stomach drops. A hacked account is stressful — but a clear sequence of steps (demo content) makes it manageable.',
      'Reclaim, review, revoke, report: recover the account, scan for changes you did not make, disconnect rogue apps and sessions, then report the incident on the platform and, for financial fraud, to the authorities.',
      'Prevention beats cure — and recovery is much faster with recovery options set up in advance.',
    ],
  },
  {
    id: 'l5', slug: 'digital-privacy-101-for-students', topic: 'Digital Rights', demo: true, date: '2026-08-15', readingTime: 5,
    title: 'Digital Privacy 101 for Students',
    summary: 'Understand privacy, online identity and responsible digital participation.',
    keyPoints: ['Your data trail: forms, apps and "free" services collect more than you think', 'Check app permissions regularly — location, contacts, microphone', 'The internet remembers: think before you post', 'India\'s digital personal data protection law gives citizens specific rights'],
    content: [
      'Every quiz app, scholarship form and food-delivery login adds a row to your digital footprint. Digital privacy (demo content) is about knowing what you share, with whom, and what happens next.',
      'This explainer introduces the basics of data collection, consent, app permissions and India\'s data protection framework in student-friendly language.',
      'Privacy is not about having something to hide — it is about deciding what the world knows about you.',
    ],
  },
  {
    id: 'l6', slug: 'your-digital-footprint-and-you', topic: 'Digital Rights', demo: true, date: '2026-07-20', readingTime: 4,
    title: 'Your Digital Footprint and You',
    summary: 'How what you post today shapes opportunities tomorrow — and how to curate it.',
    keyPoints: ['Recruiters and admissions teams do look you up', 'Old posts can resurface: audit your public profiles periodically', 'Build a deliberate presence: portfolios over rants', 'You can request removal of some content — platform rules apply'],
    content: [
      'Your digital footprint is your second CV — written casually, read carefully. This short explainer (demo content) helps students audit and curate it.',
      'From cleaning up public timelines to building a portfolio that works for you, small deliberate steps change how the internet introduces you.',
    ],
  },
  {
    id: 'l7', slug: 'education-policy-explained-simply', topic: 'Education Laws', demo: true, date: '2026-08-28', readingTime: 6,
    title: 'Education Policy Explained Simply',
    summary: 'Simplified explainers on rules, regulations and policies affecting students.',
    keyPoints: ['National policy sets direction; institutions and boards implement', 'Credit frameworks are making learning more flexible and portable', 'Regulators like UGC/AICTE publish student-facing notifications', 'When in doubt, read the official circular — not the rumour'],
    content: [
      'Education policy can feel like a distant document written for administrators. In reality, it shapes admissions, exams, flexibility and even what your degree is worth.',
      'This explainer (demo content) breaks down how policy flows from national frameworks to your campus notice board — and where students can participate in the conversation.',
      'Rule of thumb: for anything that affects your academics, the official circular is the source of truth.',
    ],
  },
  {
    id: 'l8', slug: 'anti-ragging-laws-and-guidelines', topic: 'Education Laws', demo: true, date: '2026-07-15', readingTime: 5,
    title: 'Understanding Anti-Ragging Laws and UGC Guidelines',
    summary: 'What counts as ragging, what the law says, and how to seek help safely.',
    keyPoints: ['Ragging is prohibited by law and UGC regulations — it is not "tradition"', 'It includes a wide range of behaviours, physical and psychological', 'Every institution must have an anti-ragging committee and helpline access', 'Complaints can be made confidentially; retaliation is itself punishable'],
    content: [
      'Every year, students are told ragging is banned — and every year, someone calls it "fun". Understanding the rules (demo content) matters because they exist to protect new students exactly like you.',
      'This explainer outlines what anti-ragging regulations cover, the institutional mechanisms required, the national helpline, and how complaints proceed.',
      'If you or someone you know needs help: institutional committees and the national anti-ragging helpline exist precisely for this. You will be heard.',
    ],
  },
];

/* ─────────────────────────── FLAGSHIP CAMPAIGN ─────────────────────────── */
export const flagshipCampaign: Campaign = {
  id: 'camp1', slug: 'all-india-career-awareness',
  eyebrow: 'TSC ORIGINAL CAMPAIGN',
  title: 'ALL INDIA CAREER AWARENESS YOUTH DOCUMENTARY SERIES',
  headline: 'Real Careers. Real People. Real Possibilities.',
  description: 'What if students could see what a career actually looks like before choosing one? Our All India Career Awareness Youth Documentary Series takes students beyond generic career advice and into the real world — meeting professionals, entrepreneurs, creators, specialists and people building meaningful careers across different industries. Because sometimes, discovering what\'s possible is the first step towards discovering what you want.',
  stills: [
    { image: '/images/campaign/campaign-1.jpg', alt: 'Documentary still: an educator interviewed at work' },
    { image: '/images/campaign/campaign-2.jpg', alt: 'Documentary still: professionals at their workplace' },
    { image: '/images/campaign/campaign-3.jpg', alt: 'Documentary still: a young founder in a startup workspace' },
  ],
  categories: ['Medicine', 'Public Administration', 'Technology', 'Media & Creation', 'Engineering', 'Education', 'Entrepreneurship'],
  locations: ['Patna', 'Delhi', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Kochi'],
  episodes: [
    { id: 'ce1', slug: 'the-doctor', episodeNumber: 1, status: 'Released', title: 'The Doctor', professional: 'Dr. A. Sharma [Demo]', profession: 'Medicine & Public Health', location: 'Patna', durationLabel: '24 min', image: '/images/hero/hero-classroom.jpg', imageAlt: 'A medical educator in a teaching setting (documentary still)', description: 'A day in the life of a doctor (demo episode) — from OPD rushes to the quiet decisions nobody sees, and what the profession demands beyond marks.' },
    { id: 'ce2', slug: 'the-founder', episodeNumber: 2, status: 'Released', title: 'The Founder', professional: 'I. Verma [Demo]', profession: 'Consumer Startup', location: 'Bengaluru', durationLabel: '31 min', image: '/images/campaign/campaign-3.jpg', imageAlt: 'A young founder at work in a startup space (documentary still)', description: 'From hostel idea to first customers (demo episode) — the unglamorous, honest middle of the startup journey.' },
    { id: 'ce3', slug: 'the-civil-servant', episodeNumber: 3, status: 'Coming Soon', title: 'The Civil Servant', professional: '[Demo Officer]', profession: 'Public Administration', location: 'Delhi', durationLabel: '28 min', image: '/images/hero/hero-workshop.jpg', imageAlt: 'A public administrator addressing a gathering (documentary still)', description: 'Beyond the exam mythology (demo episode) — what the work actually is, and who it truly suits.' },
    { id: 'ce4', slug: 'the-creator', episodeNumber: 4, status: 'Coming Soon', title: 'The Creator', professional: '[Demo Creator]', profession: 'Media & Content', location: 'Mumbai', durationLabel: '26 min', image: '/images/hero/hero-fest.jpg', imageAlt: 'A creator filming at a live event (documentary still)', description: 'Cameras, clients and consistency (demo episode) — the business behind "just posting".' },
    { id: 'ce5', slug: 'the-engineer', episodeNumber: 5, status: 'Coming Soon', title: 'The Engineer', professional: '[Demo Engineer]', profession: 'Aerospace & Manufacturing', location: 'Hyderabad', durationLabel: '29 min', image: '/images/stories/story-3.jpg', imageAlt: 'An engineer working on a technical prototype (documentary still)', description: 'Machines, patience and precision (demo episode) — engineering beyond the placement-package version.' },
    { id: 'ce6', slug: 'the-educator', episodeNumber: 6, status: 'Coming Soon', title: 'The Educator', professional: '[Demo Educator]', profession: 'Teaching & Research', location: 'Kochi', durationLabel: '25 min', image: '/images/campaign/campaign-1.jpg', imageAlt: 'An educator in a classroom setting (documentary still)', description: 'Why the best teachers (demo episode) chose the classroom — and what keeps them there.' },
  ],
};

/* ─────────────────────────── ADMIN / DASHBOARD DEMO DATA ─────────────────────────── */
export const demoStorySubmissions: StorySubmissionRecord[] = [
  { id: 'ss1', name: 'Rohit Kumar (Demo)', email: 'rohit.demo@example.com', college: 'Demo College, Patna', city: 'Patna', state: 'Bihar', title: 'How Our Team Built a Flood-alert Prototype', category: 'Student', summary: 'A student team prototype for local flood alerts, built during a weekend hackathon.', status: 'pending', submittedOn: '2026-08-29' },
  { id: 'ss2', name: 'Sneha Iyer (Demo)', email: 'sneha.demo@example.com', college: 'Demo Institute, Kochi', city: 'Kochi', state: 'Kerala', title: 'One Year of a Campus Composting Club', category: 'Campus', summary: 'What we learned running a student-led composting initiative for a full academic year.', status: 'under review', submittedOn: '2026-08-26' },
  { id: 'ss3', name: 'Aditya Rao (Demo)', email: 'aditya.demo@example.com', college: 'Demo University, Hyderabad', city: 'Hyderabad', state: 'Telangana', title: 'Failing Forward: My First Startup Shut Down', category: 'Startup', summary: 'An honest post-mortem of a student startup that did not survive — and what it taught me.', status: 'pending', submittedOn: '2026-08-30' },
];

export const demoCampusSubmissions: CampusSubmissionRecord[] = [
  { id: 'cs1', name: 'Meera Nair (Demo)', email: 'meera.demo@example.com', campus: 'Coastal University (Demo)', city: 'Kochi', state: 'Kerala', title: 'Our Campus Just Launched a Student Radio Station', category: 'Campus News', summary: 'A new student-run radio initiative goes live on campus this month.', status: 'pending', submittedOn: '2026-08-28' },
  { id: 'cs2', name: 'Faizan Ali (Demo)', email: 'faizan.demo@example.com', campus: 'Nalanda Institute (Demo)', city: 'Patna', state: 'Bihar', title: 'Night Library Extends Hours for Exam Season', category: 'Campus Life', summary: 'Student council successfully extends reading-room hours till 4 a.m.', status: 'under review', submittedOn: '2026-08-25' },
  { id: 'cs3', name: 'Tanvi Deshpande (Demo)', email: 'tanvi.demo@example.com', campus: 'Vidya Vihar Central (Demo)', city: 'Pune', state: 'Maharashtra', title: 'E-Cell Announces Annual Demo Pitch Fest', category: 'Campus Events', summary: 'Call for entries open for the campus pitch competition.', status: 'pending', submittedOn: '2026-08-27' },
];

export const demoContactMessages: ContactMessageRecord[] = [
  { id: 'cm1', name: 'Journalism Student (Demo)', email: 'journo.demo@example.com', subject: 'Want to contribute to TSC Newsroom', message: 'Hello! I am a final-year journalism student and would love to contribute campus stories. How can I get started?', status: 'new', receivedOn: '2026-08-30' },
  { id: 'cm2', name: 'Placement Cell (Demo)', email: 'placements.demo@example.com', subject: 'Listing an opportunity on TSC Career', message: 'We would like to list an internship opportunity for students on the platform. What is the process?', status: 'read', receivedOn: '2026-08-27' },
  { id: 'cm3', name: 'Parent (Demo)', email: 'parent.demo@example.com', subject: 'Appreciation for the Career Awareness series', message: 'My daughter shared one of your career documentary episodes with us. Wonderful initiative — please keep going.', status: 'replied', receivedOn: '2026-08-22' },
];

export const demoMembers: MemberRecord[] = [
  { id: 'm1', name: 'Aarav Kumar (Demo)', email: 'aarav.demo@example.com', college: 'Nalanda Institute (Demo)', city: 'Patna', role: 'member', joinedOn: '2026-08-02', status: 'active' },
  { id: 'm2', name: 'Priya Sharma (Demo)', email: 'priya.demo@example.com', college: 'Vidya Vihar Central (Demo)', city: 'Pune', role: 'editor', joinedOn: '2026-07-18', status: 'active' },
  { id: 'm3', name: 'Zoya Ahmed (Demo)', email: 'zoya.demo@example.com', college: 'Coastal University (Demo)', city: 'Kochi', role: 'member', joinedOn: '2026-08-14', status: 'active' },
  { id: 'm4', name: 'Vikram Shetty (Demo)', email: 'vikram.demo@example.com', college: 'Sunrise Engineering (Demo)', city: 'Hyderabad', role: 'member', joinedOn: '2026-08-20', status: 'pending' },
  { id: 'm5', name: 'TSC Admin (Demo)', email: 'admin@tsc.demo', college: '—', city: '—', role: 'admin', joinedOn: '2026-06-01', status: 'active' },
];

export const demoNotifications: NotificationRecord[] = [
  { id: 'nt1', title: 'New demo edition published', body: 'Current Affairs — September 2026 (demo) is now live.', date: '2026-08-30', read: false, type: 'info' },
  { id: 'nt2', title: 'Deadline reminder (demo)', body: 'Product Design Intern application closes 15 Sep.', date: '2026-08-29', read: false, type: 'opportunity' },
  { id: 'nt3', title: 'Event registration open (demo)', body: 'Career Awareness Workshop, Patna — 18 Sep.', date: '2026-08-25', read: true, type: 'event' },
  { id: 'nt4', title: 'Your submission is under review', body: 'Story "From Classroom to Startup" (demo) moved to review.', date: '2026-08-22', read: true, type: 'story' },
];
