# JX Studio V5 – Launch-Check

> Historischer Projektstand. Für den aktuellen Lieferstand und die Launch-Schritte gelten `README.md`, `JX_STUDIO_FINAL_RELEASE.md` und `LAUNCH_CHECKLIST.md`.


## Lokal
```bash
pnpm install
pnpm db:local:init
cp .env.example .env.local
pnpm dev
```

## Für echten Testbetrieb eintragen
- `RESEND_API_KEY`: E-Mail-Versand
- `OPENAI_API_KEY`: echter JX Assistant
- `JXSTUDIO_FROM_EMAIL`: später Absender der eigenen Domain
- `JXSTUDIO_ADMIN_KEY`: vor öffentlichem Betrieb ändern

Aktueller Testempfänger: `J.schneider.05@gmx.net`.

## Vor Veröffentlichung testen
- Startseite Desktop + Smartphone
- Templates und Vorschau
- Builder inkl. Anfrage
- Kontaktformular
- JX Assistant: freie Fragen, Tippen-Animation, Gesprächskontext, Lead-Übergabe
- `/admin`: neue Anfrage sichtbar
- Testmail angekommen

Rechtstexte/Datenschutz werden bewusst separat finalisiert, sobald Hosting, Domain, endgültige Kontaktadresse und eingesetzte Dienste feststehen.
