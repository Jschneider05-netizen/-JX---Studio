CREATE TABLE IF NOT EXISTS projects (
 id SERIAL PRIMARY KEY, order_id INTEGER, customer_email TEXT NOT NULL DEFAULT '', name TEXT NOT NULL DEFAULT 'JX Studio Projekt',
 status TEXT NOT NULL DEFAULT 'draft', configuration TEXT NOT NULL DEFAULT '{}', version INTEGER NOT NULL DEFAULT 1,
 approval_status TEXT NOT NULL DEFAULT 'pending', portal_token TEXT NOT NULL UNIQUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS projects_customer_email_idx ON projects(customer_email);
CREATE TABLE IF NOT EXISTS project_versions (
 id SERIAL PRIMARY KEY, project_id INTEGER NOT NULL, version INTEGER NOT NULL, configuration TEXT NOT NULL, note TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS project_versions_project_idx ON project_versions(project_id,version);
CREATE TABLE IF NOT EXISTS invoices (
 id SERIAL PRIMARY KEY, order_id INTEGER, stripe_invoice_id TEXT UNIQUE, customer_email TEXT NOT NULL DEFAULT '', amount INTEGER NOT NULL DEFAULT 0,
 currency TEXT NOT NULL DEFAULT 'eur', status TEXT NOT NULL DEFAULT 'open', hosted_url TEXT, pdf_url TEXT, period_start TIMESTAMPTZ, period_end TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
