import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries, orders } from "@/db/schema";

const allowedStatuses = new Set(["Neu", "Kontaktiert", "In Klärung", "Angebot", "Gewonnen", "Abgelehnt", "Archiviert"]);

function authorize(request: Request) {
  const configured = process.env.JXSTUDIO_ADMIN_KEY;
  if (!configured) return { ok: false as const, status: 503, error: "Der Projekt-Eingang ist noch nicht freigeschaltet. JXSTUDIO_ADMIN_KEY fehlt." };
  const supplied = request.headers.get("x-admin-key") ?? "";
  if (supplied !== configured) return { ok: false as const, status: 401, error: "Zugangsschlüssel ungültig." };
  return { ok: true as const };
}

export async function GET(request: Request) {
  const auth = authorize(request);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  try {
    const db = getDb();
    const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(250);
    const orderRows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
    return Response.json({ inquiries: rows.map((row: any) => ({ ...row, configuration: row.configuration ? safeParse(row.configuration) : null })), orders: orderRows.map((row:any)=>({...row, configuration: safeParse(row.configuration)})) });
  } catch (error) {
    console.error("inquiries_fetch_failed", error);
    return Response.json({ error: "Anfragen konnten nicht geladen werden. Prüfe Datenbank und Migrationen." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = authorize(request);
  if (!auth.ok) return Response.json({ error: auth.error }, { status: auth.status });
  try {
    const body = await request.json() as { id?: number; status?: string };
    const id = Number(body.id);
    const status = String(body.status ?? "");
    if (!Number.isInteger(id) || id <= 0 || !allowedStatuses.has(status)) return Response.json({ error: "Ungültige Statusänderung." }, { status: 400 });
    const db = getDb();
    await db.update(inquiries).set({ status }).where(eq(inquiries.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    console.error("inquiry_status_failed", error);
    return Response.json({ error: "Status konnte nicht gespeichert werden." }, { status: 500 });
  }
}

function safeParse(value: string) {
  try { return JSON.parse(value); } catch { return { raw: value }; }
}
