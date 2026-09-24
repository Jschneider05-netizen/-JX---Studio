import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { appointments } from "@/db/schema";
const auth=(r:Request)=>Boolean(process.env.JXSTUDIO_ADMIN_KEY)&&r.headers.get("x-admin-key")===process.env.JXSTUDIO_ADMIN_KEY;
export async function GET(r:Request){if(!auth(r))return Response.json({error:"Nicht autorisiert."},{status:401});return Response.json({appointments:await getDb().select().from(appointments).orderBy(desc(appointments.startsAt))});}
export async function PATCH(r:Request){if(!auth(r))return Response.json({error:"Nicht autorisiert."},{status:401});const b=await r.json() as {id?:number;status?:string};if(!Number.isInteger(b.id)||!b.status)return Response.json({error:"ID und Status fehlen."},{status:400});const allowed=new Set(["booked","confirmed","completed","cancelled","no_show"]);if(!allowed.has(b.status))return Response.json({error:"Ungültiger Status."},{status:400});await getDb().update(appointments).set({status:b.status}).where(eq(appointments.id,b.id!));return Response.json({ok:true});}
