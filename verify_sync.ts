import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve('.env.local') });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const { data: sm } = await supabase.from('jugadores_equipo').select('*').eq('equipo_id', '655bfa2b-5e3d-4040-9ad9-b7db0ebb72ca');
  console.log(`Santa Marta total players in DB: ${sm?.length}`);
  console.log(sm?.map(p => `[${p.demarcacion}] ${p.nombre} -> ${p.foto_url?.substring(0, 60)}...`).slice(0, 5));

  const { data: ar } = await supabase.from('jugadores_equipo').select('*').eq('equipo_id', '566d8e1b-8c69-47b9-aa5a-55830eb29f70');
  console.log(`\nArandina total players in DB: ${ar?.length}`);
  console.log(ar?.map(p => `[${p.demarcacion}] ${p.nombre} -> ${p.foto_url?.substring(0, 60)}...`).slice(0, 5));
}

verify();
