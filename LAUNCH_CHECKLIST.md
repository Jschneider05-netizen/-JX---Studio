# JX Studio – Launch Checkliste

- [ ] endgültige Domain setzen (`PUBLIC_SITE_URL`)
- [ ] `CONTACT_EMAIL` setzen
- [ ] `MAIL_FROM` mit verifizierter Absenderdomain setzen
- [ ] `RESEND_API_KEY` setzen
- [ ] `OPENAI_API_KEY` und `OPENAI_MODEL` setzen
- [ ] starken `JXSTUDIO_ADMIN_KEY` setzen
- [ ] Production-Datenbank anlegen und alle Migrationen 0000–0002 ausführen
- [ ] Impressum mit echten Unternehmensdaten finalisieren
- [ ] Datenschutz inkl. KI/Resend/Hosting finalisieren
- [ ] Kontaktformular mit echter E-Mail testen
- [ ] Builder-Anfrage testen
- [ ] KI-Lead bis zur finalen Bestätigung testen
- [ ] `/admin` Login und Statusänderung testen
- [ ] Smartphone Portrait + Landscape testen
- [ ] Desktop/Notebook testen
- [ ] Production Build in der Zielumgebung ausführen
- [ ] Secrets niemals committen

## Checkout, Domain und Generator
- [ ] `drizzle-pg/0001_jx_studio_orders.sql` auf Produktions-Postgres ausführen
- [ ] `STRIPE_SECRET_KEY` und `STRIPE_WEBHOOK_SECRET` in Render setzen
- [ ] Stripe Webhook auf `/api/stripe-webhook` registrieren und Testzahlung durchführen
- [ ] Domain bei Render als Custom Domain hinzufügen, DNS beim Registrar setzen und verifizieren
- [ ] `PUBLIC_SITE_URL` auf die echte HTTPS-Domain setzen
- [ ] Domain bei Resend verifizieren; `MAIL_FROM` auf verifizierte Absenderadresse ändern
- [ ] Admin: Anfrage laden, Status ändern und „Website-Code ZIP“ testen
- [ ] Preis für Domain/DNS (99 EUR) und Hosting/Live-Schaltung (149 EUR) vor Launch geschäftlich bestätigen oder anpassen
- [ ] Rechtstexte und Vertragsschluss für Direktzahlung final prüfen
