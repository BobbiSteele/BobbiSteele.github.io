import Link from "next/link";

export default function SideName() {
  return (
    <Link
      href="/"
      className="fixed left-0 top-1/2 z-50 text-6xl font-bold tracking-tight text-white sm:text-7xl whitespace-nowrap transition hover:text-zinc-300"
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
  );
}
