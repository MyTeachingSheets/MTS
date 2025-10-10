# OpenAI Integration - Summary

## ✅ What's Been Set Up

Your app now supports **OpenAI Custom Prompts (Assistants)** for generating worksheets with AI.

---

## 🎯 The Simple Setup (Recommended)

### You Only Need 2 Things:

1. **OpenAI API Key** in `.env.local`:
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **Assistant ID** in database:
   ```sql
   INSERT INTO prompt_templates (name, display_name, assistant_id)
   VALUES ('my_custom', 'My Worksheet Generator', 'asst_xxxxx');
   ```

**That's it!** All model settings (GPT-4o, temperature, verbosity, etc.) are configured in the OpenAI platform.

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **CUSTOM_PROMPTS_GUIDE.md** | Complete guide for using Custom Prompts |
| **QUICK_START_OPENAI.md** | Quick setup guide |
| **OPENAI_SETUP.md** | Comprehensive API documentation |
| **.env.example** | Environment variable template |

---

## 🗂️ Database Structure

**Table:** `prompt_templates`

Key fields:
- `assistant_id` - Your OpenAI Assistant ID (e.g., `asst_xxxxx`)
- `name` - Unique identifier (e.g., `my_custom`)
- `display_name` - Human-readable name
- `is_active` - Enable/disable template
- `is_default` - Set as default template

**Note:** Fields like `model`, `temperature`, `max_tokens` are only used for fallback inline prompts. When `assistant_id` is set, these are ignored (configured in OpenAI).

---

## 🔄 How It Works

1. User fills worksheet form on `/ai/generate` page
2. Frontend calls `/api/ai/generate` with selections
3. API fetches `assistant_id` from database
4. API creates OpenAI thread and runs assistant
5. Assistant generates worksheet using your custom prompt
6. API returns formatted worksheet data
7. Frontend displays the worksheet

---

## 🚀 Next Steps

### 1. Run Database Migrations (Required)

```sql
-- In Supabase Dashboard → SQL Editor:

-- Migration 1: Users table (if not already done)
-- Run: supabase/migrations/create_users_table.sql

-- Migration 2: Prompt templates
-- Run: supabase/migrations/create_prompt_templates.sql
```

### 2. Create Your Custom Prompt in OpenAI

1. Go to [platform.openai.com/assistants](https://platform.openai.com/assistants)
2. Click **Create Assistant**
3. Configure:
   - **Model:** `gpt-4o` (recommended)
   - **Response format:** `json_object`
   - **Instructions:** Use template from `CUSTOM_PROMPTS_GUIDE.md`
4. Copy the **Assistant ID** (e.g., `asst_abc123xyz`)

### 3. Add Assistant to Database

```sql
-- Replace asst_xxxxx with your actual Assistant ID
INSERT INTO prompt_templates (
  name,
  display_name,
  description,
  assistant_id,
  is_active,
  is_default
)
VALUES (
  'worksheet_generator',
  'Worksheet Generator',
  'My custom worksheet prompt',
  'asst_YOUR_ASSISTANT_ID_HERE',
  true,
  true  -- Set as default
);
```

### 4. Add API Key to Environment

Create `.env.local` in project root:
```env
OPENAI_API_KEY=sk-proj-your-key-here

# Existing Supabase config:
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key
```

### 5. Test It!

```bash
npm run dev
```

Go to `http://localhost:3000/ai/generate` and generate a worksheet!

---

## 💡 Key Advantages

### Using Custom Prompts (Assistants):

✅ **No code changes** - Edit prompts in OpenAI web interface  
✅ **No redeployment** - Changes take effect immediately  
✅ **Visual configuration** - Set model, temperature, etc. in UI  
✅ **Simple setup** - Just API key + Assistant ID  
✅ **Non-technical friendly** - Edit prompts without coding  

### vs. Inline Prompts:

❌ Requires code changes  
❌ Need to redeploy for updates  
❌ Manage settings in .env files  
❌ More configuration needed  

---

## 🔧 Configuration Options

### Option 1: Use Custom Prompt (Recommended)

```javascript
// In pages/ai/generate.js:
body: JSON.stringify({
  subject: selectedSubject.name,
  grade: selectedGrade.name,
  worksheetType: worksheetType,
  promptTemplateName: 'worksheet_generator' // Uses assistant_id from DB
})
```

### Option 2: Pass Assistant ID Directly

```javascript
body: JSON.stringify({
  subject: selectedSubject.name,
  grade: selectedGrade.name,
  worksheetType: worksheetType,
  assistantId: 'asst_xxxxx' // Direct ID
})
```

---

## 📊 Cost Estimates

**Using GPT-4o (Recommended):**
- ~$0.02-0.04 per worksheet
- 100 worksheets/month ≈ $3
- 500 worksheets/month ≈ $15

**Monitor usage:** [platform.openai.com/usage](https://platform.openai.com/usage)

---

## 🐛 Troubleshooting

### "OpenAI API key is not configured"
- Add `OPENAI_API_KEY` to `.env.local`
- Restart dev server

### "Assistant run failed"
- Verify Assistant ID is correct
- Check assistant exists in OpenAI dashboard
- Ensure response format is `json_object`

### Worksheet quality issues
- Edit prompt in OpenAI platform
- Adjust reasoning effort to `high`
- Add more specific instructions

---

## 📁 File Structure

```
your-project/
├── pages/
│   ├── ai/
│   │   └── generate.js          # Worksheet generation UI
│   └── api/
│       ├── ai/
│       │   └── generate.js      # OpenAI integration API
│       └── prompt-templates.js   # Template management API
├── supabase/
│   └── migrations/
│       ├── create_users_table.sql
│       └── create_prompt_templates.sql
├── .env.local                    # Your API keys (not in git)
├── .env.example                  # Template
├── CUSTOM_PROMPTS_GUIDE.md      # Main guide
├── QUICK_START_OPENAI.md        # Quick start
└── OPENAI_SETUP.md              # Comprehensive docs
```

---

## ✅ Implementation Checklist

- [ ] OpenAI account created
- [ ] API key obtained
- [ ] `.env.local` created with API key
- [ ] Dev server restarted
- [ ] Users table migration run
- [ ] Prompt templates migration run
- [ ] Custom prompt/assistant created in OpenAI
- [ ] Assistant ID copied
- [ ] Assistant ID added to database
- [ ] Test worksheet generation successful
- [ ] Reviewed documentation
- [ ] Ready for production

---

## 🎓 Learn More

- **CUSTOM_PROMPTS_GUIDE.md** - Detailed setup and best practices
- **QUICK_START_OPENAI.md** - 5-minute setup guide
- **OPENAI_SETUP.md** - API reference and advanced features
- [OpenAI Assistants Docs](https://platform.openai.com/docs/assistants)
- [OpenAI Pricing](https://openai.com/pricing)

---

## 🎉 You're Ready!

Your app now generates AI-powered worksheets using OpenAI Custom Prompts.

**Next:** Create your custom prompt in OpenAI platform and start generating!
