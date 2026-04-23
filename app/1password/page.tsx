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

  const goNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const goPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-20 sm:px-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">Project</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">1Password</h1>
          <p className="max-w-xl text-zinc-300">Slideshow overview for password security.</p>
        </header>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6">
          <div className="mb-4 text-sm text-zinc-400">
            Slide {currentSlide + 1} of {totalSlides}
          </div>
          <h2 className="text-2xl font-semibold text-white">{slide.title}</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 text-zinc-200">
            {slide.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-100 transition hover:bg-zinc-800"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={goNext}
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-100 transition hover:bg-zinc-800"
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
