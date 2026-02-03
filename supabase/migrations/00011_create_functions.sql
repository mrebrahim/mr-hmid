-- Migration: Create database functions
-- Description: Core functions for appointment slot availability and knowledge base search

-- Function: Get available appointment slots for a given date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_date DATE,
  p_service_id UUID DEFAULT NULL
)
RETURNS TABLE (
  slot_time TIME,
  slot_end TIME
) AS $$
DECLARE
  v_day_of_week INTEGER;
  v_start_time TIME;
  v_end_time TIME;
  v_slot_duration INTEGER;
  v_service_duration INTEGER;
  v_current_slot TIME;
BEGIN
  -- Get day of week (0=Sunday)
  v_day_of_week := EXTRACT(DOW FROM p_date)::INTEGER;

  -- Check if date is blocked
  IF EXISTS (SELECT 1 FROM blocked_dates WHERE blocked_date = p_date) THEN
    RETURN;
  END IF;

  -- Get schedule for this day
  SELECT start_time, end_time, slot_duration_minutes, is_active
  INTO v_start_time, v_end_time, v_slot_duration
  FROM clinic_schedule
  WHERE day_of_week = v_day_of_week AND is_active = true;

  -- If clinic is closed this day, return empty
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Get service duration if service_id provided
  IF p_service_id IS NOT NULL THEN
    SELECT duration_minutes INTO v_service_duration
    FROM services
    WHERE id = p_service_id AND is_active = true;

    IF v_service_duration IS NOT NULL THEN
      v_slot_duration := v_service_duration;
    END IF;
  END IF;

  -- Generate slots and filter out booked ones
  v_current_slot := v_start_time;

  WHILE v_current_slot + (v_slot_duration || ' minutes')::INTERVAL <= v_end_time LOOP
    -- Check if slot overlaps with any existing appointment
    IF NOT EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.appointment_date = p_date
        AND a.status NOT IN ('cancelled', 'no_show')
        AND (
          (a.appointment_time <= v_current_slot AND a.appointment_time + (a.duration_minutes || ' minutes')::INTERVAL > v_current_slot)
          OR
          (a.appointment_time < v_current_slot + (v_slot_duration || ' minutes')::INTERVAL AND a.appointment_time >= v_current_slot)
        )
    ) THEN
      slot_time := v_current_slot;
      slot_end := v_current_slot + (v_slot_duration || ' minutes')::INTERVAL;
      RETURN NEXT;
    END IF;

    v_current_slot := v_current_slot + (v_slot_duration || ' minutes')::INTERVAL;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Search knowledge base using semantic similarity
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.category,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE kb.is_active = true
    AND kb.embedding IS NOT NULL
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get upcoming appointments for reminders
CREATE OR REPLACE FUNCTION get_appointments_for_reminder()
RETURNS TABLE (
  appointment_id UUID,
  patient_id UUID,
  patient_name TEXT,
  patient_phone TEXT,
  service_name TEXT,
  service_name_ar TEXT,
  appointment_date DATE,
  appointment_time TIME
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id AS appointment_id,
    p.id AS patient_id,
    p.name AS patient_name,
    p.phone AS patient_phone,
    s.name AS service_name,
    s.name_ar AS service_name_ar,
    a.appointment_date,
    a.appointment_time
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  JOIN services s ON a.service_id = s.id
  WHERE a.status = 'confirmed'
    AND a.reminded = false
    AND a.appointment_date = CURRENT_DATE + INTERVAL '1 day'
    AND a.appointment_time BETWEEN CURRENT_TIME AND CURRENT_TIME + INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get conversation history for a patient
CREATE OR REPLACE FUNCTION get_conversation_history(
  p_patient_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  message TEXT,
  sender TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.message, c.sender, c.created_at
  FROM conversations c
  WHERE c.patient_id = p_patient_id
  ORDER BY c.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_available_slots IS 'Returns available appointment slots for a given date, optionally filtered by service duration';
COMMENT ON FUNCTION search_knowledge_base IS 'Performs semantic similarity search on knowledge base entries';
COMMENT ON FUNCTION get_appointments_for_reminder IS 'Gets appointments due for 24-hour reminder';
COMMENT ON FUNCTION get_conversation_history IS 'Gets recent conversation history for a patient';
