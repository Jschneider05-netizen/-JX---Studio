-- Apply only after reviewing the current production migration state.
-- Prevents two active bookings from owning the exact same start time.
CREATE UNIQUE INDEX IF NOT EXISTS appointments_active_start_unique
ON appointments (starts_at)
WHERE status IN ('booked','confirmed');
CREATE INDEX IF NOT EXISTS appointments_status_start_idx ON appointments(status, starts_at);
CREATE INDEX IF NOT EXISTS availability_status_start_idx ON availability(status, starts_at);
