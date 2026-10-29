import type { Metadata } from "next";
import AdminInbox from "@/components/admin-inbox";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Projekt-Eingang | JX STUDIO", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <AdminInbox />;
}
