import Link from "next/link";
import { notFound } from "next/navigation";
import PasswordGate from "../../PasswordGate";
import { articles, categorySlug, getArticle, type Segment } from "../articles";

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

function Segments({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, i) =>
        s.href ? (
          <a
            key={i}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-zinc-600 underline-offset-4 transition hover:text-white hover:decoration-zinc-300"
          >
            {s.text}
          </a>
        ) : (
          <span key={i}>{s.text}</span>
        )
      )}
    </>
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <PasswordGate gate="writing-portfolio">
      <main className="min-h-screen bg-zinc-950 text-zinc-100 relative" style={{ margin: 0, padding: 0 }}>
        <div className="pt-12 pl-32 pr-16 pb-24">
          <Link
            href={`/writing-portfolio/category/${categorySlug(article.category)}/`}
            className="text-sm uppercase tracking-[0.25em] text-zinc-400 transition hover:text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            &larr; {article.category}
          </Link>

          <article className="mt-12 max-w-2xl">
            <p
              className="text-xs uppercase tracking-[0.3em] text-zinc-500"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {article.category}
            </p>

            <h1
              className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {article.title}
            </h1>

            <div className="mt-12 space-y-6">
              {article.blocks.map((block, i) =>
                block.type === "h2" ? (
                  <h2
                    key={i}
                    className="pt-4 text-2xl font-semibold text-white"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    <Segments segments={block.segments} />
                  </h2>
                ) : block.type === "h3" ? (
                  <h3
                    key={i}
                    className="pt-2 text-xl font-semibold text-zinc-100"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    <Segments segments={block.segments} />
                  </h3>
                ) : (
                  <p key={i} className="text-lg leading-relaxed text-zinc-300">
                    <Segments segments={block.segments} />
                  </p>
                )
              )}
            </div>
          </article>
        </div>
      </main>
    </PasswordGate>
  );
}
