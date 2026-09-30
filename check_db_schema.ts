import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: sample, error } = await supabase.from('jugadores_equipo').select('*').limit(3);
  console.log('Sample row from jugadores_equipo:');
  console.log(sample);

  // Test if equipo_nombre exists
  const { data: testCol, error: colErr } = await supabase.from('jugadores_equipo').select('equipo_nombre').limit(1);
  console.log('equipo_nombre column status:', colErr ? colErr.message : 'EXISTS!');

  // Test if nombre_equipo exists
  const { data: testCol2, error: colErr2 } = await supabase.from('jugadores_equipo').select('nombre_equipo').limit(1);
  console.log('nombre_equipo column status:', colErr2 ? colErr2.message : 'EXISTS!');
}

check();
