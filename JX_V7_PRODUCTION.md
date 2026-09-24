# JX Studio V7 Production Candidate

## Kernregel
SiteConfig ist die einzige Quelle der Wahrheit. Preview, Code-Compiler und Export dürfen keine unabhängigen Designentscheidungen treffen.

## Enthalten
- Canonical Runtime aus V6.1
- Responsive Breakpoint-Modell (Desktop, Laptop, Tablet, Mobile Landscape, Mobile)
- Live-Code-Compiler API und Code-Panel im Builder
- Branchenmodul-Registry für Reservierung, Termine, Immobilien, Fitness, Konfiguratoren, Commerce und KI
- JX Beratungs-Terminmodell mit Availability + Appointment API und Admin-Availability API
- bestehender hochwertige Checkout + JX Care Subscription/SEPA Grundlage
- bestehende Stripe Webhook/Billing Grundlage

## Vor Produktion
- Migration 0003 kontrolliert auf Produktions-DB anwenden
- Stripe Live-Produkte, Steuer/Rechnungsdaten und Customer Portal finalisieren
- PayPal Business Provider erst mit echten Credentials aktivieren
- Termin-E-Mail/Meeting-Link Provider verbinden
- echte Branchenmodule schrittweise an Datenmodelle/Backends anbinden
- Visual Regression mit Browser-Screenshot-Runner in CI/Deployment ergänzen
- Rechtstexte/Consent/AVV je nach aktivierten Modulen final prüfen

## Architektur
Customer -> Builder/Consultation -> SiteConfig -> Canonical Runtime -> Compiler -> QA -> Preview -> Approval -> Production


## V7.1 Operations hardening
- Internal appointments API with protected listing/status workflow.
- Admin operations overview for leads, paid orders and consultations.
- Booking integrity migration adds active-slot uniqueness and lookup indexes.
- Migration 0004 is intentionally not auto-applied; production DB history must be reconciled first.
