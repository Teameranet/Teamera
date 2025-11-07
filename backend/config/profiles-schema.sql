-- Profiles Table Schema for Teamera.net
-- This schema creates the profiles table with onboarding fields and security policies

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  role TEXT, -- 'founder', 'professional', 'investor', 'student'
  skills TEXT[] DEFAULT '{}', -- Array of skill names
  experience TEXT, -- '0-1', '2-3', '4-6', '7+'
  location TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  education JSONB DEFAULT '[]'::jsonb,
  work_experience JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on profile updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- RLS Policy: Users can view all profiles (SELECT for all)
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

-- RLS Policy: Users can update own profile (UPDATE where auth.uid() = id)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policy: Users can insert own profile (INSERT where auth.uid() = id)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create index on skills for array searches
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING GIN(skills);
