-- Migration: Create appointments table
-- Description: Core appointment records linking patients to services

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30 NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  notes TEXT,
  reminded BOOLEAN DEFAULT false NOT NULL,
  cancelled_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Add status constraint
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'));

-- Add cancelled_by constraint
ALTER TABLE appointments ADD CONSTRAINT appointments_cancelled_by_check
  CHECK (cancelled_by IS NULL OR cancelled_by IN ('assistant', 'patient'));

-- Create indexes
CREATE INDEX IF NOT EXISTS appointments_patient_id_idx ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS appointments_date_idx ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);
CREATE INDEX IF NOT EXISTS appointments_date_time_idx ON appointments(appointment_date, appointment_time);

-- Add trigger for updated_at
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for timestamp tracking
CREATE OR REPLACE FUNCTION set_appointment_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    NEW.confirmed_at = now();
  END IF;
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    NEW.cancelled_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_status_timestamps
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION set_appointment_timestamps();

COMMENT ON TABLE appointments IS 'Core appointment records linking patients to services';
COMMENT ON COLUMN appointments.status IS 'Appointment status: pending, confirmed, completed, cancelled, no_show';
COMMENT ON COLUMN appointments.cancelled_by IS 'Who cancelled: assistant or patient';
