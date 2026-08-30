"use client";

import { useEffect, useState } from "react";

// Honestly, this isn't secure at all. If you found this, then great job! 
// I just dont want my portfolio to be indexed by search engines or crawled by bots.

const PASSWORD_HASH =
  "9881928f60e14fcbd7a28d2166ee4e8ba456daa9df696159dcae35050762895b"; // "portfolio2026"

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem("pw-unlocked") === "1");
    setChecked(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hash = await sha256Hex(input);
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem("pw-unlocked", "1");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  if (!checked) return null;

  if (unlocked) return <>{children}</>;

  return (
    <main
      className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center"
      style={{ margin: 0, padding: 0 }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-start gap-6 px-6"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
          Password required
        </p>

        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          autoFocus
          placeholder="Enter password"
          className="w-72 border-b border-zinc-700 bg-transparent pb-2 text-2xl text-white placeholder-zinc-600 outline-none transition focus:border-white"
        />

        {error && <p className="text-sm text-red-400">Incorrect password. Try again.</p>}

        <button
          type="submit"
          className="text-lg text-zinc-300 underline decoration-zinc-600 underline-offset-4 transition hover:text-white hover:decoration-zinc-300"
        >
          Unlock &rarr;
        </button>
      </form>
    </main>
  );
}
