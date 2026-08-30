import Link from "next/link";

export default function ContactPage() {
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
          Contact me
        </h1>

        <p className="mt-16 max-w-xl text-zinc-400">Coming soon.</p>
      </div>
    </main>
  );
}
