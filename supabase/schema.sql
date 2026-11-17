-- Supabase Schema for Multi-LLM Chat Application
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Enable pgcrypto for UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Messages table
-- Stores user prompts and represents turns in the conversation
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Model Responses & Generation Logs table
-- Stores individual responses, token usage, cost, and latency for each chosen model
CREATE TABLE IF NOT EXISTS model_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC(12, 6) NOT NULL DEFAULT 0.000000,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
  error_message TEXT,
  openrouter_generation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_model_responses_conversation_id ON model_responses(conversation_id);
CREATE INDEX IF NOT EXISTS idx_model_responses_message_id ON model_responses(message_id);
CREATE INDEX IF NOT EXISTS idx_model_responses_created_at ON model_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- 6. Trigger to automatically update updated_at on conversations table
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON messages;
CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- 7. Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_responses ENABLE ROW LEVEL SECURITY;

-- Allow public access with anon key (and service role) for full CRUD operations
DROP POLICY IF EXISTS "Public access to conversations" ON conversations;
CREATE POLICY "Public access to conversations" ON conversations
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to messages" ON messages;
CREATE POLICY "Public access to messages" ON messages
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to model_responses" ON model_responses;
CREATE POLICY "Public access to model_responses" ON model_responses
  FOR ALL USING (true) WITH CHECK (true);

-- 8. Table Grants for Supabase roles (anon, authenticated, service_role)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
