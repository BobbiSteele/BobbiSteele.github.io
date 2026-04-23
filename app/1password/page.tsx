"use client";

import Link from "next/link";
import { useState } from "react";

type Slide = {
  title: string;
  points: string[];
};

const slides: Slide[] = [
  {
    title: "What is a password manager?",
    points: [
      "A password manager stores and organizes your passwords securely so you do not need to memorize every login.",
      "A good password uses length, randomness, and uniqueness for every account.",
      "Many apps that label a password as strong use basic checks only. They often do not have access to the same dictionaries, breach data, or cracking tools attackers use, so a 'strong' label may still be misleading.",
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

      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-16 sm:px-10 sm:py-20">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Project Spotlight</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">1Password</h1>
          <p className="max-w-2xl text-zinc-300">
            A clean, presentation-style walkthrough of password basics and common strength checker misconceptions.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur sm:p-8">
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

          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{slide.title}</h2>
          <ul className="mt-5 list-disc space-y-4 pl-6 text-zinc-200 marker:text-cyan-300">
            {slide.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

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
