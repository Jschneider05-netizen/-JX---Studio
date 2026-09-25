import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JXStudio from "@/components/jx-studio";

const views = {
  templates: { view: "templates", title: "Website-Templates | JX Studio", description: "Branchenspezifische Website-Beispiele für Handwerk, Gastronomie, Beauty, Immobilien, Fitness und weitere Unternehmen." },
  builder: { view: "builder", title: "Website konfigurieren | JX Studio", description: "Passe ein fertiges Website-Template mit deinen Inhalten und Farben an." },
  leistungen: { view: "services", title: "Webdesign, Software & Marketing | JX Studio", description: "Websites, Online-Shops, Web-Anwendungen und digitale Lösungen aus Bremen." },
  beratung: { view: "consultation", title: "Persönliche Beratung | JX Studio", description: "Plane deine Website und digitale Funktionen gemeinsam mit JX Studio." },
  kontakt: { view: "contact", title: "Kontakt & Projektanfrage | JX Studio", description: "Beschreibe dein digitales Projekt und sende eine unverbindliche Anfrage an JX Studio." },
} as const;

type Slug = keyof typeof views;
export function generateStaticParams() { return Object.keys(views).map(studioView => ({ studioView })); }
export async function generateMetadata({ params }: { params: Promise<{ studioView: string }> }): Promise<Metadata> {
  const { studioView } = await params;
  if (!(studioView in views)) return {};
  const item = views[studioView as Slug];
  const base = process.env.PUBLIC_SITE_URL?.replace(/\/$/, "");
  return { title: item.title, description: item.description, robots: { index: studioView !== "builder" && Boolean(base), follow: Boolean(base) }, alternates: base ? { canonical: `${base}/${studioView}` } : undefined, openGraph: { title: item.title, description: item.description, type: "website" } };
}
export default async function StudioView({ params }: { params: Promise<{ studioView: string }> }) {
  const { studioView } = await params;
  if (!(studioView in views)) notFound();
  return <JXStudio initialView={views[studioView as Slug].view} />;
}
