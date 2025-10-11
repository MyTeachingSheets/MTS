-- Create worksheets table to store user-generated worksheets
-- This allows users to persist and retrieve their generated worksheets

-- First, ensure the table doesn't exist
DROP TABLE IF EXISTS public.worksheets CASCADE;

-- Create the worksheets table
CREATE TABLE public.worksheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Basic worksheet metadata
  title TEXT NOT NULL,
  subject TEXT,
  grade TEXT,
  framework TEXT,
  domain TEXT,
  worksheet_type TEXT,
  
  -- Worksheet content (stores the full AI-generated structure)
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Custom instructions used during generation
  custom_instructions TEXT,
  
  -- Status and visibility
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_listed BOOLEAN DEFAULT false,
  
  -- Thumbnail
  thumbnail_url TEXT,
  thumbnail_uploaded BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint to auth.users if the auth schema exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
    ALTER TABLE public.worksheets 
      ADD CONSTRAINT worksheets_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX idx_worksheets_user_id ON public.worksheets(user_id);
CREATE INDEX idx_worksheets_status ON public.worksheets(status);
CREATE INDEX idx_worksheets_created_at ON public.worksheets(created_at DESC);
CREATE INDEX idx_worksheets_user_created ON public.worksheets(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view own worksheets" ON public.worksheets;
  DROP POLICY IF EXISTS "Users can insert own worksheets" ON public.worksheets;
  DROP POLICY IF EXISTS "Users can update own worksheets" ON public.worksheets;
  DROP POLICY IF EXISTS "Users can delete own worksheets" ON public.worksheets;
  DROP POLICY IF EXISTS "Anyone can view published worksheets" ON public.worksheets;
  DROP POLICY IF EXISTS "Service role can manage all worksheets" ON public.worksheets;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policies
-- Users can read their own worksheets
CREATE POLICY "Users can view own worksheets" 
  ON public.worksheets 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own worksheets
CREATE POLICY "Users can insert own worksheets" 
  ON public.worksheets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own worksheets
CREATE POLICY "Users can update own worksheets" 
  ON public.worksheets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own worksheets
CREATE POLICY "Users can delete own worksheets" 
  ON public.worksheets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Anyone can view published/listed worksheets (marketplace)
CREATE POLICY "Anyone can view published worksheets" 
  ON public.worksheets 
  FOR SELECT 
  USING (status = 'published' AND is_listed = true);

-- Service role can manage all worksheets (for admin operations)
CREATE POLICY "Service role can manage all worksheets" 
  ON public.worksheets 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.worksheets TO authenticated;
GRANT ALL ON public.worksheets TO service_role;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_worksheets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_worksheets_updated_at_trigger ON public.worksheets;
CREATE TRIGGER update_worksheets_updated_at_trigger
  BEFORE UPDATE ON public.worksheets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_worksheets_updated_at();

-- Add comment to table
COMMENT ON TABLE public.worksheets IS 'Stores user-generated worksheets with full content and metadata';
