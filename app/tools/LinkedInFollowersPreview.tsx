"use client";

import { useEffect, useState } from "react";

const grotesk = { fontFamily: "var(--font-space-grotesk)" };

const FILES = ["followers_emea.csv", "followers_amer.csv", "followers_apac.csv"];

const REGIONS = ["All regions", "EMEA", "AMER", "APAC"] as const;
type Region = (typeof REGIONS)[number];

const REGION_DATA: Record<Region, { countries: { name: string; count: number; pct: number }[]; industries: { name: string; pct: string }[] }> = {
  "All regions": {
    countries: [
      { name: "Germany", count: 412, pct: 100 },
      { name: "United States", count: 348, pct: 84 },
      { name: "United Kingdom", count: 236, pct: 57 },
      { name: "Japan", count: 141, pct: 34 },
    ],
    industries: [
      { name: "Software Development", pct: "38%" },
      { name: "Industrial Automation", pct: "24%" },
      { name: "IT Services", pct: "17%" },
    ],
  },
  EMEA: {
    countries: [
      { name: "Germany", count: 412, pct: 100 },
      { name: "United Kingdom", count: 236, pct: 57 },
      { name: "France", count: 128, pct: 31 },
      { name: "Netherlands", count: 94, pct: 23 },
    ],
    industries: [
      { name: "Industrial Automation", pct: "34%" },
      { name: "Software Development", pct: "29%" },
      { name: "Manufacturing", pct: "15%" },
    ],
  },
  AMER: {
    countries: [
      { name: "United States", count: 348, pct: 100 },
      { name: "Canada", count: 112, pct: 32 },
      { name: "Brazil", count: 67, pct: 19 },
      { name: "Mexico", count: 41, pct: 12 },
    ],
    industries: [
      { name: "Software Development", pct: "46%" },
      { name: "IT Services", pct: "21%" },
      { name: "Venture Capital", pct: "12%" },
    ],
  },
  APAC: {
    countries: [
      { name: "Japan", count: 141, pct: 100 },
      { name: "Australia", count: 98, pct: 70 },
      { name: "Singapore", count: 76, pct: 54 },
      { name: "India", count: 64, pct: 45 },
    ],
    industries: [
      { name: "Robotics", pct: "31%" },
      { name: "Software Development", pct: "27%" },
      { name: "Logistics", pct: "18%" },
    ],
  },
};

// Phases: 0 idle, 1 files appear, 2 button pressed, 3 building, 4 bars grow, 5 table rows, 6+ region switching
export default function LinkedInFollowersPreview() {
  const [phase, setPhase] = useState(0);
  const [filesShown, setFilesShown] = useState(0);
  const [rowsShown, setRowsShown] = useState(0);
  const [region, setRegion] = useState<Region>("All regions");
  const [pressedRegion, setPressedRegion] = useState<Region | null>(null);

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
        setFilesShown(0);
        setRowsShown(0);
        setRegion("All regions");
        setPressedRegion(null);
        await wait(600);

        for (let i = 1; i <= FILES.length; i++) {
          if (cancelled) return;
          setFilesShown(i);
          await wait(450);
        }
        await wait(500);

        setPhase(2);
        await wait(350);

        setPhase(3);
        await wait(1400);

        setPhase(4);
        await wait(1100);

        setPhase(5);
        for (let i = 1; i <= 3; i++) {
          if (cancelled) return;
          setRowsShown(i);
          await wait(300);
        }

        setPhase(6);
        await wait(2000);

        // Cycle through region filters
        for (const r of ["EMEA", "APAC"] as Region[]) {
          if (cancelled) return;
          setPressedRegion(r);
          await wait(250);
          setPressedRegion(null);
          setRegion(r);
          await wait(2200);
        }

        setPressedRegion("All regions");
        await wait(250);
        setPressedRegion(null);
        setRegion("All regions");
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
  const data = REGION_DATA[region];

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
          localhost:8080/tools/linkedin-followers
        </span>
      </div>

      <div className="p-4 text-left">
        <p className="text-xs font-medium text-zinc-200" style={grotesk}>
          LinkedIn Followers Report
        </p>

        {/* File list */}
        <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-zinc-500" style={grotesk}>
          Followers CSV exports
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

        {/* Build report button */}
        <div
          className={`mt-3 inline-block rounded px-3 py-1 text-xs font-medium transition-all duration-200 ${
            phase === 2 ? "scale-95 bg-sky-400 text-zinc-950" : "bg-sky-500/20 text-sky-300"
          }`}
          style={grotesk}
        >
          Build report
        </div>

        {/* Loading and report share the same slot */}
        <div className="mt-3 grid">
          <div
            className={`col-start-1 row-start-1 transition-opacity duration-300 ${
              phase === 3 ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="h-1 w-full overflow-hidden rounded bg-zinc-800">
              <div
                className="h-full w-1/3 rounded bg-sky-400"
                style={{ animation: phase === 3 ? "lifollowers-scan 0.9s linear infinite" : "none" }}
              />
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">Combining 3 regions into one report…</p>
          </div>

          <div
            className={`col-start-1 row-start-1 transition-opacity duration-300 ${
              showReport ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Region filter pills */}
            <div className="mb-2.5 flex flex-wrap gap-1">
              {REGIONS.map((r) => (
                <span
                  key={r}
                  className={`rounded-full px-2 py-0.5 text-[10px] transition-all duration-200 ${
                    pressedRegion === r
                      ? "scale-95 bg-sky-400 text-zinc-950"
                      : region === r
                        ? "bg-sky-500/20 text-sky-300"
                        : "bg-zinc-800 text-zinc-500"
                  }`}
                  style={grotesk}
                >
                  {r}
                </span>
              ))}
            </div>

            <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-400" style={grotesk}>
              New followers by country
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {data.countries.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-24 shrink-0 truncate text-[10px] text-zinc-400">{c.name}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-sm bg-zinc-800">
                    <span
                      className="block h-full rounded-sm bg-sky-400 transition-all duration-700 ease-out"
                      style={{ width: showReport ? `${c.pct}%` : "0%" }}
                    />
                  </span>
                  <span className="w-8 shrink-0 text-right text-[10px] text-zinc-500">{c.count}</span>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-emerald-400" style={grotesk}>
              Followers by industry
            </p>
            <ul className="mt-1.5 space-y-1">
              {data.industries.map((ind, i) => (
                <li
                  key={i}
                  className={`flex items-baseline justify-between rounded border border-zinc-800 bg-zinc-900/80 px-2 py-1 transition-all duration-300 ${
                    i < rowsShown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                  }`}
                >
                  <span className="text-xs text-zinc-200">{ind.name}</span>
                  <span className="text-[10px] text-zinc-500">{ind.pct}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes lifollowers-scan {
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
