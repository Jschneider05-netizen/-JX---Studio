import { buildSiteFiles, isSiteConfig } from "@/lib/site-export";
import { rateLimited, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (tooManyRequests(request,"compile",20)) return rateLimited();
  try {
    if (Number(request.headers.get("content-length") || 0) > 200_000) return Response.json({ error: "Konfiguration zu groß." }, { status: 413 });
    const { configuration } = await request.json() as { configuration?: unknown };
    if (!isSiteConfig(configuration)) return Response.json({ error: "Konfiguration fehlt oder ist ungültig." }, { status: 400 });
    const files = await buildSiteFiles(configuration, "Entwurf");
    return Response.json({ files }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("compile_site_failed", error);
    return Response.json({ error: "Vorschau-Code konnte nicht erstellt werden." }, { status: 500 });
  }
}
