import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';

const supabase = createClient(supabaseUrl, supabaseKey);

const VILLARALBO_SQUAD = [
  {
    dorsal: 1,
    alias: 'MIGUEL',
    nombre: 'Miguel del Río Rodríguez',
    demarcacion: 'Portero',
    fecha_nacimiento: '1991-02-20',
    file: 'dorsal_1_miguel.png',
    forma: 95
  },
  {
    dorsal: 2,
    alias: 'ANGE',
    nombre: 'Amon Ange Roland Yohane',
    demarcacion: 'Defensa Lateral',
    fecha_nacimiento: '1998-04-10',
    file: 'dorsal_2_ange.png',
    forma: 90
  },
  {
    dorsal: 4,
    alias: 'KONATE',
    nombre: 'Konate Varane Ibrahim',
    demarcacion: 'Defensa Central',
    fecha_nacimiento: '1995-07-22',
    file: 'dorsal_4_konate.png',
    forma: 92
  },
  {
    dorsal: 5,
    alias: 'CEPEDA',
    nombre: 'Diego González Cepeda',
    demarcacion: 'Defensa Central',
    fecha_nacimiento: '1999-11-15',
    file: 'dorsal_5_cepeda.png',
    forma: 88
  },
  {
    dorsal: 6,
    alias: 'MOUSSA',
    nombre: 'Moussa Diarra Traoré',
    demarcacion: 'Defensa Lateral',
    fecha_nacimiento: '2001-03-18',
    file: 'dorsal_6_moussa.png',
    forma: 89
  },
  {
    dorsal: 7,
    alias: 'PERALTA',
    nombre: 'Daniel Peralta Arroyo',
    demarcacion: 'Extremo',
    fecha_nacimiento: '2000-05-12',
    file: 'dorsal_7_peralta.png',
    forma: 91
  },
  {
    dorsal: 8,
    alias: 'JOSÉ MARÍA',
    nombre: 'José María Ortega Parejo',
    demarcacion: 'Mediocentro',
    fecha_nacimiento: '1997-09-25',
    file: 'dorsal_8_jose_maria.png',
    forma: 94
  },
  {
    dorsal: 9,
    alias: 'RUBO',
    nombre: 'Rubén Blanco Rodríguez',
    demarcacion: 'Delantero',
    fecha_nacimiento: '1993-06-14',
    file: 'dorsal_9_rubo.png',
    forma: 96
  },
  {
    dorsal: 10,
    alias: 'ÁNGEL E.',
    nombre: 'Ángel Esteban Ruiz',
    demarcacion: 'Mediapunta',
    fecha_nacimiento: '1998-12-03',
    file: 'dorsal_10_angel_e.png',
    forma: 93
  },
  {
    dorsal: 11,
    alias: 'EMMANUEL',
    nombre: 'Emmanuel Tomás Manero',
    demarcacion: 'Extremo',
    fecha_nacimiento: '1999-08-19',
    file: 'dorsal_11_emmanuel.png',
    forma: 90
  },
  {
    dorsal: 13,
    alias: 'IKER',
    nombre: 'Iker Rodríguez',
    demarcacion: 'Portero',
    fecha_nacimiento: '2003-02-17',
    file: 'dorsal_13_iker.png',
    forma: 86
  },
  {
    dorsal: 14,
    alias: 'ISMA',
    nombre: 'Ismael García Antolín',
    demarcacion: 'Mediocentro',
    fecha_nacimiento: '2001-10-30',
    file: 'dorsal_14_isma.png',
    forma: 88
  },
  {
    dorsal: 15,
    alias: 'SANA',
    nombre: 'Jorge Sanabria Belloso',
    demarcacion: 'Interior',
    fecha_nacimiento: '2000-01-15',
    file: 'dorsal_15_sana.png',
    forma: 87
  },
  {
    dorsal: 16,
    alias: 'ROMARIO',
    nombre: 'Romario García Salinas',
    demarcacion: 'Extremo',
    fecha_nacimiento: '1996-07-08',
    file: 'dorsal_16_romario.png',
    forma: 90
  },
  {
    dorsal: 17,
    alias: 'THEO GOORE',
    nombre: 'Theodore Goore',
    demarcacion: 'Delantero',
    fecha_nacimiento: '1998-04-21',
    file: 'dorsal_17_theo_goore.png',
    forma: 92
  },
  {
    dorsal: 18,
    alias: 'ÁLEX N.',
    nombre: 'Alejandro Navarro Carrasquero',
    demarcacion: 'Defensa Lateral',
    fecha_nacimiento: '2000-08-11',
    file: 'dorsal_18_alex_n.png',
    forma: 89
  },
  {
    dorsal: 19,
    alias: 'TOMI',
    nombre: 'Cristian Tomás Lupidio',
    demarcacion: 'Mediocentro',
    fecha_nacimiento: '1999-02-28',
    file: 'dorsal_19_tomi.png',
    forma: 88
  },
  {
    dorsal: 21,
    alias: 'MIGUEL B.',
    nombre: 'Miguel Blanco Merino',
    demarcacion: 'Interior',
    fecha_nacimiento: '2002-05-09',
    file: 'dorsal_21_miguel_b.png',
    forma: 87
  },
  {
    dorsal: 22,
    alias: 'WILLIAM',
    nombre: 'William',
    demarcacion: 'Delantero',
    fecha_nacimiento: '2001-11-04',
    file: 'dorsal_22_william.png',
    forma: 89
  },
  {
    dorsal: 23,
    alias: 'RAÚL M.',
    nombre: 'Raúl Muñoz Puelles',
    demarcacion: 'Defensa Lateral',
    fecha_nacimiento: '2001-06-19',
    file: 'dorsal_23_raul_m.png',
    forma: 88
  }
];

async function syncSquad() {
  console.log('--- SYNCING CD VILLARALBO SQUAD ---');
  
  // 1. Fetch existing players
  const { data: existing, error: fetchErr } = await supabase.from('jugadores').select('*');
  if (fetchErr) {
    console.error('Error fetching existing players:', fetchErr);
  }
  console.log(`Found ${existing?.length || 0} existing players in DB.`);

  for (const player of VILLARALBO_SQUAD) {
    const localFilePath = path.join(process.cwd(), 'public', 'players', player.file);
    let photoUrl = `/players/${player.file}`;
    
    // Attempt uploading to Supabase storage
    if (fs.existsSync(localFilePath)) {
      try {
        const fileBuffer = fs.readFileSync(localFilePath);
        const storageFileName = `villaralbo_dorsal_${player.dorsal}_${player.file}`;
        
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('FOTOS JUGADORES')
          .upload(storageFileName, fileBuffer, {
            contentType: 'image/png',
            upsert: true
          });
          
        if (!uploadErr && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('FOTOS JUGADORES')
            .getPublicUrl(storageFileName);
          photoUrl = publicUrl;
          console.log(`[Storage] Uploaded ${storageFileName} -> ${photoUrl}`);
        } else {
          console.log(`[Storage Note] Using local static fallback /players/${player.file} (uploadErr: ${uploadErr?.message})`);
        }
      } catch (err: any) {
        console.log(`[Storage Exception] ${err.message}`);
      }
    }

    // Check if player exists by matching dorsal or partial name
    const match = existing?.find(e => {
      if (e.dorsal === player.dorsal) return true;
      const cleanDBName = e.nombre.toLowerCase();
      const cleanAlias = player.alias.toLowerCase();
      const cleanName = player.nombre.toLowerCase();
      return cleanDBName.includes(cleanAlias) || cleanName.includes(cleanDBName);
    });

    if (match) {
      // Update
      const { error: updateErr } = await supabase
        .from('jugadores')
        .update({
          nombre: player.nombre,
          dorsal: player.dorsal,
          demarcacion: player.demarcacion,
          fecha_nacimiento: player.fecha_nacimiento,
          foto_url: photoUrl,
          forma: player.forma
        })
        .eq('id', match.id);
        
      if (updateErr) {
        console.error(`Error updating dorsal ${player.dorsal}:`, updateErr);
      } else {
        console.log(`✓ Updated Dorsal ${player.dorsal}: ${player.nombre} (${player.alias})`);
      }
    } else {
      // Insert
      const { error: insertErr } = await supabase
        .from('jugadores')
        .insert({
          nombre: player.nombre,
          dorsal: player.dorsal,
          demarcacion: player.demarcacion,
          fecha_nacimiento: player.fecha_nacimiento,
          foto_url: photoUrl,
          forma: player.forma
        });
        
      if (insertErr) {
        console.error(`Error inserting dorsal ${player.dorsal}:`, insertErr);
      } else {
        console.log(`✓ Inserted Dorsal ${player.dorsal}: ${player.nombre} (${player.alias})`);
      }
    }
  }

  // Also clean up any mock / duplicate players if necessary
  console.log('--- SQUAD SYNC COMPLETE ---');
}

syncSquad();
