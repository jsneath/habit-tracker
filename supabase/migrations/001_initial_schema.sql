-- Habit Tracker Database Schema
-- Run this migration in your Supabase SQL Editor

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '✅',
  color TEXT DEFAULT '#10B981',
  frequency JSONB NOT NULL DEFAULT '{"type": "daily"}',
  reminder_time TIME,
  reminder_message TEXT,
  category TEXT,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Completions table
CREATE TABLE IF NOT EXISTS completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_at DATE NOT NULL,
  note TEXT,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure only one completion per habit per day
  UNIQUE(habit_id, completed_at)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(archived);
CREATE INDEX IF NOT EXISTS idx_completions_habit ON completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_completions_date ON completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_completions_habit_date ON completions(habit_id, completed_at);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habits table
-- Users can only see their own habits (or habits without a user_id for anonymous use)
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for completions table
-- Users can only manage completions for their own habits
CREATE POLICY "Users can view own completions" ON completions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = completions.habit_id
      AND (habits.user_id = auth.uid() OR habits.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert own completions" ON completions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = completions.habit_id
      AND (habits.user_id = auth.uid() OR habits.user_id IS NULL)
    )
  );

CREATE POLICY "Users can update own completions" ON completions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = completions.habit_id
      AND (habits.user_id = auth.uid() OR habits.user_id IS NULL)
    )
  );

CREATE POLICY "Users can delete own completions" ON completions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = completions.habit_id
      AND (habits.user_id = auth.uid() OR habits.user_id IS NULL)
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on habits
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE habits;
ALTER PUBLICATION supabase_realtime ADD TABLE completions;

-- Create storage bucket for habit photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('habit-photos', 'habit-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for habit photos
CREATE POLICY "Anyone can view habit photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'habit-photos');

CREATE POLICY "Authenticated users can upload habit photos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'habit-photos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own habit photos" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'habit-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own habit photos" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'habit-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
