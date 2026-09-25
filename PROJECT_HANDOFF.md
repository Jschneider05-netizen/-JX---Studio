# PROJECT HANDOFF — JX Studio

> Historischer Projektstand. Für den aktuellen Lieferstand und die Launch-Schritte gelten `README.md`, `JX_STUDIO_FINAL_RELEASE.md` und `LAUNCH_CHECKLIST.md`.


## 1. Tech-Stack

- Next.js 16 / React 19
- TypeScript
- Vinext/Vite für das ChatGPT-Sites-/Cloudflare-Deployment
- Tailwind 4 + vorhandene shadcn-Komponenten
- Lucide Icons
- Sonner Toasts
- Drizzle ORM + Cloudflare D1
- Browser-LocalStorage für Builder-Autosave

## 2. Zentrale Dateien

- `app/page.tsx` — Einstieg der öffentlichen Website
- `components/jx-studio.tsx` — öffentliche Website, Templates, Vorschau, Builder und Anfrageflow
- `app/globals.css` — gesamtes JX-Studio-Designsystem und Responsive-Verhalten
- `app/api/contact/route.ts` — speichert Kontakt-/Builder-Anfragen in D1
- `app/admin/page.tsx` — interner Anfrage-Eingang
- `components/admin-inbox.tsx` — Admin-UI und Statusverwaltung
- `app/api/inquiries/route.ts` — geschütztes Lesen/Ändern der Anfragen
- `db/schema.ts` — D1/Drizzle-Schema
- `drizzle/0000_outgoing_dreadnoughts.sql` — Basistabelle
- `drizzle/0001_project_inbox.sql` — Status-Spalte
- `public/jx-studio-logo.svg` — Original-Branding aus den vorhandenen JX-Studio-Unterlagen

## 3. Installation / Start

```bash
pnpm install
pnpm dev
```

Production:

```bash
pnpm build
```

## 4. Öffentliche Bereiche

Die öffentliche Website ist derzeit als Single-Page-App innerhalb der Start-Route aufgebaut. Die Hauptansichten werden clientseitig umgeschaltet:

- Home
- Templates
- Leistungen
- Kontakt
- Website-Studio/Builder

Der interne Projekt-Eingang besitzt zusätzlich eine echte Route:

- `/admin`

## 5. Template-System

Es gibt 9 Branchen mit jeweils 3 Stilvarianten = 27 Templates:

- Handwerk
- Beauty
- Gastronomie
- Immobilien
- Fitness
- Automotive
- Reinigung
- Praxis
- Tattoo

Jede Branche besitzt ein eigenes `BranchProfile` mit:

- branchenspezifischem Kicker
- Hero-Copy
- 3 branchenspezifischen Leistungen
- Über-uns-Inhalt
- Referenzbezeichnungen
- Kundenstimme
- CTA
- branchenspezifischen Seitennamen

Die drei Templatevarianten unterscheiden sich zusätzlich über Layout und Typografie:

- `split`
- `editorial`
- `impact`

Damit sind die Templates nicht mehr nur dieselbe Demo mit ausgetauschtem Titel.

## 6. Template-Vorschau

Die Vorschau ist eine echte scrollbare Website-Darstellung und unterstützt:

- Seitenwechsel
- Desktop- und Mobile-Modus
- echte mobile Navigation mit Hamburger-Menü
- branchenspezifische Inhalte
- alle sichtbaren Sektionen des gewählten Templates

Auf Smartphones wird die Vorschau standardmäßig in Mobile geöffnet. Wird Desktop gewählt, erscheint ein Hinweis zum Querformat. Im Querformat wird die Desktop-Website verkleinert dargestellt.

## 7. Builder / Studio

Der Builder speichert einen `BuilderState` mit:

- Template bzw. Free-Builder-Modus
- Unternehmensname / Branche
- Designfarben
- Rundung / Spacing
- Schriftstil
- Button-Stil
- Hero-Ausrichtung
- Seiten
- Sektionen
- Add-ons
- Care/Express
- Hero-Content
- direkt bearbeiteten Texten

### Seiten

- auswählen
- umbenennen
- hinzufügen
- duplizieren
- löschen

### Sektionen

- hinzufügen
- Drag & Drop sortieren
- alternativ per Pfeilen sortieren
- duplizieren
- ausblenden/einblenden
- löschen

### Inhalte

- Hero-Felder im Panel bearbeiten
- Texte direkt in der Preview über `contentEditable` bearbeiten
- branchenspezifische Default-Copy bleibt als Grundlage erhalten
- Hero-Bild aus Branchenbildern wählen
- lokales Bild für Preview hochladen

### Design

- Akzentfarbe
- Sekundärfarbe
- dunkle Grundfarbe
- Oberflächenfarbe
- Textfarbe
- Radius
- vertikale Abstände
- Schriftstil
- Button-Stil
- Hero-Ausrichtung

### State / UX

- Autosave nach LocalStorage (`jx-studio-builder-v3`)
- Migration aus altem `jx-studio-builder-v1`-State
- Undo/Redo-History bis ca. 50 Schritte
- Live-Preview

## 8. Mobile Builder

Unter 760 px wird die Desktop-Sidebar nicht zusammengedrückt. Stattdessen:

- Preview steht im Mittelpunkt
- Werkzeuge öffnen als Bottom-Sheet
- Bottom Action Bar für „Bearbeiten“ und „Anfragen“
- Mobile-Vorschau ist Standard
- Mobile/Desktop-Switch bleibt erreichbar
- Desktop-Vorschau erhält Querformat-Hinweis

## 9. Free Builder

Über „Ohne Template frei starten“ wird der Builder mit einer neutralen Website-Struktur geöffnet. Er nutzt dieselbe professionelle Komponenten-/Sektionenbibliothek und das gleiche Responsive-System wie die Templates.

Das ist absichtlich kein pixelbeliebiges Canvas: Layoutzonen und Sektionen schützen das responsive Grundgerüst davor, durch freie Positionierung zerstört zu werden.

## 10. Anfrageflow

Beim Abschluss wird die Builder-Konfiguration zusammen mit Kontaktdaten an `/api/contact` geschickt.

Gespeichert werden u. a.:

- Kundendaten
- Nachricht
- geschätzter Preis
- Template / Free-Modus
- Seiten
- Sektionen
- Texte
- Designoptionen
- Add-ons
- Care/Express

Data-URL-Bilder aus lokalen Uploads werden vor dem Versand entfernt und als Hinweis markiert, damit die Datenbank nicht mit Base64-Dateien zugeschüttet wird.

## 11. Projekt-Eingang

`/admin` lädt Anfragen über `/api/inquiries`.

Schutz:

- Server-Env `JXSTUDIO_ADMIN_KEY`
- Client sendet den eingegebenen Schlüssel als `x-admin-key`
- ohne konfigurierte Env-Variable antwortet die API mit 503 und bleibt gesperrt

Statuswerte:

- Neu
- Kontaktiert
- Angebot
- In Arbeit
- Abgeschlossen
- Archiviert

## 12. Datenbank

`inquiries` enthält:

- id
- name
- email
- phone
- company
- subject
- message
- configuration (JSON als Text)
- estimated_price
- status
- created_at

Vorhandene Datenbanken benötigen `drizzle/0001_project_inbox.sql`.

## 13. Responsive-Logik

Geprüfte CSS-Breakpoints/Modi:

- Desktop > 1100 px
- Tablet/kleiner Desktop <= 1100 px
- Smartphone <= 760 px
- Smartphone Querformat separat für Desktop-Preview

Die SitePreview hat außerdem einen eigenen expliziten `device-mobile`-Modus. Dadurch hängt die Vorschau nicht nur von der Breite des äußeren Browsers ab.

## 14. Accessibility / UX

Implementiert bzw. verbessert:

- sichtbare Focus-States
- semantische Nav-Bereiche
- aria-labels an Icon-Buttons
- mobile Navigation mit `aria-expanded`
- Reduced-Motion-Unterstützung
- echte Formularlabels im Anfrageformular
- Scroll-Fortschritt
- aktive Navigation
- FAQ via native `details/summary`
- Nach-oben-Button
- Toast-Feedback

## 15. Noch vor echtem Launch zu erledigen

Diese Punkte brauchen reale Daten bzw. externe Infrastruktur und wurden nicht erfunden:

1. **Rechtstexte:** finales Impressum, Datenschutz, ggf. AGB/Widerruf mit echten Unternehmensdaten.
2. **Produktion-Env:** `JXSTUDIO_ADMIN_KEY` setzen.
3. **D1-Migration:** `0001_project_inbox.sql` auf Produktion anwenden.
4. **Datei-Uploads:** für echte Kundenbilder R2/S3/Storage anbinden. Lokale Preview-Uploads bleiben derzeit browserlokal.
5. **E-Mail-Benachrichtigung:** optional Resend/Postmark/etc. anschließen, wenn bei neuer Anfrage zusätzlich eine Mail gewünscht ist.
6. **Payment:** nur dann Stripe/PayPal anbinden, wenn aus der Projektanfrage später ein echter Direktkauf werden soll.

## 16. Qualitätssicherung in dieser Übergabe

Der Source wurde statisch auf TypeScript-/JSX-Syntax geprüft. Ein vollständiger Dependency-Install/Production-Build konnte in der Übergabeumgebung nicht ausgeführt werden, weil der Container keinen Netzwerkzugriff auf das npm-Registry hatte und die Projekt-Dependencies nicht vorinstalliert waren. Der nächste Rechner/Work-Run sollte deshalb als erstes ausführen:

```bash
pnpm install
pnpm build
```

Falls der bestehende D1-Stand lokal getestet werden soll, danach die beiden Migrationen in Reihenfolge anwenden.

## JX Studio Rebrand (V3)
- Sämtliche sichtbaren Joel-X-Web-Nennungen wurden auf **JX Studio** umgestellt.
- Neues Vektor-Logo: `public/jx-studio-logo.svg`
- Neues Icon/Favicon: `public/jx-studio-icon.svg`, `public/favicon.svg`
- Startseite erweitert um Trust-Kennzahlen, Warum-JX-Studio-Bereich, Builder-Showcase und Founder-Sektion.
- Kontaktadresse im Frontend: `J.schneider.05@gmx.net`.
- Formular-E-Mails werden im Testbetrieb serverseitig fest an `J.schneider.05@gmx.net` geroutet.
- Für realen E-Mail-Versand muss `RESEND_API_KEY` in `.env.local` gesetzt werden. `JXSTUDIO_FROM_EMAIL` kann nach Domain-Verifizierung auf eine JX-Studio-Adresse geändert werden.
- Lokale D1-Tabellen lassen sich mit `pnpm db:local:init` initialisieren.


## V4 Motion & KI
- Count-up-Vertrauenszahlen beim ersten Sichtkontakt.
- Laufender Leistungs-Marquee, subtile Ambient-Animationen und Microinteractions.
- JX Assistant als integrierte Support-/Lead-Demo. Die aktuelle lokale Version arbeitet regelbasiert; für freie generative Antworten muss vor Launch ein KI-Provider serverseitig angebunden werden.
- KI-Support & Lead-Chatbot ist als Builder-Add-on (+690 € Richtwert) und eigene Leistung ergänzt.

## Produktionsworkflow ergänzt
- Builder bietet jetzt zwei Wege: unverbindliche Anfrage oder direkte Beauftragung via Stripe Checkout.
- Zusatzleistungen im Builder: Domain & DNS Einrichtung (99 EUR) sowie Hosting & Live-Schaltung (149 EUR). Externe Providergebühren bleiben separat.
- Stripe benötigt STRIPE_SECRET_KEY und STRIPE_WEBHOOK_SECRET. Webhook: /api/stripe-webhook.
- Neue Tabelle `orders`; Migration `drizzle-pg/0001_jx_studio_orders.sql` vor Aktivierung des Checkouts ausführen.
- Admin kann für Builder-Anfragen über „Website-Code ZIP“ einen deterministischen, frameworkfreien Website-Export erzeugen. Export enthält index.html, styles.css, README und jx-configuration.json.
- Kontaktanfragen bleiben nach erfolgreichem DB-Insert erfolgreich, auch wenn der E-Mail-Versand temporär nicht funktioniert; Mailfehler werden geloggt.
- Domain-Produktionsanbindung: Custom Domain in Render hinzufügen, DNS beim Registrar setzen, Render-Verifizierung abwarten, PUBLIC_SITE_URL aktualisieren. Render verwaltet TLS automatisch.
- Vor öffentlichem Direktverkauf Rechtstexte/AGB/Datenschutz/Widerruf bzw. B2B-Ausrichtung juristisch finalisieren.
