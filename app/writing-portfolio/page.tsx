import Link from "next/link";
import PasswordGate from "../PasswordGate";
import { articlesByCategory, categorySlug } from "./articles";

export default function WritingPortfolioPage() {
  const grouped = articlesByCategory();

  return (
    <PasswordGate gate="writing-portfolio">
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
          Writing portfolio
        </h1>

        <div className="mt-16 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {[...grouped.entries()].map(([category, items]) => (
            <Link
              key={category}
              href={`/writing-portfolio/category/${categorySlug(category)}/`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 transition hover:border-zinc-600 hover:bg-zinc-900"
            >
              <h2
                className="text-xl font-semibold text-white"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {category}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                {items.length} {items.length === 1 ? "article" : "articles"}
              </p>
              <p className="mt-4 text-sm text-zinc-500 transition group-hover:text-zinc-300">
                View articles &rarr;
              </p>
            </Link>
          ))}
        </div>
      </div>
      </main>
    </PasswordGate>
  );
}
