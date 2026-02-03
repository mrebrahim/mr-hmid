-- Migration: Create blocked_dates table
-- Description: Stores dates when the clinic is closed

CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE UNIQUE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create index on blocked_date
CREATE INDEX IF NOT EXISTS blocked_dates_date_idx ON blocked_dates(blocked_date);

COMMENT ON TABLE blocked_dates IS 'Dates when the clinic is closed (holidays, etc.)';
