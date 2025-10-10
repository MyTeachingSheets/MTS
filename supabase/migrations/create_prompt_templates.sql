-- Create prompt templates table for managing OpenAI prompts
-- This allows admins to create, edit, and manage different prompt templates
-- Supports both OpenAI Assistants API (with assistant_id) and Chat Completions API (with inline prompts)

-- Create the prompt_templates table
CREATE TABLE IF NOT EXISTS public.prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- OpenAI Assistant Configuration (RECOMMENDED - for custom prompts created in OpenAI platform)
  assistant_id TEXT, -- OpenAI Assistant ID (e.g., asst_xxxxx)
  -- When assistant_id is set, all model settings are configured in OpenAI platform
  -- The fields below (model, temperature, etc.) are IGNORED
  
  -- Inline Prompt Configuration (FALLBACK - for prompts stored in database)
  system_prompt TEXT,
  user_prompt_template TEXT,
  
  -- Model Configuration (ONLY used when assistant_id is NULL)
  model TEXT DEFAULT 'gpt-4o', -- Model to use (gpt-4o, gpt-4-turbo, gpt-3.5-turbo)
  temperature DECIMAL(3,2) DEFAULT 0.7, -- 0.0 to 2.0
  max_tokens INTEGER DEFAULT 4000,
  response_format TEXT DEFAULT 'json_object', -- json_object or text
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraint: Must have either assistant_id OR system_prompt
  CONSTRAINT has_prompt_config CHECK (
    (assistant_id IS NOT NULL) OR (system_prompt IS NOT NULL)
  )
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_prompt_templates_name ON public.prompt_templates(name);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON public.prompt_templates(is_active);

-- Enable Row Level Security
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view active prompts" ON public.prompt_templates;
  DROP POLICY IF EXISTS "Only admins can manage prompts" ON public.prompt_templates;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policies
-- Anyone can view active prompt templates
CREATE POLICY "Anyone can view active prompts" 
  ON public.prompt_templates 
  FOR SELECT 
  USING (is_active = true);

-- Only service role can manage prompt templates (for admin operations)
CREATE POLICY "Only admins can manage prompts" 
  ON public.prompt_templates 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON public.prompt_templates TO authenticated;
GRANT SELECT ON public.prompt_templates TO anon;
GRANT ALL ON public.prompt_templates TO service_role;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_prompt_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS set_prompt_templates_updated_at ON public.prompt_templates;

-- Create the trigger
CREATE TRIGGER set_prompt_templates_updated_at
  BEFORE UPDATE ON public.prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_prompt_templates_updated_at();

-- Add comments
COMMENT ON TABLE public.prompt_templates IS 'Stores OpenAI prompt templates for worksheet generation. Supports both Assistant API (custom prompts) and Chat Completions API (inline prompts)';
COMMENT ON COLUMN public.prompt_templates.name IS 'Unique identifier for the template (e.g., default, creative, formal)';
COMMENT ON COLUMN public.prompt_templates.display_name IS 'Human-readable name shown to users';
COMMENT ON COLUMN public.prompt_templates.assistant_id IS 'OpenAI Assistant ID (e.g., asst_xxxxx) for custom prompts created in OpenAI platform';
COMMENT ON COLUMN public.prompt_templates.system_prompt IS 'The system prompt that defines AI behavior (for inline prompts)';
COMMENT ON COLUMN public.prompt_templates.user_prompt_template IS 'Optional template for constructing user prompts';
COMMENT ON COLUMN public.prompt_templates.model IS 'OpenAI model to use (gpt-4o, gpt-4-turbo, gpt-3.5-turbo)';
COMMENT ON COLUMN public.prompt_templates.temperature IS 'Model temperature (0.0-2.0). Lower = more focused, Higher = more creative';
COMMENT ON COLUMN public.prompt_templates.max_tokens IS 'Maximum tokens in response';
COMMENT ON COLUMN public.prompt_templates.is_active IS 'Whether this template is currently available for use';
COMMENT ON COLUMN public.prompt_templates.is_default IS 'Whether this is the default template to use';

-- Insert default prompt template
INSERT INTO public.prompt_templates (name, display_name, description, system_prompt, is_default)
VALUES (
  'default',
  'Standard Educational',
  'Balanced prompt for generating educational worksheets with clear structure and age-appropriate content',
  'You are an expert educational content creator specializing in generating high-quality worksheets for teachers.

Your task is to create comprehensive, age-appropriate worksheets based on the provided educational criteria.

IMPORTANT: You must respond with ONLY valid JSON in the following format:

{
  "title": "Worksheet title",
  "description": "Brief description of the worksheet",
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

Question types can be: "multiple_choice", "short_answer", "long_answer", "true_false", "fill_in_blank", "matching", "calculation"

Difficulty levels: "easy", "medium", "hard"

Ensure all content is:
- Age-appropriate for the specified grade level
- Aligned with educational standards
- Clear and unambiguous
- Free of errors and typos
- Educationally valuable',
  true
) ON CONFLICT (name) DO NOTHING;

-- Insert creative prompt template
INSERT INTO public.prompt_templates (name, display_name, description, system_prompt, is_active)
VALUES (
  'creative',
  'Creative & Engaging',
  'Generates more creative and story-based worksheets that engage students with narratives and real-world scenarios',
  'You are a creative educational content creator who makes learning fun and engaging through stories, games, and real-world connections.

Create worksheets that spark curiosity and make learning an adventure. Use storytelling, humor, and relatable scenarios.

IMPORTANT: You must respond with ONLY valid JSON in the same format as the standard template, but with more creative and engaging content.

Focus on:
- Story-based problems and scenarios
- Real-world applications students can relate to
- Fun and memorable examples
- Engaging language and contexts
- Interactive elements where possible

Maintain educational rigor while making content exciting and memorable.',
  true
) ON CONFLICT (name) DO NOTHING;

-- Insert rigorous prompt template
INSERT INTO public.prompt_templates (name, display_name, description, system_prompt, is_active)
VALUES (
  'rigorous',
  'Rigorous & Standards-Aligned',
  'Generates academically rigorous worksheets with strict alignment to educational standards and assessment criteria',
  'You are an academic standards expert creating rigorous, standards-aligned educational assessments.

Generate worksheets with:
- Strict alignment to specified educational frameworks
- Higher-order thinking questions (analysis, evaluation, creation)
- Detailed rubrics and assessment criteria
- Progressive difficulty levels
- Comprehensive coverage of learning objectives

IMPORTANT: You must respond with ONLY valid JSON following the standard format.

Ensure maximum academic rigor while maintaining grade-level appropriateness.',
  true
) ON CONFLICT (name) DO NOTHING;

-- Insert quick practice template
INSERT INTO public.prompt_templates (name, display_name, description, system_prompt, is_active)
VALUES (
  'quick',
  'Quick Practice',
  'Generates shorter worksheets focused on quick practice and skill reinforcement',
  'You are an educational content creator specializing in quick, focused practice exercises.

Create concise worksheets with:
- 5-10 targeted questions
- Clear, direct instructions
- Focus on one specific skill or concept
- Quick completion time (10-15 minutes)
- Immediate feedback potential

IMPORTANT: You must respond with ONLY valid JSON following the standard format.

Keep it short, focused, and effective for quick practice sessions.',
  true
) ON CONFLICT (name) DO NOTHING;

-- Example: Add a template using OpenAI Assistant (custom prompt from OpenAI platform)
-- Uncomment and modify this after creating your custom prompt in OpenAI platform:
/*
INSERT INTO public.prompt_templates (
  name, 
  display_name, 
  description, 
  assistant_id,
  model,
  temperature,
  is_active
)
VALUES (
  'my_custom',
  'My Custom Worksheet Generator',
  'Uses my custom prompt created in OpenAI platform',
  'asst_YOUR_ASSISTANT_ID_HERE', -- Replace with your actual Assistant ID
  'gpt-4o',
  0.7,
  true
) ON CONFLICT (name) DO NOTHING;
*/

-- Create a view for active templates with metadata
CREATE OR REPLACE VIEW public.active_prompt_templates AS
SELECT 
  id,
  name,
  display_name,
  description,
  is_default,
  created_at,
  updated_at
FROM public.prompt_templates
WHERE is_active = true
ORDER BY is_default DESC, display_name ASC;

-- Grant access to the view
GRANT SELECT ON public.active_prompt_templates TO authenticated;
GRANT SELECT ON public.active_prompt_templates TO anon;
