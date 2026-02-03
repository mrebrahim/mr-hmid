-- Migration: Create services table
-- Description: Defines dental services offered by the clinic

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  duration_minutes INTEGER DEFAULT 30 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add constraint for positive duration
ALTER TABLE services ADD CONSTRAINT services_duration_positive CHECK (duration_minutes > 0);

-- Add constraint for non-negative price
ALTER TABLE services ADD CONSTRAINT services_price_non_negative CHECK (price IS NULL OR price >= 0);

COMMENT ON TABLE services IS 'Dental services offered by the clinic';
COMMENT ON COLUMN services.name_ar IS 'Service name in Arabic';
COMMENT ON COLUMN services.duration_minutes IS 'Default appointment duration in minutes';
