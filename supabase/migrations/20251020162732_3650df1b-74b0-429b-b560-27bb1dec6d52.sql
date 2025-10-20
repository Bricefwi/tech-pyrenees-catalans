-- Add name column to projects table if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS name TEXT;