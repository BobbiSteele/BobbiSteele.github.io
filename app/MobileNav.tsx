"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  { label: "Projects", href: "/projects" },
  { label: "Writing", href: "/writing-portfolio" },
  { label: "Ghostwriting", href: "/ghostwriting" },
  { label: "Tools", href: "/tools" },
  { label: "CV", href: "/curriculum-vitae" },
  { label: "Contact", href: "/contact" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur md:hidden"
      style={{ fontFamily: "var(--font-space-grotesk)" }}
    >
      <ul className="flex items-center gap-0.5 overflow-x-auto whitespace-nowrap px-2 py-2">
        {MENU_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                className={`block rounded-full px-2.5 py-1 text-[13px] transition ${
                  active ? "bg-zinc-800 font-medium text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
