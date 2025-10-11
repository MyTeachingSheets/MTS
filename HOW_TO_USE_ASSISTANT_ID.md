# How to Use Your OpenAI Assistant ID for Worksheet Generation

## Current Issue
The system is using the **Chat Completions API** (inline prompts) instead of your custom **Assistant** from OpenAI.

## Why?
The `prompt_templates` table in your database has the default template configured with an inline `system_prompt`, but **no `assistant_id`**.

When the API sees no `assistant_id`, it falls back to Chat Completions API.

## Solution: Add Your Assistant ID to the Database

### Step 1: Get Your Assistant ID
1. Go to https://platform.openai.com/assistants
2. Find your custom assistant (the one you created for worksheet generation)
3. Copy the **Assistant ID** (looks like: `asst_abc123xyz...`)

### Step 2: Update the Database
Run this SQL in your Supabase SQL Editor:

```sql
-- Update the default template to use your Assistant ID
UPDATE public.prompt_templates
SET 
  assistant_id = 'asst_YOUR_ASSISTANT_ID_HERE', -- Replace with your actual ID
  system_prompt = NULL, -- Clear inline prompt
  updated_at = NOW()
WHERE name = 'default';

-- Verify it worked
SELECT name, display_name, assistant_id 
FROM public.prompt_templates 
WHERE name = 'default';
```

**Replace `asst_YOUR_ASSISTANT_ID_HERE`** with your actual assistant ID!

### Step 3: Redeploy (If on Vercel/Production)
If you're testing on production (myteachingsheets.com):
1. Make sure the database update is done
2. The next generation will automatically use your assistant

### Step 4: Test
1. Go to `/ai/generate`
2. Generate a worksheet
3. Check the OpenAI logs - you should now see:
   - **Assistants API** logs (not Chat Completions)
   - **Run ID** (like `run_abc123...`) instead of chat completion ID

## Alternative: Send Assistant ID Directly (Without Database)

If you don't want to update the database, you can pass the assistant ID directly in the frontend:

**Edit `/pages/ai/generate.js` line ~225:**
```javascript
body: JSON.stringify({
  subject: selectedSubject.name,
  framework: selectedFramework?.name,
  grade: selectedGrade.name,
  // ... other fields
  assistantId: 'asst_YOUR_ASSISTANT_ID_HERE' // Add this line
})
```

This will override any database settings and use your specific assistant.

## How to Verify It's Working

### In OpenAI Dashboard Logs:
**Before (Chat Completions):**
```
ID: chatcmpl-abc123...
Model: gpt-4o-2024-08-06
Type: Chat Completion
```

**After (Assistants API):**
```
ID: run_abc123...
Model: gpt-4o
Type: Assistant Run
Assistant: asst_xyz789...
```

### In Your Server Logs:
**Before:**
```
Using Chat Completions API with inline prompt
Model: gpt-4o, Temperature: 0.7, Max Tokens: 4000
```

**After:**
```
Using OpenAI Assistant ID: asst_xyz789...
```

## Benefits of Using Assistants API
✅ **Custom Instructions**: Your assistant's custom prompt is used (configured in OpenAI platform)  
✅ **Versioning**: Update your assistant's prompt in OpenAI without redeploying your app  
✅ **Advanced Features**: Support for function calling, code interpreter, file search (if enabled)  
✅ **Centralized Config**: All prompt settings live in OpenAI platform  

## Files Modified
- ✅ Frontend now sends `promptTemplateName: 'default'` to API
- ✅ API already supports both `assistantId` and `promptTemplateName` parameters
- ⏳ You need to add your assistant ID to the database

## Migration File
I've created: `supabase/migrations/add_assistant_id_to_default.sql`

This file has the SQL ready - just replace the placeholder with your actual assistant ID and run it!

---

**Quick Summary:**
1. Get your assistant ID from OpenAI platform
2. Update the database with the SQL above
3. Next generation will use your custom assistant! 🎉
