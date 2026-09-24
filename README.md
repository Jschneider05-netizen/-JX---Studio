# JX Studio — Studio Build

Weiterentwickelte JX-Studio-Plattform mit 27 branchenspezifischen Templates, interaktiver Vorschau, visuellem Website-Studio, responsiver Mobile-/Desktop-Logik und internem Projekt-Eingang.

## Was jetzt enthalten ist

- dunkle JX-Studio-Designsprache mit Original-Branding
- Sticky Header mit Scroll-Fortschritt und aktiver Navigation
- 27 Templates in 9 Branchen, je 3 Stilrichtungen
- branchenspezifische Inhalte, Leistungen, Reviews, Seitenbezeichnungen und CTAs
- echte scrollbare Template-Vorschau mit Seitenwechsel
- automatische Mobile-Vorschau auf Smartphones
- Mobile/Desktop-Umschalter; Desktop auf Smartphone mit Querformat-Hinweis
- visueller Builder mit Seitenverwaltung
- Sektionen hinzufügen, verschieben (Drag & Drop + Pfeile), duplizieren, ausblenden und löschen
- direkte Textbearbeitung in der Website-Vorschau
- Design-System mit freien Farben, Typografie, Abständen, Rundung, Button-Stilen und Hero-Ausrichtung
- Bildauswahl sowie lokaler Bild-Upload für die Vorschau
- Undo/Redo und Autosave im Browser
- freier Builder ohne Template
- dynamische Preisberechnung und Add-ons
- Anfrageübergabe inklusive vollständiger Website-Konfiguration
- D1-Projekt-Eingang unter `/admin` mit Statusverwaltung
- Interactive Design Demo, FAQ, Scroll-Reveals und Nach-oben-Button
- Smartphone-Builder als Bottom-Sheet statt zusammengestauchter Desktop-Sidebar

## Installation

```bash
pnpm install
pnpm dev
```

## Produktions-Build

```bash
pnpm build
```

## Datenbank

Die Cloudflare-D1-Bindung heißt `DB` und ist in `.openai/hosting.json` hinterlegt.

Migrationen:

- `drizzle/0000_outgoing_dreadnoughts.sql` — erstellt `inquiries`
- `drizzle/0001_project_inbox.sql` — ergänzt den Anfrage-Status

Die Migrationen müssen in Produktion angewendet werden, bevor der Projekt-Eingang verwendet wird.

## Interner Projekt-Eingang

Der Eingang ist unter `/admin` erreichbar und bleibt ohne serverseitigen Schlüssel gesperrt.

Setze in der Hosting-Umgebung:

```env
JXSTUDIO_ADMIN_KEY=ein-langer-zufaelliger-schluessel
```

Eine Vorlage liegt in `.env.example`.

Der Schlüssel wird nur gegen die Server-Umgebungsvariable geprüft. Er ist nicht im Client-Code hinterlegt.

## Wichtige Hinweise vor dem öffentlichen Launch

- Impressum, Datenschutz und ggf. AGB/Widerruf müssen mit den finalen realen Unternehmensdaten eingebunden werden. Diese personenbezogenen/rechtlichen Angaben waren im übergebenen Projekt nicht enthalten und wurden deshalb nicht erfunden.
- Ein lokaler Bild-Upload im Builder dient der Vorschau. Data-URLs werden bewusst nicht in die Anfrage-Datenbank geschrieben; für echte Kunden-Uploads sollte später R2/S3 oder ein vergleichbarer Storage angebunden werden.
- Zahlungsabwicklung ist bewusst nicht simuliert. Der derzeitige Flow endet in einer verbindlich strukturierten Projektanfrage.
- Für den Projekt-Eingang muss die D1-Migration `0001_project_inbox.sql` angewendet werden.

Weitere technische Details stehen in `PROJECT_HANDOFF.md`.

## Test-E-Mails
Alle Formularanfragen sind im Testbetrieb fest auf `J.schneider.05@gmx.net` geroutet. Für echten Versand `RESEND_API_KEY` in `.env.local` setzen. Ohne API-Key bleibt das Formular testbar, meldet serverseitig aber, dass keine E-Mail versendet wurde.

Lokale Anfrage-Datenbank einmalig initialisieren:

```bash
pnpm db:local:init
```


### V4
Enthält Motion-System, animierte Trust-Kennzahlen, Marquee und JX Assistant. Der Assistent ist bewusst als sichere lokale Demo implementiert. Für produktive freie KI-Antworten API serverseitig ergänzen.

## Launch-Vorbereitung V5
1. `pnpm install`
2. `pnpm db:local:init` (lokal einmalig, damit `/admin` Anfragen speichern kann)
3. `.env.example` nach `.env.local` kopieren und Testwerte setzen.
4. `OPENAI_API_KEY` aktiviert den echten JX Assistant. Ohne Key bleibt ein eingeschränkter Fallback aktiv.
5. `RESEND_API_KEY` aktiviert den E-Mail-Versand. Testempfänger ist aktuell `J.schneider.05@gmx.net` in `app/api/contact/route.ts`.
6. `pnpm dev`, dann `/`, `/admin`, Builder, Kontaktformular und JX Assistant testen.

Der JX Assistant führt natürliche Beratungsgespräche, zeigt einen Typing-State, sammelt Projektkontext, bietet bei ausreichenden Informationen eine Übergabe an den Projektleiter an und sendet bestätigte KI-Leads über denselben Anfrage-Endpunkt wie Formulare/Builder. Verbindliche Angebote werden weiterhin persönlich geprüft.

## Launch-Umgebungsvariablen
Siehe `.env.example`. `CONTACT_EMAIL` steuert den Empfänger, `MAIL_FROM` den verifizierten Resend-Absender, `OPENAI_MODEL` das serverseitige Modell. Secrets gehören ausschließlich in die Hosting-Umgebung.

## Datenbank
Lokal: `pnpm db:local:init`. Für Production müssen die Migrationen `drizzle/0000_outgoing_dreadnoughts.sql`, `0001_project_inbox.sql` und `0002_inquiry_source.sql` in Reihenfolge ausgeführt werden.

## Wichtiger Launch-Hinweis
Impressum und Datenschutz sind vor einem öffentlichen deutschen Production-Launch mit den echten Unternehmens-, Hosting-, Mail- und KI-Daten final zu prüfen. Diese Projektversion erfindet bewusst keine rechtlichen Angaben.

## Render / Node deployment
Für Render wurde der Production-Pfad auf natives Next.js/Node umgestellt. Verwende:

- Build Command: `npx pnpm@11.25.0 install --frozen-lockfile && npx pnpm@11.25.0 build`
- Start Command: `npx pnpm@11.25.0 start`
- Root Directory: leer

Render stellt `PORT` automatisch bereit; `next start` übernimmt diese Umgebungsvariable.
Die frühere Cloudflare-D1-Anbindung ist im Node-Runtime bewusst deaktiviert, damit sie den Webserver nicht mehr über Wrangler/Workerd startet. Kontaktanfragen können mit `RESEND_API_KEY` weiterhin per E-Mail zugestellt werden. Für den persistenten `/admin`-Posteingang ist als nächster Infrastruktur-Schritt eine Production-Datenbank (z. B. Render Postgres) anzubinden.

## V6 workflow foundation
V6 introduces the guided-consultation path, industry-function modules, premium project checkout, recurring JX Care billing foundation (Stripe card/SEPA), billing webhook states and the architecture contract for a shared SiteConfig/runtime compiler. See `JX_V6_ARCHITECTURE.md`.

Before production billing, apply `drizzle-pg/0002_jx_studio_billing.sql`, configure Stripe production keys/webhook, and complete legal/tax/invoice settings. PayPal is intentionally not shown as active until a production provider is connected and tested.
