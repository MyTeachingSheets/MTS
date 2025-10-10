# Users Table Migration

## Issue
The `/api/store-user` endpoint was failing with error:
```
Could not find the table 'public.users' in the schema cache (PGRST205)
```

## Solution
Run the SQL migration to create the `users` table in your Supabase database.

## Steps to Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/create_users_table.sql`
5. Paste into the SQL editor
6. Click **Run** button

### Option 2: Using Supabase CLI

```bash
# Make sure you're in the project root
cd /Users/sahithsambodhi/Desktop/TPT/0.\ APP\ SCRIPT/next.js

# Run the migration
supabase db push
```

## What This Migration Does

1. **Creates `users` table** with the following schema:
   - `id`: UUID (references auth.users)
   - `email`: TEXT (unique)
   - `metadata`: JSONB (stores user_metadata from auth)
   - `last_sign_in_at`: TIMESTAMPTZ
   - `created_at`: TIMESTAMPTZ (auto-set)
   - `updated_at`: TIMESTAMPTZ (auto-updated on changes)

2. **Enables Row Level Security (RLS)**:
   - Users can view their own data
   - Service role (API) can manage all users

3. **Creates indexes** for faster email lookups

4. **Adds trigger** to automatically update `updated_at` timestamp

## Verify Migration

After running the migration, verify it worked:

```sql
-- Check if table exists
SELECT * FROM public.users LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## Testing

After migration, test the flow:

1. **Sign Up**: Create a new account
2. **Verify Email**: Click the verification link in email
3. **Login**: Log in with the new account

All three actions should now work without errors.

## API Improvements

The `/api/store-user` endpoint now includes:
- ✅ UUID format validation
- ✅ Better error messages for missing table
- ✅ Detailed error logging

## Environment Variables Required

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Next Steps

Once the migration is complete:
1. Test user registration flow
2. Test email verification flow  
3. Test login flow
4. Check Supabase logs for any remaining errors
