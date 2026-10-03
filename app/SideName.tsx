import Link from "next/link";

export default function SideName() {
  return (
    <>
      {/* Mobile: horizontal name at top */}
      <Link
        href="/"
        className="block px-6 pt-6 text-3xl font-bold tracking-tight text-white transition hover:text-zinc-300 md:hidden"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        Bobbi Steele
      </Link>
      {/* Desktop: vertical name fixed to left edge */}
      <Link
        href="/"
        className="fixed left-0 top-1/2 z-50 hidden text-6xl font-bold tracking-tight text-white sm:text-7xl whitespace-nowrap transition hover:text-zinc-300 md:block"
        style={{
          fontFamily: "var(--font-space-grotesk)",
          writingMode: "vertical-rl",
          transform: "translateY(-50%) rotate(180deg)",
          margin: 0,
          padding: 0,
        }}
      >
        Bobbi Steele
      </Link>
    </>
  );
}
