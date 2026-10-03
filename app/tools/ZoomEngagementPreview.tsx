"use client";

import { useEffect, useState } from "react";

const grotesk = { fontFamily: "var(--font-space-grotesk)" };

const SLOTS = [
  { label: "Attendee report", file: "attendee_report.csv" },
  { label: "Poll report", file: "poll_report.csv" },
  { label: "Q&A report", file: "qa_report.csv" },
];

const POLL_QUESTION = "Which topic should our next webinar cover?";

const ROWS = [
  {
    name: "Anna Meyer",
    email: "anna@acme.io",
    poll: "API integrations",
    qa: {
      q: "How does the API handle rate limits?",
      a: "100 requests/min, then exponential backoff",
    },
  },
  { name: "Jordan Lee", email: "jordan@orbit.dev", poll: "Security & SSO", qa: null },
  {
    name: "Sam Price",
    email: "sam@northwind.co",
    poll: null,
    qa: { q: "Is SSO included in the base plan?", a: "Yes, on all plans including starter" },
  },
  {
    name: "Priya Nair",
    email: "priya@vektor.ai",
    poll: "Live dashboards",
    qa: { q: "Can reports be exported via the API?", a: "Yes — CSV and JSON export endpoints" },
  },
];

// Phases: 0 idle, 1 slots fill, 2 button pressed, 3 building, 4 rows appear, 5+ filter toggling
export default function ZoomEngagementPreview() {
  const [phase, setPhase] = useState(0);
  const [slotsShown, setSlotsShown] = useState(0);
  const [rowsShown, setRowsShown] = useState(0);
  const [qaOnly, setQaOnly] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    async function run() {
      while (!cancelled) {
        setPhase(1);
        setSlotsShown(0);
        setRowsShown(0);
        setQaOnly(false);
        setPressed(false);
        await wait(600);

        for (let i = 1; i <= SLOTS.length; i++) {
          if (cancelled) return;
          setSlotsShown(i);
          await wait(500);
        }
        await wait(500);

        setPhase(2);
        await wait(350);

        setPhase(3);
        await wait(1400);

        setPhase(4);
        for (let i = 1; i <= ROWS.length; i++) {
          if (cancelled) return;
          setRowsShown(i);
          await wait(350);
        }

        setPhase(5);
        await wait(2200);

        // Toggle the Q&A only filter on, then off
        setPressed(true);
        await wait(250);
        setPressed(false);
        setQaOnly(true);
        await wait(2400);

        setPressed(true);
        await wait(250);
        setPressed(false);
        setQaOnly(false);
        await wait(2600);
      }
    }

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  const showReport = phase >= 4;
  const visibleRows = qaOnly ? ROWS.filter((r) => r.qa) : ROWS;

  return (
    <div
      aria-hidden
      className="pointer-events-none select-none overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
    >
      {/* Mock browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 bg-zinc-900 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-zinc-700" />
        <span className="h-2 w-2 rounded-full bg-zinc-700" />
        <span className="h-2 w-2 rounded-full bg-zinc-700" />
        <span className="ml-3 rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500" style={grotesk}>
          localhost:8080/tools/zoom-engagement
        </span>
      </div>

      <div className="p-3 text-left sm:p-4">
        <p className="text-xs font-medium text-zinc-200" style={grotesk}>
          Zoom Engagement Report
        </p>

        {/* Labeled file slots */}
        <div className="mt-3 space-y-1.5">
          {SLOTS.map((slot, i) => (
            <div key={slot.label} className="flex items-center gap-2">
              <span
                className="w-24 shrink-0 text-[10px] uppercase tracking-[0.1em] text-zinc-500"
                style={grotesk}
              >
                {slot.label}
              </span>
              <div className="flex h-6 flex-1 items-center overflow-hidden rounded border border-zinc-700 bg-zinc-900 px-2">
                <span
                  className={`flex min-w-0 items-center gap-1.5 truncate text-[11px] text-zinc-300 transition-all duration-300 ${
                    i < slotsShown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                  }`}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-sm bg-sky-400" />
                  {slot.file}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Build report button */}
        <div
          className={`mt-3 inline-block rounded px-3 py-1 text-xs font-medium transition-all duration-200 ${
            phase === 2 ? "scale-95 bg-sky-400 text-zinc-950" : "bg-sky-500/20 text-sky-300"
          }`}
          style={grotesk}
        >
          Build report
        </div>

        {/* Building bar and report share the same slot */}
        <div className="mt-3 grid">
          <div
            className={`col-start-1 row-start-1 transition-opacity duration-300 ${
              phase === 3 ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="h-1 w-full overflow-hidden rounded bg-zinc-800">
              <div
                className="h-full w-1/3 rounded bg-sky-400"
                style={{ animation: phase === 3 ? "zoomeng-scan 0.9s linear infinite" : "none" }}
              />
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">Matching polls and Q&amp;A to attendees…</p>
          </div>

          <div
            className={`col-start-1 row-start-1 transition-opacity duration-300 ${
              showReport ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Toolbar */}
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.15em] text-emerald-400" style={grotesk}>
                {visibleRows.length} of {ROWS.length} attendees engaged
              </span>
              <span
                className={`ml-auto rounded-full px-2 py-0.5 text-[10px] transition-all duration-200 ${
                  pressed
                    ? "scale-95 bg-sky-400 text-zinc-950"
                    : qaOnly
                      ? "bg-sky-500/20 text-sky-300"
                      : "bg-zinc-800 text-zinc-500"
                }`}
                style={grotesk}
              >
                Q&amp;A only
              </span>
            </div>

            <p className="mb-2 truncate text-[10px] text-zinc-500">
              Poll: &ldquo;{POLL_QUESTION}&rdquo;
            </p>

            {/* Attendee rows */}
            <ul className="space-y-1">
              {visibleRows.map((row) => {
                const i = ROWS.indexOf(row);
                return (
                  <li
                    key={row.email}
                    className={`rounded border border-zinc-800 bg-zinc-900/80 px-2 py-1 transition-all duration-300 ${
                      i < rowsShown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs text-zinc-200">{row.name}</span>
                      <span className="truncate text-[10px] text-zinc-500">{row.email}</span>
                    </div>
                    {row.poll && (
                      <div className="mt-0.5">
                        <span className="rounded bg-emerald-500/15 px-1.5 py-px text-[10px] text-emerald-300">
                          Poll answer: {row.poll}
                        </span>
                      </div>
                    )}
                    {row.qa && (
                      <div className="mt-0.5 space-y-0.5">
                        <p className="truncate rounded bg-sky-500/15 px-1.5 py-px text-[10px] text-sky-300">
                          Q: {row.qa.q}
                        </p>
                        <p className="truncate rounded bg-zinc-800/80 px-1.5 py-px text-[10px] text-zinc-400">
                          A: {row.qa.a}
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes zoomeng-scan {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}
