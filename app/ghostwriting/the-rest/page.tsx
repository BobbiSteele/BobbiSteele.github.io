import Link from "next/link";
import PasswordGate from "../../PasswordGate";

export default function TheRestPage() {
  return (
    <PasswordGate gate="ghostwriting-rest">
      <main className="min-h-screen bg-zinc-950 text-zinc-100 relative" style={{ margin: 0, padding: 0 }}>
        <div className="pt-12 pl-6 pr-6 pb-24 md:pl-32 md:pr-16">
          <Link
            href="/writing/"
            className="text-sm uppercase tracking-[0.25em] text-zinc-400 transition hover:text-white"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            &larr; Writing
          </Link>

          <h1
            className="mt-8 text-4xl font-semibold text-white sm:text-6xl lg:text-7xl italic"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            The rest ;)
          </h1>

          <p className="mt-16 max-w-xl text-zinc-400">Coming soon.</p>
        </div>
      </main>
    </PasswordGate>
  );
}
