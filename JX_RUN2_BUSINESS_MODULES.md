# JX Studio Run 2 – Business Modules

Run 2 expands the customer requirements engine so selected business functions are configured before the order is completed.

Implemented configuration models and Builder editors:

- Real estate: listings, transaction type, price, area, rooms, location, status, image/exposé references, viewing requests and recipient.
- Fitness: classes, trainers, schedules, duration, capacity, price, trial training and waitlist.
- Commerce: provider, recipient, products, categories, descriptions, prices, stock, variants, shipping and payment methods.
- Automotive: service catalog, durations, prices, request types, vehicle fields, uploads and service area.
- Handwerk/Reinigung service requests: service choices, area, budget/date questions and uploads.
- Vouchers: preset values, custom amounts, validity and recipient.
- Newsletter: provider, list, double opt-in and success message.

All modules participate in completeness validation and are preserved in the SiteConfig / immutable order snapshot. Builder preview, static export and Admin order summary expose the configured module data.

Pricing note: unpriced business modules remain quote-only. The existing priced Shop add-on keeps its current price behavior, but still requires complete product/provider data before direct checkout.
