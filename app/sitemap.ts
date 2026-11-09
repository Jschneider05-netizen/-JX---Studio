import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!base) return [];
  return ["", "/templates", "/leistungen", "/beratung", "/kontakt", "/impressum", "/datenschutz", "/praxis-demo"].map((path, index) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "monthly" as const,
    priority: index === 0 ? 1 : 0.6,
  }));
}
