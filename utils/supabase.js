import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kxvpidluaawsyvhujsgh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4dnBpZGx1YWF3c3l2aHVqc2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0Nzg4NzksImV4cCI6MjA1MTA1NDg3OX0.1k2KMoMeUFogz79ZEGAWDuFBIOpzNtxT6wdTDKNMbng'
export const supabase = createClient(supabaseUrl, supabaseKey)
