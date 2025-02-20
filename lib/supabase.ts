import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://zsuondczyljdkqaqylgq.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdW9uZGN6eWxqZGtxYXF5bGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NTI0MTgsImV4cCI6MjA1NTUyODQxOH0.s3XHqm3jhWQpOvOjlVRS4S4VDcVGw_8LVNXaNXVs29o"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})