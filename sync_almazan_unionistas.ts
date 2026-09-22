import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';
const supabase = createClient(supabaseUrl, supabaseKey);

const ALMAZAN_ID = 'e59af98c-dcfa-4277-8cd7-b6f781d64345'; // C.D. Almazán
const UNIONISTAS_B_ID = '6e944e05-4493-474b-8975-40c0ba1f7b6e'; // Unionistas de Salamanca C.F. "B"

interface PlayerDef {
  dorsal: number;
  nombre: string;
  demarcacion: string;
  caracteristicas: string;
  file: string;
}

const ALMAZAN_PLAYERS: PlayerDef[] = [
  // Titulares
  { dorsal: 13, nombre: 'VAREA MONTORO, ANTONIO', demarcacion: 'Portero', caracteristicas: 'Dorsal 13 | Titular | Portero', file: 'almazan_dorsal_13.png' },
  { dorsal: 3, nombre: 'MORENO MOÑUX, VICTOR', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 3 | Titular | Lateral', file: 'almazan_dorsal_3.png' },
  { dorsal: 5, nombre: 'CHECA MARINA, RAFAEL', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 5 | Titular | Central', file: 'almazan_dorsal_5.png' },
  { dorsal: 6, nombre: 'GIL MARCOS, MARCOS', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 6 | Titular | Central / Mediocentro', file: 'almazan_dorsal_6.png' },
  { dorsal: 10, nombre: 'GARCIA ALBITRE, JAVIER', demarcacion: 'Mediapunta', caracteristicas: 'Dorsal 10 | Titular | Mediapunta / Organizador', file: 'almazan_dorsal_10.png' },
  { dorsal: 11, nombre: 'MIÑANA RUBIO, OSCAR', demarcacion: 'Extremo', caracteristicas: 'Dorsal 11 | Titular | Extremo', file: 'almazan_dorsal_11.png' },
  { dorsal: 14, nombre: 'MARTINEZ GARCIA, DANIEL', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 14 | Titular | Mediocentro', file: 'almazan_dorsal_14.png' },
  { dorsal: 16, nombre: 'SIDIBEH KRUBALLY, EBRAHIMA', demarcacion: 'Extremo', caracteristicas: 'Dorsal 16 | Titular | Extremo / Delantero', file: 'almazan_dorsal_16.png' },
  { dorsal: 18, nombre: 'ZUBIRI REMÍREZ, OSCAR', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 18 | Titular | Central', file: 'almazan_dorsal_18.png' },
  { dorsal: 21, nombre: 'NEVES VIÑARAS, ALVARO', demarcacion: 'Interior', caracteristicas: 'Dorsal 21 | Titular | Interior / Extremo', file: 'almazan_dorsal_21.png' },
  { dorsal: 22, nombre: 'MARTINEZ BOUTEFEU, HUGO', demarcacion: 'Delantero', caracteristicas: 'Dorsal 22 | Titular | Delantero Centro', file: 'almazan_dorsal_22.png' },

  // Suplentes
  { dorsal: 1, nombre: 'MÁRQUEZ LACALLE, JAVIER', demarcacion: 'Portero', caracteristicas: 'Dorsal 1 | Suplente | Portero', file: 'almazan_dorsal_1.png' },
  { dorsal: 2, nombre: 'PÉREZ LÓPEZ, HÉCTOR', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 2 | Suplente | Lateral', file: 'almazan_dorsal_2.png' },
  { dorsal: 8, nombre: 'SANTA CRUZ HERNANDEZ, SERGIO', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 8 | Suplente | Mediocentro', file: 'almazan_dorsal_8.png' },
  { dorsal: 9, nombre: 'VILLANUEVA LATORRE, JESUS BERNARDO', demarcacion: 'Delantero', caracteristicas: 'Dorsal 9 | Suplente | Delantero Centro', file: 'almazan_dorsal_9.png' },
  { dorsal: 15, nombre: 'MATA RODRIGO, YAGO', demarcacion: 'Interior', caracteristicas: 'Dorsal 15 | Suplente | Interior / Mediocentro', file: 'almazan_dorsal_15.png' },
  { dorsal: 17, nombre: 'SUSSOHO DIALLO, HAME', demarcacion: 'Extremo', caracteristicas: 'Dorsal 17 | Suplente | Extremo', file: 'almazan_dorsal_17.png' },
  { dorsal: 19, nombre: 'JIMENEZ GARCIA, HUGO', demarcacion: 'Mediapunta', caracteristicas: 'Dorsal 19 | Suplente | Mediapunta', file: 'almazan_dorsal_19.png' },
  { dorsal: 20, nombre: 'ELVIRA RODRIGO, CARLOS', demarcacion: 'Portero', caracteristicas: 'Dorsal 20 | Suplente | Portero', file: 'almazan_dorsal_20.png' },
  { dorsal: 23, nombre: 'DELGADO ZAMORA, JORGE', demarcacion: 'Delantero', caracteristicas: 'Dorsal 23 | Suplente | Delantero', file: 'almazan_dorsal_23.png' },
];

const UNIONISTAS_B_PLAYERS: PlayerDef[] = [
  // Titulares
  { dorsal: 1, nombre: 'VICTOR DIEZ', demarcacion: 'Portero', caracteristicas: 'Dorsal 1 | Titular | Portero', file: 'unionistas_b_dorsal_1.png' },
  { dorsal: 2, nombre: 'OTERO UNDABEITIA, ALVARO', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 2 | Titular | Lateral Derecho', file: 'unionistas_b_dorsal_2.png' },
  { dorsal: 3, nombre: 'FORTES MELLADO, JOEL', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 3 | Titular | Lateral Izquierdo / Central', file: 'unionistas_b_dorsal_3.png' },
  { dorsal: 5, nombre: 'Isma', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 5 | Titular | Central', file: 'unionistas_b_dorsal_5.png' },
  { dorsal: 7, nombre: 'Jaime', demarcacion: 'Extremo', caracteristicas: 'Dorsal 7 | Titular | Extremo', file: 'unionistas_b_dorsal_7.png' },
  { dorsal: 11, nombre: 'TORRES GONZALEZ, JOSE MANUEL', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 11 | Titular | Mediocentro / Extremo', file: 'unionistas_b_dorsal_11.png' },
  { dorsal: 12, nombre: 'EBILEGUE, KYLIAN BRICE', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 12 | Titular | Central / Pivote', file: 'unionistas_b_dorsal_12.png' },
  { dorsal: 15, nombre: 'VAZQUEZ COUCEIRO, ADRIAN', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 15 | Titular | Mediocentro', file: 'unionistas_b_dorsal_15.png' },
  { dorsal: 18, nombre: 'ASIER BERZAL', demarcacion: 'Delantero', caracteristicas: 'Dorsal 18 | Titular | Delantero / Extremo', file: 'unionistas_b_dorsal_18.png' },
  { dorsal: 22, nombre: 'HUGO PORCEL', demarcacion: 'Delantero', caracteristicas: 'Dorsal 22 | Titular | Delantero Centro', file: 'unionistas_b_dorsal_22.png' },
  { dorsal: 23, nombre: 'Pascual', demarcacion: 'Mediapunta', caracteristicas: 'Dorsal 23 | Titular | Mediapunta / Delantero', file: 'unionistas_b_dorsal_23.png' },

  // Suplentes
  { dorsal: 13, nombre: 'Nacho', demarcacion: 'Portero', caracteristicas: 'Dorsal 13 | Suplente | Portero', file: 'unionistas_b_dorsal_13.png' },
  { dorsal: 4, nombre: 'ELOY ALONSO MORALES', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 4 | Suplente | Central', file: 'unionistas_b_dorsal_4.png' },
  { dorsal: 6, nombre: 'JORGE', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 6 | Suplente | Mediocentro', file: 'unionistas_b_dorsal_6.png' },
  { dorsal: 9, nombre: 'Joel', demarcacion: 'Delantero', caracteristicas: 'Dorsal 9 | Suplente | Delantero Centro', file: 'unionistas_b_dorsal_9.png' },
  { dorsal: 10, nombre: 'OSCAR CAÑEDO', demarcacion: 'Mediapunta', caracteristicas: 'Dorsal 10 | Suplente | Mediapunta', file: 'unionistas_b_dorsal_10.png' },
  { dorsal: 16, nombre: 'BAYARRI GONZALEZ, ALFREDO', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 16 | Suplente | Lateral', file: 'unionistas_b_dorsal_16.png' },
  { dorsal: 20, nombre: 'RODRÍGUEZ BLANCO, RAFAEL', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 20 | Suplente | Mediocentro / Delantero', file: 'unionistas_b_dorsal_20.png' },
  { dorsal: 21, nombre: 'ROZAS SÁNCHEZ, ALEJANDRO', demarcacion: 'Extremo', caracteristicas: 'Dorsal 21 | Suplente | Extremo / Interior', file: 'unionistas_b_dorsal_21.png' },
  { dorsal: 24, nombre: 'LEO LOPEZ', demarcacion: 'Delantero', caracteristicas: 'Dorsal 24 | Suplente | Delantero', file: 'unionistas_b_dorsal_24.png' },
];

async function syncTeamPlayers(teamId: string, teamName: string, players: PlayerDef[]) {
  console.log(`\n========================================`);
  console.log(`SYNCING PLAYERS FOR: ${teamName} (${teamId})`);
  console.log(`========================================`);

  // 1. Get existing players for this team
  const { data: existing, error: fetchErr } = await supabase
    .from('jugadores_equipo')
    .select('*')
    .eq('equipo_id', teamId);

  if (fetchErr) {
    console.error('Error fetching existing team players:', fetchErr);
  }

  for (const p of players) {
    const localPath = path.join(process.cwd(), 'public', 'players', 'rivals', p.file);
    let photoUrl = `/players/rivals/${p.file}`;

    if (fs.existsSync(localPath)) {
      try {
        const buffer = fs.readFileSync(localPath);
        const storagePath = `rivals/${p.file}`;
        const { data: upData, error: upErr } = await supabase.storage
          .from('FOTOS JUGADORES')
          .upload(storagePath, buffer, {
            contentType: 'image/png',
            upsert: true,
          });

        if (!upErr && upData) {
          const { data: { publicUrl } } = supabase.storage
            .from('FOTOS JUGADORES')
            .getPublicUrl(storagePath);
          photoUrl = publicUrl;
          console.log(`[Storage] Uploaded ${storagePath} -> ${photoUrl}`);
        } else {
          console.log(`[Storage Note] Using local fallback: ${photoUrl} (${upErr?.message})`);
        }
      } catch (err: any) {
        console.error(`[Storage Error] ${err.message}`);
      }
    }

    // Match by exact or partial name
    const match = existing?.find(e => {
      const eNom = e.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const pNom = p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return eNom === pNom || eNom.includes(pNom) || pNom.includes(eNom);
    });

    const payload = {
      equipo_id: teamId,
      nombre: p.nombre,
      demarcacion: p.demarcacion,
      caracteristicas: p.caracteristicas,
      foto_url: photoUrl
    };

    if (match) {
      const { error: updErr } = await supabase
        .from('jugadores_equipo')
        .update(payload)
        .eq('id', match.id);

      if (updErr) {
        console.error(`Error updating player ${p.nombre}:`, updErr);
      } else {
        console.log(`✓ Actualizado: [Dorsal ${p.dorsal}] ${p.nombre} (${p.demarcacion})`);
      }
    } else {
      const { error: insErr } = await supabase
        .from('jugadores_equipo')
        .insert(payload);

      if (insErr) {
        console.error(`Error inserting player ${p.nombre}:`, insErr);
      } else {
        console.log(`✓ Insertado: [Dorsal ${p.dorsal}] ${p.nombre} (${p.demarcacion})`);
      }
    }
  }
}

async function run() {
  await syncTeamPlayers(ALMAZAN_ID, 'C.D. Almazán', ALMAZAN_PLAYERS);
  await syncTeamPlayers(UNIONISTAS_B_ID, 'Unionistas de Salamanca C.F. "B"', UNIONISTAS_B_PLAYERS);
  console.log('\n=== TODO COMPLETADO CON ÉXITO ===');
}

run();
