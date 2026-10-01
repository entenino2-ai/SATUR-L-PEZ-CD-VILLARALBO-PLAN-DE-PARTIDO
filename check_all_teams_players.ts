import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function main() {
  const { data: teams, error: e1 } = await supabase.from('equipos').select('id, nombre');
  const { data: players, error: e2 } = await supabase.from('jugadores_equipo').select('*');
  
  if (e1 || e2) {
    console.error('Errors:', e1, e2);
    return;
  }

  console.log(`=== ESTADO ACTUAL DE SUPABASE ===`);
  console.log(`Total Equipos: ${teams?.length}`);
  console.log(`Total Jugadores Rivales (jugadores_equipo): ${players?.length}\n`);

  const teamCounts: Record<string, { count: number; withPhoto: number; name: string }> = {};
  for (const t of teams || []) {
    teamCounts[t.id] = { count: 0, withPhoto: 0, name: t.nombre };
  }

  for (const p of players || []) {
    if (p.equipo_id && teamCounts[p.equipo_id]) {
      teamCounts[p.equipo_id].count++;
      if (p.foto_url && !p.foto_url.includes('placeholder') && p.foto_url.trim() !== '') {
        teamCounts[p.equipo_id].withPhoto++;
      }
    } else {
      const key = p.equipo_nombre || 'Desconocido';
      if (!teamCounts[key]) {
        teamCounts[key] = { count: 0, withPhoto: 0, name: key };
      }
      teamCounts[key].count++;
      if (p.foto_url && !p.foto_url.includes('placeholder') && p.foto_url.trim() !== '') {
        teamCounts[key].withPhoto++;
      }
    }
  }

  const teamsList = Object.entries(teamCounts).sort((a, b) => b[1].count - a[1].count);

  console.log(`EQUIPOS CON JUGADORES:`);
  for (const [id, info] of teamsList.filter(x => x[1].count > 0)) {
    console.log(` ✅ ${info.name}: ${info.count} jugadores (${info.withPhoto} con foto)`);
  }

  console.log(`\nEQUIPOS SIN JUGADORES REGISTRADOS (${teamsList.filter(x => x[1].count === 0).length}):`);
  for (const [id, info] of teamsList.filter(x => x[1].count === 0)) {
    console.log(` ❌ ${info.name} (id: ${id})`);
  }

  // Also check CD Villaralbo plantilla in 'jugadores' table
  const { data: localPlayers } = await supabase.from('jugadores').select('id, nombre, dorsal, demarcacion, foto_url');
  console.log(`\nCD VILLARALBO (tabla 'jugadores'): ${localPlayers?.length} jugadores`);
}

main().catch(console.error);
