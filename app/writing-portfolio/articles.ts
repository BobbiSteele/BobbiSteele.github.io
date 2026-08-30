import articlesData from "./articles.json";

export type Segment = {
  text: string;
  href?: string;
};

export type Block = {
  type: "h2" | "h3" | "p";
  segments: Segment[];
};

export type Article = {
  slug: string;
  title: string;
  category: string;
  blocks: Block[];
};

export const articles = (articlesData as Article[]).filter(
  (a) => a.category !== "Google Ads (no longer active)"
);

export const CATEGORY_ORDER = [
  "Drone industry",
  "AI-vision software - Robotics - B2B SaaS",
  "Logistics",
  "Insurance (B2C)",
  "Pride campaign - Feather (B2C)",
  "Employer branding",
  "Press Releases",
  "German examples",
];

export function articlesByCategory(): Map<string, Article[]> {
  const map = new Map<string, Article[]>();
  const order = [
    ...CATEGORY_ORDER,
    ...[...new Set(articles.map((a) => a.category))].filter(
      (c) => !CATEGORY_ORDER.includes(c)
    ),
  ];
  for (const category of order) {
    const items = articles.filter((a) => a.category === category);
    if (items.length) map.set(category, items);
  }
  return map;
}

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getCategoryBySlug(slug: string): string | undefined {
  return [...articlesByCategory().keys()].find((c) => categorySlug(c) === slug);
}
