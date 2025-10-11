# Quick Fix: Add Your Stored Prompt ID

## The Issue
You created a **Chat Prompt** (`pmpt_68e96f3b0d70819097e0338bec7f3d75059d1929c90daf37`) but the database doesn't have a `prompt_id` column yet.

## Solution: Run This SQL in Supabase

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left menu
3. Click **New Query**

### Step 2: Copy and Run This SQL
```sql
-- Add prompt_id column if it doesn't exist
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
    
    RAISE NOTICE 'Added prompt_id column';
  END IF;
END $$;

-- Add your stored prompt ID to the default template
UPDATE public.prompt_templates
SET 
  prompt_id = 'pmpt_68e96f3b0d70819097e0338bec7f3d75059d1929c90daf37',
  system_prompt = NULL,
  updated_at = NOW()
WHERE name = 'default';

-- Verify it worked
SELECT 
  name, 
  display_name, 
  prompt_id,
  CASE 
    WHEN prompt_id IS NOT NULL THEN '✅ Will use your stored prompt'
    ELSE '❌ Still using inline prompt' 
  END as status
FROM public.prompt_templates
WHERE name = 'default';
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
3. Check your server logs - should say: "Using OpenAI Stored Prompt ID: pmpt_..."

## What This Does
- ✅ Adds `prompt_id` column to your database
- ✅ Sets your stored prompt ID as the default
- ✅ All future worksheets will use your custom prompt from OpenAI!

---

**That's it!** No code changes needed, just run the SQL above. 🎉
