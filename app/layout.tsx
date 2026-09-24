import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JX Studio | Webdesign, Development & digitale Lösungen",
  description:
    "JX Studio entwickelt Websites, Online-Shops, Kundenportale, Web-Anwendungen und digitale Lösungen aus Bremen – individuell, responsive und technisch sauber.",
  openGraph: { title: "JX Studio | Design, Development & digitale Lösungen", description: "Websites, Web-Apps, Software und KI-Assistenten aus Bremen.", type: "website" },
  robots: { index: true, follow: true },
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
      <head>
        <link rel="stylesheet" href="/jx-studio-runtime.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
