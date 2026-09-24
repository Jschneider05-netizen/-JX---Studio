# JX Studio — Final Full Release

Dieser Stand konsolidiert den visuellen Builder, Templates, responsive Overrides, Branchenmodule, KI-Beratung, Projektanfragen, Terminbuchung, Checkout/Billing-Grundlage, Admin Operations und den kanonischen Produktions-Export.

## Was lokal vollständig funktioniert
- Marketing-Website und 27 branchenspezifische Template-Varianten
- Interaktive Template-Vorschau mit Seitenwechsel und Geräteansichten
- Builder mit Easy / Advanced / JX Pro, Seiten, Sektionen, Reihenfolge, Texten, Design-Tokens, Animationen und Breakpoint-Overrides
- Live Production Code über `/api/compile-site`
- Canonical Export über `/api/generate-site`: derselbe `pv-*` Runtime/CSS-Vertrag plus responsive SiteConfig-Overrides
- Kontakt-/Builder-/KI-Lead-Flows
- KI-Assistant-UI und serverseitiger Assistant-Endpunkt
- Beratungs-Verfügbarkeiten, Buchung, Doppelbuchungsschutz und Admin-Terminverwaltung
- Stripe Checkout/JX Care Codepfad, Stripe Webhook und Billing-Datenmodell
- Admin Operations für Anfragen, Aufträge, Verfügbarkeiten und Termine
- SEO-Basis, robots und sitemap

## Externe Aktivierung vor echtem Launch
Diese Punkte können nicht sinnvoll mit erfundenen Zugangsdaten „fertig“ simuliert werden: Stripe Secret/Webhook, Resend-Absenderdomain, finale Domain/DNS/SSL, produktive PostgreSQL-Migrationen, PayPal Business/API sowie finale Rechtstexte/Steuerangaben. Die Anwendung behandelt fehlende Secrets als nicht freigeschaltete Funktion statt Fake-Erfolg.

## Datenbank
Migrationen liegen in `drizzle-pg/`. Nicht blind `drizzle-kit migrate` gegen eine bestehende Produktion ausführen. Bestehende DB zuerst sichern und Migrationsjournal abgleichen.

## Finaler Build
`pnpm install && pnpm build`
