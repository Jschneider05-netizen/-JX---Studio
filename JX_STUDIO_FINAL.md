# JX Studio FINAL

This is the consolidated master. No fake provider activation is included.

## Product flow
Discovery / template / consultation -> canonical SiteConfig -> same runtime/compiler -> checkout -> Stripe webhook -> project + version -> admin operations -> customer portal approval -> deployment.

## Builder
Easy, Advanced and JX Pro modes; pages/sections; inline content; section styling; breakpoint overrides; animation configuration; undo/redo; live compiler/code output. Canonical config is retained through inquiry/order/export.

## Production parity
`compileCode` emits a self-contained production runtime, config, CSS and QA manifest. Responsive overrides are emitted from the same config. `jx-qa-manifest.json` defines screenshot breakpoints for visual regression automation.

## Business engine
Registry and executable data-model plans cover restaurant reservations/menu, appointments (beauty/tattoo/practice), fitness, real estate, hotel, automotive and commerce. JX Studio consultation appointments already have DB/API/admin flow and duplicate-booking protection. Provider adapters can be connected without changing the product model.

## Projects / portal / billing
Migration 0005 adds projects, immutable project versions and invoices. Successful Stripe checkout creates a project and first version. Subscription invoice webhooks persist invoice metadata. Tokenized customer portal exposes project status, approval and invoices. Admin project API supports status, approval and versioned configuration updates.

## Before live traffic
Review and apply migrations 0002-0005 against a backed-up production database; configure Stripe + signed webhook; verify Resend sending domain; configure final domain/DNS/SSL; replace temporary legal/tax copy with reviewed business details; upgrade/move any expiring free production database; set strong admin secret and production environment variables. PayPal/Shopify stay inactive until real provider credentials are supplied.
