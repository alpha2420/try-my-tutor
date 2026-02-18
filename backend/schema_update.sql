-- Run this script in your Supabase SQL Editor

-- Add new columns to requirements table
ALTER TABLE requirements
ADD COLUMN IF NOT EXISTS grade VARCHAR(50),
ADD COLUMN IF NOT EXISTS board VARCHAR(50),
ADD COLUMN IF NOT EXISTS days JSONB,
ADD COLUMN IF NOT EXISTS duration VARCHAR(50),
ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(50),
ADD COLUMN IF NOT EXISTS experience_preference VARCHAR(50),
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Ensure subjects exist (Idempotent inserts)
-- Note: 'ON CONFLICT' requires a unique constraint on 'name' which should exist
INSERT INTO subjects (name) VALUES 
('Mathematics'), ('Physics'), ('Chemistry'), ('Biology'), ('English'), 
('History'), ('Computer Science'), ('Economics')
ON CONFLICT (name) DO NOTHING;
