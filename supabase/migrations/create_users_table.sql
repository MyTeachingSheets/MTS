-- Create users table to mirror auth.users data
-- This allows us to store additional user metadata and track activity

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own data" ON public.users;
  DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policies
-- Users can read their own data
CREATE POLICY "Users can view own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

-- Service role can manage all users (for API operations)
CREATE POLICY "Service role can manage all users" 
  ON public.users 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;

-- Create the trigger
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_users_updated_at();

-- Add a comment to describe the table
COMMENT ON TABLE public.users IS 'Stores user profile data and metadata from auth.users';
