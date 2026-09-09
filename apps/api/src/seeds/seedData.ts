/**
 * Demo seed data — clearly-fictional sample content (mirrors apps/web demo data).
 * Replace with real TSC editorial content via the admin panel.
 */
import type { InferSchemaType } from 'mongoose';
import type { Schema } from 'mongoose';

export const seedData = {
  news: [
    {
      title: 'New Digital Library Project Brings Thousands of Resources to Students',
      excerpt: 'A student-led digital library initiative is making thousands of books, journals and course materials freely accessible.',
      content:
        'For many students, the biggest barrier to learning is not motivation — it is access. A new student-led digital library project is trying to change that, one campus at a time.\n\nThe initiative brings together thousands of open-access books, journals, previous-year papers and course notes in a single searchable platform built by student volunteers.\n\n[Demo article — replace with real TSC reporting via the admin panel.]',
      category: null as unknown,
      tags: [],
      featuredImage: '/images/news/news-1.jpg',
      featured: true,
      readingTime: 4,
      demo: true,
    },
    {
      title: 'Young Innovators Win Recognition at National Science Fair',
      excerpt: 'Student teams presented low-cost solutions to everyday problems — from water conservation to accessible learning tools.',
      content: 'The hall was full of prototypes, posters and nervous energy at this year\'s National Science Fair (demo edition).\n\nJudges highlighted one theme: students solving problems they see around them every day.\n\n[Demo article.]',
      featuredImage: '/images/stories/story-3.jpg',
      featured: false,
      readingTime: 3,
    },
    {
      title: 'Students Lead Community Cleanliness Drive Across City Wards',
      excerpt: 'Over one weekend, student volunteers came together for a cleanliness and awareness drive.',
      content: 'Early on a Sunday morning, groups of students in gloves and caps fanned out across municipal wards with bags, brooms and awareness posters.\n\nFor many volunteers, it was a reminder that being a student is about showing up. [Demo article.]',
      featuredImage: '/images/news/news-2.jpg',
      featured: false,
      readingTime: 3,
    },
    {
      title: 'Student Team Builds AI Study Companion for Exam Preparation',
      excerpt: 'A four-member student team built an AI-powered study companion that turns notes into quizzes and revision plans.',
      content: 'It started as a hostel-room experiment: could a small team of students make revision less painful?\n\nEight months later, their AI study companion (demo) converts class notes into summaries, flashcards and spaced-repetition plans. [Demo article.]',
      featuredImage: '/images/news/news-3.jpg',
      featured: false,
      readingTime: 4,
    },
    {
      title: 'Universities Expand Mental Health & Academic Support for Students',
      excerpt: 'From peer-support circles to extended counselling hours, institutions are strengthening student support systems.',
      content: 'Academic pressure, placements, family expectations — student life carries real weight.\n\nA growing number of institutions (demo) are extending counselling hours, training peer-support circles and clarifying academic emergency processes. [Demo article.]',
      featuredImage: '/images/news/news-5.jpg',
      featured: false,
      readingTime: 4,
    },
    {
      title: 'Hackathon Season Kicks Off With Record Campus Participation',
      excerpt: 'Weekend hackathons are drawing bigger crowds than fest concerts.',
      content: 'Tables strewn with cables, coffee cups and borrowed chargers — hackathon season is officially here.\n\nDesigners, business students and first-time coders are joining in numbers that rival the engineering crowd. [Demo article.]',
      featuredImage: '/images/news/news-4.jpg',
      featured: false,
      readingTime: 3,
    },
  ],

  stories: [
    { title: 'The Student Who Turned a Problem Into a Solution', dek: 'Meet the young minds creating solutions for problems around them.', category: 'student', content: 'Every campus has that one student who cannot walk past a broken thing without stopping. This is a story about one of them. (Demo story.)\n\nA prototype, a failed version, a better version — and a solution the people around them actually use.', image: '/images/stories/story-3.jpg', readingTime: 5, featured: true },
    { title: 'From Classroom to Startup', dek: 'How a college idea became the beginning of an entrepreneurial journey.', category: 'startup', content: 'Nobody starts a company in a classroom. But a lot of companies start as classroom problems.\n\nThis is the story of one such journey (demo) — a semester project that refused to end with a grade.', image: '/images/stories/story-2.jpg', readingTime: 6, featured: true },
    { title: "Inside a Campus That's Building Something Different", dek: 'Discover the people and communities transforming campus life.', category: 'campus', content: 'Some campuses you walk into and immediately feel a rhythm — workshops on weekends, clubs that actually build things.\n\nThis demo story meets the communities creating that rhythm.', image: '/images/stories/story-4.jpg', readingTime: 5, featured: true },
    { title: 'From a Small Town to a National Stage', dek: 'A journey of preparation, self-doubt, and finally being heard.', category: 'student', content: 'The first time they spoke on a mic, the voice shook. By the national round (demo), the room listened.', image: '/images/stories/story-1.jpg', readingTime: 4 },
    { title: 'The Interview That Changed How I See Failure', dek: 'What a rejection call taught one student about starting again.', category: 'student', content: 'The rejection email was polite, brief and devastating. The feedback call that followed reframed everything. [Demo story.]', image: '/images/stories/story-5.jpg', readingTime: 4 },
    { title: 'The Hostel Room Studio', dek: 'How three friends turned a hostel room into a production studio between classes.', category: 'startup', content: 'Two beds pushed aside, one borrowed mic, a blanket on the wall for sound damping — version one of the studio. [Demo story.]', image: '/images/campaign/campaign-3.jpg', readingTime: 5 },
    { title: 'When a Class Project Became a Company', dek: 'A semester assignment, an understanding mentor, and twelve months of saying "what if".', category: 'startup', content: 'The brief was simple: propose a solution to a local problem. The company, as it turned out, was due a year later. [Demo story.]', image: '/images/stories/story-6.jpg', readingTime: 5 },
    { title: 'The Library That Never Sleeps', dek: 'Open all night, powered by students — inside a campus reading-room movement.', category: 'campus', content: 'At 2 a.m., the reading room is fuller than most classrooms are at noon. [Demo story.]', image: '/images/campus/campus-4.jpg', readingTime: 4 },
    { title: 'How One Club Turned a Quiet Campus Into a Stage', dek: 'Open mics, street theatre and a lot of courage.', category: 'campus', content: 'Then a handful of students asked a dangerous question: what if we used the auditorium every month? [Demo story.]', image: '/images/events/event-3.jpg', readingTime: 4 },
  ],

  campuses: [
    { name: 'Vidya Vihar Central University', university: 'Vidya Vihar Central University', city: 'Pune', state: 'Maharashtra', type: 'Central University', description: 'A demo campus known for its student incubator, weekend makers meets and an active research circle.', image: '/images/campus/campus-1.jpg', categories: ['Campus News', 'Student Achievements', 'Campus Life'] },
    { name: 'Nalanda Institute of Technology', university: 'Nalanda Institute of Technology', city: 'Patna', state: 'Bihar', type: 'Technical Institute', description: 'A demo engineering campus with a thriving hackathon culture and a student-run night library.', image: '/images/campus/campus-2.jpg', categories: ['Campus Events', 'Clubs & Communities', 'Student Initiatives'] },
    { name: 'Coastal University of Arts & Sciences', university: 'Coastal University of Arts & Sciences', city: 'Kochi', state: 'Kerala', type: 'State University', description: 'A demo campus celebrated for its culture collectives, debate society and waterfront campus life.', image: '/images/campus/campus-3.jpg', categories: ['Campus Life', 'Clubs & Communities', 'Campus News'] },
    { name: 'Sagar Public University', university: 'Sagar Public University', city: 'Bhopal', state: 'Madhya Pradesh', type: 'State University', description: 'A demo campus with strong social-science research groups and a growing student leadership programme.', image: '/images/campus/campus-4.jpg', categories: ['Student Achievements', 'Student Initiatives'] },
    { name: 'Himalayan Polytechnic & Research Institute', university: 'Himalayan Polytechnic & Research Institute', city: 'Dehradun', state: 'Uttarakhand', type: 'Polytechnic', description: 'A demo polytechnic campus where media, making and mountains meet.', image: '/images/campus/campus-5.jpg', categories: ['Clubs & Communities', 'Campus Events'] },
    { name: 'Sunrise Engineering College', university: 'Sunrise Engineering College', city: 'Hyderabad', state: 'Telangana', type: 'Engineering College', description: 'A demo engineering college with an active E-Cell and a loud fest season.', image: '/images/campus/campus-6.jpg', categories: ['Campus Events', 'Student Achievements'] },
  ],

  podcasts: [
    { episodeNumber: 1, title: 'What Nobody Tells You About Your First Startup', description: 'A candid conversation with a student founder about the unglamorous middle between idea and milestone. [Demo episode.]', guest: 'Ishaan Verma', guestRole: 'Founder, [Demo Startup]', category: 'Founder Stories', durationLabel: '38:12', durationSeconds: 2292, audioUrl: '/audio/tsc-placeholder-audio.wav', thumbnail: '/images/hero/hero-podcast.jpg', featured: true, publishedAt: '2026-08-25' },
    { episodeNumber: 2, title: 'The Gap Year That Changed Everything', description: 'A student voices episode on choosing an unconventional pause. [Demo episode.]', guest: 'Riya Chatterjee', guestRole: 'Student & writer', category: 'Student Voices', durationLabel: '31:40', durationSeconds: 1900, thumbnail: '/images/podcast/podcast-1.jpg', publishedAt: '2026-08-11' },
    { episodeNumber: 3, title: 'Breaking Into Tech Without a CS Degree', description: 'A career conversation about routes into technology careers. [Demo episode.]', guest: 'Aman Khanna', guestRole: 'Software engineer & mentor', category: 'Career Conversations', durationLabel: '44:05', durationSeconds: 2645, thumbnail: '/images/podcast/podcast-2.jpg', publishedAt: '2026-07-28' },
    { episodeNumber: 4, title: 'Ideas Are Cheap. Execution Is Everything.', description: 'An ideas & perspectives episode on what separates builders from planners. [Demo episode.]', guest: 'Dr. Nandita Rao', guestRole: 'Educator & researcher', category: 'Ideas & Perspectives', durationLabel: '29:58', durationSeconds: 1798, thumbnail: '/images/podcast/podcast-3.jpg', publishedAt: '2026-07-14' },
    { episodeNumber: 5, title: 'Studying Smart: Science Over Superstition', description: 'Evidence-based conversation about how students actually learn better. [Demo episode.]', guest: 'Vikram Shetty', guestRole: 'Learning researcher', category: 'Ideas & Perspectives', durationLabel: '36:22', durationSeconds: 2182, thumbnail: '/images/podcast/podcast-4.jpg', publishedAt: '2026-06-30' },
    { episodeNumber: 6, title: 'From Campus Radio to Community Building', description: 'How a tiny campus radio project grew into a community platform. [Demo episode.]', guest: 'Zoya Ahmed', guestRole: 'Campus radio founder', category: 'Student Voices', durationLabel: '33:47', durationSeconds: 2027, thumbnail: '/images/podcast/podcast-5.jpg', publishedAt: '2026-06-16' },
  ],

  events: [
    { title: 'Career Awareness Workshop', dek: 'Helping students discover careers beyond the conventional path.', description: 'Sessions include career discovery frameworks, live Q&A with professionals and a planning exercise. [Demo event.]', date: '2026-09-18', startTime: '10:00 AM – 4:00 PM', venue: 'Seminar Hall A, Nalanda Institute (Demo)', city: 'Patna', state: 'Bihar', organizer: 'TSC Career Awareness Team (Demo)', category: 'Career', registrationDeadline: '2026-09-15', image: '/images/events/event-1.jpg', status: 'upcoming', featured: true },
    { title: "Founders' Meetup & Networking Evening", dek: 'Student founders, builders and the merely curious — one room, zero gatekeeping.', description: 'Lightning talks, speed networking and open tables for co-founder hunting. [Demo event.]', date: '2026-09-26', startTime: '5:30 PM – 8:30 PM', venue: 'Innovation Hub, [Demo Venue]', city: 'Bengaluru', state: 'Karnataka', organizer: 'Demo E-Cell Collective', category: 'Networking', registrationDeadline: '2026-09-22', image: '/images/events/event-4.jpg', status: 'upcoming' },
    { title: 'Education Fair: Courses, Colleges & Careers', dek: 'Meet institutions, explore programmes, ask real questions.', description: 'Sessions on admissions timelines, scholarships and portfolio building. [Demo event.]', date: '2026-09-12', startTime: '9:00 AM – 6:00 PM', venue: 'Main Auditorium, [Demo Campus]', city: 'Ranchi', state: 'Jharkhand', organizer: 'Demo Education Collective', category: 'Education', registrationDeadline: '2026-09-10', image: '/images/campus/campus-1.jpg', status: 'upcoming' },
    { title: 'National Student Hackathon 2026', dek: 'Thirty-six hours, real problem statements, a hall full of builders.', description: 'Tracks in education, civic tech, sustainability and open innovation. [Demo event.]', date: '2026-10-04', startTime: '8:00 AM (Day 1)', venue: 'Tech Park Block, Coastal University (Demo)', city: 'Kochi', state: 'Kerala', organizer: 'Demo Tech Communities', category: 'Technology', registrationDeadline: '2026-09-27', image: '/images/events/event-2.jpg', status: 'upcoming', featured: true },
    { title: 'Leadership Bootcamp for Student Councils', dek: 'Governance, communication and getting things done inside institutions.', description: 'A demo bootcamp for student council members. [Demo event.]', date: '2026-10-02', startTime: '9:30 AM – 5:00 PM', venue: 'Convention Centre, Sagar Public University (Demo)', city: 'Bhopal', state: 'Madhya Pradesh', organizer: 'Demo Leadership Foundation', category: 'Leadership', registrationDeadline: '2026-09-28', image: '/images/events/event-1.jpg', status: 'upcoming' },
    { title: 'Yuva Cultural Night', dek: 'Music, theatre, poetry and dance — a stage built by students.', description: 'Open-mic warm-ups, band performances and the annual poetry slam finale. [Demo event.]', date: '2026-10-11', startTime: '5:00 PM – 10:00 PM', venue: 'Open Air Theatre, Coastal University (Demo)', city: 'Kochi', state: 'Kerala', organizer: 'Demo Culture Collective', category: 'Culture', registrationDeadline: '2026-10-08', image: '/images/events/event-3.jpg', status: 'upcoming' },
    { title: 'Pitch Your Idea: Student Startup Competition', dek: 'Five minutes, five slides, one idea.', description: 'Pitching workshops, a qualifying round and a final showcase. [Demo event.]', date: '2026-10-24', startTime: '10:00 AM – 7:00 PM', venue: 'E-Cell Arena, Sunrise Engineering (Demo)', city: 'Hyderabad', state: 'Telangana', organizer: 'Demo E-Cell Network', category: 'Entrepreneurship', registrationDeadline: '2026-10-18', image: '/images/campaign/campaign-3.jpg', status: 'upcoming' },
    { title: 'Summer Coding Sprint', dek: 'A four-week remote sprint where 200 students shipped their first projects.', description: 'This event has concluded. [Demo event.]', date: '2026-08-15', startTime: 'Remote • Evenings', venue: 'Online', city: 'Remote', state: 'Pan-India', organizer: 'Demo Tech Communities', category: 'Technology', registrationDeadline: '2026-08-01', image: '/images/news/news-4.jpg', status: 'past' },
  ],

  opportunities: [
    { title: 'Graduate Trainee — Operations', organization: 'BrightCart [Demo Org]', type: 'Job', mode: 'On-site', location: 'Bengaluru, Karnataka', eligibility: '2026 graduates • Any degree', deadline: '2026-09-20', description: 'A demo early-career programme rotating trainees across operations with mentorship.', skills: ['Communication', 'Excel', 'Problem Solving'], featured: true },
    { title: 'Junior Content Writer', organization: 'Demo Media House', type: 'Job', mode: 'Hybrid', location: 'Mumbai, Maharashtra', eligibility: '0–2 years', deadline: '2026-09-30', description: 'Write explainers and campus features for a youth publication (demo listing).', skills: ['Writing', 'Editing', 'Research'] },
    { title: 'Community Manager (Early Career)', organization: 'Demo EdTech', type: 'Job', mode: 'Remote', location: 'Remote (India)', eligibility: 'Freshers welcome', deadline: '2026-10-05', description: 'Run student communities and engagement campaigns (demo listing).', skills: ['Community', 'Social Media'] },
    { title: 'Product Design Intern', organization: 'Nimbus Labs [Demo Org]', type: 'Internship', mode: 'Remote', location: 'Remote (India)', eligibility: 'Students • 3rd year+', deadline: '2026-09-15', description: 'A demo 3-month design internship shipping real UI.', skills: ['Figma', 'UI Design'], featured: true },
    { title: 'Media & Journalism Intern', organization: 'Demo Newsroom', type: 'Internship', mode: 'On-site', location: 'New Delhi', eligibility: 'Students • Any stream', deadline: '2026-09-25', description: 'Cover education and youth affairs with senior editors (demo listing).', skills: ['Reporting', 'Writing'] },
    { title: 'Research Intern (Climate Policy)', organization: 'Demo Policy Institute', type: 'Internship', mode: 'Remote', location: 'Remote (India)', eligibility: 'Postgraduate students', deadline: '2026-10-10', description: 'Support a demo research project on climate policy and youth participation.', skills: ['Research', 'Data Analysis'] },
    { title: 'Youth Leadership Fellowship 2026', organization: 'Demo Foundation', type: 'Fellowship', mode: 'Hybrid', location: 'Multiple cities', eligibility: 'Ages 18–25', deadline: '2026-09-30', description: 'A demo six-month fellowship with training, mentorship and a funded community project.', skills: ['Leadership', 'Project Design'], featured: true },
    { title: 'Social Innovation Fellowship', organization: 'Demo Innovation Lab', type: 'Fellowship', mode: 'On-site', location: 'Pune, Maharashtra', eligibility: 'Students & recent graduates', deadline: '2026-10-15', description: 'A demo fellowship for student teams building community solutions.', skills: ['Ideation', 'Prototyping'] },
    { title: 'Undergraduate Research Fellowship', organization: 'Demo University', type: 'Fellowship', mode: 'On-site', location: 'Bhopal, Madhya Pradesh', eligibility: 'Undergraduates • 2nd year+', deadline: '2026-10-20', description: 'A demo summer research fellowship pairing undergraduates with faculty labs.', skills: ['Research'] },
    { title: 'Merit-cum-Means Scholarship', organization: 'Demo Education Trust', type: 'Scholarship', mode: 'Remote', location: 'Pan-India', eligibility: 'Family income criteria apply', deadline: '2026-09-28', description: 'A demo scholarship supporting tuition and living costs.', skills: [] },
    { title: 'Women in STEM Scholarship', organization: 'Demo Foundation', type: 'Scholarship', mode: 'Remote', location: 'Pan-India', eligibility: 'Women students in STEM', deadline: '2026-10-08', description: 'A demo scholarship recognising women pursuing STEM degrees.', skills: [] },
    { title: 'Community Changemaker Scholarship', organization: 'Demo Youth Collective', type: 'Scholarship', mode: 'Remote', location: 'Pan-India', eligibility: 'Students leading community initiatives', deadline: '2026-10-30', description: 'A demo scholarship for students leading measurable initiatives.', skills: [] },
  ],

  editions: [
    {
      month: 'September',
      year: 2026,
      title: 'Current Affairs — September 2026',
      intro: 'The September (demo) edition gathers the month\'s most relevant developments for students — national policy moves, global shifts, economic signals, science milestones and education updates — explained in plain language.',
      cover: '/images/affairs/affairs-1.jpg',
      topics: ['India', 'World', 'Economy', 'Science & Technology', 'Education'],
      articles: [
        {
          title: 'National Digital Education Architecture (NDEAR) 2.0 & APAAR Rollout',
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
    },
    {
      month: 'August',
      year: 2026,
      title: 'Current Affairs — August 2026',
      intro: 'The August (demo) edition: monsoon-session policy news, global economic currents, campus-relevant science and the education headlines students actually asked about.',
      cover: '/images/affairs/affairs-2.jpg',
      topics: ['India', 'World', 'Economy', 'Science & Technology', 'Education'],
      articles: [
        {
          title: 'Digital Personal Data Protection Act: Campus Compliance Guidelines',
          category: 'India',
          summary: 'What the updated DPDP framework means for student data privacy, consent managers, and university administrative portals.',
          keyPoints: [
            'Data Protection Board issues explicit guidelines for educational data fiduciaries.',
            'Mandatory parental consent thresholds and student privacy rights codified.',
            'Clear guidelines for university placement portals and third-party recruitment databases.'
          ],
          content: [
            'The phased enforcement of the Digital Personal Data Protection (DPDP) Act has entered academic institutions, establishing clear obligations for colleges and universities handling student personal information.',
            'Educational fiduciaries are now mandated to implement transparent consent mechanisms when sharing student resumes and academic records with third-party placement agencies, hackathon organizers, and ed-tech vendors. Students gain explicit rights to review, rectify, and revoke consent regarding their digital academic footprints.',
            'Understanding data compliance and digital rights is becoming an essential practical literacy for campus leaders and student organizers managing club registrations and campus events.'
          ],
          readingTime: 5,
        },
        {
          title: 'International Bilateral Academic Mobility Agreements',
          category: 'World',
          summary: 'Mutual qualification recognition treaties signed across key international student destinations.',
          keyPoints: [
            'Fast-track post-study work authorization streams negotiated under bilateral pacts.',
            'Joint degree recognition between Indian premier universities and international institutions.',
            'Streamlined credential equivalency for STEM and healthcare graduates.'
          ],
          content: [
            'India has concluded several landmark educational partnerships facilitating seamless credit transfer and post-graduation work rights for scholars abroad.',
            'These agreements formally equate standard Indian undergraduate and master degree credits with host nation licensing bodies, eliminating redundant bridging coursework for graduate researchers and professionals.',
            'For students planning international master degrees or doctoral research, these treaties significantly reduce immigration friction and enhance global career mobility.'
          ],
          readingTime: 4,
        },
        {
          title: 'Inflation Dynamics, Interest Rates & Student Education Financing',
          category: 'Economy',
          summary: 'How macroeconomic indicators and central bank lending rates influence collateral-free education loans and living expenses.',
          keyPoints: [
            'RBI interest rate stability maintains steady education loan borrowing costs.',
            'Expansion of public credit guarantee schemes for collateral-free higher education loans.',
            'State government interest subsidy windows opened for tier-2/3 student applicants.'
          ],
          content: [
            'Macroeconomic monetary policy decisions have maintained stable interest rates for public and private higher education financing, offering relief to families and students financing professional degrees.',
            'The expansion of the Credit Guarantee Fund Scheme for Education Loans (CGFSEL) now allows qualified students to access higher loan amounts for technical courses without pledging ancestral collateral.',
            'Financial literacy regarding floating versus fixed interest rates, loan moratorium periods, and tax deductions under Section 80E is vital for every graduating student entering repayment phases.'
          ],
          readingTime: 4,
        },
        {
          title: 'Deep Ocean Mission and Indigenous Submersible Trials',
          category: 'Science & Technology',
          summary: 'Samudrayaan mission advances with indigenous manned submersible depth trials in the central Indian Ocean.',
          keyPoints: [
            'Matsya 6000 submersible completes shallow and intermediate depth trial benchmarks.',
            'Interdisciplinary research in marine robotics, deep-sea biotechnology, and rare earth minerals.',
            'New oceanographic research internships opened for student geologists and mechanical engineers.'
          ],
          content: [
            'India’s flagship Deep Ocean Mission reached a major technical milestone with successful ocean trials of the indigenously engineered Matsya 6000 submersible, designed to carry researchers to depths of 6,000 meters.',
            'The mission unlocks critical scientific research into polymetallic nodules, hydrothermal vents, and deep-sea biodiversity with potential applications in pharmaceuticals and energy storage.',
            'This engineering achievement opens unique avenues in marine robotics, sonar signal processing, and metallurgical research for Indian university graduates.'
          ],
          readingTime: 4,
        },
        {
          title: 'National Research Foundation (Anusandhan) Innovation Seed Grants',
          category: 'Education',
          summary: 'Direct university research funding allocated to early-stage student innovation and faculty collaboration cells.',
          keyPoints: [
            'Anusandhan NRF allocates seed funding to undergraduate and postgraduate research projects.',
            'Special emphasis on state universities and tier-2 college laboratories.',
            'Industry matching grants encourage commercial translation of campus patents.'
          ],
          content: [
            'The newly operationalized Anusandhan National Research Foundation has launched its initial grant disbursement cycle aimed at democratizing scientific and social research funding across Indian colleges.',
            'Unlike previous funding mechanisms concentrated predominantly in elite institutes, NRF specifically reserves a percentage of seed capital for state university research cells and undergraduate innovation labs.',
            'Student researchers can now secure direct project grants for hardware prototypes, empirical economic field surveys, and open-source software tools.'
          ],
          readingTime: 4,
        },
      ],
    },
    {
      month: 'July',
      year: 2026,
      title: 'Current Affairs — July 2026',
      intro: 'The July (demo) edition kicks off the academic year with the stories that set the stage — policy, economy, science and the world beyond campus.',
      cover: '/images/affairs/affairs-3.jpg',
      topics: ['India', 'World', 'Economy', 'Science & Technology', 'Education'],
      articles: [
        {
          title: 'Common University Entrance and Admission Cycle Reforms',
          category: 'India',
          summary: 'Key process changes across central and state university counseling cycles for undergraduate admissions.',
          keyPoints: [
            'Single-window normalized counseling prevents seat wastage across central universities.',
            'Flexible tie-breaker and subject-mapping criteria instituted for interdisciplinary applicants.',
            'Real-time vacancy tracking dashboards deployed for all admission phases.'
          ],
          content: [
            'The nationwide centralized admission portal streamlined counseling across central and participating state universities, significantly curtailing multi-seat holding and last-minute vacancies.',
            'The introduction of dynamic choice-filling algorithms and transparent cutoff releases has made the annual admissions cycle predictable and less stressful for incoming students.',
            'Colleges are reporting earlier orientation commencement and faster onboarding into academic semester calendars.'
          ],
          readingTime: 5,
        },
        {
          title: 'Global Geopolitical Energy Corridors & Maritime Trade',
          category: 'World',
          summary: 'Five strategic global trade choke-points and their impact on commodity pricing explained for interview rooms.',
          keyPoints: [
            'Strategic maritime corridors secure energy and electronics supply routes.',
            'India’s international trade settlement in local currencies expands with regional partners.',
            'Geopolitical awareness emerging as a core interview question for consulting and banking.'
          ],
          content: [
            'Shifts in international maritime security and trading corridors have prompted global corporations to re-evaluate their supply chain logistics and industrial inventory strategies.',
            'India’s active participation in regional connectivity corridors strengthens its position as a reliable manufacturing and export hub.',
            'For students facing competitive job interviews, understanding the intersection between global logistics, energy supply chains, and domestic inflation is a critical differentiator.'
          ],
          readingTime: 5,
        },
        {
          title: 'Venture Capital Inflows: Deep Tech, Climate & Aerospace',
          category: 'Economy',
          summary: 'Investment data highlights where capital is moving and what it signals for student internships and hiring.',
          keyPoints: [
            'Early-stage funding surges in hardware, aerospace, and agricultural technology.',
            'Founders prioritize unit economics and product-market fit over hyper-growth marketing.',
            'Internship opportunities shift toward technical execution and product engineering roles.'
          ],
          content: [
            'The Indian startup funding landscape has witnessed a pronounced reallocation of private equity and venture capital into deep-tech, space-tech, and renewable energy startups.',
            'Unlike previous consumer internet cycles, deep-tech ventures require multidisciplinary talent spanning hardware design, thermal engineering, and scientific computation.',
            'Campus placement cells and student founders are capitalizing on this wave through incubator partnerships and prototyping grants.'
          ],
          readingTime: 4,
        },
        {
          title: 'Green Hydrogen and Renewable Grid Integration Breakthroughs',
          category: 'Science & Technology',
          summary: 'National Green Hydrogen Mission pilot projects begin operation across industrial hubs.',
          keyPoints: [
            'Electrolyzer manufacturing incentive schemes yield first batch of commercial units.',
            'Heavy industrial sectors initiate green hydrogen blending trials.',
            'Technical research collaborations launched between IITs and public energy corporations.'
          ],
          content: [
            'India’s National Green Hydrogen Mission has transitioned from policy planning to live pilot testing with commercial electrolyzer deployments in chemical and steel manufacturing hubs.',
            'These installations demonstrate the feasibility of zero-emission industrial heating and fertilizer production, placing India at the forefront of the global hydrogen economy.',
            'Engineering and chemistry students specializing in electrochemistry and process optimization are seeing high-value research opportunities emerge.'
          ],
          readingTime: 4,
        },
        {
          title: 'National Skill Qualification Framework (NSQF) Integration in Degrees',
          category: 'Education',
          summary: 'Micro-credentials and certified vocational tracks formally counted towards university degree credits.',
          keyPoints: [
            'Level-graded skill qualifications awarded alongside academic marksheets.',
            'Direct alignment with National Occupational Standards (NOS).',
            'Accelerated industry hiring for students graduating with dual academic-vocational credentials.'
          ],
          content: [
            'The complete convergence of the National Skill Qualification Framework with university degree structures ensures students graduate with verified hands-on competency certificates.',
            'By embedding industry-recognized certifications directly into university degree transcripts, colleges are bridging the gap between formal education and real-world employment needs.',
            'Students can now leverage verified practical credits to stand out during campus interviews and technical screenings.'
          ],
          readingTime: 4,
        },
      ],
    },
  ],

  legal: [
    { title: 'Your Rights on Campus: A Starter Guide', topic: 'Student Rights', summary: 'Understand your rights within educational institutions.', content: 'Campuses run on rules — but rules exist to protect students as much as institutions.\n\nThis starter guide (demo) covers evaluation criteria, grievance redressal and appeal routes. Always check your own institution\'s statutes.', keyPoints: ['Know where your institution publishes student rights', 'Fair, transparent evaluation is a reasonable expectation', 'Grievance redressal channels must exist', 'Keep written records'], readingTime: 5 },
    { title: 'Understanding Disciplinary Proceedings in Institutions', topic: 'Student Rights', summary: 'What to expect if you ever face disciplinary action.', content: 'This explainer outlines the typical anatomy of a disciplinary process: notice, response, hearing, decision and appeal.\n\nRespond in writing, keep copies, respect deadlines. [Demo content.]', keyPoints: ['Written notice of allegations', 'Right to be heard', 'Representation may be allowed', 'Appeal routes exist'], readingTime: 5 },
    { title: "A Student's Guide to Staying Safe Online", topic: 'Cyber Safety', summary: 'Know what to do when things go wrong online.', content: 'Phishing, job scams, OTP fraud and harassment — basic cyber hygiene for students, plus where to report cybercrime in India. [Demo content.]', keyPoints: ['Unique passwords + 2FA', 'Never share OTPs', 'Screenshot and report harassment', 'National cybercrime reporting portal'], readingTime: 4 },
    { title: 'What To Do If Your Account Gets Hacked', dek: undefined as unknown as string, topic: 'Cyber Safety', summary: 'A calm, step-by-step response plan.', content: 'Reclaim, review, revoke, report — the four steps to recovering a hacked account. [Demo content.]', keyPoints: ['Change passwords from a trusted device', 'Use recovery options', 'Check active sessions', 'Warn close contacts'], readingTime: 4 },
    { title: 'Digital Privacy 101 for Students', topic: 'Digital Rights', summary: 'Understand privacy, online identity and responsible digital participation.', content: 'Every quiz app and scholarship form adds a row to your digital footprint.\n\nThis explainer introduces data collection, consent, app permissions and India\'s data protection framework. [Demo content.]', keyPoints: ['Review app permissions', 'Understand consent', 'India has a data protection law', 'Curate your digital footprint'], readingTime: 5 },
    { title: 'Your Digital Footprint and You', topic: 'Digital Rights', summary: 'How what you post today shapes opportunities tomorrow.', content: 'Your digital footprint is your second CV. Small deliberate steps change how the internet introduces you. [Demo content.]', keyPoints: ['Audit public profiles', 'Build a deliberate presence', 'Request removals where possible'], readingTime: 4 },
    { title: 'Education Policy Explained Simply', topic: 'Education Laws', summary: 'Simplified explainers on rules and policies affecting students.', content: 'Education policy shapes admissions, exams, flexibility and what your degree is worth.\n\nFor anything that affects your academics, the official circular is the source of truth. [Demo content.]', keyPoints: ['Policy flows from national frameworks to campus notices', 'Credit frameworks add flexibility', 'Check official circulars first'], readingTime: 6 },
    { title: 'Understanding Anti-Ragging Laws and UGC Guidelines', topic: 'Education Laws', summary: 'What counts as ragging, what the law says, how to seek help.', content: 'Ragging is prohibited by law and UGC regulations — it is not "tradition".\n\nInstitutions must have anti-ragging committees and helpline access; complaints can be confidential. [Demo content.]', keyPoints: ['Ragging is banned — physical and psychological', 'Committees and helplines are mandatory', 'Confidential complaints are possible'], readingTime: 5 },
  ],

  campaign: {
    eyebrow: 'TSC ORIGINAL CAMPAIGN',
    title: 'ALL INDIA CAREER AWARENESS YOUTH DOCUMENTARY SERIES',
    headline: 'Real Careers. Real People. Real Possibilities.',
    description: 'What if students could see what a career actually looks like before choosing one? Our All India Career Awareness Youth Documentary Series takes students beyond generic career advice and into the real world.',
    stills: [
      { image: '/images/campaign/campaign-1.jpg', alt: 'Documentary still: an educator at work' },
      { image: '/images/campaign/campaign-2.jpg', alt: 'Documentary still: professionals at their workplace' },
      { image: '/images/campaign/campaign-3.jpg', alt: 'Documentary still: a young founder' },
    ],
    categories: ['Medicine', 'Public Administration', 'Technology', 'Media & Creation', 'Engineering', 'Education', 'Entrepreneurship'],
    locations: ['Patna', 'Delhi', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Kochi'],
  },

  campaignEpisodes: [
    { episodeNumber: 1, title: 'The Doctor', professional: 'Dr. A. Sharma [Demo]', profession: 'Medicine & Public Health', location: 'Patna', description: 'A day in the life of a doctor (demo episode).', image: '/images/hero/hero-classroom.jpg', durationLabel: '24 min', status: 'Released' },
    { episodeNumber: 2, title: 'The Founder', professional: 'I. Verma [Demo]', profession: 'Consumer Startup', location: 'Bengaluru', description: 'From hostel idea to first customers (demo episode).', image: '/images/campaign/campaign-3.jpg', durationLabel: '31 min', status: 'Released' },
    { episodeNumber: 3, title: 'The Civil Servant', professional: '[Demo Officer]', profession: 'Public Administration', location: 'Delhi', description: 'Beyond the exam mythology (demo episode).', image: '/images/hero/hero-workshop.jpg', durationLabel: '28 min', status: 'Coming Soon' },
    { episodeNumber: 4, title: 'The Creator', professional: '[Demo Creator]', profession: 'Media & Content', location: 'Mumbai', description: 'The business behind "just posting" (demo episode).', image: '/images/hero/hero-fest.jpg', durationLabel: '26 min', status: 'Coming Soon' },
    { episodeNumber: 5, title: 'The Engineer', professional: '[Demo Engineer]', profession: 'Aerospace & Manufacturing', location: 'Hyderabad', description: 'Engineering beyond the placement-package version (demo episode).', image: '/images/stories/story-3.jpg', durationLabel: '29 min', status: 'Coming Soon' },
    { episodeNumber: 6, title: 'The Educator', professional: '[Demo Educator]', profession: 'Teaching & Research', location: 'Kochi', description: 'Why the best teachers chose the classroom (demo episode).', image: '/images/campaign/campaign-1.jpg', durationLabel: '25 min', status: 'Coming Soon' },
  ],

  storySubmissions: [
    { name: 'Rohit Kumar (Demo)', email: 'rohit.demo@example.com', college: 'Demo College, Patna', city: 'Patna', state: 'Bihar', storyTitle: 'How Our Team Built a Flood-alert Prototype', storyCategory: 'Student', storyContent: 'A student team prototype for local flood alerts, built during a weekend hackathon. [Demo submission.]', consent: true, status: 'pending' },
    { name: 'Sneha Iyer (Demo)', email: 'sneha.demo@example.com', college: 'Demo Institute, Kochi', city: 'Kochi', state: 'Kerala', storyTitle: 'One Year of a Campus Composting Club', storyCategory: 'Campus', storyContent: 'What we learned running a student-led composting initiative for a full year. [Demo submission.]', consent: true, status: 'under review' },
    { name: 'Aditya Rao (Demo)', email: 'aditya.demo@example.com', college: 'Demo University, Hyderabad', city: 'Hyderabad', state: 'Telangana', storyTitle: 'Failing Forward: My First Startup Shut Down', storyCategory: 'Startup', storyContent: 'An honest post-mortem of a student startup that did not survive. [Demo submission.]', consent: true, status: 'pending' },
  ],

  campusSubmissions: [
    { name: 'Meera Nair (Demo)', email: 'meera.demo@example.com', college: 'Coastal University (Demo)', campus: 'Coastal University (Demo)', city: 'Kochi', state: 'Kerala', newsTitle: 'Our Campus Just Launched a Student Radio Station', category: 'Campus News', description: 'A new student-run radio initiative goes live this month. [Demo submission.]', consent: true, status: 'pending' },
    { name: 'Faizan Ali (Demo)', email: 'faizan.demo@example.com', college: 'Nalanda Institute (Demo)', campus: 'Nalanda Institute (Demo)', city: 'Patna', state: 'Bihar', newsTitle: 'Night Library Extends Hours for Exam Season', category: 'Campus Life', description: 'Student council extends reading-room hours till 4 a.m. [Demo submission.]', consent: true, status: 'under review' },
    { name: 'Tanvi Deshpande (Demo)', email: 'tanvi.demo@example.com', college: 'Vidya Vihar Central (Demo)', campus: 'Vidya Vihar Central (Demo)', city: 'Pune', state: 'Maharashtra', newsTitle: 'E-Cell Announces Annual Demo Pitch Fest', category: 'Campus Events', description: 'Call for entries open for the campus pitch competition. [Demo submission.]', consent: true, status: 'pending' },
  ],

  contactMessages: [
    { name: 'Journalism Student (Demo)', email: 'journo.demo@example.com', subject: 'Want to contribute to TSC Newsroom', message: 'Final-year journalism student looking to contribute campus stories.', status: 'new' },
    { name: 'Placement Cell (Demo)', email: 'placements.demo@example.com', subject: 'Listing an opportunity on TSC Career', message: 'We would like to list an internship opportunity.', status: 'read' },
    { name: 'Parent (Demo)', email: 'parent.demo@example.com', subject: 'Appreciation for the Career Awareness series', message: 'Wonderful initiative — please keep going.', status: 'replied' },
  ],
};

export type SeedData = typeof seedData;
