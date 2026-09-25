/** Keep the public estimate and the charged amount in one place. */
export const addonPrices: Record<string, number> = {
  shop: 900, booking: 350, blog: 250, languages: 280, copy: 320,
  seo: 290, portal: 1200, analytics: 190, ai: 690, domain: 99, deployment: 149,
};

export function projectPrice(config: { mode?: unknown; pages?: unknown; addons?: unknown; rush?: unknown }): number {
  const pages = Array.isArray(config.pages) ? config.pages.length : 0;
  const addons = Array.isArray(config.addons) ? [...new Set(config.addons)] : [];
  const extras = addons.reduce<number>((sum, key) => sum + (typeof key === "string" ? addonPrices[key] ?? 0 : 0), 0);
  const subtotal = (config.mode === "free" ? 1099 : 799) + Math.max(0, pages - 5) * 120 + extras;
  return config.rush ? Math.round(subtotal * 1.2) : subtotal;
}
