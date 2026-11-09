import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { appointments } from "@/db/schema";
import { authorized } from "@/lib/admin-auth";
import { readJsonObject, RequestBodyError } from "@/lib/request-body";
export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error:"Nicht autorisiert." },{status:401});
  try { return Response.json({appointments:await getDb().select().from(appointments).orderBy(desc(appointments.startsAt)).limit(500)}, {headers:{"cache-control":"private, no-store"}}); }
  catch { return Response.json({error:"Termine konnten nicht geladen werden."},{status:503}); }
}
export async function PATCH(request: Request) {
  if (!authorized(request)) return Response.json({error:"Nicht autorisiert."},{status:401});
  try {
    const body=await readJsonObject(request,4000);
    if (!Number.isInteger(body.id) || Number(body.id)<=0 || !["booked","confirmed","completed","cancelled","no_show"].includes(String(body.status))) return Response.json({error:"Ungültige Statusänderung."},{status:400});
    const rows=await getDb().update(appointments).set({status:String(body.status)}).where(eq(appointments.id,Number(body.id))).returning({id:appointments.id});
    return rows.length ? Response.json({ok:true}) : Response.json({error:"Termin nicht gefunden."},{status:404});
  } catch(error) { return Response.json({error:error instanceof RequestBodyError ? error.message : "Termin konnte nicht aktualisiert werden."},{status:error instanceof RequestBodyError ? error.status : 503}); }
}
