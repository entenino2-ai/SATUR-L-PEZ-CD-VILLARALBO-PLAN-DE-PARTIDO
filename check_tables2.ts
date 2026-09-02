import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve('.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);

async function check() {
  const res1 = await supabase.from('jugadores_rivales').select('*').limit(1);
  console.log('jugadores_rivales error:', res1.error?.message || 'OK', 'data:', res1.data);
  
  const res2 = await supabase.from('jugadores_equipo').select('*').limit(1);
  console.log('jugadores_equipo error:', res2.error?.message || 'OK', 'data:', res2.data);
  
  const res3 = await supabase.from('equipos').select('*').limit(1);
  console.log('equipos error:', res3.error?.message || 'OK', 'data:', res3.data);
}
check();
