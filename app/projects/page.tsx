import Link from "next/link";

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 relative" style={{ margin: 0, padding: 0 }}>
      <div className="pt-12 pl-32 pr-16 pb-24">
        <Link
          href="/"
          className="text-sm uppercase tracking-[0.25em] text-zinc-400 transition hover:text-white"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          &larr; Home
        </Link>

        <h1
          className="mt-8 text-6xl font-semibold text-white sm:text-7xl italic"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Projects
        </h1>

        <div className="mt-16 max-w-2xl space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
            <Link
              href="/1password"
              className="inline-flex items-center text-lg font-medium text-zinc-100 underline decoration-zinc-600 underline-offset-4 transition hover:text-white hover:decoration-zinc-300"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              1Password
            </Link>
            <p className="mt-2 text-sm text-zinc-400">Security &amp; IT Awareness training</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
            <Link
              href="/Data-cleaning-bot"
              className="inline-flex items-center text-lg font-medium text-zinc-100 underline decoration-zinc-600 underline-offset-4 transition hover:text-white hover:decoration-zinc-300"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Data Cleaning Bot
            </Link>
            <p className="mt-2 text-sm text-zinc-400">
              Work in progress: clean CSV files with Groq and PandasAI in your browser
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
