-- X-Ray Supabase Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced from Clerk)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table (API keys and app metadata)
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Executions table (decision execution snapshots)
CREATE TABLE IF NOT EXISTS executions (
  id UUID PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  pipeline TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Steps table (individual steps within an execution)
CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  input JSONB,
  output JSONB,
  reasoning TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_apps_user_id ON apps(user_id);
CREATE INDEX IF NOT EXISTS idx_apps_api_key ON apps(api_key);
CREATE INDEX IF NOT EXISTS idx_executions_app_id ON executions(app_id);
CREATE INDEX IF NOT EXISTS idx_executions_created_at ON executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_steps_execution_id ON steps(execution_id);
CREATE INDEX IF NOT EXISTS idx_steps_created_at ON steps(created_at DESC);

-- Row Level Security (optional, can enable later)
-- Uncomment to enable RLS

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (enable if using RLS):
-- CREATE POLICY users_own_data ON users FOR SELECT USING (auth.uid()::text = clerk_user_id);
-- CREATE POLICY users_see_own_apps ON apps FOR SELECT USING (user_id = (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));
