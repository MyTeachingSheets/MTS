# Vercel Deployment Checklist for OpenAI Integration

## Issue
Getting `405 Method Not Allowed` on production (myteachingsheets.com) when calling `/api/ai/generate`

## Root Cause
The endpoint exists in your code and is pushed to GitHub, but either:
1. Vercel hasn't redeployed with the latest changes, or
2. Environment variables are missing in Vercel

## Solution Steps

### 1. Check Vercel Deployment Status
1. Go to https://vercel.com/dashboard
2. Find your project (MyTeachingSheets/MTS)
3. Check if the latest commit (`1de7e7e`) has been deployed
4. If not, click **"Deploy"** or **"Redeploy"** on the latest commit

### 2. Add Required Environment Variables
1. Go to your Vercel project settings
2. Navigate to: **Settings → Environment Variables**
3. Add the following variable:

   **Name**: `OPENAI_API_KEY`  
   **Value**: `sk-proj-...` (your OpenAI API key from https://platform.openai.com/api-keys)  
   **Environment**: Production, Preview, Development (select all)

4. Click **Save**

### 3. Redeploy After Adding Environment Variable
After adding the environment variable, you **must redeploy**:
1. Go to **Deployments** tab
2. Click the three dots (⋮) on the latest deployment
3. Select **"Redeploy"**
4. Wait for deployment to complete

### 4. Optional: Add Supabase Environment Variables (if not already set)
If you're using Supabase for prompt templates:

**Name**: `NEXT_PUBLIC_SUPABASE_URL`  
**Value**: Your Supabase project URL (e.g., `https://xxx.supabase.co`)

**Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Value**: Your Supabase anon/public key

**Name**: `SUPABASE_SERVICE_ROLE_KEY`  
**Value**: Your Supabase service role key (for admin operations)

### 5. Verify Deployment
After redeployment:
1. Visit https://www.myteachingsheets.com/ai/generate
2. Try generating a worksheet
3. Check browser console for errors
4. The 405 error should be gone

## Quick Verification
You can test if the endpoint exists by visiting:
```
https://www.myteachingsheets.com/api/ai/generate
```

Expected response (without POST data):
- **405 Method Not Allowed** with JSON error (means endpoint exists but needs POST)
- **NOT**: 404 Not Found (would mean file isn't deployed)

## Troubleshooting

### If you still get 405 after redeployment:
1. Check Vercel build logs for errors during deployment
2. Verify `/pages/api/ai/generate.js` is in your repository
3. Check Vercel function logs for runtime errors

### If you get "OpenAI API key is not configured":
- The environment variable `OPENAI_API_KEY` is missing or misspelled in Vercel
- Remember to redeploy after adding environment variables

### If you get rate limit errors:
- Check your OpenAI usage at https://platform.openai.com/usage
- Verify your billing is set up correctly

## Additional Notes
- Vercel automatically deploys on every push to `main` branch
- Environment variables are NOT automatically picked up - you must redeploy
- Local `.env.local` file is NOT deployed to Vercel (it's gitignored)
