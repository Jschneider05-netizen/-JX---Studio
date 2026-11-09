import type { Metadata } from "next";
import "./globals.css";
import "../public/jx-studio-runtime.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_SITE_URL || "https://jx-studio.de"),
  title: "JX Studio | Webdesign, Development & digitale Lösungen",
  description:
    "JX Studio entwickelt Websites, Online-Shops, Kundenportale, Web-Anwendungen und digitale Lösungen aus Bremen – individuell, responsive und technisch sauber.",
  openGraph: { title: "JX Studio | Design, Development & digitale Lösungen", description: "Websites, Web-Apps, Software und KI-Assistenten aus Bremen und Stuhr.", images: [{ url: "/opengraph-image", width: 1200, height: 630 }], type: "website" },
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
      <body><script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context":"https://schema.org","@type":"ProfessionalService",name:"JX STUDIO",url:"https://jx-studio.de",email:"kontakt@jx-studio.de",telephone:"+49 421 84827081",address:{"@type":"PostalAddress",streetAddress:"Albert-Schweitzer-Straße 6",postalCode:"28816",addressLocality:"Stuhr",addressCountry:"DE"},areaServed:["Stuhr","Bremen","Deutschland"],description:"Webdesign, Webentwicklung, individuelle Software und digitale Unternehmenslösungen."}).replace(/</g,"\\u003c")}}/>{children}</body>
    </html>
  );
}
