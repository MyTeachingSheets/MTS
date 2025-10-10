# Using OpenAI Custom Prompts (Assistants) - Complete Guide

## 🎯 Overview

This guide shows you how to use **Custom Prompts** (OpenAI Assistants) that you create in the OpenAI platform instead of embedding prompts in your code.

### What are Custom Prompts?

Custom Prompts (Assistants) in OpenAI allow you to:
- ✅ Create and edit prompts in the OpenAI web interface
- ✅ Configure **ALL model settings** in OpenAI (text format, model, reasoning, verbosity, temperature)
- ✅ Store prompts with unique IDs (e.g., `asst_xxxxx`)
- ✅ Reuse prompts across multiple applications
- ✅ Update prompts **without changing code or redeploying**
- ✅ **No need to manage model settings in your .env file** - everything is in OpenAI!

### What You Need

**Just 2 things:**
1. ✅ OpenAI API Key (`OPENAI_API_KEY` in `.env.local`)
2. ✅ Assistant ID (stored in database: `assistant_id` field)

That's it! All model settings are configured in the OpenAI platform.

---

## 📋 Step-by-Step Setup

### Step 1: Create a Custom Prompt in OpenAI Platform

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Navigate to **Assistants** (or **Custom GPTs** depending on your plan)
3. Click **Create** → **Assistant**
4. Configure your assistant:

#### Model Settings
- **Model**: `text` (or choose gpt-4o, gpt-4-turbo)
- **Text format**: `text` or `json_object` (choose `json_object` for worksheets)
- **Reasoning effort**: `medium` (or low/high based on complexity)
- **Verbosity**: `medium` (controls response length)
- **Store logs**: ✅ Enable to track usage

#### Instructions (System Prompt)
```
You are an expert educational content creator specializing in generating high-quality worksheets for teachers.

Create comprehensive, age-appropriate worksheets based on the provided educational criteria.

IMPORTANT: Respond with ONLY valid JSON in this exact format:

{
  "title": "Worksheet title",
  "description": "Brief description",
  "subject": "Subject name",
  "grade": "Grade level",
  "estimatedTime": 30,
  "totalMarks": 20,
  "instructions": "Instructions for students",
  "sections": [
    {
      "id": "section_1",
      "title": "Section Title",
      "type": "questions",
      "instructions": "Section-specific instructions",
      "questions": [
        {
          "id": "q1",
          "number": 1,
          "type": "multiple_choice",
          "text": "Question text",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Why this is correct",
          "marks": 1,
          "difficulty": "easy"
        }
      ]
    }
  ],
  "answerKey": {
    "q1": "A"
  }
}

Question types: multiple_choice, short_answer, long_answer, true_false, fill_in_blank, matching, calculation
Difficulty levels: easy, medium, hard

Ensure content is:
- Age-appropriate for specified grade level
- Aligned with educational standards
- Clear and unambiguous
- Error-free
- Educationally valuable
```

5. **Save** your assistant
6. **Copy the Assistant ID** (format: `asst_xxxxxxxxxxxxx`)

---

### Step 2: Add Assistant ID to Your Database

You have two options:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → **SQL Editor**
2. Run this query (replace with your actual Assistant ID):

```sql
INSERT INTO public.prompt_templates (
  name,
  display_name,
  description,
  assistant_id,
  model,
  temperature,
  response_format,
  is_active,
  is_default
)
VALUES (
  'my_custom',                    -- Unique name (lowercase, no spaces)
  'My Custom Worksheet Generator', -- Display name
  'Uses my custom prompt created in OpenAI platform',
  'asst_YOUR_ASSISTANT_ID_HERE',  -- ⚠️ Replace with your actual Assistant ID
  'gpt-4o',                       -- Model (matches your assistant settings)
  0.7,                            -- Temperature (0.0-2.0)
  'json_object',                  -- Response format
  true,                           -- Is active
  false                           -- Is default (set true if you want this as default)
);
```

3. Click **Run**

#### Option B: Using API (For Admin Panel)

```javascript
await fetch('/api/prompt-templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'my_custom',
    display_name: 'My Custom Worksheet Generator',
    description: 'Uses my custom prompt from OpenAI platform',
    assistant_id: 'asst_YOUR_ASSISTANT_ID_HERE',
    model: 'gpt-4o',
    temperature: 0.7,
    response_format: 'json_object',
    is_active: true,
    is_default: false
  })
})
```

---

### Step 3: Use Your Custom Prompt

#### Option A: Set as Default

If you set `is_default: true`, it will be used automatically for all worksheet generations.

#### Option B: Specify by Name

Update your frontend to use the custom prompt:

In `pages/ai/generate.js`, modify the `handleGenerate` function:

```javascript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subject: selectedSubject.name,
    grade: selectedGrade.name,
    worksheetType: worksheetType,
    customInstructions: prompt,
    promptTemplateName: 'my_custom' // 👈 Add this line
  })
})
```

#### Option C: Pass Assistant ID Directly

```javascript
body: JSON.stringify({
  subject: selectedSubject.name,
  grade: selectedGrade.name,
  worksheetType: worksheetType,
  customInstructions: prompt,
  assistantId: 'asst_YOUR_ASSISTANT_ID_HERE' // 👈 Direct ID
})
```

---

## 🎨 Custom Prompt Best Practices

### 1. JSON Response Format

Always use `json_object` format and specify the exact JSON structure in your instructions.

**Good:**
```
Respond with ONLY valid JSON in this format:
{
  "title": "...",
  "sections": [...]
}
```

**Bad:**
```
Create a worksheet.
```

### 2. Clear Instructions

Be specific about what you want:

```
Create 15-20 questions appropriate for Grade 3 students.
Include:
- 5 easy questions
- 7 medium questions
- 3 hard questions
Mix question types: multiple choice, short answer, and true/false.
```

### 3. Variables in Prompts

The user message sent to your assistant includes:
- `subject`: Mathematics, Science, etc.
- `grade`: Grade 1, Grade 2, etc.
- `worksheetType`: Practice, Quiz, Test, etc.
- `lesson`: Specific lesson topic
- `lessonDescription`: Detailed lesson description
- `customInstructions`: Teacher's additional requirements

Example user message:
```
Generate a Practice worksheet with the following specifications:

Subject: Mathematics
Grade Level: Grade 3
Educational Framework: CCSS
Lesson Topic: Multiplication Basics
Lesson Description: Introduction to multiplication as repeated addition

Worksheet Type: Practice

Additional Instructions:
Include word problems about animals

Create 15-20 practice problems with varying difficulty levels. Include a mix of question types.
```

---

## 🔧 Advanced Configuration

### Model Settings Explained

#### Text Format
- `text`: Free-form text response
- `json_object`: Structured JSON (recommended for worksheets)

#### Reasoning Effort
- `low`: Fast, simple responses
- `medium`: Balanced (recommended)
- `high`: More thoughtful, detailed responses (slower, more expensive)

#### Verbosity
- `low`: Concise responses
- `medium`: Balanced (recommended)
- `high`: Detailed, explanatory responses

#### Temperature (0.0 - 2.0)
- `0.0-0.3`: Very consistent, predictable (good for math)
- `0.5-0.7`: Balanced (recommended)
- `0.8-1.0`: More creative, varied (good for creative writing)
- `1.0-2.0`: Very creative, unpredictable

---

## 📊 Managing Multiple Custom Prompts

### Example: Different Prompts for Different Subjects

```sql
-- Math Worksheet Assistant
INSERT INTO prompt_templates (name, display_name, assistant_id, is_active)
VALUES ('math_assistant', 'Math Worksheet Generator', 'asst_math_xxxxx', true);

-- Science Worksheet Assistant
INSERT INTO prompt_templates (name, display_name, assistant_id, is_active)
VALUES ('science_assistant', 'Science Worksheet Generator', 'asst_science_xxxxx', true);

-- English Worksheet Assistant
INSERT INTO prompt_templates (name, display_name, assistant_id, is_active)
VALUES ('english_assistant', 'English Worksheet Generator', 'asst_english_xxxxx', true);
```

### Dynamic Selection Based on Subject

In your frontend:

```javascript
function getAssistantBySubject(subject) {
  const mapping = {
    'Mathematics': 'math_assistant',
    'Science': 'science_assistant',
    'English': 'english_assistant'
  }
  return mapping[subject] || 'default'
}

// In handleGenerate:
const promptTemplate = getAssistantBySubject(selectedSubject.name)

const response = await fetch('/api/ai/generate', {
  method: 'POST',
  body: JSON.stringify({
    subject: selectedSubject.name,
    grade: selectedGrade.name,
    worksheetType: worksheetType,
    promptTemplateName: promptTemplate
  })
})
```

---

## 🐛 Troubleshooting

### Error: "Assistant run failed"

**Causes:**
- Invalid Assistant ID
- Assistant was deleted in OpenAI platform
- Assistant has errors in its configuration

**Solutions:**
1. Verify Assistant ID is correct
2. Check assistant still exists in OpenAI dashboard
3. Test assistant directly in OpenAI playground

### Error: "Assistant run timed out"

**Cause:** Response took longer than 60 seconds

**Solutions:**
1. Simplify your prompt instructions
2. Reduce worksheet complexity
3. Increase timeout in code:
```javascript
const maxAttempts = 120 // Increase from 60 to 120 seconds
```

### Error: "No response from assistant"

**Cause:** Assistant didn't generate any output

**Solutions:**
1. Check assistant instructions are clear
2. Ensure user message has all required information
3. Test with simpler requirements first

### Worksheet Quality Issues

**Problem:** Generated content is poor quality

**Solutions:**
1. Refine your assistant instructions
2. Increase reasoning effort to `high`
3. Use GPT-4o instead of GPT-3.5
4. Add more specific examples in instructions
5. Adjust temperature (lower = more consistent)

---

## 💰 Cost Comparison

### Assistants API vs Chat Completions API

**Assistants API** (Custom Prompts):
- ✅ Easier to manage and update prompts
- ✅ Configure in web interface (non-technical)
- ✅ Built-in conversation memory (threads)
- ⚠️ Slightly higher cost (~10-20% more)
- ⚠️ Slower response time (threading overhead)

**Chat Completions API** (Inline Prompts):
- ✅ Faster response time
- ✅ Lower cost
- ✅ More control in code
- ⚠️ Requires code changes to update prompts
- ⚠️ No built-in conversation memory

**Recommendation:** Use Assistants API for easier prompt management, especially if you're non-technical or want to iterate quickly on prompts.

---

## 📈 Monitoring & Optimization

### View Assistant Usage

1. Go to OpenAI Dashboard → **Usage**
2. Filter by Assistant ID
3. Monitor:
   - Requests per day
   - Token usage
   - Cost
   - Errors

### Optimize Performance

1. **Cache common worksheets** in your database
2. **Rate limit users** to prevent abuse
3. **Use cheaper models** for simple worksheets
4. **Batch similar requests** when possible

---

## 🚀 Next Steps

1. ✅ Create your custom prompt in OpenAI platform
2. ✅ Copy the Assistant ID
3. ✅ Add to database using SQL or API
4. ✅ Test worksheet generation
5. 📝 Refine prompt based on results
6. 🎨 Create specialized prompts for different subjects
7. 📊 Monitor usage and costs
8. 🚀 Deploy to production

---

## 📚 Related Documentation

- [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview)
- [Creating Assistants](https://platform.openai.com/docs/assistants/how-it-works)
- [Assistant Pricing](https://openai.com/pricing)
- [OPENAI_SETUP.md](./OPENAI_SETUP.md) - General OpenAI integration
- [QUICK_START_OPENAI.md](./QUICK_START_OPENAI.md) - Quick start guide

---

## ✅ Checklist

- [ ] Created custom prompt/assistant in OpenAI platform
- [ ] Configured model settings (text format, reasoning, verbosity)
- [ ] Wrote clear, specific instructions
- [ ] Set response format to `json_object`
- [ ] Copied Assistant ID
- [ ] Added Assistant ID to database
- [ ] Tested worksheet generation
- [ ] Verified JSON response format
- [ ] Optimized prompt based on results
- [ ] Set up usage monitoring

---

**Ready to use custom prompts!** 🎉

Your prompts are now managed in the OpenAI platform, making it easy to update and refine them without touching code.
