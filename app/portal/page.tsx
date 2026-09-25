"use client";

import { useEffect, useState } from "react";

type Invoice = { id:number; amount:number; currency:string; status:string; hostedUrl?:string|null; pdfUrl?:string|null };
type Project = { id:number; name:string; status:string; version:number; approvalStatus:string; configuration:unknown };
type PortalData = { project:Project; versions:Array<{id:number;version:number;note:string;createdAt:string}>; invoices:Invoice[] };

export default function Portal() {
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const token = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("token") || "";
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    fetch("/api/portal/project", { headers: { "x-portal-token": token }, cache:"no-store", signal:controller.signal })
      .then(async response => { const result = await response.json() as PortalData & {error?:string}; if (!response.ok) throw new Error(result.error || "Portal konnte nicht geladen werden"); return result; })
      .then(setData).catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Portal konnte nicht geladen werden"); });
    return () => controller.abort();
  }, [token]);
  const update = async (action: "approve" | "changes") => {
    if (saving || !data) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/portal/project", { method:"PATCH", headers:{ "content-type":"application/json", "x-portal-token": token }, body:JSON.stringify({action}) });
      const result = await response.json() as { error?:string; approvalStatus?:string };
      if (!response.ok || !result.approvalStatus) throw new Error(result.error || "Änderung fehlgeschlagen");
      setData(previous => previous ? { ...previous, project:{ ...previous.project, approvalStatus:result.approvalStatus! } } : previous);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Änderung fehlgeschlagen"); }
    finally { setSaving(false); }
  };
  if (!token || error && !data) return <main className="page-main"><section className="page-intro"><h1>Kundenportal</h1><p role="alert">{error || "Öffne deinen persönlichen Projekt-Link."}</p></section></main>;
  if (!data) return <main className="page-main"><section className="page-intro"><p>Projekt wird geladen …</p></section></main>;
  const { project, versions, invoices } = data;
  return <main className="page-main"><section className="page-intro"><span className="eyebrow">JX Kundenportal</span><h1>{project.name}</h1><p>Status: <b>{project.status}</b> · Version {project.version} · Freigabe: {project.approvalStatus}</p></section>
    <section className="admin-orders"><h2>Projektfreigabe</h2><p>Die Projektübersicht zeigt deinen aktuellen Stand. Freigaben beziehen sich auf die mit dir abgestimmte Version.</p><article><div><b>Deine Entscheidung</b><small>{project.approvalStatus === "approved" ? "Freigegeben" : project.approvalStatus === "changes_requested" ? "Änderungen angefragt" : "Noch offen"}</small></div><button disabled={saving} onClick={()=>update("approve")}>Freigeben</button><button disabled={saving} onClick={()=>update("changes")}>Änderungen nötig</button></article>{error && <p role="alert">{error}</p>}</section>
    <section className="admin-orders"><h2>Versionen</h2>{versions.map(version=><article key={version.id}><div><b>Version {version.version}</b><small>{version.note || "Projektstand"}</small></div><span>{new Date(version.createdAt).toLocaleDateString("de-DE")}</span></article>)}</section>
    <section className="admin-orders"><h2>Rechnungen</h2>{invoices.length ? invoices.map(invoice=><article key={invoice.id}><div><b>{(invoice.amount/100).toLocaleString("de-DE",{style:"currency",currency:invoice.currency.toUpperCase()})}</b><small>{invoice.status}</small></div>{invoice.hostedUrl && <a href={invoice.hostedUrl} target="_blank" rel="noopener noreferrer">Rechnung öffnen</a>}</article>) : <p>Noch keine Rechnungen vorhanden.</p>}</section>
    <section className="admin-orders"><h2>Weitere Bereiche</h2><p>Domain, Inhalte, Support und Änderungsaufträge werden persönlich koordiniert, bis diese Bereiche freigeschaltet sind.</p></section>
  </main>;
}
