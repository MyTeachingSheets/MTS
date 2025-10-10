# Supabase Settings Migration

This migration creates hierarchical tables for managing subjects, frameworks, grades, and domains in the admin settings.

## Database Structure

The hierarchy is: **Subject → Framework → Grade → Domain**

- **subjects**: Top level (e.g., "Mathematics", "Science")
- **frameworks**: Linked to subjects (e.g., "Common Core", "NGSS")
- **grades**: Linked to frameworks (e.g., "K", "1", "2", "3")
- **domains**: Linked to grades (e.g., "Number & Operations", "Algebra")

## How to Run the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase/migrations/create_settings_tables.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Cmd/Ctrl + Enter`

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Initialize Supabase in your project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF

# Apply the migration
supabase db push
```

### Option 3: Manual SQL Execution

You can also execute the SQL file directly using any PostgreSQL client connected to your Supabase database.

## After Migration

Once the migration is complete:

1. The tables will be created with sample data
2. Go to `/admin/settings` to manage the hierarchy
3. The AI generate page will automatically use the hierarchical dropdowns

## Sample Data Included

The migration includes starter data:
- **Subjects**: Mathematics, Science, English Language Arts, Social Studies, Reading
- **Frameworks**: Common Core (Math), NGSS (Science), State Standards
- **Grades**: K-5 for Common Core Math
- **Domains**: Grade 3 Math domains (Operations, Number & Operations, Fractions, Measurement, Geometry)

## How It Works

1. **Admin Settings Page** (`/admin/settings`):
   - Click a subject to view its frameworks
   - Click a framework to view its grades
   - Click a grade to view its domains
   - Add/delete items at each level

2. **AI Generate Page** (`/ai/generate`):
   - Select a subject → see frameworks for that subject
   - Select a framework → see grades for that framework
   - Select a grade → see domains for that grade
   - Each dropdown filters the next level automatically

## API Endpoints

### GET `/api/admin-settings`

Query parameters:
- `type`: "subjects" | "frameworks" | "grades" | "domains"
- `parent_id`: UUID of the parent item (required for frameworks, grades, domains)

Examples:
```javascript
// Get all subjects
fetch('/api/admin-settings?type=subjects')

// Get frameworks for a specific subject
fetch('/api/admin-settings?type=frameworks&parent_id=SUBJECT_UUID')

// Get grades for a specific framework
fetch('/api/admin-settings?type=grades&parent_id=FRAMEWORK_UUID')

// Get domains for a specific grade
fetch('/api/admin-settings?type=domains&parent_id=GRADE_UUID')
```

### POST `/api/admin-settings`

Add item:
```javascript
fetch('/api/admin-settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'add',
    type: 'subject', // or 'framework', 'grade', 'domain'
    value: 'New Subject Name',
    parent_id: 'PARENT_UUID', // required for framework, grade, domain
    display_order: 0 // optional
  })
})
```

Delete item:
```javascript
fetch('/api/admin-settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'delete',
    type: 'subject', // or 'framework', 'grade', 'domain'
    id: 'ITEM_UUID'
  })
})
```

## Cascading Deletes

All tables use `ON DELETE CASCADE`, which means:
- Deleting a subject deletes all its frameworks, grades, and domains
- Deleting a framework deletes all its grades and domains
- Deleting a grade deletes all its domains

## Security

Row Level Security (RLS) is enabled on all tables. Currently, the policies allow all operations, but you should customize them based on your authentication requirements:

```sql
-- Example: Restrict writes to admins only
DROP POLICY "Allow all operations on subjects" ON subjects;

CREATE POLICY "Allow read to all" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow write to admins" ON subjects FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

## Troubleshooting

### Tables already exist
If you see "relation already exists" errors, the tables are already created. You can:
1. Drop them first: `DROP TABLE IF EXISTS domains, grades, frameworks, subjects CASCADE;`
2. Or skip re-running the migration

### Permission errors
Make sure you're using the correct service role key in your environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### No data showing
1. Check Supabase logs for query errors
2. Verify RLS policies aren't blocking reads
3. Check browser console for API errors
