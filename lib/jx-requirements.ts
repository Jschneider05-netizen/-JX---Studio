export type BusinessDetails = {
  contactName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  openingHours: string;
  whatsapp: string;
  instagram: string;
};

export type DomainDetails = {
  status: "undecided" | "existing" | "needed";
  domainName: string;
  provider: string;
  manageDns: boolean;
  businessEmail: boolean;
};

export type ContentPlan = {
  texts: "customer" | "existing" | "jx" | "later";
  images: "customer" | "existing" | "jx" | "later";
  logo: "available" | "needed" | "later";
};

export type ContactFormConfig = {
  enabled: boolean;
  recipientEmail: string;
  fields: string[];
  requiredFields: string[];
  confirmationEmail: boolean;
  successMessage: string;
  placement: "contact" | "home" | "both";
};

export type AppointmentService = { id: string; name: string; durationMinutes: number; price: string };
export type AppointmentConfig = {
  enabled: boolean;
  recipientEmail: string;
  services: AppointmentService[];
  staff: string[];
  weeklyHours: string;
  bufferMinutes: number;
  leadTimeHours: number;
  cancellationHours: number;
  placement: "page" | "home" | "both";
};

export type MenuItem = { id: string; name: string; description: string; price: string; allergens: string; tags: string; available: boolean };
export type MenuCategory = { id: string; name: string; items: MenuItem[] };
export type RestaurantMenuConfig = {
  enabled: boolean;
  categories: MenuCategory[];
  placement: "page" | "home" | "both";
};

export type RequirementsState = {
  business: BusinessDetails;
  domain: DomainDetails;
  contentPlan: ContentPlan;
  contactForm: ContactFormConfig;
  appointments: AppointmentConfig;
  restaurantMenu: RestaurantMenuConfig;
};

export const defaultRequirements = (): RequirementsState => ({
  business: { contactName:"", phone:"", email:"", address:"", postalCode:"", city:"", openingHours:"", whatsapp:"", instagram:"" },
  domain: { status:"undecided", domainName:"", provider:"", manageDns:false, businessEmail:false },
  contentPlan: { texts:"customer", images:"customer", logo:"available" },
  contactForm: { enabled:false, recipientEmail:"", fields:["name","email","message"], requiredFields:["name","email","message"], confirmationEmail:true, successMessage:"Danke! Wir melden uns schnellstmöglich bei dir.", placement:"contact" },
  appointments: { enabled:false, recipientEmail:"", services:[], staff:[], weeklyHours:"Mo–Fr 09:00–18:00", bufferMinutes:15, leadTimeHours:24, cancellationHours:24, placement:"page" },
  restaurantMenu: { enabled:false, categories:[], placement:"page" },
});

export function normalizeRequirements(input?: Partial<RequirementsState>): RequirementsState {
  const base = defaultRequirements();
  return {
    business: { ...base.business, ...(input?.business ?? {}) },
    domain: { ...base.domain, ...(input?.domain ?? {}) },
    contentPlan: { ...base.contentPlan, ...(input?.contentPlan ?? {}) },
    contactForm: { ...base.contactForm, ...(input?.contactForm ?? {}) },
    appointments: { ...base.appointments, ...(input?.appointments ?? {}) },
    restaurantMenu: { ...base.restaurantMenu, ...(input?.restaurantMenu ?? {}) },
  };
}

export type CompletenessResult = { percent:number; missing:string[]; ready:boolean; requiresQuote:boolean };

export function requirementsCompleteness(config: {
  company?: string;
  contactEmail?: string;
  industry?: string;
  addons?: string[];
  requirements?: Partial<RequirementsState>;
}): CompletenessResult {
  const r = normalizeRequirements(config.requirements);
  const missing: string[] = [];
  let total = 4;
  let done = 0;
  if ((config.company ?? "").trim()) done++; else missing.push("Unternehmensname");
  if (r.business.contactName.trim()) done++; else missing.push("Ansprechpartner");
  if ((r.business.email || config.contactEmail || "").trim()) done++; else missing.push("Kontakt-E-Mail des Unternehmens");
  if (r.business.phone.trim()) done++; else missing.push("Telefonnummer");

  if (r.contactForm.enabled) {
    total += 2;
    if (r.contactForm.recipientEmail.trim()) done++; else missing.push("Empfänger-E-Mail für Kontaktformular");
    if (r.contactForm.fields.length > 0) done++; else missing.push("Mindestens ein Feld im Kontaktformular");
  }
  if (r.appointments.enabled) {
    total += 3;
    if (r.appointments.recipientEmail.trim()) done++; else missing.push("Empfänger-E-Mail für Terminbuchung");
    if (r.appointments.services.length > 0 && r.appointments.services.every(s=>s.name.trim() && s.durationMinutes > 0)) done++; else missing.push("Mindestens eine vollständige Termin-Leistung");
    if (r.appointments.weeklyHours.trim()) done++; else missing.push("Verfügbarkeiten / Öffnungszeiten für Termine");
  }
  if (r.restaurantMenu.enabled) {
    total += 2;
    if (r.restaurantMenu.categories.length > 0) done++; else missing.push("Mindestens eine Speisekarten-Kategorie");
    if (r.restaurantMenu.categories.some(c=>c.items.some(i=>i.name.trim() && i.price.trim()))) done++; else missing.push("Mindestens ein Gericht mit Name und Preis");
  }
  if (r.domain.status !== "undecided") { total += 1; done += 1; }
  else { total += 1; missing.push("Domain-Status auswählen"); }
  if (r.domain.status === "existing") {
    total += 1;
    if (r.domain.domainName.trim()) done++; else missing.push("Vorhandene Domain angeben");
  }

  const unpriced = (config.addons ?? []).filter(key => !["shop","booking","blog","languages","copy","seo","portal","analytics","ai","domain","deployment"].includes(key));
  return { percent: Math.round((done / Math.max(1,total))*100), missing, ready: missing.length===0, requiresQuote: unpriced.length>0 };
}
