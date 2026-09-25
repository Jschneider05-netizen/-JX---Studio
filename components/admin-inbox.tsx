"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, ShieldCheck } from "lucide-react";
import { toast, Toaster } from "sonner";
import { ConfigurationPreview } from "@/components/jx-studio";

type Inquiry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  configuration: unknown;
  estimatedPrice: number | null;
  status: string;
  source: string;
  createdAt: string | number;
};

type Order = { id:number; stripeSessionId:string; customerEmail:string; amount:number; currency:string; status:string; configuration:unknown; createdAt:string|number };
type Appointment = { id:number; name:string; email:string; phone:string; company:string; projectType:string; startsAt:string; durationMinutes:number; status:string; notes:string };
type Project = { id:number; orderId:number|null; customerEmail:string; name:string; status:string; version:number; approvalStatus:string; portalToken:string; updatedAt:string };
type Slot = { id:number; startsAt:string; endsAt:string; status:string };

const statuses = ["Neu", "Kontaktiert", "In Klärung", "Angebot", "Gewonnen", "Abgelehnt", "Archiviert"];


function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function textValue(value: unknown) { return typeof value === "string" ? value : ""; }
function stringList(value: unknown) { return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []; }

function OrderConfigurationSummary({ configuration }: { configuration: unknown }) {
  const cfg=record(configuration); const req=record(cfg.requirements); const business=record(req.business); const domain=record(req.domain); const contact=record(req.contactForm); const appointments=record(req.appointments); const menu=record(req.restaurantMenu); const content=record(req.contentPlan);
  const pages=Array.isArray(cfg.pages)?cfg.pages.map(p=>textValue(record(p).name)).filter(Boolean):[];
  const services=Array.isArray(appointments.services)?appointments.services.map(s=>record(s)).filter(s=>textValue(s.name)):[];
  const categories=Array.isArray(menu.categories)?menu.categories.map(c=>record(c)):[];
  const dishes=categories.reduce((sum,c)=>sum+(Array.isArray(c.items)?c.items.length:0),0);
  return <div className="order-config-summary">
    <div><b>Projekt</b><span>{textValue(cfg.company)||"–"}</span><small>{textValue(cfg.industry)||"–"} · Template {textValue(cfg.templateId)||"–"}</small></div>
    <div><b>Seiten</b><span>{pages.join(", ")||"–"}</span><small>{pages.length} Seiten</small></div>
    <div><b>Kunde</b><span>{textValue(business.contactName)||"–"}</span><small>{textValue(business.email)||textValue(cfg.contactEmail)||"–"} · {textValue(business.phone)||"kein Telefon"}</small></div>
    <div><b>Kontaktformular</b><span>{contact.enabled?"Aktiv":"Nicht gewählt"}</span><small>{contact.enabled?`Empfänger: ${textValue(contact.recipientEmail)||"FEHLT"}`:"–"}</small></div>
    <div><b>Terminbuchung</b><span>{appointments.enabled?`${services.length} Leistungen`:"Nicht gewählt"}</span><small>{appointments.enabled?`Empfänger: ${textValue(appointments.recipientEmail)||"FEHLT"}`:"–"}</small></div>
    <div><b>Speisekarte</b><span>{menu.enabled?`${categories.length} Kategorien · ${dishes} Gerichte`:"Nicht gewählt"}</span><small>{menu.enabled?"Im Auftrag konfiguriert":"–"}</small></div>
    <div><b>Domain</b><span>{textValue(domain.status)||"undecided"}</span><small>{textValue(domain.domainName)||"Keine Domain angegeben"}</small></div>
    <div><b>Content</b><span>Texte: {textValue(content.texts)||"–"}</span><small>Bilder: {textValue(content.images)||"–"} · Logo: {textValue(content.logo)||"–"}</small></div>
    <div className="full"><b>Gewählte Erweiterungen</b><span>{stringList(cfg.addons).join(", ")||"Keine"}</span></div>
  </div>;
}

function OrderCard({ order }: { order: Order }) {
  return <details className="admin-order-detail"><summary><div><b>JXO-{order.id}</b><small>{order.customerEmail || "E-Mail folgt nach Zahlung"}</small></div><strong>{new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(order.amount)}</strong><span className={`order-status ${order.status}`}>{order.status === "paid" ? "Bezahlt" : "Offen"}</span></summary><OrderConfigurationSummary configuration={order.configuration}/><details className="config-details"><summary>Vollständigen Order Snapshot anzeigen</summary><pre className="inquiry-config">{JSON.stringify(order.configuration,null,2)}</pre></details></details>;
}

export default function AdminInbox() {
  const [key, setKey] = useState("");
  const [activeKey, setActiveKey] = useState("");
  const [items, setItems] = useState<Inquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotSaving, setSlotSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (accessKey: string) => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/inquiries", { headers: { "x-admin-key": accessKey }, cache: "no-store" });
      const data = await response.json() as { inquiries?: Inquiry[]; orders?: Order[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Anfragen konnten nicht geladen werden.");
      setItems(data.inquiries ?? []);
      setOrders(data.orders ?? []);
      const apptResponse = await fetch("/api/admin/appointments", { headers: { "x-admin-key": accessKey }, cache: "no-store" });
      if (apptResponse.ok) { const apptData = await apptResponse.json() as {appointments?:Appointment[]}; setAppointments(apptData.appointments ?? []); }
      const [projectResponse, availabilityResponse] = await Promise.all([
        fetch("/api/admin/projects", {headers:{"x-admin-key":accessKey},cache:"no-store"}),
        fetch("/api/admin/availability", {headers:{"x-admin-key":accessKey},cache:"no-store"}),
      ]);
      if (projectResponse.ok) setProjects(((await projectResponse.json()) as {projects?:Project[]}).projects??[]);
      if (availabilityResponse.ok) setSlots(((await availabilityResponse.json()) as {slots?:Slot[]}).slots??[]);
    } catch (err) { setError(err instanceof Error ? err.message : "Anfragen konnten nicht geladen werden."); setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!activeKey) return;
    const timer = window.setTimeout(() => void load(activeKey), 0);
    return () => window.clearTimeout(timer);
  }, [activeKey, load]);

  async function updateAppointment(id:number,status:string) {
    try {
      const response=await fetch("/api/admin/appointments",{method:"PATCH",headers:{"content-type":"application/json","x-admin-key":activeKey},body:JSON.stringify({id,status})});
      if (!response.ok) throw new Error("Termin konnte nicht aktualisiert werden.");
      setAppointments(current=>current.map(item=>item.id===id?{...item,status}:item));
      toast.success("Termin aktualisiert.");
    } catch(error) { toast.error(error instanceof Error?error.message:"Fehler beim Termin."); }
  }

  async function createSlot(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(slotSaving)return;
    setSlotSaving(true);
    try {
      const form=new FormData(event.currentTarget);
      const startsAt=new Date(String(form.get("startsAt"))).toISOString();
      const endsAt=new Date(String(form.get("endsAt"))).toISOString();
      const response=await fetch("/api/admin/availability",{method:"POST",headers:{"content-type":"application/json","x-admin-key":activeKey},body:JSON.stringify({startsAt,endsAt})});
      const data=await response.json() as {slot?:Slot;error?:string};
      if(!response.ok||!data.slot)throw new Error(data.error||"Zeitfenster konnte nicht gespeichert werden.");
      setSlots(current=>[...current,data.slot!].sort((a,b)=>a.startsAt.localeCompare(b.startsAt)));
      toast.success("Zeitfenster angelegt.");
      event.currentTarget.reset();
    }catch(error){toast.error(error instanceof Error?error.message:"Zeitfenster konnte nicht angelegt werden.");}
    finally{setSlotSaving(false);}
  }

  async function blockSlot(id:number) {
    try {
      const response=await fetch(`/api/admin/availability?id=${id}`,{method:"DELETE",headers:{"x-admin-key":activeKey}});
      if(!response.ok)throw new Error("Zeitfenster konnte nicht gesperrt werden.");
      setSlots(current=>current.map(slot=>slot.id===id?{...slot,status:"blocked"}:slot));
      toast.success("Zeitfenster gesperrt.");
    }catch(error){toast.error(error instanceof Error?error.message:"Zeitfenster konnte nicht gesperrt werden.");}
  }

  async function updateProject(id:number,status:string) {
    try {
      const response=await fetch("/api/admin/projects",{method:"PATCH",headers:{"content-type":"application/json","x-admin-key":activeKey},body:JSON.stringify({id,status})});
      if(!response.ok)throw new Error("Projektstatus konnte nicht gespeichert werden.");
      setProjects(current=>current.map(project=>project.id===id?{...project,status}:project));
      toast.success("Projekt aktualisiert.");
    }catch(error){toast.error(error instanceof Error?error.message:"Projektstatus konnte nicht gespeichert werden.");}
  }

  async function downloadSite(id: number) {
    try {
      const response = await fetch(`/api/generate-site?id=${id}`, { headers: { "x-admin-key": activeKey } });
      if (!response.ok) { const data = await response.json() as {error?:string}; throw new Error(data.error || "Website konnte nicht generiert werden."); }
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = `JXS-${id}-website.zip`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast.success("Website-Code wurde generiert.");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Website konnte nicht generiert werden."); }
  }

  async function updateStatus(id: number, status: string) {
    try {
      const response = await fetch("/api/inquiries", { method: "PATCH", headers: { "content-type": "application/json", "x-admin-key": activeKey }, body: JSON.stringify({ id, status }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Status konnte nicht gespeichert werden.");
      setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
      toast.success("Status gespeichert.");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Status konnte nicht gespeichert werden."); }
  }

  const openItems = useMemo(() => items.filter((item) => item.status !== "Archiviert"), [items]);

  if (!activeKey || error) return <main className="admin-page"><Toaster position="top-center" richColors /><section className="admin-login"><ShieldCheck size={30} /><h1>Projekt-Eingang</h1><p>Dieser Bereich ist geschützt. Gib deinen Admin-Schlüssel ein.</p>{error && <p role="alert" style={{ color: "#ff9a9a" }}>{error}</p>}<form onSubmit={(event) => { event.preventDefault(); setError(""); setActiveKey(key); }}><label>Zugangsschlüssel<input type="password" value={key} onChange={(event) => setKey(event.target.value)} autoComplete="off" required /></label><button type="submit">Öffnen</button></form></section></main>;

  return <main className="admin-page"><Toaster position="top-center" richColors /><section className="admin-orders"><h2>Operations</h2><article><div><b>{openItems.length}</b><small>Offene Leads</small></div><strong>{orders.filter(o=>o.status==="paid").length}</strong><span>bezahlte Aufträge</span></article><article><div><b>{appointments.filter(a=>!["cancelled","completed"].includes(a.status)).length}</b><small>Aktive Termine</small></div><strong>{appointments.filter(a=>a.status==="confirmed").length}</strong><span>bestätigt</span></article></section>{appointments.length > 0 && <section className="admin-orders"><h2>Beratungstermine</h2>{appointments.slice(0,8).map(a=><article key={a.id}><div><b>{a.company || a.name}</b><small>{a.projectType} · {formatDate(a.startsAt)}</small></div><strong>{a.durationMinutes} min</strong><span className={`order-status ${a.status}`}>{a.status}</span><select aria-label={`Terminstatus für ${a.name}`} value={a.status} onChange={event=>void updateAppointment(a.id,event.target.value)}>{["booked","confirmed","completed","cancelled","no_show"].map(status=><option key={status} value={status}>{status}</option>)}</select></article>)}</section>}<section className="admin-orders"><h2>Freie Zeitfenster</h2><form className="admin-slot-form" onSubmit={createSlot}><label>Beginn<input name="startsAt" type="datetime-local" required /></label><label>Ende<input name="endsAt" type="datetime-local" required /></label><button disabled={slotSaving}>{slotSaving?"Wird angelegt …":"Zeitfenster anlegen"}</button></form>{slots.filter(slot=>slot.status==="open"&&new Date(slot.startsAt)>new Date()).slice(0,12).map(slot=><article key={slot.id}><div><b>{formatDate(slot.startsAt)}</b><small>Bis {formatDate(slot.endsAt)}</small></div><button onClick={()=>void blockSlot(slot.id)}>Sperren</button></article>)}{slots.length===0&&<p>Noch keine Zeitfenster eingetragen.</p>}</section><section className="admin-orders"><h2>Projekte & Freigaben</h2>{projects.length===0?<p>Noch keine Projekte.</p>:projects.map(project=><article key={project.id}><div><b>{project.name} · JXP-{project.id}</b><small>{project.customerEmail} · Version {project.version} · {project.approvalStatus}</small></div><select aria-label={`Projektstatus für ${project.name}`} value={project.status} onChange={event=>void updateProject(project.id,event.target.value)}>{["draft","paid","planning","in_progress","review","completed","on_hold","cancelled"].map(status=><option key={status} value={status}>{status}</option>)}</select><button onClick={()=>{void navigator.clipboard.writeText(`${location.origin}/portal?token=${project.portalToken}`).then(()=>toast.success("Portal-Link kopiert.")).catch(()=>toast.error("Link konnte nicht kopiert werden."))}}>Portal-Link kopieren</button></article>)}</section>{orders.length > 0 && <section className="admin-orders"><h2>Direktaufträge</h2>{orders.map(order=><OrderCard key={order.id} order={order}/>)}</section>}<header className="admin-head"><div><span className="eyebrow"><ShieldCheck size={14} /> Intern</span><h1>Projekt-Eingang</h1><p>Anfragen inklusive Website-Konfiguration, Preisindikator und Status. Der Bereich wird serverseitig über den Zugangsschlüssel geschützt.</p></div><button className="admin-refresh" onClick={() => void load(activeKey)} disabled={loading}><RefreshCw size={15} /> {loading ? "Lädt …" : "Aktualisieren"}</button></header>{openItems.length === 0 ? <div className="admin-empty">{loading ? "Anfragen werden geladen …" : "Keine offenen Anfragen vorhanden."}</div> : <section className="admin-grid">{openItems.map((item) => <details className="inquiry-card" key={item.id}><summary><div><strong>{item.company || item.name}</strong><small>{item.name} · JXS-{item.id} · {item.source === "jx-assistant" ? "KI Lead" : item.source === "builder" ? "Builder" : "Kontakt"}</small></div><div>{item.subject}<small>{item.email}</small></div><time>{formatDate(item.createdAt)}</time><span className="inquiry-status">{item.status}</span></summary><div className="inquiry-body"><div><h3>Anfrage</h3><p>{item.message}</p><div className="inquiry-meta"><span><b>E-Mail:</b> <a href={`mailto:${item.email}`}>{item.email}</a></span>{item.phone && <span><b>Telefon:</b> <a href={`tel:${item.phone}`}>{item.phone}</a></span>}{item.estimatedPrice != null && <span><b>Richtwert:</b> {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(item.estimatedPrice)}</span>}</div><div className="status-actions"><button onClick={() => void downloadSite(item.id)}><Download size={13}/> Website-Code ZIP</button>{statuses.map((status) => <button key={status} className={item.status === status ? "active" : ""} onClick={() => void updateStatus(item.id, status)}>{status}</button>)}</div></div><div><h3>Website-Vorschau</h3>{item.configuration ? <><OrderConfigurationSummary configuration={item.configuration}/><ConfigurationPreview configuration={item.configuration} /></> : <div className="admin-preview-empty">Normale Kontaktanfrage ohne Builder-Konfiguration.</div>}<details className="config-details"><summary>Konfigurationsdaten anzeigen</summary><pre className="inquiry-config">{item.configuration ? JSON.stringify(item.configuration, null, 2) : "Keine Builder-Konfiguration."}</pre></details></div></div></details>)}</section>}</main>;
}

function formatDate(value: string | number) {
  const date = typeof value === "number" ? new Date(value > 10_000_000_000 ? value : value * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
