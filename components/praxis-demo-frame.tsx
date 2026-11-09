"use client";
import { useState } from "react";
import Link from "next/link";
export default function PraxisDemoFrame() {
  const [loaded, setLoaded] = useState(false);
  return <main className="page-main"><section className="page-intro"><Link href="/">← JX STUDIO</Link><p className="eyebrow">Webdesign · Konzeptprojekt</p><h1>Praxis am Park.</h1><p>Design-Demo von JX STUDIO, keine echte Kundenreferenz.</p>{!loaded ? <><p>Die Demo wird extern auf chatgpt.site gehostet. Beim Laden werden Verbindungsdaten an den Anbieter übertragen. <Link href="/datenschutz">Datenschutzhinweise</Link></p><button className="btn-primary" onClick={()=>setLoaded(true)}>Externe Demo laden</button></> : <button className="btn-secondary" onClick={()=>setLoaded(false)}>Demo schließen</button>}</section>{loaded && <iframe src="https://praxis-am-park-jx.ample-gem-3729.chatgpt.site/" title="Praxis am Park – Konzeptdemo" referrerPolicy="no-referrer" style={{width:"100%",height:"80dvh",border:0,background:"white"}}/>}</main>;
}
