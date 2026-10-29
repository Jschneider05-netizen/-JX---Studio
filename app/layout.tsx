import type { Metadata } from "next";
import "./globals.css";
import "./launch.css";
import "../public/jx-studio-runtime.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_SITE_URL || "https://jx-studio.de"),
  title: "JX STUDIO | Webdesign & Softwareentwicklung Bremen",
  description:
    "JX STUDIO entwickelt Websites, Online-Shops, Web-Apps und Software in Stuhr bei Bremen. Digitales Design und Entwicklung aus einer Hand.",
  openGraph: { title: "JX Studio | Design, Development & digitale Lösungen", description: "Websites, Web-Apps, Software und KI-Assistenten aus Bremen.", type: "website" },
  robots: { index: process.env.PUBLIC_SITE_URL === "https://jx-studio.de", follow: process.env.PUBLIC_SITE_URL === "https://jx-studio.de" },
  alternates: { canonical: "/" },
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
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"ProfessionalService",name:"JX STUDIO",url:"https://jx-studio.de",email:"kontakt@jx-studio.de",telephone:"+49 421 84827081",founder:{"@type":"Person",name:"Joel Sebastian Schneider"},address:{"@type":"PostalAddress",streetAddress:"Albert-Schweitzer-Straße 6",postalCode:"28816",addressLocality:"Stuhr",addressCountry:"DE"},areaServed:"Deutschland",description:"Webdesign, Online-Shops, Web-Apps und individuelle Software aus Stuhr bei Bremen."})}}/>
        {children}
      </body>
    </html>
  );
}
