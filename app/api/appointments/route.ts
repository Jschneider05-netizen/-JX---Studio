import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { appointments, availability } from "@/db/schema";
import { rateLimited, tooManyRequests } from "@/lib/rate-limit";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hour = 60 * 60 * 1000;
const day = 24 * hour;
const buffer = 15 * 60 * 1000;
const activeStatuses = ["booked", "confirmed"];

function overlaps(start: Date, end: Date, appointment: { startsAt: Date; durationMinutes: number }) {
  const otherStart = appointment.startsAt.getTime();
  const otherEnd = otherStart + appointment.durationMinutes * 60_000;
  return start.getTime() < otherEnd + buffer && end.getTime() + buffer > otherStart;
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const now = Date.now();
    const from = new Date(params.get("from") || now);
    const to = new Date(params.get("to") || now + 60 * day);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from || to.getTime() - from.getTime() > 90 * day) return Response.json({ error: "Ungültiger Zeitraum." }, { status: 400 });
    const db = getDb();
    const [slots, booked] = await Promise.all([
      db.select().from(availability).where(and(eq(availability.status, "open"), gte(availability.startsAt, new Date(Math.max(now, from.getTime()))), lte(availability.startsAt, to))),
      db.select({ startsAt: appointments.startsAt, durationMinutes: appointments.durationMinutes }).from(appointments).where(and(inArray(appointments.status, activeStatuses), gte(appointments.startsAt, new Date(from.getTime() - day)), lte(appointments.startsAt, new Date(to.getTime() + day)))),
    ]);
    return Response.json({ slots: slots.filter(slot => slot.endsAt > slot.startsAt && !booked.some(item => overlaps(slot.startsAt, slot.endsAt, item))) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("appointment_availability_failed", error);
    return Response.json({ error: "Freie Termine konnten nicht geladen werden." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (tooManyRequests(request,"appointments",20)) return rateLimited();
  try {
    if (Number(request.headers.get("content-length") || 0) > 20_000) return Response.json({ error: "Anfrage zu groß." }, { status: 413 });
    const body = await request.json() as Record<string, unknown>;
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const startsAt = new Date(String(body.startsAt || ""));
    const now = Date.now();
    if (name.length < 2 || !emailPattern.test(email) || Number.isNaN(startsAt.getTime()) || startsAt.getTime() < now + hour || startsAt.getTime() > now + 90 * day) return Response.json({ error: "Bitte Name, gültige E-Mail und einen künftigen Termin angeben." }, { status: 400 });
    const result = await getDb().transaction(async tx => {
      // Serialize booking decisions across instances, including overlapping availability slots.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(8394107)`);
      const [slot] = await tx.select().from(availability).where(and(eq(availability.status, "open"), eq(availability.startsAt, startsAt))).limit(1);
      if (!slot || slot.endsAt <= slot.startsAt) return null;
      const existing = await tx.select({ startsAt: appointments.startsAt, durationMinutes: appointments.durationMinutes }).from(appointments).where(and(inArray(appointments.status, activeStatuses), gte(appointments.startsAt, new Date(startsAt.getTime() - day)), lte(appointments.startsAt, new Date(slot.endsAt.getTime() + buffer))));
      if (existing.some(item => overlaps(slot.startsAt, slot.endsAt, item))) return null;
      const durationMinutes = Math.round((slot.endsAt.getTime() - slot.startsAt.getTime()) / 60_000);
      if (durationMinutes < 15 || durationMinutes > 180) return null;
      const [created] = await tx.insert(appointments).values({
        name: name.slice(0, 120), email: email.slice(0, 200),
        phone: String(body.phone || "").slice(0, 80), company: String(body.company || "").slice(0, 160),
        projectType: String(body.projectType || "Website").slice(0, 100), startsAt,
        durationMinutes, notes: String(body.notes || "").slice(0, 4000),
      }).returning({ id: appointments.id });
      return created;
    });
    if (!result) return Response.json({ error: "Dieser Termin ist nicht mehr verfügbar." }, { status: 409 });
    return Response.json({ ok: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error("appointment_failed", error);
    const message = error instanceof Error ? error.message : "";
    if (message.includes("appointments_active_start_unique") || message.includes("duplicate key")) return Response.json({ error: "Dieser Termin wurde gerade vergeben." }, { status: 409 });
    return Response.json({ error: "Termin konnte nicht gebucht werden." }, { status: 503 });
  }
}
