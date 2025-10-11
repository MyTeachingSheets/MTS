-- OPTION 1: Remove prompt_id completely (recommended - it's not useful)
-- OpenAI Stored Prompts cannot be fetched dynamically via API
-- Just use system_prompt column with your prompt content + model settings

UPDATE public.prompt_templates
SET 
  prompt_id = NULL,
  updated_at = NOW()
WHERE name = 'default';

-- Verify
SELECT name, display_name, prompt_id, model, temperature, max_tokens 
FROM public.prompt_templates 
WHERE name = 'default';

-- OPTION 2: Keep prompt_id for tracking only (if you want to reference which OpenAI prompt you copied)
-- In this case, just make sure:
-- 1. system_prompt contains your actual prompt text from OpenAI
-- 2. model/temperature/max_tokens match your OpenAI prompt settings
-- 3. prompt_id is just a reference/tracking field (not used by the API)

/*
Example: If your OpenAI prompt settings are:
- Model: gpt-4.1-nano
- Temperature: 1.00  
- Max tokens: 2048
- System message: "You are an expert educational content creator..."

Then your database should have:
UPDATE public.prompt_templates
SET 
  prompt_id = 'pmpt_68ea03da55e08196900fac4e660936950b42e6d351ad74ac', -- Just for reference
  system_prompt = 'You are an expert educational content creator specializing in generating high-quality worksheets for teachers...',  -- Copy from OpenAI
  model = 'gpt-4.1-nano',  -- Match OpenAI
  temperature = 1.00,       -- Match OpenAI
  max_tokens = 2048,        -- Match OpenAI
  updated_at = NOW()
WHERE name = 'default';
*/
