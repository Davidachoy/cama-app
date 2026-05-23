-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Services offered by the barber
CREATE TABLE IF NOT EXISTS services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  duration_min  INTEGER NOT NULL,
  price_colones INTEGER NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Client bookings / appointments
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name     TEXT NOT NULL,
  client_phone    TEXT,
  client_email    TEXT,
  service_id      UUID REFERENCES services(id) ON DELETE SET NULL,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed','completed','cancelled','no_show')),
  notes           TEXT,
  google_event_id TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bookings_starts_at_idx ON bookings(starts_at);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

-- Payment records
CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount_colones INTEGER NOT NULL,
  paid_at        TIMESTAMPTZ NOT NULL,
  method         TEXT NOT NULL CHECK (method IN ('sinpe','cash','transfer')),
  source         TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','gmail_parsed')),
  raw_email_id   TEXT UNIQUE,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payments_paid_at_idx ON payments(paid_at);

-- Personal reminders for the barber
CREATE TABLE IF NOT EXISTS reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  remind_at       TIMESTAMPTZ NOT NULL,
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  google_event_id TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reminders_remind_at_idx ON reminders(remind_at);

-- Gmail sync state (incremental sync)
CREATE TABLE IF NOT EXISTS gmail_sync_state (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_history_id TEXT,
  last_synced_at  TIMESTAMPTZ
);

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint  TEXT NOT NULL UNIQUE,
  p256dh    TEXT NOT NULL,
  auth      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed: default services
INSERT INTO services (name, duration_min, price_colones) VALUES
  ('Corte de cabello', 30, 5000),
  ('Barba', 20, 3000),
  ('Corte + Barba', 45, 7500),
  ('Degradado', 45, 6000)
ON CONFLICT DO NOTHING;
