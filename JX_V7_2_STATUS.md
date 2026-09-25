# JX Studio V7.2 Production Candidate

> Historischer Projektstand. Für den aktuellen Lieferstand und die Launch-Schritte gelten `README.md`, `JX_STUDIO_FINAL_RELEASE.md` und `LAUNCH_CHECKLIST.md`.


Implemented in this pass:
- Canonical builder/runtime/compiler remains the source of truth.
- Easy / Advanced / JX Pro editor modes.
- Breakpoint-specific responsive overrides in the builder.
- Live compiler/code panel retained and promoted to JX Pro.
- Real consultation availability now loads from `/api/appointments` instead of fake example slots.
- Consultation booking writes to the appointments backend and is protected against duplicate active start times by migration 0004.
- Expanded business module registry: bookings, menu, commerce, AI, hotel, vouchers, newsletter, reviews, customer portal.
- Existing Stripe checkout, JX Care subscription foundation, webhook, admin operations and canonical export retained.

External activation still required: production DB migrations after review, Stripe keys/webhook, verified mail domain, final domain/DNS, legal/tax text and PayPal Business/API if PayPal is desired. These are intentionally not faked in source.
