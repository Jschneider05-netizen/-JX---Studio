import { readJsonObject, RequestBodyError } from "@/lib/request-body";
import { buildSiteFiles, isSiteConfig, makeZip } from "@/lib/site-export";
import { rateLimited, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (tooManyRequests(request,"compile",20)) return rateLimited();
  try {
    const { configuration, format } = await readJsonObject(request, 2_500_000);
    if (!isSiteConfig(configuration)) return Response.json({ error: "Konfiguration fehlt oder ist ungültig." }, { status: 400 });
    const files = await buildSiteFiles(configuration, "Entwurf");
    if (format === "zip") return new Response(new Uint8Array(makeZip(files)), { headers: { "content-type": "application/zip", "content-disposition": "attachment; filename=JX-website-export.zip", "cache-control": "no-store" } });
    return Response.json({ files }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof RequestBodyError) return Response.json({ error: error.message }, { status: error.status });
    console.error("compile_site_failed");
    return Response.json({ error: "Vorschau-Code konnte nicht erstellt werden." }, { status: 500 });
  }
}
