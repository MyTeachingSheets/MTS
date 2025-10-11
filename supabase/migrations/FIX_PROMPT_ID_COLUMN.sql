-- URGENT FIX: Move pmpt_ ID from assistant_id to prompt_id column
-- This fixes the "Invalid 'assistant_id'" error

-- Step 1: Add prompt_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompt_templates' AND column_name = 'prompt_id'
  ) THEN
    ALTER TABLE public.prompt_templates ADD COLUMN prompt_id TEXT;
    
    -- Update the constraint
    ALTER TABLE public.prompt_templates DROP CONSTRAINT IF EXISTS has_prompt_config;
    ALTER TABLE public.prompt_templates ADD CONSTRAINT has_prompt_config CHECK (
      (prompt_id IS NOT NULL) OR (assistant_id IS NOT NULL) OR (system_prompt IS NOT NULL)
    );
  END IF;
END $$;

-- Step 2: Move the pmpt_ ID from assistant_id to prompt_id
UPDATE public.prompt_templates
SET 
  prompt_id = assistant_id,  -- Copy the pmpt_ ID to the correct column
  assistant_id = NULL         -- Clear the assistant_id (it's not an assistant!)
WHERE assistant_id LIKE 'pmpt_%';  -- Only update rows with pmpt_ IDs

-- Step 3: Verify the fix
SELECT 
  name, 
  display_name, 
  prompt_id,
  assistant_id,
  CASE 
    WHEN prompt_id IS NOT NULL AND prompt_id LIKE 'pmpt_%' THEN '✅ Correct - using prompt_id'
    WHEN assistant_id IS NOT NULL AND assistant_id LIKE 'pmpt_%' THEN '❌ ERROR - pmpt_ in assistant_id'
    WHEN assistant_id IS NOT NULL AND assistant_id LIKE 'asst_%' THEN '✅ Correct - using assistant_id'
    ELSE 'ℹ️ Using inline/default prompt'
  END as status
FROM public.prompt_templates
WHERE name = 'default';
