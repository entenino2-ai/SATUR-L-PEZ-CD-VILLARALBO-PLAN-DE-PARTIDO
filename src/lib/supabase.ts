import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

