import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testBucket() {
  console.log('Testing upload to bucket FOTOS JUGADORES...');
  const testBuffer = Buffer.from('test');
  const { data, error } = await supabase.storage
    .from('FOTOS JUGADORES')
    .upload('test.txt', testBuffer, { upsert: true });
  console.log('Upload result:', data, error);

  const { data: listData, error: listErr } = await supabase.storage
    .from('FOTOS JUGADORES')
    .list('');
  console.log('List FOTOS JUGADORES:', listData, listErr);

  const { data: listRivals, error: listRivalsErr } = await supabase.storage
    .from('FOTOS JUGADORES')
    .list('rivals');
  console.log('List FOTOS JUGADORES/rivals:', listRivals, listRivalsErr);

  const { data: listJugEquipo, error: listJErr } = await supabase.storage
    .from('FOTOS JUGADORES')
    .list('jugadores_equipo');
  console.log('List FOTOS JUGADORES/jugadores_equipo:', listJugEquipo, listJErr);
}

testBucket();
