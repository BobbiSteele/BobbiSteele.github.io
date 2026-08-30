import Link from "next/link";

const CATEGORIES = [
  { name: "Thought leadership", href: "/ghostwriting/thought-leadership/" },
  { name: "The rest ;)", href: "/ghostwriting/the-rest/" },
];

export default function GhostwritingPage() {
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
          Ghostwriting
        </h1>

        <div className="mt-16 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/70 p-8 transition hover:border-zinc-600 hover:bg-zinc-900"
            >
              <h2
                className="text-2xl font-semibold text-white"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {category.name}
              </h2>
              <p className="mt-4 text-sm uppercase tracking-[0.2em] text-zinc-500 transition group-hover:text-zinc-300">
                Password required &rarr;
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
