-- Create hierarchical settings tables for subjects, frameworks, grades, and domains
-- Each level references the parent level

-- 1. Subjects (top level)
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Frameworks (belongs to subject)
CREATE TABLE IF NOT EXISTS frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, name)
);

-- 3. Grades (belongs to framework)
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(framework_id, name)
);

-- 4. Domains (belongs to grade)
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(grade_id, name)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_frameworks_subject_id ON frameworks(subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_framework_id ON grades(framework_id);
CREATE INDEX IF NOT EXISTS idx_domains_grade_id ON domains(grade_id);

-- Enable Row Level Security
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Create policies: Allow public read, admin write (you can adjust based on your auth setup)
-- For now, allow all operations (you should restrict this based on your admin auth)
CREATE POLICY "Allow all operations on subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on frameworks" ON frameworks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on grades" ON grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on domains" ON domains FOR ALL USING (true) WITH CHECK (true);

-- Insert some sample data to get started
INSERT INTO subjects (name, display_order) VALUES
  ('Mathematics', 1),
  ('Science', 2),
  ('English Language Arts', 3),
  ('Social Studies', 4),
  ('Reading', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert sample frameworks for Mathematics
INSERT INTO frameworks (subject_id, name, display_order)
SELECT id, 'Common Core State Standards (CCSS)', 1 FROM subjects WHERE name = 'Mathematics'
UNION ALL
SELECT id, 'State Standards', 2 FROM subjects WHERE name = 'Mathematics'
UNION ALL
SELECT id, 'International Baccalaureate (IB)', 3 FROM subjects WHERE name = 'Mathematics'
ON CONFLICT (subject_id, name) DO NOTHING;

-- Insert sample frameworks for Science
INSERT INTO frameworks (subject_id, name, display_order)
SELECT id, 'Next Generation Science Standards (NGSS)', 1 FROM subjects WHERE name = 'Science'
UNION ALL
SELECT id, 'State Standards', 2 FROM subjects WHERE name = 'Science'
UNION ALL
SELECT id, 'Cambridge International', 3 FROM subjects WHERE name = 'Science'
ON CONFLICT (subject_id, name) DO NOTHING;

-- Insert sample grades for Common Core Math
INSERT INTO grades (framework_id, name, display_order)
SELECT id, 'K', 1 FROM frameworks WHERE name = 'Common Core State Standards (CCSS)' 
  AND subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
UNION ALL
SELECT id, '1', 2 FROM frameworks WHERE name = 'Common Core State Standards (CCSS)' 
  AND subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
UNION ALL
SELECT id, '2', 3 FROM frameworks WHERE name = 'Common Core State Standards (CCSS)' 
  AND subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
UNION ALL
SELECT id, '3', 4 FROM frameworks WHERE name = 'Common Core State Standards (CCSS)' 
  AND subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
UNION ALL
SELECT id, '4', 5 FROM frameworks WHERE name = 'Common Core State Standards (CCSS)' 
  AND subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
UNION ALL
SELECT id, '5', 6 FROM frameworks WHERE name = 'Common Core State Standards (CCSS)' 
  AND subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
ON CONFLICT (framework_id, name) DO NOTHING;

-- Insert sample domains for Grade 3 Common Core Math
INSERT INTO domains (grade_id, name, display_order)
SELECT id, 'Operations and Algebraic Thinking', 1 FROM grades WHERE name = '3' 
  AND framework_id = (
    SELECT id FROM frameworks WHERE name = 'Common Core State Standards (CCSS)' 
    AND subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
  )
UNION ALL
SELECT id, 'Number and Operations in Base Ten', 2 FROM grades WHERE name = '3' 
  AND framework_id = (
    SELECT id FROM frameworks WHERE name = 'Common Core State Standards (CCSS)' 
    AND subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
  )
UNION ALL
SELECT id, 'Number and Operations—Fractions', 3 FROM grades WHERE name = '3' 
  AND framework_id = (
    SELECT id FROM frameworks WHERE name = 'Common Core State Standards (CCSS)' 
    AND subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
  )
UNION ALL
SELECT id, 'Measurement and Data', 4 FROM grades WHERE name = '3' 
  AND framework_id = (
    SELECT id FROM frameworks WHERE name = 'Common Core State Standards (CCSS)' 
    AND subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
  )
UNION ALL
SELECT id, 'Geometry', 5 FROM grades WHERE name = '3' 
  AND framework_id = (
    SELECT id FROM frameworks WHERE name = 'Common Core State Standards (CCSS)' 
    AND subject_id = (SELECT id FROM subjects WHERE name = 'Mathematics')
  )
ON CONFLICT (grade_id, name) DO NOTHING;
