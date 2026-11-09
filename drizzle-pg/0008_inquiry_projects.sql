-- Additive only. Back up the existing database before applying.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS inquiry_id INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS projects_inquiry_id_unique ON projects(inquiry_id) WHERE inquiry_id IS NOT NULL;
