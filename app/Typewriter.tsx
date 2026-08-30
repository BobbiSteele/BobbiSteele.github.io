"use client";

import { useState, useEffect, useRef } from "react";

const LINES = [
  "Data analytics",
  "Performance marketing",
  "B2B SaaS",
  "MarTech Specialist",
  "Content Marketing",
];

const TYPING_SPEED = 60;
const ERASE_SPEED = 35;
const PAUSE_AFTER_TYPED = 1800;
const PAUSE_AFTER_ERASED = 400;

export default function Typewriter() {
  const [displayed, setDisplayed] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "erasing">("typing");
  const frame = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = LINES[lineIndex];

    if (phase === "typing") {
      if (displayed.length < current.length) {
        frame.current = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1));
        }, TYPING_SPEED);
      } else {
        frame.current = setTimeout(() => setPhase("erasing"), PAUSE_AFTER_TYPED);
      }
    } else if (phase === "erasing") {
      if (displayed.length > 0) {
        frame.current = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, ERASE_SPEED);
      } else {
        frame.current = setTimeout(() => {
          setLineIndex((i) => (i + 1) % LINES.length);
          setPhase("typing");
        }, PAUSE_AFTER_ERASED);
      }
    }

    return () => {
      if (frame.current) clearTimeout(frame.current);
    };
  }, [displayed, phase, lineIndex]);

  return (
    <div style={{ fontFamily: "var(--font-space-grotesk)" }}>
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
        My specialisations
      </p>

      <div className="mt-4 flex min-h-[3rem] items-center">
        <span
          className="text-2xl font-medium text-zinc-100 md:text-4xl"
          aria-live="polite"
          aria-label={displayed}
        >
          {displayed}
          <span
            className="ml-[2px] inline-block h-[1.1em] w-[2px] align-middle"
            style={{
              background: "#fff",
              animation: "blink 1.1s step-end infinite",
              borderRadius: "1px",
            }}
          />
        </span>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
