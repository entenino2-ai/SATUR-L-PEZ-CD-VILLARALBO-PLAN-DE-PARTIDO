import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';
const supabase = createClient(supabaseUrl, supabaseKey);

const SALAMANCA_B_ID = '40a6f521-18f7-4f8a-8f4f-401b04fcfac2'; // Salamanca C.F. UDS "B"
const LA_VIRGEN_ID = '22692d85-1cb8-4b2d-b3df-2785e16ff503';   // C.D. La Virgen del Camino

interface PlayerDef {
  dorsal: number;
  nombre: string;
  demarcacion: string;
  caracteristicas: string;
  file: string;
}

const SALAMANCA_B_PLAYERS: PlayerDef[] = [
  // Titulares
  { dorsal: 13, nombre: 'VELASCO LOZANO, ISMAEL', demarcacion: 'Portero', caracteristicas: 'Dorsal 13 | Titular | Portero', file: 'salamanca_b_dorsal_13.png' },
  { dorsal: 2, nombre: 'CASCON GOMEZ, PABLO', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 2 | Titular | Lateral', file: 'salamanca_b_dorsal_2.png' },
  { dorsal: 3, nombre: 'GARCÍA SÁNCHEZ, SERGIO', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 3 | Titular | Lateral / Central', file: 'salamanca_b_dorsal_3.png' },
  { dorsal: 5, nombre: 'DOMÍNGUEZ MULAS, SERGIO', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 5 | Titular | Central', file: 'salamanca_b_dorsal_5.png' },
  { dorsal: 8, nombre: 'RAMOS MORO, ANGEL', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 8 | Titular | Mediocentro', file: 'salamanca_b_dorsal_8.png' },
  { dorsal: 10, nombre: 'VIGO ACEVES, MANUEL', demarcacion: 'Mediapunta', caracteristicas: 'Dorsal 10 | Titular | Mediapunta / Organizador', file: 'salamanca_b_dorsal_10.png' },
  { dorsal: 11, nombre: 'MARTIN TENDERO, HUGO', demarcacion: 'Extremo', caracteristicas: 'Dorsal 11 | Titular | Extremo', file: 'salamanca_b_dorsal_11.png' },
  { dorsal: 15, nombre: 'ALONSO SANCHEZ, JAVIER', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 15 | Titular | Lateral / Mediocentro', file: 'salamanca_b_dorsal_15.png' },
  { dorsal: 18, nombre: 'MADRUGA BARRIGA, JAIME', demarcacion: 'Delantero', caracteristicas: 'Dorsal 18 | Titular | Delantero / Interior', file: 'salamanca_b_dorsal_18.png' },
  { dorsal: 23, nombre: 'OJEDA CABALLERO, IKER RONALDO', demarcacion: 'Extremo', caracteristicas: 'Dorsal 23 | Titular | Extremo / Delantero', file: 'salamanca_b_dorsal_23.png' },
  { dorsal: 25, nombre: 'SEGURA GIRALDEZ, MARIO', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 25 | Titular | Mediocentro', file: 'salamanca_b_dorsal_25.png' },

  // Suplentes
  { dorsal: 61, nombre: 'MENDOZA ALONSO, JUAN PABLO', demarcacion: 'Portero', caracteristicas: 'Dorsal 61 | Suplente | Portero', file: 'salamanca_b_dorsal_61.png' },
  { dorsal: 7, nombre: 'GONZALEZ FERNANDEZ, JAIME', demarcacion: 'Extremo', caracteristicas: 'Dorsal 7 | Suplente | Extremo', file: 'salamanca_b_dorsal_7.png' },
  { dorsal: 9, nombre: 'JIMÉNEZ JIMÉNEZ, ANGEL', demarcacion: 'Delantero', caracteristicas: 'Dorsal 9 | Suplente | Delantero Centro', file: 'salamanca_b_dorsal_9.png' },
  { dorsal: 12, nombre: 'Cojo', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 12 | Suplente | Lateral / Defensa', file: 'salamanca_b_dorsal_12.png' },
  { dorsal: 16, nombre: 'RIVERA RODRIGUEZ, SERGIO', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 16 | Suplente | Mediocentro', file: 'salamanca_b_dorsal_16.png' },
  { dorsal: 20, nombre: 'COBO OCEJA, MATEO', demarcacion: 'Mediapunta', caracteristicas: 'Dorsal 20 | Suplente | Mediapunta / Interior', file: 'salamanca_b_dorsal_20.png' },
  { dorsal: 22, nombre: 'TEJEDOR ROMERO, ALBERTO', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 22 | Suplente | Central', file: 'salamanca_b_dorsal_22.png' },
  { dorsal: 24, nombre: 'FERREIRO GOMEZ, ANTONIO', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 24 | Suplente | Mediocentro', file: 'salamanca_b_dorsal_24.png' },
  { dorsal: 37, nombre: 'MULAS GONZALEZ, LUCAS', demarcacion: 'Extremo', caracteristicas: 'Dorsal 37 | Suplente | Extremo / Delantero', file: 'salamanca_b_dorsal_37.png' },
  { dorsal: 0, nombre: 'NADAL GARCÍA, JAVIER', demarcacion: 'Delantero', caracteristicas: 'Delantero / Extremo | Salamanca CF UDS B', file: 'salamanca_b_nadal_garcia_javier.png' },
];

const LA_VIRGEN_PLAYERS: PlayerDef[] = [
  // Titulares
  { dorsal: 1, nombre: 'FREILE RAMOS, DANIEL', demarcacion: 'Portero', caracteristicas: 'Dorsal 1 | Titular | Portero', file: 'la_virgen_dorsal_1.png' },
  { dorsal: 4, nombre: 'PEREZ PEREZ, FRANCISCO JAVIER', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 4 | Titular | Central', file: 'la_virgen_dorsal_4.png' },
  { dorsal: 5, nombre: 'PEREZ VERA MERINO, EUGENIO', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 5 | Titular | Central / Lateral', file: 'la_virgen_dorsal_5.png' },
  { dorsal: 6, nombre: 'CARNICERO GAGO, ÓLIVER', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 6 | Titular | Mediocentro', file: 'la_virgen_dorsal_6.png' },
  { dorsal: 11, nombre: 'LESCUN MORAN, MIGUEL', demarcacion: 'Extremo', caracteristicas: 'Dorsal 11 | Titular | Extremo', file: 'la_virgen_dorsal_11.png' },
  { dorsal: 12, nombre: 'MOLINA MARTINEZ, DIEGO', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 12 | Titular | Lateral / Mediocentro', file: 'la_virgen_dorsal_12.png' },
  { dorsal: 14, nombre: 'MARTÍNEZ VELASCO, ALBERTO', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 14 | Titular | Mediocentro', file: 'la_virgen_dorsal_14.png' },
  { dorsal: 18, nombre: 'LÓPEZ NICOLÁS, PABLO', demarcacion: 'Mediapunta', caracteristicas: 'Dorsal 18 | Titular | Mediapunta / Delantero', file: 'la_virgen_dorsal_18.png' },
  { dorsal: 20, nombre: 'ALONSO BARDON, JORGE', demarcacion: 'Interior', caracteristicas: 'Dorsal 20 | Titular | Interior / Mediapunta', file: 'la_virgen_dorsal_20.png' },
  { dorsal: 22, nombre: 'NIETO GONZALEZ, ALVARO', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 22 | Titular | Central', file: 'la_virgen_dorsal_22.png' },
  { dorsal: 26, nombre: 'NEGRAL FERNANDEZ, DANIEL', demarcacion: 'Delantero', caracteristicas: 'Dorsal 26 | Titular | Delantero Centro', file: 'la_virgen_dorsal_26.png' },

  // Suplentes
  { dorsal: 13, nombre: 'MARTINEZ MORILLO, ALEJANDRO', demarcacion: 'Portero', caracteristicas: 'Dorsal 13 | Suplente | Portero', file: 'la_virgen_dorsal_13.png' },
  { dorsal: 3, nombre: 'PEREDA PUENTE, ALEJANDRO', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 3 | Suplente | Lateral / Portero', file: 'la_virgen_dorsal_3.png' },
  { dorsal: 7, nombre: 'VISA MARTINEZ, MARIO', demarcacion: 'Extremo', caracteristicas: 'Dorsal 7 | Suplente | Extremo', file: 'la_virgen_dorsal_7.png' },
  { dorsal: 9, nombre: 'CALLEJA VAZQUEZ, ABEL', demarcacion: 'Delantero', caracteristicas: 'Dorsal 9 | Suplente | Delantero Centro', file: 'la_virgen_dorsal_9.png' },
  { dorsal: 15, nombre: 'DE PRADO QUINTANA, VICTOR', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 15 | Suplente | Mediocentro / Lateral', file: 'la_virgen_dorsal_15.png' },
  { dorsal: 16, nombre: 'CARPINTERO ALLEGUE, IKER', demarcacion: 'Interior', caracteristicas: 'Dorsal 16 | Suplente | Interior / Extremo', file: 'la_virgen_dorsal_16.png' },
  { dorsal: 17, nombre: 'ALVAREZ CASTRILLO, HUGO', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 17 | Suplente | Mediocentro', file: 'la_virgen_dorsal_17.png' },
  { dorsal: 19, nombre: 'CARTON CARRERA, HECTOR', demarcacion: 'Delantero', caracteristicas: 'Dorsal 19 | Suplente | Delantero', file: 'la_virgen_dorsal_19.png' },
  { dorsal: 21, nombre: 'ALLER FERNANDEZ, JORGE', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 21 | Suplente | Central', file: 'la_virgen_dorsal_21.png' },
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
  await syncTeamPlayers(SALAMANCA_B_ID, 'Salamanca C.F. UDS "B"', SALAMANCA_B_PLAYERS);
  await syncTeamPlayers(LA_VIRGEN_ID, 'C.D. La Virgen del Camino', LA_VIRGEN_PLAYERS);
  console.log('\n=== TODO COMPLETADO CON ÉXITO ===');
}

run();
