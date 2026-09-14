import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const SANTA_MARTA_ID = '655bfa2b-5e3d-4040-9ad9-b7db0ebb72ca'; // U.D. Santa Marta de Tormes
const ARANDINA_ID = '566d8e1b-8c69-47b9-aa5a-55830eb29f70';    // Arandina CF

interface PlayerDef {
  dorsal: number;
  nombre: string;
  demarcacion: string;
  caracteristicas: string;
  file: string;
}

const SANTA_MARTA_PLAYERS: PlayerDef[] = [
  // Titulares
  { dorsal: 1, nombre: 'DEL RÍO REDONDO, SERGIO', demarcacion: 'Portero', caracteristicas: 'Dorsal 1 | Titular | Portero', file: 'santa_marta_dorsal_1.png' },
  { dorsal: 2, nombre: 'ALONSO CARBALLO, DIEGO JOSE', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 2 | Titular | Lateral Derecho', file: 'santa_marta_dorsal_2.png' },
  { dorsal: 3, nombre: 'GARCÍA OLIVA, MANUEL SANTIAGO', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 3 | Titular | Central', file: 'santa_marta_dorsal_3.png' },
  { dorsal: 5, nombre: 'INIESTA SORIANO, ALEJANDRO', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 5 | Titular | Central', file: 'santa_marta_dorsal_5.png' },
  { dorsal: 6, nombre: 'VELAZQUEZ SANCHO, MIGUEL', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 6 | Titular | Mediocentro', file: 'santa_marta_dorsal_6.png' },
  { dorsal: 7, nombre: 'HERNANDEZ EZQUERRO, IKER', demarcacion: 'Extremo', caracteristicas: 'Dorsal 7 | Titular | Extremo / Delantero', file: 'santa_marta_dorsal_7.png' },
  { dorsal: 9, nombre: 'GALVAN ROMO, MARTIN LUIS', demarcacion: 'Delantero', caracteristicas: 'Dorsal 9 | Titular | Delantero Centro', file: 'santa_marta_dorsal_9.png' },
  { dorsal: 10, nombre: 'SANTOS RUBIO, SERGIO', demarcacion: 'Mediapunta', caracteristicas: 'Dorsal 10 | Titular | Mediapunta / Organizador', file: 'santa_marta_dorsal_10.png' },
  { dorsal: 19, nombre: 'NATER CARUNGAL, NINTE', demarcacion: 'Extremo', caracteristicas: 'Dorsal 19 | Titular | Extremo', file: 'santa_marta_dorsal_19.png' },
  { dorsal: 22, nombre: 'COQUE PÉREZ, ÁLVARO', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 22 | Titular | Lateral Izquierdo', file: 'santa_marta_dorsal_22.png' },
  { dorsal: 23, nombre: 'LEON ORTEGA, ADRIAN', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 23 | Titular | Pivote / Central', file: 'santa_marta_dorsal_23.png' },

  // Suplentes
  { dorsal: 13, nombre: 'SALDAÑA BAEZA, JOSE MARIA', demarcacion: 'Portero', caracteristicas: 'Dorsal 13 | Suplente | Portero', file: 'santa_marta_dorsal_13.png' },
  { dorsal: 4, nombre: 'GARRIDO RODRIGUEZ, DANIEL', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 4 | Suplente | Defensa Central', file: 'santa_marta_dorsal_4.png' },
  { dorsal: 8, nombre: 'GANDARA GONZALEZ, ROBERTO', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 8 | Suplente | Mediocentro', file: 'santa_marta_dorsal_8.png' },
  { dorsal: 11, nombre: 'MARTÍN MARCOS, DAVID', demarcacion: 'Extremo', caracteristicas: 'Dorsal 11 | Suplente | Extremo', file: 'santa_marta_dorsal_11.png' },
  { dorsal: 17, nombre: 'GARCIA GARCIA, ALONSO', demarcacion: 'Interior', caracteristicas: 'Dorsal 17 | Suplente | Interior / Extremo', file: 'santa_marta_dorsal_17.png' },
  { dorsal: 20, nombre: 'RODERO BERROCAL, ENRIQUE', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 20 | Suplente | Centrocampista', file: 'santa_marta_dorsal_20.png' },
  { dorsal: 21, nombre: 'ARIAS GARCIA, MANUEL', demarcacion: 'Delantero', caracteristicas: 'Dorsal 21 | Suplente | Delantero', file: 'santa_marta_dorsal_21.png' },
  { dorsal: 26, nombre: 'GARCIA VINAGRE, CHRISTIAN', demarcacion: 'Extremo', caracteristicas: 'Dorsal 26 | Suplente | Extremo', file: 'santa_marta_dorsal_26.png' },
  { dorsal: 30, nombre: 'EGIDO CALLES, ALVARO', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 30 | Suplente | Mediocentro', file: 'santa_marta_dorsal_30.png' },
];

const ARANDINA_PLAYERS: PlayerDef[] = [
  // Titulares
  { dorsal: 1, nombre: 'TAPIAS PEREZ, RODRIGO', demarcacion: 'Portero', caracteristicas: 'Dorsal 1 | Titular | Portero', file: 'arandina_dorsal_1.png' },
  { dorsal: 3, nombre: 'MARTIN AGUILAR, FRANCISCO', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 3 | Titular | Defensa Central / Lateral', file: 'arandina_dorsal_3.png' },
  { dorsal: 5, nombre: 'SASTOQUE PINZON, JUAN DIEGO', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 5 | Titular | Central', file: 'arandina_dorsal_5.png' },
  { dorsal: 8, nombre: 'GONZÁLEZ IGLESIAS, ISRAEL', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 8 | Titular | Mediocentro', file: 'arandina_dorsal_8.png' },
  { dorsal: 9, nombre: 'RENGEL RODRIGUEZ, JULIO', demarcacion: 'Delantero', caracteristicas: 'Dorsal 9 | Titular | Delantero Centro', file: 'arandina_dorsal_9.png' },
  { dorsal: 10, nombre: 'GONZALEZ SANTANA, MARIO', demarcacion: 'Mediapunta', caracteristicas: 'Dorsal 10 | Titular | Mediapunta / Creativo', file: 'arandina_dorsal_10.png' },
  { dorsal: 11, nombre: 'BARRANCO MONTOYA, FRANCISCO JAVIER', demarcacion: 'Extremo', caracteristicas: 'Dorsal 11 | Titular | Extremo', file: 'arandina_dorsal_11.png' },
  { dorsal: 14, nombre: 'NEBREDA MUÑOZ, LUCAS', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 14 | Titular | Lateral / Defensa', file: 'arandina_dorsal_14.png' },
  { dorsal: 18, nombre: 'KANOUTE, FAMOUSSA', demarcacion: 'Extremo', caracteristicas: 'Dorsal 18 | Titular | Extremo / Delantero', file: 'arandina_dorsal_18.png' },
  { dorsal: 19, nombre: 'MENOR MOLINERO, JOSE', demarcacion: 'Interior', caracteristicas: 'Dorsal 19 | Titular | Interior / Mediapunta', file: 'arandina_dorsal_19.png' },
  { dorsal: 21, nombre: 'JIMENEZ RUIZ, ADRIAN', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 21 | Titular | Lateral', file: 'arandina_dorsal_21.png' },

  // Suplentes
  { dorsal: 13, nombre: 'GONZALEZ CESPEDOSA, ALBERTO', demarcacion: 'Portero', caracteristicas: 'Dorsal 13 | Suplente | Portero', file: 'arandina_dorsal_13.png' },
  { dorsal: 4, nombre: 'HURTADO MELADO, ALEJANDRO', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 4 | Suplente | Defensa Central', file: 'arandina_dorsal_4.png' },
  { dorsal: 6, nombre: 'DE BENITO FERNANDEZ, AARON', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 6 | Suplente | Mediocentro', file: 'arandina_dorsal_6.png' },
  { dorsal: 7, nombre: 'VELASCO RUIZ, GUILLERMO', demarcacion: 'Extremo', caracteristicas: 'Dorsal 7 | Suplente | Extremo', file: 'arandina_dorsal_7.png' },
  { dorsal: 15, nombre: 'CORTIJO DEL HOYO, FERNANDO', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 15 | Suplente | Lateral', file: 'arandina_dorsal_15.png' },
  { dorsal: 20, nombre: 'CORTÁZAR GARCÍA, METEKU JUAN', demarcacion: 'Delantero', caracteristicas: 'Dorsal 20 | Suplente | Delantero / Extremo', file: 'arandina_dorsal_20.png' },
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

    // Match by exact or partial name or dorsal
    const match = existing?.find(e => {
      const eNom = e.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const pNom = p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return eNom.includes(pNom) || pNom.includes(eNom);
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
  await syncTeamPlayers(SANTA_MARTA_ID, 'U.D. Santa Marta de Tormes', SANTA_MARTA_PLAYERS);
  await syncTeamPlayers(ARANDINA_ID, 'Arandina CF', ARANDINA_PLAYERS);
  console.log('\n=== TODO COMPLETADO CON ÉXITO ===');
}

run();
