import { getDb } from "@/db";
import { orders } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return Response.json({ error: "Direktzahlung ist noch nicht freigeschaltet." }, { status: 503 });
    const body = await request.json() as { configuration?: any; estimatedPrice?: number };
    const amount = Math.round(Number(body.estimatedPrice));
    if (!body.configuration || !Number.isFinite(amount) || amount < 100) return Response.json({ error: "Ungültige Konfiguration oder Preis." }, { status: 400 });
    const configuration = JSON.stringify(body.configuration).slice(0, 180000);
    const base = process.env.PUBLIC_SITE_URL || new URL(request.url).origin;
    const form = new URLSearchParams();
    const care = Boolean(body.configuration?.care);
    form.set("mode", care ? "subscription" : "payment"); form.set("line_items[0][quantity]","1"); form.set("line_items[0][price_data][currency]","eur");
    form.set("line_items[0][price_data][unit_amount]",String(amount*100)); form.set("line_items[0][price_data][product_data][name]","JX Studio Website-Projekt");
    form.set("line_items[0][price_data][product_data][description]","Website gemäß gespeicherter JX-Builder-Konfiguration");
    if (!care) form.set("customer_creation","always");
    if (care) {
      form.set("line_items[1][quantity]","1");
      form.set("line_items[1][price_data][currency]","eur");
      form.set("line_items[1][price_data][unit_amount]","4999");
      form.set("line_items[1][price_data][recurring][interval]","month");
      form.set("line_items[1][price_data][product_data][name]","JX Care");
      form.set("line_items[1][price_data][product_data][description]","Laufende Betreuung gemäß vereinbartem Leistungsumfang");
      form.append("payment_method_types[]","card");
      form.append("payment_method_types[]","sepa_debit");
      form.set("subscription_data[metadata][source]","jx-care");
    }
    form.set("billing_address_collection","required");
    form.set("success_url",`${base}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`); form.set("cancel_url",`${base}/?checkout=cancelled`); form.set("metadata[source]","jx-builder");
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", { method:"POST", headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/x-www-form-urlencoded"}, body:form });
    const session = await stripeResponse.json() as {id?:string;url?:string;error?:{message?:string}};
    if(!stripeResponse.ok || !session.id || !session.url) throw new Error(session.error?.message || "Stripe Checkout konnte nicht erstellt werden.");
    const db = getDb(); await db.insert(orders).values({ stripeSessionId: session.id, amount, configuration, status: "pending" });
    return Response.json({ url: session.url });
  } catch (error) { console.error("checkout_failed", error); return Response.json({ error: "Checkout konnte gerade nicht gestartet werden." }, { status: 500 }); }
}
