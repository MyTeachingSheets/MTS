# Worksheet System Database Schema

This document outlines the database structure for the worksheet generation and management system.

## Tables Overview

### 1. `worksheets`
Stores generated worksheets that can be listed on the website.

```sql
CREATE TABLE worksheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100) NOT NULL,
  standard VARCHAR(100),
  grade VARCHAR(50) NOT NULL,
  domain VARCHAR(100),
  worksheet_type_id UUID REFERENCES worksheet_types(id),
  custom_instructions TEXT,
  
  -- Content
  content JSONB NOT NULL, -- Stores the actual worksheet content (questions, passages, etc.)
  
  -- Thumbnail
  thumbnail_url TEXT,
  thumbnail_uploaded BOOLEAN DEFAULT FALSE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  is_listed BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Stats
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0
);

CREATE INDEX idx_worksheets_status ON worksheets(status);
CREATE INDEX idx_worksheets_subject ON worksheets(subject);
CREATE INDEX idx_worksheets_grade ON worksheets(grade);
CREATE INDEX idx_worksheets_created_by ON worksheets(created_by);
CREATE INDEX idx_worksheets_is_listed ON worksheets(is_listed);
```

### 2. `worksheet_types`
Defines different types of worksheets (built-in and custom).

```sql
CREATE TABLE worksheet_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Configuration
  is_custom BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Default structure for this type
  default_config JSONB, -- Stores default question types, counts, marks, etc.
  
  -- Creator (null for built-in types)
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default worksheet types
INSERT INTO worksheet_types (name, description, is_custom, default_config) VALUES
('Practice', 'Standard practice worksheet with multiple question types', FALSE, '{"question_types": ["multiple_choice", "short_answer", "fill_blank"], "default_count": 20, "marks_per_question": 1}'),
('Assessment', 'Formal assessment with varied question types and marks', FALSE, '{"question_types": ["multiple_choice", "short_answer", "essay"], "default_count": 15, "marks_per_question": 2}'),
('Quiz', 'Quick quiz format with time-limited questions', FALSE, '{"question_types": ["multiple_choice", "true_false"], "default_count": 10, "marks_per_question": 1}'),
('Mixed', 'Mixed format with all question types', FALSE, '{"question_types": ["multiple_choice", "short_answer", "essay", "fill_blank", "matching"], "default_count": 25, "marks_per_question": 1}');

CREATE INDEX idx_worksheet_types_is_active ON worksheet_types(is_active);
CREATE INDEX idx_worksheet_types_created_by ON worksheet_types(created_by);
```

### 3. `worksheet_questions`
Stores individual questions for worksheets.

```sql
CREATE TABLE worksheet_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worksheet_id UUID REFERENCES worksheets(id) ON DELETE CASCADE,
  
  -- Question details
  question_number INTEGER NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- multiple_choice, short_answer, essay, fill_blank, matching, true_false
  question_text TEXT NOT NULL,
  
  -- Options and answers
  options JSONB, -- For multiple choice, matching, etc.
  correct_answer TEXT,
  
  -- Marks
  marks INTEGER DEFAULT 1,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_worksheet_questions_worksheet ON worksheet_questions(worksheet_id);
```

### 4. `worksheet_passages`
Stores reading passages that can be included in worksheets.

```sql
CREATE TABLE worksheet_passages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worksheet_id UUID REFERENCES worksheets(id) ON DELETE CASCADE,
  
  -- Passage details
  title VARCHAR(255),
  content TEXT NOT NULL,
  passage_order INTEGER DEFAULT 1,
  
  -- Metadata
  word_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_worksheet_passages_worksheet ON worksheet_passages(worksheet_id);
```

### 5. `question_type_configs`
Defines custom question type configurations for custom worksheet types.

```sql
CREATE TABLE question_type_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worksheet_type_id UUID REFERENCES worksheet_types(id) ON DELETE CASCADE,
  
  -- Question type details
  question_type VARCHAR(50) NOT NULL,
  count INTEGER NOT NULL,
  marks_per_question INTEGER DEFAULT 1,
  
  -- Configuration
  config JSONB, -- Additional configuration for this question type
  order_index INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_question_type_configs_type ON question_type_configs(worksheet_type_id);
```

### 6. `worksheet_downloads`
Tracks worksheet downloads.

```sql
CREATE TABLE worksheet_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worksheet_id UUID REFERENCES worksheets(id) ON DELETE CASCADE,
  downloaded_by UUID REFERENCES auth.users(id),
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Download details
  download_format VARCHAR(20) DEFAULT 'pdf' -- pdf, docx, etc.
);

CREATE INDEX idx_worksheet_downloads_worksheet ON worksheet_downloads(worksheet_id);
CREATE INDEX idx_worksheet_downloads_user ON worksheet_downloads(downloaded_by);
```

### 7. `worksheet_ratings`
Stores user ratings for worksheets.

```sql
CREATE TABLE worksheet_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worksheet_id UUID REFERENCES worksheets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(worksheet_id, user_id)
);

CREATE INDEX idx_worksheet_ratings_worksheet ON worksheet_ratings(worksheet_id);
CREATE INDEX idx_worksheet_ratings_user ON worksheet_ratings(user_id);
```

## JSONB Content Structure

### Worksheet Content Example
```json
{
  "version": "1.0",
  "sections": [
    {
      "id": "section_1",
      "title": "Multiple Choice Questions",
      "type": "questions",
      "questions": [
        {
          "id": "q1",
          "number": 1,
          "type": "multiple_choice",
          "text": "What is 2 + 2?",
          "options": ["2", "3", "4", "5"],
          "correct_answer": "4",
          "marks": 1
        }
      ]
    },
    {
      "id": "section_2",
      "title": "Reading Passage",
      "type": "passage",
      "content": "Long text content here...",
      "word_count": 250
    }
  ],
  "total_marks": 20,
  "estimated_time": 30
}
```

### Worksheet Type Config Example
```json
{
  "question_types": [
    {
      "type": "multiple_choice",
      "count": 10,
      "marks": 1,
      "options_count": 4
    },
    {
      "type": "short_answer",
      "count": 5,
      "marks": 2,
      "max_words": 50
    },
    {
      "type": "essay",
      "count": 1,
      "marks": 10,
      "max_words": 200
    }
  ],
  "include_passages": true,
  "passages_count": 1,
  "total_marks": 30,
  "estimated_time": 45
}
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheet_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheet_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheet_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_type_configs ENABLE ROW LEVEL SECURITY;

-- Worksheets policies
CREATE POLICY "Users can view published worksheets" ON worksheets
  FOR SELECT USING (status = 'published' AND is_listed = TRUE);

CREATE POLICY "Users can view their own worksheets" ON worksheets
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create worksheets" ON worksheets
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own worksheets" ON worksheets
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own worksheets" ON worksheets
  FOR DELETE USING (auth.uid() = created_by);

-- Worksheet types policies
CREATE POLICY "Anyone can view active worksheet types" ON worksheet_types
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can create custom worksheet types" ON worksheet_types
  FOR INSERT WITH CHECK (auth.uid() = created_by AND is_custom = TRUE);

CREATE POLICY "Users can update their custom worksheet types" ON worksheet_types
  FOR UPDATE USING (auth.uid() = created_by AND is_custom = TRUE);
```

## Storage Buckets

### Worksheet Thumbnails
```sql
-- Create storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public) VALUES ('worksheet-thumbnails', 'worksheet-thumbnails', TRUE);

-- Storage policies
CREATE POLICY "Anyone can view thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'worksheet-thumbnails');

CREATE POLICY "Authenticated users can upload thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'worksheet-thumbnails' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own thumbnails" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'worksheet-thumbnails' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Triggers and Functions

### Update worksheet rating on new rating
```sql
CREATE OR REPLACE FUNCTION update_worksheet_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE worksheets
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM worksheet_ratings
      WHERE worksheet_id = NEW.worksheet_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM worksheet_ratings
      WHERE worksheet_id = NEW.worksheet_id
    )
  WHERE id = NEW.worksheet_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_worksheet_rating_trigger
AFTER INSERT OR UPDATE ON worksheet_ratings
FOR EACH ROW
EXECUTE FUNCTION update_worksheet_rating();
```

### Update updated_at timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_worksheets_updated_at
BEFORE UPDATE ON worksheets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worksheet_types_updated_at
BEFORE UPDATE ON worksheet_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## Implementation Notes

1. **Supabase Setup**: Run the SQL scripts in your Supabase SQL editor to create tables and set up RLS policies.

2. **Storage**: Configure the storage bucket for thumbnails with appropriate size limits (e.g., 5MB max).

3. **Indexes**: The indexes are optimized for common queries (filtering by subject, grade, status, etc.).

4. **JSONB**: Using JSONB for flexible content storage allows for easy evolution of worksheet structures.

5. **RLS**: Row Level Security ensures users can only modify their own content while viewing published worksheets.

6. **Cascading Deletes**: Questions and passages are deleted automatically when a worksheet is deleted.
