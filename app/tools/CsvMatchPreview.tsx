"use client";

import { useEffect, useState } from "react";

const grotesk = { fontFamily: "var(--font-space-grotesk)" };

const SEARCH_TERM = "email";

const FILES = ["contacts.csv", "newsletter_signups.csv", "webinar_attendees.csv"];

const MATCHES = [
  { value: "anna@acme.io", count: 3, files: "contacts, newsletter, webinar" },
  { value: "jordan@orbit.dev", count: 2, files: "contacts, webinar" },
  { value: "sam@northwind.co", count: 2, files: "newsletter, webinar" },
];

// Animation phases
// 0: idle, 1: typing term, 2: files appear, 3: analyze pressed,
// 4: scanning bar, 5: results appear, 6: hold, then loop
export default function CsvMatchPreview() {
  const [phase, setPhase] = useState(0);
  const [typed, setTyped] = useState("");
  const [filesShown, setFilesShown] = useState(0);
  const [matchesShown, setMatchesShown] = useState(0);

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
        setTyped("");
        setFilesShown(0);
        setMatchesShown(0);
        await wait(700);

        for (let i = 1; i <= SEARCH_TERM.length; i++) {
          if (cancelled) return;
          setTyped(SEARCH_TERM.slice(0, i));
          await wait(140);
        }
        await wait(400);

        setPhase(2);
        for (let i = 1; i <= FILES.length; i++) {
          if (cancelled) return;
          setFilesShown(i);
          await wait(450);
        }
        await wait(500);

        setPhase(3);
        await wait(350);

        setPhase(4);
        await wait(1500);

        setPhase(5);
        for (let i = 1; i <= MATCHES.length; i++) {
          if (cancelled) return;
          setMatchesShown(i);
          await wait(350);
        }

        setPhase(6);
        await wait(3200);
      }
    }

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  const showResults = phase >= 5;

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
          localhost:8080/tools/csv-match
        </span>
      </div>

      <div className="p-3 text-left sm:p-4">
        <p className="text-xs font-medium text-zinc-200" style={grotesk}>
          CSV Cross-Match Finder
        </p>

        {/* Column input */}
        <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-zinc-500" style={grotesk}>
          Column name
        </p>
        <div className="mt-1 flex h-7 w-40 items-center rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100">
          {typed}
          {phase === 1 && <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-zinc-300" />}
        </div>

        {/* File list */}
        <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-zinc-500" style={grotesk}>
          CSV files
        </p>
        <ul className="mt-1 space-y-1">
          {FILES.map((file, i) => (
            <li
              key={file}
              className={`flex items-center gap-2 text-xs text-zinc-300 transition-all duration-300 ${
                i < filesShown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
              }`}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-sm bg-sky-400" />
              {file}
            </li>
          ))}
        </ul>

        {/* Analyze button */}
        <div
          className={`mt-3 inline-block rounded px-3 py-1 text-xs font-medium transition-all duration-200 ${
            phase === 3
              ? "scale-95 bg-sky-400 text-zinc-950"
              : "bg-sky-500/20 text-sky-300"
          }`}
          style={grotesk}
        >
          Analyze
        </div>

        {/* Scanning bar and results share the same slot */}
        <div className="mt-3 grid">
          <div
            className={`col-start-1 row-start-1 transition-opacity duration-300 ${
              phase === 4 ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="h-1 w-full overflow-hidden rounded bg-zinc-800">
              <div
                className="h-full w-1/3 rounded bg-sky-400"
                style={{ animation: phase === 4 ? "csvmatch-scan 0.9s linear infinite" : "none" }}
              />
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">Scanning columns across 3 files…</p>
          </div>

          <div
            className={`col-start-1 row-start-1 transition-opacity duration-300 ${
              showResults ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-400" style={grotesk}>
              {MATCHES.length} values matched across files
            </p>
            <ul className="mt-1.5 space-y-1">
              {MATCHES.map((m, i) => (
                <li
                  key={m.value}
                  className={`flex items-baseline justify-between rounded border border-zinc-800 bg-zinc-900/80 px-2 py-1 transition-all duration-300 ${
                    i < matchesShown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                  }`}
                >
                  <span className="text-xs text-zinc-200">{m.value}</span>
                  <span className="text-[10px] text-zinc-500">&times;{m.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes csvmatch-scan {
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
