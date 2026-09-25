ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS request_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS inquiries_request_id_unique ON inquiries(request_id);
