# OpenAI Integration Setup Guide

## 🎯 Overview

This guide explains how to integrate OpenAI API to generate AI-powered worksheets for your teaching platform.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [API Endpoint](#api-endpoint)
5. [Prompt Templates](#prompt-templates)
6. [Usage Examples](#usage-examples)
7. [Customization](#customization)
8. [Troubleshooting](#troubleshooting)
9. [Cost Management](#cost-management)

---

## ✅ Prerequisites

- OpenAI account with API access
- OpenAI API key
- Node.js project with Next.js

---

## 📦 Installation

The OpenAI SDK has already been installed:

```bash
npm install openai
```

**Package installed:** `openai` (official OpenAI Node.js SDK)

---

## 🔧 Configuration

### Step 1: Get Your OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (you won't be able to see it again!)

### Step 2: Add Environment Variables

Create or update your `.env.local` file in the project root:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o

# Optional: Use GPT-4 Turbo for faster responses
# OPENAI_MODEL=gpt-4-turbo-preview

# Optional: Use GPT-3.5 for lower cost
# OPENAI_MODEL=gpt-3.5-turbo

# Existing Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 3: Restart Development Server

After adding environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🚀 API Endpoint

### Endpoint: `/api/ai/generate`

**Method:** POST

**Request Body:**

```json
{
  "subject": "Mathematics",
  "framework": "CCSS",
  "grade": "Grade 3",
  "lesson": "Multiplication Basics",
  "lessonDescription": "Introduction to multiplication as repeated addition",
  "worksheetType": "Practice",
  "customInstructions": "Include word problems about animals"
}
```

**Response:**

```json
{
  "success": true,
  "worksheet": {
    "title": "Grade 3 Mathematics - Multiplication Basics Practice",
    "description": "Practice worksheet on multiplication basics",
    "subject": "Mathematics",
    "grade": "Grade 3",
    "estimatedTime": 30,
    "totalMarks": 20,
    "instructions": "Complete all questions. Show your work.",
    "sections": [
      {
        "id": "section_1",
        "title": "Basic Multiplication",
        "type": "questions",
        "instructions": "Solve each multiplication problem.",
        "questions": [
          {
            "id": "q1",
            "number": 1,
            "type": "multiple_choice",
            "text": "What is 3 × 4?",
            "options": ["7", "12", "15", "16"],
            "correctAnswer": "12",
            "explanation": "3 × 4 means 3 groups of 4, which equals 12",
            "marks": 1,
            "difficulty": "easy"
          }
        ]
      }
    ],
    "answerKey": {
      "q1": "12"
    }
  },
  "metadata": {
    "model": "gpt-4o",
    "tokensUsed": 1250,
    "promptTokens": 450,
    "completionTokens": 800
  }
}
```

---

## 📝 Prompt Templates

### Default System Prompt

The system prompt defines the AI's role and output format. It's located in `/pages/api/ai/generate.js` in the `buildSystemPrompt()` function.

### Customizing Prompts

You can customize prompts in two ways:

#### Method 1: Modify Default Prompt (Recommended)

Edit `/pages/api/ai/generate.js`:

```javascript
function buildSystemPrompt() {
  return `You are an expert educational content creator...
  
  // Add your custom instructions here
  // Example:
  - Always include visual elements descriptions
  - Make questions engaging and fun
  - Include real-world applications
  `
}
```

#### Method 2: Use Prompt Templates from Database

Create a `prompt_templates` table in Supabase:

```sql
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default template
INSERT INTO prompt_templates (name, description, system_prompt)
VALUES (
  'default',
  'Default worksheet generation prompt',
  'You are an expert educational content creator...'
);
```

Then modify the API to fetch prompts:

```javascript
// In /pages/api/ai/generate.js
const { data: template } = await supabase
  .from('prompt_templates')
  .select('system_prompt')
  .eq('name', 'default')
  .single()

const systemPrompt = template?.system_prompt || buildSystemPrompt()
```

---

## 💡 Usage Examples

### Example 1: Basic Worksheet Generation

```javascript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: 'Science',
    grade: 'Grade 5',
    worksheetType: 'Quiz',
    customInstructions: 'Focus on the water cycle'
  })
})

const data = await response.json()
console.log(data.worksheet)
```

### Example 2: Lesson-Specific Worksheet

```javascript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: 'Mathematics',
    framework: 'CCSS',
    grade: 'Grade 3',
    lesson: 'Fractions',
    lessonDescription: 'Understanding parts of a whole',
    worksheetType: 'Practice',
    customInstructions: 'Include visual fraction diagrams'
  })
})
```

### Example 3: Custom Prompt Template

```javascript
const customPrompt = `You are a creative teacher assistant...`

const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: 'English',
    grade: 'Grade 4',
    worksheetType: 'Vocabulary',
    promptTemplate: customPrompt // Override default prompt
  })
})
```

---

## 🎨 Customization

### Adjusting Question Count by Type

Edit `getWorksheetTypeGuidance()` in `/pages/api/ai/generate.js`:

```javascript
function getWorksheetTypeGuidance(worksheetType) {
  const guidance = {
    'Practice': 'Create 20-25 practice problems...',
    'Quiz': 'Create 15 quiz questions...',
    // Add your custom types
    'Mini Quiz': 'Create 5 quick questions...',
    'Challenge': 'Create 10 advanced problems...'
  }
  return guidance[worksheetType] || 'Default guidance...'
}
```

### Changing AI Model

In `.env.local`, modify the model:

```env
# Best quality (most expensive)
OPENAI_MODEL=gpt-4o

# Balanced (recommended)
OPENAI_MODEL=gpt-4-turbo-preview

# Fast & cheap
OPENAI_MODEL=gpt-3.5-turbo
```

### Adjusting Temperature

In `/pages/api/ai/generate.js`:

```javascript
const completion = await openai.chat.completions.create({
  model: process.env.OPENAI_MODEL || 'gpt-4o',
  temperature: 0.7, // Lower = more focused, Higher = more creative
  // 0.3-0.5: Consistent, factual content
  // 0.7-0.9: Creative, varied content
})
```

---

## 🔍 Troubleshooting

### Error: "OpenAI API key is not configured"

**Solution:** Check your `.env.local` file:
- Ensure `OPENAI_API_KEY` is set
- Restart your dev server after adding it
- The key should start with `sk-`

### Error: "Invalid OpenAI API key"

**Solution:**
- Verify the key is correct (no extra spaces)
- Check if the key is still active in OpenAI dashboard
- Generate a new key if needed

### Error: "Rate limit exceeded"

**Solution:**
- You've hit OpenAI's rate limit
- Wait a few minutes before retrying
- Consider upgrading your OpenAI plan
- Implement rate limiting on your frontend

### Error: "Failed to parse AI response"

**Solution:**
- The AI didn't return valid JSON
- Check the `rawResponse` in the error
- Adjust the system prompt to be more specific
- Increase `max_tokens` if response was cut off

### Worksheet Quality Issues

**Solutions:**
- Make `customInstructions` more specific
- Adjust the system prompt for better guidance
- Try different temperature settings
- Use GPT-4 instead of GPT-3.5 for better quality

---

## 💰 Cost Management

### OpenAI Pricing (as of 2024)

| Model | Input (per 1K tokens) | Output (per 1K tokens) |
|-------|----------------------|------------------------|
| GPT-4o | $0.005 | $0.015 |
| GPT-4 Turbo | $0.01 | $0.03 |
| GPT-3.5 Turbo | $0.0005 | $0.0015 |

### Estimated Costs Per Worksheet

- **GPT-4o:** ~$0.02-0.04 per worksheet
- **GPT-4 Turbo:** ~$0.04-0.08 per worksheet
- **GPT-3.5 Turbo:** ~$0.002-0.004 per worksheet

### Cost Optimization Tips

1. **Use GPT-3.5 Turbo for development/testing**
2. **Cache common worksheets** to avoid regeneration
3. **Set token limits** to prevent excessive usage
4. **Monitor usage** in OpenAI dashboard
5. **Implement user rate limiting** (e.g., 10 worksheets/day)

### Adding Usage Tracking

Create a table to track API usage:

```sql
CREATE TABLE ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  worksheet_type TEXT,
  model TEXT,
  tokens_used INTEGER,
  estimated_cost DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Add logging to API:

```javascript
// After successful generation
await supabase.from('ai_usage_logs').insert({
  user_id: session?.user?.id,
  worksheet_type: worksheetType,
  model: completion.model,
  tokens_used: completion.usage.total_tokens,
  estimated_cost: calculateCost(completion.usage, completion.model)
})
```

---

## 🧪 Testing

### Test the API Endpoint

```bash
# Using curl
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Math",
    "grade": "Grade 3",
    "worksheetType": "Practice",
    "customInstructions": "Simple addition problems"
  }'
```

### Test in Browser Console

```javascript
fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: 'Science',
    grade: 'Grade 4',
    worksheetType: 'Quiz'
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

---

## 🎓 Next Steps

1. ✅ **Configure your OpenAI API key** in `.env.local`
2. ✅ **Test the generation** on the `/ai/generate` page
3. 📊 **Set up usage tracking** (optional)
4. 🎨 **Customize prompts** for your specific needs
5. 💾 **Store worksheets** in Supabase for reuse
6. 🚀 **Deploy to production** (Vercel will use environment variables)

---

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/pricing)
- [Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)

---

## 🔐 Security Notes

- ⚠️ **Never expose your API key** in client-side code
- ⚠️ **Keep `.env.local` in `.gitignore`**
- ⚠️ **Use environment variables** in Vercel for production
- ⚠️ **Implement rate limiting** to prevent abuse
- ⚠️ **Monitor API usage** regularly

---

## 📞 Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review OpenAI's [status page](https://status.openai.com/)
3. Check your API key and billing status
4. Review the console logs for detailed error messages
