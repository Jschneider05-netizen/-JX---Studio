import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { buildSiteFiles, isSiteConfig, makeZip } from "@/lib/site-export";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const configured = process.env.JXSTUDIO_ADMIN_KEY;
  if (!configured || request.headers.get("x-admin-key") !== configured) return Response.json({ error:"Nicht autorisiert." }, { status:401 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return Response.json({ error:"Ungültige Anfrage." }, { status:400 });
  try {
    const [row] = await getDb().select().from(inquiries).where(eq(inquiries.id,id)).limit(1);
    if (!row?.configuration) return Response.json({ error:"Diese Anfrage enthält keine Builder-Konfiguration." }, { status:404 });
    let config: unknown;
    try { config = JSON.parse(row.configuration); } catch { return Response.json({ error:"Gespeicherte Konfiguration ist beschädigt." }, { status:422 }); }
    if (!isSiteConfig(config)) return Response.json({ error:"Ungültige Konfiguration." }, { status:422 });
    const files = await buildSiteFiles(config, String(id));
    return new Response(new Uint8Array(makeZip(files)), {headers:{"content-type":"application/zip","content-disposition":`attachment; filename=JXS-${id}-website.zip`,"cache-control":"no-store"}});
  } catch (error) {
    console.error("site_export_failed", error);
    return Response.json({ error:"Website-Export konnte nicht erstellt werden." }, { status:500 });
  }
}
