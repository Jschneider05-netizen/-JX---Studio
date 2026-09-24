"use client";

import { useEffect, useMemo, useState } from "react";
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

const statuses = ["Neu", "Kontaktiert", "In Klärung", "Angebot", "Gewonnen", "Abgelehnt", "Archiviert"];

export default function AdminInbox() {
  const [key, setKey] = useState("");
  const [activeKey, setActiveKey] = useState("");
  const [items, setItems] = useState<Inquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("jxs-admin-key");
    if (saved) { setKey(saved); setActiveKey(saved); }
  }, []);

  useEffect(() => { if (activeKey) void load(activeKey); }, [activeKey]);

  async function load(accessKey = activeKey) {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/inquiries", { headers: { "x-admin-key": accessKey }, cache: "no-store" });
      const data = await response.json() as { inquiries?: Inquiry[]; orders?: Order[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Anfragen konnten nicht geladen werden.");
      setItems(data.inquiries ?? []);
      setOrders(data.orders ?? []);
      const apptResponse = await fetch("/api/admin/appointments", { headers: { "x-admin-key": accessKey }, cache: "no-store" });
      if (apptResponse.ok) { const apptData = await apptResponse.json() as {appointments?:Appointment[]}; setAppointments(apptData.appointments ?? []); }
      sessionStorage.setItem("jxs-admin-key", accessKey);
    } catch (err) { setError(err instanceof Error ? err.message : "Anfragen konnten nicht geladen werden."); setItems([]); }
    finally { setLoading(false); }
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

  if (!activeKey || error) return <main className="admin-page"><Toaster position="top-center" richColors /><section className="admin-orders"><h2>Operations</h2><article><div><b>{openItems.length}</b><small>Offene Leads</small></div><strong>{orders.filter(o=>o.status==="paid").length}</strong><span>bezahlte Aufträge</span></article><article><div><b>{appointments.filter(a=>!["cancelled","completed"].includes(a.status)).length}</b><small>Aktive Termine</small></div><strong>{appointments.filter(a=>a.status==="confirmed").length}</strong><span>bestätigt</span></article></section>{appointments.length > 0 && <section className="admin-orders"><h2>Beratungstermine</h2>{appointments.slice(0,8).map(a=><article key={a.id}><div><b>{a.company || a.name}</b><small>{a.projectType} · {formatDate(a.startsAt)}</small></div><strong>{a.durationMinutes} min</strong><span className={`order-status ${a.status}`}>{a.status}</span></article>)}</section>}<section className="admin-login"><ShieldCheck size={30} /><h1>Projekt-Eingang</h1><p>Dieser Bereich ist nicht öffentlich. Hinterlege den Server-Schlüssel <code>JXSTUDIO_ADMIN_KEY</code> und gib ihn hier ein. Ohne Schlüssel bleibt der Eingang absichtlich zu.</p>{error && <p style={{ color: "#ff9a9a" }}>{error}</p>}<form onSubmit={(event) => { event.preventDefault(); setError(""); setActiveKey(key); }}><input type="password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="Zugangsschlüssel" autoComplete="current-password" /><button type="submit">Öffnen</button></form></section></main>;

  return <main className="admin-page"><Toaster position="top-center" richColors /><section className="admin-orders"><h2>Operations</h2><article><div><b>{openItems.length}</b><small>Offene Leads</small></div><strong>{orders.filter(o=>o.status==="paid").length}</strong><span>bezahlte Aufträge</span></article><article><div><b>{appointments.filter(a=>!["cancelled","completed"].includes(a.status)).length}</b><small>Aktive Termine</small></div><strong>{appointments.filter(a=>a.status==="confirmed").length}</strong><span>bestätigt</span></article></section>{appointments.length > 0 && <section className="admin-orders"><h2>Beratungstermine</h2>{appointments.slice(0,8).map(a=><article key={a.id}><div><b>{a.company || a.name}</b><small>{a.projectType} · {formatDate(a.startsAt)}</small></div><strong>{a.durationMinutes} min</strong><span className={`order-status ${a.status}`}>{a.status}</span></article>)}</section>}{orders.length > 0 && <section className="admin-orders"><h2>Direktaufträge</h2>{orders.map(order=><article key={order.id}><div><b>JXO-{order.id}</b><small>{order.customerEmail || "E-Mail folgt nach Zahlung"}</small></div><strong>{new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR"}).format(order.amount)}</strong><span className={`order-status ${order.status}`}>{order.status === "paid" ? "Bezahlt" : "Offen"}</span></article>)}</section>}<header className="admin-head"><div><span className="eyebrow"><ShieldCheck size={14} /> Intern</span><h1>Projekt-Eingang</h1><p>Anfragen inklusive Website-Konfiguration, Preisindikator und Status. Der Bereich wird serverseitig über den Zugangsschlüssel geschützt.</p></div><button className="admin-refresh" onClick={() => void load()} disabled={loading}><RefreshCw size={15} /> {loading ? "Lädt …" : "Aktualisieren"}</button></header>{openItems.length === 0 ? <div className="admin-empty">{loading ? "Anfragen werden geladen …" : "Keine offenen Anfragen vorhanden."}</div> : <section className="admin-grid">{openItems.map((item) => <details className="inquiry-card" key={item.id}><summary><div><strong>{item.company || item.name}</strong><small>{item.name} · JXS-{item.id} · {item.source === "jx-assistant" ? "KI Lead" : item.source === "builder" ? "Builder" : "Kontakt"}</small></div><div>{item.subject}<small>{item.email}</small></div><time>{formatDate(item.createdAt)}</time><span className="inquiry-status">{item.status}</span></summary><div className="inquiry-body"><div><h3>Anfrage</h3><p>{item.message}</p><div className="inquiry-meta"><span><b>E-Mail:</b> <a href={`mailto:${item.email}`}>{item.email}</a></span>{item.phone && <span><b>Telefon:</b> <a href={`tel:${item.phone}`}>{item.phone}</a></span>}{item.estimatedPrice != null && <span><b>Richtwert:</b> {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(item.estimatedPrice)}</span>}</div><div className="status-actions"><button onClick={() => void downloadSite(item.id)}><Download size={13}/> Website-Code ZIP</button>{statuses.map((status) => <button key={status} className={item.status === status ? "active" : ""} onClick={() => void updateStatus(item.id, status)}>{status}</button>)}</div></div><div><h3>Website-Vorschau</h3>{item.configuration ? <ConfigurationPreview configuration={item.configuration} /> : <div className="admin-preview-empty">Normale Kontaktanfrage ohne Builder-Konfiguration.</div>}<details className="config-details"><summary>Konfigurationsdaten anzeigen</summary><pre className="inquiry-config">{item.configuration ? JSON.stringify(item.configuration, null, 2) : "Keine Builder-Konfiguration."}</pre></details></div></div></details>)}</section>}</main>;
}

function formatDate(value: string | number) {
  const date = typeof value === "number" ? new Date(value > 10_000_000_000 ? value : value * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
