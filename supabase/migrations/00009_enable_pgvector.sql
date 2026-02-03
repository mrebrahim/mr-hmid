-- Migration: Enable pgvector extension
-- Description: Required for semantic search in knowledge_base

CREATE EXTENSION IF NOT EXISTS vector;

-- Create embedding index for knowledge_base (after extension is enabled)
-- Using IVFFlat index for approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx
  ON knowledge_base
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

COMMENT ON EXTENSION vector IS 'pgvector extension for semantic search';
