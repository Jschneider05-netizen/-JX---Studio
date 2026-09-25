export type Breakpoint = "desktop" | "laptop" | "tablet" | "mobileLandscape" | "mobile";
export type ResponsiveOverride = { paddingY?: number; radius?: number; opacity?: number; blur?: number; scale?: number; rotate?: number; offsetX?: number; offsetY?: number; hidden?: boolean };
export type BusinessModule = { id:string; title:string; industries:string[]; category:"booking"|"commerce"|"content"|"lead"|"operations"; backend:boolean; features:string[] };
export const BREAKPOINTS: Record<Exclude<Breakpoint,"desktop">, string> = { laptop:"(max-width: 1280px)", tablet:"(max-width: 1024px)", mobileLandscape:"(max-width: 900px) and (orientation: landscape)", mobile:"(max-width: 640px)" };
export const BUSINESS_MODULES: BusinessModule[] = [
 {id:"restaurant-reservations",title:"Tischreservierungen",industries:["Gastronomie"],category:"booking",backend:true,features:["Tische & Sitzplätze","Personenzahl","Zeitslots","Kapazitätsprüfung","Sperrzeiten","Stornierung"]},
 {id:"restaurant-menu",title:"Digitale Speisekarte",industries:["Gastronomie"],category:"content",backend:true,features:["Kategorien","Gerichte","Preise","Allergene","Verfügbarkeit"]},
 {id:"appointments",title:"Terminbuchung",industries:["Beauty","Praxis","Tattoo","Automotive"],category:"booking",backend:true,features:["Mitarbeiter","Leistungen","Dauer","Verfügbarkeit","Puffer","Stornierung"]},
 {id:"real-estate",title:"Objekte & Besichtigungen",industries:["Immobilien"],category:"operations",backend:true,features:["Objekte","Filter","Exposé","Status","Besichtigungstermine","Leads"]},
 {id:"fitness-booking",title:"Kurse & Probetraining",industries:["Fitness"],category:"booking",backend:true,features:["Kurse","Trainer","Kapazität","Warteliste","Probetraining"]},
 {id:"service-configurator",title:"Leistungs-Konfigurator",industries:["Handwerk","Reinigung"],category:"lead",backend:true,features:["Leistungsauswahl","Objektdaten","Uploads","Terminwunsch","Lead-Zusammenfassung"]},
 {id:"commerce",title:"Shop & Checkout",industries:["Alle"],category:"commerce",backend:true,features:["Produkte","Varianten","Bestand","Warenkorb","Checkout","Bestellungen"]},
 {id:"ai-assistant",title:"KI-Assistent",industries:["Alle"],category:"lead",backend:true,features:["FAQ","Beratung","Lead-Qualifizierung","Übergabe"]},
 {id:"hotel-booking",title:"Zimmer & Aufenthalte",industries:["Hotel","Ferienwohnung"],category:"booking",backend:true,features:["Zimmer","Belegung","Nächte","Gäste","Preise","Anfrage/Checkout"]},
 {id:"vouchers",title:"Gutscheine",industries:["Beauty","Gastronomie","Fitness","Tattoo"],category:"commerce",backend:true,features:["Werte","Codes","Einlösung","Status"]},
 {id:"reviews",title:"Bewertungen",industries:["Alle"],category:"content",backend:false,features:["Testimonials","Bewertungsquellen","Trust-Elemente"]},
 {id:"newsletter",title:"Newsletter",industries:["Alle"],category:"lead",backend:true,features:["Opt-in","Listen","Provider-Anbindung"]},
 {id:"customer-portal",title:"Kundenportal",industries:["Alle"],category:"operations",backend:true,features:["Projektstatus","Dokumente","Rechnungen","Support","Freigaben"]},
];
export const modulesForIndustry=(industry:string)=>BUSINESS_MODULES.filter(m=>m.industries.includes("Alle")||m.industries.includes(industry));
