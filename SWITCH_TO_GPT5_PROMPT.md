# How to Switch to Your New GPT-5 Prompt

## What You Want
Use your new GPT-5 prompt (text format) for all worksheet generation instead of the current gpt-4.1-nano (JSON format).

## Your New Prompt Settings
Based on your screenshot:
- **Model:** gpt-5
- **Format:** text (not json_object)
- **Effort:** medium
- **Verbosity:** medium
- **Summary:** auto
- **Store:** true

---

## Steps to Switch

### Step 1: Get Your New Prompt Details from OpenAI

1. **Save your new prompt** in OpenAI (click "Save" button)
2. After saving, copy:
   - **Prompt ID** (will look like `pmpt_xxxxx`)
   - **The entire system message/prompt content** (the instructions you wrote)

### Step 2: Update Your Database

Run this SQL in **Supabase SQL Editor**:

```sql
-- Option A: Update the existing default template to use GPT-5
UPDATE public.prompt_templates
SET 
  prompt_id = 'YOUR_NEW_PROMPT_ID_HERE', -- ⚠️ Replace with actual prompt ID
  system_prompt = 'PASTE_YOUR_PROMPT_CONTENT_HERE', -- ⚠️ Paste your full prompt text
  model = 'gpt-5',
  response_format = 'text', -- Changed from json_object to text
  temperature = 1.0,
  max_tokens = 4000,
  updated_at = NOW()
WHERE name = 'default';

-- Verify
SELECT name, model, response_format, prompt_id FROM public.prompt_templates WHERE name = 'default';
```

**Replace:**
- `YOUR_NEW_PROMPT_ID_HERE` with your actual prompt ID from OpenAI
- `PASTE_YOUR_PROMPT_CONTENT_HERE` with your complete prompt text

### Step 3: Test It

1. Go to `/ai/generate`
2. Generate a worksheet
3. Check server logs - should say:
   ```
   Model: gpt-5, Temperature: 1.0, Max Tokens: 4000
   ```

---

## What Changed in the Code

I've updated `/pages/api/ai/generate.js` to:
- ✅ Support both `json_object` and `text` response formats
- ✅ Automatically detect format from database config
- ✅ Handle text responses by wrapping them in a simple structure
- ✅ Include format type in response metadata

---

## Example: How to Fill the SQL

If your new prompt says:
```
You are a helpful teacher creating worksheets. 
Generate clear, engaging worksheets with questions and activities.
```

Then your SQL would be:
```sql
UPDATE public.prompt_templates
SET 
  prompt_id = 'pmpt_abc123xyz',
  system_prompt = 'You are a helpful teacher creating worksheets. Generate clear, engaging worksheets with questions and activities.',
  model = 'gpt-5',
  response_format = 'text',
  temperature = 1.0,
  max_tokens = 4000,
  updated_at = NOW()
WHERE name = 'default';
```

---

## Alternative: Create a New Template (Keep Both)

If you want to **keep both prompts** and switch between them:

```sql
-- Add the new GPT-5 prompt as a separate template
INSERT INTO public.prompt_templates (
  name,
  display_name,
  description,
  prompt_id,
  system_prompt,
  model,
  response_format,
  temperature,
  max_tokens,
  is_active,
  is_default
) VALUES (
  'gpt5_text',
  'GPT-5 Text Generator',
  'Natural language worksheet generation with GPT-5',
  'YOUR_NEW_PROMPT_ID', -- Your prompt ID
  'YOUR_PROMPT_CONTENT', -- Your prompt text
  'gpt-5',
  'text',
  1.0,
  4000,
  true,
  true -- Make this the default
);

-- Make the old one non-default
UPDATE public.prompt_templates SET is_default = false WHERE name = 'default';
```

Then you can switch between them by changing which one has `is_default = true`.

---

## Quick Start (TL;DR)

1. **Save your new prompt** in OpenAI
2. **Copy the prompt ID and content**
3. **Run the SQL** above (replace the placeholders)
4. **Test** by generating a worksheet

That's it! Your system will now use GPT-5 with text output. 🎉

---

## Need Help?

If you share:
1. Your new prompt ID
2. Your prompt content

I can generate the exact SQL for you to run!
