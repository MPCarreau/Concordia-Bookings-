-- Schema additions for booking approval workflow

-- Simple key-value settings table
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Booking requests table to hold pending approvals
CREATE TABLE IF NOT EXISTS booking_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resource_id INTEGER NOT NULL,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  requested_by_user_id INTEGER NOT NULL,
  booking_purpose TEXT NULL,
  booking_contact TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME NULL,
  rejected_at DATETIME NULL,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_user ON booking_requests(requested_by_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_requests_unique_pending ON booking_requests(resource_id, booking_date, time_slot, requested_by_user_id, status) WHERE status = 'pending';
