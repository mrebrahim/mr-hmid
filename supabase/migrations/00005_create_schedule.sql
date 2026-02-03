-- Migration: Create clinic_schedule table
-- Description: Defines clinic operating hours for each day of the week

CREATE TABLE IF NOT EXISTS clinic_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 30 NOT NULL
);

-- Add day_of_week constraint (0=Sunday, 6=Saturday)
ALTER TABLE clinic_schedule ADD CONSTRAINT clinic_schedule_day_check
  CHECK (day_of_week >= 0 AND day_of_week <= 6);

-- Add time constraint
ALTER TABLE clinic_schedule ADD CONSTRAINT clinic_schedule_time_check
  CHECK (end_time > start_time OR is_active = false);

-- Add slot duration constraint
ALTER TABLE clinic_schedule ADD CONSTRAINT clinic_schedule_slot_positive
  CHECK (slot_duration_minutes > 0);

-- Create unique index on day_of_week
CREATE UNIQUE INDEX IF NOT EXISTS clinic_schedule_day_idx ON clinic_schedule(day_of_week);

COMMENT ON TABLE clinic_schedule IS 'Clinic operating hours for each day of the week';
COMMENT ON COLUMN clinic_schedule.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';
