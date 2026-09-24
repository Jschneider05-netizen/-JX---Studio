import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { availability } from "@/db/schema";
const auth=(r:Request)=>Boolean(process.env.JXSTUDIO_ADMIN_KEY)&&r.headers.get("x-admin-key")===process.env.JXSTUDIO_ADMIN_KEY;
export async function GET(r:Request){if(!auth(r))return Response.json({error:"Nicht autorisiert."},{status:401});return Response.json({slots:await getDb().select().from(availability).orderBy(availability.startsAt)});}
export async function POST(r:Request){if(!auth(r))return Response.json({error:"Nicht autorisiert."},{status:401});const b=await r.json() as any;const startsAt=new Date(b.startsAt),endsAt=new Date(b.endsAt);if(Number.isNaN(startsAt.getTime())||Number.isNaN(endsAt.getTime())||endsAt<=startsAt)return Response.json({error:"Ungültiger Zeitraum."},{status:400});const [slot]=await getDb().insert(availability).values({startsAt,endsAt}).returning();return Response.json({slot});}
export async function DELETE(r:Request){if(!auth(r))return Response.json({error:"Nicht autorisiert."},{status:401});const id=Number(new URL(r.url).searchParams.get("id"));if(!Number.isInteger(id))return Response.json({error:"Ungültige ID."},{status:400});await getDb().delete(availability).where(eq(availability.id,id));return Response.json({ok:true});}
