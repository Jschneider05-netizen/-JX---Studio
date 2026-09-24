CREATE TABLE IF NOT EXISTS "orders" (
  "id" serial PRIMARY KEY NOT NULL,
  "stripe_session_id" text NOT NULL,
  "customer_email" text DEFAULT '' NOT NULL,
  "amount" integer NOT NULL,
  "currency" text DEFAULT 'eur' NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "configuration" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "orders_stripe_session_id_idx" ON "orders" ("stripe_session_id");
