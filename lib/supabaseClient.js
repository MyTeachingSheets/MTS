import { createClient } from '@supabase/supabase-js'

// Create the client only in environments where the public envs are present.
// During build on systems where envs aren't set this prevents a hard crash.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase = null

if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else if (typeof window !== 'undefined') {
  // Running in browser but envs missing: create a lightweight stub so
  // callers can still call the common methods without crashing.
  supabase = {
    auth: {
      async signOut() {
        return { error: new Error('Supabase client not configured') }
      },
      async getSession() {
        return { data: { session: null } }
      },
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe() {} } } }
      },
      async signInWithPassword() {
        return { error: new Error('Supabase client not configured') }
      },
      async signUp() {
        return { error: new Error('Supabase client not configured') }
      },
    },
  }
} else {
  // Server or build-time: export a harmless stub (won't be used server-side)
  supabase = {
    auth: {
      async signOut() {
        return { error: new Error('Supabase client not configured') }
      },
      async getSession() {
        return { data: { session: null } }
      },
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe() {} } } }
      },
      async signInWithPassword() {
        return { error: new Error('Supabase client not configured') }
      },
      async signUp() {
        return { error: new Error('Supabase client not configured') }
      },
    },
  }
}

export { supabase }
