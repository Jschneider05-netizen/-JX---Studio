CREATE TABLE IF NOT EXISTS "inquiries" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text DEFAULT '' NOT NULL,
  "company" text DEFAULT '' NOT NULL,
  "subject" text DEFAULT 'Projektanfrage' NOT NULL,
  "message" text NOT NULL,
  "configuration" text,
  "estimated_price" integer,
  "status" text DEFAULT 'Neu' NOT NULL,
  "source" text DEFAULT 'contact' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "inquiries_created_at_idx" ON "inquiries" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "inquiries_status_idx" ON "inquiries" ("status");
