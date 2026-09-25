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

export type PropertyListing = {
  id: string;
  title: string;
  type: string;
  transaction: "sale" | "rent";
  price: string;
  areaSqm: number;
  rooms: number;
  location: string;
  status: "available" | "reserved" | "sold" | "rented";
  imageUrl: string;
  exposeUrl: string;
};
export type RealEstateConfig = {
  enabled: boolean;
  recipientEmail: string;
  listings: PropertyListing[];
  filters: boolean;
  viewingRequest: boolean;
  placement: "page" | "home" | "both";
};

export type FitnessClass = {
  id: string;
  name: string;
  trainer: string;
  schedule: string;
  durationMinutes: number;
  capacity: number;
  price: string;
};
export type FitnessConfig = {
  enabled: boolean;
  recipientEmail: string;
  classes: FitnessClass[];
  trainers: string[];
  trialTraining: boolean;
  waitlist: boolean;
  placement: "page" | "home" | "both";
};

export type CommerceVariant = { id: string; name: string; price: string; stock: number };
export type CommerceProduct = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  stock: number;
  variants: CommerceVariant[];
};
export type CommerceConfig = {
  enabled: boolean;
  provider: "jx" | "shopify" | "external";
  recipientEmail: string;
  products: CommerceProduct[];
  shippingMode: "pickup" | "flat" | "configured";
  shippingPrice: string;
  paymentMethods: string[];
  placement: "page" | "home" | "both";
};

export type AutomotiveService = { id: string; name: string; durationMinutes: number; price: string };
export type AutomotiveConfig = {
  enabled: boolean;
  recipientEmail: string;
  services: AutomotiveService[];
  requestTypes: string[];
  vehicleFields: string[];
  allowUploads: boolean;
  serviceArea: string;
  placement: "page" | "home" | "both";
};

export type ServiceRequestConfig = {
  enabled: boolean;
  recipientEmail: string;
  serviceOptions: string[];
  serviceArea: string;
  collectBudget: boolean;
  collectPreferredDate: boolean;
  allowUploads: boolean;
  placement: "page" | "home" | "both";
};

export type VoucherConfig = {
  enabled: boolean;
  recipientEmail: string;
  presetValues: number[];
  customAmount: boolean;
  validityMonths: number;
};

export type NewsletterConfig = {
  enabled: boolean;
  provider: string;
  listName: string;
  doubleOptIn: boolean;
  successMessage: string;
};

export type RequirementsState = {
  business: BusinessDetails;
  domain: DomainDetails;
  contentPlan: ContentPlan;
  contactForm: ContactFormConfig;
  appointments: AppointmentConfig;
  restaurantMenu: RestaurantMenuConfig;
  realEstate: RealEstateConfig;
  fitness: FitnessConfig;
  commerce: CommerceConfig;
  automotive: AutomotiveConfig;
  serviceRequest: ServiceRequestConfig;
  vouchers: VoucherConfig;
  newsletter: NewsletterConfig;
};

export const defaultRequirements = (): RequirementsState => ({
  business: { contactName:"", phone:"", email:"", address:"", postalCode:"", city:"", openingHours:"", whatsapp:"", instagram:"" },
  domain: { status:"undecided", domainName:"", provider:"", manageDns:false, businessEmail:false },
  contentPlan: { texts:"customer", images:"customer", logo:"available" },
  contactForm: { enabled:false, recipientEmail:"", fields:["name","email","message"], requiredFields:["name","email","message"], confirmationEmail:true, successMessage:"Danke! Wir melden uns schnellstmöglich bei dir.", placement:"contact" },
  appointments: { enabled:false, recipientEmail:"", services:[], staff:[], weeklyHours:"Mo–Fr 09:00–18:00", bufferMinutes:15, leadTimeHours:24, cancellationHours:24, placement:"page" },
  restaurantMenu: { enabled:false, categories:[], placement:"page" },
  realEstate: { enabled:false, recipientEmail:"", listings:[], filters:true, viewingRequest:true, placement:"page" },
  fitness: { enabled:false, recipientEmail:"", classes:[], trainers:[], trialTraining:true, waitlist:true, placement:"page" },
  commerce: { enabled:false, provider:"shopify", recipientEmail:"", products:[], shippingMode:"configured", shippingPrice:"", paymentMethods:["card","paypal"], placement:"page" },
  automotive: { enabled:false, recipientEmail:"", services:[], requestTypes:["Service-Termin","Reparaturanfrage"], vehicleFields:["Marke","Modell","Kennzeichen","Erstzulassung","Kilometerstand"], allowUploads:true, serviceArea:"", placement:"page" },
  serviceRequest: { enabled:false, recipientEmail:"", serviceOptions:[], serviceArea:"", collectBudget:true, collectPreferredDate:true, allowUploads:true, placement:"page" },
  vouchers: { enabled:false, recipientEmail:"", presetValues:[25,50,100], customAmount:true, validityMonths:36 },
  newsletter: { enabled:false, provider:"", listName:"", doubleOptIn:true, successMessage:"Danke! Bitte bestätige deine Anmeldung per E-Mail." },
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
    realEstate: { ...base.realEstate, ...(input?.realEstate ?? {}) },
    fitness: { ...base.fitness, ...(input?.fitness ?? {}) },
    commerce: { ...base.commerce, ...(input?.commerce ?? {}) },
    automotive: { ...base.automotive, ...(input?.automotive ?? {}) },
    serviceRequest: { ...base.serviceRequest, ...(input?.serviceRequest ?? {}) },
    vouchers: { ...base.vouchers, ...(input?.vouchers ?? {}) },
    newsletter: { ...base.newsletter, ...(input?.newsletter ?? {}) },
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
  const check = (ok: boolean, label: string) => { total++; if (ok) done++; else missing.push(label); };
  if ((config.company ?? "").trim()) done++; else missing.push("Unternehmensname");
  if (r.business.contactName.trim()) done++; else missing.push("Ansprechpartner");
  if ((r.business.email || config.contactEmail || "").trim()) done++; else missing.push("Kontakt-E-Mail des Unternehmens");
  if (r.business.phone.trim()) done++; else missing.push("Telefonnummer");

  if (r.contactForm.enabled) {
    check(Boolean(r.contactForm.recipientEmail.trim()), "Empfänger-E-Mail für Kontaktformular");
    check(r.contactForm.fields.length > 0, "Mindestens ein Feld im Kontaktformular");
  }
  if (r.appointments.enabled) {
    check(Boolean(r.appointments.recipientEmail.trim()), "Empfänger-E-Mail für Terminbuchung");
    check(r.appointments.services.length > 0 && r.appointments.services.every(s=>s.name.trim() && s.durationMinutes > 0), "Mindestens eine vollständige Termin-Leistung");
    check(Boolean(r.appointments.weeklyHours.trim()), "Verfügbarkeiten / Öffnungszeiten für Termine");
  }
  if (r.restaurantMenu.enabled) {
    check(r.restaurantMenu.categories.length > 0, "Mindestens eine Speisekarten-Kategorie");
    check(r.restaurantMenu.categories.some(c=>c.items.some(i=>i.name.trim() && i.price.trim())), "Mindestens ein Gericht mit Name und Preis");
  }
  if (r.realEstate.enabled) {
    check(Boolean(r.realEstate.recipientEmail.trim()), "Empfänger-E-Mail für Immobilienanfragen");
    check(r.realEstate.listings.length > 0 && r.realEstate.listings.every(x=>x.title.trim() && x.price.trim()), "Mindestens ein vollständiges Immobilienobjekt");
  }
  if (r.fitness.enabled) {
    check(Boolean(r.fitness.recipientEmail.trim()), "Empfänger-E-Mail für Fitness-Anfragen");
    check(r.fitness.classes.length > 0 && r.fitness.classes.every(x=>x.name.trim() && x.schedule.trim() && x.capacity > 0), "Mindestens einen vollständigen Kurs anlegen");
  }
  if (r.commerce.enabled) {
    check(Boolean(r.commerce.recipientEmail.trim()), "Empfänger-E-Mail für Shop-Bestellungen");
    check(r.commerce.products.length > 0 && r.commerce.products.every(x=>x.name.trim() && x.price.trim()), "Mindestens ein vollständiges Shop-Produkt");
    check(Boolean(r.commerce.provider), "Shop-Provider auswählen");
  }
  if (r.automotive.enabled) {
    check(Boolean(r.automotive.recipientEmail.trim()), "Empfänger-E-Mail für Werkstatt-Anfragen");
    check(r.automotive.services.length > 0 && r.automotive.services.every(x=>x.name.trim()), "Mindestens eine Werkstatt-Leistung");
  }
  if (r.serviceRequest.enabled) {
    check(Boolean(r.serviceRequest.recipientEmail.trim()), "Empfänger-E-Mail für Projektanfragen");
    check(r.serviceRequest.serviceOptions.length > 0, "Mindestens eine auswählbare Leistung für Projektanfragen");
  }
  if (r.vouchers.enabled) {
    check(Boolean(r.vouchers.recipientEmail.trim()), "Empfänger-E-Mail für Gutscheine");
    check(r.vouchers.customAmount || r.vouchers.presetValues.length > 0, "Mindestens einen Gutscheinwert konfigurieren");
  }
  if (r.newsletter.enabled) {
    check(Boolean(r.newsletter.provider.trim()), "Newsletter-Provider angeben");
    check(Boolean(r.newsletter.listName.trim()), "Newsletter-Liste angeben");
  }

  check(r.domain.status !== "undecided", "Domain-Status auswählen");
  if (r.domain.status === "existing") check(Boolean(r.domain.domainName.trim()), "Vorhandene Domain angeben");

  const priced = new Set(["shop","booking","blog","languages","copy","seo","portal","analytics","ai","domain","deployment"]);
  const unpriced = (config.addons ?? []).filter(key => !priced.has(key));
  return { percent: Math.round((done / Math.max(1,total))*100), missing, ready: missing.length===0, requiresQuote: unpriced.length>0 };
}
