import { getDb } from "@/db";
import { inquiries } from "@/db/schema";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_RECIPIENT = "J.schneider.05@gmx.net";

async function sendNotification(input: { name:string; email:string; phone:string; company:string; subject:string; message:string; configuration:string|null; estimatedPrice:number|null; reference:string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY fehlt" };
  const from = process.env.MAIL_FROM || process.env.JXSTUDIO_FROM_EMAIL || "JX Studio <onboarding@resend.dev>";
  const recipient = process.env.CONTACT_EMAIL || DEFAULT_RECIPIENT;
  const configNote = input.configuration ? "\n\nBuilder-Konfiguration: im internen Projekt-Eingang gespeichert." : "";
  const body = `Neue Anfrage für JX Studio\n\nReferenz: ${input.reference}\nName: ${input.name}\nE-Mail: ${input.email}\nTelefon: ${input.phone || "–"}\nUnternehmen: ${input.company || "–"}\nThema: ${input.subject}\nRichtwert: ${input.estimatedPrice != null ? `${input.estimatedPrice} €` : "–"}\n\nNachricht:\n${input.message}${configNote}`;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [recipient], reply_to: input.email, subject: `[JX Studio] ${input.subject} · ${input.name}`, text: body }) });
  if (!response.ok) { const detail = await response.text(); console.error("contact_email_failed", response.status, detail); return { sent: false, reason: `E-Mail-Versand fehlgeschlagen (${response.status})` }; }
  return { sent: true };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const company = String(body.company ?? "").trim();
    const subject = String(body.subject ?? "Projektanfrage").trim();
    const source = String(body.source ?? (typeof body.configuration === "object" && body.configuration && "source" in body.configuration ? (body.configuration as {source?:unknown}).source : "contact") ?? "contact").slice(0,40);
    const message = String(body.message ?? "").trim();
    const configuration = body.configuration ? JSON.stringify(body.configuration).slice(0, 180000) : null;
    const estimatedPrice = Number.isFinite(Number(body.estimatedPrice)) ? Math.round(Number(body.estimatedPrice)) : null;
    if (name.length < 2 || !emailPattern.test(email) || message.length < 10) return Response.json({ error: "Bitte Name, eine gültige E-Mail und mindestens 10 Zeichen Nachricht angeben." }, { status: 400 });

    let reference = `JXS-${Date.now().toString().slice(-7)}`;
    try {
      const db = getDb();
      const [saved] = await db.insert(inquiries).values({ name: name.slice(0,120), email: email.slice(0,200), phone: phone.slice(0,80), company: company.slice(0,160), subject: subject.slice(0,160), message: message.slice(0,10000), configuration, estimatedPrice, status:"Neu", source, createdAt:new Date() }).returning({ id: inquiries.id });
      reference = `JXS-${saved.id}`;
    } catch (dbError) {
      console.error("contact_database_save_failed", dbError);
      // Testbetrieb: Eine fehlende lokale D1-Migration darf den E-Mail-Eingang nicht blockieren.
    }

    const mail = await sendNotification({ name, email, phone, company, subject, message, configuration, estimatedPrice, reference });
    if (!mail.sent) console.warn("contact_email_not_sent", mail.reason);
    return Response.json({ ok: true, reference, emailSent: mail.sent, recipient: process.env.CONTACT_EMAIL || DEFAULT_RECIPIENT }, { status: 201 });
  } catch (error) {
    console.error("contact_submission_failed", error);
    return Response.json({ error: "Die Anfrage konnte gerade nicht gesendet werden. Bitte versuche es erneut." }, { status: 500 });
  }
}
