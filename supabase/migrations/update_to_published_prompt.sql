-- Update to use your NEW published OpenAI prompt
-- Prompt ID: pmpt_68ea45eb88ec8190afd50fb5ddb69a79053e7eb732a3e3a1

-- Add prompt_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompt_templates' AND column_name = 'prompt_id'
  ) THEN
    ALTER TABLE public.prompt_templates ADD COLUMN prompt_id TEXT;
  END IF;
END $$;

-- Update with your published prompt ID
UPDATE public.prompt_templates
SET 
  prompt_id = 'pmpt_68ea45eb88ec8190afd50fb5ddb69a79053e7eb732a3e3a1',
  system_prompt = NULL,  -- No longer needed - OpenAI fetches it from the prompt
  model = 'gpt-5',        -- Will use whatever model your prompt is configured with
  updated_at = NOW()
WHERE name = 'default';

-- Verify the update
SELECT 
  name, 
  display_name, 
  prompt_id,
  model,
  CASE 
    WHEN prompt_id IS NOT NULL THEN '✅ Will use published OpenAI prompt'
    ELSE '❌ No prompt ID configured'
  END as status
FROM public.prompt_templates 
WHERE name = 'default';

-- Expected result:
-- name: default
-- prompt_id: pmpt_68ea45eb88ec8190afd50fb5ddb69a79053e7eb732a3e3a1
-- status: ✅ Will use published OpenAI prompt

/*
IMPORTANT NOTES:
1. The code now uses: prompt={ id: "pmpt_...", version: "1" }
2. OpenAI fetches the prompt content, model, and settings from their platform
3. You don't need to copy prompt content to the database anymore
4. The database model field is just for reference/logging
5. All your prompt edits in OpenAI dashboard take effect immediately
6. You can version your prompts and specify which version to use
*/
