import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';

const supabase = createClient(supabaseUrl, supabaseKey);

function getStorageSafeFolder(teamName: string): string {
  const mapping: Record<string, string> = {
    'Arandina CF': 'Arandina_CF',
    'Burgos C.F. S.A.D. "B"': 'Burgos_CF_B',
    'C.D. Almazán': 'CD_Almazan',
    'C.D. La Virgen del Camino': 'La_Virgen_del_Camino',
    'Salamanca C.F. UDS "B"': 'Salamanca_UDS_B',
    'Salamanca UDS': 'Salamanca_UDS',
    'U.D. Santa Marta de Tormes': 'Santa_Marta',
    'Unionistas de Salamanca C.F. "B"': 'Unionistas_B',
    'CD Villaralbo': 'CD_Villaralbo'
  };

  if (mapping[teamName]) {
    return mapping[teamName];
  }

  return teamName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function extractDorsal(player: any): number | null {
  if (player.caracteristicas) {
    const m = player.caracteristicas.match(/Dorsal\s*(\d+)/i);
    if (m) return parseInt(m[1], 10);
  }
  if (player.foto_url) {
    const m = player.foto_url.match(/dorsal_(\d+)/i);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

async function main() {
  console.log('========================================================================');
  console.log('GENERANDO DATOS ESPECÍFICOS Y FOTOS NOMBRADAS POR JUGADOR EN SUPABASE');
  console.log('========================================================================\n');

  const { data: teams, error: tErr } = await supabase.from('equipos').select('*').order('nombre');
  const { data: players, error: pErr } = await supabase.from('jugadores_equipo').select('*').order('nombre');

  if (tErr || pErr) {
    console.error('Error fetching from DB:', tErr || pErr);
    return;
  }

  const baseLocalDir = path.join(process.cwd(), 'public', 'players', 'jugadores_equipo');
  const rivalsLocalDir = path.join(process.cwd(), 'public', 'players', 'rivals');

  for (const team of teams || []) {
    const teamPlayers = (players || []).filter(p => p.equipo_id === team.id);
    if (teamPlayers.length === 0) continue;

    const folderName = getStorageSafeFolder(team.nombre);
    const localTeamDir = path.join(baseLocalDir, folderName);
    if (!fs.existsSync(localTeamDir)) {
      fs.mkdirSync(localTeamDir, { recursive: true });
    }

    console.log(`\n------------------------------------------------------------------------`);
    console.log(`📁 EQUIPO: ${team.nombre} -> Carpeta: jugadores_equipo/${folderName}/`);
    console.log(`   Jugadores a procesar: ${teamPlayers.length}`);
    console.log(`------------------------------------------------------------------------`);

    const playersDataForJSON: any[] = [];

    for (const player of teamPlayers) {
      const dorsal = extractDorsal(player);
      const cleanName = sanitizeFileName(player.nombre);
      const dorsalPrefix = dorsal !== null ? `${String(dorsal).padStart(2, '0')}_` : '';
      const specificPhotoName = `${dorsalPrefix}${cleanName}.png`;

      // Find local image source if available
      let sourcePath = '';
      if (player.foto_url) {
        const parts = player.foto_url.split('/');
        const originalFileName = parts[parts.length - 1].split('?')[0];
        
        const candidate1 = path.join(localTeamDir, originalFileName);
        const candidate2 = path.join(rivalsLocalDir, originalFileName);
        const candidate3 = path.join(process.cwd(), 'public', 'players', originalFileName);

        if (fs.existsSync(candidate1)) sourcePath = candidate1;
        else if (fs.existsSync(candidate2)) sourcePath = candidate2;
        else if (fs.existsSync(candidate3)) sourcePath = candidate3;
      }

      const storagePhotoPath = `jugadores_equipo/${folderName}/${specificPhotoName}`;
      let publicPhotoUrl = '';

      if (sourcePath && fs.existsSync(sourcePath)) {
        // Save locally with the player specific name
        const localPhotoDest = path.join(localTeamDir, specificPhotoName);
        fs.copyFileSync(sourcePath, localPhotoDest);

        // Upload photo to Supabase with specific player name
        const buffer = fs.readFileSync(sourcePath);
        const { error: upErr } = await supabase.storage
          .from('FOTOS JUGADORES')
          .upload(storagePhotoPath, buffer, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: true
          });

        if (upErr) {
          console.warn(`   ⚠️ Error subiendo foto ${specificPhotoName}:`, upErr.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('FOTOS JUGADORES')
          .getPublicUrl(storagePhotoPath);
        publicPhotoUrl = publicUrl;
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('FOTOS JUGADORES')
          .getPublicUrl(storagePhotoPath);
        publicPhotoUrl = publicUrl;
      }

      // Update player record with the new specific photo URL
      await supabase
        .from('jugadores_equipo')
        .update({ foto_url: publicPhotoUrl })
        .eq('id', player.id);

      const playerData = {
        id: player.id,
        nombre: player.nombre,
        dorsal: dorsal,
        demarcacion: player.demarcacion,
        caracteristicas: player.caracteristicas,
        foto_archivo: specificPhotoName,
        foto_url: publicPhotoUrl,
        equipo_id: player.equipo_id,
        equipo_nombre: team.nombre,
        creado_en: player.creado_en
      };

      playersDataForJSON.push(playerData);
      console.log(`   ✓ [Dorsal ${dorsal || '-'}] ${player.nombre} -> ${specificPhotoName}`);
    }

    // ========================================================================
    // CREATE PLANTILLA.JSON & DATOS_JUGADORES.CSV IN THE TEAM SUBFOLDER
    // ========================================================================
    const jsonContent = JSON.stringify({
      equipo: team.nombre,
      id_equipo: team.id,
      carpeta_storage: `jugadores_equipo/${folderName}/`,
      total_jugadores: playersDataForJSON.length,
      actualizado_en: new Date().toISOString(),
      plantilla: playersDataForJSON
    }, null, 2);

    // Write local JSON & CSV
    const localJsonPath = path.join(localTeamDir, 'plantilla.json');
    fs.writeFileSync(localJsonPath, jsonContent, 'utf-8');

    // CSV representation
    const csvHeader = 'ID,Dorsal,Nombre,Demarcacion,Caracteristicas,Foto_Archivo,Foto_URL\n';
    const csvRows = playersDataForJSON.map(p => 
      `"${p.id}","${p.dorsal || ''}","${p.nombre}","${p.demarcacion}","${(p.caracteristicas || '').replace(/"/g, '""')}","${p.foto_archivo}","${p.foto_url}"`
    ).join('\n');
    const localCsvPath = path.join(localTeamDir, 'plantilla.csv');
    fs.writeFileSync(localCsvPath, csvHeader + csvRows, 'utf-8');

    // Human-readable TXT roster summary
    const txtContent = `================================================================================
PLANTILLA Y DATOS DE JUGADORES - ${team.nombre.toUpperCase()}
================================================================================
Carpeta Storage: jugadores_equipo/${folderName}/
Total Jugadores: ${playersDataForJSON.length}
Fecha: ${new Date().toLocaleDateString('es-ES')}

` + playersDataForJSON.map(p => 
      `• [Dorsal ${p.dorsal ? String(p.dorsal).padStart(2, ' ') : '--'}] ${p.nombre}\n` +
      `  - Demarcación: ${p.demarcacion}\n` +
      `  - Perfil/Características: ${p.caracteristicas || 'No especificadas'}\n` +
      `  - Archivo Foto: ${p.foto_archivo}\n` +
      `  - URL Pública: ${p.foto_url}\n`
    ).join('\n');
    const localTxtPath = path.join(localTeamDir, 'datos_jugadores.txt');
    fs.writeFileSync(localTxtPath, txtContent, 'utf-8');

    // Upload plantilla.json to Supabase Storage
    const storageJsonPath = `jugadores_equipo/${folderName}/plantilla.json`;
    await supabase.storage
      .from('FOTOS JUGADORES')
      .upload(storageJsonPath, Buffer.from(jsonContent, 'utf-8'), {
        contentType: 'application/json',
        cacheControl: '3600',
        upsert: true
      });

    // Upload plantilla.csv to Supabase Storage
    const storageCsvPath = `jugadores_equipo/${folderName}/plantilla.csv`;
    await supabase.storage
      .from('FOTOS JUGADORES')
      .upload(storageCsvPath, Buffer.from(csvHeader + csvRows, 'utf-8'), {
        contentType: 'text/csv',
        cacheControl: '3600',
        upsert: true
      });

    // Upload datos_jugadores.txt to Supabase Storage
    const storageTxtPath = `jugadores_equipo/${folderName}/datos_jugadores.txt`;
    await supabase.storage
      .from('FOTOS JUGADORES')
      .upload(storageTxtPath, Buffer.from(txtContent, 'utf-8'), {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: true
      });

    console.log(`   📄 Creado y subido a Supabase:`);
    console.log(`      - jugadores_equipo/${folderName}/plantilla.json`);
    console.log(`      - jugadores_equipo/${folderName}/plantilla.csv`);
    console.log(`      - jugadores_equipo/${folderName}/datos_jugadores.txt`);
  }

  console.log('\n========================================================================');
  console.log('PROCESO COMPLETADO: TODAS LAS SUBCARPETAS TIENEN FOTOS CON NOMBRE ESPECÍFICO');
  console.log('Y SUS ARCHIVOS DE DATOS (plantilla.json, plantilla.csv, datos_jugadores.txt)');
  console.log('========================================================================\n');
}

main();
