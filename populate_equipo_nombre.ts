import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function populateEquipoNombre() {
  console.log('========================================================================');
  console.log('POBLANDO Y VERIFICANDO COLUMNA equipo_nombre EN jugadores_equipo');
  console.log('========================================================================\n');

  const { data: teams, error: tErr } = await supabase.from('equipos').select('id, nombre');
  const { data: players, error: pErr } = await supabase.from('jugadores_equipo').select('*');

  if (tErr || pErr) {
    console.error('Error al consultar datos:', tErr || pErr);
    return;
  }

  const teamMap = new Map((teams || []).map(t => [t.id, t.nombre]));
  console.log(`Equipos en BD: ${teams?.length}`);
  console.log(`Jugadores en BD: ${players?.length}\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const p of (players || [])) {
    const teamName = teamMap.get(p.equipo_id);
    if (!teamName) {
      skippedCount++;
      continue;
    }

    // Try updating equipo_nombre
    const { error: upErr } = await supabase
      .from('jugadores_equipo')
      .update({ equipo_nombre: teamName })
      .eq('id', p.id);

    if (upErr) {
      if (upErr.message?.includes('equipo_nombre') || upErr.code === '42703') {
        console.log(`⚠️ La columna 'equipo_nombre' aún no existe en la tabla física de Supabase.`);
        console.log(`👉 Ejecuta la sentencia SQL en el SQL Editor de Supabase:`);
        console.log(`\nALTER TABLE jugadores_equipo ADD COLUMN IF NOT EXISTS equipo_nombre VARCHAR(255);\nUPDATE jugadores_equipo j SET equipo_nombre = e.nombre FROM equipos e WHERE j.equipo_id = e.id;\n`);
        return;
      } else {
        console.error(`Error actualizando jugador ${p.nombre}:`, upErr.message);
      }
    } else {
      updatedCount++;
    }
  }

  console.log(`✓ Jugadores actualizados con nombre de equipo: ${updatedCount}`);
  console.log(`✓ Total procesados correctamente.`);
}

populateEquipoNombre();
