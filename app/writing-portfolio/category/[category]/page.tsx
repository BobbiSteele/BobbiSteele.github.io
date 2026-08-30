import Link from "next/link";
import { notFound } from "next/navigation";
import PasswordGate from "../../../PasswordGate";
import {
  articlesByCategory,
  categorySlug,
  getCategoryBySlug,
} from "../../articles";

export function generateStaticParams() {
  return [...articlesByCategory().keys()].map((category) => ({
    category: categorySlug(category),
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const items = articlesByCategory().get(category) ?? [];

  return (
    <PasswordGate gate="writing-portfolio">
      <main className="min-h-screen bg-zinc-950 text-zinc-100 relative" style={{ margin: 0, padding: 0 }}>
        <div className="pt-12 pl-32 pr-16 pb-24">
          <Link
            href="/writing-portfolio/"
            className="text-sm uppercase tracking-[0.25em] text-zinc-400 transition hover:text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            &larr; Writing portfolio
          </Link>

          <h1
            className="mt-8 text-5xl font-semibold text-white sm:text-6xl italic"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {category}
          </h1>

          <ul className="mt-16 max-w-3xl space-y-4">
            {items.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/writing-portfolio/${article.slug}/`}
                  className="text-xl text-zinc-100 underline decoration-zinc-700 underline-offset-4 transition hover:text-white hover:decoration-zinc-300"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </PasswordGate>
  );
}
