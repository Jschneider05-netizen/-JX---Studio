import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.PUBLIC_SITE_URL || "https://jxstudio.de";
  return [{ url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
