import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { rateLimited, tooManyRequests } from "@/lib/rate-limit";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
async function sendNotification(input: { name:string; email:string; phone:string; company:string; subject:string; message:string; configuration:string|null; estimatedPrice:number|null; reference:string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || process.env.JXSTUDIO_FROM_EMAIL;
  const recipient = process.env.CONTACT_EMAIL;
  if (!apiKey || !from || !recipient) return { sent: false, reason: "E-Mail-Konfiguration unvollständig" };
  const configNote = input.configuration ? "\n\nBuilder-Konfiguration: im internen Projekt-Eingang gespeichert." : "";
  const body = `Neue Anfrage für JX Studio\n\nReferenz: ${input.reference}\nName: ${input.name}\nE-Mail: ${input.email}\nTelefon: ${input.phone || "–"}\nUnternehmen: ${input.company || "–"}\nThema: ${input.subject}\nRichtwert: ${input.estimatedPrice != null ? `${input.estimatedPrice} €` : "–"}\n\nNachricht:\n${input.message}${configNote}`;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [recipient], reply_to: input.email, subject: `[JX Studio] ${input.subject} · ${input.name}`, text: body }) });
  if (!response.ok) { const detail = await response.text(); console.error("contact_email_failed", response.status, detail); return { sent: false, reason: `E-Mail-Versand fehlgeschlagen (${response.status})` }; }
  return { sent: true };
}

export async function POST(request: Request) {
  if (tooManyRequests(request,"contact",12)) return rateLimited();
  try {
    if (Number(request.headers.get("content-length") || 0) > 200_000) return Response.json({ error: "Anfrage zu groß." }, { status: 413 });
    const body = (await request.json()) as Record<string, unknown>;
    const requestId = typeof body.requestId === "string" && /^[a-f0-9-]{36}$/i.test(body.requestId) ? body.requestId : null;
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const company = String(body.company ?? "").trim();
    const subject = String(body.subject ?? "Projektanfrage").trim();
    const source = String(body.source ?? (typeof body.configuration === "object" && body.configuration && "source" in body.configuration ? (body.configuration as {source?:unknown}).source : "contact") ?? "contact").slice(0,40);
    const message = String(body.message ?? "").trim();
    const configuration = body.configuration ? JSON.stringify(body.configuration) : null;
    if (configuration && configuration.length > 180000) return Response.json({ error: "Die Konfiguration ist zu groß." }, { status: 413 });
    const estimatedPrice = Number.isFinite(Number(body.estimatedPrice)) ? Math.round(Number(body.estimatedPrice)) : null;
    if (name.length < 2 || !emailPattern.test(email) || message.length < 10 || message.length > 10000) return Response.json({ error: "Bitte Name, eine gültige E-Mail und eine Nachricht zwischen 10 und 10.000 Zeichen angeben." }, { status: 400 });

    let reference = "";
    let savedToDatabase = false;
    try {
      const db = getDb();
      const [saved] = await db.insert(inquiries).values({ name: name.slice(0,120), email: email.slice(0,200), phone: phone.slice(0,80), company: company.slice(0,160), subject: subject.slice(0,160), message, configuration, estimatedPrice, status:"Neu", source, requestId, createdAt:new Date() }).onConflictDoNothing({target: inquiries.requestId}).returning({ id: inquiries.id });
      if (!saved && requestId) {
        const [existing] = await db.select({ id: inquiries.id, email: inquiries.email }).from(inquiries).where(eq(inquiries.requestId, requestId)).limit(1);
        if (existing && existing.email === email) return Response.json({ ok: true, reference: `JXS-${existing.id}`, savedToDatabase: true, alreadySubmitted: true }, { status: 200 });
        return Response.json({ error: "Anfragekennung wurde bereits verwendet." }, { status: 409 });
      }
      reference = `JXS-${saved.id}`;
      savedToDatabase = true;
    } catch (dbError) {
      console.error("contact_database_save_failed", dbError);
    }

    // A builder or assistant lead needs its full configuration in the database.
    // A notification alone cannot preserve that project for the admin workflow.
    if (configuration && !savedToDatabase) return Response.json({ error: "Die Projektkonfiguration konnte nicht gespeichert werden. Bitte versuche es später erneut." }, { status: 503 });

    // Once persisted, notification failures must never make the browser retry and duplicate the lead.
    let emailSent = false;
    try {
      const mail = await sendNotification({ name, email, phone, company, subject, message, configuration, estimatedPrice, reference: reference || "E-Mail-Anfrage" });
      emailSent = mail.sent;
      if (!mail.sent) console.warn("contact_email_not_sent", mail.reason);
    } catch (mailError) { console.error("contact_email_failed", mailError); }
    if (!savedToDatabase && !emailSent) return Response.json({ error: "Die Anfrage konnte nicht gespeichert oder per E-Mail versendet werden. Bitte versuche es später erneut." }, { status: 503 });
    return Response.json({ ok: true, reference: reference || "Per E-Mail gesendet", emailSent, savedToDatabase }, { status: 201 });
  } catch (error) {
    console.error("contact_submission_failed", error);
    return Response.json({ error: "Die Anfrage konnte gerade nicht gesendet werden. Bitte versuche es erneut." }, { status: 500 });
  }
}
