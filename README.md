# JX STUDIO – Design. Development. Digital Solutions.

Weiterentwicklung des bestehenden Next.js-Projekts, Stand 9. November 2026.
Kein Neuaufbau. Originaldesign, 27 Templates, visueller Builder, Assistant, Admin,
Portal, PostgreSQL-Strukturen und Praxis-Demo sind erhalten.

**Status: lokal geprüfter Release-Kandidat, noch nicht produktiv ausgerollt.**
Der Archivname `JX_STUDIO_FINAL_COMPLETE_2026.zip` bezeichnet die abschließende
Quellcodeübergabe dieser Arbeit, keine Zusicherung einer bereits abgenommenen
Produktion. Vor dem Rollout sind die Punkte in OPEN_ITEMS.md abzuarbeiten.

## Lokal starten

Voraussetzungen: Node 24.14.1 (getestet), pnpm 11.25.0, PostgreSQL für Datenbankfunktionen.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
# Lokale Datenbank und einen eigenen Admin-Schlüssel in .env.local eintragen.
pnpm dev
```

Die vorhandenen historischen Sites-Skripte bleiben erhalten. Für dieses Render-/Next.js-
Projekt ist der direkte pnpm-Aufruf vorgesehen; die Linux-Sites-Installationsskripte
sind kein notwendiger Teil des lokalen macOS-Starts.

```sh
pnpm exec tsc --noEmit
pnpm lint
node tests/request-body.mjs
pnpm build
pnpm start
```

`PUBLIC_SITE_URL=https://jx-studio.de` ist für produktive Indexierung erforderlich.
Ohne diese Variable sperrt robots.txt die Indexierung, sinnvoll für Testumgebungen.

## Projekt bedienen

- `/templates`: 27 vorhandene Vorlagen, neun Branchen, drei Varianten je Branche.
- `/builder`: Struktur, Inhalt, Design, Funktionen und Projektangaben. Desktop-, Laptop-,
  Tablet- und Mobilvorschau; Sections verschieben, Texte bearbeiten, Undo/Redo.
- Projektdatei sichern/laden: mehrere Projekte als getrennte JSON-Dateien verwalten.
  Browser-Autosave hält nur den aktuellen Entwurf; eine Projektdatei ist das unabhängige Backup.
- Website als ZIP: HTML/CSS-Entwurf inklusive Konfiguration und Exporthinweisen.
  Branchenmodule im Export sind Vorschauen und erfordern kundenspezifische Backend-Anbindung.
- Anfrage abschließen: vollständige Zusammenfassung, anschließend unverbindliches Formular.
- `/leistungen`: sechs Hauptleistungen und fünf individuell anfragbare Unternehmenslösungen.
- `/admin`: Zugangsschlüssel, Anfragen, Status, Termine und Projekte. „Als Projekt übernehmen“
  erstellt ein Projekt mit Portal-Link ohne Zahlung. Keine automatischen Kunden-E-Mails dabei.
- `/portal?token=…`: persönlicher Projektzugriff; Links vertraulich behandeln.
- `/praxis-demo`: bestehende externe Demo nach bewusstem Laden, als Konzept gekennzeichnet.

## Backend und Datenhaltung

Next.js Route Handler → Drizzle ORM → PostgreSQL. Datenbankschema: `db/schema.ts`.
SQL-Migrationen für die aktive Plattform: `drizzle-pg/0000…0008`.
`drizzle/` enthält ältere SQLite-/D1-Migrationen, `drizzle-postgres/` eine frühere
PostgreSQL-Variante. Sie bleiben erhalten, dürfen aber nicht blind zusätzlich eingespielt werden.
Das aktive SQL-Verzeichnis hat kein Drizzle-Migrationsjournal; `pnpm db:migrate`
ist deshalb keine verifizierte Produktionsanleitung. Siehe DEPLOYMENT.md.

Kontaktanfragen werden nur nach bestätigter Datenbankspeicherung als Erfolg gemeldet.
Resend-Benachrichtigungen benötigen einen eingerichteten und verifizierten Absender.
Ein Mailfehler nach erfolgreicher Speicherung erzeugt keinen erneuten Lead.
Ein dauerhafter Mail-Retry-/Outbox-Prozess ist noch nicht implementiert.

## Zahlungen und KI

Öffentliches `/api/checkout`: immer deaktiviert. Keine Sofortbestellung.
Interne Stripe-Webhooks: standardmäßig ebenfalls deaktiviert. Bestehender Code bleibt erhalten.
Zahlungsintegrationen für Kunden-Shops bleiben eine anfragbare Entwicklungsleistung.

Der Assistant funktioniert im Standardbetrieb als regelbasierter Projektberater.
Externe KI ist mit `JX_ASSISTANT_EXTERNAL_ENABLED=false` deaktiviert. Eine Aktivierung
benötigt Anbieterprüfung, aktualisierte Datenschutzhinweise und eine geprüfte Nutzerinformation.
Es sind keine verbindlichen Festpreise freigegeben; öffentlich erscheint „Individuelles Angebot“.

## Sicherungen und Wiederherstellung

Das Original stammt vom mit GitHub-main abgeglichenen Commit
`08058842034a1ca84b597816ef1ce24a0fe8d2b1`.
Die Arbeit liegt auf `development/final-completion-2026`.
Original, Zwischenstand und Abschlussstand sind separate ZIPs mit vollständigem Quellcode.
Nicht enthalten: node_modules, .next, echte .env-Dateien, Laufzeitdaten, Datenbankinhalte.
Die ZIPs ersetzen kein Produktions-Datenbankbackup. Externe Bilder und die extern gehostete
Praxis-Demo sind verlinkte Ressourcen, nicht lokal eingebettete Fremdprojekte.

Zum Wiederherstellen ein ZIP in einen **neuen** Ordner entpacken, Abhängigkeiten installieren,
lokale Umgebungsvariablen konfigurieren und testen. Niemals einen produktiven Ordner blind
überschreiben. Datenbank-Rollbacks nur anhand eines verifizierten Backups planen.

Die Markdown-Dokumente dieses Release-Stands sind maßgeblich. Ältere `JX_*.md`,
`LAUNCH_*.md` und `PROJECT_HANDOFF.md` bleiben als historische Dokumentation erhalten;
deren frühere Freigabe- oder Erfolgsaussagen sind keine aktuellen Testergebnisse.
