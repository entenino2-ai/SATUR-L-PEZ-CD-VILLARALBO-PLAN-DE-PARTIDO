import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';

const supabase = createClient(supabaseUrl, supabaseKey);

interface GuijueloPlayerDef {
  dorsal: number | null;
  nombre: string;
  demarcacion: 'Portero' | 'Defensa Central' | 'Defensa Lateral' | 'Mediocentro' | 'Interior' | 'Extremo' | 'Mediapunta' | 'Delantero';
  caracteristicas: string;
  foto_archivo: string | null;
}

const GUIJUELO_SQUAD: GuijueloPlayerDef[] = [
  // Titulares
  { dorsal: 13, nombre: 'GUZMAN DE LOS SANTOS, JOHAN SNICK', demarcacion: 'Portero', caracteristicas: 'Dorsal 13 | Titular | Portero', foto_archivo: '13_GUZMAN_DE_LOS_SANTOS__JOHAN_SNICK.png' },
  { dorsal: 3, nombre: 'GONZALEZ GOMEZ, RODRIGO', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 3 | Titular | Lateral / Defensa', foto_archivo: '03_GONZALEZ_GOMEZ__RODRIGO.png' },
  { dorsal: 4, nombre: 'ROSON FERNANDEZ, DAVID', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 4 | Titular | Defensa Central', foto_archivo: '04_ROSON_FERNANDEZ__DAVID.png' },
  { dorsal: 5, nombre: 'RUIZ IBORRA, JOSÉ', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 5 | Titular | Defensa Central', foto_archivo: '05_RUIZ_IBORRA__JOSE.png' },
  { dorsal: 7, nombre: 'GARCIA OVIEDO, HUGO', demarcacion: 'Extremo', caracteristicas: 'Dorsal 7 | Titular | Extremo / Atacante', foto_archivo: '07_GARCIA_OVIEDO__HUGO.png' },
  { dorsal: 8, nombre: 'SANCHEZ ASTUDILLO, SERGIO', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 8 | Titular | Mediocentro / Pivote', foto_archivo: '08_SANCHEZ_ASTUDILLO__SERGIO.png' },
  { dorsal: 14, nombre: 'MARTIN ANDRES, ALBERTO', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 14 | Titular | Mediocentro', foto_archivo: '14_MARTIN_ANDRES__ALBERTO.png' },
  { dorsal: 17, nombre: 'SANCHEZ MARTIN, DANIEL', demarcacion: 'Mediapunta', caracteristicas: 'Dorsal 17 | Titular | Mediapunta / Organizador', foto_archivo: '17_SANCHEZ_MARTIN__DANIEL.png' },
  { dorsal: 19, nombre: 'GODSON, CHRISTIAN', demarcacion: 'Delantero', caracteristicas: 'Dorsal 19 | Titular | Delantero Centro', foto_archivo: '19_GODSON__CHRISTIAN.png' },
  { dorsal: 21, nombre: 'ALVAREZ GARCIA, PEDRO', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 21 | Titular | Lateral', foto_archivo: '21_ALVAREZ_GARCIA__PEDRO.png' },
  { dorsal: 22, nombre: 'SANCHEZ GONZALEZ, ALVARO', demarcacion: 'Extremo', caracteristicas: 'Dorsal 22 | Titular | Extremo / Banda', foto_archivo: '22_SANCHEZ_GONZALEZ__ALVARO.png' },

  // Suplentes
  { dorsal: 1, nombre: 'FERNANDEZ GARCIA, DANIEL', demarcacion: 'Portero', caracteristicas: 'Dorsal 1 | Suplente | Portero', foto_archivo: '01_FERNANDEZ_GARCIA__DANIEL.png' },
  { dorsal: 6, nombre: 'GUTIERREZ PARRA, HUGO', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 6 | Suplente | Central / Defensa', foto_archivo: '06_GUTIERREZ_PARRA__HUGO.png' },
  { dorsal: 9, nombre: 'LAZARO GAITAN, ROBERTO', demarcacion: 'Delantero', caracteristicas: 'Dorsal 9 | Suplente | Delantero', foto_archivo: '09_LAZARO_GAITAN__ROBERTO.png' },
  { dorsal: 15, nombre: 'MURIEL SASTRE, FERNANDO', demarcacion: 'Interior', caracteristicas: 'Dorsal 15 | Suplente | Interior / Mediocentro', foto_archivo: '15_MURIEL_SASTRE__FERNANDO.png' },
  { dorsal: 16, nombre: 'CORDERO BALLESTEROS, DANIEL', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 16 | Suplente | Mediocentro', foto_archivo: '16_CORDERO_BALLESTEROS__DANIEL.png' },
  { dorsal: 20, nombre: 'REYES ARDILA, ROBERTO ANDRES', demarcacion: 'Extremo', caracteristicas: 'Dorsal 20 | Suplente | Extremo / Atacante', foto_archivo: '20_REYES_ARDILA__ROBERTO_ANDRES.png' }
];

async function syncGuijuelo() {
  console.log('========================================================================');
  console.log('SINCRONIZANDO C.D. GUIJUELO EN SUPABASE (STORAGE + DB)');
  console.log('========================================================================\n');

  // 1. Get or create Team C.D. Guijuelo
  let { data: team, error: teamErr } = await supabase
    .from('equipos')
    .select('*')
    .ilike('nombre', '%guijuelo%')
    .maybeSingle();

  if (!team) {
    console.log('Creando equipo C.D. Guijuelo...');
    const { data: newTeam, error: createErr } = await supabase
      .from('equipos')
      .insert({
        nombre: 'C.D. Guijuelo',
        escudo_url: '/shields/guijuelo.png'
      })
      .select()
      .single();
    if (createErr) throw createErr;
    team = newTeam;
  }

  const teamId = team.id;
  const teamName = team.nombre;
  const storageFolder = 'CD_Guijuelo';
  const localDir = path.join(process.cwd(), 'public', 'players', 'jugadores_equipo', storageFolder);

  console.log(`Equipo: ${teamName} (ID: ${teamId})`);
  console.log(`Subcarpeta Supabase: jugadores_equipo/${storageFolder}/\n`);

  // 2. Upload photos to Supabase Storage
  const playersForJSON: any[] = [];
  let uploadCount = 0;

  for (const p of GUIJUELO_SQUAD) {
    let publicUrl = '';
    
    if (p.foto_archivo) {
      const localPhotoPath = path.join(localDir, p.foto_archivo);
      const storagePath = `jugadores_equipo/${storageFolder}/${p.foto_archivo}`;

      if (fs.existsSync(localPhotoPath)) {
        const fileBuffer = fs.readFileSync(localPhotoPath);
        const { error: upErr } = await supabase.storage
          .from('FOTOS JUGADORES')
          .upload(storagePath, fileBuffer, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: true
          });

        if (upErr) {
          console.warn(`   ⚠️ Error subiendo ${p.foto_archivo}:`, upErr.message);
        } else {
          uploadCount++;
        }
      }

      const { data: { publicUrl: url } } = supabase.storage
        .from('FOTOS JUGADORES')
        .getPublicUrl(storagePath);
      publicUrl = url;
    }

    // Check if player exists in DB for this team
    const { data: existingPlayer } = await supabase
      .from('jugadores_equipo')
      .select('id')
      .eq('equipo_id', teamId)
      .eq('nombre', p.nombre)
      .maybeSingle();

    const recordPayload: any = {
      equipo_id: teamId,
      equipo_nombre: teamName,
      nombre: p.nombre,
      demarcacion: p.demarcacion,
      caracteristicas: p.caracteristicas,
      foto_url: publicUrl || null
    };

    let savedPlayerId = '';

    if (existingPlayer) {
      const { data: updData, error: updErr } = await supabase
        .from('jugadores_equipo')
        .update(recordPayload)
        .eq('id', existingPlayer.id)
        .select()
        .single();
      
      if (updErr) {
        delete recordPayload.equipo_nombre;
        await supabase.from('jugadores_equipo').update(recordPayload).eq('id', existingPlayer.id);
      }
      savedPlayerId = existingPlayer.id;
      console.log(`   ✓ [Actualizado] [Dorsal ${p.dorsal || '-'}] ${p.nombre}`);
    } else {
      const { data: insData, error: insErr } = await supabase
        .from('jugadores_equipo')
        .insert(recordPayload)
        .select()
        .single();

      if (insErr) {
        delete recordPayload.equipo_nombre;
        const { data: retryIns } = await supabase.from('jugadores_equipo').insert(recordPayload).select().single();
        savedPlayerId = retryIns?.id || '';
      } else {
        savedPlayerId = insData.id;
      }
      console.log(`   ✓ [Insertado] [Dorsal ${p.dorsal || '-'}] ${p.nombre}`);
    }

    playersForJSON.push({
      id: savedPlayerId,
      dorsal: p.dorsal,
      nombre: p.nombre,
      demarcacion: p.demarcacion,
      caracteristicas: p.caracteristicas,
      foto_archivo: p.foto_archivo,
      foto_url: publicUrl || null,
      equipo_id: teamId,
      equipo_nombre: teamName
    });
  }

  // 3. Create and Upload Data Files in the Supabase Subfolder
  const jsonContent = JSON.stringify({
    equipo: teamName,
    id_equipo: teamId,
    carpeta_storage: `jugadores_equipo/${storageFolder}/`,
    total_jugadores: playersForJSON.length,
    actualizado_en: new Date().toISOString(),
    plantilla: playersForJSON
  }, null, 2);

  const localJsonPath = path.join(localDir, 'plantilla.json');
  fs.writeFileSync(localJsonPath, jsonContent, 'utf-8');

  const csvHeader = 'ID,Dorsal,Nombre,Demarcacion,Caracteristicas,Foto_Archivo,Foto_URL\n';
  const csvRows = playersForJSON.map(p => 
    `"${p.id}","${p.dorsal || ''}","${p.nombre}","${p.demarcacion}","${(p.caracteristicas || '').replace(/"/g, '""')}","${p.foto_archivo || ''}","${p.foto_url || ''}"`
  ).join('\n');
  const localCsvPath = path.join(localDir, 'plantilla.csv');
  fs.writeFileSync(localCsvPath, csvHeader + csvRows, 'utf-8');

  const txtContent = `================================================================================
PLANTILLA Y DATOS DE JUGADORES - ${teamName.toUpperCase()}
================================================================================
Carpeta Storage: jugadores_equipo/${storageFolder}/
Total Jugadores: ${playersForJSON.length}
Fecha: ${new Date().toLocaleDateString('es-ES')}

` + playersForJSON.map(p => 
    `• [Dorsal ${p.dorsal ? String(p.dorsal).padStart(2, ' ') : '--'}] ${p.nombre}\n` +
    `  - Demarcación: ${p.demarcacion}\n` +
    `  - Perfil/Características: ${p.caracteristicas || 'No especificadas'}\n` +
    `  - Archivo Foto: ${p.foto_archivo || 'Sin foto'}\n` +
    `  - URL Pública: ${p.foto_url || 'Sin URL'}\n`
  ).join('\n');
  const localTxtPath = path.join(localDir, 'datos_jugadores.txt');
  fs.writeFileSync(localTxtPath, txtContent, 'utf-8');

  // Upload to Supabase Storage
  await supabase.storage
    .from('FOTOS JUGADORES')
    .upload(`jugadores_equipo/${storageFolder}/plantilla.json`, Buffer.from(jsonContent, 'utf-8'), {
      contentType: 'application/json',
      cacheControl: '3600',
      upsert: true
    });

  await supabase.storage
    .from('FOTOS JUGADORES')
    .upload(`jugadores_equipo/${storageFolder}/plantilla.csv`, Buffer.from(csvHeader + csvRows, 'utf-8'), {
      contentType: 'text/csv',
      cacheControl: '3600',
      upsert: true
    });

  await supabase.storage
    .from('FOTOS JUGADORES')
    .upload(`jugadores_equipo/${storageFolder}/datos_jugadores.txt`, Buffer.from(txtContent, 'utf-8'), {
      contentType: 'text/plain',
      cacheControl: '3600',
      upsert: true
    });

  console.log(`\n📄 Archivos de datos subidos a Supabase Storage:`);
  console.log(`   - jugadores_equipo/${storageFolder}/plantilla.json`);
  console.log(`   - jugadores_equipo/${storageFolder}/plantilla.csv`);
  console.log(`   - jugadores_equipo/${storageFolder}/datos_jugadores.txt`);

  console.log(`\n========================================================================`);
  console.log(`SINCRONIZACIÓN EXITOSA: ${playersForJSON.length} JUGADORES DE C.D. GUIJUELO EN SUPABASE`);
  console.log(`========================================================================\n`);
}

syncGuijuelo().catch(err => {
  console.error('Error during sync:', err);
  process.exit(1);
});
