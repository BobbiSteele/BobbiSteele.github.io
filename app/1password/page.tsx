import Link from "next/link";

export default function OnePasswordPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-20 sm:px-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">Project</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">1Password</h1>
          <p className="max-w-xl text-zinc-300">
            This is the 1Password project page.
          </p>
        </header>

        <Link
          href="/"
          className="inline-flex w-fit items-center text-sm font-medium text-zinc-300 underline decoration-zinc-600 underline-offset-4 transition hover:text-white hover:decoration-zinc-300"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
