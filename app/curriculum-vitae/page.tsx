import Link from "next/link";

const JOBS = [
  {
    title: "Freelance Digital Marketing Specialist",
    company: "Self-employed",
    period: "May 2026 – present",
    industry: "B2B SaaS & deep-tech marketing",
    accomplishments: [
      "Providing freelance marketing services for B2B SaaS and deep-tech clients, including content strategy, ABM, and go-to-market support.",
    ],
  },
  {
    title: "Professional Development",
    company: "Career break",
    period: "Oct 2025 – Apr 2026",
    industry: "Full-stack development & computer science",
    accomplishments: [
      "Completed a full-stack developer bootcamp (velpTEC, in German), including individual and group frontend/backend qualification projects.",
      "Built hands-on projects with JavaScript (React, Next.js, Node.js), Python, SQL, and REST/GraphQL APIs to deepen technical fluency.",
      "Began a part-time B.Sc. in Computer Science at FernUniversität Hagen to partner more effectively with product and engineering teams.",
    ],
  },
  {
    title: "Senior Content Marketing & PR Manager",
    company: "Micropsi Industries",
    period: "Sep 2024 – Oct 2025",
    industry: "Industrial AI / robotics (B2B SaaS, deep-tech)",
    accomplishments: [
      "Defined, created, and tested content and messaging for two ABM campaigns across two industries; target personas were C-level executives and engineers. Achieved an average 10–15% increase in MQL conversion per phase iteration without changing target personas.",
      "Increased organic traffic by 20% in the first four months after the domain had been stagnant since 2022.",
      "Managed two PR agencies and led PR activities across North America, DACH, and Eastern Europe.",
      "Created ad copy for Google Ads and LinkedIn, increasing conversions by an average of 23% without changing the target audience.",
      "Established a company-wide content creation process, including feedback loops and stakeholder buy-in, reducing average time-to-produce a piece of content by nearly three months.",
    ],
  },
  {
    title: "Senior Marketing Manager",
    company: "DroneTalks & Murzilli Consulting",
    period: "Oct 2022 – Sep 2024",
    industry: "B2B drone technology & consulting",
    accomplishments: [
      "Owned all marketing for two companies and directed the sales strategy to grow the customer base for DroneTalks (marketing agency).",
      "Increased lead generation by 40% and conversion rates by 30% within the first six months at DroneTalks through SEO, targeted content, and multi-channel campaigns.",
      "Grew Murzilli Consulting's audience by 35% within the first year and improved funnel conversion rates by 25% alongside the sales manager.",
      "Led website design and build, working hands-on with HTML5 and CSS.",
      "Launched products, including SaaS products, for a range of B2B drone companies.",
      "Drafted all customer contracts and coordinated with the legal department on revisions.",
      "Managed and mentored a team of junior copywriters and content creators, improving content production efficiency and team performance metrics by 30%.",
      "Hired and trained several marketing professionals, growing the team by 50% while significantly improving retention.",
    ],
  },
  {
    title: "Senior Copywriter",
    company: "Feather Insurance",
    period: "Jun 2021 – Oct 2022",
    industry: "Insurtech (B2C & B2B SaaS)",
    accomplishments: [
      "Led content marketing campaigns and strategy, including press coordination.",
      "Developed and executed a content strategy that increased web traffic by 40% and significantly lifted engagement, applying SEO optimisation and audience analytics.",
      "Wrote copy for email, social, and web campaigns, achieving conversion rates averaging 15% above industry benchmarks.",
      "Translated complex insurance contracts into English and obtained legal approvals to ensure regulatory compliance.",
      "Wrote and distributed press releases for critical funding rounds.",
      "Designed and executed A/B tests for email campaigns and landing pages, optimising content effectiveness based on empirical data.",
      "Wrote high-impact CRM emails in English and German and established editorial guidelines to ensure consistency across all corporate communications.",
    ],
  },
  {
    title: "Copywriter",
    company: "numa (formerly COSI Group)",
    period: "Jul 2020 – Jun 2021",
    industry: "Proptech / hospitality tech",
    accomplishments: [
      "Created engaging, SEO-optimised copy communicating the brand's value proposition and co-created over 20 landing pages with the content team.",
      "Managed the content creation pipeline, ensuring timely production, editing, and publication of quality content across multiple platforms.",
      "Wrote numerous B2B and B2C articles, adapting tone and style to different audiences and market sectors.",
      "Authored two in-depth white papers and several interactive B2B proptech research websites for enterprise customers.",
    ],
  },
  {
    title: "Content Marketer (Internship)",
    company: "Körber Digital",
    period: "Feb 2020 – Jul 2020",
    industry: "Industrial / manufacturing tech",
    accomplishments: [
      "Wrote B2B articles and white papers for the manufacturing industry, applying SEO best practices to increase visibility.",
      "Translated manufacturing manuals from German to English, ensuring clarity and accuracy.",
      "Co-managed the content management system (CMS) with the senior copywriter and helped plan and implement social media strategies.",
    ],
  },
  {
    title: "Academic Editor",
    company: "Self-employed",
    period: "Oct 2017 – Mar 2020",
    industry: "Academic editing & translation",
    accomplishments: [
      "Edited numerous academic papers for clarity and coherence while studying at Freie Universität Berlin, ensuring compliance with APA, MLA, and Chicago style guides.",
      "Worked closely with faculty to accurately represent their research in English, advising on argumentation, structure, and use of evidence.",
      "Managed multiple editing assignments simultaneously and became a trusted editing resource across departments.",
    ],
  },
  {
    title: "International Mentor",
    company: "Universität Kassel",
    period: "Oct 2016 – Sep 2017",
    industry: "Higher education",
    accomplishments: [
      "Provided German-to-English translation services for the English Literature Department and the International Office.",
      "Supported faculty and students in their research and reviewed ERASMUS application essays, advising on structure and articulation of academic goals.",
      "Organised cultural and social events for international students, promoting integration and enriching academic life.",
    ],
  },
  {
    title: "Academic Editor — Writing Center",
    company: "University of Wisconsin Oshkosh",
    period: "Oct 2013 – Jun 2016",
    industry: "Higher education",
    accomplishments: [
      "Provided one-on-one editing and tutoring to a diverse group of students, developing individualised teaching strategies for ESL students and students with disabilities.",
      "Created and led workshops addressing common writing challenges, significantly improving essay quality.",
      "Collaborated with other tutors to evolve the center's services in response to changing academic needs and feedback.",
    ],
  },
];

const TECH = [
  {
    label: "Languages & Frameworks",
    value:
      "JavaScript (React, Next.js, Node.js), Python, C#, SQL (PostgreSQL, SQLite), HTML5, CSS3, Tailwind CSS, Go, PHP (Laravel)",
  },
  {
    label: "Concepts",
    value:
      "REST APIs, GraphQL, authentication (Auth.js), async/await, DOM manipulation, OOP, relational database design",
  },
  {
    label: "Dev Tooling",
    value:
      "Git & version control, CI/CD (Vercel), Jest, Cypress, Playwright, Postman, VS Code, GoLand, PHPStorm, n8n, Claude, Copilot, mistral, Whisper (ChatGPT voice AI), Firebase",
  },
  {
    label: "Completed via",
    value:
      "Fullstack Developer Bootcamp (German), velpTEC, including individual and group frontend/backend qualification projects",
  },
];

const MARKETING = [
  {
    label: "Analytics & SEO",
    value: "Google Analytics, Search Console, Tag Manager, Ahrefs, SEMrush",
  },
  {
    label: "Ads & Demand Gen",
    value: "Google Ads, LinkedIn Campaign Manager, Apollo.io",
  },
  { label: "CRM & Automation", value: "Salesforce, HubSpot" },
  { label: "Design", value: "Figma, Sketch, Canva, Midjourney" },
];

const EDUCATION = [
  {
    degree: "B.Sc. Computer Science",
    school: "FernUniversität Hagen",
    period: "Apr 2026 – present (part-time)",
    note: "Deepening technical fluency to partner more effectively with product and engineering teams.",
  },
  {
    degree: "M.A. Modern German Literature",
    school: "Freie Universität Berlin",
  },
  {
    degree: "M.A. English (Commonwealth) Literature",
    school: "Freie Universität Berlin",
  },
  {
    degree: "B.A. English Literature",
    school: "University of Wisconsin Oshkosh",
  },
  {
    degree: "B.A. German Language & Culture",
    school: "University of Wisconsin Oshkosh",
  },
];

const LANGUAGES = [
  { language: "English", level: "Native" },
  { language: "German", level: "Fluent (C2)" },
  { language: "Spanish", level: "B1" },
];

const grotesk = { fontFamily: "var(--font-space-grotesk)" };

export default function CurriculumVitaePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 relative" style={{ margin: 0, padding: 0 }}>
      <div className="pt-12 pl-32 pr-16 pb-24">
        <Link
          href="/"
          className="text-sm uppercase tracking-[0.25em] text-zinc-400 transition hover:text-white"
          style={grotesk}
        >
          &larr; Home
        </Link>

        <h1 className="mt-8 text-6xl font-semibold text-white sm:text-7xl italic" style={grotesk}>
          Curriculum vitae
        </h1>

        {/* Freelancing banner */}
        <Link
          href="/contact"
          className="mt-8 inline-flex items-center gap-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 transition hover:border-emerald-400/60 hover:bg-emerald-500/20"
          style={grotesk}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">
            Currently freelancing
          </span>
        </Link>

        {/* Experience timeline: center line, bubbles alternating */}
        <section className="mt-20 max-w-5xl">
          <h2 className="text-sm uppercase tracking-[0.3em] text-zinc-400" style={grotesk}>
            Experience
          </h2>

          <div className="relative mt-12">
            {/* Center line */}
            <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-zinc-700" />

            {JOBS.map((job) => (
              <article key={`${job.company}-${job.period}`} className="relative pb-20 last:pb-0">
                {/* Job header, centered on the line */}
                <header className="relative mx-auto max-w-lg pb-10 text-center">
                  {/* Fade the line out behind the header */}
                  <span
                    className="absolute -bottom-6 -top-6 left-1/2 w-2 -translate-x-1/2"
                    style={{
                      background:
                        "linear-gradient(to bottom, transparent, #09090b 18%, #09090b 82%, transparent)",
                    }}
                  />

                  <div className="relative">
                    <p
                      className="text-base font-semibold uppercase tracking-[0.25em] text-white"
                      style={grotesk}
                    >
                      {job.period}
                    </p>
                    <h3 className="mt-3 text-3xl font-bold text-white sm:text-4xl" style={grotesk}>
                      {job.title}
                    </h3>
                    <p className="mt-2 text-xl text-zinc-300" style={grotesk}>
                      {job.company}
                    </p>
                    <p className="mt-1 text-sm italic text-zinc-500" style={grotesk}>
                      {job.industry}
                    </p>
                  </div>
                </header>

                {/* Accomplishment bubbles, alternating sides */}
                <ul className="space-y-4">
                  {job.accomplishments.map((item, i) => {
                    const left = i % 2 === 0;
                    return (
                      <li key={i} className="relative grid grid-cols-2 items-center gap-x-16">
                        {/* Connector + node */}
                        <span
                          className={`absolute top-1/2 h-px w-8 bg-zinc-700 ${
                            left ? "left-1/2 -translate-x-full" : "left-1/2"
                          }`}
                        />
                        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-600" />

                        <div className={left ? "col-start-1" : "col-start-2"}>
                          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-5 py-4 text-sm leading-relaxed text-zinc-300">
                            {item}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Technical skills */}
        <section className="mt-24 max-w-3xl">
          <h2 className="text-sm uppercase tracking-[0.3em] text-zinc-400" style={grotesk}>
            Technical skills
          </h2>
          <dl className="mt-8 space-y-6">
            {TECH.map((row) => (
              <div key={row.label}>
                <dt className="text-lg font-semibold text-white" style={grotesk}>
                  {row.label}
                </dt>
                <dd className="mt-1 leading-relaxed text-zinc-300">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Marketing stack */}
        <section className="mt-24 max-w-3xl">
          <h2 className="text-sm uppercase tracking-[0.3em] text-zinc-400" style={grotesk}>
            Marketing stack
          </h2>
          <dl className="mt-8 space-y-6">
            {MARKETING.map((row) => (
              <div key={row.label}>
                <dt className="text-lg font-semibold text-white" style={grotesk}>
                  {row.label}
                </dt>
                <dd className="mt-1 leading-relaxed text-zinc-300">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Education */}
        <section className="mt-24 max-w-3xl">
          <h2 className="text-sm uppercase tracking-[0.3em] text-zinc-400" style={grotesk}>
            Education
          </h2>
          <ul className="mt-8 space-y-6">
            {EDUCATION.map((edu) => (
              <li key={edu.degree}>
                <p className="text-lg font-semibold text-white" style={grotesk}>
                  {edu.degree}
                </p>
                <p className="mt-1 text-zinc-300">
                  {edu.school}
                  {"period" in edu && edu.period ? ` · ${edu.period}` : ""}
                </p>
                {"note" in edu && edu.note && (
                  <p className="mt-1 text-sm italic text-zinc-500">{edu.note}</p>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Languages */}
        <section className="mt-24 max-w-3xl">
          <h2 className="text-sm uppercase tracking-[0.3em] text-zinc-400" style={grotesk}>
            Languages
          </h2>
          <ul className="mt-8 space-y-3">
            {LANGUAGES.map((lang) => (
              <li key={lang.language} className="flex items-baseline gap-4">
                <span className="text-lg font-semibold text-white" style={grotesk}>
                  {lang.language}
                </span>
                <span className="text-zinc-400">{lang.level}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
