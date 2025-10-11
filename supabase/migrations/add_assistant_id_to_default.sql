-- Add your OpenAI Stored Prompt ID to the default prompt template
-- This will make all worksheet generations use your custom prompt instead of inline prompts

-- OPTION 1: Use Stored Prompt (Recommended - for prompts saved in OpenAI platform)
-- If you created a prompt at https://platform.openai.com/prompts
UPDATE public.prompt_templates
SET 
  prompt_id = 'pmpt_68e96f3b0d70819097e0338bec7f3d75059d1929c90daf37', -- Your stored prompt ID
  system_prompt = NULL, -- Clear inline prompt since we're using stored prompt
  updated_at = NOW()
WHERE name = 'default';

-- OPTION 2: Use Assistant (Alternative - if you want to use Assistants API instead)
-- Uncomment this if you create an Assistant instead of a stored prompt
/*
UPDATE public.prompt_templates
SET 
  assistant_id = 'asst_YOUR_ASSISTANT_ID_HERE', -- OpenAI Assistant ID
  system_prompt = NULL,
  updated_at = NOW()
WHERE name = 'default';
*/

-- Verify the update
SELECT 
  name, 
  display_name, 
  prompt_id,
  assistant_id, 
  CASE 
    WHEN prompt_id IS NOT NULL THEN 'Will use Stored Prompt with Chat Completions'
    WHEN assistant_id IS NOT NULL THEN 'Will use Assistants API' 
    ELSE 'Will use inline Chat Completions' 
  END as api_mode
FROM public.prompt_templates
WHERE name = 'default';

-- Instructions:
-- 1. Run the SQL above in your Supabase SQL Editor
-- 2. Your stored prompt (pmpt_68e96f3b0d70819097e0338bec7f3d75059d1929c90daf37) will be used
-- 3. All future generations will use your custom prompt from OpenAI platform!

-- Note about Stored Prompts vs Assistants:
-- - Stored Prompts (pmpt_*): Simpler, uses Chat Completions API with your saved prompt
-- - Assistants (asst_*): More complex, supports threads, tools, and stateful conversations
-- For worksheet generation, Stored Prompts are recommended!
