-- Update to use GPT-5 (or gpt-4.1-nano) with Responses API
-- The new code uses OpenAI Responses API which properly logs to dashboard

UPDATE public.prompt_templates
SET 
  model = 'gpt-5',          -- Use GPT-5 (or 'gpt-4.1-nano', or your OpenAI prompt's model)
  temperature = 1.00,       -- Medium creativity (adjust as needed)
  max_tokens = 2048,        -- Max output tokens
  response_format = 'json_object',  -- JSON output
  updated_at = NOW()
WHERE name = 'default';

-- Verify the update
SELECT 
  name, 
  display_name, 
  prompt_id,
  model,
  temperature,
  max_tokens,
  response_format
FROM public.prompt_templates 
WHERE name = 'default';

-- Expected result:
-- name: default
-- model: gpt-5 (or gpt-4.1-nano)
-- temperature: 1.00
-- max_tokens: 2048
-- response_format: json_object

-- Note: The actual model used will be from your OpenAI prompt configuration
-- if you have a prompt_id set. The database model is a fallback.
