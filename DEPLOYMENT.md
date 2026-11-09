# Deployment und Wiederherstellung

## Bestehende Infrastruktur bewahren

Repository: https://github.com/Jschneider05-netizen/-JX---Studio
Produktionsbranch: main. Ziel: vorhandener Render-Service, vorhandene Domain jx-studio.de,
vorhandene PostgreSQL-Datenbank jx-studio-db. Diese Arbeit hat keinen Produktionsrollout,
keinen Push auf main und keine Änderung produktiver Daten durchgeführt.

`render.yaml` beschreibt die vorgesehenen Build-/Start-/Env-Einstellungen. Nicht blind
als neuen Blueprint importieren: der tatsächlich vorhandene Service und seine Region,
Ressourcen, Domain und Datenbankzuordnung müssen beibehalten werden.

## Vor dem Rollout

1. Neueste main-Änderungen erneut vergleichen; diese Arbeit basiert auf `0805884`.
2. Render-Konfiguration und Umgebungsvariablen prüfen, ohne Geheimnisse in Git oder Chats zu kopieren.
3. Ein konsistentes Backup der produktiven PostgreSQL-Datenbank erstellen, verschlüsselt ablegen
   und eine Wiederherstellung in einer separaten Testdatenbank prüfen. Kein Kundendaten-Dump in ZIPs.
4. Bestehenden SQL-Migrationsstand gegen das tatsächliche Schema prüfen.
5. Code und Migrationen zuerst gegen eine separate Render-/PostgreSQL-Testumgebung validieren.
6. OPEN_ITEMS.md prüfen; insbesondere E-Mail-Zustellung, rechtliche Freigabe und Live-Providerdaten.

## Migrationen

Aktiv: `drizzle-pg` (PostgreSQL). Vorhanden sind 0000 Basisanfragen, 0001 Aufträge,
0002 Billing, 0003 Termine, 0004 Buchungsintegrität, 0005 Projekte/Portal/Rechnungen,
0006 Anfrage-Idempotenz, 0007 Order-Integrität und neu 0008 Anfrage→Projekt.
Die neue Migration ergänzt lediglich `projects.inquiry_id` und einen partiellen Unique-Index.
Sie entfernt keine Tabellen, Spalten oder Daten.

Die Bestandsmigrationen sind handgeschriebene SQL-Dateien ohne Drizzle-Journal. Daher
kein ungeprüftes `db:push` oder `drizzle-kit migrate` gegen Produktion ausführen.
Bei bereits vollständig migrierter Basis nach Backup und Schemaabgleich:

```sh
psql "$DATABASE_URL" --set ON_ERROR_STOP=1 --single-transaction \
  --file drizzle-pg/0008_inquiry_projects.sql
```

Eine leere Testdatenbank benötigt die SQL-Dateien 0000–0008 in numerischer Reihenfolge.
Alle neun Dateien wurden in einer isolierten PGlite-Instanz angewendet. Das ist kein
Nachweis für den Migrationszustand von Render und kein nativer Mehrverbindungstest.
Bestehende doppelte Datensätze können historische Unique-Index-Migrationen verhindern;
solche Konflikte analysieren, nicht automatisch löschen.

## Build und Runtime

- Node 24.14.1, pnpm 11.25.0.
- Build: `corepack enable && pnpm install --frozen-lockfile && pnpm build`
- Start: `pnpm start` (Next respektiert Render PORT).
- PUBLIC_SITE_URL: `https://jx-studio.de`.
- DATABASE_URL: vorhandene Render-Datenbank, Zugriff ausschließlich serverseitig.
- JXSTUDIO_ADMIN_KEY: eigener starker Schlüssel aus der Secret-Verwaltung.
- RESEND_API_KEY, MAIL_FROM: verifizierter Resend-Absender; CONTACT_EMAIL=`kontakt@jx-studio.de`.
- DATABASE_POOL_MAX: optional, Standard 5; nur für die lokale PGlite-QA wurde 1 verwendet.
- JX_ASSISTANT_EXTERNAL_ENABLED=false; JX_INTERNAL_BILLING_ENABLED=false.
- Keine automatische Migration im Build oder beim Serverstart.

## Git-Übergabe

Die Änderungen sind lokal auf dem Entwicklungsbranch committet. Vor einer Übernahme:
Diff prüfen, Checks wiederholen, einen Review-Branch/PR verwenden. Kein Force-Push.
Der Produktionsbranch wurde nicht verändert. Der Release-Kandidat wird erst nach
bestandener Stagingprüfung kontrolliert in main übernommen.

## Abnahme nach kontrolliertem Deployment

HTTPS und Canonicals, robots/sitemap, sämtliche Hauptseiten, Konfigurator-Anfrage,
PostgreSQL-Datensatz, Adminanzeige, tatsächliche Mailzustellung, Terminbuchung,
Portalzugriff sowie serverseitige Fehler-/Zugriffslogs prüfen. Testdaten eindeutig kennzeichnen
und nur im freigegebenen Testkontext verwenden. Nie Logs mit Zugangsdaten exportieren.

## Rollback

Vorherigen Render-Deploy bzw. vorherigen Git-Commit wieder ausrollen. Die additive Spalte
kann bei Code-Rollback bestehen bleiben; nicht durch eine destruktive Down-Migration löschen.
Wenn ein Datenrollback nötig ist, zuvor aktuellen Datenstand sichern und Auswirkungen auf
zwischenzeitlich eingegangene Kundenanfragen prüfen. Ein Quellcode-ZIP enthält keine Kundendaten.
