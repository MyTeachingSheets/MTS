import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

let supabase = null
let supabaseAdmin = null

// Create browser client if running in the browser and anon key exists
if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else if (typeof window !== 'undefined') {
  // Lightweight stub for browser when envs missing
  supabase = {
    auth: {
      async signOut() { return { error: new Error('Supabase client not configured') } },
      async getSession() { return { data: { session: null } } },
      onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } } },
      async signInWithPassword() { return { error: new Error('Supabase client not configured') } },
      async signUp() { return { error: new Error('Supabase client not configured') } },
    },
  }
}

// Create server/admin client for API routes (use service role key)
if (typeof window === 'undefined') {
  if (supabaseUrl && supabaseServiceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
    supabase = supabaseAdmin
  } else if (supabaseUrl && supabaseAnonKey) {
    // Fallback for local dev: create a server client with anon key if service key missing.
    // WARNING: anon key does NOT have elevated permissions; storage operations may still fail depending on your bucket policies.
    console.warn('SUPABASE_SERVICE_ROLE_KEY missing — falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY for server client (for local dev only).')
    supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey)
    supabase = supabaseAdmin
  } else {
    // If server env not configured, export a stub that will error when used.
    supabase = {
      storage: {
        from() { throw new Error('Supabase storage not configured on server') }
      },
      from() { throw new Error('Supabase client not configured on server') }
    }
  }
}

export { supabase, supabaseAdmin }
