-- Create custom_worksheet_types table for user-defined worksheet types
-- Each user can create their own worksheet types with custom JSON schemas

DROP TABLE IF EXISTS public.custom_worksheet_types CASCADE;

CREATE TABLE public.custom_worksheet_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  question_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  json_schema JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key after table creation (conditional on auth.users existence)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
    ALTER TABLE public.custom_worksheet_types
      ADD CONSTRAINT custom_worksheet_types_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX idx_custom_worksheet_types_user_id ON public.custom_worksheet_types(user_id);
CREATE INDEX idx_custom_worksheet_types_created_at ON public.custom_worksheet_types(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.custom_worksheet_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own custom types
CREATE POLICY "Users can view their own custom worksheet types"
  ON public.custom_worksheet_types
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom worksheet types"
  ON public.custom_worksheet_types
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom worksheet types"
  ON public.custom_worksheet_types
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom worksheet types"
  ON public.custom_worksheet_types
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role has full access to custom worksheet types"
  ON public.custom_worksheet_types
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.custom_worksheet_types IS 'User-defined custom worksheet types with JSON schemas for AI generation';
COMMENT ON COLUMN public.custom_worksheet_types.question_types IS 'Array of question type objects with type, count, and marks';
COMMENT ON COLUMN public.custom_worksheet_types.json_schema IS 'Complete JSON schema for AI to follow when generating this worksheet type';
