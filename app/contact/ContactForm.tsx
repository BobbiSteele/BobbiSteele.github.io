"use client";

import { useState } from "react";

// Web3Forms access key — emails go to info@bobbisteele.com.
// Set locally in .env.local and in CI via the WEB3FORMS_KEY repo secret.
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: silently drop bot submissions
    if (data.get("botcheck")) return;

    setStatus("sending");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: data.get("subject"),
          email: data.get("email"),
          message: data.get("message"),
          from_name: "bobbisteele.com contact form",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputClasses =
    "w-full border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-100 placeholder-zinc-600 outline-none transition focus:border-zinc-500";

  if (status === "sent") {
    return (
      <p className="mt-16 max-w-xl text-zinc-300">
        Message sent — thanks for reaching out. I&rsquo;ll get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-16 max-w-xl space-y-6">
      {/* Honeypot field — hidden from humans */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-400"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Your email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className={inputClasses}
        />
      </div>

      <div>
        <label
          htmlFor="subject"
          className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-400"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          placeholder="What's this about?"
          className={inputClasses}
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-xs uppercase tracking-[0.25em] text-zinc-400"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={8}
          placeholder="Write your message…"
          className={`${inputClasses} resize-y`}
        />
      </div>

      <div className="flex items-center gap-6">
        <button
          type="submit"
          disabled={status === "sending"}
          className="border border-zinc-100 px-8 py-3 text-sm uppercase tracking-[0.25em] text-zinc-100 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {status === "sending" ? "Sending…" : "Send"}
        </button>
        {status === "error" && (
          <p className="text-sm text-red-400">
            Something went wrong. Please try again or email info@bobbisteele.com directly.
          </p>
        )}
      </div>
    </form>
  );
}
