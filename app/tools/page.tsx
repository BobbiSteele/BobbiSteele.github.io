import Link from "next/link";
import CsvMatchPreview from "./CsvMatchPreview";
import DataCleaningPreview from "./DataCleaningPreview";
import LinkedInFollowersPreview from "./LinkedInFollowersPreview";
import SocialReportsPreview from "./SocialReportsPreview";
import ZoomEngagementPreview from "./ZoomEngagementPreview";

function LanguageTags({ languages }: { languages: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {languages.map((lang) => (
        <span
          key={lang}
          className="rounded-full border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-[11px] text-zinc-400"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {lang}
        </span>
      ))}
    </div>
  );
}

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 relative" style={{ margin: 0, padding: 0 }}>
      <div className="pt-12 pl-6 pr-6 pb-24 md:pl-32 md:pr-16">
        <Link
          href="/"
          className="text-sm uppercase tracking-[0.25em] text-zinc-400 transition hover:text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          &larr; Home
        </Link>

        <h1
          className="mt-8 text-4xl font-semibold text-white sm:text-6xl lg:text-7xl italic"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Tools
        </h1>

        <div className="mt-16 grid max-w-5xl grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
            <h2
              className="text-lg font-medium text-zinc-100"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              CSV Cross-Match Finder
            </h2>
            <LanguageTags languages={["Go", "JavaScript", "HTML/CSS"]} />
            <p className="mt-2 text-sm text-zinc-400">
              Upload multiple CSV files and find values that appear across them, matched by column
              name (e.g. &ldquo;email&rdquo;). Everything is processed in memory &mdash; nothing is
              ever saved to disk.
            </p>
            <div className="mt-4">
              <CsvMatchPreview />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
            <h2
              className="text-lg font-medium text-zinc-100"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              LinkedIn Followers Report
            </h2>
            <LanguageTags languages={["Go", "JavaScript", "HTML/CSS"]} />
            <p className="mt-2 text-sm text-zinc-400">
              Combine LinkedIn followers CSV exports from multiple regions into one report of
              new followers by country and industry, with filters and exportable charts.
            </p>
            <div className="mt-4">
              <LinkedInFollowersPreview />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
            <h2
              className="text-lg font-medium text-zinc-100"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Social Media Report Cleaner
            </h2>
            <LanguageTags languages={["Go", "JavaScript", "HTML/CSS"]} />
            <p className="mt-2 text-sm text-zinc-400">
              Upload organic post exports from Facebook, Instagram, LinkedIn, and X, and get one
              cleaned, de-duplicated report with impressions charts, top posts, and hashtags.
            </p>
            <div className="mt-4">
              <SocialReportsPreview />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
            <h2
              className="text-lg font-medium text-zinc-100"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Zoom Engagement Report
            </h2>
            <LanguageTags languages={["Go", "JavaScript", "HTML/CSS"]} />
            <p className="mt-2 text-sm text-zinc-400">
              Combine Zoom attendee, poll, and Q&amp;A exports into one report of who asked and
              answered each question, with filters and CSV export.
            </p>
            <div className="mt-4">
              <ZoomEngagementPreview />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
            <h2
              className="text-lg font-medium text-zinc-100"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              <Link
                href="/Data-cleaning-bot"
                className="underline decoration-zinc-600 underline-offset-4 transition hover:text-white hover:decoration-zinc-300"
              >
                Data Cleaning Bot
              </Link>
            </h2>
            <LanguageTags languages={["TypeScript", "Python", "React"]} />
            <p className="mt-2 text-sm text-zinc-400">
              Clean CSV files in your browser: Groq writes pandas code from plain-language
              instructions and Pyodide runs it locally &mdash; your data never leaves the page.
            </p>
            <div className="mt-4">
              <DataCleaningPreview />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
