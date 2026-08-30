import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-20 sm:px-10">
        <section className="flex items-center gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl font-[family-name:var(--font-space-grotesk)]">
              Bobbi Steele
            </h1>
            <p className="text-xl text-zinc-300 font-[family-name:var(--font-space-grotesk)]">
              Digital Marketing Specialist
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-medium text-white">Projects</h2>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
            <Link
              href="/1password"
              className="inline-flex items-center text-lg font-medium text-zinc-100 underline decoration-zinc-600 underline-offset-4 transition hover:text-white hover:decoration-zinc-300"
            >
              1Password
            </Link>
            <p className="mt-2 text-sm text-zinc-400">Security &amp; IT Awareness training</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5">
            <Link
              href="/Data-cleaning-bot"
              className="inline-flex items-center text-lg font-medium text-zinc-100 underline decoration-zinc-600 underline-offset-4 transition hover:text-white hover:decoration-zinc-300"
            >
              Work in progress:Data Cleaning Bot
            </Link>
            <p className="mt-2 text-sm text-zinc-400">Clean CSV files with Groq and PandasAI in your browser</p>
          </div>
        </section>
      </div>
    </main>
  );
}
