# JX Studio

Bestehende Next.js-Produktionsanwendung mit 27 Template-Varianten aus neun Branchen, Website-Builder, Projektanfragen, Beratungsterminen, Adminbereich und Kundenportal. Das Projektverzeichnis heißt `JX_Studio_FINAL`.

## Lokal starten

Node.js >= 22.13 und pnpm 11.25 verwenden:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm exec tsc --noEmit
pnpm lint
```

Für Render: Build `pnpm install --frozen-lockfile && pnpm build`, Start `pnpm start`. Secrets ausschließlich als Server-Umgebungsvariablen hinterlegen, siehe `.env.example`.

## Datenbank und externe Aktivierung

Die Anwendung verwendet PostgreSQL über `DATABASE_URL`. Die SQL-Dateien `drizzle-pg/0000_jx_studio_postgres.sql` bis `0007_jx_studio_order_integrity.sql` in Reihenfolge auf einer vorher gesicherten Datenbank anwenden. Bei einer bestehenden Datenbank das Schema und Migrationsjournal vor Anwendung abgleichen. Terminbuchung, persistente Leads, Projektportal und Stripe-Aufträge benötigen die Datenbank.

`JXSTUDIO_ADMIN_KEY` schützt `/admin` und den Website-ZIP-Export. `CONTACT_EMAIL`, `MAIL_FROM` und `RESEND_API_KEY` aktivieren Benachrichtigungen. Ohne E-Mail-Konfiguration können Anfragen nur bei erfolgreicher Datenbank-Speicherung angenommen werden. `OPENAI_API_KEY` und `OPENAI_MODEL` aktivieren freie KI-Antworten; ohne diese nutzt der Assistent einen begrenzten regelbasierten Ablauf.

Direktzahlung bleibt deaktiviert, bis `DIRECT_CHECKOUT_ENABLED=true`, Stripe-Schlüssel, Webhook-Secret, Datenbank und gültige HTTPS-URLs für Vertragsbedingungen und Datenschutz vorliegen. Webhook-Endpunkt: `/api/stripe-webhook`. Nach Stripe-Testzahlung Projektanlage, Portal-Einladung, Beträge und Rechnungen auf der Zielumgebung prüfen. Reale Domain, E-Mail-Absenderdomain, Impressum, Datenschutz, Steuerdaten und AGB müssen vor dem öffentlichen Launch ergänzt und geprüft werden. Weitere Schritte in `LAUNCH_CHECKLIST.md`.

## Builder und Export

Der Builder hält die SiteConfig als zentrale Konfiguration und speichert lokale Entwürfe im Browser. `/api/compile-site` und der geschützte ZIP-Export unter `/api/generate-site` verwenden dieselbe `buildSiteFiles`-Funktion und die eigenständige CSS-Runtime `public/jx-studio-runtime.css`. Die interaktive Vorschau wird in React gerendert, während der Export HTML aus derselben SiteConfig erzeugt: eine pixelgenaue Gleichheit aller Browser und aller erweiterten Builder-Einstellungen ist damit noch nicht garantiert.

Der ZIP-Export ist eine statische Beispielwebsite. Die Kontaktfläche wird nach Eintrag einer E-Mail zu einem `mailto:`-Link; ein serverseitiges Kundenformular, Online-Buchung, Shop und branchenbezogene Module sind im statischen Export nicht automatisch aktiv. Externe Bilder sind nicht in der ZIP eingebettet. Beispielprojekte und -bewertungen müssen vor einer Kundenveröffentlichung durch belegbare Inhalte ersetzt werden. Rechtstexte, eigene Domain und echte Geschäftsdaten gehören in jede veröffentlichte Kundenwebsite.

Das Kundenportal zeigt Projektstatus, Versionen, Freigaben und vorhandene Stripe-Rechnungen. Inhalte, Domain und Support werden derzeit persönlich koordiniert und sind nicht als abgeschlossene Self-Service-Funktionen dargestellt.

## Sicherheits- und Betriebsnotizen

Administrative Aktionen benötigen den serverseitig geprüften Schlüssel. Stripe-Webhooks prüfen HMAC-Signatur und Zeitstempel; Datenbanktransaktionen schützen Buchungen und Projektversionen. Das einfache API-Rate-Limit ist pro Prozess und für einen Mehrinstanzbetrieb kein zentraler Ersatz für ein Gateway oder Redis. Portal-Links enthalten einen geheimen Zugriffstoken und müssen vertraulich weitergegeben werden. Die endgültige Produktionsabnahme und externe Integrationsprüfung stehen in `LAUNCH_CHECKLIST.md`.
