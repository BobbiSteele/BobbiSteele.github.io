"use client";

import Link from "next/link";
import { useState } from "react";

type Slide = {
  title: string;
  points: Array<{
    label: string;
    text: string;
  }>;
};

const slides: Slide[] = [
  {
    title: "What is a password manager?",
    points: [
      {
        label: "Password Manager",
        text: "A password manager securely stores and organizes your logins, so you do not need to memorize every password.",
      },
      {
        label: "Good Password Design",
        text: "Strong passwords are long, random, and unique for each account. Reuse is one of the biggest risks.",
      },
      {
        label: "Why 'Strong' Meters Can Mislead",
        text: "Many apps only run basic checks. They usually do not test against the same dictionaries, leaked password sets, or cracking strategies real attackers use.",
      },
    ],
  },
];

export default function OnePasswordPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = slides.length;
  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / totalSlides) * 100;

  const goNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const goPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_45%)]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-10 sm:px-10 sm:py-12">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Vivira Health Lab GmbH (Public Trainings)</p>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">1Password Training</h1>
          <p className="max-w-xl text-sm text-zinc-400">
            Best practices for creating and managing strong passwords with 1Password and why it matters for security.
          </p>
        </header>

        <section className="min-h-[68vh] rounded-2xl border border-white/10 bg-white/5 p-7 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur sm:p-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">
              Slide {currentSlide + 1}
            </span>
            <span className="text-sm text-zinc-400">{totalSlides} total</span>
          </div>

          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2 className="text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl md:text-7xl">
            {slide.title}
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {slide.points.map((point, index) => (
              <article
                key={point.label}
                className="rounded-xl border border-white/10 bg-zinc-900/70 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.25)]"
              >
                <div className="mb-3 inline-flex items-center gap-2">
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/10 px-2 text-xs font-semibold text-cyan-200">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold tracking-wide text-zinc-100">{point.label}</h3>
                </div>
                <p className="text-sm leading-relaxed text-zinc-300">{point.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-md border border-zinc-600 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-100 transition hover:border-zinc-400 hover:bg-zinc-800"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-md border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/20"
            >
              Next
            </button>
          </div>
        </section>

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
