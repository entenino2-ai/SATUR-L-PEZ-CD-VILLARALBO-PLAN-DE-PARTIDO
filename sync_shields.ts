import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';

const supabase = createClient(supabaseUrl, supabaseKey);

const TEAMS_SHIELDS = [
  { dbName: 'Burgos C.F. S.A.D. "B"', file: 'burgos_b.png' },
  { dbName: 'U.D. Santa Marta de Tormes', file: 'santa_marta.png' },
  { dbName: 'C.D. Almazán', file: 'almazan.png' },
  { dbName: 'Salamanca C.F. UDS "B"', file: 'salamanca_b.png' },
  { dbName: 'C.D. Calasanz de Soria', file: 'calasanz_soria.png' },
  { dbName: 'Turégano C.F.', file: 'turegano.png' },
  { dbName: 'C.D. Palencia Cristo Atlético', file: 'cristo_atletico.png' },
  { dbName: 'Atlético Bembibre', file: 'bembibre.png' },
  { dbName: 'Atlético Mansillés', file: 'mansilles.png' },
  { dbName: 'C.D. Guijuelo', file: 'guijuelo.png' },
  { dbName: 'C.D. La Virgen del Camino', file: 'la_virgen.png' },
  { dbName: 'Unionistas de Salamanca C.F. "B"', file: 'unionistas_b.png' },
  { dbName: 'Arandina CF', file: 'arandina.png' },
  { dbName: 'C.D. Mirandés S.A.D. "B"', file: 'mirandes_b.png' },
  { dbName: 'C.D. Colegios Diocesanos', file: 'colegios_diocesanos.png' },
  { dbName: 'Palencia C.F. S.A.D.', file: 'palencia_cf.png' },
  { dbName: 'Júpiter Leonés', file: 'jupiter_leones.png' },
];

async function syncShields() {
  console.log('--- SYNCING CLUB SHIELDS TO SUPABASE & EQUIPOS ---');

  const { data: allTeams, error: fetchErr } = await supabase.from('equipos').select('*');
  if (fetchErr) {
    console.error('Error fetching teams:', fetchErr);
    return;
  }

  for (const item of TEAMS_SHIELDS) {
    const localFilePath = path.join(process.cwd(), 'public', 'shields', item.file);
    let shieldUrl = `/shields/${item.file}`;

    if (fs.existsSync(localFilePath)) {
      try {
        const fileBuffer = fs.readFileSync(localFilePath);
        const storageFileName = `escudo_${item.file}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('FOTOS ESCUDOS')
          .upload(storageFileName, fileBuffer, {
            contentType: 'image/png',
            upsert: true
          });

        if (!uploadErr && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('FOTOS ESCUDOS')
            .getPublicUrl(storageFileName);
          shieldUrl = publicUrl;
          console.log(`[Storage] Uploaded ${storageFileName} -> ${publicUrl}`);
        } else {
          console.log(`[Storage Note] Using local path /shields/${item.file}`);
        }
      } catch (err: any) {
        console.log(`[Storage Exception] ${err.message}`);
      }
    }

    // Match team in database
    const match = allTeams?.find(t => 
      t.nombre.toLowerCase().trim() === item.dbName.toLowerCase().trim() ||
      t.nombre.toLowerCase().includes(item.dbName.toLowerCase().replace(/["'\.]/g, '').trim()) ||
      item.dbName.toLowerCase().includes(t.nombre.toLowerCase().replace(/["'\.]/g, '').trim())
    );

    if (match) {
      const { error: updateErr } = await supabase
        .from('equipos')
        .update({ escudo_url: shieldUrl })
        .eq('id', match.id);

      if (updateErr) {
        console.error(`Error updating team ${match.nombre}:`, updateErr);
      } else {
        console.log(`✓ Updated shield for: ${match.nombre}`);
      }
    } else {
      console.log(`⚠️ Team not found in DB: ${item.dbName}`);
    }
  }

  console.log('--- SHIELD SYNC FINISHED ---');
}

syncShields();
