import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';

const supabase = createClient(supabaseUrl, supabaseKey);

interface CalasanzPlayerDef {
  dorsal: number | null;
  nombre: string;
  demarcacion: 'Portero' | 'Defensa Central' | 'Defensa Lateral' | 'Mediocentro' | 'Interior' | 'Extremo' | 'Mediapunta' | 'Delantero';
  caracteristicas: string;
  foto_archivo: string | null;
}

const CALASANZ_SQUAD: CalasanzPlayerDef[] = [
  // Titulares
  { dorsal: 1, nombre: 'MÍNGUEZ BRAVO, FERNANDO', demarcacion: 'Portero', caracteristicas: 'Dorsal 1 | Titular | Portero', foto_archivo: '01_MINGUEZ_BRAVO__FERNANDO.png' },
  { dorsal: 5, nombre: 'MIGUEL CHICO, ALVARO', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 5 | Titular | Central', foto_archivo: '05_MIGUEL_CHICO__ALVARO.png' },
  { dorsal: 6, nombre: 'MARTINEZ SANZ, ADRIAN', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 6 | Titular | Central / Lateral', foto_archivo: '06_MARTINEZ_SANZ__ADRIAN.png' },
  { dorsal: 8, nombre: 'GARCIA ORDEN, EDUARDO', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 8 | Titular | Mediocentro', foto_archivo: '08_GARCIA_ORDEN__EDUARDO.png' },
  { dorsal: 10, nombre: 'NIETO VELA, DANIEL', demarcacion: 'Mediapunta', caracteristicas: 'Dorsal 10 | Titular | Mediapunta / Organizador', foto_archivo: '10_NIETO_VELA__DANIEL.png' },
  { dorsal: 11, nombre: 'BACIERO ALVAREZ, ASIER', demarcacion: 'Extremo', caracteristicas: 'Dorsal 11 | Titular | Extremo', foto_archivo: '11_BACIERO_ALVAREZ__ASIER.png' },
  { dorsal: 12, nombre: 'MATEO PEREZ, DIEGO', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 12 | Titular | Lateral', foto_archivo: '12_MATEO_PEREZ__DIEGO.png' },
  { dorsal: 14, nombre: 'GARCIA SAUKO, DANIEL', demarcacion: 'Mediocentro', caracteristicas: 'Dorsal 14 | Titular | Mediocentro', foto_archivo: '14_GARCIA_SAUKO__DANIEL.png' },
  { dorsal: 16, nombre: 'DOMINGUEZ VELA, RODRIGO', demarcacion: 'Extremo', caracteristicas: 'Dorsal 16 | Titular | Extremo / Delantero', foto_archivo: '16_DOMINGUEZ_VELA__RODRIGO.png' },
  { dorsal: 21, nombre: 'SANZ MARTINEZ, PABLO', demarcacion: 'Interior', caracteristicas: 'Dorsal 21 | Titular | Interior', foto_archivo: '21_SANZ_MARTINEZ__PABLO.png' },
  { dorsal: 22, nombre: 'ACEBES HUERTA, EDGAR', demarcacion: 'Delantero', caracteristicas: 'Dorsal 22 | Titular | Delantero Centro', foto_archivo: '22_ACEBES_HUERTA__EDGAR.png' },

  // Suplentes
  { dorsal: 33, nombre: 'GARRIDO GONZALEZ, RAUL', demarcacion: 'Portero', caracteristicas: 'Dorsal 33 | Suplente | Portero', foto_archivo: '33_GARRIDO_GONZALEZ__RAUL.png' },
  { dorsal: 4, nombre: 'DOMINGO CAMPOS, ASIER', demarcacion: 'Defensa Lateral', caracteristicas: 'Dorsal 4 | Suplente | Lateral', foto_archivo: '04_DOMINGO_CAMPOS__ASIER.png' },
  { dorsal: 7, nombre: 'AGUSTÍN DOMINGO, ALEJANDRO', demarcacion: 'Extremo', caracteristicas: 'Dorsal 7 | Suplente | Extremo', foto_archivo: '07_AGUSTIN_DOMINGO__ALEJANDRO.png' },
  { dorsal: 9, nombre: 'RUBIO URCHAGA, HECTOR', demarcacion: 'Delantero', caracteristicas: 'Dorsal 9 | Suplente | Delantero', foto_archivo: '09_RUBIO_URCHAGA__HECTOR.png' },
  { dorsal: 17, nombre: 'MADRIGAL DUARTE, SERGIO', demarcacion: 'Delantero', caracteristicas: 'Dorsal 17 | Suplente | Delantero', foto_archivo: '17_MADRIGAL_DUARTE__SERGIO.png' },
  { dorsal: 20, nombre: 'CORDEIRO BARTOLOME, DIEGO', demarcacion: 'Interior', caracteristicas: 'Dorsal 20 | Suplente | Interior / Mediocentro', foto_archivo: '20_CORDEIRO_BARTOLOME__DIEGO.png' },
  { dorsal: 23, nombre: 'GÓMEZ GARCÍA, SERGIO', demarcacion: 'Mediapunta', caracteristicas: 'Dorsal 23 | Suplente | Mediapunta', foto_archivo: '23_GOMEZ_GARCIA__SERGIO.png' },
  { dorsal: 24, nombre: 'NIÑO RUIZ, IVAN', demarcacion: 'Defensa Central', caracteristicas: 'Dorsal 24 | Suplente | Central', foto_archivo: '24_NINO_RUIZ__IVAN.png' },

  // Plantilla adicional de la lista
  { dorsal: null, nombre: 'CASCANTE RUIZ DE EGUINO, ADRIAN', demarcacion: 'Defensa Lateral', caracteristicas: 'Defensa / Lateral | C.D. Calasanz de Soria', foto_archivo: null },
  { dorsal: null, nombre: 'CATALINA DOMINGUEZ, OSCAR', demarcacion: 'Mediocentro', caracteristicas: 'Mediocentro | C.D. Calasanz de Soria', foto_archivo: null },
  { dorsal: null, nombre: 'MARTINEZ ANDRÉS, LUCAS', demarcacion: 'Delantero', caracteristicas: 'Delantero | C.D. Calasanz de Soria', foto_archivo: null },
  { dorsal: null, nombre: 'MELGAR ADAN, AARON', demarcacion: 'Portero', caracteristicas: 'Portero | C.D. Calasanz de Soria', foto_archivo: null },
  { dorsal: null, nombre: 'PÉREZ CAVERO, ADÁN', demarcacion: 'Extremo', caracteristicas: 'Extremo / Delantero | C.D. Calasanz de Soria', foto_archivo: null }
];

async function syncCalasanz() {
  console.log('========================================================================');
  console.log('SINCRONIZANDO C.D. CALASANZ DE SORIA EN SUPABASE (STORAGE + DB)');
  console.log('========================================================================\n');

  // 1. Get or create Team C.D. Calasanz de Soria
  let { data: team, error: teamErr } = await supabase
    .from('equipos')
    .select('*')
    .ilike('nombre', '%calasanz%')
    .maybeSingle();

  if (!team) {
    console.log('Creando equipo C.D. Calasanz de Soria...');
    const { data: newTeam, error: createErr } = await supabase
      .from('equipos')
      .insert({
        nombre: 'C.D. Calasanz de Soria',
        escudo_url: '/shields/calasanz_soria.png'
      })
      .select()
      .single();
    if (createErr) throw createErr;
    team = newTeam;
  }

  const teamId = team.id;
  const teamName = team.nombre;
  const storageFolder = 'CD_Calasanz_de_Soria';
  const localDir = path.join(process.cwd(), 'public', 'players', 'jugadores_equipo', storageFolder);

  console.log(`Equipo: ${teamName} (ID: ${teamId})`);
  console.log(`Subcarpeta Supabase: jugadores_equipo/${storageFolder}/\n`);

  // 2. Upload photos to Supabase Storage
  const playersForJSON: any[] = [];
  let uploadCount = 0;

  for (const p of CALASANZ_SQUAD) {
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
        // Retry without equipo_nombre if column is pending
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
  console.log(`SINCRONIZACIÓN EXITOSA: ${playersForJSON.length} JUGADORES DE CALASANZ EN SUPABASE`);
  console.log(`========================================================================\n`);
}

syncCalasanz();
