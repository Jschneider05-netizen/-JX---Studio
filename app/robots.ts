import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!base) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/portal", "/builder", "/api/"] }], sitemap: `${base}/sitemap.xml` };
}
