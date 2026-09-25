import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { addonPrices, projectPrice } from "@/lib/pricing";
import { isSiteConfig } from "@/lib/site-export";
import { rateLimited, tooManyRequests } from "@/lib/rate-limit";

function checkoutAvailability() {
  const terms = process.env.PUBLIC_LEGAL_TERMS_URL || "";
  const privacy = process.env.PUBLIC_PRIVACY_URL || "";
  const validUrl = (value: string) => { try { return new URL(value).protocol === "https:"; } catch { return false; } };
  const enabled = process.env.DIRECT_CHECKOUT_ENABLED === "true" && Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.DATABASE_URL) && validUrl(terms) && validUrl(privacy);
  return { enabled, terms: enabled ? terms : "", privacy: enabled ? privacy : "" };
}

export async function GET() {
  return Response.json(checkoutAvailability(), { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  if (tooManyRequests(request,"checkout",8)) return rateLimited();
  try {
    const availability = checkoutAvailability();
    if (!availability.enabled) return Response.json({ error: "Direktbeauftragung ist noch nicht freigeschaltet. Bitte nutze die persönliche Anfrage." }, { status: 503 });
    const key = process.env.STRIPE_SECRET_KEY!;
    if (Number(request.headers.get("content-length") || 0) > 200_000) return Response.json({ error: "Konfiguration zu groß." }, { status: 413 });
    const body = await request.json() as { configuration?: unknown; estimatedPrice?: number };
    const configurationInput = body.configuration;
    if (!isSiteConfig(configurationInput)) return Response.json({ error: "Ungültige Konfiguration." }, { status: 400 });
    const siteConfig = configurationInput as { addons: string[]; care?: boolean; mode?: unknown; pages?: unknown; rush?: unknown; [key:string]: unknown };
    if (!Array.isArray(siteConfig.addons) || siteConfig.addons.some(key => typeof key !== "string")) return Response.json({ error: "Ungültige Erweiterungen." }, { status: 400 });
    const industryModuleKeys = new Set(["restaurant-reservations","restaurant-menu","restaurant-events","beauty-booking","beauty-team","tattoo-consultation","tattoo-gallery","realestate-listings","realestate-viewings","fitness-classes","fitness-trial","practice-appointments","auto-booking","auto-inventory","trade-estimator","cleaning-request"]);
    const unknownAddons = siteConfig.addons.filter(key => !(key in addonPrices) && !industryModuleKeys.has(key));
    if (unknownAddons.length) return Response.json({ error: "Unbekannte Erweiterung in der Konfiguration." }, { status: 400 });
    const quoteModules = siteConfig.addons.filter(key => industryModuleKeys.has(key));
    if (quoteModules.length) return Response.json({ error: "Mindestens eine Branchenfunktion benötigt vor der Zahlung eine persönliche Preisprüfung." }, { status: 409 });
    const amount = projectPrice(siteConfig);
    if (Math.round(Number(body.estimatedPrice)) !== amount) return Response.json({ error: "Der Projektpreis hat sich geändert. Bitte aktualisiere die Konfiguration." }, { status: 409 });
    const configuration = JSON.stringify({ ...siteConfig, orderSnapshot: { version: 1, capturedAt: new Date().toISOString() } });
    if (configuration.length > 180000) return Response.json({ error: "Die Konfiguration ist zu groß." }, { status: 413 });
    const db = getDb();
    // Check persistence before creating a payable session.
    await db.select({ id: orders.id }).from(orders).limit(1);
    const base = process.env.PUBLIC_SITE_URL || new URL(request.url).origin;
    const form = new URLSearchParams();
    const care = Boolean(siteConfig.care);
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
    try { await db.insert(orders).values({ stripeSessionId: session.id, amount, configuration, status: "pending" }); }
    catch (saveError) {
      console.error("checkout_order_save_failed", saveError);
      await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session.id)}/expire`, { method:"POST", headers:{Authorization:`Bearer ${key}`} }).catch(error => console.error("checkout_expire_failed", error));
      return Response.json({ error:"Auftrag konnte nicht gespeichert werden. Es wurde keine Zahlung gestartet." }, { status:503 });
    }
    return Response.json({ url: session.url });
  } catch (error) { console.error("checkout_failed", error); return Response.json({ error: "Checkout konnte gerade nicht gestartet werden." }, { status: 500 }); }
}
