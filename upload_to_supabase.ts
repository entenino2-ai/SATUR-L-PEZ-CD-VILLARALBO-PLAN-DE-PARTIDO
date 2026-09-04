import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadAndUpdate() {
  const playersToSync = [
    {
      dorsal: 9,
      nombre: 'Rubén Blanco Rodríguez',
      localFile: 'dorsal_9_rubo.png',
      storageName: `RUBO_${Date.now()}.png`
    },
    {
      dorsal: 25,
      nombre: 'Kassim Moumouni',
      localFile: 'dorsal_25_kassim.png',
      storageName: `KASSIM_${Date.now()}.png`
    }
  ];

  for (const player of playersToSync) {
    const filePath = path.join(process.cwd(), 'public', 'players', player.localFile);
    let publicUrl = `/players/${player.localFile}`;

    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('FOTOS JUGADORES')
        .upload(player.storageName, fileBuffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true
        });

      if (!uploadErr && uploadData) {
        const { data: { publicUrl: url } } = supabase.storage
          .from('FOTOS JUGADORES')
          .getPublicUrl(player.storageName);
        publicUrl = url;
        console.log(`✓ [Storage] Subida foto a Supabase para ${player.nombre}: ${publicUrl}`);
      } else {
        console.log(`[Storage Notice] Upload status: ${uploadErr?.message || 'OK'}`);
      }
    }

    // Actualizar la tabla de jugadores en Supabase
    const { data: updated, error: dbErr } = await supabase
      .from('jugadores')
      .update({ foto_url: publicUrl })
      .eq('dorsal', player.dorsal)
      .select();

    if (dbErr) {
      console.error(`Error actualizando jugador dorsal ${player.dorsal} en BD:`, dbErr);
    } else {
      console.log(`✓ [Database] Registro actualizado en Supabase para dorsal ${player.dorsal}:`, updated);
    }
  }

  console.log('--- ACTUALIZACIÓN COMPLETADA ---');
}

uploadAndUpdate();
