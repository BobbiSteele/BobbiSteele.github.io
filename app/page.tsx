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
      <div className="pt-8 pl-6 pr-6 md:pt-12 md:pl-32 md:pr-16">
        <p className="text-4xl font-semibold text-white sm:text-6xl lg:text-7xl italic" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Digital Marketing Specialist
        </p>

        <div className="mt-10 sm:mt-16">
          <Typewriter />
        </div>

        <p
          className="mt-10 max-w-4xl text-lg leading-relaxed text-zinc-300 sm:mt-16 sm:text-xl"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          Senior digital marketing specialist with 6+ years of experience driving demand,
          positioning and go-to-market strategy for B2B SaaS and deep-tech products. This
          includes industrial AI and robotics, drones and insurtech.
        </p>

        <p
          className="mt-6 max-w-4xl text-lg leading-relaxed text-zinc-300 sm:text-xl"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          I specialise in ABM, messaging, and full-funnel content that engages technical
          buyers, from engineers to C-suite executives. With hands-on expertise in
          JavaScript, APIs, and SQL, I partner effectively with product and engineering
          teams to translate complex technology into credible, compelling market narratives.
        </p>
      </div>

      <nav
        className="hidden md:fixed md:bottom-0 md:left-0 md:right-0 md:block md:pl-32 md:pr-16 md:pb-10"
        style={{ fontFamily: 'var(--font-space-grotesk)' }}
      >
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-10">
          {MENU_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-base text-zinc-300 transition hover:text-white sm:text-lg"
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
