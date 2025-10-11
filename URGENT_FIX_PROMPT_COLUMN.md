# 🚨 URGENT FIX: Move pmpt_ ID to Correct Column

## The Problem
Your `pmpt_` ID is in the **wrong column** (`assistant_id` instead of `prompt_id`), causing this error:
```
Invalid 'assistant_id': 'pmpt_68ea03da55e08196900fac4e660936950b42e6d351ad74ac'. 
Expected an ID that begins with 'asst'.
```

## The Solution (2 minutes)

### Run This SQL in Supabase NOW:

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Paste and run this:**

```sql
-- Add prompt_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompt_templates' AND column_name = 'prompt_id'
  ) THEN
    ALTER TABLE public.prompt_templates ADD COLUMN prompt_id TEXT;
    
    ALTER TABLE public.prompt_templates DROP CONSTRAINT IF EXISTS has_prompt_config;
    ALTER TABLE public.prompt_templates ADD CONSTRAINT has_prompt_config CHECK (
      (prompt_id IS NOT NULL) OR (assistant_id IS NOT NULL) OR (system_prompt IS NOT NULL)
    );
  END IF;
END $$;

-- Move the pmpt_ ID to the correct column
UPDATE public.prompt_templates
SET 
  prompt_id = assistant_id,
  assistant_id = NULL
WHERE assistant_id LIKE 'pmpt_%';

-- Verify it worked
SELECT 
  name, 
  prompt_id,
  assistant_id,
  CASE 
    WHEN prompt_id LIKE 'pmpt_%' THEN '✅ FIXED!'
    ELSE '❌ Still broken'
  END as status
FROM public.prompt_templates
WHERE name = 'default';
```

3. **Expected result:**
```
name    | prompt_id                                                   | assistant_id | status
--------|-------------------------------------------------------------|--------------|--------
default | pmpt_68ea03da55e08196900fac4e660936950b42e6d351ad74ac  | NULL         | ✅ FIXED!
```

### Test It

1. Go to `/ai/generate`
2. Generate a worksheet
3. No more `Invalid 'assistant_id'` error! ✅

---

## What Happened

When you ran the previous SQL, it put your `pmpt_` ID in the `assistant_id` column. But:
- `assistant_id` is ONLY for IDs starting with `asst_`
- `prompt_id` is for IDs starting with `pmpt_`

The SQL above moves it to the correct column.

---

## After Running This

Your logs will show:
```
✅ Using stored prompt configuration (ID: pmpt_...)
```

Instead of:
```
❌ Using OpenAI Assistant ID: pmpt_... (WRONG!)
```

---

**Run the SQL above and you're done!** 🎉
