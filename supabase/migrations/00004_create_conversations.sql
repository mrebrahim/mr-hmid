-- Migration: Create conversations table
-- Description: Stores WhatsApp message history for patient communication

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' NOT NULL,
  whatsapp_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add sender constraint
ALTER TABLE conversations ADD CONSTRAINT conversations_sender_check
  CHECK (sender IN ('patient', 'ai_agent'));

-- Create indexes
CREATE INDEX IF NOT EXISTS conversations_patient_id_idx ON conversations(patient_id);
CREATE INDEX IF NOT EXISTS conversations_created_at_idx ON conversations(created_at DESC);

COMMENT ON TABLE conversations IS 'WhatsApp message history for patient communication';
COMMENT ON COLUMN conversations.sender IS 'Message sender: patient or ai_agent';
COMMENT ON COLUMN conversations.whatsapp_message_id IS 'Evolution API message ID for deduplication';
