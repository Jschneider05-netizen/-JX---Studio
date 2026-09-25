import { and, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { availability } from "@/db/schema";

const authorized = (request: Request) => Boolean(process.env.JXSTUDIO_ADMIN_KEY) && request.headers.get("x-admin-key") === process.env.JXSTUDIO_ADMIN_KEY;
export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Nicht autorisiert." }, { status: 401 });
  return Response.json({ slots: await getDb().select().from(availability).orderBy(availability.startsAt).limit(500) }, { headers: { "cache-control": "no-store" } });
}
export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Nicht autorisiert." }, { status: 401 });
  try {
    const body = await request.json() as { startsAt?: string; endsAt?: string };
    const startsAt = new Date(String(body.startsAt || "")), endsAt = new Date(String(body.endsAt || ""));
    const duration = endsAt.getTime() - startsAt.getTime();
    if (Number.isNaN(duration) || duration < 15 * 60000 || duration > 180 * 60000 || startsAt <= new Date() || startsAt.getTime() > Date.now() + 90 * 86400000) return Response.json({ error: "Termin muss künftig liegen und 15 bis 180 Minuten dauern." }, { status: 400 });
    const result = await getDb().transaction(async tx => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(8394107)`);
      const near = await tx.select().from(availability).where(and(eq(availability.status, "open"), gte(availability.startsAt, new Date(startsAt.getTime() - 3 * 3600000)), lte(availability.startsAt, new Date(endsAt.getTime() + 15 * 60000))));
      if (near.some(slot => startsAt.getTime() < slot.endsAt.getTime() + 15 * 60000 && endsAt.getTime() + 15 * 60000 > slot.startsAt.getTime())) return null;
      const [slot] = await tx.insert(availability).values({ startsAt, endsAt }).returning();
      return slot;
    });
    return result ? Response.json({ slot: result }, { status: 201 }) : Response.json({ error: "Dieser Zeitraum überschneidet sich mit einem anderen Termin." }, { status: 409 });
  } catch (error) { console.error("admin_availability_failed", error); return Response.json({ error: "Termin konnte nicht angelegt werden." }, { status: 503 }); }
}
export async function DELETE(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Nicht autorisiert." }, { status: 401 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return Response.json({ error: "Ungültige ID." }, { status: 400 });
  await getDb().update(availability).set({ status: "blocked" }).where(eq(availability.id, id));
  return Response.json({ ok: true });
}
