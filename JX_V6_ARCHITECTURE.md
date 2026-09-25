# JX Studio V6 — Production Workflow Foundation

> Historischer Projektstand. Für den aktuellen Lieferstand und die Launch-Schritte gelten `README.md`, `JX_STUDIO_FINAL_RELEASE.md` und `LAUNCH_CHECKLIST.md`.


## Non-negotiable rule
Builder preview and production output must consume the same canonical `SiteConfig` and the same rendering primitives. The generator must not reinterpret design decisions. The current legacy HTML exporter remains only as a compatibility path until the shared runtime/compiler replaces it.

## Product paths
1. Self-service: onboarding → template/blank → builder → functions → checkout → production.
2. Guided: appointment → lead/draft → shared builder session → checkout → production.
3. Custom: qualified inquiry → scoped project → builder/project workspace → production.

## Canonical project model
`SiteConfig` owns design tokens, pages, section/component tree, content, responsive overrides, animations/interactions, assets, industry modules, integrations, SEO, commerce and deployment settings. Every object receives a stable ID. Drafts are versioned.

## Industry engines
Templates are presentation presets. Industry engines supply real business logic. Restaurant: menu, tables, capacity, opening hours, reservation duration, party size, availability, cancellation. Beauty/Tattoo: services, staff/artists, duration, working hours, buffers, booking. Real estate: listings, filters, exposés, viewing appointments. Fitness: classes, trainers, capacity, trials. Automotive: inventory/service slots. Trade/Cleaning: structured quote/configuration flows. Medical flows must minimize sensitive data and receive a separate privacy/security review.

## Rendering/compiler target
`SiteConfig -> JX Runtime -> Builder Preview / Production Runtime`. Export packages the same runtime with editor chrome removed. Visual regression compares preview and production at desktop/tablet/mobile and blocks release above tolerance.

## Operations
Paid order creates project → immutable order snapshot → runtime build → module provisioning → QA → preview deployment → JX review → customer approval → production. Admin owns leads, appointments, orders, projects, versions, domains, deployments, billing and incidents. Customer portal owns project status, approvals, content, business modules and billing.

## Billing
One-time projects use Checkout payment mode. JX Care uses subscription mode with recurring monthly billing. Current implementation prepares Stripe card/SEPA recurring checkout and webhook states. Automated invoice delivery/tax/legal wording must be finalized with production Stripe settings and business/tax data. PayPal is a provider adapter target and must not be presented as active until a production provider is connected and tested.

## Appointment target
Availability rules + exceptions + blocked dates + appointment types + atomic slot booking + reschedule/cancel + reminders + meeting link + lead/draft-project creation. The V6 UI exposes the guided path now; persistent scheduling is the next backend module.

## Release gates
Build, TypeScript, links, forms, responsive overflow, accessibility, SEO, performance, security basics, module integration tests, visual regression, preview approval, production deploy and monitoring.

## V6.1 canonical visual export implemented

The legacy standalone export stylesheet has been removed from `/api/generate-site`.
The production ZIP now consumes `public/jx-studio-runtime.css`, the exact CSS contract used by the Builder preview, and emits the same `site-preview`, `pv-*`, `jx-config-section`, animation, layout, button and hero classes.

Builder submissions snapshot both `resolvedContent` and `resolvedImages`. This prevents production output from re-interpreting a branch later. The saved SiteConfig is the canonical project snapshot.

Remaining path toward full compiler architecture: replace static HTML packaging with a generated Next.js project, add responsive breakpoint overrides to SiteConfig, add business modules, and add automated screenshot regression gates. Visual rendering must continue to use the shared runtime contract.
