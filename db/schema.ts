import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  company: text("company").notNull().default(""),
  subject: text("subject").notNull().default("Projektanfrage"),
  message: text("message").notNull(),
  configuration: text("configuration"),
  estimatedPrice: integer("estimated_price"),
  status: text("status").notNull().default("Neu"),
  source: text("source").notNull().default("contact"),
  requestId: text("request_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  stripeSessionId: text("stripe_session_id").notNull(),
  customerEmail: text("customer_email").notNull().default(""),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("eur"),
  status: text("status").notNull().default("pending"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  invoiceStatus: text("invoice_status").notNull().default("not_applicable"),
  configuration: text("configuration").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  company: text("company").notNull().default(""),
  projectType: text("project_type").notNull().default("Website"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(45),
  status: text("status").notNull().default("booked"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id"),
  customerEmail: text("customer_email").notNull().default(""),
  name: text("name").notNull().default("JX Studio Projekt"),
  status: text("status").notNull().default("draft"),
  configuration: text("configuration").notNull().default("{}"),
  version: integer("version").notNull().default(1),
  approvalStatus: text("approval_status").notNull().default("pending"),
  portalToken: text("portal_token").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectVersions = pgTable("project_versions", {
  id: serial("id").primaryKey(), projectId: integer("project_id").notNull(), version: integer("version").notNull(),
  configuration: text("configuration").notNull(), note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(), orderId: integer("order_id"), stripeInvoiceId: text("stripe_invoice_id"),
  customerEmail: text("customer_email").notNull().default(""), amount: integer("amount").notNull().default(0),
  currency: text("currency").notNull().default("eur"), status: text("status").notNull().default("open"),
  hostedUrl: text("hosted_url"), pdfUrl: text("pdf_url"), periodStart: timestamp("period_start", {withTimezone:true}),
  periodEnd: timestamp("period_end", {withTimezone:true}), createdAt: timestamp("created_at", {withTimezone:true}).notNull().defaultNow(),
});
