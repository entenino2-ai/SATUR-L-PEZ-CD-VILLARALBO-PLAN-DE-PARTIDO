import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';

const supabase = createClient(supabaseUrl, supabaseKey);

// Storage-safe folder name (strips accents, quotes, dots, extra spaces)
function getStorageSafeFolder(teamName: string): string {
  // Common clean mappings
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

  // Fallback slugify
  return teamName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-zA-Z0-9_\-\s]/g, '') // remove quotes, dots, etc.
    .trim()
    .replace(/\s+/g, '_');
}

async function main() {
  console.log('===============================================================');
  console.log('ORGANIZANDO JUGADORES RIVALES EN SUB-CARPETAS SUPABASE');
  console.log('===============================================================\n');

  // 1. Fetch Teams
  const { data: teams, error: teamsErr } = await supabase.from('equipos').select('*');
  if (teamsErr) {
    console.error('Error fetching teams:', teamsErr);
    return;
  }

  // 2. Fetch all rival players
  const { data: rivalPlayers, error: rpErr } = await supabase.from('jugadores_equipo').select('*');
  if (rpErr) {
    console.error('Error fetching rival players:', rpErr);
    return;
  }

  console.log(`Total equipos en BD: ${teams?.length}`);
  console.log(`Total jugadores rivales en BD: ${rivalPlayers?.length}\n`);

  const rivalsLocalDir = path.join(process.cwd(), 'public', 'players', 'rivals');
  const baseLocalJugadoresEquipo = path.join(process.cwd(), 'public', 'players', 'jugadores_equipo');

  if (!fs.existsSync(baseLocalJugadoresEquipo)) {
    fs.mkdirSync(baseLocalJugadoresEquipo, { recursive: true });
  }

  let totalUploaded = 0;
  let totalUpdated = 0;
  const resultsByTeam: Record<string, { folder: string; count: number; uploaded: number }> = {};

  for (const team of teams || []) {
    const teamPlayers = (rivalPlayers || []).filter(p => p.equipo_id === team.id);
    if (teamPlayers.length === 0) continue;

    const teamFolder = getStorageSafeFolder(team.nombre);
    console.log(`\n-----------------------------------------------------------`);
    console.log(`📁 EQUIPO: ${team.nombre}`);
    console.log(`   📂 Subcarpeta Supabase: jugadores_equipo/${teamFolder}/`);
    console.log(`   👥 Jugadores a sincronizar: ${teamPlayers.length}`);
    console.log(`-----------------------------------------------------------`);

    // Create local subfolder
    const localTeamDir = path.join(baseLocalJugadoresEquipo, teamFolder);
    if (!fs.existsSync(localTeamDir)) {
      fs.mkdirSync(localTeamDir, { recursive: true });
    }

    let teamUploaded = 0;

    for (const player of teamPlayers) {
      let fileName = '';
      
      // Determine filename from existing foto_url
      if (player.foto_url) {
        const parts = player.foto_url.split('/');
        fileName = parts[parts.length - 1].split('?')[0];
      }

      // If no filename or invalid, generate one
      if (!fileName || !fileName.endsWith('.png')) {
        const cleanName = player.nombre
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_');
        fileName = `${cleanName}.png`;
      }

      // Look for local image file
      let sourcePath = path.join(rivalsLocalDir, fileName);
      if (!fs.existsSync(sourcePath)) {
        const altPath = path.join(process.cwd(), 'public', 'players', fileName);
        if (fs.existsSync(altPath)) {
          sourcePath = altPath;
        } else {
          const scrapedPath = path.join(process.cwd(), 'public', 'players', 'scraped', fileName);
          if (fs.existsSync(scrapedPath)) {
            sourcePath = scrapedPath;
          }
        }
      }

      const storagePath = `jugadores_equipo/${teamFolder}/${fileName}`;
      let publicSupabaseUrl = '';

      if (fs.existsSync(sourcePath)) {
        // Copy to local team folder
        const localDestPath = path.join(localTeamDir, fileName);
        fs.copyFileSync(sourcePath, localDestPath);

        // Upload to Supabase Storage
        const fileBuffer = fs.readFileSync(sourcePath);
        const { data: upData, error: upErr } = await supabase.storage
          .from('FOTOS JUGADORES')
          .upload(storagePath, fileBuffer, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: true
          });

        if (upErr) {
          console.warn(`   ⚠️ Storage error subiendo ${fileName}:`, upErr.message);
        } else {
          teamUploaded++;
          totalUploaded++;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('FOTOS JUGADORES')
          .getPublicUrl(storagePath);
        
        publicSupabaseUrl = publicUrl;
      } else {
        // Compute canonical public storage URL
        const { data: { publicUrl } } = supabase.storage
          .from('FOTOS JUGADORES')
          .getPublicUrl(storagePath);
        publicSupabaseUrl = publicUrl;
      }

      // Update player record in DB
      const { error: dbErr } = await supabase
        .from('jugadores_equipo')
        .update({ foto_url: publicSupabaseUrl })
        .eq('id', player.id);

      if (dbErr) {
        console.error(`   ❌ Error BD para ${player.nombre}:`, dbErr.message);
      } else {
        totalUpdated++;
        console.log(`   ✓ [${player.nombre}] -> ${storagePath}`);
      }
    }

    resultsByTeam[team.nombre] = {
      folder: `jugadores_equipo/${teamFolder}/`,
      count: teamPlayers.length,
      uploaded: teamUploaded
    };
  }

  console.log('\n===============================================================');
  console.log('RESUMEN DE SUBCARPETAS CREADAS EN SUPABASE STORAGE:');
  console.log('===============================================================');
  console.table(resultsByTeam);
  console.log(`\n✓ Total fotos subidas a subcarpetas: ${totalUploaded}`);
  console.log(`✓ Total jugadores actualizados con su nueva URL: ${totalUpdated}\n`);
}

main();
