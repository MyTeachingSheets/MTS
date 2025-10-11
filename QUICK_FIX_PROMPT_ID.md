# Quick Fix: Add Your Custom Prompt

## The Issue
You created a stored prompt in OpenAI, but we need to copy the prompt **content** to your database (not just the ID).

**Why?** OpenAI doesn't provide a public API to fetch stored prompts dynamically. The prompt ID is just for tracking - you need to copy the actual prompt text.

## Solution: Copy Your Prompt Content from OpenAI

### Step 1: Get Your Prompt Content from OpenAI
1. Go to https://platform.openai.com/prompts
2. Find your prompt: `pmpt_68e96f3b0d70819097e0338bec7f3d75059d1929c90daf37`
3. **Copy the entire prompt text** (the instructions/system message)

### Step 2: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left menu
3. Click **New Query**

### Step 3: Run This SQL (Replace with Your Prompt Content)
```sql
```sql
-- Add prompt_id column
ALTER TABLE public.prompt_templates ADD COLUMN IF NOT EXISTS prompt_id TEXT;

-- Update constraint
ALTER TABLE public.prompt_templates DROP CONSTRAINT IF EXISTS has_prompt_config;
ALTER TABLE public.prompt_templates ADD CONSTRAINT has_prompt_config CHECK (
  (prompt_id IS NOT NULL) OR (assistant_id IS NOT NULL) OR (system_prompt IS NOT NULL)
);

-- Add your prompt ID AND content
-- ⚠️ IMPORTANT: Replace 'YOUR_PROMPT_CONTENT_HERE' with your actual prompt text from OpenAI
UPDATE public.prompt_templates
SET 
  prompt_id = 'pmpt_68e96f3b0d70819097e0338bec7f3d75059d1929c90daf37',
  system_prompt = 'YOUR_PROMPT_CONTENT_HERE', -- ⚠️ PASTE YOUR ACTUAL PROMPT HERE
  updated_at = NOW()
WHERE name = 'default';

-- Verify
SELECT name, display_name, prompt_id, 
       CASE WHEN length(system_prompt) > 50 THEN '✅ Has prompt content' 
            ELSE '❌ Missing prompt content' END as status
FROM public.prompt_templates WHERE name = 'default';
```

**Example of what to paste:**
If your OpenAI prompt says:
```
You are an expert teacher creating worksheets for grade 6 science students...
```

Then your SQL should look like:
```sql
UPDATE public.prompt_templates
SET 
  prompt_id = 'pmpt_68e96f3b0d70819097e0338bec7f3d75059d1929c90daf37',
  system_prompt = 'You are an expert teacher creating worksheets for grade 6 science students. Generate comprehensive worksheets with clear questions, multiple choice options, and detailed answer keys. Always respond in JSON format with the structure: {"title": "...", "sections": [...], "answerKey": {...}}',
  updated_at = NOW()
WHERE name = 'default';
```
```

### Step 3: Click "Run" (or press Cmd/Ctrl + Enter)

You should see:
```
name    | display_name           | prompt_id                                                   | status
--------|------------------------|-------------------------------------------------------------|--------------------------------
default | Standard Educational   | pmpt_68e96f3b0d70819097e0338bec7f3d75059d1929c90daf37  | ✅ Will use your stored prompt
```

### Step 4: Test
1. Go to `/ai/generate`
2. Generate a worksheet
3. Check your server logs - should say: "Using stored prompt configuration (ID: pmpt_...)"
4. **No more 404 error!** ✅

## What This Does
- ✅ Adds `prompt_id` column to your database
- ✅ Stores your custom prompt content in the database
- ✅ All future worksheets will use your custom prompt!

## Why Copy the Prompt Content?

OpenAI's stored prompts are meant for organization/versioning in their dashboard, but they don't provide a public API to fetch them. The best practice is to:
1. Create and test your prompt in OpenAI platform
2. Copy the final prompt content to your database
3. Use the `prompt_id` for tracking/reference only

This gives you:
- ✅ Faster generation (no extra API call)
- ✅ Full control (no dependency on OpenAI's prompt storage)
- ✅ Version control (stored in your database/git)

---

## Alternative: Skip the Prompt ID

If you don't want to copy the prompt content, you can just remove the `prompt_id`:

```sql
UPDATE public.prompt_templates
SET 
  prompt_id = NULL,
  system_prompt = NULL, -- Will use the built-in default prompt
  updated_at = NOW()
WHERE name = 'default';
```

This will use the default prompt that's already working (the one you see in the logs: "Falling back to inline system prompt"). 🎉
