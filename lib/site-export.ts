import type { BuilderState, BranchProfile, PageConfig, SectionConfig } from "@/components/jx-studio";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeRequirements } from "@/lib/jx-requirements";

const esc = (v: unknown) => String(v ?? "").replace(/[&<>\"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]!));
const slug = (v: unknown) => String(v ?? "page").toLowerCase().replace(/[^a-z0-9äöüß]+/gi,"-").replace(/^-|-$/g,"") || "page";
const n = (v: unknown, fallback: number) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const color = (v: unknown, fallback: string) => typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v) ? v : fallback;
const imageUrl = (v: unknown) => {
  if (typeof v !== "string" || v.length > 180000) return "";
  if (/^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i.test(v)) return v;
  try { const url = new URL(v); return url.protocol === "https:" ? url.href.replaceAll("'", "%27") : ""; }
  catch { return ""; }
};
const easing = (v: unknown) => typeof v === "string" && /^(?:linear|ease(?:-in|-out|-in-out)?|cubic-bezier\([\d.,\s-]+\))$/.test(v) ? v : "cubic-bezier(.16,1,.3,1)";

export function isSiteConfig(value: unknown): value is BuilderState {
  if (!value || typeof value !== "object") return false;
  const config = value as Record<string, unknown>;
  return typeof config.templateId === "string" && typeof config.company === "string"
    && typeof config.industry === "string" && typeof config.accent === "string"
    && typeof config.dark === "string" && typeof config.surface === "string"
    && typeof config.text === "string" && typeof config.spacing === "number"
    && typeof config.radius === "number" && typeof config.mode === "string"
    && Array.isArray(config.pages) && config.pages.length > 0 && config.pages.length <= 40
    && config.pages.every((page: unknown) => page !== null && typeof page === "object"
      && typeof (page as PageConfig).id === "string" && typeof (page as PageConfig).name === "string"
      && Array.isArray((page as PageConfig).sections) && (page as PageConfig).sections.length <= 60
      && (page as PageConfig).sections.every((section: SectionConfig) => typeof section.id === "string" && typeof section.kind === "string"))
    && config.content !== null && typeof config.content === "object"
    && typeof (config.content as BuilderState["content"]).headline === "string"
    && (config.customText === undefined || (config.customText !== null && typeof config.customText === "object"));
}

export async function buildSiteFiles(c:BuilderState,id:string):Promise<Record<string,string>> {
  const profile: Partial<BranchProfile> = c.resolvedContent ?? {};
  const images: string[] = Array.isArray(c.resolvedImages) ? c.resolvedImages : [];
  const pages = Array.isArray(c.pages) ? c.pages : [];
  const company = esc(c.company || "Unternehmen");
  // Layout is part of the canonical SiteConfig. Older saved projects did not store it,
  // so derive it deterministically from the template id instead of silently falling back.
  const templateIndex = Number(String(c.templateId || "").match(/-(\d+)$/)?.[1] || 1) - 1;
  const legacyLayouts = ["split", "editorial", "impact"] as const;
  const derivedLayout = legacyLayouts[Math.max(0, Math.min(2, templateIndex))] || "split";
  const validLayouts = ["split","editorial","impact","atelier","cinematic","architectural","performance","clinical","brutalist"];
  const templateLayout = c.templateLayout && validLayouts.includes(c.templateLayout) ? c.templateLayout : derivedLayout;
  const text = (page:PageConfig, section:SectionConfig, field:string, fallback:string) => esc(c.customText?.[`${page.id}:${section.id}:${field}`] ?? fallback);
  const pageHref = (p:PageConfig,i:number) => i === 0 ? "index.html" : `${slug(p.id || p.name)}.html`;
  // The hero uses the exact image selected in the Builder. resolvedImages are only
  // fallbacks for secondary sections, matching SitePreview.
  const primaryImage = imageUrl(c.content?.image) || imageUrl(images[0]);
  const requirements = normalizeRequirements(c.requirements);

  const sectionStyle = (s:SectionConfig) => {
    const st=s.style??{}, an=s.animation??{};
    const css = [
      st.paddingY != null ? `padding-top:${n(st.paddingY,80)}px;padding-bottom:${n(st.paddingY,80)}px` : "",
      st.background ? `background:${color(st.background,c.surface)}` : "",
      st.color ? `color:${color(st.color,c.text)}` : "",
      `opacity:${n(st.opacity,1)}`,
      `filter:blur(${n(st.blur,0)}px)`,
      `transform:translate(${n(st.offsetX,0)}px,${n(st.offsetY,0)}px) scale(${n(st.scale,100)/100}) rotate(${n(st.rotate,0)}deg)`,
      st.radius != null ? `border-radius:${n(st.radius,0)}px` : "",
      `--jx-anim-duration:${n(an.duration,700)}ms`,
      `--jx-anim-delay:${n(an.delay,0)}ms`,
      `--jx-anim-ease:${easing(an.easing)}`,
    ].filter(Boolean).join(";");
    return `data-jx-section="${esc(s.id || '')}" class="jx-config-section jx-anim-${esc(an.type || "none")}" style="${css}"`;
  };


  const renderConfiguredModules = (page: PageConfig) => {
    const onHome=page.id==="home", onContact=page.id==="contact", onServices=page.id==="services";
    const visible=(placement:"page"|"home"|"both") => placement==="home"?onHome:placement==="both"?(onHome||onServices||onContact):(onServices||onContact);
    const menuVisible=requirements.restaurantMenu.enabled && ((requirements.restaurantMenu.placement==="home"&&onHome)||(requirements.restaurantMenu.placement==="both"&&(onHome||onServices))||(requirements.restaurantMenu.placement==="page"&&onServices));
    const bookingVisible=requirements.appointments.enabled && ((requirements.appointments.placement==="home"&&onHome)||(requirements.appointments.placement==="both"&&(onHome||onContact))||(requirements.appointments.placement==="page"&&onContact));
    const contactVisible=requirements.contactForm.enabled && ((requirements.contactForm.placement==="home"&&onHome)||(requirements.contactForm.placement==="both"&&(onHome||onContact))||(requirements.contactForm.placement==="contact"&&onContact));
    const realEstateVisible=requirements.realEstate.enabled&&visible(requirements.realEstate.placement);
    const fitnessVisible=requirements.fitness.enabled&&visible(requirements.fitness.placement);
    const commerceVisible=requirements.commerce.enabled&&visible(requirements.commerce.placement);
    const automotiveVisible=requirements.automotive.enabled&&visible(requirements.automotive.placement);
    const serviceRequestVisible=requirements.serviceRequest.enabled&&visible(requirements.serviceRequest.placement);
    const voucherVisible=requirements.vouchers.enabled&&onHome;
    const newsletterVisible=requirements.newsletter.enabled&&(onHome||onContact);
    let html="";
    if(menuVisible) html+=`<section class="pv-business-module pv-menu-module"><small>SPEISEKARTE</small><h2>Unsere Karte</h2><div class="pv-menu-grid">${requirements.restaurantMenu.categories.map(category=>`<article><h3>${esc(category.name)}</h3>${category.items.filter(item=>item.available).map(item=>`<div class="pv-menu-item"><div><b>${esc(item.name)}</b>${item.description?`<p>${esc(item.description)}</p>`:""}${item.allergens?`<small>Allergene: ${esc(item.allergens)}</small>`:""}</div><strong>${esc(item.price)}</strong></div>`).join("")}</article>`).join("")}</div></section>`;
    if(bookingVisible) html+=`<section class="pv-business-module pv-booking-module"><small>ONLINE TERMIN</small><h2>Leistung auswählen</h2><div class="pv-booking-grid">${requirements.appointments.services.map(service=>`<article><div><b>${esc(service.name)}</b><small>${n(service.durationMinutes,45)} Minuten${service.price?` · ${esc(service.price)}`:""}</small></div><button type="button">Termin wählen</button></article>`).join("")}</div><p>${esc(requirements.appointments.weeklyHours)}</p></section>`;
    if(realEstateVisible) html+=`<section class="pv-business-module pv-booking-module"><small>IMMOBILIEN</small><h2>Aktuelle Objekte</h2><div class="pv-booking-grid">${requirements.realEstate.listings.map(item=>`<article><div><b>${esc(item.title)}</b><small>${esc(item.location||item.type)} · ${esc(item.areaSqm||"–")} m² · ${esc(item.rooms||"–")} Zimmer</small></div><strong>${esc(item.price)}</strong></article>`).join("")}</div>${requirements.realEstate.viewingRequest?'<button type="button">Besichtigung anfragen</button>':""}</section>`;
    if(fitnessVisible) html+=`<section class="pv-business-module pv-booking-module"><small>KURSE</small><h2>Training, das in deinen Alltag passt</h2><div class="pv-booking-grid">${requirements.fitness.classes.map(item=>`<article><div><b>${esc(item.name)}</b><small>${esc(item.trainer||"Trainer folgt")} · ${esc(item.schedule)} · ${esc(item.durationMinutes)} Min.</small></div><strong>${esc(item.capacity)} Plätze</strong></article>`).join("")}</div>${requirements.fitness.trialTraining?'<button type="button">Probetraining anfragen</button>':""}</section>`;
    if(commerceVisible) html+=`<section class="pv-business-module pv-booking-module"><small>SHOP</small><h2>Produkte</h2><div class="pv-booking-grid">${requirements.commerce.products.map(item=>`<article><div><b>${esc(item.name)}</b><small>${esc(item.category||"Produkt")}${item.description?` · ${esc(item.description)}`:""}</small></div><strong>${esc(item.price)}</strong></article>`).join("")}</div><small>Commerce Provider: ${esc(requirements.commerce.provider)}</small></section>`;
    if(automotiveVisible) html+=`<section class="pv-business-module pv-booking-module"><small>WERKSTATT</small><h2>Service anfragen</h2><div class="pv-booking-grid">${requirements.automotive.services.map(item=>`<article><div><b>${esc(item.name)}</b><small>${esc(item.durationMinutes)} Min.${item.price?` · ${esc(item.price)}`:""}</small></div><button type="button">Anfragen</button></article>`).join("")}</div>${requirements.automotive.serviceArea?`<p>Einzugsgebiet: ${esc(requirements.automotive.serviceArea)}</p>`:""}</section>`;
    if(serviceRequestVisible) html+=`<section class="pv-business-module pv-form-module"><small>PROJEKTANFRAGE</small><h2>Was können wir für dich umsetzen?</h2><div class="pv-form-preview"><label>Leistung<select disabled><option>${esc(requirements.serviceRequest.serviceOptions[0]||"Leistung auswählen")}</option></select></label><label>Ort<input disabled></label>${requirements.serviceRequest.collectBudget?'<label>Budget<input disabled></label>':""}${requirements.serviceRequest.collectPreferredDate?'<label>Wunschzeitraum<input disabled></label>':""}<button type="button">Projekt anfragen</button></div></section>`;
    if(voucherVisible) html+=`<section class="pv-business-module pv-booking-module"><small>GUTSCHEINE</small><h2>Freude verschenken</h2><div class="pv-booking-grid">${requirements.vouchers.presetValues.map(value=>`<article><div><b>${esc(value)} € Gutschein</b><small>${esc(requirements.vouchers.validityMonths)} Monate gültig</small></div><button type="button">Auswählen</button></article>`).join("")}</div></section>`;
    if(newsletterVisible) html+=`<section class="pv-business-module pv-form-module"><small>NEWSLETTER</small><h2>Neuigkeiten direkt per E-Mail</h2><div class="pv-form-preview"><label>E-Mail<input disabled></label><button type="button">Anmelden</button>${requirements.newsletter.doubleOptIn?'<small>Double-Opt-in aktiviert</small>':""}</div></section>`;
    if(contactVisible) html+=`<section class="pv-business-module pv-form-module"><small>KONTAKT</small><h2>Nachricht senden</h2><div class="pv-form-preview">${requirements.contactForm.fields.map(field=>`<label>${esc(({name:"Name",email:"E-Mail",phone:"Telefon",company:"Unternehmen",subject:"Betreff",message:"Nachricht"} as Record<string,string>)[field]||field)}${requirements.contactForm.requiredFields.includes(field)?" *":""}${field==="message"?'<textarea rows="4" disabled></textarea>':'<input disabled>'}</label>`).join("")}<button type="button">Anfrage senden</button><small>Vorschau · Empfänger: ${esc(requirements.contactForm.recipientEmail||"noch nicht angegeben")}</small></div></section>`;
    return html;
  };

  const renderSection = (page:PageConfig,s:SectionConfig,pageIndex:number) => {
    if (s.hidden) return "";
    const heroHeadline = page.id === "home" ? (c.content?.headline || company) : pageIndex === 1 ? (profile.serviceTitle || page.name) : pageIndex === 2 ? (profile.aboutTitle || page.name) : (profile.cta || page.name);
    const heroCopy = page.id === "home" ? (c.content?.copy || "") : pageIndex === 1 ? `Alles Wichtige zu ${String(page.name).toLowerCase()} – klar strukturiert und schnell erfassbar.` : pageIndex === 2 ? (profile.aboutCopy || "") : "Schreib uns kurz, worum es geht. Wir melden uns persönlich mit den nächsten Schritten.";
    const attrs = sectionStyle(s);
    if (s.kind === "hero") return `<section ${attrs.replace('class="','class="pv-hero ')}><div class="pv-hero-copy"><small>${text(page,s,"kicker",page.id==="home"?(c.content?.kicker||""):`${page.name.toUpperCase()} · ${String(profile.category||c.industry||"").toUpperCase()}`)}</small><h1>${text(page,s,"headline",heroHeadline)}</h1><p>${text(page,s,"copy",heroCopy)}</p><a class="pv-button" href="${(page.sections||[]).some((x:SectionConfig)=>x.kind!=="hero"&&!x.hidden)?"#next":pageHref(pages.find((x:PageConfig)=>x.id==="contact")||pages.at(-1)||page,pages.findIndex((x:PageConfig)=>x.id==="contact")>=0?pages.findIndex((x:PageConfig)=>x.id==="contact"):pages.length-1)}">${esc(page.id==="home"?c.content?.cta:profile.cta)} <span>→</span></a></div>${primaryImage?`<img src="${esc(primaryImage)}" alt="${company} ${esc(profile.category||c.industry||"")}">`:""}</section>`;
    if (s.kind === "services") return `<section ${attrs.replace('class="','class="pv-services ')}><small>LEISTUNGEN</small><h2>${text(page,s,"headline",profile.serviceTitle||"Leistungen")}</h2><div>${(profile.services||[]).map((x:{title:string;copy:string},i:number)=>`<article><b>0${i+1}</b><h3>${text(page,s,`service-${i}-title`,x.title)}</h3><p>${text(page,s,`service-${i}-copy`,x.copy)}</p></article>`).join("")}</div></section>`;
    if (s.kind === "about") { const img=imageUrl(images[1])||primaryImage; const aboutIndex=pages.findIndex(p=>p.id==="about"); return `<section ${attrs.replace('class="','class="pv-about ')}><div class="pv-image" style="background-image:url('${esc(img)}')"></div><div><small>ÜBER UNS</small><h2>${text(page,s,"headline",profile.aboutTitle||"Über uns")}</h2><p>${text(page,s,"copy",profile.aboutCopy||"")}</p>${page.id!=="about"&&aboutIndex>=0?`<a href="${pageHref(pages[aboutIndex],aboutIndex)}">Mehr erfahren →</a>`:""}</div></section>`; }
    if (s.kind === "projects") return `<section ${attrs.replace('class="','class="pv-projects ')}><small>REFERENZEN</small><h2>${text(page,s,"headline",profile.projectsTitle||"Referenzen")}</h2><div>${[0,2].map((ix,i)=>`<article style="background-image:url('${esc(imageUrl(images[ix])||primaryImage)}')"><span>${c.customText?.[`${page.id}:${s.id}:project-${i}`]?"":"<small>BEISPIELPROJEKT · </small>"}${text(page,s,`project-${i}`,(profile.projectNames||["Projekt eins","Projekt zwei"])[i])}</span></article>`).join("")}</div></section>`;
    if (s.kind === "reviews") return `<section ${attrs.replace('class="','class="pv-review ')}>${c.customText?.[`${page.id}:${s.id}:quote`]&&c.customText?.[`${page.id}:${s.id}:reviewer`]?"":"<span>BEISPIELINHALT · ECHTE KUNDENSTIMME EINSETZEN</span>"}<blockquote>„${text(page,s,"quote",profile.review||"")}“</blockquote><small>— ${text(page,s,"reviewer",profile.reviewer||"")}</small></section>`;
    if (s.kind === "contact") { const email=String(c.contactEmail||"").trim(); const usable=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); return `<section ${attrs.replace('class="','class="pv-contact ')}><div><small>KONTAKT</small><h2>${text(page,s,"headline",profile.cta||"Kontakt")}</h2><p>${text(page,s,"copy","Erzähl uns kurz, worum es geht. Wir melden uns persönlich zurück.")}</p></div><div class="pv-contact-placeholder"><strong>Kontaktbereich</strong>${usable?`<p>Schreib uns für eine persönliche Anfrage.</p><a href="mailto:${esc(email)}">${esc(email)}</a>`:"<p>Beispielansicht: Trage im Builder eine Kontakt-E-Mail ein.</p>"}</div></section>`; }
    return `<section ${attrs.replace('class="','class="pv-cta ')}><div><small>NÄCHSTER SCHRITT</small><h2>${text(page,s,"headline",profile.cta||"Projekt starten")}</h2></div><a class="pv-button" href="${pageHref(pages[pages.length-1]||page,pages.length-1)}">${esc(c.content?.cta||"Jetzt anfragen")} →</a></section>`;
  };

  // Exact CSS contract used by the builder, copied as a production asset at build time.
  const runtimeCss = await readFile(path.join(process.cwd(), "public", "jx-studio-runtime.css"), "utf8");
  // Apply the same explicit mobile preview rules to exported pages at the mobile viewport.
  const mobileCss = runtimeCss.split("\n").filter(line => line.includes(".site-preview.device-mobile")).map(line => {
    const rule = line.replaceAll(".site-preview.device-mobile", ".site-preview.export-site");
    return rule.trimStart().startsWith("@media") ? rule : `@media(max-width:760px){${rule}}`;
  }).join("\n");
  const responsiveOverrides = (() => {
    const points = { laptop:"(max-width:1280px)", tablet:"(max-width:1024px)", mobileLandscape:"(max-width:900px) and (orientation:landscape)", mobile:"(max-width:640px)" };
    let out = "\n/* Canonical responsive overrides from Builder SiteConfig */\n";
    for (const bp of Object.keys(points) as Array<keyof typeof points>) {
      const mq = points[bp];
      let rules = "";
      for (const page of pages) for (const section of page.sections || []) {
        const o = section.responsive?.[bp]; if (!o) continue;
        const r:string[]=[];
        if(o.paddingY!=null) r.push(`padding-top:${n(o.paddingY,80)}px`,`padding-bottom:${n(o.paddingY,80)}px`);
        if(o.background) r.push(`background:${color(o.background,c.surface)}`);
        if(o.color) r.push(`color:${color(o.color,c.text)}`);
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

  const exportOverrides = `\n/* JX export shell */\nhtml,body{margin:0;background:var(--preview-surface,#fff)}body{min-width:0}.site-preview{min-height:100vh}.preview-nav a{appearance:none;background:transparent;border:0;color:color-mix(in srgb,var(--preview-text) 68%,transparent);text-decoration:none;padding:8px 9px;border-radius:7px;font:700 10px Inter,sans-serif}.preview-nav a:hover,.preview-nav a.active{color:var(--preview-text);background:color-mix(in srgb,var(--preview-text) 7%,transparent)}.pv-button{display:inline-flex;align-items:center;gap:8px;border:1px solid transparent;background:var(--preview-accent);color:#111!important;font:800 10px Inter,sans-serif;padding:12px 15px;border-radius:calc(var(--preview-radius)*.45);margin-top:18px;text-decoration:none}.button-outline .pv-button{background:transparent;border-color:var(--preview-accent);color:var(--preview-accent)!important}.button-soft .pv-button{background:color-mix(in srgb,var(--preview-accent) 26%,transparent);color:color-mix(in srgb,var(--preview-accent) 80%,white)!important}.export-menu{display:none}.pv-contact-placeholder{border:1px solid color-mix(in srgb,var(--preview-text) 22%,transparent);padding:clamp(28px,4vw,52px);border-radius:var(--preview-radius);align-self:center}.pv-contact-placeholder p{margin-bottom:0}@media(max-width:760px){.export-menu{display:block;position:relative}.export-menu summary{cursor:pointer;padding:12px;list-style:none}.export-menu nav{position:absolute;right:0;top:100%;z-index:30;display:grid;min-width:170px;background:var(--preview-surface);border:1px solid var(--preview-text);padding:12px}.export-menu a{padding:12px}.preview-nav>div{display:none!important}}}`;

  const vars = `--preview-accent:${color(c.accent,"#77aaff")};--preview-secondary:${color(c.secondary,"#dbe7ff")};--preview-dark:${color(c.dark,"#111316")};--preview-surface:${color(c.surface,"#f3f0e7")};--preview-text:${color(c.text,"#15171a")};--preview-radius:${n(c.radius,20)}px;--preview-space:${n(c.spacing,100)}%;--preview-font:${c.font==="editorial"?"Georgia,serif":c.font==="technical"?"ui-monospace,SFMono-Regular,monospace":"Inter,sans-serif"}`;
  const shellClass = `site-preview export-site layout-${templateLayout} device-desktop button-${["solid","outline","soft"].includes(c.buttonStyle)?c.buttonStyle:"solid"} hero-${["left","center","right"].includes(c.heroAlign)?c.heroAlign:"left"}`;
  const files:Record<string,string> = {
    "styles.css": runtimeCss + mobileCss + responsiveOverrides + exportOverrides,
    "jx-configuration.json": JSON.stringify(c,null,2),
    "README.md": `# ${company}\n\nJX Studio Export aus JXS-${id}. Der Export verwendet die Preview-Styles und SiteConfig, aber eine separat erzeugte HTML-Struktur. Eine pixelgenaue Gleichheit ist nicht garantiert. Kontakt und rechtliche Pflichtseiten sind Beispielansichten: Vor Veröffentlichung mit einem echten Formular-Endpunkt, Datenschutz und Impressum ergänzen. Beispielreferenzen und Kundenstimmen durch belegbare Inhalte ersetzen. Bilder werden derzeit von externen URLs geladen und sind nicht im ZIP enthalten.`,
  };

  pages.forEach((p:PageConfig,i:number)=>{
    let nextAssigned=false;
    const sectionBody=(p.sections||[]).map((s:SectionConfig)=>{const html=renderSection(p,s,i);if(!nextAssigned&&s.kind!=="hero"&&html){nextAssigned=true;return html.replace("<section ","<section id=\"next\" ");}return html;}).join("\n");
    const body=sectionBody+renderConfiguredModules(p);
    const pageNav=pages.map((x:PageConfig,ix:number)=>`<a class="${x.id===p.id?'active':''}" href="${pageHref(x,ix)}">${esc(x.name)}</a>`).join("");
    const description = esc(String(i === 0 ? c.content?.copy : `${p.name} · ${c.company}`).slice(0, 180));
    files[pageHref(p,i)] = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${description}"><meta property="og:title" content="${esc(p.name)} · ${company}"><meta property="og:description" content="${description}"><title>${esc(p.name)} · ${company}</title><link rel="stylesheet" href="styles.css"></head><body><div class="${shellClass}" style="${vars}"><div class="preview-nav"><strong>${company}</strong><div>${pageNav}</div><details class="export-menu"><summary>Menü</summary><nav>${pageNav}</nav></details></div>${body}<footer class="pv-footer"><strong>${company}</strong><span>Beispielwebsite · Rechtstexte vor Veröffentlichung ergänzen</span></footer></div></body></html>`;
  });
  if (!files["index.html"]) files["index.html"]=`<!doctype html><html><body><h1>${company}</h1></body></html>`;

  return files;
}

export function makeZip(files:Record<string,string>){const enc=new TextEncoder(),locals:Uint8Array[]=[],centrals:Uint8Array[]=[];let offset=0;for(const [name,text] of Object.entries(files)){const ne=enc.encode(name),d=enc.encode(text),crc=crc32(d);const l=new Uint8Array(30+ne.length+d.length),v=new DataView(l.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,crc,true);v.setUint32(18,d.length,true);v.setUint32(22,d.length,true);v.setUint16(26,ne.length,true);l.set(ne,30);l.set(d,30+ne.length);locals.push(l);const ce=new Uint8Array(46+ne.length),cv=new DataView(ce.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint32(16,crc,true);cv.setUint32(20,d.length,true);cv.setUint32(24,d.length,true);cv.setUint16(28,ne.length,true);cv.setUint32(42,offset,true);ce.set(ne,46);centrals.push(ce);offset+=l.length}const centralSize=centrals.reduce((a,b)=>a+b.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,centrals.length,true);ev.setUint16(10,centrals.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);const out=new Uint8Array(offset+centralSize+22);let pos=0;for(const x of [...locals,...centrals,end]){out.set(x,pos);pos+=x.length}return out}
function crc32(data:Uint8Array){let c=0xffffffff;for(const b of data){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
