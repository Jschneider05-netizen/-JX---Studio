import type { Metadata } from "next";
import "./globals.css";
import "../public/jx-studio-runtime.css";

export const metadata: Metadata = {
  metadataBase: process.env.PUBLIC_SITE_URL ? new URL(process.env.PUBLIC_SITE_URL) : undefined,
  title: "JX Studio | Webdesign, Development & digitale Lösungen",
  description:
    "JX Studio entwickelt Websites, Online-Shops, Kundenportale, Web-Anwendungen und digitale Lösungen aus Bremen – individuell, responsive und technisch sauber.",
  openGraph: { title: "JX Studio | Design, Development & digitale Lösungen", description: "Websites, Web-Apps, Software und KI-Assistenten aus Bremen.", type: "website" },
  robots: { index: Boolean(process.env.PUBLIC_SITE_URL), follow: Boolean(process.env.PUBLIC_SITE_URL) },
  alternates: process.env.PUBLIC_SITE_URL ? { canonical: process.env.PUBLIC_SITE_URL } : undefined,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
