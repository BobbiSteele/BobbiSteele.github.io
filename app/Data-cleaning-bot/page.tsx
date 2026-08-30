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

// Groq uses an OpenAI-compatible chat completions endpoint.
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
const GROQ_KEY_STORAGE = "dcb_groq_api_key";

// Shared with the dashboard generator page (handoff via sessionStorage).
const DASHBOARD_CSV_KEY = "dcb_dashboard_csv";
const DASHBOARD_NAME_KEY = "dcb_dashboard_name";

const AGENT_SYSTEM_PROMPT = [
  "You are a data-cleaning assistant, similar to PandasAI.",
  "A pandas DataFrame named `df` is already loaded in the runtime, along with pandas as `pd` and numpy as `np`.",
  "The user gives an instruction to clean or transform the data.",
  "Respond with ONLY a JSON object of the form:",
  '{"code": "<python code that reassigns the cleaned DataFrame to the variable df>", "explanation": "<short plain-language summary of what you changed>"}',
  "Rules:",
  "- Use only pandas (pd) and numpy (np). Do NOT import other libraries, read files, or access the network.",
  "- The code MUST assign the resulting DataFrame back to a variable named `df`.",
  "- Preserve real data; only clean, fix, or transform as instructed.",
  "- Handle dirty data defensively so the code never raises on bad values. When converting types, ALWAYS use error-tolerant parsing: `pd.to_numeric(..., errors='coerce')` and `pd.to_datetime(..., errors='coerce')` (do NOT pass a strict `format=` that could raise). Invalid values must become NaN/NaT rather than throwing.",
  "- Wrap any conversion that could fail so a single bad cell never aborts the whole operation.",
  "- Keep the code concise and do not print anything.",
  "- Return ONLY the JSON object, with no markdown fences or extra text.",
].join("\n");

const AUTO_CLEAN_INSTRUCTION =
  "Clean this dataset thoroughly: remove exact duplicate rows; strip leading and trailing " +
  "whitespace from text values; drop rows and columns that are entirely empty; replace blank " +
  "strings with proper missing values; standardize column names to clean snake_case; and convert " +
  "columns to appropriate numeric or datetime types where clearly applicable. When converting, use " +
  "error-tolerant parsing (pd.to_numeric/pd.to_datetime with errors='coerce') so dirty values such " +
  "as 'ERROR', 'N/A', or stray text become missing values (NaN/NaT) instead of raising. Keep all " +
  "real data and reassign the cleaned DataFrame to df.";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  code?: string;
  error?: string;
};

function extractJson(text: string): { code?: string; explanation?: string } | null {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

type PreviewTable = {
  columns: string[];
  rows: string[][];
};

type MissingSummary = {
  total: number;
  cells: number;
  columns: { column: string; missing: number }[];
};

export default function DataCleaningBotPage() {
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const dfFileRef = useRef<string | null>(null);
  const autoCleanedRef = useRef<string | null>(null);

  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [statusMessage, setStatusMessage] = useState("Initializing Python environment…");
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [currentCsv, setCurrentCsv] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewTable | null>(null);
  const [counts, setCounts] = useState<{ rows: number; cols: number } | null>(null);
  const [missing, setMissing] = useState<MissingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Groq state.
  const [groqKey, setGroqKey] = useState("");
  const [model, setModel] = useState(GROQ_MODELS[0]);
  const [prompt, setPrompt] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [agentBusy, setAgentBusy] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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

  // Restore the Groq key from localStorage on mount, and persist changes.
  useEffect(() => {
    const saved = window.localStorage.getItem(GROQ_KEY_STORAGE);
    if (saved) setGroqKey(saved);
  }, []);

  useEffect(() => {
    if (groqKey) window.localStorage.setItem(GROQ_KEY_STORAGE, groqKey);
    else window.localStorage.removeItem(GROQ_KEY_STORAGE);
  }, [groqKey]);

  const handleFile = useCallback((file: File) => {
    setError(null);
    setCurrentCsv(null);
    setPreview(null);
    setCounts(null);
    setMissing(null);
    setChat([]);
    dfFileRef.current = null;
    autoCleanedRef.current = null;
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

  // Send an instruction to Groq, run the returned pandas code against the
  // persistent `df`, and update the downloadable CSV.
  const runTransform = useCallback(
    async (instruction: string, opts?: { showUser?: boolean }) => {
      const pyodide = pyodideRef.current;
      if (!pyodide || csvText == null) return;
      if (!groqKey.trim()) {
        setError("Enter your Groq API key first.");
        return;
      }

      setError(null);
      setAgentBusy(true);
      if (opts?.showUser) {
        setChat((prev) => [...prev, { role: "user", content: instruction }]);
      }

      try {
        // Load the original CSV into `df` once per file; later edits accumulate.
        if (dfFileRef.current !== csvText) {
          pyodide.globals.set("csv_for_agent", csvText);
          await pyodide.runPythonAsync(PY_LOAD_DF);
          dfFileRef.current = csvText;
        }

        const schemaJson = (await pyodide.runPythonAsync(PY_SCHEMA)) as string;
        const messages = [
          { role: "system", content: AGENT_SYSTEM_PROMPT },
          {
            role: "user",
            content: `DataFrame schema (JSON):\n${schemaJson}\n\nInstruction: ${instruction}`,
          },
        ];

        // Ask Groq for code and run it. If the code throws on dirty data, feed
        // the error back to the model once so it can self-correct (e.g. switch
        // to error-tolerant parsing) before giving up.
        const MAX_ATTEMPTS = 2;
        type ExecResult =
          | {
              ok: true;
              csv: string;
              rows: number;
              cols: number;
              missing: MissingSummary;
              preview: PreviewTable;
            }
          | { ok: false; error: string };
        let parsed: { code?: string; explanation?: string } | null = null;
        let execOut: ExecResult | null = null;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
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
          parsed = extractJson(content);
          if (!parsed?.code) throw new Error("The model did not return runnable code.");

          pyodide.globals.set("agent_code", parsed.code);
          const execRaw = (await pyodide.runPythonAsync(PY_TRANSFORM_EXEC)) as string;
          execOut = JSON.parse(execRaw) as ExecResult;

          if (execOut.ok) break;

          // Last attempt failed — stop and report below.
          if (attempt === MAX_ATTEMPTS - 1) break;

          // Give the model its own broken code plus the runtime error and ask
          // for a fix that tolerates dirty values.
          messages.push(
            { role: "assistant", content: JSON.stringify(parsed) },
            {
              role: "user",
              content:
                `Running that code raised this error:\n${execOut.error}\n\n` +
                "Fix the code so it does not raise on dirty or malformed values. Use error-tolerant " +
                "parsing (pd.to_numeric/pd.to_datetime with errors='coerce', no strict format=) so bad " +
                "cells become NaN/NaT. Return ONLY the JSON object.",
            },
          );
        }

        if (!parsed || !execOut) throw new Error("The model did not return runnable code.");

        if (!execOut.ok) {
          setChat((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "I couldn't apply that change.",
              code: parsed.code,
              error: execOut.error,
            },
          ]);
          return;
        }

        setCurrentCsv(execOut.csv);
        setPreview(execOut.preview);
        setCounts({ rows: execOut.rows, cols: execOut.cols });
        setMissing(execOut.missing);
        setChat((prev) => [
          ...prev,
          {
            role: "assistant",
            content: parsed.explanation || "Done.",
            code: parsed.code,
          },
        ]);
      } catch (err) {
        setChat((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I couldn't complete that request.",
            error: err instanceof Error ? err.message : String(err),
          },
        ]);
      } finally {
        setAgentBusy(false);
      }
    },
    [csvText, groqKey, model],
  );

  // Automatically clean once a file is loaded and a complete-looking key is present.
  useEffect(() => {
    if (status !== "ready" || agentBusy) return;
    if (!csvText) return;
    const key = groqKey.trim();
    if (!key.startsWith("gsk_") || key.length < 40) return;
    if (autoCleanedRef.current === csvText) return;
    autoCleanedRef.current = csvText;
    runTransform(AUTO_CLEAN_INSTRUCTION, { showUser: true });
  }, [status, csvText, groqKey, agentBusy, runTransform]);

  const sendPrompt = useCallback(() => {
    const p = prompt.trim();
    if (!p || agentBusy) return;
    setPrompt("");
    runTransform(p, { showUser: true });
  }, [prompt, agentBusy, runTransform]);

  const downloadCsv = () => {
    if (!currentCsv) return;
    const blob = new Blob([currentCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = fileName?.replace(/\.csv$/i, "") ?? "data";
    a.href = url;
    a.download = `${base}-cleaned.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16 sm:px-10">
        <header className="space-y-3">
          <Link
            href="/"
            className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition hover:text-zinc-200"
          >
            ← Home
          </Link>
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">Data Cleaning Bot</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Clean a CSV with Pandas + Groq
          </h1>
          <p className="max-w-2xl text-zinc-300">
            Upload a CSV, enter your Groq API key, and the AI agent cleans your data with Pandas
            running entirely in your browser via WebAssembly. Your file never leaves your machine —
            only the column schema and a small sample are sent to Groq.
          </p>
        </header>

        {/* How to get an API key */}
        <div>
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            <span aria-hidden>❓</span>
            How do I get an API Key for Groq?
          </button>
        </div>

        {showHelp && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="groq-help-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setShowHelp(false)}
          >
            <div
              className="w-full max-w-lg space-y-4 rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <h2 id="groq-help-title" className="text-lg font-semibold text-white">
                  How do I get an API Key for Groq?
                </h2>
                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  aria-label="Close"
                  className="rounded-md px-2 text-xl leading-none text-zinc-400 transition hover:text-white"
                >
                  ×
                </button>
              </div>
              <p className="text-sm leading-relaxed text-zinc-300">
                Go to{" "}
                <a
                  href="https://console.groq.com/home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 underline decoration-emerald-700 underline-offset-4 transition hover:text-emerald-300"
                >
                  https://console.groq.com/home
                </a>{" "}
                and create an account. Under API Keys, generate a key and paste it into the browser
                here. Groq is an LLM that offers APIs to free users. PandasAI can also be used with
                other LLMs like Claude for better functionality.
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

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
          {status === "ready" && (
            <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
          )}
          <span>{statusMessage}</span>
        </div>

        {/* File upload */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">1. Choose a file</h2>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-10 text-center transition hover:border-zinc-500 hover:bg-zinc-900"
          >
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={onInputChange} />
            <span className="text-zinc-200">
              {fileName ? (
                <>
                  Selected: <span className="font-medium text-white">{fileName}</span>
                </>
              ) : (
                "Drag & drop a CSV here, or click to browse"
              )}
            </span>
            <span className="text-xs text-zinc-500">CSV files only</span>
          </label>
        </section>

        {/* Step 2: Groq API key → automatic clean */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">2. Enter your Groq API key</h2>
          <p className="max-w-2xl text-sm text-zinc-400">
            As soon as a valid key is entered, Groq automatically cleans your data — removing
            duplicates and blank rows/columns, trimming whitespace, standardizing column names, and
            fixing obvious type issues. Your key is stored only in this browser and sent directly to
            Groq; never commit it to the repository.
          </p>
          <input
            type="password"
            value={groqKey}
            onChange={(e) => setGroqKey(e.target.value)}
            placeholder="Groq API key (gsk_…)"
            autoComplete="off"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
          />

          {agentBusy && (
            <p className="flex items-center gap-2 text-sm text-amber-200">
              <span className="h-3 w-3 animate-pulse rounded-full bg-amber-400" aria-hidden />
              Groq is cleaning your data…
            </p>
          )}
          {!agentBusy && currentCsv && counts && (
            <p className="text-sm text-emerald-300">
              Done — {counts.rows.toLocaleString()} rows × {counts.cols.toLocaleString()} columns.
            </p>
          )}

          {!agentBusy && currentCsv && missing && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm">
              {missing.total === 0 ? (
                <p className="text-zinc-300">No empty cells in the cleaned data.</p>
              ) : (
                <>
                  <p className="text-zinc-300">
                    <span className="font-medium text-amber-300">
                      {missing.total.toLocaleString()}
                    </span>{" "}
                    empty {missing.total === 1 ? "cell" : "cells"} in the cleaned data
                    {missing.cells > 0 && (
                      <span className="text-zinc-500">
                        {" "}
                        ({((missing.total / missing.cells) * 100).toFixed(1)}% of all cells)
                      </span>
                    )}
                    . This includes values that couldn&apos;t be parsed (e.g. an invalid date set to
                    empty).
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                    {missing.columns.map((c) => (
                      <li key={c.column}>
                        <span className="text-zinc-300">{c.column}</span>:{" "}
                        {c.missing.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}
        </section>

        {/* Step 3: Download */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-white">3. Download cleaned CSV</h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadCsv}
              disabled={!currentCsv || agentBusy}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              Download cleaned CSV
            </button>
            <Link
              href="/Data-cleaning-bot/dashboard-generator"
              onClick={() => {
                if (currentCsv) {
                  window.sessionStorage.setItem(DASHBOARD_CSV_KEY, currentCsv);
                  if (fileName) window.sessionStorage.setItem(DASHBOARD_NAME_KEY, fileName);
                }
              }}
              aria-disabled={!currentCsv || agentBusy}
              className={`inline-flex items-center justify-center rounded-lg border px-5 py-2.5 text-sm font-medium transition ${
                !currentCsv || agentBusy
                  ? "pointer-events-none border-zinc-800 bg-zinc-800 text-zinc-500"
                  : "border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800"
              }`}
            >
              Generate dashboard
            </Link>
          </div>

          {preview && (
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">Preview (first {preview.rows.length} rows)</p>
              <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-zinc-900 text-zinc-300">
                    <tr>
                      {preview.columns.map((col) => (
                        <th key={col} className="whitespace-nowrap px-3 py-2 font-medium">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, i) => (
                      <tr key={i} className="border-t border-zinc-800/70 text-zinc-200">
                        {row.map((cell, j) => (
                          <td key={j} className="whitespace-nowrap px-3 py-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Advanced settings */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-left text-sm font-medium text-zinc-100 transition hover:border-zinc-700"
          >
            <span>Advanced settings — talk to Groq about your data</span>
            <span className="text-zinc-400">{showAdvanced ? "▲" : "▼"}</span>
          </button>

          {showAdvanced && (
            <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
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

              {chat.length > 0 && (
                <div className="space-y-3">
                  {chat.map((m, i) => (
                    <div
                      key={i}
                      className={
                        m.role === "user"
                          ? "ml-auto max-w-[85%] rounded-lg bg-emerald-900/40 px-4 py-2 text-sm text-emerald-100"
                          : "mr-auto max-w-[95%] space-y-2 rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-zinc-100"
                      }
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      {m.code && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-zinc-400 hover:text-zinc-200">
                            View generated pandas code
                          </summary>
                          <pre className="mt-2 overflow-x-auto rounded-md bg-zinc-950 p-3 text-zinc-200">
                            <code>{m.code}</code>
                          </pre>
                        </details>
                      )}
                      {m.error && (
                        <p className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-xs text-red-200">
                          {m.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !agentBusy) sendPrompt();
                  }}
                  placeholder="e.g. Remove the email column, then sort by date descending"
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-600"
                />
                <button
                  type="button"
                  onClick={sendPrompt}
                  disabled={status !== "ready" || agentBusy || prompt.trim() === "" || !csvText}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                >
                  {agentBusy ? "Working…" : "Send"}
                </button>
              </div>

              <button
                type="button"
                onClick={downloadCsv}
                disabled={!currentCsv || agentBusy}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-500"
              >
                Download current CSV
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const PY_LOAD_DF = `
import io
import pandas as pd

df = pd.read_csv(io.StringIO(csv_for_agent))
None
`;

const PY_SCHEMA = `
import json

_sample = df.head(5).astype(str).values.tolist()
_schema = {
    "columns": [str(c) for c in df.columns],
    "dtypes": [str(t) for t in df.dtypes],
    "shape": [int(df.shape[0]), int(df.shape[1])],
    "sample_rows": _sample,
}
json.dumps(_schema)
`;

const PY_TRANSFORM_EXEC = `
import json
import pandas as pd
import numpy as np

try:
    _scope = {"df": df.copy(), "pd": pd, "np": np}
    exec(agent_code, _scope)
    _new = _scope.get("df")
    if not isinstance(_new, pd.DataFrame):
        raise ValueError("The generated code did not produce a DataFrame named df.")
    df = _new
    _preview = df.head(20)

    # Summarize empty cells in the cleaned data. This includes values that were
    # coerced to missing (e.g. an invalid date like "ERROR" -> NaT).
    _na = df.isna().sum()
    _per_col = [
        {"column": str(c), "missing": int(n)}
        for c, n in _na.items()
        if int(n) > 0
    ]
    _per_col.sort(key=lambda d: d["missing"], reverse=True)
    _missing_summary = {
        "total": int(_na.sum()),
        "cells": int(df.shape[0] * df.shape[1]),
        "columns": _per_col[:12],
    }

    out = json.dumps({
        "ok": True,
        "csv": df.to_csv(index=False),
        "rows": int(df.shape[0]),
        "cols": int(df.shape[1]),
        "missing": _missing_summary,
        "preview": {
            "columns": [str(c) for c in _preview.columns],
            "rows": _preview.astype(str).values.tolist(),
        },
    })
except Exception as e:
    out = json.dumps({"ok": False, "error": str(e)})

out
`;
