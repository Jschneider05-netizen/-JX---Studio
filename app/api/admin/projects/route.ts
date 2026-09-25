import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projects, projectVersions } from "@/db/schema";

const authorized = (request: Request) => Boolean(process.env.JXSTUDIO_ADMIN_KEY) && request.headers.get("x-admin-key") === process.env.JXSTUDIO_ADMIN_KEY;
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
