"use client";

import { useEffect, useState } from "react";

const grotesk = { fontFamily: "var(--font-space-grotesk)" };

const INSTRUCTION = "Clean this dataset";

const DIRTY_ROWS = [
  { name: "  anna meyer ", date: "2024-03-14", revenue: "1200" },
  { name: "Jordan Lee", date: "14/03/2024", revenue: "N/A" },
  { name: "Jordan Lee", date: "14/03/2024", revenue: "N/A" },
  { name: "Sam Price", date: "ERROR", revenue: "950" },
];

const CLEAN_ROWS = [
  { name: "Anna Meyer", date: "2024-03-14", revenue: "1200" },
  { name: "Jordan Lee", date: "2024-03-14", revenue: "NaN" },
  { name: "Sam Price", date: "NaT", revenue: "950" },
];

const CODE_LINES = [
  "df = df.drop_duplicates()",
  "df['name'] = df['name'].str.strip().str.title()",
  "df['date'] = pd.to_datetime(df['date'], errors='coerce')",
];

// Phases: 0 idle, 1 file + dirty table, 2 typing instruction, 3 send pressed,
// 4 generating code, 5 code lines, 6 cleaned table, 7 hold
export default function DataCleaningPreview() {
  const [phase, setPhase] = useState(0);
  const [typed, setTyped] = useState("");
  const [codeShown, setCodeShown] = useState(0);

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
        setCodeShown(0);
        await wait(1400);

        setPhase(2);
        for (let i = 1; i <= INSTRUCTION.length; i++) {
          if (cancelled) return;
          setTyped(INSTRUCTION.slice(0, i));
          await wait(70);
        }
        await wait(400);

        setPhase(3);
        await wait(350);

        setPhase(4);
        await wait(1400);

        setPhase(5);
        for (let i = 1; i <= CODE_LINES.length; i++) {
          if (cancelled) return;
          setCodeShown(i);
          await wait(450);
        }
        await wait(800);

        setPhase(6);
        await wait(3600);
      }
    }

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  const cleaned = phase >= 6;
  const rows = cleaned ? CLEAN_ROWS : DIRTY_ROWS;

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
          /Data-cleaning-bot
        </span>
      </div>

      <div className="p-3 text-left sm:p-4">
        <p className="text-xs font-medium text-zinc-200" style={grotesk}>
          Data Cleaning Bot
        </p>

        {/* Loaded file */}
        <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-zinc-500" style={grotesk}>
          Loaded CSV
        </p>
        <p className="mt-1 flex items-center gap-2 text-xs text-zinc-300">
          <span className="inline-block h-1.5 w-1.5 rounded-sm bg-sky-400" />
          customers_raw.csv
          <span className="text-[10px] text-zinc-500">{cleaned ? "3 rows" : "4 rows"}</span>
        </p>

        {/* Data table */}
        <div className="mt-2 overflow-hidden rounded border border-zinc-800">
          <table className="w-full border-collapse text-[10px]">
            <thead>
              <tr className="bg-zinc-900 text-zinc-500">
                <th className="px-2 py-1 text-left font-normal">name</th>
                <th className="px-2 py-1 text-left font-normal">date</th>
                <th className="px-2 py-1 text-right font-normal">revenue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const dirty = !cleaned && (i === 2 || row.revenue === "N/A" || row.date === "ERROR" || row.name !== row.name.trim());
                return (
                  <tr
                    key={`${cleaned}-${i}`}
                    className={`border-t border-zinc-800 transition-colors duration-500 ${
                      cleaned ? "bg-emerald-500/5 text-zinc-300" : dirty ? "bg-red-500/5 text-zinc-400" : "text-zinc-400"
                    }`}
                  >
                    <td className="px-2 py-1 whitespace-pre">{row.name}</td>
                    <td className={`px-2 py-1 ${!cleaned && (row.date === "ERROR" || row.date === "14/03/2024") ? "text-red-400/80" : ""}`}>
                      {row.date}
                    </td>
                    <td className={`px-2 py-1 text-right ${!cleaned && row.revenue === "N/A" ? "text-red-400/80" : ""}`}>
                      {row.revenue}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Chat input */}
        <div className="mt-3 flex items-center gap-1.5">
          <div className="flex h-7 flex-1 items-center rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100">
            {typed || <span className="text-zinc-600">Tell the bot what to clean…</span>}
            {phase === 2 && <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-zinc-300" />}
          </div>
          <div
            className={`rounded px-3 py-1 text-xs font-medium transition-all duration-200 ${
              phase === 3 ? "scale-95 bg-sky-400 text-zinc-950" : "bg-sky-500/20 text-sky-300"
            }`}
            style={grotesk}
          >
            Send
          </div>
        </div>

        {/* Generating bar, code, and result summary share the same slot */}
        <div className="mt-3 grid">
          <div
            className={`col-start-1 row-start-1 transition-opacity duration-300 ${
              phase === 4 ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="h-1 w-full overflow-hidden rounded bg-zinc-800">
              <div
                className="h-full w-1/3 rounded bg-sky-400"
                style={{ animation: phase === 4 ? "datacleaning-scan 0.9s linear infinite" : "none" }}
              />
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">Groq is writing pandas code…</p>
          </div>

          <div
            className={`col-start-1 row-start-1 transition-opacity duration-300 ${
              phase >= 5 ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="rounded border border-zinc-800 bg-zinc-900/80 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-zinc-400">
              {CODE_LINES.map((line, i) => (
                <p
                  key={line}
                  className={`truncate transition-all duration-300 ${
                    i < codeShown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                  }`}
                >
                  <span className="text-sky-300/80">&gt;&gt;&gt;</span> {line}
                </p>
              ))}
            </div>
            <p
              className={`mt-1.5 text-[10px] uppercase tracking-[0.15em] text-emerald-400 transition-opacity duration-300 ${
                cleaned ? "opacity-100" : "opacity-0"
              }`}
              style={grotesk}
            >
              Duplicates removed, names fixed, types coerced
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes datacleaning-scan {
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
