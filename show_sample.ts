import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function check() {
  const { data, error } = await supabase.from('jugadores_equipo').select('*').limit(2);
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Sample rows in jugadores_equipo:');
  console.log(JSON.stringify(data, null, 2));
}
check();
