import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const recipient = "bremen.ost.hausaerzte@gmail.com";
const allowedConcerns = new Set(["Allgemeine Kontaktanfrage", "Terminvereinbarung", "Rezept", "Überweisung"]);
const allowedSpecialties = new Set(["Allgemeinmedizin", "Innere Medizin", "Kardiologie", "Neurologie", "Orthopädie", "Dermatologie", "Augenheilkunde", "HNO", "Urologie", "Gynäkologie", "Radiologie", "Gastroenterologie", "Pneumologie", "Sonstige"]);
const buckets = new Map<string, { count: number; until: number }>();
const reply = (data: object, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
const ready = () => Boolean(process.env.PRAXIS_RESEND_API_KEY && process.env.PRAXIS_MAIL_FROM && process.env.PRAXIS_MAIL_ENABLED === "true");
export async function GET() { return reply({ available: ready() }); }

export async function POST(request: NextRequest) {
  const reject = (message: string, status: number) => reply({ ok: false, message }, status);
  if (!ready()) return reject("Der Online-Versand ist derzeit nicht verfügbar.", 503);
  const origins = (process.env.PRAXIS_ALLOWED_ORIGINS || "https://jx-studio.de,https://www.jx-studio.de").split(",").map(x => x.trim());
  if (!origins.includes(request.headers.get("origin") || "")) return reject("Unzulässige Anfrage.", 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return reject("Ungültiges Anfrageformat.", 415);
  if (Number(request.headers.get("content-length") || 0) > 12000) return reject("Die Nachricht ist zu lang.", 413);
  const now = Date.now();
  for (const [key, value] of buckets) if (value.until <= now) buckets.delete(key);
  const ip = request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() || "unknown";
  const key = createHash("sha256").update(ip).digest("hex");
  const bucket = buckets.get(key) || { count: 0, until: now + 600000 };
  if (bucket.count >= 5 || buckets.size > 10000) return reject("Bitte warten Sie einige Minuten und versuchen Sie es erneut.", 429);
  bucket.count++; buckets.set(key, bucket);
  try {
    const reader = request.body?.getReader();
    if (!reader) return reject("Ungültige Anfrage.", 400);
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if(size > 12000){ await reader.cancel(); return reject("Die Nachricht ist zu lang.",413); } chunks.push(value); }
    const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const field = (key: string, limit: number) => typeof input[key] === "string" && input[key].length <= limit ? input[key].trim() : "";
    if (input.website) return reject("Ungültige Anfrage.", 400);
    const name = field("name", 100), email = field("email", 254), concern = field("concern", 60), message = field("message", 2000), specialty = field("specialty", 80), other = field("other", 150);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !allowedConcerns.has(concern) || !message || input.consent !== true) return reject("Bitte prüfen Sie Ihre Eingaben.", 400);
    if(concern === "Überweisung" && (!allowedSpecialties.has(specialty) || (specialty === "Sonstige" && !other))) return reject("Bitte wählen Sie eine Fachrichtung aus.",400);
    const text = ["Organisatorische Anfrage über die Praxiswebsite", `Name: ${name}`, `E-Mail: ${email}`, `Anliegen: ${concern}`, ...(concern === "Überweisung" ? [`Fachrichtung: ${specialty === "Sonstige" ? other : specialty}`] : []), "", message].join("\n");
    const res = await fetch("https://api.resend.com/emails", {method:"POST", headers:{Authorization:`Bearer ${process.env.PRAXIS_RESEND_API_KEY}`,"Content-Type":"application/json"}, body:JSON.stringify({from:process.env.PRAXIS_MAIL_FROM,to:[recipient],reply_to:email,subject:"Neue organisatorische Anfrage – Hausärzte Bremen Ost",text}),signal:AbortSignal.timeout(12000)});
    if(!res.ok) return reject("Der Versand war derzeit nicht möglich. Bitte rufen Sie uns an.",502);
    const result = await res.json() as { id?: string; message?: string; error?: string }; if(!result.id) return reject("Der Versand konnte nicht bestätigt werden.",502);
    return reply({ok:true});
  } catch { return reject("Die Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.",400); }
}
