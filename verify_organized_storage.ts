import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('--- VERIFICACIÓN DE ESTRUCTURA SUPABASE STORAGE ---');
  const { data: subfolders, error: subErr } = await supabase.storage
    .from('FOTOS JUGADORES')
    .list('jugadores_equipo');

  console.log('Subcarpetas encontradas en jugadores_equipo/:');
  console.log(subfolders?.map(f => f.name));

  for (const folder of (subfolders || [])) {
    const { data: files } = await supabase.storage
      .from('FOTOS JUGADORES')
      .list(`jugadores_equipo/${folder.name}`);
    console.log(`📁 [${folder.name}]: ${files?.length} archivos de jugadores`);
  }

  // Sample check of DB rows
  const { data: samplePlayers } = await supabase
    .from('jugadores_equipo')
    .select('nombre, foto_url')
    .limit(8);

  console.log('\n--- MUESTRA DE JUGADORES CON FOTO_URL ACTUALIZADA ---');
  console.log(samplePlayers);
}

verify();
