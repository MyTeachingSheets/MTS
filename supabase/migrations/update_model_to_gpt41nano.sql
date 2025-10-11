-- Update the model to match your OpenAI prompt configuration
-- Your OpenAI prompt uses gpt-4.1-nano, so update the database to match

UPDATE public.prompt_templates
SET 
  model = 'gpt-4.1-nano',  -- Change from gpt-4o to gpt-4.1-nano
  temperature = 1.00,       -- Match your OpenAI prompt config
  max_tokens = 2048,        -- Match your OpenAI prompt config (shown in screenshot)
  updated_at = NOW()
WHERE name = 'default';

-- Verify the update
SELECT 
  name, 
  display_name, 
  prompt_id,
  model,
  temperature,
  max_tokens
FROM public.prompt_templates 
WHERE name = 'default';

-- Expected result:
-- name: default
-- model: gpt-4.1-nano
-- temperature: 1.00
-- max_tokens: 2048
