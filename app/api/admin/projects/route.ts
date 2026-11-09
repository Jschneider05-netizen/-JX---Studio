import { randomBytes } from "node:crypto";
import { readJsonObject, RequestBodyError } from "@/lib/request-body";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { projects, projectVersions, inquiries } from "@/db/schema";

import { authorized } from "@/lib/admin-auth";
const statuses = new Set(["draft", "paid", "planning", "in_progress", "review", "completed", "on_hold", "cancelled"]);
const approvals = new Set(["pending", "approved", "changes_requested"]);

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Nicht autorisiert." }, { status: 401 });
  try { return Response.json({ projects: await getDb().select().from(projects).orderBy(desc(projects.updatedAt)).limit(200) }, { headers: { "cache-control": "no-store" } }); }
  catch (error) { console.error("admin_projects_failed", error); return Response.json({ error: "Projekte konnten nicht geladen werden." }, { status: 503 }); }
}

export async function PATCH(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Nicht autorisiert." }, { status: 401 });
  try {
    const body = await request.json() as { id?: number; status?: string; approvalStatus?: string; configuration?: unknown; note?: string };
    if (!Number.isInteger(body.id) || Number(body.id) <= 0) return Response.json({ error: "Projekt-ID fehlt." }, { status: 400 });
    if (body.status !== undefined && !statuses.has(body.status)) return Response.json({ error: "Ungültiger Status." }, { status: 400 });
    if (body.approvalStatus !== undefined && !approvals.has(body.approvalStatus)) return Response.json({ error: "Ungültige Freigabe." }, { status: 400 });
    const serialized = body.configuration === undefined ? null : JSON.stringify(body.configuration);
    if (serialized && serialized.length > 300000) return Response.json({ error: "Konfiguration zu groß." }, { status: 413 });
    const db = getDb();
    const result = await db.transaction(async tx => {
      const [project] = await tx.select().from(projects).where(eq(projects.id, Number(body.id))).for("update").limit(1);
      if (!project) return null;
      const patch: Partial<typeof projects.$inferInsert> = { updatedAt: new Date() };
      if (body.status !== undefined) patch.status = body.status;
      if (body.approvalStatus !== undefined) patch.approvalStatus = body.approvalStatus;
      if (serialized) {
        patch.configuration = serialized;
        patch.version = project.version + 1;
        await tx.insert(projectVersions).values({ projectId: project.id, version: patch.version, configuration: serialized, note: String(body.note || "Admin update").slice(0, 500) });
      }
      await tx.update(projects).set(patch).where(eq(projects.id, project.id));
      return { id: project.id, version: patch.version ?? project.version };
    });
    return result ? Response.json({ ok: true, ...result }) : Response.json({ error: "Projekt nicht gefunden." }, { status: 404 });
  } catch (error) { console.error("admin_project_update_failed", error); return Response.json({ error: "Projekt konnte nicht gespeichert werden." }, { status: 503 }); }
}

// Creating a managed project is an explicit admin action, independent of payments.
export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({error:"Nicht autorisiert."},{status:401});
  try {
    const body=await readJsonObject(request,4000);
    const inquiryId=Number(body.inquiryId);
    if (!Number.isInteger(inquiryId)||inquiryId<=0) return Response.json({error:"Ungültige Anfrage-ID."},{status:400});
    const project=await getDb().transaction(async tx=>{
      await tx.execute(sql`SELECT pg_advisory_xact_lock(8394108)`);
      const [existing]=await tx.select().from(projects).where(eq(projects.inquiryId,inquiryId)).limit(1);
      if (existing) return existing;
      const [inquiry]=await tx.select().from(inquiries).where(eq(inquiries.id,inquiryId)).limit(1);
      if (!inquiry) return null;
      const [created]=await tx.insert(projects).values({inquiryId,customerEmail:inquiry.email,name:inquiry.company||inquiry.name,configuration:inquiry.configuration||"{}",portalToken:randomBytes(24).toString("hex"),status:"planning"}).returning();
      await tx.insert(projectVersions).values({projectId:created.id,version:1,configuration:created.configuration,note:"Aus Projektanfrage angelegt"});
      return created;
    });
    return project?Response.json({project},{status:201,headers:{"cache-control":"private, no-store"}}):Response.json({error:"Anfrage nicht gefunden."},{status:404});
  } catch(error) { return Response.json({error:error instanceof RequestBodyError?error.message:"Projekt konnte nicht angelegt werden."},{status:error instanceof RequestBodyError?error.status:503}); }
}
