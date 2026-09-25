import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projects, projectVersions, invoices } from "@/db/schema";

const getToken = (request: Request) => new URL(request.url).searchParams.get("token") || request.headers.get("x-portal-token") || "";
const noStore = { "cache-control": "private, no-store", "referrer-policy": "no-referrer" };

export async function GET(request: Request) {
  const token = getToken(request);
  if (!/^[a-f0-9]{48}$/i.test(token)) return Response.json({ error: "Portal-Link fehlt oder ist ungültig." }, { status: 400 });
  try {
    const db = getDb();
    const [project] = await db.select().from(projects).where(eq(projects.portalToken, token)).limit(1);
    if (!project) return Response.json({ error: "Projekt nicht gefunden." }, { status: 404 });
    const [versions, bills] = await Promise.all([
      db.select().from(projectVersions).where(eq(projectVersions.projectId, project.id)).orderBy(projectVersions.version),
      db.select().from(invoices).where(eq(invoices.orderId, project.orderId ?? -1)),
    ]);
    const { portalToken: _secret, ...safeProject } = project;
    void _secret;
    return Response.json({ project: { ...safeProject, configuration: JSON.parse(project.configuration || "{}") }, versions: versions.map(v => ({ id:v.id, version:v.version, note:v.note, createdAt:v.createdAt })), invoices:bills }, { headers: noStore });
  } catch (error) { console.error("portal_project_failed", error); return Response.json({ error: "Projekt konnte nicht geladen werden." }, { status: 503 }); }
}

export async function PATCH(request: Request) {
  const token = getToken(request);
  if (!/^[a-f0-9]{48}$/i.test(token)) return Response.json({ error: "Portal-Link fehlt oder ist ungültig." }, { status: 400 });
  try {
    const body = await request.json() as { action?: string };
    const approvalStatus = body.action === "approve" ? "approved" : body.action === "changes" ? "changes_requested" : null;
    if (!approvalStatus) return Response.json({ error: "Ungültige Aktion." }, { status: 400 });
    const [project] = await getDb().update(projects).set({ approvalStatus, updatedAt:new Date() }).where(eq(projects.portalToken, token)).returning({id:projects.id});
    return project ? Response.json({ ok:true, approvalStatus }, { headers: noStore }) : Response.json({ error:"Projekt nicht gefunden." }, { status:404 });
  } catch (error) { console.error("portal_approval_failed", error); return Response.json({ error:"Freigabe konnte nicht gespeichert werden." }, { status:503 }); }
}
