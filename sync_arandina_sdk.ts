import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';

const supabase = createClient(supabaseUrl, supabaseKey);

const ARANDINA_TEAM_ID = '566d8e1b-8c69-47b9-aa5a-55830eb29f70';
const ARANDINA_NAME = 'Arandina CF';
const ARANDINA_FOLDER = 'Arandina_CF';

async function uploadLocalImagesToStorage() {
  const localDir = path.join(process.cwd(), 'scratch_avatars', ARANDINA_FOLDER);
  const files = fs.readdirSync(localDir);

  console.log(`Subiendo ${files.length} archivos de Arandina CF a Supabase Storage...`);

  // Remove existing files in folder if any
  const { data: existingFiles } = await supabase.storage
    .from('FOTOS JUGADORES')
    .list(`jugadores_equipo/${ARANDINA_FOLDER}`);

  if (existingFiles && existingFiles.length > 0) {
    const toRemove = existingFiles.map(f => `jugadores_equipo/${ARANDINA_FOLDER}/${f.name}`);
    console.log(`Eliminando ${toRemove.length} archivos existentes en storage...`);
    await supabase.storage.from('FOTOS JUGADORES').remove(toRemove);
  }

  for (const f of files) {
    const filePath = path.join(localDir, f);
    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `jugadores_equipo/${ARANDINA_FOLDER}/${f}`;

    const { data, error } = await supabase.storage
      .from('FOTOS JUGADORES')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png'
      });

    if (error) {
      console.error(`Error subiendo ${storagePath}:`, error.message);
    } else {
      console.log(`✓ Subido a storage: ${storagePath}`);
    }
  }

  // Verify and ensure all URLs in DB are valid
  const { data: dbPlayers, error: fetchErr } = await supabase
    .from('jugadores_equipo')
    .select('id, nombre, foto_url')
    .eq('equipo_id', ARANDINA_TEAM_ID);

  console.log(`\nJugadores en BD para Arandina CF (${dbPlayers?.length}):`);
  for (const p of dbPlayers || []) {
    console.log(`  - ${p.nombre}: ${p.foto_url}`);
  }
}

uploadLocalImagesToStorage().catch(console.error);
