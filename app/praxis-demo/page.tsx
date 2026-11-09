import type { Metadata } from "next";
import PraxisDemoFrame from "@/components/praxis-demo-frame";
export const metadata: Metadata = { title: "Praxis am Park – Konzeptprojekt | JX STUDIO", description: "Webdesign-Konzept für eine Arztpraxis von JX STUDIO. Als Demo gestaltet, keine Kundenreferenz.", alternates: { canonical: "/praxis-demo" } };
export default function PraxisDemo() { return <PraxisDemoFrame/>; }
