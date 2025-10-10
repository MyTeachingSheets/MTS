# OpenAI Integr### Step 2: Add Environment Variables

Create or update your `.env.local` file in the project root:

```env
# OpenAI Configuration - ONLY API KEY NEEDED!
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# That's it! If you're using Custom Prompts (recommended),
# all other settings (model, temperature, etc.) are configured
# in the OpenAI platform. See CUSTOM_PROMPTS_GUIDE.md

# Existing Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note:** Model settings like GPT-4o, temperature, max tokens, etc. are configured in your Custom Prompt in the OpenAI platform, not in environment variables!ck Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies ✅
Already done! The `openai` package has been installed.

### Step 2: Get Your OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-proj-...`)

### Step 3: Configure Environment Variables

1. Open your `.env.local` file (or create it in the project root)
2. Add your OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
OPENAI_MODEL=gpt-4o
```

3. Save the file

### Step 4: Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Run Database Migrations

You need to run TWO SQL migrations in your Supabase dashboard:

#### Migration 1: Users Table (if not already done)
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of: `supabase/migrations/create_users_table.sql`
3. Paste and click **Run**

#### Migration 2: Prompt Templates Table
1. Still in SQL Editor
2. Copy contents of: `supabase/migrations/create_prompt_templates.sql`
3. Paste and click **Run**

This creates 4 default prompt templates:
- **Standard Educational** (default)
- **Creative & Engaging**
- **Rigorous & Standards-Aligned**
- **Quick Practice**

### Step 6: Test the Integration

1. Go to `/ai/generate` page in your browser
2. Fill in the form:
   - Select Subject
   - Select Grade
   - Select Worksheet Type
   - Add optional custom instructions
3. Click **Generate Worksheet**
4. Wait ~10-30 seconds for AI generation
5. Success! 🎉

---

## 📁 What Was Created

### New Files

1. **`pages/api/ai/generate.js`**
   - OpenAI integration endpoint
   - Generates worksheets using GPT-4
   - Handles prompt templates
   - Returns structured JSON

2. **`pages/api/prompt-templates.js`**
   - Manage prompt templates
   - GET: Fetch available templates
   - POST/PUT/DELETE: Admin operations

3. **`supabase/migrations/create_prompt_templates.sql`**
   - Database table for prompt templates
   - Includes 4 default templates
   - Row Level Security enabled

4. **`OPENAI_SETUP.md`**
   - Comprehensive documentation
   - API reference
   - Customization guide
   - Cost management tips

5. **`.env.example`**
   - Template for environment variables
   - Shows required configuration

### Modified Files

1. **`pages/ai/generate.js`**
   - Updated to call real OpenAI API
   - Removed mock generation
   - Added AI metadata tracking

2. **`package.json`**
   - Added `openai` dependency

---

## 🎯 How It Works

### Workflow

```
User fills form → Frontend validates → Calls /api/ai/generate → 
Fetches prompt template → Builds prompts → Calls OpenAI API →
Parses JSON response → Returns worksheet data → Frontend displays
```

### Prompt System (Two Options)

#### Option 1: Custom Prompts (Recommended)
Create prompts in OpenAI platform with unique IDs:
- Edit prompts in OpenAI web interface
- No code changes needed to update prompts
- Configure model settings visually
- **See CUSTOM_PROMPTS_GUIDE.md for full setup**

#### Option 2: Inline Prompts
Store prompts in your database:
1. **System Prompt**: Defines AI role and output format
2. **User Prompt**: Contains specific requirements (subject, grade, etc.)
3. **Template System**: Store multiple prompt styles in database

### Example Request

```javascript
POST /api/ai/generate
{
  "subject": "Mathematics",
  "grade": "Grade 3",
  "worksheetType": "Practice",
  "lesson": "Multiplication",
  "customInstructions": "Focus on 2-digit multiplication",
  "promptTemplateName": "creative"  // Optional
}
```

### Example Response

```javascript
{
  "success": true,
  "worksheet": {
    "title": "Grade 3 Math - Multiplication Practice",
    "sections": [...],
    "answerKey": {...}
  },
  "metadata": {
    "model": "gpt-4o",
    "tokensUsed": 1250
  }
}
```

---

## 🎨 Using Prompt Templates

### Default Templates

After running the migration, you have 4 templates:

1. **`default`** - Standard educational content
2. **`creative`** - Story-based, engaging content
3. **`rigorous`** - Standards-aligned, academic
4. **`quick`** - Short, focused practice

### Using a Template (Frontend)

Modify the generate API call:

```javascript
// In pages/ai/generate.js, in handleGenerate function:
body: JSON.stringify({
  subject: selectedSubject.name,
  grade: selectedGrade.name,
  worksheetType: worksheetType,
  customInstructions: prompt,
  promptTemplateName: 'creative'  // Add this line
})
```

### Fetching Available Templates

```javascript
const response = await fetch('/api/prompt-templates')
const data = await response.json()
console.log(data.templates) // Array of templates
```

### Creating Custom Templates (Admin)

```javascript
await fetch('/api/prompt-templates', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'my_template',
    display_name: 'My Custom Template',
    description: 'For special worksheets',
    system_prompt: 'You are...',
    is_default: false
  })
})
```

---

## 💰 Cost Estimates

### Per Worksheet Cost

| Model | Typical Cost | Speed |
|-------|-------------|-------|
| GPT-4o | $0.02-0.04 | Fast (10-20s) |
| GPT-4 Turbo | $0.04-0.08 | Medium (15-30s) |
| GPT-3.5 Turbo | $0.002-0.004 | Very Fast (5-10s) |

### Monthly Estimates

- **100 worksheets/month with GPT-4o**: ~$3
- **500 worksheets/month with GPT-4o**: ~$15
- **1000 worksheets/month with GPT-4o**: ~$30

**Recommendation**: Start with GPT-4o for best quality. Switch to GPT-3.5 Turbo if cost becomes an issue.

---

## 🔧 Customization

### Change Default Model

In `.env.local`:
```env
OPENAI_MODEL=gpt-3.5-turbo  # For lower cost
```

### Adjust Response Length

In `pages/api/ai/generate.js`:
```javascript
max_tokens: 4000,  // Increase for longer worksheets
```

### Modify Temperature

In `pages/api/ai/generate.js`:
```javascript
temperature: 0.7,  // 0.3-0.5 = consistent, 0.7-0.9 = creative
```

### Edit Default Prompt

Edit `buildSystemPrompt()` in `pages/api/ai/generate.js`:
```javascript
function buildSystemPrompt() {
  return `You are an expert...
  
  // Add your customizations here:
  - Always include diagrams
  - Use simple language
  - Add fun facts
  `
}
```

---

## 🐛 Troubleshooting

### "OpenAI API key is not configured"
- Check `.env.local` has `OPENAI_API_KEY`
- Restart dev server after adding

### "Invalid OpenAI API key"
- Verify key is correct (starts with `sk-proj-`)
- Check key is active in OpenAI dashboard

### "Rate limit exceeded"
- Wait a few minutes
- Check usage limits in OpenAI dashboard
- Consider upgrading OpenAI plan

### "Failed to parse AI response"
- AI didn't return valid JSON
- Try increasing `max_tokens`
- Adjust system prompt for clarity

### Worksheets are low quality
- Switch from GPT-3.5 to GPT-4o
- Make `customInstructions` more specific
- Try different prompt templates
- Lower temperature for more consistent results

---

## 📊 Monitoring

### View API Usage

Check OpenAI dashboard: [platform.openai.com/usage](https://platform.openai.com/usage)

### Log Requests

Add logging to your API:

```javascript
// In pages/api/ai/generate.js
console.log('Generated worksheet:', {
  subject,
  grade,
  model: completion.model,
  tokens: completion.usage.total_tokens,
  cost: calculateCost(completion.usage.total_tokens)
})
```

---

## 🚀 Next Steps

1. ✅ Test worksheet generation
2. 📝 Try different prompt templates
3. 🎨 Customize prompts for your needs
4. 💾 Set up worksheet storage in Supabase
5. 📊 Add usage tracking
6. 🔒 Implement rate limiting
7. 🚀 Deploy to production

---

## 📚 Additional Resources

- Full documentation: `OPENAI_SETUP.md`
- Prompt templates: `supabase/migrations/create_prompt_templates.sql`
- API code: `pages/api/ai/generate.js`
- Frontend code: `pages/ai/generate.js`

---

## ✅ Checklist

- [ ] OpenAI API key added to `.env.local`
- [ ] Dev server restarted
- [ ] Users table migration run
- [ ] Prompt templates migration run
- [ ] Test worksheet generation successful
- [ ] Reviewed cost estimates
- [ ] Customized prompts (optional)
- [ ] Set up monitoring (optional)

---

**Ready to generate worksheets with AI!** 🎉

If you have questions or issues, check `OPENAI_SETUP.md` for detailed troubleshooting.
