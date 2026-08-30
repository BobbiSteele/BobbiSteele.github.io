"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// Pyodide is loaded at runtime from the CDN, so it has no bundled types.
type PyodideInterface = {
  loadPackage: (names: string | string[]) => Promise<void>;
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: {
    set: (name: string, value: unknown) => void;
    get: (name: string) => unknown;
  };
};

declare global {
  interface Window {
    loadPyodide?: (config?: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

const PYODIDE_VERSION = "0.27.2";
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const DASHBOARD_CSV_KEY = "dcb_dashboard_csv";
const DASHBOARD_NAME_KEY = "dcb_dashboard_name";

// Groq (shared key with the Data Cleaning Bot).
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
const GROQ_KEY_STORAGE = "dcb_groq_api_key";

const CHART_TYPES = ["bar", "line", "scatter", "pie", "histogram"] as const;
type ChartType = (typeof CHART_TYPES)[number];

const CHART_SYSTEM_PROMPT = [
  "You are a data-visualization expert.",
  "Given a dataset schema, suggest the 3-6 most insightful charts for exploring the data.",
  "Respond with ONLY a JSON object of the form:",
  '{"charts": [{"type": "bar|line|scatter|pie|histogram", "title": "short title", "x": "column name", "y": "column name or null", "agg": "count|sum|mean or null", "reason": "one short sentence on why this chart suits the data"}]}',
  "Guidance:",
  "- histogram: x must be a numeric column with many unique values (continuous or wide range); never use for discrete/binary columns.",
  "- scatter: x and y must both be numeric columns with continuous ranges; never use for discrete or binary columns.",
  "- bar / pie: x is categorical or discrete (including binary 0/1 columns); optionally set y to a numeric column with agg sum or mean, otherwise agg is count.",
  "- line: x is an ordered/categorical/date column and y is a numeric column with agg sum or mean.",
  "- IMPORTANT: Columns marked 'discrete' or 'binary' in the schema are low-cardinality and should ONLY use bar or pie charts, never histogram or scatter.",
  "- Only reference column names that exist in the schema. Prefer variety across the suggestions.",
  "- Write each title in plain, everyday language a non-technical person understands. Use phrases like 'Total revenue by platform' or 'Distribution across regions', never raw aggregation jargon.",
  "- Return ONLY the JSON object, with no markdown fences or extra text.",
].join("\n");

const INSIGHTS_SYSTEM_PROMPT = [
  "You are a data analyst. You are given one chart specification and its underlying aggregated data.",
  "Write a concise, plain-language analysis (3-5 short sentences or bullet points).",
  "Call out notable patterns: the largest/smallest values, trends, outliers, skew, concentration, or anything surprising.",
  "Refer to the actual column names and values. Do not invent data that is not present.",
  "Plain text only — no markdown headings or code fences.",
].join("\n");

const EDIT_AGENT_SYSTEM_PROMPT = [
  "You are a data-editing assistant.",
  "A pandas DataFrame named `df` is already loaded in the runtime, along with pandas as `pd` and numpy as `np`.",
  "The user gives an instruction to edit or transform the dataset that powers their charts.",
  "Respond with ONLY a JSON object of the form:",
  '{"code": "<python code that reassigns the edited DataFrame to the variable df>", "explanation": "<short plain-language summary of what you changed>"}',
  "Rules:",
  "- Use only pandas (pd) and numpy (np). Do NOT import other libraries, read files, or access the network.",
  "- The code MUST assign the resulting DataFrame back to a variable named `df`.",
  "- Handle dirty data defensively so the code never raises. When converting types, ALWAYS use error-tolerant parsing: pd.to_numeric(..., errors='coerce') and pd.to_datetime(..., errors='coerce') (no strict format=). Invalid values become NaN/NaT.",
  "- Keep the code concise and do not print anything.",
  "- Return ONLY the JSON object, with no markdown fences or extra text.",
].join("\n");

type ChartSpec = {
  type: ChartType;
  title: string;
  x: string;
  y?: string | null;
  agg?: "count" | "sum" | "mean" | null;
  reason: string;
};

type ChartData =
  | { type: "bar" | "pie" | "line"; series: { label: string; value: number }[] }
  | { type: "scatter"; points: { x: number; y: number }[]; xLabel: string; yLabel: string }
  | { type: "histogram"; bins: { label: string; count: number }[] }
  | { error: string };

type Suggestion = { spec: ChartSpec; data: ChartData };

// Decide whether a chart type can actually be built from the dataset, so we can
// disable impossible options before the user picks them. This looks at the
// columns AVAILABLE in the dataset (not just the chart's current x/y), since
// switching type can reassign columns. Mirrors the rules in PY_CHART_DATA.
function chartTypeFeasible(
  spec: ChartSpec,
  type: ChartType,
  numericCols: string[],
): boolean {
  if (type === "histogram") {
    // Need at least one numeric column (the current x, or any other).
    return numericCols.includes(spec.x) || numericCols.length >= 1;
  }
  if (type === "scatter") {
    // Need two numeric columns to plot against each other.
    return numericCols.length >= 2;
  }
  // bar / pie / line fall back to counting categories, so any existing x works.
  return true;
}

// Reassign a spec's columns so the chosen type can actually render, picking
// sensible numeric columns from the dataset when needed.
function repairSpecForType(
  spec: ChartSpec,
  type: ChartType,
  numericCols: string[],
): ChartSpec {
  const next: ChartSpec = { ...spec, type };
  if (type === "histogram") {
    if (!numericCols.includes(next.x)) next.x = numericCols[0] ?? next.x;
    next.y = null;
    next.agg = null;
  } else if (type === "scatter") {
    // Keep the current x if it's numeric; otherwise use the first numeric column.
    if (!numericCols.includes(next.x)) next.x = numericCols[0] ?? next.x;
    // Pick a numeric y different from x.
    if (!next.y || !numericCols.includes(next.y) || next.y === next.x) {
      next.y = numericCols.find((c) => c !== next.x) ?? next.y ?? null;
    }
  }
  return next;
}

function extractJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

type NumericSummary = {
  column: string;
  count: number;
  mean: number;
  min: number;
  max: number;
  missing: number;
  unique: number;
  histogram: { bins: { label: string; count: number }[] };
};

type CategorySummary = {
  column: string;
  unique: number;
  top: { label: string; count: number }[];
};

type Dashboard = {
  rows: number;
  cols: number;
  columns: string[];
  numeric: NumericSummary[];
  categorical: CategorySummary[];
};

export default function DashboardGeneratorPage() {
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [statusMessage, setStatusMessage] = useState("Initializing Python environment…");
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI-suggested charts (Groq).
  const [groqKey, setGroqKey] = useState("");
  const [model, setModel] = useState(GROQ_MODELS[0]);
  const [suggestBusy, setSuggestBusy] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [focused, setFocused] = useState<number | null>(null);

  // AI insights about a focused chart.
  const [insights, setInsights] = useState<Record<number, string>>({});
  const [insightBusyIdx, setInsightBusyIdx] = useState<number | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);

  // Manually changing a chart's type (recomputes that chart's data).
  const [typeChangeBusy, setTypeChangeBusy] = useState(false);

  // Recomputing a single chart's data from its existing spec.
  const [regenBusyIdx, setRegenBusyIdx] = useState<number | null>(null);

  // Asking the AI to edit the underlying dataset (focus mode).
  const [editPrompt, setEditPrompt] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editNote, setEditNote] = useState<string | null>(null);

  // Load Pyodide + pandas once on mount.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setStatus("loading");
        setStatusMessage("Loading Pyodide runtime…");

        if (!window.loadPyodide) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `${PYODIDE_INDEX_URL}pyodide.js`;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Pyodide script."));
            document.head.appendChild(script);
          });
        }

        if (cancelled || !window.loadPyodide) return;

        const pyodide = await window.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
        if (cancelled) return;

        setStatusMessage("Loading pandas…");
        await pyodide.loadPackage("pandas");
        if (cancelled) return;

        pyodideRef.current = pyodide;
        setStatus("ready");
        setStatusMessage("Ready — pandas is running in your browser.");
      } catch (err) {
        if (cancelled) return;
        setStatus("idle");
        setError(err instanceof Error ? err.message : "Failed to initialize Python environment.");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Pick up the cleaned CSV handed over from the Data Cleaning Bot.
  useEffect(() => {
    const csv = window.sessionStorage.getItem(DASHBOARD_CSV_KEY);
    const name = window.sessionStorage.getItem(DASHBOARD_NAME_KEY);
    // Reading from sessionStorage must happen after mount to avoid an SSR
    // hydration mismatch in the static export.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (csv) setCsvText(csv);
    if (name) setFileName(name);
  }, []);

  // Restore the Groq key from localStorage on mount, and persist changes.
  useEffect(() => {
    const saved = window.localStorage.getItem(GROQ_KEY_STORAGE);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setGroqKey(saved);
  }, []);

  useEffect(() => {
    if (groqKey) window.localStorage.setItem(GROQ_KEY_STORAGE, groqKey);
    else window.localStorage.removeItem(GROQ_KEY_STORAGE);
  }, [groqKey]);

  const handleFile = useCallback((file: File) => {
    setError(null);
    setDashboard(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCsvText(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => setError("Could not read the selected file.");
    reader.readAsText(file);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const generate = useCallback(async () => {
    const pyodide = pyodideRef.current;
    if (!pyodide || csvText == null) return;

    setBusy(true);
    setError(null);
    try {
      pyodide.globals.set("csv_input", csvText);
      const raw = (await pyodide.runPythonAsync(PY_DASHBOARD)) as string;
      const parsed = JSON.parse(raw) as Dashboard & { error?: string };
      if (parsed.error) {
        setError(parsed.error);
        return;
      }
      setDashboard(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate dashboard.");
    } finally {
      setBusy(false);
    }
  }, [csvText]);

  // Auto-generate once everything is ready and a CSV is present.
  useEffect(() => {
    if (status === "ready" && csvText && !dashboard && !busy) {
      generate();
    }
  }, [status, csvText, dashboard, busy, generate]);

  // Ask Groq which charts best fit the data, then compute their data in pandas.
  const suggestCharts = useCallback(async () => {
    const pyodide = pyodideRef.current;
    if (!pyodide || !dashboard || csvText == null) return;
    if (!groqKey.trim()) {
      setSuggestError("Enter your Groq API key to get chart suggestions.");
      return;
    }

    setSuggestBusy(true);
    setSuggestError(null);
    try {
      const schema = {
        rows: dashboard.rows,
        columns: [
          ...dashboard.numeric.map((n) => {
            // Treat low-cardinality numeric columns as discrete/categorical
            const isDiscrete = n.unique <= 10;
            return {
              name: n.column,
              type: isDiscrete ? ("discrete" as const) : ("numeric" as const),
              unique: n.unique,
            };
          }),
          ...dashboard.categorical.map((c) => ({ name: c.column, type: "categorical" as const })),
        ],
      };

      const messages = [
        { role: "system", content: CHART_SYSTEM_PROMPT },
        { role: "user", content: `Dataset schema (JSON):\n${JSON.stringify(schema)}` },
      ];

      const res = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey.trim()}`,
        },
        body: JSON.stringify({ model, temperature: 0.3, messages }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Groq API error (${res.status}): ${txt.slice(0, 300)}`);
      }

      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content ?? "";
      const parsed = extractJson<{ charts: ChartSpec[] }>(content);
      const specs = (parsed?.charts ?? []).filter(
        (c) => c && CHART_TYPES.includes(c.type) && typeof c.x === "string",
      );
      if (specs.length === 0) throw new Error("The model did not suggest any usable charts.");

      pyodide.globals.set("csv_input", csvText);
      pyodide.globals.set("chart_specs", JSON.stringify(specs));
      const raw = (await pyodide.runPythonAsync(PY_CHART_DATA)) as string;
      const computed = JSON.parse(raw) as ChartData[];

      const next: Suggestion[] = specs.map((spec, i) => ({
        spec,
        data: computed[i] ?? { error: "No data computed." },
      }));
      setSuggestions(next);
      setFocused(null);
      setInsights({});
      setInsightError(null);
    } catch (err) {
      setSuggestError(err instanceof Error ? err.message : "Failed to get chart suggestions.");
    } finally {
      setSuggestBusy(false);
    }
  }, [dashboard, csvText, groqKey, model]);

  // Ask Groq what it thinks about the data behind a specific chart.
  const analyzeChart = useCallback(
    async (index: number) => {
      const suggestion = suggestions[index];
      if (!suggestion || "error" in suggestion.data) return;
      if (!groqKey.trim()) {
        setInsightError("Enter your Groq API key to get insights.");
        return;
      }

      setInsightBusyIdx(index);
      setInsightError(null);
      try {
        const { spec, data } = suggestion;
        // Build a compact, size-bounded payload of the chart's data.
        let payload: unknown = data;
        if (data.type === "scatter") {
          payload = {
            type: "scatter",
            xLabel: data.xLabel,
            yLabel: data.yLabel,
            points: data.points.slice(0, 100),
          };
        }

        const messages = [
          { role: "system", content: INSIGHTS_SYSTEM_PROMPT },
          {
            role: "user",
            content:
              `Chart: ${JSON.stringify(spec)}\n` +
              `Underlying data: ${JSON.stringify(payload)}\n\n` +
              `What does this chart reveal about the data?`,
          },
        ];

        const res = await fetch(GROQ_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey.trim()}`,
          },
          body: JSON.stringify({ model, temperature: 0.4, messages }),
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Groq API error (${res.status}): ${txt.slice(0, 300)}`);
        }

        const json = await res.json();
        const content: string = json?.choices?.[0]?.message?.content ?? "";
        setInsights((prev) => ({ ...prev, [index]: content.trim() || "No insights returned." }));
      } catch (err) {
        setInsightError(err instanceof Error ? err.message : "Failed to get insights.");
      } finally {
        setInsightBusyIdx(null);
      }
    },
    [suggestions, groqKey, model],
  );

  // Manually switch a chart to a different visualization type and recompute its
  // data locally with pandas (no AI call needed).
  const changeChartType = useCallback(
    async (index: number, newType: ChartType) => {
      const pyodide = pyodideRef.current;
      const current = suggestions[index];
      if (!pyodide || csvText == null || !current) return;
      if (current.spec.type === newType) return;

      setTypeChangeBusy(true);
      setSuggestError(null);
      try {
        const cols = dashboard?.numeric.map((n) => n.column) ?? [];
        // Reassign columns so the chosen type can actually render (e.g. a
        // scatter gets two numeric columns even if the original chart used a
        // categorical x).
        const newSpec = repairSpecForType(current.spec, newType, cols);
        pyodide.globals.set("csv_input", csvText);
        pyodide.globals.set("chart_specs", JSON.stringify([newSpec]));
        const raw = (await pyodide.runPythonAsync(PY_CHART_DATA)) as string;
        const computed = JSON.parse(raw) as ChartData[];
        const data = computed[0] ?? { error: "No data computed." };

        setSuggestions((prev) =>
          prev.map((s, i) => (i === index ? { spec: newSpec, data } : s)),
        );
        // The chart changed, so any prior AI insight no longer applies.
        setInsights((prev) => {
          const copy = { ...prev };
          delete copy[index];
          return copy;
        });
      } catch (err) {
        setSuggestError(
          err instanceof Error ? err.message : "Failed to change the chart type.",
        );
      } finally {
        setTypeChangeBusy(false);
      }
    },
    [suggestions, csvText, dashboard],
  );

  // Recompute a single chart's data from its existing spec — useful when a
  // chart shows a transient error or looks wrong.
  const regenerateChart = useCallback(
    async (index: number) => {
      const pyodide = pyodideRef.current;
      const current = suggestions[index];
      if (!pyodide || csvText == null || !current) return;

      setRegenBusyIdx(index);
      setSuggestError(null);
      try {
        pyodide.globals.set("csv_input", csvText);
        pyodide.globals.set("chart_specs", JSON.stringify([current.spec]));
        const raw = (await pyodide.runPythonAsync(PY_CHART_DATA)) as string;
        const computed = JSON.parse(raw) as ChartData[];
        const data = computed[0] ?? { error: "No data computed." };

        setSuggestions((prev) =>
          prev.map((s, i) => (i === index ? { ...s, data } : s)),
        );
        // The underlying data may have changed, so drop any stale AI insight.
        setInsights((prev) => {
          const copy = { ...prev };
          delete copy[index];
          return copy;
        });
      } catch (err) {
        setSuggestError(
          err instanceof Error ? err.message : "Failed to regenerate the chart.",
        );
      } finally {
        setRegenBusyIdx(null);
      }
    },
    [suggestions, csvText],
  );

  // Ask the AI to edit the underlying dataset, then refresh the profile and all
  // existing charts from the edited data.
  const applyDataEdit = useCallback(async () => {
    const pyodide = pyodideRef.current;
    const instruction = editPrompt.trim();
    if (!pyodide || csvText == null || !dashboard || !instruction) return;
    if (!groqKey.trim()) {
      setEditError("Enter your Groq API key to edit the data.");
      return;
    }

    setEditBusy(true);
    setEditError(null);
    setEditNote(null);
    try {
      const schema = {
        rows: dashboard.rows,
        columns: [
          ...dashboard.numeric.map((n) => {
            // Treat low-cardinality numeric columns as discrete/categorical
            const isDiscrete = n.unique <= 10;
            return {
              name: n.column,
              type: isDiscrete ? ("discrete" as const) : ("numeric" as const),
              unique: n.unique,
            };
          }),
          ...dashboard.categorical.map((c) => ({ name: c.column, type: "categorical" as const })),
        ],
      };

      const messages = [
        { role: "system", content: EDIT_AGENT_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Dataset schema (JSON):\n${JSON.stringify(schema)}\n\nInstruction: ${instruction}`,
        },
      ];

      const res = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey.trim()}`,
        },
        body: JSON.stringify({ model, temperature: 0.2, messages }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Groq API error (${res.status}): ${txt.slice(0, 300)}`);
      }

      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content ?? "";
      const parsed = extractJson<{ code?: string; explanation?: string }>(content);
      if (!parsed?.code) throw new Error("The model did not return runnable code.");

      // Apply the edit to the dataset.
      pyodide.globals.set("csv_input", csvText);
      pyodide.globals.set("agent_code", parsed.code);
      const editRaw = (await pyodide.runPythonAsync(PY_EDIT_EXEC)) as string;
      const editOut = JSON.parse(editRaw) as
        | { ok: true; csv: string; rows: number; cols: number }
        | { ok: false; error: string };
      if (!editOut.ok) throw new Error(editOut.error);

      const newCsv = editOut.csv;
      setCsvText(newCsv);

      // Re-profile the edited dataset.
      pyodide.globals.set("csv_input", newCsv);
      const dashRaw = (await pyodide.runPythonAsync(PY_DASHBOARD)) as string;
      const newDash = JSON.parse(dashRaw) as Dashboard & { error?: string };
      if (newDash.error) throw new Error(newDash.error);
      setDashboard(newDash);

      // Recompute every existing chart from the edited data, keeping its spec.
      if (suggestions.length > 0) {
        const specs = suggestions.map((s) => s.spec);
        pyodide.globals.set("csv_input", newCsv);
        pyodide.globals.set("chart_specs", JSON.stringify(specs));
        const chartRaw = (await pyodide.runPythonAsync(PY_CHART_DATA)) as string;
        const computed = JSON.parse(chartRaw) as ChartData[];
        setSuggestions(
          specs.map((spec, i) => ({ spec, data: computed[i] ?? { error: "No data computed." } })),
        );
      }

      // The data changed, so prior AI insights no longer apply.
      setInsights({});
      setEditNote(
        `${parsed.explanation || "Applied your edit."} Now ${newDash.rows.toLocaleString()} rows × ${newDash.cols.toLocaleString()} columns.`,
      );
      setEditPrompt("");
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to edit the data.");
    } finally {
      setEditBusy(false);
    }
  }, [editPrompt, csvText, dashboard, groqKey, model, suggestions]);

  // Automatically request AI chart suggestions once the dashboard data and a
  // complete-looking Groq key are available.
  const autoSuggestedRef = useRef<Dashboard | null>(null);
  useEffect(() => {
    if (status !== "ready" || !dashboard || suggestBusy) return;
    if (suggestions.length > 0) return;
    if (autoSuggestedRef.current === dashboard) return;
    const key = groqKey.trim();
    if (!key.startsWith("gsk_") || key.length < 40) return;
    autoSuggestedRef.current = dashboard;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    suggestCharts();
  }, [status, dashboard, groqKey, suggestBusy, suggestions.length, suggestCharts]);

  // Names of numeric columns, used to gate which chart types are selectable.
  const numericCols = dashboard?.numeric.map((n) => n.column) ?? [];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16 sm:px-10">
        <header className="space-y-3">
          <Link
            href="/Data-cleaning-bot"
            className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition hover:text-zinc-200"
          >
            ← Back to Data Cleaning Bot
          </Link>
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">Dashboard Generator</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Generate a dashboard
          </h1>
          <p className="max-w-2xl text-zinc-300">
            Build an instant overview of your data — summary statistics and charts for numeric and
            categorical columns. Everything runs in your browser with Pandas via WebAssembly.
          </p>
        </header>

        {/* Runtime status */}
        <div
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
            status === "ready"
              ? "border-emerald-800 bg-emerald-950/40 text-emerald-200"
              : "border-zinc-800 bg-zinc-900/70 text-zinc-300"
          }`}
        >
          {status !== "ready" && (
            <span className="h-3 w-3 animate-pulse rounded-full bg-amber-400" aria-hidden />
          )}
          {status === "ready" && <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />}
          <span>{statusMessage}</span>
        </div>

        {/* Source CSV */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">Data source</h2>
          {csvText ? (
            <p className="text-sm text-zinc-300">
              Using{" "}
              <span className="font-medium text-white">{fileName ?? "cleaned data"}</span>
              {". "}
              <button
                type="button"
                onClick={() => {
                  setCsvText(null);
                  setDashboard(null);
                  setFileName(null);
                }}
                className="text-emerald-400 underline decoration-emerald-700 underline-offset-4 transition hover:text-emerald-300"
              >
                Choose a different file
              </button>
            </p>
          ) : (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-10 text-center transition hover:border-zinc-500 hover:bg-zinc-900"
            >
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={onInputChange} />
              <span className="text-zinc-200">Drag &amp; drop a CSV here, or click to browse</span>
              <span className="text-xs text-zinc-500">
                Tip: clean your data first, then click “Generate dashboard”.
              </span>
            </label>
          )}

          {!dashboard && (
            <button
              type="button"
              onClick={generate}
              disabled={status !== "ready" || csvText == null || busy}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {busy ? "Generating…" : "Generate dashboard"}
            </button>
          )}

          {error && (
            <p className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
        </section>

        {/* Dashboard */}
        {dashboard && (
          <div className="space-y-8">
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Rows" value={dashboard.rows} />
              <Stat label="Columns" value={dashboard.cols} />
              <Stat label="Numeric cols" value={dashboard.numeric.length} />
              <Stat label="Categorical cols" value={dashboard.categorical.length} />
            </section>

            {/* AI-suggested charts */}
            <section className="space-y-4">
              <h2 className="text-lg font-medium text-white">AI-suggested charts</h2>
              <p className="max-w-2xl text-sm text-zinc-400">
                Let Groq analyze your columns and recommend the best chart types. Only the column schema is sent to Groq; the chart data is computed
                locally with Pandas.
              </p>

              <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                <input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="Groq API key (gsk_…)"
                  autoComplete="off"
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
                />
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
                >
                  {GROQ_MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={suggestCharts}
                disabled={suggestBusy || status !== "ready"}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {suggestBusy
                  ? "Asking Groq…"
                  : suggestions.length > 0
                    ? "Suggest charts again"
                    : "Suggest charts with AI"}
              </button>

              {suggestError && (
                <p className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
                  {suggestError}
                </p>
              )}

              {suggestions.length > 0 && focused === null && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {suggestions.map((s, i) => {
                    const hasError = "error" in s.data;
                    return (
                      <div
                        key={i}
                        className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/70 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-medium text-white">{s.spec.title}</h3>
                            <p className="text-xs uppercase tracking-wide text-zinc-500">
                              {s.spec.type}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFocused(i)}
                            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 transition hover:border-emerald-600 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {hasError ? "Fix" : "Focus"}
                          </button>
                        </div>

                        <p className="text-xs text-zinc-400">{s.spec.reason}</p>

                        {hasError ? (
                          <p className="rounded-md border border-amber-900 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
                            Could not build this chart: {(s.data as { error: string }).error}. Open{" "}
                            <span className="font-medium">Fix</span> to regenerate or change its type.
                          </p>
                        ) : (
                          <InteractiveChart data={s.data} spec={s.spec} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {suggestions.length > 0 && focused !== null && suggestions[focused] && (
                <div className="flex flex-col gap-4 lg:flex-row">
                  {/* Sidebar with the other charts */}
                  <aside className="flex shrink-0 flex-row gap-2 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
                    <button
                      type="button"
                      onClick={() => setFocused(null)}
                      className="shrink-0 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-500"
                    >
                      ← All charts
                    </button>
                    {suggestions.map((s, i) => {
                      const hasError = "error" in s.data;
                      const isActive = i === focused;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFocused(i)}
                          className={`shrink-0 rounded-md border px-3 py-2 text-left text-xs transition lg:w-full ${
                            isActive
                              ? "border-emerald-600 bg-emerald-950/40 text-emerald-200"
                              : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-600"
                          }`}
                        >
                          <span className="block truncate font-medium">{s.spec.title}</span>
                          <span className="block text-[10px] uppercase tracking-wide text-zinc-500">
                            {hasError ? "⚠ error" : s.spec.type}
                          </span>
                        </button>
                      );
                    })}

                    {/* Pick a different chart type for the focused chart */}
                    <div className="mt-2 shrink-0 rounded-md border border-zinc-800 bg-zinc-900/60 p-3 lg:w-full">
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                        Pick a chart type
                      </p>
                      <div className="flex flex-row flex-wrap gap-1.5">
                        {CHART_TYPES.map((ct) => {
                          const isCurrent = suggestions[focused].spec.type === ct;
                          const feasible = chartTypeFeasible(
                            suggestions[focused].spec,
                            ct,
                            numericCols,
                          );
                          const reason =
                            ct === "scatter"
                              ? "Needs two numeric columns in the data"
                              : ct === "histogram"
                                ? "Needs a numeric column in the data"
                                : "";
                          return (
                            <button
                              key={ct}
                              type="button"
                              onClick={() => changeChartType(focused, ct)}
                              disabled={isCurrent || !feasible || typeChangeBusy}
                              title={!feasible ? `Unavailable for this data — ${reason}` : undefined}
                              className={`rounded-md border px-2.5 py-1 text-[11px] capitalize transition ${
                                isCurrent
                                  ? "border-emerald-600 bg-emerald-950/40 text-emerald-200"
                                  : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-emerald-600 hover:text-emerald-300"
                              } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-700 disabled:hover:text-zinc-300`}
                            >
                              {ct}
                            </button>
                          );
                        })}
                      </div>
                      {typeChangeBusy && (
                        <p className="mt-2 text-[10px] text-zinc-500">Rebuilding chart…</p>
                      )}
                    </div>

                    {/* Ask the AI to edit the underlying data */}
                    <div className="mt-2 shrink-0 rounded-md border border-zinc-800 bg-zinc-900/60 p-3 lg:w-full">
                      <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                        Ask for edits
                      </p>
                      <textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            applyDataEdit();
                          }
                        }}
                        rows={2}
                        placeholder="e.g. Remove rows where revenue is empty, then sort by date"
                        disabled={editBusy}
                        className="w-full resize-y rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-[11px] text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-600 disabled:opacity-60"
                      />
                      <button
                        type="button"
                        onClick={applyDataEdit}
                        disabled={editBusy || !editPrompt.trim()}
                        className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                      >
                        {editBusy ? "Applying…" : "Apply edit"}
                      </button>
                      {editError && (
                        <p className="mt-2 rounded-md border border-red-900 bg-red-950/50 px-2 py-1.5 text-[10px] text-red-200">
                          {editError}
                        </p>
                      )}
                      {editNote && !editError && (
                        <p className="mt-2 rounded-md border border-emerald-900 bg-emerald-950/40 px-2 py-1.5 text-[10px] text-emerald-200">
                          {editNote}
                        </p>
                      )}
                    </div>
                  </aside>

                  {/* Focused chart + insights */}
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="space-y-3 rounded-lg border border-emerald-800 bg-zinc-900/70 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-medium text-white">
                            {suggestions[focused].spec.title}
                          </h3>
                          <p className="text-xs text-zinc-400">{suggestions[focused].spec.reason}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => regenerateChart(focused)}
                          disabled={regenBusyIdx !== null}
                          title="Recompute this chart from the data"
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-100 transition hover:border-emerald-600 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {regenBusyIdx === focused ? "Regenerating…" : "↻ Regenerate chart"}
                        </button>
                      </div>
                      {"error" in suggestions[focused].data ? (
                        <p className="rounded-md border border-amber-900 bg-amber-950/40 px-3 py-2 text-xs text-amber-200">
                          Could not build this chart:{" "}
                          {(suggestions[focused].data as { error: string }).error}. Try{" "}
                          <span className="font-medium">Regenerate chart</span> or pick another chart
                          type.
                        </p>
                      ) : (
                        <InteractiveChart
                          data={suggestions[focused].data}
                          spec={suggestions[focused].spec}
                          large
                        />
                      )}
                    </div>

                    {/* AI insights */}
                    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-medium text-white">AI insights</h4>
                        <button
                          type="button"
                          onClick={() => analyzeChart(focused)}
                          disabled={insightBusyIdx !== null}
                          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                        >
                          {insightBusyIdx === focused
                            ? "Thinking…"
                            : insights[focused]
                              ? "Re-analyze"
                              : "Ask AI about this chart"}
                        </button>
                      </div>
                      {insightError && (
                        <p className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-200">
                          {insightError}
                        </p>
                      )}
                      {insights[focused] ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                          {insights[focused]}
                        </p>
                      ) : (
                        <p className="text-sm text-zinc-500">
                          Ask the AI what stands out in this chart — trends, outliers, and patterns.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="text-2xl font-semibold text-white">{value.toLocaleString()}</p>
    </div>
  );
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Number.isInteger(n)) return n.toLocaleString();
  // Averages/aggregates can be fractional; cap at 2 decimals so values like
  // 198,691.575 read as 198,691.58 instead of an odd-looking thousandth.
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

// Turn a raw column name like "ad_spend" into readable text like "Ad spend".
function humanize(col: string): string {
  return col
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

// Build a value formatter that matches how the value was aggregated:
// counts and sums show as whole numbers, averages show 2 decimals.
function makeValueFmt(spec: ChartSpec): (n: number) => string {
  const agg = spec.agg ?? "count";
  const isMean = spec.type !== "histogram" && !!spec.y && agg === "mean";
  return (n: number) => {
    if (!Number.isFinite(n)) return "—";
    if (isMean) {
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return Math.round(n).toLocaleString();
  };
}

const CHART_PALETTE = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#14b8a6",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#06b6d4",
  "#8b5cf6",
  "#eab308",
];

type HoverFn = (lines: string[], e: React.MouseEvent) => void;

function InteractiveChart({
  data,
  spec,
  large,
}: {
  data: ChartData;
  spec: ChartSpec;
  large?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number; lines: string[] } | null>(null);

  const onHover: HoverFn = (lines, e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({ x: e.clientX - rect.left, y: e.clientY - rect.top, lines });
  };

  return (
    <div ref={ref} className="relative" onMouseLeave={() => setHover(null)}>
      <ChartView data={data} spec={spec} large={large} onHover={onHover} />
      {hover && (
        <div
          className="pointer-events-none absolute z-20 max-w-[220px] -translate-x-1/2 -translate-y-full rounded-md border border-zinc-700 bg-zinc-950/95 px-2.5 py-1.5 text-[11px] leading-snug text-zinc-100 shadow-xl"
          style={{ left: Math.max(40, hover.x), top: Math.max(28, hover.y - 8) }}
        >
          {hover.lines.map((l, i) => (
            <div key={i} className={i === 0 ? "font-medium text-white" : "text-zinc-400"}>
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChartView({
  data,
  spec,
  large,
  onHover,
}: {
  data: ChartData;
  spec: ChartSpec;
  large?: boolean;
  onHover?: HoverFn;
}) {
  if ("error" in data) return null;
  const valueLabel = valueAxisLabel(spec);
  const valueFmt = makeValueFmt(spec);
  if (data.type === "histogram")
    return <HistogramChart bins={data.bins} xName={humanize(spec.x)} large={large} onHover={onHover} />;
  if (data.type === "scatter")
    return (
      <ScatterChart
        points={data.points}
        xLabel={humanize(data.xLabel)}
        yLabel={humanize(data.yLabel)}
        large={large}
        onHover={onHover}
      />
    );
  if (data.type === "line")
    return (
      <LineChart
        series={data.series}
        xName={humanize(spec.x)}
        valueLabel={valueLabel}
        valueFmt={valueFmt}
        large={large}
        onHover={onHover}
      />
    );
  if (data.type === "pie")
    return (
      <PieChart
        series={data.series}
        valueLabel={valueLabel}
        valueFmt={valueFmt}
        large={large}
        onHover={onHover}
      />
    );
  return (
    <VerticalBarChart
      series={data.series}
      xName={humanize(spec.x)}
      valueLabel={valueLabel}
      valueFmt={valueFmt}
      large={large}
      onHover={onHover}
    />
  );
}

// Describe what each bar/point value actually represents, in plain language.
function valueAxisLabel(spec: ChartSpec): string {
  if (spec.type === "histogram") return "Frequency";
  const agg = spec.agg ?? "count";
  if (spec.y && agg === "sum") return `Total ${humanize(spec.y).toLowerCase()}`;
  if (spec.y && agg === "mean") return `Average ${humanize(spec.y).toLowerCase()}`;
  return "Number of records";
}

function HistogramChart({
  bins,
  xName,
  large,
  onHover,
}: {
  bins: { label: string; count: number }[];
  xName: string;
  large?: boolean;
  onHover?: HoverFn;
}) {
  const max = Math.max(1, ...bins.map((b) => b.count));
  const width = 320;
  const height = 160;
  const padL = 30;
  const padB = 22;
  const padT = 6;
  const gap = 2;
  if (bins.length === 0) return <p className="text-xs text-zinc-500">No data to chart.</p>;
  const plotW = width - padL - 4;
  const plotH = height - padB - padT;
  const barWidth = (plotW - gap * (bins.length - 1)) / bins.length;
  const firstEdge = bins[0]?.label.split("–")[0]?.trim() ?? "";
  const lastEdge = bins[bins.length - 1]?.label.split("–")[1]?.trim() ?? "";
  const total = bins.reduce((acc, b) => acc + b.count, 0) || 1;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-zinc-400">Frequency distribution</p>
      <svg viewBox={`0 0 ${width} ${height}`} className={`${large ? "h-72" : "h-40"} w-full`} role="img">
        {/* y axis ticks */}
        {[0, 0.5, 1].map((t) => {
          const y = padT + plotH - t * plotH;
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={width - 4} y2={y} stroke="#27272a" strokeWidth={1} />
              <text x={padL - 4} y={y + 3} textAnchor="end" className="fill-zinc-500" fontSize={8}>
                {Math.round(t * max)}
              </text>
            </g>
          );
        })}
        {bins.map((b, i) => {
          const h = (b.count / max) * plotH;
          return (
            <rect
              key={i}
              x={padL + i * (barWidth + gap)}
              y={padT + plotH - h}
              width={barWidth}
              height={h}
              rx={1}
              className="fill-emerald-500 transition hover:fill-emerald-300"
              onMouseMove={(e) =>
                onHover?.(
                  [
                    `${xName}`,
                    `Range: ${b.label}`,
                    `Count: ${b.count}`,
                    `Share: ${((b.count / total) * 100).toFixed(1)}%`,
                  ],
                  e,
                )
              }
            >
              <title>{`${b.label}: ${b.count}`}</title>
            </rect>
          );
        })}
        {/* x axis end labels */}
        <text x={padL} y={height - 8} textAnchor="start" className="fill-zinc-500" fontSize={8}>
          {firstEdge}
        </text>
        <text x={width - 4} y={height - 8} textAnchor="end" className="fill-zinc-500" fontSize={8}>
          {lastEdge}
        </text>
      </svg>
      <p className="text-center text-xs text-zinc-500">{xName}</p>
    </div>
  );
}

function VerticalBarChart({
  series,
  xName,
  valueLabel,
  valueFmt,
  large,
  onHover,
}: {
  series: { label: string; value: number }[];
  xName: string;
  valueLabel: string;
  valueFmt: (n: number) => string;
  large?: boolean;
  onHover?: HoverFn;
}) {
  const max = Math.max(1, ...series.map((s) => s.value));
  const total = series.reduce((acc, s) => acc + s.value, 0) || 1;
  if (series.length === 0) return <p className="text-xs text-zinc-500">No data to chart.</p>;
  return (
    <div className={large ? "space-y-3" : "space-y-2"}>
      <p className="text-xs font-medium text-zinc-400">
        {valueLabel} <span className="text-zinc-600">by</span> {xName.toLowerCase()}
      </p>
      {series.map((s, i) => (
        <div
          key={s.label + i}
          className="space-y-1"
          onMouseMove={(e) =>
            onHover?.(
              [
                s.label || "(empty)",
                `${valueLabel}: ${valueFmt(s.value)}`,
                `Share: ${((s.value / total) * 100).toFixed(1)}%`,
              ],
              e,
            )
          }
        >
          <div className="flex justify-between gap-2 text-xs text-zinc-300">
            <span className="truncate" title={s.label}>
              {s.label || "(empty)"}
            </span>
            <span className="text-zinc-400">{valueFmt(s.value)}</span>
          </div>
          <div className={`${large ? "h-3" : "h-2"} overflow-hidden rounded-full bg-zinc-800`}>
            <div
              className="h-full rounded-full"
              style={{ width: `${(s.value / max) * 100}%`, backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}
            />
          </div>
        </div>
      ))}
      <p className="pt-1 text-right text-xs text-zinc-500">Bar length = {valueLabel.toLowerCase()}</p>
    </div>
  );
}

function LineChart({
  series,
  xName,
  valueLabel,
  valueFmt,
  large,
  onHover,
}: {
  series: { label: string; value: number }[];
  xName: string;
  valueLabel: string;
  valueFmt: (n: number) => string;
  large?: boolean;
  onHover?: HoverFn;
}) {
  const width = 340;
  const height = 200;
  const padL = 38;
  const padR = 8;
  const padT = 10;
  const padB = 30;
  if (series.length < 2)
    return (
      <VerticalBarChart
        series={series}
        xName={xName}
        valueLabel={valueLabel}
        valueFmt={valueFmt}
        large={large}
        onHover={onHover}
      />
    );
  const values = series.map((s) => s.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const stepX = plotW / (series.length - 1);
  const sx = (i: number) => padL + i * stepX;
  const sy = (v: number) => padT + plotH - ((v - min) / span) * plotH;
  const pts = series.map((s, i) => ({ x: sx(i), y: sy(s.value), s }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const ticks = [0, 0.5, 1];
  const xIdx = [0, Math.floor((series.length - 1) / 2), series.length - 1];
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-zinc-400">
        {valueLabel} <span className="text-zinc-600">over</span> {xName.toLowerCase()}
      </p>
      <svg viewBox={`0 0 ${width} ${height}`} className={`${large ? "h-80" : "h-48"} w-full`} role="img">
        {/* y gridlines + ticks */}
        {ticks.map((t) => {
          const v = min + t * span;
          const y = sy(v);
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#27272a" strokeWidth={1} />
              <text x={padL - 4} y={y + 3} textAnchor="end" className="fill-zinc-500" fontSize={8}>
                {valueFmt(v)}
              </text>
            </g>
          );
        })}
        {/* axes */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#3f3f46" strokeWidth={1} />
        <line x1={padL} y1={padT + plotH} x2={width - padR} y2={padT + plotH} stroke="#3f3f46" strokeWidth={1} />
        <path d={path} fill="none" stroke="#10b981" strokeWidth={2} />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={large ? 4 : 2.5}
            className="fill-emerald-400 transition hover:fill-emerald-200"
            onMouseMove={(e) =>
              onHover?.([p.s.label || "(empty)", `${valueLabel}: ${valueFmt(p.s.value)}`, xName], e)
            }
          >
            <title>{`${p.s.label}: ${valueFmt(p.s.value)}`}</title>
          </circle>
        ))}
        {/* x tick labels */}
        {xIdx.map((idx, k) => (
          <text
            key={k}
            x={sx(idx)}
            y={height - 14}
            textAnchor={k === 0 ? "start" : k === xIdx.length - 1 ? "end" : "middle"}
            className="fill-zinc-500"
            fontSize={8}
          >
            {truncate(series[idx]?.label ?? "", 10)}
          </text>
        ))}
      </svg>
      <p className="text-center text-xs text-zinc-500">{xName}</p>
    </div>
  );
}

function ScatterChart({
  points,
  xLabel,
  yLabel,
  large,
  onHover,
}: {
  points: { x: number; y: number }[];
  xLabel: string;
  yLabel: string;
  large?: boolean;
  onHover?: HoverFn;
}) {
  const width = 340;
  const height = 220;
  const padL = 40;
  const padR = 8;
  const padT = 10;
  const padB = 34;
  if (points.length === 0) return <p className="text-xs text-zinc-500">No data to chart.</p>;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const sx = (x: number) => padL + ((x - xMin) / xSpan) * plotW;
  const sy = (y: number) => padT + plotH - ((y - yMin) / ySpan) * plotH;
  const ticks = [0, 0.5, 1];
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-zinc-400">
        {yLabel} <span className="text-zinc-600">vs</span> {xLabel}
      </p>
      <svg viewBox={`0 0 ${width} ${height}`} className={`${large ? "h-80" : "h-52"} w-full`} role="img">
        {/* y gridlines + ticks */}
        {ticks.map((t) => {
          const v = yMin + t * ySpan;
          const y = sy(v);
          return (
            <g key={`y${t}`}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#27272a" strokeWidth={1} />
              <text x={padL - 4} y={y + 3} textAnchor="end" className="fill-zinc-500" fontSize={8}>
                {fmt(v)}
              </text>
            </g>
          );
        })}
        {/* x ticks */}
        {ticks.map((t) => {
          const v = xMin + t * xSpan;
          const x = sx(v);
          return (
            <text
              key={`x${t}`}
              x={x}
              y={height - 16}
              textAnchor={t === 0 ? "start" : t === 1 ? "end" : "middle"}
              className="fill-zinc-500"
              fontSize={8}
            >
              {fmt(v)}
            </text>
          );
        })}
        {/* axes */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#3f3f46" strokeWidth={1} />
        <line x1={padL} y1={padT + plotH} x2={width - padR} y2={padT + plotH} stroke="#3f3f46" strokeWidth={1} />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={large ? 3.5 : 2.5}
            className="fill-emerald-400/80 transition hover:fill-emerald-200"
            onMouseMove={(e) =>
              onHover?.([`${xLabel}: ${fmt(p.x)}`, `${yLabel}: ${fmt(p.y)}`], e)
            }
          >
            <title>{`(${fmt(p.x)}, ${fmt(p.y)})`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-xs text-zinc-500">
        <span>x: {xLabel}</span>
        <span>y: {yLabel}</span>
      </div>
    </div>
  );
}

function PieChart({
  series,
  valueLabel,
  valueFmt,
  large,
  onHover,
}: {
  series: { label: string; value: number }[];
  valueLabel: string;
  valueFmt: (n: number) => string;
  large?: boolean;
  onHover?: HoverFn;
}) {
  const total = series.reduce((acc, s) => acc + s.value, 0);
  if (total <= 0) return <p className="text-xs text-zinc-500">No data to chart.</p>;
  const size = 160;
  const r = size / 2;
  const slices = series.map((s, i) => {
    const before = series.slice(0, i).reduce((acc, p) => acc + p.value, 0);
    const frac = s.value / total;
    const start = -Math.PI / 2 + (before / total) * Math.PI * 2;
    const end = start + frac * Math.PI * 2;
    const x1 = r + r * Math.cos(start);
    const y1 = r + r * Math.sin(start);
    const x2 = r + r * Math.cos(end);
    const y2 = r + r * Math.sin(end);
    const wide = end - start > Math.PI ? 1 : 0;
    const d = `M${r},${r} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${wide} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`;
    return { d, color: CHART_PALETTE[i % CHART_PALETTE.length], s, frac };
  });
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-zinc-400">Share of {valueLabel.toLowerCase()}</p>
      <div className={`flex items-center gap-4 ${large ? "flex-col sm:flex-row" : ""}`}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className={`${large ? "h-56 w-56" : "h-32 w-32"} shrink-0`}
          role="img"
        >
          {slices.map((sl, i) => (
            <path
              key={i}
              d={sl.d}
              fill={sl.color}
              className="transition hover:opacity-80"
              onMouseMove={(e) =>
                onHover?.(
                  [
                    sl.s.label || "(empty)",
                    `${valueLabel}: ${valueFmt(sl.s.value)}`,
                    `Share: ${(sl.frac * 100).toFixed(1)}%`,
                  ],
                  e,
                )
              }
            >
              <title>{`${sl.s.label}: ${valueFmt(sl.s.value)} (${(sl.frac * 100).toFixed(1)}%)`}</title>
            </path>
          ))}
        </svg>
        <ul className="space-y-1 text-xs text-zinc-300">
          {slices.map((sl, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: sl.color }} />
              <span className="truncate" title={sl.s.label}>
                {sl.s.label || "(empty)"}
              </span>
              <span className="text-zinc-500">
                {valueFmt(sl.s.value)} ({(sl.frac * 100).toFixed(0)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const PY_DASHBOARD = `
import json
import io
import pandas as pd
import numpy as np

try:
    df = pd.read_csv(io.StringIO(csv_input))

    numeric = []
    for col in df.select_dtypes(include=[np.number]).columns:
        s = df[col]
        valid = s.dropna()
        unique_count = int(valid.nunique())
        hist_bins = []
        if not valid.empty:
            counts, edges = np.histogram(valid.to_numpy(dtype=float), bins=min(12, max(1, unique_count)))
            for i in range(len(counts)):
                lo = edges[i]
                hi = edges[i + 1]
                hist_bins.append({
                    "label": f"{lo:.3g} – {hi:.3g}",
                    "count": int(counts[i]),
                })
        numeric.append({
            "column": str(col),
            "count": int(valid.shape[0]),
            "mean": float(valid.mean()) if not valid.empty else float("nan"),
            "min": float(valid.min()) if not valid.empty else float("nan"),
            "max": float(valid.max()) if not valid.empty else float("nan"),
            "missing": int(s.isna().sum()),
            "unique": unique_count,
            "histogram": {"bins": hist_bins},
        })

    categorical = []
    non_numeric = df.select_dtypes(exclude=[np.number]).columns
    for col in non_numeric:
        s = df[col].astype(str)
        counts = s.value_counts().head(8)
        categorical.append({
            "column": str(col),
            "unique": int(df[col].nunique(dropna=True)),
            "top": [{"label": str(idx), "count": int(val)} for idx, val in counts.items()],
        })

    out = {
        "rows": int(df.shape[0]),
        "cols": int(df.shape[1]),
        "columns": [str(c) for c in df.columns],
        "numeric": numeric,
        "categorical": categorical,
    }
    result = json.dumps(out)
except Exception as e:
    result = json.dumps({"error": "Pandas error: " + str(e),
                         "rows": 0, "cols": 0, "columns": [], "numeric": [], "categorical": []})

result
`;

const PY_CHART_DATA = `
import json
import io
import pandas as pd
import numpy as np

def _compute(df, spec):
    t = spec.get("type")
    x = spec.get("x")
    y = spec.get("y")
    agg = spec.get("agg") or "count"
    if x is None or x not in df.columns:
        return {"error": "Column '" + str(x) + "' not found."}
    try:
        if t == "histogram":
            s = pd.to_numeric(df[x], errors="coerce").dropna()
            if s.empty:
                return {"error": "No numeric data in '" + str(x) + "'."}
            nbins = min(12, max(1, int(s.nunique())))
            counts, edges = np.histogram(s.to_numpy(dtype=float), bins=nbins)
            bins = [
                {"label": f"{edges[i]:.3g} – {edges[i+1]:.3g}", "count": int(counts[i])}
                for i in range(len(counts))
            ]
            return {"type": "histogram", "bins": bins}

        if t == "scatter":
            if y is None or y not in df.columns:
                return {"error": "Scatter needs numeric x and y."}
            sub = pd.DataFrame({
                "x": pd.to_numeric(df[x], errors="coerce"),
                "y": pd.to_numeric(df[y], errors="coerce"),
            }).dropna()
            if sub.empty:
                return {"error": "No numeric x/y pairs."}
            if sub.shape[0] > 300:
                sub = sub.sample(300, random_state=0)
            points = [{"x": float(a), "y": float(b)} for a, b in zip(sub["x"], sub["y"])]
            return {"type": "scatter", "points": points, "xLabel": str(x), "yLabel": str(y)}

        # bar, pie, line
        if y and y in df.columns and agg in ("sum", "mean"):
            yv = pd.to_numeric(df[y], errors="coerce")
            grouped = yv.groupby(df[x].astype(str))
            res = grouped.sum() if agg == "sum" else grouped.mean()
        else:
            res = df[x].astype(str).value_counts()

        if t == "line":
            res = res.sort_index().head(40)
        else:
            res = res.sort_values(ascending=False).head(12)

        series = [{"label": str(idx), "value": float(v)} for idx, v in res.items()]
        kind = t if t in ("bar", "pie", "line") else "bar"
        return {"type": kind, "series": series}
    except Exception as e:
        return {"error": str(e)}

try:
    df = pd.read_csv(io.StringIO(csv_input))
    specs = json.loads(chart_specs)
    out = [_compute(df, spec) for spec in specs]
    result = json.dumps(out)
except Exception as e:
    result = json.dumps([{"error": "Pandas error: " + str(e)}])

result
`;

// Apply an AI-generated edit to the dataset and return the new CSV.
const PY_EDIT_EXEC = `
import json
import io
import pandas as pd
import numpy as np

try:
    _df0 = pd.read_csv(io.StringIO(csv_input))
    _scope = {"df": _df0.copy(), "pd": pd, "np": np}
    exec(agent_code, _scope)
    _new = _scope.get("df")
    if not isinstance(_new, pd.DataFrame):
        raise ValueError("The generated code did not produce a DataFrame named df.")
    edit_result = json.dumps({
        "ok": True,
        "csv": _new.to_csv(index=False),
        "rows": int(_new.shape[0]),
        "cols": int(_new.shape[1]),
    })
except Exception as e:
    edit_result = json.dumps({"ok": False, "error": str(e)})

edit_result
`;
