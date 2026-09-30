import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('--- 1. STORAGE BUCKETS ---');
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log('Buckets:', buckets?.map(b => b.name), bErr?.message || 'OK');

  for (const b of (buckets || [])) {
    console.log(`\n--- BUCKET: ${b.name} ---`);
    const { data: rootFiles } = await supabase.storage.from(b.name).list('', { limit: 100 });
    console.log('Root items:', rootFiles?.map(f => f.name));

    // Check subfolders if any
    for (const f of (rootFiles || [])) {
      if (!f.metadata) { // likely folder
        const { data: subFiles } = await supabase.storage.from(b.name).list(f.name, { limit: 100 });
        console.log(`  Subfolder [${f.name}]:`, subFiles?.map(sf => sf.name));
      }
    }
  }

  console.log('\n--- 2. EQUIPOS EN BASE DE DATOS ---');
  const { data: teams } = await supabase.from('equipos').select('id, nombre');
  console.log(teams);

  console.log('\n--- 3. JUGADORES_EQUIPO EN BASE DE DATOS ---');
  const { data: rivalPlayers } = await supabase.from('jugadores_equipo').select('id, equipo_id, nombre, foto_url');
  console.log('Total rival players in DB:', rivalPlayers?.length);
  
  // Group by team
  const byTeam: Record<string, number> = {};
  for (const rp of (rivalPlayers || [])) {
    const t = teams?.find(team => team.id === rp.equipo_id)?.nombre || rp.equipo_id;
    byTeam[t] = (byTeam[t] || 0) + 1;
  }
  console.log('Jugadores por equipo:', byTeam);
}

inspect();
