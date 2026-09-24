"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Layers3,
  Menu,
  Monitor,
  Palette,
  Plus,
  Redo2,
  Rocket,
  ShoppingBag,
  Smartphone,
  Tablet,
  Sparkles,
  Trash2,
  Undo2,
  Upload,
  WandSparkles,
  X,
  Bot,
  MessageCircle,
  Send,
  Headphones,
  CalendarDays,
  Clock3,
  Users,
  CreditCard,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster, toast } from "sonner";

type View = "home" | "templates" | "builder" | "services" | "consultation" | "contact";
type Device = "desktop" | "laptop" | "tablet" | "mobileLandscape" | "mobile";
type SectionKind = "hero" | "services" | "about" | "projects" | "reviews" | "contact" | "cta";
type TemplateLayout = "split" | "editorial" | "impact";
type BuilderSetter = React.Dispatch<React.SetStateAction<BuilderState>>;

type SectionStyle = { paddingY?: number; background?: string; color?: string; radius?: number; opacity?: number; blur?: number; scale?: number; rotate?: number; offsetX?: number; offsetY?: number };
type SectionAnimation = { type?: "none" | "fade" | "slide-up" | "slide-left" | "zoom" | "blur" | "rotate"; duration?: number; delay?: number; easing?: string; repeat?: boolean };
type SectionConfig = { id: string; kind: SectionKind; hidden?: boolean; style?: SectionStyle; animation?: SectionAnimation; responsive?: Partial<Record<Device, SectionStyle & { hidden?: boolean }>> };
type PageConfig = { id: string; name: string; sections: SectionConfig[] };

type BranchProfile = {
  category: string;
  kicker: string;
  heroCopy: string;
  serviceTitle: string;
  services: { title: string; copy: string }[];
  aboutTitle: string;
  aboutCopy: string;
  projectsTitle: string;
  projectNames: [string, string];
  review: string;
  reviewer: string;
  cta: string;
  pageNames: [string, string, string, string];
};

type Template = {
  id: string;
  category: string;
  name: string;
  style: string;
  headline: string;
  copy: string;
  accent: string;
  dark: string;
  image: string;
  layout: TemplateLayout;
};

export type BuilderState = {
  templateId: string;
  mode: "template" | "free";
  editorMode?: "easy" | "advanced" | "pro";
  company: string;
  industry: string;
  accent: string;
  secondary: string;
  dark: string;
  surface: string;
  text: string;
  radius: number;
  spacing: number;
  font: "modern" | "editorial" | "technical";
  buttonStyle: "solid" | "outline" | "soft";
  heroAlign: "left" | "center" | "right";
  pages: PageConfig[];
  addons: string[];
  modules?: string[];
  care: boolean;
  rush: boolean;
  content: { kicker: string; headline: string; copy: string; cta: string; image: string };
  customText: Record<string, string>;
  /** Canonical snapshot used by preview + production export. */
  resolvedContent?: BranchProfile;
  resolvedImages?: string[];
};

const categories = ["Alle", "Handwerk", "Beauty", "Gastronomie", "Immobilien", "Fitness", "Automotive", "Reinigung", "Praxis", "Tattoo"];

const imageSets: Record<string, string[]> = {
  Handwerk: [
    "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1600",
  ],
  Beauty: [
    "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/3738369/pexels-photo-3738369.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=1600",
  ],
  Gastronomie: [
    "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600",
  ],
  Immobilien: [
    "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1600",
  ],
  Fitness: [
    "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/2261485/pexels-photo-2261485.jpeg?auto=compress&cs=tinysrgb&w=1600",
  ],
  Automotive: [
    "https://images.pexels.com/photos/6872140/pexels-photo-6872140.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=1600",
  ],
  Reinigung: [
    "https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/6195122/pexels-photo-6195122.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/6197122/pexels-photo-6197122.jpeg?auto=compress&cs=tinysrgb&w=1600",
  ],
  Praxis: [
    "https://images.pexels.com/photos/3845983/pexels-photo-3845983.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=1600",
  ],
  Tattoo: [
    "https://images.pexels.com/photos/4125619/pexels-photo-4125619.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/1912117/pexels-photo-1912117.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "https://images.pexels.com/photos/2183131/pexels-photo-2183131.jpeg?auto=compress&cs=tinysrgb&w=1600",
  ],
};

const profiles: Record<string, BranchProfile> = {
  Handwerk: {
    category: "Handwerk", kicker: "MEISTERBETRIEB AUS BREMEN", heroCopy: "Saubere Arbeit, klare Termine und ein Ergebnis, auf das du dich verlassen kannst.", serviceTitle: "Handwerk mit System.",
    services: [{ title: "Sanierung", copy: "Von der Planung bis zur sauberen Übergabe aus einer Hand." }, { title: "Innenausbau", copy: "Präzise Lösungen für Räume, die dauerhaft funktionieren." }, { title: "Service", copy: "Kurze Wege, verbindliche Rückmeldung und transparente Abläufe." }],
    aboutTitle: "Erfahrung, die man im Detail erkennt.", aboutCopy: "Wir verbinden solides Handwerk mit moderner Planung und ehrlicher Kommunikation. Keine Worthülsen, sondern Arbeit, die hält.", projectsTitle: "Zuletzt umgesetzt.", projectNames: ["Altbau · Schwachhausen", "Gewerbe · Stuhr"], review: "Pünktlich, sauber und von Anfang bis Ende transparent. Genau so wünscht man sich einen Handwerksbetrieb.", reviewer: "Familie Krüger · Bremen", cta: "Projekt besprechen", pageNames: ["Startseite", "Leistungen", "Referenzen", "Kontakt"],
  },
  Beauty: {
    category: "Beauty", kicker: "BEAUTY STUDIO · BREMEN", heroCopy: "Rituale, Treatments und kleine Auszeiten, die sich nach dir richten.", serviceTitle: "Treatments für deinen Glow.",
    services: [{ title: "Facials", copy: "Individuell abgestimmte Gesichtsbehandlungen für frische Haut." }, { title: "Brows & Lashes", copy: "Form, Farbe und Ausdruck mit einem natürlichen Finish." }, { title: "Skin Coaching", copy: "Persönliche Beratung für eine Routine, die wirklich zu dir passt." }],
    aboutTitle: "Beauty ohne Fließbandgefühl.", aboutCopy: "Bei uns steht nicht der nächste Termin im Kalender im Mittelpunkt, sondern die Person auf der Liege. Ruhig, hochwertig und persönlich.", projectsTitle: "Studio & Ergebnisse.", projectNames: ["Signature Facial", "Brow Styling"], review: "Das erste Studio, bei dem Beratung und Ergebnis wirklich zusammenpassen. Ich komme jedes Mal entspannter raus.", reviewer: "Mara · Bremen", cta: "Termin anfragen", pageNames: ["Startseite", "Treatments", "Studio", "Termin"],
  },
  Gastronomie: {
    category: "Gastronomie", kicker: "KÜCHE · WEIN · GUTE ABENDE", heroCopy: "Saisonale Küche, gute Produkte und ein Raum, in dem man gerne länger sitzen bleibt.", serviceTitle: "Auf der Karte.",
    services: [{ title: "Abendkarte", copy: "Saisonal gedacht, klar gekocht und regelmäßig neu zusammengestellt." }, { title: "Lunch", copy: "Eine kleine Karte für gute Mittagspausen ohne Kompromisse." }, { title: "Private Dining", copy: "Menüs und Abende für Gruppen, Feiern und besondere Anlässe." }],
    aboutTitle: "Essen darf unkompliziert sein. Qualität nicht.", aboutCopy: "Wir kochen produktorientiert, arbeiten mit ausgewählten Partnern und servieren ohne großes Theater. Der Teller darf das Reden übernehmen.", projectsTitle: "Ein Blick ins Haus.", projectNames: ["Chef's Table", "Sommerkarte"], review: "Unaufgeregt, richtig gutes Essen und ein Service, der aufmerksam ist, ohne ständig am Tisch zu stehen.", reviewer: "Lena & Tom · Bremen", cta: "Tisch reservieren", pageNames: ["Startseite", "Speisekarte", "Restaurant", "Reservierung"],
  },
  Immobilien: {
    category: "Immobilien", kicker: "IMMOBILIEN · BREMEN & UMZU", heroCopy: "Vermarktung mit klarer Strategie, hochwertigen Exposés und persönlicher Begleitung.", serviceTitle: "Von der Bewertung bis zum Abschluss.",
    services: [{ title: "Verkauf", copy: "Positionierung, Vermarktung und strukturierte Käuferkommunikation." }, { title: "Bewertung", copy: "Nachvollziehbare Einschätzung mit Blick auf Lage, Zustand und Markt." }, { title: "Vermietung", copy: "Professionelle Präsentation und ein sauberer Auswahlprozess." }],
    aboutTitle: "Immobilien sind Werte. Vertrauen gehört dazu.", aboutCopy: "Wir kombinieren lokale Marktkenntnis mit hochwertiger Präsentation und einem Prozess, der für Eigentümer und Interessenten transparent bleibt.", projectsTitle: "Aktuelle Auswahl.", projectNames: ["Villa · Oberneuland", "Loft · Überseestadt"], review: "Die Vermarktung war hochwertig, die Kommunikation schnell und jeder Schritt nachvollziehbar.", reviewer: "Eigentümer · Bremen", cta: "Immobilie bewerten", pageNames: ["Startseite", "Immobilien", "Verkaufen", "Kontakt"],
  },
  Fitness: {
    category: "Fitness", kicker: "COACHING · PERFORMANCE · BREMEN", heroCopy: "Training mit Plan, klaren Zielen und einem System, das zu deinem Alltag passt.", serviceTitle: "Training, das einen Zweck hat.",
    services: [{ title: "Personal Training", copy: "1:1 Coaching mit sauberer Technik, Progression und klarer Struktur." }, { title: "Online Coaching", copy: "Individueller Plan, regelmäßige Check-ins und Anpassungen im Alltag." }, { title: "Performance", copy: "Kraft, Athletik und Belastbarkeit für ambitionierte Ziele." }],
    aboutTitle: "Keine Motivationstricks. Ein gutes System.", aboutCopy: "Fortschritt entsteht nicht aus Zufall. Wir verbinden Training, Feedback und realistische Routinen zu einem Plan, der langfristig funktioniert.", projectsTitle: "Transformationen & Coaching.", projectNames: ["12 Wochen Strength", "Athletic Build"], review: "Endlich ein Plan, bei dem ich verstehe, warum ich etwas mache. Die Fortschritte waren nach wenigen Wochen messbar.", reviewer: "Jonas · Bremen", cta: "Coaching starten", pageNames: ["Startseite", "Coaching", "Ergebnisse", "Kontakt"],
  },
  Automotive: {
    category: "Automotive", kicker: "DETAILING · PROTECTION · PERFORMANCE", heroCopy: "Fahrzeugpflege für Menschen, die den Unterschied zwischen sauber und perfekt sehen.", serviceTitle: "Detailing bis ins Detail.",
    services: [{ title: "Detailing", copy: "Lack, Innenraum und Details professionell aufbereitet." }, { title: "Keramikversiegelung", copy: "Langfristiger Schutz, leichteres Reinigen und ein tiefes Finish." }, { title: "Lackkorrektur", copy: "Defekte reduzieren und den Lack sichtbar zurückholen." }],
    aboutTitle: "Wir behandeln jedes Fahrzeug wie ein Projekt.", aboutCopy: "Keine Waschstraße, kein Schnellprogramm. Jeder Auftrag wird nach Zustand, Material und gewünschtem Ergebnis aufgebaut.", projectsTitle: "Selected cars.", projectNames: ["Porsche 911 · Correction", "BMW M3 · Ceramic"], review: "Der Lack sah besser aus als bei der Auslieferung. Dazu sauber erklärt, was gemacht wurde und was sinnvoll ist.", reviewer: "Daniel · Stuhr", cta: "Fahrzeug anfragen", pageNames: ["Startseite", "Leistungen", "Projekte", "Anfrage"],
  },
  Reinigung: {
    category: "Reinigung", kicker: "GEBÄUDESERVICE · BREMEN", heroCopy: "Zuverlässige Reinigung mit festen Abläufen, klaren Ansprechpartnern und dokumentierter Qualität.", serviceTitle: "Sauber geplant. Sauber erledigt.",
    services: [{ title: "Unterhaltsreinigung", copy: "Regelmäßige Pflege für Büros, Praxen und Gewerbeflächen." }, { title: "Grundreinigung", copy: "Intensive Reinigung für Übergaben, Neustarts und stark beanspruchte Flächen." }, { title: "Glasreinigung", copy: "Streifenfreie Glas- und Rahmenreinigung mit planbaren Intervallen." }],
    aboutTitle: "Verlässlichkeit ist Teil der Leistung.", aboutCopy: "Klare Zuständigkeiten, feste Qualitätsstandards und eine Kommunikation, bei der Probleme nicht drei E-Mails brauchen.", projectsTitle: "Objekte & Leistungen.", projectNames: ["Praxis · 480 m²", "Büro · 1.200 m²"], review: "Seit dem Wechsel läuft die Reinigung einfach. Feste Ansprechpartner und konstant gute Qualität.", reviewer: "Office Management · Bremen", cta: "Angebot erhalten", pageNames: ["Startseite", "Leistungen", "Objekte", "Angebot"],
  },
  Praxis: {
    category: "Praxis", kicker: "HAUSARZTPRAXIS · BREMEN", heroCopy: "Moderne medizinische Versorgung, verständlich erklärt und persönlich begleitet.", serviceTitle: "Gut versorgt im Alltag.",
    services: [{ title: "Hausärztliche Versorgung", copy: "Diagnostik, Behandlung und langfristige Begleitung aus einer Hand." }, { title: "Vorsorge", copy: "Check-ups und Prävention mit Zeit für verständliche Beratung." }, { title: "Akutsprechstunde", copy: "Strukturierte Hilfe bei akuten Beschwerden und kurzfristigem Bedarf." }],
    aboutTitle: "Medizin beginnt mit Zuhören.", aboutCopy: "Wir möchten, dass Patientinnen und Patienten Entscheidungen verstehen. Deshalb verbinden wir moderne Medizin mit klarer Kommunikation.", projectsTitle: "Praxis & Schwerpunkte.", projectNames: ["Vorsorge", "Diagnostik"], review: "Man fühlt sich ernst genommen und bekommt verständlich erklärt, was als Nächstes passiert.", reviewer: "Patientin · Bremen", cta: "Termin anfragen", pageNames: ["Startseite", "Leistungen", "Praxis", "Termin"],
  },
  Tattoo: {
    category: "Tattoo", kicker: "TATTOO ATELIER · BREMEN", heroCopy: "Individuelle Motive, klare Linien und Sessions mit Zeit für eine gute Idee.", serviceTitle: "Von der Idee bis unter die Haut.",
    services: [{ title: "Fine Line", copy: "Reduzierte Motive, präzise Linien und ein ruhiges Finish." }, { title: "Custom", copy: "Individuell entwickelte Motive statt Kataloglösung." }, { title: "Cover-up", copy: "Neue Konzepte für vorhandene Tattoos mit realistischer Planung." }],
    aboutTitle: "Ein Tattoo ist kein Termin zwischen zwei anderen.", aboutCopy: "Wir nehmen uns Zeit für Motiv, Platzierung und Proportion. Das Ziel ist nicht nur ein gutes Foto direkt danach, sondern ein Tattoo, das langfristig funktioniert.", projectsTitle: "Selected work.", projectNames: ["Fine Line", "Blackwork"], review: "Super Beratung, entspannte Atmosphäre und das Ergebnis ist genau so geworden, wie ich es mir vorgestellt habe.", reviewer: "Nina · Bremen", cta: "Motiv anfragen", pageNames: ["Startseite", "Artists", "Galerie", "Termin"],
  },
};

const freeProfile: BranchProfile = {
  category: "Freies Projekt", kicker: "DEIN UNTERNEHMEN", heroCopy: "Beschreibe hier in einem klaren Satz, warum Kunden genau bei dir richtig sind.", serviceTitle: "Was du anbietest.",
  services: [{ title: "Leistung eins", copy: "Kurze, verständliche Beschreibung der ersten Kernleistung." }, { title: "Leistung zwei", copy: "Eine zweite Leistung mit klarem Nutzen für deine Zielgruppe." }, { title: "Leistung drei", copy: "Ein weiterer Baustein, den du flexibel anpassen kannst." }],
  aboutTitle: "Warum dein Unternehmen anders arbeitet.", aboutCopy: "Nutze diesen Bereich, um Haltung, Erfahrung und Arbeitsweise glaubwürdig zu erklären.", projectsTitle: "Ausgewählte Arbeiten.", projectNames: ["Projekt eins", "Projekt zwei"], review: "Hier kann später eine echte Kundenstimme stehen, die Vertrauen schafft.", reviewer: "Kunde · Beispiel", cta: "Projekt starten", pageNames: ["Startseite", "Leistungen", "Über uns", "Kontakt"],
};

const templateWords: Record<string, [string, string, string][]> = {
  Handwerk: [["Werkstatt", "Kraftvoll", "Qualität, die man sehen kann."], ["Bauwerk", "Editorial", "Sauber gebaut. Klar kommuniziert."], ["Meisterstück", "Premium", "Präzision in jedem Detail."]],
  Beauty: [["Élan", "Minimal", "Schönheit beginnt mit Zeit für dich."], ["Glow", "Editorial", "Dein Moment. Dein Glow."], ["Aura", "Soft Luxury", "Pflege, die man sieht."]],
  Gastronomie: [["Tavola", "Editorial", "Ehrliches Essen. Gute Abende."], ["Noir", "Dark Luxury", "Geschmack braucht keine Erklärung."], ["Mise", "Modern", "Frisch gedacht. Direkt serviert."]],
  Immobilien: [["Habitat", "Architectural", "Räume mit Perspektive."], ["Norden", "Premium", "Immobilien. Klar vermittelt."], ["Areal", "Minimal", "Werte, die bleiben."]],
  Fitness: [["Form", "Bold", "Stärker als gestern."], ["Athletica", "Clean", "Training mit System."], ["Pulse", "High Energy", "Move. Build. Repeat."]],
  Automotive: [["Torque", "Performance", "Pflege bis ins Detail."], ["Apex", "Luxury", "Automotive Excellence."], ["Drive", "Technical", "Mehr als nur sauber."]],
  Reinigung: [["Klarwerk", "Trust", "Sauberkeit, auf die du zählen kannst."], ["Pure", "Minimal", "Professionell sauber."], ["Glanz", "Friendly", "Wir kümmern uns darum."]],
  Praxis: [["Sana", "Calm", "Medizin, die zuhört."], ["Mitte", "Modern", "Gesundheit gut erklärt."], ["Vita", "Warm", "Gut versorgt. Persönlich begleitet."]],
  Tattoo: [["Inkhaus", "Dark", "Deine Idee. Unsere Handschrift."], ["Fine", "Editorial", "Linien mit Bedeutung."], ["Atelier 13", "Brutalist", "Art under skin."]],
};

const paletteMatrix = [
  ["#77aaff", "#f2b66d", "#70d6a8", "#ff7d6b", "#8cb7ff", "#f4c363", "#6fd8c4", "#a8a0ff", "#f4a8cb"],
  ["#9e7bff", "#ff8c78", "#71c7ff", "#c0a676", "#74d7ff", "#f05d5e", "#73a7ff", "#78b3ff", "#d496ff"],
  ["#ff6b35", "#d8ff66", "#f1bd5c", "#99c8a9", "#ff674d", "#8fa4ff", "#71c7ff", "#77d79e", "#f1bd5c"],
];

const layouts: TemplateLayout[] = ["split", "editorial", "impact"];
const templates: Template[] = Object.entries(templateWords).flatMap(([category, variants], categoryIndex) =>
  variants.map(([name, style, headline], index) => ({
    id: `${category.toLowerCase()}-${index + 1}`,
    category,
    name,
    style,
    headline,
    copy: profiles[category].heroCopy,
    accent: paletteMatrix[index][categoryIndex],
    dark: index === 1 ? "#111114" : index === 2 ? "#0b1014" : "#111316",
    image: imageSets[category][index],
    layout: layouts[index],
  })),
);

const blankTemplate: Template = {
  id: "free-studio", category: "Freies Projekt", name: "Studio", style: "Freier Builder", headline: "Eine Website, die bei dir beginnt.", copy: freeProfile.heroCopy, accent: "#77aaff", dark: "#111316", image: imageSets.Handwerk[0], layout: "split",
};

const sectionLabels: Record<SectionKind, string> = { hero: "Hero", services: "Leistungen", about: "Über uns", projects: "Referenzen", reviews: "Bewertungen", contact: "Kontakt", cta: "Call-to-Action" };
const addonPrices: Record<string, number> = { shop: 900, booking: 350, blog: 250, languages: 280, copy: 320, seo: 290, portal: 1200, analytics: 190, ai: 690, domain: 99, deployment: 149 };
const addonLabels: Record<string, string> = { shop: "Online-Shop", booking: "Terminbuchung", blog: "Blog / News", languages: "Zweite Sprache", copy: "Professionelle Texte", seo: "SEO Pro Setup", portal: "Kundenportal", analytics: "Tracking & Analytics", ai: "KI-Support & Lead-Chatbot", domain: "Domain & DNS einrichten", deployment: "Hosting & Live-Schaltung" };

const industryModules: Record<string, { key: string; title: string; copy: string }[]> = {
  Gastronomie: [
    { key: "restaurant-reservations", title: "Tischreservierung", copy: "Kapazitäten, Personen, Zeitfenster, Reservierungsdauer und Sperrzeiten." },
    { key: "restaurant-menu", title: "Digitale Speisekarte", copy: "Kategorien, Gerichte, Preise, Allergene und Verfügbarkeit." },
    { key: "restaurant-events", title: "Events & Private Dining", copy: "Veranstaltungen, Gruppenanfragen und besondere Öffnungszeiten." },
  ],
  Beauty: [
    { key: "beauty-booking", title: "Terminbuchung", copy: "Leistungen, Dauer, Mitarbeiter, Arbeitszeiten, Pausen und freie Slots." },
    { key: "beauty-team", title: "Team & Leistungen", copy: "Mitarbeiterprofile, Services, Preise und Zuordnung." },
  ],
  Tattoo: [
    { key: "tattoo-consultation", title: "Beratungs- & Terminflow", copy: "Motivwunsch, Körperstelle, Uploads, Artist-Auswahl und Terminvorqualifizierung." },
    { key: "tattoo-gallery", title: "Artist Portfolio", copy: "Arbeiten nach Stil, Artist und Motiv filterbar." },
  ],
  Immobilien: [
    { key: "realestate-listings", title: "Objektverwaltung", copy: "Objekte, Status, Preis, Fläche, Zimmer, Galerie und Exposé." },
    { key: "realestate-viewings", title: "Besichtigungstermine", copy: "Verfügbare Termine, Objektbezug und Lead-Erfassung." },
  ],
  Fitness: [
    { key: "fitness-classes", title: "Kursbuchung", copy: "Kurse, Trainer, Teilnehmerlimit und verfügbare Plätze." },
    { key: "fitness-trial", title: "Probetraining", copy: "Terminwahl, Kontaktdaten und automatische Bestätigung." },
  ],
  Praxis: [
    { key: "practice-appointments", title: "Termin-Anfrage", copy: "Terminarten, Dauer und Verfügbarkeiten mit datensparsamer Erfassung." },
  ],
  Automotive: [
    { key: "auto-booking", title: "Service-Termine", copy: "Leistung, Fahrzeugdaten, Zeitfenster und Werkstattkapazität." },
    { key: "auto-inventory", title: "Fahrzeugbestand", copy: "Fahrzeuge, Filter, Ausstattung, Status und Anfragen." },
  ],
  Handwerk: [
    { key: "trade-estimator", title: "Projekt-Anfrage", copy: "Leistung, Ort, Zeitraum, Budget und Datei-/Foto-Uploads strukturiert erfassen." },
  ],
  Reinigung: [
    { key: "cleaning-request", title: "Reinigungs-Konfigurator", copy: "Objektart, Fläche, Rhythmus, Zusatzleistungen und Terminwunsch." },
  ],
};

const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const makeSection = (kind: SectionKind): SectionConfig => ({ id: newId(kind), kind, style: {}, animation: { type: "none", duration: 700, delay: 0, easing: "cubic-bezier(.16,1,.3,1)", repeat: false } });
const makePage = (id: string, name: string, kinds: SectionKind[]): PageConfig => ({ id, name, sections: kinds.map(makeSection) });

function pagesFor(profile: BranchProfile) {
  return [
    makePage("home", profile.pageNames[0], ["hero", "services", "about", "projects", "reviews", "cta"]),
    makePage("services", profile.pageNames[1], ["hero", "services", "projects", "cta"]),
    makePage("about", profile.pageNames[2], ["hero", "about", "reviews", "cta"]),
    makePage("contact", profile.pageNames[3], ["hero", "contact"]),
  ];
}

const defaultState: BuilderState = {
  templateId: "handwerk-1",
  mode: "template",
  editorMode: "easy",
  company: "Nordwerk",
  industry: "Handwerk",
  accent: "#77aaff",
  secondary: "#dbe7ff",
  dark: "#111316",
  surface: "#f3f0e7",
  text: "#15171a",
  radius: 20,
  spacing: 100,
  font: "modern",
  buttonStyle: "solid",
  heroAlign: "left",
  pages: pagesFor(profiles.Handwerk),
  addons: [],
  care: true,
  rush: false,
  content: { kicker: profiles.Handwerk.kicker, headline: templates[0].headline, copy: profiles.Handwerk.heroCopy, cta: profiles.Handwerk.cta, image: imageSets.Handwerk[0] },
  customText: {},
};

const money = (value: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
const profileFor = (industry: string) => profiles[industry] ?? freeProfile;
const isPhoneViewport = () => typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;

function normaliseBuilder(raw: Partial<BuilderState>): BuilderState {
  const sourcePages = Array.isArray(raw.pages) && raw.pages.length ? raw.pages : defaultState.pages;
  const pages: PageConfig[] = sourcePages.map((page): PageConfig => ({
    id: page.id,
    name: page.name,
    sections: Array.isArray(page.sections)
      ? page.sections.map((section): SectionConfig => {
          if (typeof section === "string") return makeSection(section as SectionKind);
          const animation: SectionAnimation = {
            type: "none",
            duration: 700,
            delay: 0,
            easing: "cubic-bezier(.16,1,.3,1)",
            repeat: false,
            ...(section.animation ?? {}),
          };
          return {
            id: section.id || newId(section.kind),
            kind: section.kind,
            hidden: Boolean(section.hidden),
            style: section.style ?? {},
            animation,
          };
        })
      : [],
  }));
  return {
    ...defaultState,
    ...raw,
    pages,
    content: { ...defaultState.content, ...(raw.content ?? {}) },
    customText: raw.customText ?? {},
  };
}

export default function JXStudio() {
  const [view, setView] = useState<View>("home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [filter, setFilter] = useState("Alle");
  const [builder, setBuilderRaw] = useState<BuilderState>(defaultState);
  const [activePage, setActivePage] = useState("home");
  const [device, setDevice] = useState<Device>("desktop");
  const [builderTab, setBuilderTab] = useState("structure");
  const [templateDialog, setTemplateDialog] = useState<Template | null>(null);
  const [previewDevice, setPreviewDevice] = useState<Device>("desktop");
  const [previewPage, setPreviewPage] = useState("home");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const history = useRef<BuilderState[]>([]);
  const future = useRef<BuilderState[]>([]);

  const setBuilder = useCallback<BuilderSetter>((updater) => {
    setBuilderRaw((previous) => {
      const next = typeof updater === "function" ? (updater as (state: BuilderState) => BuilderState)(previous) : updater;
      if (JSON.stringify(next) === JSON.stringify(previous)) return previous;
      history.current = [...history.current.slice(-49), previous];
      future.current = [];
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    const previous = history.current.pop();
    if (!previous) return;
    setBuilderRaw((current) => {
      future.current = [current, ...future.current].slice(0, 50);
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    const next = future.current.shift();
    if (!next) return;
    setBuilderRaw((current) => {
      history.current = [...history.current.slice(-49), current];
      return next;
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("jx-studio-builder-v3") ?? localStorage.getItem("jx-studio-builder-v1");
    if (saved) {
      try { setBuilderRaw(normaliseBuilder(JSON.parse(saved) as Partial<BuilderState>)); } catch { /* ignore damaged drafts */ }
    }
    const phone = isPhoneViewport();
    if (phone) { setDevice("mobile"); setPreviewDevice("mobile"); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem("jx-studio-builder-v3", JSON.stringify(builder));
      setSavedAt(Date.now());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [builder]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      setShowTop(window.scrollY > 650);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [view]);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!nodes.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: .12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [view]);

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown) => void } }).modelContext;
    if (!context?.registerTool) return;
    try {
      context.registerTool({ name: "open_website_configurator", title: "Website-Konfigurator öffnen", description: "Öffnet den visuellen Website-Konfigurator von JX Studio.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: async () => { setView("builder"); return { view: "builder" }; } });
    } catch { /* optional host capability */ }
  }, []);

  const selectedTemplate = builder.templateId === blankTemplate.id ? blankTemplate : templates.find((item) => item.id === builder.templateId) ?? templates[0];
  const currentPage = builder.pages.find((page) => page.id === activePage) ?? builder.pages[0];
  const oneTimePrice = useMemo(() => {
    const extraPages = Math.max(0, builder.pages.length - 5) * 120;
    const addons = builder.addons.reduce((sum, key) => sum + (addonPrices[key] ?? 0), 0);
    const base = builder.mode === "free" ? 1099 : 799;
    const subtotal = base + extraPages + addons;
    return builder.rush ? Math.round(subtotal * 1.2) : subtotal;
  }, [builder]);

  const navigate = (next: View) => {
    setView(next); setMobileMenu(false);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const chooseTemplate = (template: Template) => {
    const profile = profileFor(template.category);
    setBuilder((prev) => ({ ...prev, templateId: template.id, mode: "template", company: template.name, industry: template.category, accent: template.accent, secondary: `${template.accent}33`, dark: template.dark, pages: pagesFor(profile), customText: {}, content: { kicker: profile.kicker, headline: template.headline, copy: profile.heroCopy, cta: profile.cta, image: template.image } }));
    setActivePage("home"); setTemplateDialog(null); setView("builder");
    requestAnimationFrame(() => window.scrollTo({ top: 0 }));
  };

  const startFree = () => {
    setBuilder((prev) => ({ ...prev, templateId: blankTemplate.id, mode: "free", company: "Dein Unternehmen", industry: "Freies Projekt", accent: blankTemplate.accent, secondary: "#dbe7ff", dark: blankTemplate.dark, surface: "#f3f0e7", text: "#15171a", pages: pagesFor(freeProfile), customText: {}, content: { kicker: freeProfile.kicker, headline: blankTemplate.headline, copy: freeProfile.heroCopy, cta: freeProfile.cta, image: blankTemplate.image } }));
    setActivePage("home"); setView("builder");
    requestAnimationFrame(() => window.scrollTo({ top: 0 }));
  };

  const openTemplatePreview = (template: Template) => {
    setPreviewDevice(isPhoneViewport() ? "mobile" : "desktop");
    setPreviewPage("home");
    setTemplateDialog(template);
  };

  return (
    <div className="jx-shell">
      <Toaster position="top-center" richColors />
      <header className="jx-header">
        <BrandLogo onClick={() => navigate("home")} />
        <nav className={mobileMenu ? "jx-nav open" : "jx-nav"} aria-label="Hauptnavigation">
          <button className={view === "templates" ? "active" : ""} onClick={() => navigate("templates")}>Templates</button>
          <button className={view === "services" ? "active" : ""} onClick={() => navigate("services")}>Leistungen</button>
          <button className={view === "builder" ? "active" : ""} onClick={() => navigate("builder")}>Konfigurator</button>
          <button className={view === "consultation" ? "active" : ""} onClick={() => navigate("consultation")}>Beratung</button>
          <button className={view === "contact" ? "active" : ""} onClick={() => navigate("contact")}>Kontakt</button>
          <button className="jx-nav-cta" onClick={() => navigate("builder")}>Website starten <ArrowRight size={16} /></button>
        </nav>
        <button className="jx-mobile-toggle" onClick={() => setMobileMenu((value) => !value)} aria-label={mobileMenu ? "Menü schließen" : "Menü öffnen"} aria-expanded={mobileMenu}>{mobileMenu ? <X /> : <Menu />}</button>
        <span className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
      </header>

      {view === "home" && <Home navigate={navigate} />}
      {view === "templates" && <TemplatesPage filter={filter} setFilter={setFilter} onPreview={openTemplatePreview} onChoose={chooseTemplate} onFreeStart={startFree} />}
      {view === "services" && <ServicesPage navigate={navigate} />}
      {view === "consultation" && <ConsultationPage navigate={navigate} />}
      {view === "contact" && <ContactPage />}
      {view === "builder" && <BuilderPage builder={builder} setBuilder={setBuilder} currentPage={currentPage} activePage={activePage} setActivePage={setActivePage} device={device} setDevice={setDevice} tab={builderTab} setTab={setBuilderTab} selectedTemplate={selectedTemplate} price={oneTimePrice} openCheckout={() => setCheckoutOpen(true)} openTemplates={() => navigate("templates")} undo={undo} redo={redo} canUndo={history.current.length > 0} canRedo={future.current.length > 0} savedAt={savedAt} />}

      {view !== "builder" && <Footer navigate={navigate} />}
      {view !== "builder" && <JXAssistant navigate={navigate} />}
      {showTop && view !== "builder" && <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Nach oben"><ChevronUp /></button>}

      <Dialog open={Boolean(templateDialog)} onOpenChange={(open) => !open && setTemplateDialog(null)}>
        <DialogContent className="template-dialog">
          {templateDialog && (() => {
            const profile = profileFor(templateDialog.category);
            const tempState: BuilderState = { ...defaultState, templateId: templateDialog.id, company: templateDialog.name, industry: templateDialog.category, accent: templateDialog.accent, dark: templateDialog.dark, pages: pagesFor(profile), content: { kicker: profile.kicker, headline: templateDialog.headline, copy: profile.heroCopy, cta: profile.cta, image: templateDialog.image } };
            const page = tempState.pages.find((item) => item.id === previewPage) ?? tempState.pages[0];
            const phoneDesktop = previewDevice === "desktop" && isPhoneViewport();
            return <>
              <DialogHeader><DialogTitle>{templateDialog.name} · {templateDialog.category}</DialogTitle></DialogHeader>
              <div className="preview-toolbar">
                <div className="preview-page-tabs">{tempState.pages.map((item) => <button key={item.id} className={item.id === page.id ? "active" : ""} onClick={() => setPreviewPage(item.id)}>{item.name}</button>)}</div>
                <DeviceSwitch device={previewDevice} setDevice={setPreviewDevice} />
              </div>
              {phoneDesktop && <LandscapeHint />}
              <div className={`template-preview-frame ${previewDevice} ${phoneDesktop ? "phone-desktop" : ""}`}>
                <SitePreview template={templateDialog} builder={tempState} page={page} device={previewDevice} onPageChange={setPreviewPage} />
              </div>
              <div className="dialog-actions"><button className="btn-secondary" onClick={() => setTemplateDialog(null)}>Schließen</button><button className="btn-primary" onClick={() => chooseTemplate(templateDialog)}>Dieses Template konfigurieren <ArrowRight size={16} /></button></div>
            </>;
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="checkout-dialog">
          <div className="checkout-hero"><span className="checkout-kicker"><BadgeCheck size={15}/> Dein JX Projekt</span><DialogHeader><DialogTitle>Von deiner Konfiguration zum fertigen Launch.</DialogTitle></DialogHeader><p>Deine Auswahl bleibt vollständig am Projekt gespeichert. Nach dem Auftrag folgen technischer Build, Qualitätsprüfung, persönliche Finalisierung und deine Freigabe.</p></div>
          <div className="checkout-project"><div><small>PROJEKT</small><b>{builder.company || "Neue Website"}</b><span>{builder.industry} · {builder.pages.length} Seiten · {builder.addons.length} Erweiterungen</span></div><div className="checkout-total"><span>Einmaliger Projektpreis</span><strong>{money(oneTimePrice)}</strong>{builder.care && <small>+ 49,99 € / Monat JX Care</small>}</div></div>
          <div className="checkout-flow"><span><b>01</b> Auftrag</span><i/><span><b>02</b> Build & QA</span><i/><span><b>03</b> Feinschliff</span><i/><span><b>04</b> Launch</span></div>
          <DirectCheckout configuration={builder} estimatedPrice={oneTimePrice} /><div className="checkout-divider"><span>Noch nicht bereit zu kaufen?</span></div><div className="checkout-consult"><div><CalendarDays/><span><b>Projekt gemeinsam durchgehen</b><small>Wir können deine Konfiguration persönlich prüfen und fertig planen.</small></span></div><button className="btn-secondary" onClick={()=>{setCheckoutOpen(false);navigate("consultation")}}>Termin wählen</button></div><InquiryForm configuration={builder} estimatedPrice={oneTimePrice} onSuccess={() => setCheckoutOpen(false)} compact />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BrandLogo({ onClick }: { onClick?: () => void }) {
  return <button className="jx-logo" onClick={onClick} aria-label="JX Studio Startseite"><img className="brand-image" src="/jx-studio-logo.svg" alt="JX Studio – Webdesign & Development" /></button>;
}

function CountUp({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || started) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setStarted(true); observer.disconnect();
      const start = performance.now(); const duration = 1250;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(value * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: .35 });
    observer.observe(node); return () => observer.disconnect();
  }, [started, value]);
  return <strong ref={ref}>{prefix}{display}{suffix}</strong>;
}

type ChatMessage = { role: "assistant" | "user"; text: string };
type LeadDraft = { name?:string; email?:string; phone?:string; company?:string; projectType?:string; goals?:string[]; features?:string[]; budget?:string; timeframe?:string; summary?:string; completeness?:number };

function JXAssistant({ navigate }: { navigate: (view: View) => void }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [confirmLead, setConfirmLead] = useState(false);
  const [lead, setLead] = useState<LeadDraft>({});
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: "Hi, ich bin der JX Assistant. Erzähl mir einfach, was du vorhast. Ich kann dich zu Websites, Shops, Software, KI-Chatbots, Preisen und dem JX Builder beraten und aus unserem Gespräch direkt eine Projektanfrage vorbereiten." }]);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [messages, typing, handoff]);

  const send = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || typing) return;
    const next = [...messages, { role: "user" as const, text }];
    setMessages(next); setInput(""); setTyping(true); setHandoff(false);
    const started = Date.now();
    try {
      const res = await fetch("/api/assistant", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ messages: next.slice(-14), lead, page: location.pathname }) });
      const data = await res.json() as { answer?: string; lead?: LeadDraft; offerHandoff?: boolean };
      const wait = Math.max(0, Math.min(2300, 850 + String(data.answer || "").length * 5) - (Date.now() - started));
      await new Promise(r => setTimeout(r, wait));
      setLead(data.lead || lead);
      setMessages(m => [...m, { role:"assistant", text:data.answer || "Ich konnte die Antwort gerade nicht laden. Versuch es bitte noch einmal." }]);
      if (data.offerHandoff) setHandoff(true);
    } catch {
      await new Promise(r => setTimeout(r, 900));
      setMessages(m => [...m, { role:"assistant", text:"Die Verbindung zu meinem Beratungsmodul ist gerade abgerissen. Du kannst es direkt noch einmal versuchen oder deine Anfrage über den Projektbereich senden." }]);
    } finally { setTyping(false); }
  };

  const prepareLead = () => {
    if (!lead.name || !lead.email) { setHandoff(false); setMessages(m=>[...m,{role:"assistant",text:"Sehr gern. Bevor ich die Anfrage vorbereite, brauche ich noch deinen Namen und deine E-Mail-Adresse. Schreib beides einfach hier in den Chat."}]); return; }
    setHandoff(false); setConfirmLead(true);
  };

  const submitLead = async () => {
    setSubmitting(true);
    try {
      const transcript = messages.slice(-12).map(m=>`${m.role === "user" ? "Interessent" : "JX Assistant"}: ${m.text}`).join("\n\n");
      const summary = lead.summary || `Projektart: ${lead.projectType || "offen"}. Budget: ${lead.budget || "nicht genannt"}. Zeitraum: ${lead.timeframe || "nicht genannt"}.`;
      const res = await fetch("/api/contact", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ source:"jx-assistant", name:lead.name, email:lead.email, phone:lead.phone||"", company:lead.company||"", subject:`KI-qualifizierte Projektanfrage · ${lead.projectType || "Projekt"}`, message:`${summary}\n\nVom JX Assistant erfasste Angaben:\nZiele: ${(lead.goals||[]).join(", ") || "–"}\nFunktionen: ${(lead.features||[]).join(", ") || "–"}\nBudget: ${lead.budget||"–"}\nZeitraum: ${lead.timeframe||"–"}\n\nGesprächsauszug:\n${transcript}`, configuration:{source:"jx-assistant", lead}, estimatedPrice:null }) });
      const data = await res.json() as { error?: string; reference?: string };
      if (!res.ok) throw new Error(data.error || "Versand fehlgeschlagen");
      setHandoff(false); setConfirmLead(false);
      setMessages(m=>[...m,{role:"assistant",text:`Deine Anfrage wurde an den Projektleiter von JX Studio weitergegeben. ✓\n\nReferenz: ${data.reference}\n\nDie wichtigsten Angaben aus unserem Gespräch sind bereits dabei, du musst also nicht alles noch einmal erklären.`}]);
    } catch { setMessages(m=>[...m,{role:"assistant",text:"Die Übergabe hat technisch gerade nicht funktioniert. Deine Angaben bleiben im Chat erhalten. Bitte versuche es noch einmal oder nutze das Kontaktformular."}]); }
    finally { setSubmitting(false); }
  };

  return <div className={`jx-assistant ${open ? "open" : ""}`}>
    {open && <div className="assistant-panel" role="dialog" aria-label="JX Assistant">
      <div className="assistant-head"><div><span className="assistant-mark"><Bot size={18}/></span><span><b>JX Assistant</b><small><i/> Digitaler Projektberater</small></span></div><button onClick={() => setOpen(false)} aria-label="Chat schließen"><X size={18}/></button></div>
      <div className="assistant-messages" ref={scroller}>{messages.map((m,i)=><div key={i} className={`assistant-message ${m.role}`}>{m.text}</div>)}{typing&&<div className="assistant-message assistant typing"><span/><span/><span/><em>tippt</em></div>}{handoff&&!typing&&<div className="assistant-handoff"><b>Das klingt bereits konkret.</b><span>Ich habe genug Informationen, um daraus eine Projektanfrage zu machen. Möchtest du, dass ich sie direkt an den Projektleiter weitergebe?</span><div><button onClick={prepareLead}>Anfrage weitergeben</button><button onClick={()=>setHandoff(false)}>Noch etwas besprechen</button></div></div>}{confirmLead&&!typing&&<div className="assistant-handoff assistant-confirm"><b>Projektanfrage prüfen</b><span><strong>{lead.projectType||"Digitalprojekt"}</strong>{lead.company?` · ${lead.company}`:""}</span><span>Budget: {lead.budget||"nicht genannt"} · Zeitraum: {lead.timeframe||"nicht genannt"}</span><span>Funktionen: {(lead.features||[]).join(", ")||"noch offen"}</span><span>Kontakt: {lead.name} · {lead.email}{lead.phone?` · ${lead.phone}`:""}</span><small>Erst mit „Anfrage verbindlich senden“ werden diese Angaben an JX Studio übermittelt.</small><div><button onClick={submitLead} disabled={submitting}>{submitting?"Wird gesendet…":"Anfrage verbindlich senden"}</button><button onClick={()=>setConfirmLead(false)}>Zurück zum Chat</button></div></div>}</div>
      <div className="assistant-quick"><button onClick={()=>send("Was kostet eine professionelle Website bei euch?")}>Preise</button><button onClick={()=>send("Was kann euer KI-Chatbot für mein Unternehmen?")}>KI-Chatbot</button><button onClick={()=>send("Ich möchte ein Projekt planen. Welche Infos brauchst du von mir?")}>Projekt planen</button><button onClick={()=>{setOpen(false);navigate("builder")}}>Builder öffnen</button></div>
      <div className="assistant-input"><input value={input} disabled={typing} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={typing?"JX Assistant tippt…":"Nachricht schreiben…"} aria-label="Nachricht"/><button disabled={typing} onClick={()=>send()} aria-label="Senden"><Send size={17}/></button></div>
      <small className="assistant-note">KI-Assistent · Antworten können Fehler enthalten · Angebote werden persönlich geprüft.</small>
    </div>}
    <button className="assistant-trigger" onClick={()=>setOpen(v=>!v)} aria-label="JX Assistant öffnen">{open ? <X/> : <><MessageCircle/><span>JX Assistant</span></>}</button>
  </div>;
}
function Home({ navigate }: { navigate: (view: View) => void }) {
  return <main>
    <section className="hero-section">
      <div className="hero-orbit one" /><div className="hero-orbit two" />
      <div className="hero-copy reveal">
        <span className="eyebrow"><Sparkles size={14} /> Webdesign & Development aus Bremen</span>
        <h1>Deine Website.<br /><em>Nicht von der Stange.</em></h1>
        <p>JX Studio entwickelt Websites, Shops, Kundenportale und individuelle Web-Anwendungen, die hochwertig aussehen und im echten Alltag funktionieren.</p>
        <div className="hero-actions"><button className="btn-primary" onClick={() => navigate("builder")}>Website konfigurieren <ArrowRight size={18} /></button><button className="btn-secondary" onClick={() => navigate("consultation")}><CalendarDays size={17}/> Gemeinsam planen</button></div>
        <div className="hero-proof"><span><Check /> Klare Preise</span><span><Check /> Mobile inklusive</span><span><Check /> Persönliche Umsetzung</span></div>
      </div>
      <div className="hero-product reveal" aria-label="Vorschau des Website-Konfigurators">
        <div className="product-top"><i /><i /><i /><span>jxstudio.de / studio</span></div>
        <div className="product-body"><aside><b>SEITEN</b><span className="active">Startseite</span><span>Leistungen</span><span>Referenzen</span><span>Kontakt</span><button>+ Seite</button></aside><div className="product-canvas"><nav><strong>NORDWERK</strong><span>Leistungen &nbsp; Referenzen &nbsp; Kontakt</span></nav><div className="mock-hero"><small>MEISTERBETRIEB AUS BREMEN</small><h3>Qualität, die<br />man sehen kann.</h3><button>Projekt anfragen</button></div></div><aside className="product-settings"><b>DESIGN</b><label>Akzent <i className="swatch" /></label><label>Rundung <span>20 px</span></label><label>Schrift <span>Modern</span></label><label>Layout <span>Split</span></label></aside></div>
        <div className="price-float"><span>Aktueller Preis</span><strong>799 €</strong><small>Live berechnet</small></div>
      </div>
    </section>

    <section className="logo-strip marquee-strip" aria-label="Leistungsbereiche"><div className="marquee-track">{[0,1].map((copy) => <div className="marquee-copy" key={copy}><span>WEBDESIGN</span><i /><span>DEVELOPMENT</span><i /><span>SOFTWARE</span><i /><span>E-COMMERCE</span><i /><span>KI-CHATBOTS</span><i /><span>DIGITAL SOLUTIONS</span><i /></div>)}</div></section>

    <section className="trust-metrics reveal" aria-label="JX Studio auf einen Blick">
      <article><CountUp value={27} suffix="+" /><span>branchenspezifische<br />Website-Templates</span></article>
      <article><CountUp value={100} suffix=" %" /><span>individuell<br />anpassbar</span></article>
      <article><CountUp value={6} /><span>digitale<br />Leistungsbereiche</span></article>
      <article><CountUp value={24} prefix="&lt; " suffix=" h" /><span>angestrebte Antwortzeit<br />auf Projektanfragen</span></article>
    </section>

    <section className="section why-section reveal">
      <div className="section-head"><span className="eyebrow dark">Warum JX Studio?</span><h2>Direkter arbeiten.<br />Digital weiterdenken.</h2><p>Nicht nur eine hübsche Website abgeben, sondern eine digitale Basis schaffen, die später mit deinem Unternehmen wachsen kann.</p></div>
      <div className="why-grid">
        <article><span>01</span><h3>Keine Website von der Stange.</h3><p>Design, Struktur und Technik richten sich nach Unternehmen, Zielgruppe und tatsächlichem Einsatzzweck.</p></article>
        <article><span>02</span><h3>Ein Ansprechpartner.</h3><p>Von der ersten Idee über Design und Development bis zur späteren Betreuung bleibt die Kommunikation direkt.</p></article>
        <article><span>03</span><h3>Mehr als Webdesign.</h3><p>Shop, Kundenportal, Konfigurator oder internes Tool können auf derselben digitalen Strategie aufbauen.</p></article>
        <article><span>04</span><h3>Gebaut, um weiterzuwachsen.</h3><p>Keine technische Sackgasse, sondern eine Grundlage, die neue Seiten, Funktionen und Systeme aufnehmen kann.</p></article>
      </div>
    </section>

    <section className="section light-section reveal">
      <div className="section-head"><span className="eyebrow dark">Was wir bauen</span><h2>Von der Website<br />bis zum digitalen System.</h2><p>Ein Ansprechpartner für Konzeption, Gestaltung, Entwicklung und Weiterentwicklung. Ohne fünf Agenturen für fünf Aufgaben.</p></div>
      <div className="service-grid">
        <article className="service-card featured"><span>01</span><WandSparkles /><h3>Websites</h3><p>Individuell oder auf Basis eines hochwertigen Templates. Responsive, schnell und auf echte Anfragen ausgelegt.</p><button onClick={() => navigate("builder")}>Ab 799 € <ArrowRight /></button></article>
        <article className="service-card"><span>02</span><ShoppingBag /><h3>Online-Shops</h3><p>Produktwelten, Checkout-Prozesse und klare Nutzerführung für Unternehmen, die online verkaufen wollen.</p><button onClick={() => navigate("services")}>Ab 1.699 € <ArrowRight /></button></article>
        <article className="service-card"><span>03</span><Code2 /><h3>Software & Webapps</h3><p>Kundenportale, Dashboards, interne Tools und individuelle Funktionen, wenn Standardsoftware nicht reicht.</p><button onClick={() => navigate("services")}>Individuell <ArrowRight /></button></article>
        <article className="service-card ai-card"><span>04</span><Bot /><h3>KI-Chatbots</h3><p>Individuelle Support- und Lead-Assistenten, die Unternehmenswissen nutzen, Fragen beantworten und Interessenten vorqualifizieren.</p><button onClick={() => navigate("services")}>Live-Demo öffnen <ArrowRight /></button></article>
      </div>
    </section>

    <section className="section builder-showcase reveal">
      <div className="builder-showcase-copy"><span className="eyebrow">JX Studio Builder</span><h2>Du musst dir deine Website nicht vorstellen.<br /><em>Bau sie dir vor.</em></h2><p>Wähle ein Template oder starte frei. Passe Seiten, Texte, Farben, Sektionen und Inhalte direkt im Browser an. Deine komplette Konfiguration landet anschließend als Projektanfrage bei JX Studio.</p><div><button className="btn-primary" onClick={() => navigate("builder")}>Website konfigurieren <ArrowRight size={17} /></button><button className="btn-secondary" onClick={() => navigate("templates")}>Templates entdecken</button></div></div>
      <div className="builder-showcase-stats"><span><b>LIVE</b> Vorschau ohne Neuladen</span><span><b>DESKTOP + MOBILE</b> getrennt prüfen</span><span><b>AUTOSAVE</b> Änderungen lokal sichern</span></div>
    </section>

    <DesignDemo />

    <section className="section dark-section process-section reveal">
      <div className="section-head inverse"><span className="eyebrow">So läuft es</span><h2>Klarer Prozess.<br />Kein Agentur-Nebel.</h2></div>
      <div className="process-grid">{["Konfigurieren", "Abstimmen", "Umsetzen", "Launchen"].map((title, index) => <article key={title}><b>0{index + 1}</b><h3>{title}</h3><p>{["Template wählen oder frei starten. Seiten, Design, Inhalte und Funktionen zusammenstellen.", "Wir prüfen die Konfiguration, klären offene Punkte und machen daraus ein sauberes Projekt.", "Design, Content und Technik werden professionell fertiggestellt und getestet.", "Nach deiner Freigabe geht alles live. Danach kann JX Care übernehmen."][index]}</p></article>)}</div>
    </section>

    <section className="section pricing-section reveal">
      <div className="section-head"><span className="eyebrow dark">Transparente Preise</span><h2>Du weißt vorher,<br />womit du rechnest.</h2></div>
      <div className="price-cards">
        <article><span>Template Website</span><h3>799 €</h3><p>Bis 5 Seiten, responsive, Kontaktformular, Basis-SEO und Launch-Unterstützung.</p><ul><li><Check /> Im Studio frei anpassbar</li><li><Check /> Eigene Farben & Inhalte</li><li><Check /> Professionell finalisiert</li></ul><button onClick={() => navigate("builder")}>Jetzt konfigurieren</button></article>
        <article className="price-highlight"><span>Custom Website</span><h3>ab 1.499 €</h3><p>Individuelles Konzept und Design für Unternehmen, die eine eigenständige digitale Marke brauchen.</p><ul><li><Check /> Individuelles UI-System</li><li><Check /> Strategie & Seitenstruktur</li><li><Check /> Erweiterbare Funktionen</li></ul><button onClick={() => navigate("contact")}>Projekt anfragen</button></article>
        <article><span>Software / Portal</span><h3>individuell</h3><p>Web-Anwendungen und Portale werden nach Funktionsumfang, Rollen und Datenlogik kalkuliert.</p><ul><li><Check /> Webapps & Dashboards</li><li><Check /> Kundenbereiche</li><li><Check /> Automatisierungen</li></ul><button onClick={() => navigate("services")}>Details ansehen</button></article>
      </div>
    </section>

    <section className="section founder-section reveal">
      <div><span className="eyebrow dark">Founder-led Studio</span><h2>Direkt statt<br />Agenturkarussell.</h2></div>
      <div className="founder-copy"><p>JX Studio steht für direkte Planung, klares Design und technische Umsetzung ohne unnötige Zwischenstationen. Projekte werden von Anfang an so gedacht, dass Design und Development zusammenpassen.</p><div className="founder-sign"><strong>Joel Schneider</strong><span>Founder · Design & Development</span></div></div>
    </section>

    <FAQ />
    <section className="final-cta reveal"><span className="eyebrow">Bereit?</span><h2>Mach aus deiner Idee<br />ein echtes Produkt.</h2><button onClick={() => navigate("builder")}>Studio öffnen <ArrowRight /></button></section>
  </main>;
}

function DesignDemo() {
  const [style, setStyle] = useState<"modern" | "editorial" | "technical">("modern");
  const [device, setDevice] = useState<Device>("desktop");
  return <section className="section studio-demo-section reveal">
    <div className="section-head inverse"><span className="eyebrow">Live Design Demo</span><h2>Drei Richtungen.<br />Ein System.</h2><p>Ein kleines Beispiel dafür, wie schnell sich eine Website in eine völlig andere Richtung bewegen kann, ohne die Struktur zu zerlegen.</p></div>
    <div className="demo-shell">
      <div className="demo-controls"><div><b>Stil</b>{(["modern", "editorial", "technical"] as const).map((item) => <button className={style === item ? "active" : ""} key={item} onClick={() => setStyle(item)}>{item === "modern" ? "Modern" : item === "editorial" ? "Editorial" : "Technical"}</button>)}</div><DeviceSwitch device={device} setDevice={setDevice} /></div>
      <div className={`demo-preview ${device} ${style}`}><nav><strong>ATELIER NORTH</strong><span>Work &nbsp; Studio &nbsp; Contact</span><Menu size={17} /></nav><section><small>DESIGN · BREMEN</small><h3>{style === "modern" ? "Digital. Klar. Eigenständig." : style === "editorial" ? "Design mit Haltung und Ruhe." : "SYSTEMS / BUILT / PRECISE"}</h3><p>Ein konsistentes Grundsystem, das sich an Marke, Branche und Inhalt anpassen lässt.</p><button>Projekt ansehen</button></section></div>
    </div>
  </section>;
}

function FAQ() {
  const items = [
    ["Kann ich ein Template komplett verändern?", "Ja. Template bedeutet hier Startpunkt, nicht Käfig. Farben, Inhalte, Seiten, Sektionen, Bilder und mehrere Designparameter lassen sich im Studio verändern."],
    ["Ist die Website danach wirklich mobil optimiert?", "Ja. Mobile und Desktop werden getrennt geprüft. Im Studio kannst du bereits zwischen beiden Vorschauen wechseln."],
    ["Kann JX Studio auch individuelle Software bauen?", "Ja. Kundenportale, Dashboards, interne Tools und Web-Anwendungen werden separat nach Funktionsumfang geplant."],
    ["Muss ich direkt online bezahlen?", "Nein. Du kannst deine Konfiguration unverbindlich anfragen. Bei eindeutig kalkulierbaren Website-Projekten kannst du alternativ direkt online beauftragen und bezahlen."],
  ];
  return <section className="section faq-section reveal"><div className="section-head"><span className="eyebrow dark">FAQ</span><h2>Fragen, bevor<br />sie im Chat landen.</h2></div><div className="faq-list">{items.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown /></summary><p>{answer}</p></details>)}</div></section>;
}

function TemplatesPage({ filter, setFilter, onPreview, onChoose, onFreeStart }: { filter: string; setFilter: (value: string) => void; onPreview: (template: Template) => void; onChoose: (template: Template) => void; onFreeStart: () => void }) {
  const list = filter === "Alle" ? templates : templates.filter((template) => template.category === filter);
  return <main className="page-main">
    <section className="page-intro"><span className="eyebrow"><Layers3 size={14} /> 27 branchenspezifische Designs</span><h1>Wähle einen Startpunkt.<br /><em>Mach ihn zu deinem.</em></h1><p>Keine austauschbaren Demo-Karten: Jede Branche bekommt eigene Inhalte, Seiten und Navigation. Vorschau öffnen, durch die Seiten gehen und danach direkt im Studio bearbeiten.</p><div className="intro-actions"><button className="btn-primary" onClick={onFreeStart}>Ohne Template frei starten <ArrowRight size={17} /></button></div></section>
    <div className="filter-row" role="tablist" aria-label="Template Kategorien">{categories.map((category) => <button className={filter === category ? "active" : ""} key={category} onClick={() => setFilter(category)}>{category}</button>)}</div>
    <section className="template-grid">{list.map((template) => {
      const profile = profileFor(template.category);
      return <article className="template-card" key={template.id}>
        <button className="template-visual" onClick={() => onPreview(template)} style={{ "--template-accent": template.accent } as React.CSSProperties}>
          <img src={template.image} alt={`${template.name} Website-Template für ${template.category}`} />
          <div className={`mini-site ${template.layout}`}><nav><b>{template.name.toUpperCase()}</b><span>{profile.pageNames.slice(1).join(" · ")}</span></nav><small>{profile.kicker}</small><h3>{template.headline}</h3><span className="mini-cta">{profile.cta}</span></div>
          <span className="preview-button">Interaktive Vorschau <ExternalLink size={14} /></span>
        </button>
        <div className="template-info"><div><span>{template.category}</span><h2>{template.name}</h2><p>{template.style} · {profile.pageNames.length} Seiten</p></div><div className="template-price"><small>ab</small><strong>799 €</strong></div></div>
        <button className="template-select" onClick={() => onChoose(template)}>Template wählen <ArrowRight size={16} /></button>
      </article>;
    })}</section>
  </main>;
}

function ServicesPage({ navigate }: { navigate: (view: View) => void }) {
  const services = [
    { icon: <WandSparkles />, name: "Template Website", price: "799 €", description: "Der schnelle hochwertige Start mit visueller Konfiguration und professioneller Finalisierung.", details: ["Bis 5 Seiten", "Mobile & Desktop", "Kontaktformular", "Basis SEO", "Studio-Konfiguration"] },
    { icon: <Palette />, name: "Custom Website", price: "ab 1.499 €", description: "Komplett individuelles Design mit eigener Struktur, Art Direction und Komponenten.", details: ["Individuelles UI", "Strategie", "Content-Struktur", "SEO Basis", "Erweiterbar"] },
    { icon: <ShoppingBag />, name: "E-Commerce", price: "ab 1.699 €", description: "Shops mit klarer Produktführung, sauberem Checkout und einem System, das wartbar bleibt.", details: ["Produktstruktur", "Checkout", "Responsive", "Tracking", "Technische Einrichtung"] },
    { icon: <Code2 />, name: "Software & Webapps", price: "individuell", description: "Kundenportale, interne Tools, Dashboards und individuelle digitale Prozesse.", details: ["Rollen & Logins", "Datenmodelle", "Dashboards", "APIs", "Automatisierungen"] },
    { icon: <Bot />, name: "KI-Chatbots & Support", price: "ab 690 €", description: "Digitale Assistenten für Support, Beratung und Leadgenerierung, passend zur Website und zum Unternehmen.", details: ["Unternehmenswissen", "Support & FAQ", "Lead-Qualifizierung", "Corporate Design", "Optionale API/CRM-Anbindung"] },
    { icon: <Rocket />, name: "Online-Präsenz & Marketing", price: "nach Umfang", description: "Landingpages, Tracking und technische Grundlagen für Kampagnen und bessere digitale Sichtbarkeit.", details: ["Landingpages", "Tracking", "SEO Struktur", "Conversion UX", "Betreuung"] },
  ];
  return <main className="page-main"><section className="page-intro"><span className="eyebrow"><Code2 size={14} /> Leistungen</span><h1>Website ist nur<br /><em>der Anfang.</em></h1><p>JX Studio verbindet Design und Entwicklung. Damit kann aus einer Landingpage später genauso ein Kundenportal oder digitales System werden.</p></section><section className="full-service-list">{services.map((service, index) => <article key={service.name}><span className="service-number">0{index + 1}</span><span className="service-icon">{service.icon}</span><div className="service-main"><h2>{service.name}</h2><p>{service.description}</p></div><ul>{service.details.map((detail) => <li key={detail}><Check /> {detail}</li>)}</ul><strong>{service.price}</strong></article>)}</section><section className="service-end"><h2>Du weißt noch nicht, welche Lösung passt?</h2><button className="btn-primary" onClick={() => navigate("contact")}>Projekt kurz beschreiben <ArrowRight /></button></section></main>;
}

function BuilderPage({ builder, setBuilder, currentPage, activePage, setActivePage, device, setDevice, tab, setTab, selectedTemplate, price, openCheckout, openTemplates, undo, redo, canUndo, canRedo, savedAt }: {
  builder: BuilderState; setBuilder: BuilderSetter; currentPage: PageConfig; activePage: string; setActivePage: (id: string) => void; device: Device; setDevice: (device: Device) => void; tab: string; setTab: (tab: string) => void; selectedTemplate: Template; price: number; openCheckout: () => void; openTemplates: () => void; undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean; savedAt: number | null;
}) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [compiledCode, setCompiledCode] = useState<Record<string,string>>({});
  const [draggedSection, setDraggedSection] = useState<number | null>(null);
  const [phone, setPhone] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(currentPage.sections[0]?.id ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const sync = () => setPhone(query.matches);
    sync(); query.addEventListener("change", sync); return () => query.removeEventListener("change", sync);
  }, []);

  const updatePage = (updater: (page: PageConfig) => PageConfig) => setBuilder((prev) => ({ ...prev, pages: prev.pages.map((page) => page.id === activePage ? updater(page) : page) }));
  const moveSection = (index: number, direction: -1 | 1) => updatePage((page) => { const next = [...page.sections]; const target = index + direction; if (target < 0 || target >= next.length) return page; [next[index], next[target]] = [next[target], next[index]]; return { ...page, sections: next }; });
  const dropSection = (target: number) => {
    if (draggedSection === null || draggedSection === target) return;
    updatePage((page) => { const next = [...page.sections]; const [moved] = next.splice(draggedSection, 1); next.splice(target, 0, moved); return { ...page, sections: next }; });
    setDraggedSection(null);
  };
  const addPage = () => { const id = newId("page"); setBuilder((prev) => ({ ...prev, pages: [...prev.pages, makePage(id, `Neue Seite ${prev.pages.length + 1}`, ["hero", "about", "cta"])] })); setActivePage(id); };
  const duplicatePage = (page: PageConfig) => { const id = newId("page"); const copy = { ...page, id, name: `${page.name} Kopie`, sections: page.sections.map((section) => ({ ...section, id: newId(section.kind) })) }; setBuilder((prev) => ({ ...prev, pages: [...prev.pages, copy] })); setActivePage(id); };
  const removePage = (id: string) => { if (builder.pages.length <= 1) return; const fallback = builder.pages.find((page) => page.id !== id)?.id ?? "home"; setBuilder((prev) => ({ ...prev, pages: prev.pages.filter((page) => page.id !== id) })); setActivePage(fallback); };
  const duplicateSection = (index: number) => updatePage((page) => { const next = [...page.sections]; next.splice(index + 1, 0, { ...page.sections[index], id: newId(page.sections[index].kind) }); return { ...page, sections: next }; });
  const updateText = (key: string, value: string) => setBuilder((prev) => ({ ...prev, customText: { ...prev.customText, [key]: value } }));
  const handleUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Bitte eine Bilddatei auswählen."); return; }
    if (file.size > 1_500_000) { toast.error("Für die Vorschau bitte ein Bild unter 1,5 MB verwenden."); return; }
    const reader = new FileReader();
    reader.onload = () => setBuilder((prev) => ({ ...prev, content: { ...prev.content, image: String(reader.result) } }));
    reader.readAsDataURL(file);
  };
  const chooseGalleryImage = (url: string) => setBuilder((prev) => ({ ...prev, content: { ...prev.content, image: url } }));
  const phoneDesktop = phone && device === "desktop";
  const compileLive = async () => { setBuilder(prev=>({...prev,editorMode:"pro"})); try { const r=await fetch("/api/compile-site",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({configuration:builder})}); const d = await r.json() as { error?: string; files?: Record<string, string> }; if(!r.ok) throw new Error(d.error ?? "Live-Code konnte nicht kompiliert werden."); setCompiledCode(d.files ?? {}); setCodeOpen(true); } catch { toast.error("Live-Code konnte nicht kompiliert werden."); } };
  const selectedSection = currentPage.sections.find((section) => section.id === selectedSectionId) ?? currentPage.sections[0];
  const patchSelectedSection = (patch: Partial<SectionConfig>) => selectedSection && updatePage((page) => ({ ...page, sections: page.sections.map((section) => section.id === selectedSection.id ? { ...section, ...patch } : section) }));
  const patchSectionStyle = (patch: Partial<SectionStyle>) => selectedSection && patchSelectedSection({ style: { ...(selectedSection.style ?? {}), ...patch } });
  const patchSectionAnimation = (patch: Partial<SectionAnimation>) => selectedSection && patchSelectedSection({ animation: { type: "none", duration: 700, delay: 0, easing: "cubic-bezier(.16,1,.3,1)", repeat: false, ...(selectedSection.animation ?? {}), ...patch } });
  const patchResponsive = (patch: Partial<SectionStyle & {hidden?:boolean}>) => selectedSection && patchSelectedSection({ responsive: { ...(selectedSection.responsive ?? {}), [device]: { ...(selectedSection.responsive?.[device] ?? {}), ...patch } } });
  const responsiveStyle = selectedSection?.responsive?.[device] ?? {};

  return <main className="builder-page">
    <div className="builder-bar">
      <div className="builder-project"><span className="status-dot" /><strong>{builder.company || "Neues Projekt"}</strong><small>{savedAt ? "Gespeichert" : "Speichert …"}</small></div>
      <div className="builder-center-tools"><button onClick={undo} disabled={!canUndo} aria-label="Rückgängig"><Undo2 size={16} /></button><button onClick={redo} disabled={!canRedo} aria-label="Wiederholen"><Redo2 size={16} /></button><div className="editor-mode-switch" aria-label="Editor-Modus">{(["easy","advanced","pro"] as const).map(m=><button key={m} className={(builder.editorMode??"easy")===m?"active":""} onClick={()=>setBuilder(prev=>({...prev,editorMode:m}))}>{m==="easy"?"Easy":m==="advanced"?"Advanced":"JX Pro"}</button>)}</div><DeviceSwitch device={device} setDevice={setDevice} /></div>
      <div className="builder-actions"><button className="tools-button" onClick={compileLive}><Code2 size={16}/> Code</button><button className="tools-button" onClick={() => setToolsOpen((value) => !value)}><Palette size={16} /> Werkzeuge</button><button className="finish-button" onClick={openCheckout}>Anfrage abschließen <ArrowRight size={16} /></button></div>
    </div>
    <div className="builder-layout">
      <aside className={`builder-sidebar ${toolsOpen ? "mobile-open" : ""}`}>
        <div className="mobile-panel-head"><strong>Website-Werkzeuge</strong><button onClick={() => setToolsOpen(false)} aria-label="Werkzeuge schließen"><X /></button></div>
        <Tabs value={tab} onValueChange={setTab} className="builder-tabs">
          <TabsList><TabsTrigger value="structure"><Layers3 size={16} /><span>Struktur</span></TabsTrigger><TabsTrigger value="content"><Copy size={16} /><span>Inhalt</span></TabsTrigger><TabsTrigger value="design"><Palette size={16} /><span>Design</span></TabsTrigger><TabsTrigger value="features"><Sparkles size={16} /><span>Funktionen</span></TabsTrigger></TabsList>
          <TabsContent value="structure" className="tab-panel">
            <div className="panel-heading"><div><small>SEITEN</small><h2>Website-Struktur</h2></div><button onClick={addPage} aria-label="Seite hinzufügen"><Plus /></button></div>
            <div className="page-list">{builder.pages.map((page) => <div key={page.id} className={page.id === activePage ? "page-row active" : "page-row"}><button className="page-select" onClick={() => setActivePage(page.id)} aria-label={`${page.name} auswählen`}><GripVertical size={15} /></button><input className="page-name-input" aria-label="Seitenname" value={page.name} onFocus={() => setActivePage(page.id)} onChange={(event) => setBuilder((prev) => ({ ...prev, pages: prev.pages.map((item) => item.id === page.id ? { ...item, name: event.target.value } : item) }))} /><button className="icon-action" onClick={() => duplicatePage(page)} aria-label="Seite duplizieren"><Copy size={14} /></button>{builder.pages.length > 1 && <button className="icon-danger" onClick={() => removePage(page.id)} aria-label="Seite löschen"><Trash2 size={15} /></button>}</div>)}</div>
            <div className="panel-divider" />
            <div className="panel-heading"><div><small>SEKTIONEN</small><h2>{currentPage.name}</h2></div></div>
            <p className="panel-help">Ziehe Bereiche in eine neue Reihenfolge oder nutze die Pfeile. Ausblenden bewahrt den Inhalt.</p>
            <div className="section-list">{currentPage.sections.map((section, index) => <div className={`section-row ${section.hidden ? "is-hidden" : ""}`} draggable key={section.id} onDragStart={() => setDraggedSection(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => dropSection(index)}><GripVertical size={16} /><button className="section-select-name" onClick={() => { setSelectedSectionId(section.id); setTab("design"); }}>{sectionLabels[section.kind]}</button><div><button onClick={() => updatePage((page) => ({ ...page, sections: page.sections.map((item) => item.id === section.id ? { ...item, hidden: !item.hidden } : item) }))} aria-label={section.hidden ? "Einblenden" : "Ausblenden"}>{section.hidden ? <EyeOff /> : <Eye />}</button><button onClick={() => duplicateSection(index)} aria-label="Duplizieren"><Copy /></button><button disabled={index === 0} onClick={() => moveSection(index, -1)} aria-label="Nach oben"><ChevronUp /></button><button disabled={index === currentPage.sections.length - 1} onClick={() => moveSection(index, 1)} aria-label="Nach unten"><ChevronDown /></button><button onClick={() => updatePage((page) => ({ ...page, sections: page.sections.filter((item) => item.id !== section.id) }))} aria-label="Entfernen"><Trash2 /></button></div></div>)}</div>
            <Select onValueChange={(value) => updatePage((page) => ({ ...page, sections: [...page.sections, makeSection(value as SectionKind)] }))}><SelectTrigger className="builder-select"><SelectValue placeholder="Bereich hinzufügen" /></SelectTrigger><SelectContent>{Object.entries(sectionLabels).map(([key, label]) => <SelectItem value={key} key={key}>{label}</SelectItem>)}</SelectContent></Select>
          </TabsContent>

          <TabsContent value="content" className="tab-panel">
            <div className="panel-heading"><div><small>TEXTE & BILDER</small><h2>Inhalte</h2></div></div>
            <p className="panel-help">Hero-Inhalte kannst du hier oder direkt in der Vorschau bearbeiten. Änderbare Texte in der Vorschau sind gestrichelt markiert.</p>
            <label className="input-label">Kicker<input value={builder.content.kicker} onChange={(event) => setBuilder((prev) => ({ ...prev, content: { ...prev.content, kicker: event.target.value } }))} /></label>
            <label className="input-label">Hauptüberschrift<textarea rows={3} value={builder.content.headline} onChange={(event) => setBuilder((prev) => ({ ...prev, content: { ...prev.content, headline: event.target.value } }))} /></label>
            <label className="input-label">Einleitung<textarea rows={4} value={builder.content.copy} onChange={(event) => setBuilder((prev) => ({ ...prev, content: { ...prev.content, copy: event.target.value } }))} /></label>
            <label className="input-label">Button-Text<input value={builder.content.cta} onChange={(event) => setBuilder((prev) => ({ ...prev, content: { ...prev.content, cta: event.target.value } }))} /></label>
            <div className="image-editor"><div className="input-label"><span>Hero-Bild</span><div className="image-current"><img src={builder.content.image} alt="Aktuelles Hero-Bild" /><button onClick={() => fileRef.current?.click()}><Upload size={15} /> Eigenes Bild</button></div><input ref={fileRef} className="visually-hidden" type="file" accept="image/*" onChange={(event) => handleUpload(event.target.files?.[0])} /></div><div className="image-gallery">{(imageSets[builder.industry] ?? imageSets.Handwerk).map((url, index) => <button key={url} className={url === builder.content.image ? "active" : ""} onClick={() => chooseGalleryImage(url)} aria-label={`Bild ${index + 1} verwenden`}><img src={url} alt="" /></button>)}</div></div>
            <label className="input-label">Alternativ Bild-URL<input value={builder.content.image.startsWith("data:") ? "Lokaler Upload" : builder.content.image} disabled={builder.content.image.startsWith("data:")} onChange={(event) => setBuilder((prev) => ({ ...prev, content: { ...prev.content, image: event.target.value } }))} /></label>
          </TabsContent>

          <TabsContent value="design" className="tab-panel">
            <div className="panel-heading"><div><small>DESIGN-SYSTEM</small><h2>Marke & Layout</h2></div></div>
            <button className="template-current" onClick={openTemplates}><span style={{ background: selectedTemplate.accent }} /><div><small>{builder.mode === "free" ? "Modus" : "Template"}</small><b>{selectedTemplate.name}</b><em>{selectedTemplate.category} · {selectedTemplate.style}</em></div><ChevronRight /></button>
            <label className="input-label">Unternehmensname<input value={builder.company} onChange={(event) => setBuilder((prev) => ({ ...prev, company: event.target.value }))} /></label>
            <div className="color-grid"><label>Akzent<input type="color" value={builder.accent} onChange={(event) => setBuilder((prev) => ({ ...prev, accent: event.target.value }))} /></label><label>Sekundär<input type="color" value={builder.secondary.slice(0, 7)} onChange={(event) => setBuilder((prev) => ({ ...prev, secondary: event.target.value }))} /></label><label>Dunkel<input type="color" value={builder.dark} onChange={(event) => setBuilder((prev) => ({ ...prev, dark: event.target.value }))} /></label><label>Fläche<input type="color" value={builder.surface} onChange={(event) => setBuilder((prev) => ({ ...prev, surface: event.target.value }))} /></label><label>Text<input type="color" value={builder.text} onChange={(event) => setBuilder((prev) => ({ ...prev, text: event.target.value }))} /></label></div>
            <label className="slider-label"><span>Eckenrundung <b>{builder.radius}px</b></span><Slider min={0} max={40} step={2} value={[builder.radius]} onValueChange={(value) => setBuilder((prev) => ({ ...prev, radius: value[0] }))} /></label>
            <label className="slider-label"><span>Sektionsabstand <b>{builder.spacing}%</b></span><Slider min={70} max={135} step={5} value={[builder.spacing]} onValueChange={(value) => setBuilder((prev) => ({ ...prev, spacing: value[0] }))} /></label>
            <label className="input-label">Schriftstil<Select value={builder.font} onValueChange={(value) => setBuilder((prev) => ({ ...prev, font: value as BuilderState["font"] }))}><SelectTrigger className="builder-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="modern">Modern & klar</SelectItem><SelectItem value="editorial">Editorial & hochwertig</SelectItem><SelectItem value="technical">Technisch & präzise</SelectItem></SelectContent></Select></label>
            <label className="input-label">Button-Stil<Select value={builder.buttonStyle} onValueChange={(value) => setBuilder((prev) => ({ ...prev, buttonStyle: value as BuilderState["buttonStyle"] }))}><SelectTrigger className="builder-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="solid">Vollfläche</SelectItem><SelectItem value="outline">Outline</SelectItem><SelectItem value="soft">Soft</SelectItem></SelectContent></Select></label>
            <label className="input-label">Hero-Ausrichtung<Select value={builder.heroAlign} onValueChange={(value) => setBuilder((prev) => ({ ...prev, heroAlign: value as BuilderState["heroAlign"] }))}><SelectTrigger className="builder-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Links</SelectItem><SelectItem value="center">Zentriert</SelectItem><SelectItem value="right">Rechts</SelectItem></SelectContent></Select></label>
            {selectedSection && <div className="advanced-section-controls"><div className="panel-divider"/><div className="panel-heading"><div><small>PRO · SEKTION</small><h2>{sectionLabels[selectedSection.kind]}</h2></div></div><p className="panel-help">Diese Werte werden 1:1 in Preview und Export übernommen.</p>
            <label className="slider-label"><span>Innenabstand Y <b>{selectedSection.style?.paddingY ?? 80}px</b></span><Slider min={0} max={240} step={4} value={[selectedSection.style?.paddingY ?? 80]} onValueChange={(v)=>patchSectionStyle({paddingY:v[0]})}/></label>
            <div className="color-grid"><label>Hintergrund<input type="color" value={selectedSection.style?.background ?? builder.surface} onChange={(e)=>patchSectionStyle({background:e.target.value})}/></label><label>Text<input type="color" value={selectedSection.style?.color ?? builder.text} onChange={(e)=>patchSectionStyle({color:e.target.value})}/></label></div>
            <label className="slider-label"><span>Deckkraft <b>{Math.round((selectedSection.style?.opacity ?? 1)*100)}%</b></span><Slider min={10} max={100} step={1} value={[Math.round((selectedSection.style?.opacity ?? 1)*100)]} onValueChange={(v)=>patchSectionStyle({opacity:v[0]/100})}/></label>
            <label className="slider-label"><span>Blur <b>{selectedSection.style?.blur ?? 0}px</b></span><Slider min={0} max={30} step={1} value={[selectedSection.style?.blur ?? 0]} onValueChange={(v)=>patchSectionStyle({blur:v[0]})}/></label>
            <label className="slider-label"><span>Scale <b>{selectedSection.style?.scale ?? 100}%</b></span><Slider min={70} max={130} step={1} value={[selectedSection.style?.scale ?? 100]} onValueChange={(v)=>patchSectionStyle({scale:v[0]})}/></label>
            <label className="slider-label"><span>Rotation <b>{selectedSection.style?.rotate ?? 0}°</b></span><Slider min={-20} max={20} step={1} value={[selectedSection.style?.rotate ?? 0]} onValueChange={(v)=>patchSectionStyle({rotate:v[0]})}/></label>
            <label className="slider-label"><span>X-Offset <b>{selectedSection.style?.offsetX ?? 0}px</b></span><Slider min={-160} max={160} step={4} value={[selectedSection.style?.offsetX ?? 0]} onValueChange={(v)=>patchSectionStyle({offsetX:v[0]})}/></label>
            <label className="slider-label"><span>Y-Offset <b>{selectedSection.style?.offsetY ?? 0}px</b></span><Slider min={-160} max={160} step={4} value={[selectedSection.style?.offsetY ?? 0]} onValueChange={(v)=>patchSectionStyle({offsetY:v[0]})}/></label>
            <label className="input-label">Animation<Select value={selectedSection.animation?.type ?? "none"} onValueChange={(v)=>patchSectionAnimation({type:v as SectionAnimation["type"]})}><SelectTrigger className="builder-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Keine</SelectItem><SelectItem value="fade">Fade</SelectItem><SelectItem value="slide-up">Slide Up</SelectItem><SelectItem value="slide-left">Slide Left</SelectItem><SelectItem value="zoom">Zoom</SelectItem><SelectItem value="blur">Blur Reveal</SelectItem><SelectItem value="rotate">Rotate Reveal</SelectItem></SelectContent></Select></label>
            <label className="slider-label"><span>Dauer <b>{selectedSection.animation?.duration ?? 700}ms</b></span><Slider min={100} max={3000} step={50} value={[selectedSection.animation?.duration ?? 700]} onValueChange={(v)=>patchSectionAnimation({duration:v[0]})}/></label>
            <label className="slider-label"><span>Delay <b>{selectedSection.animation?.delay ?? 0}ms</b></span><Slider min={0} max={2000} step={50} value={[selectedSection.animation?.delay ?? 0]} onValueChange={(v)=>patchSectionAnimation({delay:v[0]})}/></label>
            <label className="input-label">Easing<input value={selectedSection.animation?.easing ?? "cubic-bezier(.16,1,.3,1)"} onChange={(e)=>patchSectionAnimation({easing:e.target.value})}/></label>{(builder.editorMode??"easy")!=="easy"&&<><div className="panel-divider"/><div className="module-heading"><b>Responsive Override · {device}</b><small>Nur für diesen Breakpoint. Desktop bleibt die Basis.</small></div><label className="slider-label"><span>Padding Y <b>{responsiveStyle.paddingY ?? selectedSection.style?.paddingY ?? 80}px</b></span><Slider min={0} max={240} step={4} value={[responsiveStyle.paddingY ?? selectedSection.style?.paddingY ?? 80]} onValueChange={v=>patchResponsive({paddingY:v[0]})}/></label><label className="slider-label"><span>Scale <b>{responsiveStyle.scale ?? selectedSection.style?.scale ?? 100}%</b></span><Slider min={70} max={130} step={1} value={[responsiveStyle.scale ?? selectedSection.style?.scale ?? 100]} onValueChange={v=>patchResponsive({scale:v[0]})}/></label><div className="switch-row"><div><b>Auf {device} ausblenden</b><small>Breakpoint-spezifische Sichtbarkeit</small></div><Switch checked={Boolean(responsiveStyle.hidden)} onCheckedChange={v=>patchResponsive({hidden:v})}/></div></>}</div>}
          </TabsContent>

          <TabsContent value="features" className="tab-panel">
            <div className="panel-heading"><div><small>OPTIONEN</small><h2>Funktionen</h2></div></div>
            <p className="panel-help">Optionen landen mit deiner Konfiguration in der Anfrage. Der Richtpreis aktualisiert sich sofort.</p>
            <div className="industry-module-box"><div className="module-heading"><b>{builder.industry} Funktionen</b><small>Branchenspezifische Logik, nicht nur Design.</small></div>{(industryModules[builder.industry] ?? []).map((module) => <label className="industry-module" key={module.key}><Checkbox checked={builder.addons.includes(module.key)} onCheckedChange={(checked) => setBuilder((prev) => ({ ...prev, addons: checked ? [...prev.addons, module.key] : prev.addons.filter((item) => item !== module.key) }))}/><span><b>{module.title}</b><small>{module.copy}</small></span></label>)}</div>
            <div className="addon-list">{Object.entries(addonLabels).map(([key, label]) => <label key={key}><Checkbox checked={builder.addons.includes(key)} onCheckedChange={(checked) => setBuilder((prev) => ({ ...prev, addons: checked ? [...prev.addons, key] : prev.addons.filter((item) => item !== key) }))} /><span><b>{label}</b><small>+ {money(addonPrices[key])}</small></span></label>)}</div>
            <div className="switch-row"><div><b>Care-Paket</b><small>Updates & Support · 49,99 €/Monat</small></div><Switch checked={builder.care} onCheckedChange={(checked) => setBuilder((prev) => ({ ...prev, care: checked }))} /></div>
            <div className="switch-row"><div><b>Express-Umsetzung</b><small>Priorisierte Umsetzung · +20 %</small></div><Switch checked={builder.rush} onCheckedChange={(checked) => setBuilder((prev) => ({ ...prev, rush: checked }))} /></div>
          </TabsContent>
        </Tabs>
        <div className="builder-price"><div><span>Einmalig ab</span><strong>{money(price)}</strong></div>{builder.care && <small>+ 49,99 € / Monat</small>}<button onClick={openCheckout}>Projekt abschließen <ArrowRight size={16} /></button></div>
      </aside>

      <section className="canvas-area">
        {phoneDesktop && <LandscapeHint />}
        <div className="canvas-page-tabs">{builder.pages.map((page) => <button key={page.id} className={page.id === activePage ? "active" : ""} onClick={() => setActivePage(page.id)}>{page.name}</button>)}</div>
        <div className={`canvas-frame ${device} ${phoneDesktop ? "phone-desktop" : ""}`}>
          <SitePreview template={{ ...selectedTemplate, accent: builder.accent, dark: builder.dark }} builder={builder} page={currentPage} device={device} editable onTextChange={updateText} onPageChange={setActivePage} />
        </div>
        <span className="canvas-hint">Vorschau · {currentPage.name} · Texte direkt anklickbar · Änderungen werden live gespeichert</span>
      </section>
    </div>
    {codeOpen && <div className="jx-code-panel"><div><strong>Live Production Code</strong><button onClick={()=>setCodeOpen(false)}>×</button></div><div className="jx-code-files">{Object.entries(compiledCode).map(([name,code])=><details key={name} open={name==="app/page.tsx"}><summary>{name}</summary><pre>{code}</pre></details>)}</div></div>}
    <div className="mobile-tool-fab"><button onClick={() => setToolsOpen(true)}><Palette size={18} /> Bearbeiten</button><button onClick={openCheckout}>Anfragen <ArrowRight size={17} /></button></div>
  </main>;
}

function DeviceSwitch({ device, setDevice }: { device: Device; setDevice: (device: Device) => void }) {
  return <div className="device-switch"><button className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")}><Monitor size={17}/><span>Desktop</span></button><button className={device === "laptop" ? "active" : ""} onClick={() => setDevice("laptop")}><Monitor size={16}/><span>Laptop</span></button><button className={device === "tablet" ? "active" : ""} onClick={() => setDevice("tablet")}><Tablet size={16}/><span>Tablet</span></button><button className={device === "mobile" ? "active" : ""} onClick={() => setDevice("mobile")}><Smartphone size={17}/><span>Mobil</span></button></div>;
}

function LandscapeHint() {
  return <div className="landscape-hint"><Smartphone size={18} /><span><b>Desktop-Vorschau auf dem Smartphone</b> Für die beste Darstellung das Smartphone ins Querformat drehen.</span></div>;
}

export function SitePreview({ template, builder, page, device, editable = false, onTextChange, onPageChange }: { template: Template; builder: BuilderState; page: PageConfig; device: Device; editable?: boolean; onTextChange?: (key: string, value: string) => void; onPageChange?: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const profile = builder.resolvedContent ?? profileFor(builder.industry);
  const style = {
    "--preview-accent": builder.accent,
    "--preview-secondary": builder.secondary,
    "--preview-dark": builder.dark,
    "--preview-surface": builder.surface,
    "--preview-text": builder.text,
    "--preview-radius": `${builder.radius}px`,
    "--preview-space": `${builder.spacing}%`,
    "--preview-font": builder.font === "editorial" ? "Georgia, serif" : builder.font === "technical" ? "ui-monospace, SFMono-Regular, monospace" : "Inter, sans-serif",
  } as React.CSSProperties;
  const pageIndex = Math.max(0, builder.pages.findIndex((item) => item.id === page.id));
  const heroHeadline = page.id === "home" ? builder.content.headline : pageIndex === 1 ? profile.serviceTitle : pageIndex === 2 ? profile.aboutTitle : profile.cta;
  const heroCopy = page.id === "home" ? builder.content.copy : pageIndex === 1 ? `Alles Wichtige zu ${page.name.toLowerCase()} – klar strukturiert und schnell erfassbar.` : pageIndex === 2 ? profile.aboutCopy : "Schreib uns kurz, worum es geht. Wir melden uns persönlich mit den nächsten Schritten.";
  const keyFor = (section: SectionConfig, field: string) => `${page.id}:${section.id}:${field}`;
  const text = (section: SectionConfig, field: string, fallback: string) => builder.customText[keyFor(section, field)] ?? fallback;
  const editProps = (section: SectionConfig, field: string) => editable ? { contentEditable: true, suppressContentEditableWarning: true, className: "editable-copy", onBlur: (event: React.FocusEvent<HTMLElement>) => onTextChange?.(keyFor(section, field), event.currentTarget.textContent ?? "") } : {};

  const sectionProps = (section: SectionConfig) => { const st=section.style??{}, an=section.animation??{}; return { style: { ...(st.paddingY != null ? {paddingTop:st.paddingY,paddingBottom:st.paddingY}:{}), ...(st.background?{background:st.background}:{}), ...(st.color?{color:st.color}:{}), opacity:st.opacity??1, filter:`blur(${st.blur??0}px)`, transform:`translate(${st.offsetX??0}px, ${st.offsetY??0}px) scale(${(st.scale??100)/100}) rotate(${st.rotate??0}deg)`, borderRadius:st.radius, "--jx-anim-duration":`${an.duration??700}ms`, "--jx-anim-delay":`${an.delay??0}ms`, "--jx-anim-ease":an.easing??"cubic-bezier(.16,1,.3,1)" } as React.CSSProperties }; };
  const changePage = (id: string) => { setMenuOpen(false); onPageChange?.(id); };
  return <div className={`site-preview layout-${template.layout} device-${device} button-${builder.buttonStyle} hero-${builder.heroAlign}`} style={style}>
    <nav className="preview-nav"><strong>{builder.company || "DEIN UNTERNEHMEN"}</strong><div className={menuOpen ? "open" : ""}>{builder.pages.slice(0, 4).map((item) => <button key={item.id} className={item.id === page.id ? "active" : ""} onClick={() => changePage(item.id)}>{item.name}</button>)}</div><button className="preview-menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label="Navigation öffnen"><Menu size={18} /></button></nav>
    {page.sections.filter((section) => !section.hidden).map((section) => {
      if (section.kind === "hero") return <section {...sectionProps(section)} className={`pv-hero jx-config-section jx-anim-${section.animation?.type ?? "none"}`} key={section.id} data-jx-section={section.id}><div className="pv-hero-copy"><small {...editProps(section, "kicker")}>{text(section, "kicker", page.id === "home" ? builder.content.kicker : `${page.name.toUpperCase()} · ${profile.category.toUpperCase()}`)}</small><h1 {...editProps(section, "headline")}>{text(section, "headline", heroHeadline)}</h1><p {...editProps(section, "copy")}>{text(section, "copy", heroCopy)}</p><button>{page.id === "home" ? builder.content.cta : profile.cta} <ArrowRight size={14} /></button></div><img src={builder.content.image || template.image} alt={`${builder.company} ${profile.category}`} /></section>;
      if (section.kind === "services") return <section {...sectionProps(section)} className={`pv-services jx-config-section jx-anim-${section.animation?.type ?? "none"}`} key={section.id} data-jx-section={section.id}><small>LEISTUNGEN</small><h2 {...editProps(section, "headline")}>{text(section, "headline", profile.serviceTitle)}</h2><div>{profile.services.map((item, itemIndex) => <article key={item.title}><b>0{itemIndex + 1}</b><h3 {...editProps(section, `service-${itemIndex}-title`)}>{text(section, `service-${itemIndex}-title`, item.title)}</h3><p {...editProps(section, `service-${itemIndex}-copy`)}>{text(section, `service-${itemIndex}-copy`, item.copy)}</p></article>)}</div></section>;
      if (section.kind === "about") return <section {...sectionProps(section)} className={`pv-about jx-config-section jx-anim-${section.animation?.type ?? "none"}`} key={section.id} data-jx-section={section.id}><div className="pv-image" style={{ backgroundImage: `url(${builder.resolvedImages?.[1] ?? imageSets[template.category]?.[1] ?? builder.content.image})` }} /><div><small>ÜBER UNS</small><h2 {...editProps(section, "headline")}>{text(section, "headline", profile.aboutTitle)}</h2><p {...editProps(section, "copy")}>{text(section, "copy", profile.aboutCopy)}</p><a>Mehr erfahren <ArrowRight size={14} /></a></div></section>;
      if (section.kind === "projects") return <section {...sectionProps(section)} className={`pv-projects jx-config-section jx-anim-${section.animation?.type ?? "none"}`} key={section.id} data-jx-section={section.id}><small>REFERENZEN</small><h2 {...editProps(section, "headline")}>{text(section, "headline", profile.projectsTitle)}</h2><div>{[0, 2].map((imageIndex, projectIndex) => <article key={imageIndex} style={{ backgroundImage: `url(${builder.resolvedImages?.[imageIndex] ?? imageSets[template.category]?.[imageIndex] ?? builder.content.image})` }}><span {...editProps(section, `project-${projectIndex}`)}>{text(section, `project-${projectIndex}`, profile.projectNames[projectIndex])}</span></article>)}</div></section>;
      if (section.kind === "reviews") return <section {...sectionProps(section)} className={`pv-review jx-config-section jx-anim-${section.animation?.type ?? "none"}`} key={section.id} data-jx-section={section.id}><span>★★★★★</span><blockquote {...editProps(section, "quote")}>„{text(section, "quote", profile.review)}“</blockquote><small {...editProps(section, "reviewer")}>— {text(section, "reviewer", profile.reviewer)}</small></section>;
      if (section.kind === "contact") return <section {...sectionProps(section)} className={`pv-contact jx-config-section jx-anim-${section.animation?.type ?? "none"}`} key={section.id} data-jx-section={section.id}><div><small>KONTAKT</small><h2 {...editProps(section, "headline")}>{text(section, "headline", profile.cta)}</h2><p {...editProps(section, "copy")}>{text(section, "copy", "Erzähl uns kurz, worum es geht. Wir melden uns persönlich zurück.")}</p></div><form><input aria-label="Name" placeholder="Name" /><input aria-label="E-Mail" placeholder="E-Mail" /><textarea aria-label="Nachricht" placeholder="Nachricht" /><button type="button">Anfrage senden</button></form></section>;
      return <section {...sectionProps(section)} className={`pv-cta jx-config-section jx-anim-${section.animation?.type ?? "none"}`} key={section.id} data-jx-section={section.id}><div><small>NÄCHSTER SCHRITT</small><h2 {...editProps(section, "headline")}>{text(section, "headline", profile.cta)}</h2></div><button>{builder.content.cta || "Jetzt anfragen"} <ArrowRight size={14} /></button></section>;
    })}
    <footer className="pv-footer"><strong>{builder.company}</strong><span>© 2026 · Impressum · Datenschutz</span></footer>
  </div>;
}

export function ConfigurationPreview({ configuration }: { configuration: unknown }) {
  if (!configuration || typeof configuration !== "object") return <div className="admin-preview-empty">Keine Website-Konfiguration vorhanden.</div>;
  try {
    const builder = normaliseBuilder(configuration as Partial<BuilderState>);
    const template = builder.templateId === blankTemplate.id ? blankTemplate : templates.find((item) => item.id === builder.templateId) ?? templates[0];
    const page = builder.pages.find((item) => item.id === "home") ?? builder.pages[0];
    if (!page) return <div className="admin-preview-empty">Konfiguration enthält keine Seite.</div>;
    return <div className="admin-preview-wrap"><SitePreview template={{ ...template, accent: builder.accent, dark: builder.dark }} builder={builder} page={page} device="mobile" /></div>;
  } catch {
    return <div className="admin-preview-empty">Konfiguration konnte nicht gerendert werden.</div>;
  }
}

function ConsultationPage({ navigate }: { navigate: (view: View) => void }) {
  type Slot = { id:number; startsAt:string; endsAt:string };
  const [slots,setSlots]=useState<Slot[]>([]); const [selected,setSelected]=useState<Slot|null>(null); const [loading,setLoading]=useState(true); const [booking,setBooking]=useState(false); const [reference,setReference]=useState<number|null>(null);
  useEffect(()=>{const from=new Date();const to=new Date(Date.now()+1000*60*60*24*60);fetch(`/api/appointments?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,{cache:"no-store"}).then(async r=>{const d=await r.json() as {slots?:Slot[]};if(r.ok)setSlots(d.slots??[])}).finally(()=>setLoading(false));},[]);
  const book=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();if(!selected)return;setBooking(true);const f=new FormData(e.currentTarget);try{const r=await fetch("/api/appointments",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...Object.fromEntries(f.entries()),startsAt:selected.startsAt,durationMinutes:Math.max(15,Math.round((new Date(selected.endsAt).getTime()-new Date(selected.startsAt).getTime())/60000))})});const d=await r.json() as {id?:number;error?:string};if(!r.ok)throw new Error(d.error||"Termin konnte nicht gebucht werden.");setReference(d.id??null);setSlots(x=>x.filter(v=>v.id!==selected.id));toast.success("Beratungstermin gebucht.")}catch(err){toast.error(err instanceof Error?err.message:"Termin konnte nicht gebucht werden.")}finally{setBooking(false)}};
  const fmt=(iso:string)=>new Intl.DateTimeFormat("de-DE",{weekday:"short",day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(iso));
  return <main className="page-main consultation-page">
    <section className="consultation-hero"><div><span className="eyebrow"><CalendarDays size={14}/> Persönliche Website-Beratung</span><h1>Du musst den Builder<br/><em>nicht allein verstehen.</em></h1><p>Wir konfigurieren dein Projekt gemeinsam. Design, Seiten, Funktionen und nächste Schritte landen direkt im selben JX Workflow.</p><div className="consult-points"><span><Check/> Entwurf bleibt gespeichert</span><span><Check/> Live im Builder planen</span><span><Check/> Danach derselbe Produktionsworkflow</span></div></div><div className="consult-card"><span>ECHTE VERFÜGBARKEIT</span><h3>Website gemeinsam planen</h3><div className="consult-meta"><span><Clock3/> 45 Minuten</span><span><Users/> 1:1 mit JX Studio</span></div>{reference?<div className="form-success"><Check/><h3>Termin gebucht.</h3><p>Referenz: <b>JXA-{reference}</b><br/>Die Buchung liegt jetzt im JX Admin.</p></div>:<>{loading?<p>Freie Termine werden geladen …</p>:slots.length===0?<p>Aktuell sind keine freien Termine eingetragen. Nutze alternativ die Projektanfrage.</p>:<div className="slot-grid real-slots">{slots.slice(0,12).map(slot=><button key={slot.id} className={selected?.id===slot.id?"active":""} onClick={()=>setSelected(slot)}>{fmt(slot.startsAt)}</button>)}</div>}{selected&&<form className="consult-booking-form" onSubmit={book}><input name="name" required placeholder="Name"/><input name="email" required type="email" placeholder="E-Mail"/><input name="company" placeholder="Unternehmen"/><input name="phone" placeholder="Telefon"/><select name="projectType" defaultValue="Website"><option>Website</option><option>Online-Shop</option><option>Software / Webapp</option><option>Kundenportal</option><option>KI-Assistent</option></select><textarea name="notes" placeholder="Was möchtest du besprechen?"/><button className="btn-primary" disabled={booking}>{booking?"Wird gebucht …":`${fmt(selected.startsAt)} verbindlich reservieren`}<ArrowRight size={16}/></button></form>} {!selected&&slots.length>0&&<small className="consult-note">Wähle einen freien Termin. Doppelbuchungen werden serverseitig verhindert.</small>}</>}</div></section>
    <section className="consultation-process"><span className="eyebrow dark">Ein Workflow, zwei Einstiege</span><h2>Selbst bauen oder gemeinsam planen.<br/>Danach läuft alles gleich.</h2><div>{[["01","Vorbereiten","Branche, Ziel und vorhandene Inhalte angeben."],["02","Gemeinsam konfigurieren","Wir arbeiten live an demselben JX Builder."],["03","Projekt festziehen","Funktionen, Preis und Umfang werden aus der Konfiguration abgeleitet."],["04","Produktion","Compiler, QA, persönlicher Feinschliff, Freigabe und Launch."]].map(([n,t,c])=><article key={n}><b>{n}</b><h3>{t}</h3><p>{c}</p></article>)}</div></section>
  </main>;
}

function ContactPage() {
  return <main className="page-main contact-page"><section className="page-intro"><span className="eyebrow">Projektanfrage</span><h1>Erzähl kurz,<br /><em>was du vorhast.</em></h1><p>Website, Shop, Portal oder individuelles Development. Je klarer das Ziel, desto konkreter kann die erste Einschätzung sein.</p></section><section className="contact-layout"><div className="contact-copy"><span>Direkter Kontakt</span><a href="mailto:J.schneider.05@gmx.net">J.schneider.05@gmx.net</a><p>Bremen & Umgebung<br />Projekte deutschlandweit</p><div><b>Was danach passiert</b><ol><li><span>1</span>Die Anfrage wird geprüft und strukturiert.</li><li><span>2</span>Du bekommst eine persönliche Rückmeldung.</li><li><span>3</span>Nach der Abstimmung folgt ein verbindliches Angebot.</li></ol></div></div><InquiryForm /></section></main>;
}


function DirectCheckout({ configuration, estimatedPrice }: { configuration: BuilderState; estimatedPrice: number }) {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const start = async () => {
    if (!accepted) { toast.error("Bitte bestätige den kostenpflichtigen Auftrag."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ configuration: { ...configuration, resolvedContent: profileFor(configuration.industry), resolvedImages: imageSets[configuration.industry] ?? [] }, estimatedPrice }) });
      const data = await response.json() as { url?:string; error?:string };
      if (!response.ok || !data.url) throw new Error(data.error || "Checkout konnte nicht gestartet werden.");
      window.location.href = data.url;
    } catch (error) { toast.error(error instanceof Error ? error.message : "Checkout konnte nicht gestartet werden."); }
    finally { setLoading(false); }
  };
  return <div className="direct-checkout"><div><b>Direkt beauftragen</b><p>Für klar kalkulierte Website-Projekte. Sichere Online-Zahlung; danach wird dein Projekt automatisch als Auftrag angelegt.</p></div><label className="consent"><input type="checkbox" checked={accepted} onChange={(e)=>setAccepted(e.target.checked)}/><span>Ich möchte das konfigurierte Projekt kostenpflichtig beauftragen und akzeptiere den angezeigten Einmalpreis. Rechtstexte und Vertragsdetails werden vor dem öffentlichen Launch final hinterlegt.</span></label><button className="btn-primary" onClick={start} disabled={loading || !accepted}>{loading ? "Checkout wird geöffnet …" : `Zahlungspflichtig beauftragen · ${money(estimatedPrice)}`} <ArrowRight size={16}/></button><small>Mit aktivem JX Care wird der Checkout als monatliches Abo angelegt. Externe Domain- und Hostinggebühren sind nicht enthalten.</small></div>;
}

function InquiryForm({ configuration, estimatedPrice, onSuccess, compact = false }: { configuration?: BuilderState; estimatedPrice?: number; onSuccess?: () => void; compact?: boolean }) {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const consentInput = event.currentTarget.elements.namedItem("consent") as HTMLInputElement | null;
    if (!consentInput?.checked) { toast.error("Bitte bestätige die Speicherung deiner Angaben."); return; }
    setSending(true); setSuccess(null);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const safeConfiguration = configuration ? { ...configuration, resolvedContent: profileFor(configuration.industry), resolvedImages: imageSets[configuration.industry] ?? [], content: { ...configuration.content, image: configuration.content.image.startsWith("data:") ? "[lokaler Upload – wird separat benötigt]" : configuration.content.image } } : undefined;
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, source: safeConfiguration ? "builder" : "contact", configuration: safeConfiguration, estimatedPrice }) });
      const data = await response.json() as { error?: string; reference?: string; emailSent?: boolean };
      if (!response.ok) throw new Error(data.error || "Senden fehlgeschlagen");
      if (data.emailSent === false) toast.warning("Anfrage gespeichert. Die E-Mail-Benachrichtigung ist aktuell noch nicht aktiv.");
      setSuccess(data.reference ?? "Gesendet"); event.currentTarget.reset(); toast.success("Deine Anfrage wurde an JX Studio gesendet."); onSuccess?.();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Bitte versuche es erneut."); }
    finally { setSending(false); }
  };
  if (success) return <div className="form-success"><Check /><h3>Anfrage angekommen.</h3><p>Referenz: <b>{success}</b><br />Wir melden uns persönlich bei dir.</p></div>;
  return <form className={compact ? "inquiry-form compact" : "inquiry-form"} onSubmit={submit}>
    <div className="form-grid"><label>Dein Name *<input name="name" required minLength={2} autoComplete="name" /></label><label>E-Mail *<input name="email" required type="email" autoComplete="email" /></label></div>
    <div className="form-grid"><label>Unternehmen<input name="company" autoComplete="organization" /></label><label>Telefon<input name="phone" type="tel" autoComplete="tel" /></label></div>
    {!configuration && <label>Worum geht es?<select name="subject" defaultValue="Website"><option>Website</option><option>Online-Shop</option><option>Software / Webapp</option><option>Kundenportal</option><option>Online-Marketing</option><option>Betreuung</option><option>Sonstiges</option></select></label>}
    <label>Nachricht *<textarea name="message" required minLength={10} rows={compact ? 4 : 7} placeholder={configuration ? "Gibt es noch etwas, das wir wissen sollten?" : "Was möchtest du erreichen? Welche Seiten oder Funktionen brauchst du?"} /></label>
    <label className="consent"><input type="checkbox" name="consent" required /><span>Ich stimme zu, dass meine Angaben zur Bearbeitung der Anfrage gespeichert werden.</span></label>
    <button className="btn-primary submit-button" disabled={sending}>{sending ? "Wird gesendet …" : configuration ? "Konfiguration unverbindlich anfragen" : "Anfrage senden"} <ArrowRight size={17} /></button>
  </form>;
}

function Footer({ navigate }: { navigate: (view: View) => void }) {
  return <footer className="main-footer"><div><BrandLogo onClick={() => navigate("home")} /><p>Webdesign, Development und digitale Systeme.<br />Entwickelt in Bremen.</p></div><div><b>Entdecken</b><button onClick={() => navigate("templates")}>Templates</button><button onClick={() => navigate("services")}>Leistungen</button><button onClick={() => navigate("builder")}>Studio</button><button onClick={() => navigate("consultation")}>Persönliche Beratung</button></div><div><b>Kontakt</b><a href="mailto:J.schneider.05@gmx.net">J.schneider.05@gmx.net</a><span>Bremen · Deutschlandweit</span><a className="admin-link" href="/admin">Projekt-Eingang</a></div><div className="footer-bottom"><span>© 2026 JX Studio</span><span>Impressum · Datenschutz</span></div></footer>;
}
