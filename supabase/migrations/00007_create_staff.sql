-- Migration: Create staff table
-- Description: Stores clinic staff members with their roles

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add role constraint
ALTER TABLE staff ADD CONSTRAINT staff_role_check
  CHECK (role IN ('admin', 'assistant', 'doctor'));

-- Create indexes
CREATE INDEX IF NOT EXISTS staff_user_id_idx ON staff(user_id);
CREATE INDEX IF NOT EXISTS staff_role_idx ON staff(role);

COMMENT ON TABLE staff IS 'Clinic staff members with roles';
COMMENT ON COLUMN staff.user_id IS 'Reference to Supabase Auth user';
COMMENT ON COLUMN staff.role IS 'Staff role: admin, assistant, or doctor';
