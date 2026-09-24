ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "stripe_subscription_id" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "invoice_status" text NOT NULL DEFAULT 'not_applicable';
CREATE INDEX IF NOT EXISTS "orders_stripe_subscription_idx" ON "orders" ("stripe_subscription_id");
