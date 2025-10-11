# Custom Worksheet Types - User Guide

## Overview
Each authenticated user can now create their own custom worksheet types with specific question formats and JSON structure for AI generation.

## Features Implemented

### 1. Database Schema (`custom_worksheet_types` table)
- **user_id**: Links to auth.users (only owner can see/edit)
- **name**: Custom type name
- **description**: Optional description
- **question_types**: Array of question type objects with type, count, marks
- **json_schema**: Complete JSON structure for AI to follow
- **RLS Policies**: Users can only access their own custom types

### 2. API Endpoints (`/api/worksheet-types/custom`)
- **GET**: List user's custom types
- **POST**: Create new custom type
- **PUT**: Update existing custom type
- **DELETE**: Delete custom type

### 3. Enhanced CustomWorksheetTypeModal
- **Description field**: Optional description for custom type
- **Question type builder**: Select types (multiple choice, short answer, essay, etc.)
- **Automatic JSON schema generation**: System generates JSON structure based on selected question types
- **Question type schemas**:
  - Multiple Choice: Includes options array and correct_answer
  - Short Answer/Essay: Includes answer field
  - Fill in Blank: Text with _____ placeholders + answers array
  - Matching: left_items, right_items, correct_pairs
  - True/False: options and correct_answer

### 4. AI Integration
- When custom type is selected, its JSON schema is included in the AI prompt
- AI generates worksheets following the exact structure defined in the schema
- Default types use standard guidance without custom schemas

### 5. Generate Page Updates
- Loads user's custom types on mount (merged with default types)
- Shows custom types in dropdown with "CREATE_NEW" option
- Passes JSON schema to AI API when custom type is selected
- Saves custom types to database with authentication

## Setup Instructions

### 1. Run Database Migration
```bash
# Apply the migration to create the custom_worksheet_types table
cd /Users/sahithsambodhi/Desktop/TPT/0.\ APP\ SCRIPT/next.js
npx supabase db push supabase/migrations/create_custom_worksheet_types.sql

# Or use Supabase dashboard SQL editor and paste the migration file
```

### 2. Restart Dev Server
```bash
npm run dev
```

## How to Use

### Creating a Custom Worksheet Type

1. **Sign in** to your account
2. Go to **AI Generate** page
3. In the **Worksheet Type** dropdown, select **"Create new"**
4. In the modal that opens:
   - Enter a **name** (e.g., "Grade 6 Science Quiz")
   - Add an optional **description**
   - Set **estimated time**
   - Click **"Add in groups"** or **"Add individually"**
   - Select **question types** and configure:
     - Type (multiple choice, short answer, etc.)
     - Count (how many questions of this type)
     - Marks per question
     - Options (for multiple choice)
5. Click **"Create"**

The system automatically:
- Generates a JSON schema based on your question types
- Saves it to the database
- Adds it to your worksheet type dropdown
- Selects it for immediate use

### Using a Custom Type

1. Select your custom type from the **Worksheet Type** dropdown
2. Fill in Subject, Grade, and other details
3. Click **"Generate Worksheet"**

The AI will follow your custom JSON structure exactly, creating questions in the format you specified.

### JSON Schema Example

When you create a custom type with:
- 5 Multiple Choice questions (2 marks each)
- 3 Short Answer questions (5 marks each)

The system generates:
```json
{
  "worksheet_title": "string",
  "framework": "string (optional)",
  "learning_objectives": ["array of strings"],
  "instructions": "string (optional)",
  "estimatedTime": "number",
  "totalMarks": "number",
  "questions": [
    {
      "number": 1,
      "type": "multiple_choice",
      "text": "string",
      "marks": 2,
      "options": ["array of strings"],
      "correct_answer": "string"
    },
    // ... 4 more multiple choice
    {
      "number": 6,
      "type": "short_answer",
      "text": "string",
      "marks": 5,
      "answer": "string"
    }
    // ... 2 more short answer
  ]
}
```

## Benefits

1. **Personalized**: Each user has their own custom types
2. **Flexible**: Mix different question types in one worksheet
3. **Consistent**: AI follows your exact structure every time
4. **Reusable**: Save favorite formats and use them repeatedly
5. **Private**: Other users cannot see or use your custom types

## Technical Details

### Question Type Schemas

Each question type has specific JSON fields:

- **multiple_choice** / **true_false**:
  ```json
  {
    "type": "multiple_choice",
    "text": "question text",
    "marks": 2,
    "options": ["A", "B", "C", "D"],
    "correct_answer": "B"
  }
  ```

- **short_answer** / **essay**:
  ```json
  {
    "type": "short_answer",
    "text": "question text",
    "marks": 5,
    "answer": "sample answer"
  }
  ```

- **fill_blank**:
  ```json
  {
    "type": "fill_blank",
    "text": "The _____ is the powerhouse of the _____",
    "marks": 2,
    "answers": ["mitochondria", "cell"]
  }
  ```

- **matching**:
  ```json
  {
    "type": "matching",
    "text": "Match the following",
    "marks": 5,
    "left_items": ["Item 1", "Item 2"],
    "right_items": ["Match A", "Match B"],
    "correct_pairs": [
      { "left": "Item 1", "right": "Match A" },
      { "left": "Item 2", "right": "Match B" }
    ]
  }
  ```

## Troubleshooting

### Custom types not showing in dropdown
- Ensure you're signed in
- Refresh the page
- Check browser console for errors

### AI not following custom schema
- Verify the JSON schema was saved correctly
- Check if the custom type is actually selected
- Look at server logs to see if schema is included in prompt

### Database errors
- Ensure migration was applied successfully
- Check Supabase logs for RLS policy issues
- Verify user is authenticated

## Future Enhancements (Optional)

- Visual JSON schema editor
- Share custom types with other users
- Import/export custom type definitions
- Template library of common worksheet formats
- Preview worksheet before generation
- Edit existing custom types
