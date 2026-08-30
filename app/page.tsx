import Link from "next/link";
import Typewriter from "./Typewriter";

const MENU_ITEMS = [
  { label: "Projects", href: "/projects" },
  { label: "Writing portfolio", href: "/writing-portfolio" },
  { label: "Ghostwriting", href: "/ghostwriting" },
  { label: "Tools", href: "/tools" },
  { label: "Curriculum vitae", href: "/curriculum-vitae" },
  { label: "Contact me", href: "/contact" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 relative" style={{ margin: 0, padding: 0 }}>
      <h1
        className="fixed left-0 top-1/2 text-6xl font-bold tracking-tight text-white sm:text-7xl whitespace-nowrap"
        style={{
          fontFamily: 'var(--font-space-grotesk)',
          writingMode: 'vertical-rl',
          transform: 'translateY(-50%) rotate(180deg)',
          margin: 0,
          padding: 0,
        }}
      >
        Bobbi Steele
      </h1>

      <p
        className="fixed right-0 top-1/2 text-sm uppercase tracking-[0.25em] text-zinc-400 whitespace-nowrap"
        style={{
          fontFamily: 'var(--font-space-grotesk)',
          writingMode: 'vertical-rl',
          transform: 'translateY(-50%)',
          margin: 0,
          padding: 0,
        }}
      >
        &copy; 2026 Bobbi Steele
      </p>

      <div className="pt-12 pl-32 pr-16">
        <p className="text-6xl font-semibold text-white sm:text-7xl italic" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Digital Marketing Specialist
        </p>

        <div className="mt-16">
          <Typewriter />
        </div>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 pl-32 pr-16 pb-10"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-3">
          {MENU_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-lg text-zinc-300 transition hover:text-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
