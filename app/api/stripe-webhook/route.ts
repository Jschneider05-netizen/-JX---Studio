import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, projects, projectVersions, invoices } from "@/db/schema";

export const runtime = "nodejs";
type StripeSession = { id?:string; customer_details?:{email?:string}; payment_status?:string; subscription?:string|null };
type StripeInvoice = { id?:string; subscription?:string; customer_email?:string; amount_paid?:number; currency?:string; hosted_invoice_url?:string; invoice_pdf?:string; period_start?:number; period_end?:number };
type StripeEvent = { type?:string; data?:{object?:StripeSession & StripeInvoice} };

function valid(raw:string, signature:string, secret:string) {
  const parts = Object.fromEntries(signature.split(",").map(item => item.split("=", 2))) as Record<string,string>;
  const timestamp = Number(parts.t);
  if (!Number.isSafeInteger(timestamp) || Math.abs(Date.now()/1000 - timestamp) > 300 || !/^[a-f0-9]{64}$/i.test(parts.v1 || "")) return false;
  const expected = createHmac("sha256", secret).update(`${parts.t}.${raw}`).digest();
  const received = Buffer.from(parts.v1, "hex");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

async function sendPortalInvite(email:string, token:string) {
  const key=process.env.RESEND_API_KEY, from=process.env.MAIL_FROM, base=process.env.PUBLIC_SITE_URL;
  if (!key || !from || !base || !email) return;
  const link = `${base.replace(/\/$/, "")}/portal?token=${token}`;
  try {
    const response = await fetch("https://api.resend.com/emails", {method:"POST",headers:{Authorization:`Bearer ${key}`,"content-type":"application/json"},body:JSON.stringify({from,to:[email],subject:"Dein JX Studio Projektportal",text:`Dein Projekt wurde angelegt. Deinen persönlichen Projektstand findest du hier:\n${link}\n\nBitte behandle diesen Link vertraulich.`})});
    if (!response.ok) console.error("portal_invite_failed",response.status);
  } catch (error) { console.error("portal_invite_failed",error); }
}

export async function POST(request: Request) {
  const secret=process.env.STRIPE_WEBHOOK_SECRET, signature=request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Invalid webhook",{status:400});
  const raw=await request.text();
  if (!valid(raw,signature,secret)) return new Response("Invalid webhook",{status:400});
  try {
    const event=JSON.parse(raw) as StripeEvent;
    const object=event.data?.object;
    if (!object) return Response.json({received:true});
    const db=getDb();
    if ((event.type==="checkout.session.completed" && (object.payment_status==="paid" || object.payment_status==="no_payment_required")) || event.type==="checkout.session.async_payment_succeeded") {
      if (!object.id) return Response.json({received:true});
      const email=object.customer_details?.email || "";
      const invite=await db.transaction(async tx => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(8394108)`);
        await tx.update(orders).set({status:"paid",customerEmail:email,stripeSubscriptionId:object.subscription || null,invoiceStatus:object.subscription ? "active" : "not_applicable"}).where(eq(orders.stripeSessionId,object.id!));
        const [order]=await tx.select().from(orders).where(eq(orders.stripeSessionId,object.id!)).limit(1);
        if (!order) throw new Error("Paid Stripe session has no stored order");
        const [existing]=await tx.select().from(projects).where(eq(projects.orderId,order.id)).limit(1);
        if (existing) return null;
        const token=randomBytes(24).toString("hex");
        const [project]=await tx.insert(projects).values({orderId:order.id,customerEmail:email,name:"JX Studio Website-Projekt",status:"paid",configuration:order.configuration,portalToken:token}).returning({id:projects.id});
        await tx.insert(projectVersions).values({projectId:project.id,version:1,configuration:order.configuration,note:"Projekt aus bezahltem Checkout erstellt"});
        return {email,token};
      });
      if (invite) await sendPortalInvite(invite.email,invite.token);
    }
    if (event.type==="invoice.payment_failed" && object.subscription) await db.update(orders).set({invoiceStatus:"payment_failed"}).where(eq(orders.stripeSubscriptionId,object.subscription));
    if (event.type==="invoice.paid" && object.subscription && object.id) {
      await db.update(orders).set({invoiceStatus:"active"}).where(eq(orders.stripeSubscriptionId,object.subscription));
      const [order]=await db.select().from(orders).where(eq(orders.stripeSubscriptionId,object.subscription)).limit(1);
      if (order) await db.insert(invoices).values({orderId:order.id,stripeInvoiceId:object.id,customerEmail:object.customer_email||order.customerEmail,amount:Number(object.amount_paid||0),currency:String(object.currency||"eur"),status:"paid",hostedUrl:object.hosted_invoice_url||null,pdfUrl:object.invoice_pdf||null,periodStart:object.period_start?new Date(object.period_start*1000):null,periodEnd:object.period_end?new Date(object.period_end*1000):null}).onConflictDoNothing();
    }
    if (event.type==="customer.subscription.deleted" && object.id) await db.update(orders).set({invoiceStatus:"cancelled"}).where(eq(orders.stripeSubscriptionId,object.id));
    return Response.json({received:true});
  } catch(error) { console.error("stripe_webhook_failed",error); return new Response("Webhook failed",{status:500}); }
}
