# JX STUDIO – Originaldesign und Konfigurator wiederhergestellt

Ausgangspunkt: unverändertes JX_Studio_ORDER_FLOW_RUN2(4).zip. Alle bestehenden Templates, Builder, Navigation, Services, Assistant- und Admin-Dateien bleiben erhalten.

Gezielte Änderungen:
- Im Abschlussdialog ausschließlich direkte Online-Bezahlung entfernt; Konfigurationsanfrage bleibt erhalten.
- `/api/checkout` liefert unabhängig von Environment-Variablen dauerhaft 503 bei POST und `enabled:false` bei GET. Kein Stripe-Checkout möglich.
- Impressum und Datenschutz als eigene Routen ergänzt und im alten Footer verlinkt.
- Kontakt-E-Mail im ursprünglichen Footer und Kontaktbereich fest auf kontakt@jx-studio.de gestellt.
- Kein Umbau der Startseite, Template-Bibliothek, des Builders oder Navigation.

WICHTIG: Vor Produktionsfreigabe Produktiv-Build und echte Kontakt-Anfrage samt PostgreSQL/Resend prüfen; Rechtstexte mit tatsächlich verwendeten Anbietern, Speicherung und steuerlichen Angaben finalisieren. Keine Migrationen automatisch ausführen. Für Render den bestehenden GitHub-Workflow verwenden, ohne `.env`-Geheimnisse zu ersetzen.
