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
