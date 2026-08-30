// Extracts structured articles (headings, paragraphs, links) from portfolio PDFs
// into app/writing-portfolio/articles.json using poppler's pdftohtml XML output.
// Usage: node scripts/extract-articles.mjs
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, basename, dirname } from "node:path";

const SRC = "/Users/bobbisteele/Downloads/Portfolio 2025";
const OUT = new URL("../app/writing-portfolio/articles.json", import.meta.url).pathname;

// ---------- helpers ----------

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else if (entry.toLowerCase().endsWith(".pdf")) files.push(full);
  }
  return files;
}

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_’'"?!:,()./]/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&");
}

function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();

// ---------- junk detection ----------

const JUNK_BLOCK = [
  /^(menu|home|blog|search|share( this| on)?|follow us|previous|next|back to (blog|top)|table of contents|contents)$/i,
  /^(learn more|read more|read the article|sign up( now| for free)?|get started|book a demo|get a quote|contact us|subscribe( to.*)?|try (it|for) free|download( now)?|apply now|join us|see more)[.!]?$/i,
  /^(related (articles|posts|reading)|you might also like|recommended (for you|articles)|more (articles|from the blog)|keep reading|continue reading)$/i,
  /^\d+\s*min(ute)?s?\s*read$/i,
  /^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}$/i,
  /^\d{1,2}\.?\s*(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\s+\d{4}$/i,
  /^page \d+( of \d+)?$/i,
  /^\d+\s*\/\s*\d+$/,
  /^(created by|©|copyright|all rights reserved)/i,
  /(all rights reserved|copyright \d{4})\s*$/i,
  /^https?:\/\/\S+$/i,
  /^(health|life in germany|insurance|company news)([\s·|]+(health|life in germany|insurance|company news|menu))*$/i,
];

function isJunkBlock(text, segments) {
  const t = text.trim();
  if (!t || t.length < 3) return true;
  if (JUNK_BLOCK.some((re) => re.test(t))) return true;
  if (/cookie/i.test(t) && t.length < 250) return true;
  if (/skip to content/i.test(t)) return true;
  // blocks that are (almost) entirely links = nav / TOC / captions / CTAs
  const linkChars = segments.reduce((n, s) => n + (s.href ? s.text.length : 0), 0);
  if (t.length < 400 && linkChars / t.length > 0.8) return true;
  if (t.length < 90 && segments.length && segments.every((s) => s.href || !s.text.trim())) return true;
  return false;
}

// ---------- extraction ----------

function extract(pdfPath) {
  const xml = execFileSync(
    "pdftohtml",
    ["-xml", "-stdout", "-i", "-q", pdfPath],
    { encoding: "utf8", maxBuffer: 100 * 1024 * 1024 }
  );

  // font specs (ids are document-unique)
  const fonts = new Map();
  for (const m of xml.matchAll(
    /<fontspec id="(\d+)" size="(-?\d+)" family="([^"]*)" color="(#[0-9a-fA-F]{6})"(?:\s+opacity="([\d.]+)")?\s*\/>/g
  )) {
    fonts.set(m[1], {
      size: Number(m[2]),
      family: m[3],
      color: m[4].toLowerCase(),
      opacity: m[5] === undefined ? 1 : Number(m[5]),
    });
  }

  // text fragments per page
  const fragments = [];
  for (const pm of xml.matchAll(/<page number="(\d+)"[^>]*>([\s\S]*?)<\/page>/g)) {
    const page = Number(pm[1]);
    for (const tm of pm[2].matchAll(
      /<text top="(-?\d+)" left="(-?\d+)" width="(-?\d+)" height="(-?\d+)" font="(\d+)">([\s\S]*?)<\/text>/g
    )) {
      const font = fonts.get(tm[5]) ?? { size: 0, family: "", color: "#000000", opacity: 1 };
      const segments = [];
      for (const sm of tm[6].matchAll(/<a href="([^"]*)">([\s\S]*?)<\/a>|([^<]+)|<[^>]+>/g)) {
        if (sm[1] !== undefined) {
          const text = decodeEntities(sm[2].replace(/<[^>]+>/g, ""));
          if (text) segments.push({ text, href: sm[1] });
        } else if (sm[3]) {
          const text = decodeEntities(sm[3]);
          if (text) segments.push({ text });
        }
      }
      const plain = segments.map((s) => s.text).join("");
      if (!plain.trim()) continue;
      fragments.push({
        page,
        top: Number(tm[1]),
        left: Number(tm[2]),
        height: Number(tm[4]),
        font,
        segments,
        plain,
      });
    }
  }
  return fragments;
}

function buildBlocks(fragments) {
  if (!fragments.length) return [];

  // body font: length-weighted mode of (size|color)
  const weight = new Map();
  for (const f of fragments) {
    const key = `${f.font.size}|${f.font.color}`;
    weight.set(key, (weight.get(key) ?? 0) + f.plain.length);
  }
  const [bodyKey] = [...weight.entries()].sort((a, b) => b[1] - a[1])[0];
  const bodySize = Number(bodyKey.split("|")[0]);
  const bodyColor = bodyKey.split("|")[1];
  const bodyIsDark = luminance(bodyColor) < 0.6;

  // keep only visible fragments; on light-background docs drop light text (CTA
  // banners, hero overlays, footers) — body text is dark.
  let kept = fragments.filter((f) => f.font.opacity > 0.1);
  if (bodyIsDark) kept = kept.filter((f) => luminance(f.font.color) < 0.75);

  // drop text repeated on 3+ pages (running headers/footers)
  const pagesByText = new Map();
  for (const f of kept) {
    const k = norm(f.plain);
    if (!pagesByText.has(k)) pagesByText.set(k, new Set());
    pagesByText.get(k).add(f.page);
  }
  kept = kept.filter((f) => pagesByText.get(norm(f.plain)).size < 3);

  // group into lines (same page, similar top)
  kept.sort((a, b) => a.page - b.page || a.top - b.top || a.left - b.left);
  const lines = [];
  for (const f of kept) {
    const last = lines[lines.length - 1];
    if (last && last.page === f.page && Math.abs(last.top - f.top) <= 6) {
      last.segments.push(...f.segments);
      last.plain += f.plain;
      last.size = Math.max(last.size, f.font.size);
      last.height = Math.max(last.height, f.height);
    } else {
      lines.push({
        page: f.page,
        top: f.top,
        height: f.height,
        size: f.font.size,
        segments: [...f.segments],
        plain: f.plain,
      });
    }
  }

  // heading sizes: distinct sizes clearly above body, each used sparingly
  const totalChars = lines.reduce((n, l) => n + l.plain.length, 0);
  const charsBySize = new Map();
  for (const l of lines) charsBySize.set(l.size, (charsBySize.get(l.size) ?? 0) + l.plain.length);
  const headingSizes = [...charsBySize.entries()]
    .filter(([size, chars]) => size >= bodySize + 3 && chars < totalChars * 0.3)
    .map(([size]) => size)
    .sort((a, b) => b - a);
  const levelOf = (size) => {
    const idx = headingSizes.indexOf(size);
    if (idx === -1) return "p";
    // largest heading size is usually the article title itself when it appears
    return idx === 0 ? "h2" : "h3";
  };

  // merge lines into blocks
  const blocks = [];
  for (const line of lines) {
    const type = levelOf(line.size);
    const last = blocks[blocks.length - 1];
    const gap = last && last.page === line.page ? line.top - last.bottom : Infinity;
    const joinable =
      last &&
      last.type === type &&
      last.page === line.page &&
      gap >= -6 &&
      gap <= Math.max(line.height * 0.9, 14);
    if (joinable) {
      last.segments.push({ text: " " }, ...line.segments);
      last.bottom = line.top + line.height;
    } else {
      blocks.push({
        type,
        page: line.page,
        bottom: line.top + line.height,
        segments: [...line.segments],
      });
    }
  }

  // normalize: merge adjacent same-href segments, squash whitespace, drop junk
  const out = [];
  for (const b of blocks) {
    const segments = [];
    for (const s of b.segments) {
      const prev = segments[segments.length - 1];
      if (prev && prev.href === s.href) prev.text += s.text;
      else segments.push({ text: s.text, ...(s.href ? { href: s.href } : {}) });
    }
    for (const s of segments) s.text = s.text.replace(/\s+/g, " ");
    while (segments.length && !segments[0].text.trim()) segments.shift();
    while (segments.length && !segments[segments.length - 1].text.trim()) segments.pop();
    if (segments.length) {
      segments[0].text = segments[0].text.replace(/^\s+/, "");
      segments[segments.length - 1].text = segments[segments.length - 1].text.replace(/\s+$/, "");
    }
    const text = segments.map((s) => s.text).join("");
    if (isJunkBlock(text, segments)) continue;
    out.push({ type: b.type, segments });
  }
  return out;
}

// ---------- main ----------

const articles = [];
const seen = new Set();

for (const pdf of walk(SRC)) {
  const title = basename(pdf, ".pdf").trim();
  const category = basename(dirname(pdf));
  let slug = slugify(title);
  while (seen.has(slug)) slug += "-2";
  seen.add(slug);

  let blocks;
  try {
    blocks = buildBlocks(extract(pdf));
  } catch (e) {
    console.error(`FAILED: ${title}: ${e.message}`);
    continue;
  }

  // drop leading blocks duplicating the title
  const titleNorm = norm(title);
  while (blocks.length) {
    const t = norm(blocks[0].segments.map((s) => s.text).join(""));
    if (t.startsWith(titleNorm.slice(0, 40)) || titleNorm.startsWith(t.slice(0, 40)) && t.length > 15) blocks.shift();
    else break;
  }

  const totalChars = blocks
    .map((b) => b.segments.map((s) => s.text).join(""))
    .join(" ").length;
  if (totalChars < 400) {
    console.warn(`SKIPPED (too little text, likely image-based): ${category} / ${title}`);
    continue;
  }

  articles.push({
    slug,
    title,
    category: category === "Portfolio 2025" ? "Other" : category,
    blocks,
  });
  const h2s = blocks.filter((b) => b.type === "h2").length;
  const h3s = blocks.filter((b) => b.type === "h3").length;
  const links = blocks.reduce((n, b) => n + b.segments.filter((s) => s.href).length, 0);
  console.log(`OK: ${category} / ${title} (${blocks.length} blocks, ${h2s} h2, ${h3s} h3, ${links} links)`);
}

articles.sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
writeFileSync(OUT, JSON.stringify(articles, null, 1));
console.log(`\nWrote ${articles.length} articles to ${OUT}`);
