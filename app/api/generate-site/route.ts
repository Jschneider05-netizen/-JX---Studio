import { eq } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";

export const runtime = "nodejs";

const esc = (v: unknown) => String(v ?? "").replace(/[&<>\"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]!));
const slug = (v: unknown) => String(v ?? "page").toLowerCase().replace(/[^a-z0-9äöüß]+/gi,"-").replace(/^-|-$/g,"") || "page";
const n = (v: unknown, fallback: number) => Number.isFinite(Number(v)) ? Number(v) : fallback;

/**
 * JX V6 production export.
 * IMPORTANT: this route intentionally uses the SAME pv-* class contract and the
 * SAME jx-studio-runtime.css that powers the Builder preview. There is no second
 * design stylesheet anymore. Builder visual changes therefore flow into export.
 */
export async function GET(request: Request) {
  const configured = process.env.JXSTUDIO_ADMIN_KEY;
  const supplied = request.headers.get("x-admin-key") || "";
  if (!configured || supplied !== configured) return Response.json({ error:"Nicht autorisiert." }, { status:401 });

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return Response.json({ error:"Ungültige Anfrage." }, { status:400 });

  const db = getDb();
  const [row] = await db.select().from(inquiries).where(eq(inquiries.id,id)).limit(1);
  if (!row?.configuration) return Response.json({ error:"Diese Anfrage enthält keine Builder-Konfiguration." }, { status:404 });

  const c = JSON.parse(row.configuration) as any;
  const profile = c.resolvedContent ?? {};
  const images: string[] = Array.isArray(c.resolvedImages) ? c.resolvedImages : [];
  const pages = Array.isArray(c.pages) ? c.pages : [];
  const company = esc(c.company || row.company || "Unternehmen");
  const templateLayout = ["split","editorial","impact"].includes(c.templateLayout) ? c.templateLayout : "split";
  const text = (page:any, section:any, field:string, fallback:string) => esc(c.customText?.[`${page.id}:${section.id}:${field}`] ?? fallback);
  const pageHref = (p:any,i:number) => i === 0 ? "index.html" : `${slug(p.id || p.name)}.html`;
  const nav = pages.slice(0,4).map((p:any,i:number)=>`<a class="${i===0?'active':''}" href="${pageHref(p,i)}">${esc(p.name)}</a>`).join("");
  const primaryImage = String(c.content?.image || images[0] || "");

  const sectionStyle = (s:any) => {
    const st=s.style??{}, an=s.animation??{};
    const css = [
      st.paddingY != null ? `padding-top:${n(st.paddingY,80)}px;padding-bottom:${n(st.paddingY,80)}px` : "",
      st.background ? `background:${esc(st.background)}` : "",
      st.color ? `color:${esc(st.color)}` : "",
      `opacity:${n(st.opacity,1)}`,
      `filter:blur(${n(st.blur,0)}px)`,
      `transform:translate(${n(st.offsetX,0)}px,${n(st.offsetY,0)}px) scale(${n(st.scale,100)/100}) rotate(${n(st.rotate,0)}deg)`,
      st.radius != null ? `border-radius:${n(st.radius,0)}px` : "",
      `--jx-anim-duration:${n(an.duration,700)}ms`,
      `--jx-anim-delay:${n(an.delay,0)}ms`,
      `--jx-anim-ease:${esc(an.easing || "cubic-bezier(.16,1,.3,1)")}`,
    ].filter(Boolean).join(";");
    return `data-jx-section="${esc(s.id || '')}" class="jx-config-section jx-anim-${esc(an.type || "none")}" style="${css}"`;
  };

  const renderSection = (page:any,s:any,pageIndex:number) => {
    if (s.hidden) return "";
    const heroHeadline = page.id === "home" ? (c.content?.headline || company) : pageIndex === 1 ? (profile.serviceTitle || page.name) : pageIndex === 2 ? (profile.aboutTitle || page.name) : (profile.cta || page.name);
    const heroCopy = page.id === "home" ? (c.content?.copy || "") : pageIndex === 1 ? `Alles Wichtige zu ${String(page.name).toLowerCase()} – klar strukturiert und schnell erfassbar.` : pageIndex === 2 ? (profile.aboutCopy || "") : "Schreib uns kurz, worum es geht. Wir melden uns persönlich mit den nächsten Schritten.";
    const attrs = sectionStyle(s);
    if (s.kind === "hero") return `<section ${attrs.replace('class="','class="pv-hero ')}><div class="pv-hero-copy"><small>${text(page,s,"kicker",page.id==="home"?(c.content?.kicker||""):`${page.name.toUpperCase()} · ${String(profile.category||c.industry||"").toUpperCase()}`)}</small><h1>${text(page,s,"headline",heroHeadline)}</h1><p>${text(page,s,"copy",heroCopy)}</p><a class="pv-button" href="#next">${esc(page.id==="home"?c.content?.cta:profile.cta)} <span>→</span></a></div>${primaryImage?`<img src="${esc(primaryImage)}" alt="${company} ${esc(profile.category||c.industry||"")}">`:""}</section>`;
    if (s.kind === "services") return `<section ${attrs.replace('class="','class="pv-services ')}><small>LEISTUNGEN</small><h2>${text(page,s,"headline",profile.serviceTitle||"Leistungen")}</h2><div>${(profile.services||[]).map((x:any,i:number)=>`<article><b>0${i+1}</b><h3>${text(page,s,`service-${i}-title`,x.title)}</h3><p>${text(page,s,`service-${i}-copy`,x.copy)}</p></article>`).join("")}</div></section>`;
    if (s.kind === "about") { const img=images[1]||primaryImage; return `<section ${attrs.replace('class="','class="pv-about ')}><div class="pv-image" style="background-image:url('${esc(img)}')"></div><div><small>ÜBER UNS</small><h2>${text(page,s,"headline",profile.aboutTitle||"Über uns")}</h2><p>${text(page,s,"copy",profile.aboutCopy||"")}</p><a href="#next">Mehr erfahren →</a></div></section>`; }
    if (s.kind === "projects") return `<section ${attrs.replace('class="','class="pv-projects ')}><small>REFERENZEN</small><h2>${text(page,s,"headline",profile.projectsTitle||"Referenzen")}</h2><div>${[0,2].map((ix,i)=>`<article style="background-image:url('${esc(images[ix]||primaryImage)}')"><span>${text(page,s,`project-${i}`,(profile.projectNames||["Projekt eins","Projekt zwei"])[i])}</span></article>`).join("")}</div></section>`;
    if (s.kind === "reviews") return `<section ${attrs.replace('class="','class="pv-review ')}><span>★★★★★</span><blockquote>„${text(page,s,"quote",profile.review||"")}“</blockquote><small>— ${text(page,s,"reviewer",profile.reviewer||"")}</small></section>`;
    if (s.kind === "contact") return `<section ${attrs.replace('class="','class="pv-contact ')}><div><small>KONTAKT</small><h2>${text(page,s,"headline",profile.cta||"Kontakt")}</h2><p>${text(page,s,"copy","Erzähl uns kurz, worum es geht. Wir melden uns persönlich zurück.")}</p></div><form><input aria-label="Name" placeholder="Name"><input aria-label="E-Mail" placeholder="E-Mail"><textarea aria-label="Nachricht" placeholder="Nachricht"></textarea><button type="button">Anfrage senden</button></form></section>`;
    return `<section id="next" ${attrs.replace('class="','class="pv-cta ')}><div><small>NÄCHSTER SCHRITT</small><h2>${text(page,s,"headline",profile.cta||"Projekt starten")}</h2></div><a class="pv-button" href="${pageHref(pages[pages.length-1]||page,pages.length-1)}">${esc(c.content?.cta||"Jetzt anfragen")} →</a></section>`;
  };

  // Exact CSS contract used by the builder, copied as a production asset at build time.
  const runtimeCss = await readFile(path.join(process.cwd(), "public", "jx-studio-runtime.css"), "utf8");
  const responsiveOverrides = (() => {
    const points: Record<string,string> = { laptop:"(max-width:1280px)", tablet:"(max-width:1024px)", mobileLandscape:"(max-width:900px) and (orientation:landscape)", mobile:"(max-width:640px)" };
    let out = "\n/* Canonical responsive overrides from Builder SiteConfig */\n";
    for (const [bp,mq] of Object.entries(points)) {
      let rules = "";
      for (const page of pages) for (const section of page.sections || []) {
        const o = section.responsive?.[bp]; if (!o) continue;
        const r:string[]=[];
        if(o.paddingY!=null) r.push(`padding-top:${n(o.paddingY,80)}px`,`padding-bottom:${n(o.paddingY,80)}px`);
        if(o.background) r.push(`background:${o.background}`);
        if(o.color) r.push(`color:${o.color}`);
        if(o.radius!=null) r.push(`border-radius:${n(o.radius,0)}px`);
        if(o.opacity!=null) r.push(`opacity:${n(o.opacity,1)}`);
        if(o.blur!=null) r.push(`filter:blur(${n(o.blur,0)}px)`);
        if(o.hidden===true) r.push("display:none");
        if(o.scale!=null||o.rotate!=null||o.offsetX!=null||o.offsetY!=null) r.push(`transform:translate(${n(o.offsetX,0)}px,${n(o.offsetY,0)}px) scale(${n(o.scale,100)/100}) rotate(${n(o.rotate,0)}deg)`);
        if(r.length) rules += `[data-jx-section="${String(section.id).replace(/["\\]/g,"")}"]{${r.join(";")}}\n`;
      }
      if(rules) out += `@media ${mq}{${rules}}\n`;
    }
    return out;
  })();

  const exportOverrides = `\n/* JX production shell: editor chrome removed, preview renderer unchanged */\nhtml,body{margin:0;background:var(--preview-surface,#fff)}body{min-width:0}.site-preview{min-height:100vh}.preview-nav a{appearance:none;background:none;border:0;color:inherit;text-decoration:none;font:inherit}.pv-button{display:inline-flex;align-items:center;gap:8px;border:1px solid transparent;background:var(--preview-accent);color:#111!important;font:800 10px Inter,sans-serif;padding:12px 15px;border-radius:calc(var(--preview-radius)*.45);margin-top:18px;text-decoration:none}.button-outline .pv-button{background:transparent;border-color:var(--preview-accent);color:var(--preview-accent)!important}.button-soft .pv-button{background:color-mix(in srgb,var(--preview-accent) 26%,transparent);color:color-mix(in srgb,var(--preview-accent) 80%,white)!important}`;

  const vars = `--preview-accent:${esc(c.accent||"#77aaff")};--preview-secondary:${esc(c.secondary||"#dbe7ff")};--preview-dark:${esc(c.dark||"#111316")};--preview-surface:${esc(c.surface||"#f3f0e7")};--preview-text:${esc(c.text||"#15171a")};--preview-radius:${n(c.radius,20)}px;--preview-space:${n(c.spacing,100)}%;--preview-font:${c.font==="editorial"?"Georgia,serif":c.font==="technical"?"ui-monospace,SFMono-Regular,monospace":"Inter,sans-serif"}`;
  const shellClass = `site-preview layout-${esc(templateLayout)} device-desktop button-${esc(c.buttonStyle||"solid")} hero-${esc(c.heroAlign||"left")}`;
  const files:Record<string,string> = {
    "styles.css": runtimeCss + responsiveOverrides + exportOverrides,
    "jx-configuration.json": JSON.stringify(c,null,2),
    "README.md": `# ${company}\n\nJX Studio V6 canonical export aus JXS-${id}. Preview und Export verwenden denselben pv-* Runtime/CSS-Vertrag. Keine zweite Design-Engine. Vor Livegang Formulare, Rechtstexte, Assets und externe Integrationen final prüfen.`,
  };

  pages.forEach((p:any,i:number)=>{
    const body=(p.sections||[]).map((s:any)=>renderSection(p,s,i)).join("\n");
    const pageNav=pages.slice(0,4).map((x:any,ix:number)=>`<a class="${x.id===p.id?'active':''}" href="${pageHref(x,ix)}">${esc(x.name)}</a>`).join("");
    files[pageHref(p,i)] = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.name)} · ${company}</title><link rel="stylesheet" href="styles.css"></head><body><div class="${shellClass}" style="${vars}"><nav class="preview-nav"><strong>${company}</strong><div>${pageNav}</div></nav>${body}<footer class="pv-footer"><strong>${company}</strong><span>© 2026 · Impressum · Datenschutz</span></footer></div></body></html>`;
  });
  if (!files["index.html"]) files["index.html"]=`<!doctype html><html><body><h1>${company}</h1></body></html>`;

  const out=makeZip(files);
  return new Response(new Uint8Array(out),{headers:{"content-type":"application/zip","content-disposition":`attachment; filename=JXS-${id}-website.zip`}});
}

function makeZip(files:Record<string,string>){const enc=new TextEncoder(),locals:Uint8Array[]=[],centrals:Uint8Array[]=[];let offset=0;for(const [name,text] of Object.entries(files)){const ne=enc.encode(name),d=enc.encode(text),crc=crc32(d);const l=new Uint8Array(30+ne.length+d.length),v=new DataView(l.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,crc,true);v.setUint32(18,d.length,true);v.setUint32(22,d.length,true);v.setUint16(26,ne.length,true);l.set(ne,30);l.set(d,30+ne.length);locals.push(l);const ce=new Uint8Array(46+ne.length),cv=new DataView(ce.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint32(16,crc,true);cv.setUint32(20,d.length,true);cv.setUint32(24,d.length,true);cv.setUint16(28,ne.length,true);cv.setUint32(42,offset,true);ce.set(ne,46);centrals.push(ce);offset+=l.length}const centralSize=centrals.reduce((a,b)=>a+b.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,centrals.length,true);ev.setUint16(10,centrals.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);const out=new Uint8Array(offset+centralSize+22);let pos=0;for(const x of [...locals,...centrals,end]){out.set(x,pos);pos+=x.length}return out}
function crc32(data:Uint8Array){let c=0xffffffff;for(const b of data){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
