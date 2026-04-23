import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-20 sm:px-10">
        <section className="space-y-4">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">Home</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Bobbi Steele
          </h1>
          <p className="max-w-xl text-zinc-300">
            A simple dark homepage built with Next.js and deployed on GitHub Pages.
          </p>
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
            <p className="mt-2 text-sm text-zinc-400">Notes and project details.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
