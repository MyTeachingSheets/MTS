-- Add a new prompt template for the gpt-5 text-based worksheet generator
-- This allows you to switch between different prompts

-- First, add the new prompt template
INSERT INTO public.prompt_templates (
  name,
  display_name,
  description,
  prompt_id,
  system_prompt,
  model,
  temperature,
  max_tokens,
  response_format,
  is_active,
  is_default
) VALUES (
  'gpt5_text',
  'GPT-5 Text Generator',
  'Uses GPT-5 with text output format for natural language worksheets',
  'YOUR_NEW_PROMPT_ID_HERE', -- ⚠️ Replace with the actual prompt ID from OpenAI
  'PASTE_YOUR_NEW_PROMPT_CONTENT_HERE', -- ⚠️ Copy the full system message from your new prompt
  'gpt-5',
  1.0, -- Default temperature, adjust as needed
  4000, -- Max tokens
  'text', -- Text format instead of json_object
  true, -- Active
  false -- Not default yet
) ON CONFLICT (name) DO NOTHING;

-- To make this the DEFAULT prompt (used for all generations), run this:
-- UPDATE public.prompt_templates SET is_default = false WHERE is_default = true;
-- UPDATE public.prompt_templates SET is_default = true WHERE name = 'gpt5_text';

-- Or to just update the existing default to use gpt-5:
UPDATE public.prompt_templates
SET 
  model = 'gpt-5',
  response_format = 'text', -- Change from json_object to text
  temperature = 1.0,
  updated_at = NOW()
WHERE name = 'default';

-- Verify the update
SELECT name, display_name, model, response_format, is_default
FROM public.prompt_templates
ORDER BY is_default DESC, name;
