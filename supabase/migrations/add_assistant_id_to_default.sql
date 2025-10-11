-- Add your OpenAI Assistant ID to the default prompt template
-- This will make all worksheet generations use your custom assistant instead of inline prompts

-- Update the default template to use your Assistant ID
-- Replace 'asst_YOUR_ASSISTANT_ID' with your actual Assistant ID from OpenAI platform

UPDATE public.prompt_templates
SET 
  assistant_id = 'asst_YOUR_ASSISTANT_ID_HERE', -- ⚠️ REPLACE THIS with your actual assistant ID
  system_prompt = NULL, -- Clear inline prompt since we're using Assistant
  updated_at = NOW()
WHERE name = 'default';

-- Verify the update
SELECT 
  name, 
  display_name, 
  assistant_id, 
  CASE 
    WHEN assistant_id IS NOT NULL THEN 'Will use Assistants API' 
    ELSE 'Will use Chat Completions API' 
  END as api_mode
FROM public.prompt_templates
WHERE name = 'default';

-- Instructions:
-- 1. Get your Assistant ID from: https://platform.openai.com/assistants
-- 2. Replace 'asst_YOUR_ASSISTANT_ID_HERE' above with your actual assistant ID
-- 3. Run this migration: Run in Supabase SQL Editor or via psql
-- 4. All future generations will use your custom assistant!

-- Note: Your assistant must be configured with:
-- - Model: gpt-4o or similar
-- - Instructions: Your custom worksheet generation prompt
-- - Response format: JSON if using structured outputs
