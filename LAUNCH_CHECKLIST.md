# JX Studio – konkrete Schritte vor dem öffentlichen Launch

## Infrastruktur und Daten

- [ ] Echte HTTPS-Domain und DNS auf Render einrichten; `PUBLIC_SITE_URL` setzen.
- [ ] PostgreSQL sichern und `drizzle-pg/0000_jx_studio_postgres.sql` bis `0007_jx_studio_order_integrity.sql` in Reihenfolge mit Schemaabgleich anwenden.
- [ ] Langen, zufälligen `JXSTUDIO_ADMIN_KEY` und Produktions-`DATABASE_URL` im Deployment setzen; keine Secrets im Repository speichern.
- [ ] `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm exec tsc --noEmit` in der Zielumgebung ausführen.
- [ ] Datensicherung, Log-Überwachung und Betrieb eines zentralen API-Rate-Limits für mehrere Instanzen einrichten.

## Marke, Inhalte und Recht

- [ ] Endgültiges Impressum und Datenschutz mit echten Unternehmens- und Steuerdaten prüfen und veröffentlichen; `NEXT_PUBLIC_IMPRINT_URL` und `NEXT_PUBLIC_PRIVACY_URL` setzen.
- [ ] Geschäftliche E-Mail als `NEXT_PUBLIC_CONTACT_EMAIL` eintragen.
- [ ] Eigene Template-Demo-Inhalte, Beispielbilder, Referenzen und Bewertungen vor Kundenveröffentlichung durch echte, freigegebene Inhalte ersetzen.
- [ ] Für Kundenexports Domain, Rechtstexte, Kontaktlösung und Bildrechte separat prüfen.

## Kommunikation, Beratung und Zahlung

- [ ] Resend-Absenderdomain verifizieren; `MAIL_FROM`, `CONTACT_EMAIL`, `RESEND_API_KEY` setzen. Kontakt, Builder-Anfrage und AI-Lead in Produktion mit E-Mail und Datenbank prüfen.
- [ ] Admin-Terminfenster anlegen und mobile Buchung samt Sperrung, Konfliktfall und Kundennachricht manuell prüfen.
- [ ] Optional `OPENAI_API_KEY` und ein geeignetes `OPENAI_MODEL` setzen und die KI-Antworten fachlich prüfen.
- [ ] Stripe-Live-Schlüssel setzen, `/api/stripe-webhook` registrieren, rechtlich geprüfte HTTPS-Links `PUBLIC_LEGAL_TERMS_URL` und `PUBLIC_PRIVACY_URL` angeben. `DIRECT_CHECKOUT_ENABLED` erst nach Testzahlung, Webhook, Rechnung, Portal-Link und Vertragsprüfung auf `true` setzen.
- [ ] Preise, Steuer-/Rechnungsangaben, JX Care und Vertragsabschluss geschäftlich abnehmen.

## Manuelle Abnahme

- [ ] Desktop, Tablet, Mobile Portrait und Landscape mit echtem Browser und unterschiedlichen Geräten prüfen; Builder, alle Template-Familien und exportierte Website vergleichen.
- [ ] Kontakt, Builder-Abschluss über beide Wege, Export-ZIP, Admin, Terminbuchung, Stripe-Test, Portal und Rechnungslinks mit echten Testdaten durchspielen.
- [ ] Beispielinhalte und externe Bild-URLs im Kundeneinsatz ersetzen; bei Bedarf echte Branchenmodule mit Backend/Provider verknüpfen.

## Bekannte Produktgrenzen

Die React-Vorschau und das statische HTML des Exports verwenden dieselbe SiteConfig, CSS-Runtime und Exportfunktion für Compiler und ZIP, aber nicht denselben HTML-Renderer. Erweiterte Layout-/Animations-Einstellungen können deshalb visuell abweichen. Der statische Kundenexport stellt keine fertigen serverseitigen Module für Buchung, Shop, Filter oder Formulare bereit. Das Portal zeigt den gesicherten Projektstand und Freigaben; Domain, Inhaltsbearbeitung und Support sind noch persönlich organisiert. End-to-End-Tests mit echten externen Diensten und Browser-Screenshot-QA wurden in der lokalen Umgebung nicht abgeschlossen.
