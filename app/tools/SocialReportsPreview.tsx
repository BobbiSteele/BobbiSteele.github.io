"use client";

import { useEffect, useRef, useState } from "react";

const grotesk = { fontFamily: "var(--font-space-grotesk)" };

const FILES = ["facebook_posts.csv", "instagram_posts.csv", "linkedin_posts.csv", "x_posts.csv"];

const PLATFORMS = [
  { name: "LinkedIn", count: "148k", pct: 100 },
  { name: "Instagram", count: "96k", pct: 65 },
  { name: "Facebook", count: "61k", pct: 41 },
  { name: "X", count: "33k", pct: 22 },
];

const CONTENT_TYPES = [
  { name: "Video", count: "4.2k", pct: 100 },
  { name: "Carousel", count: "3.1k", pct: 74 },
  { name: "Image", count: "2.4k", pct: 57 },
  { name: "Text", count: "1.1k", pct: 26 },
];

const TOP_POSTS = [
  { platform: "LinkedIn", text: "Behind the scenes of our robotics lab…", imp: "18.4k", er: "6.2%" },
  { platform: "Instagram", text: "Drone footage from the field test", imp: "12.9k", er: "5.1%" },
  { platform: "Facebook", text: "Meet the team: engineering spotlight", imp: "7.3k", er: "3.8%" },
];

const HASHTAGS = [
  { tag: "#robotics", posts: 24, imp: "92k" },
  { tag: "#industrialAI", posts: 18, imp: "71k" },
  { tag: "#drones", posts: 15, imp: "48k" },
];

// Sparkline points per platform for "Impressions over time"
const TRENDS = [
  { name: "LinkedIn", color: "rgb(56 189 248)", points: "0,22 14,18 28,20 42,12 56,14 70,7 84,9 98,3" },
  { name: "Instagram", color: "rgb(232 121 249)", points: "0,26 14,24 28,21 42,22 56,17 70,18 84,13 98,11" },
  { name: "Facebook", color: "rgb(129 140 248)", points: "0,27 14,26 28,27 42,24 56,25 70,22 84,23 98,20" },
  { name: "X", color: "rgb(161 161 170)", points: "0,29 14,28 28,28 42,27 56,28 70,26 84,27 98,25" },
];

// Phases: 0 idle, 1 files appear, 2 button pressed, 3 cleaning, 4 report shown (then scrolling)
export default function SocialReportsPreview() {
  const [phase, setPhase] = useState(0);
  const [filesShown, setFilesShown] = useState(0);
  const [scrollFrac, setScrollFrac] = useState(0);
  const [scrollPx, setScrollPx] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const inner = innerRef.current;
    if (!viewport || !inner) return;
    setScrollPx(Math.max(0, inner.scrollHeight - viewport.clientHeight) * scrollFrac);
  }, [scrollFrac, phase]);

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
        setScrollFrac(0);
        await wait(600);

        for (let i = 1; i <= FILES.length; i++) {
          if (cancelled) return;
          setFilesShown(i);
          await wait(400);
        }
        await wait(500);

        setPhase(2);
        await wait(350);

        setPhase(3);
        await wait(1500);

        setPhase(4);
        await wait(2200);

        // Scroll through the long report in stages
        for (const frac of [0.35, 0.7, 1]) {
          if (cancelled) return;
          setScrollFrac(frac);
          await wait(2100);
        }

        setScrollFrac(0);
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
          localhost:8080/tools/social-reports
        </span>
      </div>

      <div className="p-4 text-left">
        <p className="text-xs font-medium text-zinc-200" style={grotesk}>
          Social Media Report Cleaner
        </p>

        {/* File list */}
        <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-zinc-500" style={grotesk}>
          Platform export CSV files
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

        {/* Clean data button */}
        <div
          className={`mt-3 inline-block rounded px-3 py-1 text-xs font-medium transition-all duration-200 ${
            phase === 2 ? "scale-95 bg-sky-400 text-zinc-950" : "bg-sky-500/20 text-sky-300"
          }`}
          style={grotesk}
        >
          Clean data
        </div>

        {/* Cleaning bar and scrolling report share the same slot */}
        <div className="mt-3 grid">
          <div
            className={`col-start-1 row-start-1 transition-opacity duration-300 ${
              phase === 3 ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="h-1 w-full overflow-hidden rounded bg-zinc-800">
              <div
                className="h-full w-1/3 rounded bg-sky-400"
                style={{ animation: phase === 3 ? "socialreports-scan 0.9s linear infinite" : "none" }}
              />
            </div>
            <p className="mt-1 text-[10px] text-zinc-500">De-duplicating snapshot rows across 4 platforms…</p>
          </div>

          {/* Scrolling report viewport */}
          <div
            ref={viewportRef}
            className={`col-start-1 row-start-1 relative h-52 overflow-hidden transition-opacity duration-300 ${
              showReport ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              ref={innerRef}
              className="transition-transform duration-[1800ms] ease-in-out"
              style={{ transform: `translateY(-${scrollPx}px)` }}
            >
              {/* Summary */}
              <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-400" style={grotesk}>
                1,248 rows cleaned into 312 posts
              </p>

              {/* Impressions by platform */}
              <p className="mt-2.5 text-[10px] uppercase tracking-[0.15em] text-zinc-500" style={grotesk}>
                Impressions by platform
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {PLATFORMS.map((p) => (
                  <li key={p.name} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 truncate text-[10px] text-zinc-400">{p.name}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-sm bg-zinc-800">
                      <span
                        className="block h-full rounded-sm bg-sky-400 transition-all duration-700 ease-out"
                        style={{ width: showReport ? `${p.pct}%` : "0%" }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-right text-[10px] text-zinc-500">{p.count}</span>
                  </li>
                ))}
              </ul>

              {/* Impressions over time */}
              <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-zinc-500" style={grotesk}>
                Impressions over time
              </p>
              <svg viewBox="0 0 98 30" className="mt-1.5 h-12 w-full" preserveAspectRatio="none">
                {TRENDS.map((t) => (
                  <polyline
                    key={t.name}
                    points={t.points}
                    fill="none"
                    stroke={t.color}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ))}
              </svg>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                {TRENDS.map((t) => (
                  <span key={t.name} className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <span className="inline-block h-0.5 w-3 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </span>
                ))}
              </div>

              {/* Avg impressions by content type */}
              <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-zinc-500" style={grotesk}>
                Avg impressions by content type
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {CONTENT_TYPES.map((t) => (
                  <li key={t.name} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 truncate text-[10px] text-zinc-400">{t.name}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-sm bg-zinc-800">
                      <span className="block h-full rounded-sm bg-emerald-400/80" style={{ width: `${t.pct}%` }} />
                    </span>
                    <span className="w-8 shrink-0 text-right text-[10px] text-zinc-500">{t.count}</span>
                  </li>
                ))}
              </ul>

              {/* Top posts */}
              <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-zinc-500" style={grotesk}>
                Top performing posts
              </p>
              <ul className="mt-1.5 space-y-1">
                {TOP_POSTS.map((post) => (
                  <li
                    key={post.text}
                    className="flex items-baseline gap-2 rounded border border-zinc-800 bg-zinc-900/80 px-2 py-1"
                  >
                    <span className="w-14 shrink-0 text-[10px] text-sky-300">{post.platform}</span>
                    <span className="min-w-0 flex-1 truncate text-xs text-zinc-200">{post.text}</span>
                    <span className="shrink-0 text-[10px] text-zinc-500">{post.imp}</span>
                    <span className="shrink-0 text-[10px] text-emerald-400">{post.er}</span>
                  </li>
                ))}
              </ul>

              {/* Top hashtags */}
              <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-zinc-500" style={grotesk}>
                Top hashtags
              </p>
              <ul className="mt-1.5 space-y-1">
                {HASHTAGS.map((h) => (
                  <li
                    key={h.tag}
                    className="flex items-baseline justify-between rounded border border-zinc-800 bg-zinc-900/80 px-2 py-1"
                  >
                    <span className="text-xs text-sky-300">{h.tag}</span>
                    <span className="text-[10px] text-zinc-500">
                      {h.posts} posts &middot; {h.imp} impressions
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom fade to hint there is more to scroll */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-zinc-950 to-transparent" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes socialreports-scan {
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
