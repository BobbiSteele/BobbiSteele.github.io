"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  { label: "Projects", short: "Projects", href: "/projects" },
  { label: "Writing", short: "Writing", href: "/writing" },
  { label: "Tools", short: "Tools", href: "/tools" },
  { label: "Curriculum vitae", short: "CV", href: "/curriculum-vitae" },
  { label: "Contact me", short: "Contact", href: "/contact" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Mobile: sticky top bar */}
      <nav
        className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur md:hidden"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        <ul className="flex items-center gap-0.5 overflow-x-auto whitespace-nowrap px-2 py-2">
          {MENU_ITEMS.map((item) => (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                className={`block rounded-full px-2.5 py-1 text-[13px] transition ${
                  isActive(item.href)
                    ? "bg-zinc-800 font-medium text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.short}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop: fixed bottom bar with solid background */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 hidden border-t border-zinc-800 bg-zinc-950 md:block"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-3 py-4 pl-32 pr-16">
          {MENU_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`text-lg transition hover:text-white ${
                  isActive(item.href) ? "text-white" : "text-zinc-300"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
