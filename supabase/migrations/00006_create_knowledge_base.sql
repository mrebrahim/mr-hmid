-- Migration: Create knowledge_base table
-- Description: Stores FAQ and clinic information for RAG system

CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  embedding VECTOR(1536),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add category constraint
ALTER TABLE knowledge_base ADD CONSTRAINT knowledge_base_category_check
  CHECK (category IS NULL OR category IN ('faq', 'service', 'policy', 'general'));

-- Create indexes
CREATE INDEX IF NOT EXISTS knowledge_base_category_idx ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS knowledge_base_active_idx ON knowledge_base(is_active);

-- Add trigger for updated_at
CREATE TRIGGER knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE knowledge_base IS 'FAQ and clinic information for AI RAG system';
COMMENT ON COLUMN knowledge_base.embedding IS 'Semantic embedding vector (1536 dimensions for OpenAI)';
