-- Add prompt_id column to support OpenAI Stored Prompts (pmpt_*)
-- Run this BEFORE the other migration

-- Add the prompt_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompt_templates' AND column_name = 'prompt_id'
  ) THEN
    ALTER TABLE public.prompt_templates ADD COLUMN prompt_id TEXT;
    
    -- Update the constraint to include prompt_id
    ALTER TABLE public.prompt_templates DROP CONSTRAINT IF EXISTS has_prompt_config;
    ALTER TABLE public.prompt_templates ADD CONSTRAINT has_prompt_config CHECK (
      (prompt_id IS NOT NULL) OR (assistant_id IS NOT NULL) OR (system_prompt IS NOT NULL)
    );
    
    RAISE NOTICE 'Added prompt_id column to prompt_templates table';
  ELSE
    RAISE NOTICE 'prompt_id column already exists';
  END IF;
END $$;

-- Add your stored prompt ID to the default template
UPDATE public.prompt_templates
SET 
  prompt_id = 'pmpt_68e96f3b0d70819097e0338bec7f3d75059d1929c90daf37',
  system_prompt = NULL,
  updated_at = NOW()
WHERE name = 'default';

-- Verify the update
SELECT 
  name, 
  display_name, 
  prompt_id,
  assistant_id, 
  CASE 
    WHEN prompt_id IS NOT NULL THEN 'Will use Stored Prompt'
    WHEN assistant_id IS NOT NULL THEN 'Will use Assistant API' 
    ELSE 'Will use inline prompt' 
  END as mode
FROM public.prompt_templates
WHERE name = 'default';
