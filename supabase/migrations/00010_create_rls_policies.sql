-- Migration: Create RLS policies
-- Description: Row Level Security policies for all tables

-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is staff
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff
    WHERE user_id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PATIENTS policies
CREATE POLICY "Staff can view all patients"
  ON patients FOR SELECT
  TO authenticated
  USING (is_staff());

CREATE POLICY "Staff can insert patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (is_staff());

CREATE POLICY "Staff can update patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- SERVICES policies
CREATE POLICY "Authenticated users can view active services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (is_admin());

-- APPOINTMENTS policies
CREATE POLICY "Staff can view all appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (is_staff());

CREATE POLICY "Staff can insert appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (is_staff());

CREATE POLICY "Staff can update appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- CONVERSATIONS policies
CREATE POLICY "Staff can view all conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (is_staff());

-- Service role can insert (for n8n workflows)
CREATE POLICY "Service role can insert conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (is_staff());

-- CLINIC_SCHEDULE policies
CREATE POLICY "Authenticated users can view schedule"
  ON clinic_schedule FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage schedule"
  ON clinic_schedule FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- BLOCKED_DATES policies
CREATE POLICY "Authenticated users can view blocked dates"
  ON blocked_dates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage blocked dates"
  ON blocked_dates FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- KNOWLEDGE_BASE policies
CREATE POLICY "Authenticated users can view active knowledge base entries"
  ON knowledge_base FOR SELECT
  TO authenticated
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage knowledge base"
  ON knowledge_base FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- STAFF policies
CREATE POLICY "Authenticated users can view staff"
  ON staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage staff"
  ON staff FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

COMMENT ON FUNCTION is_staff IS 'Check if current user is an active staff member';
COMMENT ON FUNCTION is_admin IS 'Check if current user is an admin';
