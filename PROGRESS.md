# JX STUDIO – Entwicklungsprotokoll / Release-Kandidat

Datum: 29. Oktober 2026
Status: **v1.0-rc1, nicht veröffentlicht**

## Sicherung 00 – Original
- Git-Commit `d5785b3` bewahrt den ursprünglichen RUN2-Projektstand als Ausgangsbasis.
- Separates Originalarchiv: `JX_STUDIO_ORIGINAL_2026-10-29.zip` wird mit der Übergabe bereitgestellt.
- Vorhandenes Next.js-/React-Projekt und PostgreSQL-Migrationen unverändert als Grundlage erhalten. Keine produktive Datenbank verändert.

## Sicherung 01 – Öffentliche Conversion-Website
- Commit `b5fdbab`: Startseite, Navigation, sechs Leistungsbereiche, sechs Projektphasen, Gründer und Kontaktwege überarbeitet.
- Projekt „Praxis am Park“ eindeutig als fiktives Demo-/Konzeptprojekt ausgezeichnet.
- Öffentliche Preise ohne aktuelle Freigabe aus Startseite und Leistungsübersicht entfernt.

## Sicherung 02 – Seiten und rechtliche Entwürfe
- Commit `b8722ab`: Leistungsdetailseiten, Projekte, Studio, Impressum, Datenschutz, Fehlerseite und SEO-Sitemap ergänzt.
- Nicht belegte Kunden, Geschäftszahlen, Mitarbeiter und Referenzen nicht erfunden.
- Juristische Texte sind Entwürfe bis zum Abgleich mit Render, Resend, Datenaufbewahrung und Unternehmensangaben.

## Sicherung 03 – Responsives Design
- Commit `e1e2cbd`: Erweiterte responsiv gestaltete Brand-Komponenten und öffentliche Seiten, Fokusdarstellung und reduced-motion.
- Builder-LocalStorage auf Editor-Ansichten begrenzt.

## Sicherung 04 – API-Abschirmung
- Commit `dbd5f48`: Kontakt-Eingabevalidierung, Anti-Spam-Honeypot, Cross-Origin-Prüfung; Assistant standardmäßig gesperrt.

## Sicherung 05 – Release-Schutz
- Commit `58a98b5`: nicht veröffentlichungsreife Templates/Builder/Beratung standardmäßig von öffentlichen Routen getrennt, Structured Data und Navigation nachgebessert.

## Sicherung 06 – Nachkontrolle, Formular-Fix und Datenschutz der geschützten Routen
- Commit `3fc58d8`: asynchrones Formular-Reset repariert und zusätzliche ungetestete API-Endpunkte bis zur Freigabe deaktiviert.
- Commit `7f0d54c`: Admin- und Portal-Seiten von Suchmaschinenindexierung ausgenommen.
- Commit `03cff00`: zugängliches mobil aufklappbares Menü für öffentliche Detailseiten ergänzt.
- `QA_REPORT_2026_10_29.md` und `scripts/launch-preflight.mjs` dokumentieren Tests und Grenzen.

## Noch nicht bestätigt / vor Produktivsetzung erforderlich
- Der letzte aktuelle öffentliche Website-Stand auf `https://jx-studio.de` wurde nur lesend inspiziert und zeigt noch die alte Website.
- Kein verifizierter Zugriff auf Render-Deployment, Produktionsdatenbank, Domain-DNS, Mailbox oder Resend-Konto.
- Keine realen Testmails oder Datenbankschreibvorgänge: Zugangsdaten nicht vorhanden.
- Produktionsbuild nicht erfolgreich ausführbar: Dependency-Installation blockiert durch `getaddrinfo EAI_AGAIN registry.npmjs.org`. Syntaxprüfung sämtlicher TypeScript-/TSX-Dateien: 0 Parse-Fehler.
- Kein visueller Echtbrowsertest der geänderten Version möglich. Responsives CSS lediglich statisch geprüft.
- Vor Live-Schaltung sind E-Mail-Zustellung, Backup/Wiederherstellung, Datenlöschung, AVV/Regionen, Steuer-/Impressumsangaben, Datenspeicherung, HTTPS und ggf. VSBG zu verifizieren.

## Nächster Schritt
1. Auf dem Mac oder in der Render-Buildumgebung `corepack pnpm install --frozen-lockfile`, `corepack pnpm exec tsc --noEmit`, `corepack pnpm lint`, `corepack pnpm build` ausführen.
2. Lokale Entwicklung und visuelle Browser-Checks auf Desktop + Mobile.
3. Vorhandene Postgres-Datenbank und Migrationsjournal sichern, 0000-0007 gegen Live-Schema abgleichen, keine neuen Migrationen auf Verdacht ausführen.
4. Render-Env (DATABASE_URL, Kontakt-Resend, Sicherheitskey), E-Mail-Empfang testen.
5. Rechtstexte nach realen Datenflüssen freigeben; dann in Staging deployen, echte E2E-Anfrage senden und Admin-Eingang sowie Benachrichtigung verifizieren.
6. Erst danach Produktionsservice auf aktuellem Domain-DNS aktualisieren und `PUBLIC_SITE_URL=https://jx-studio.de` setzen. Live-Check in Browser, SSL, Redirects, APIs, Logs.
