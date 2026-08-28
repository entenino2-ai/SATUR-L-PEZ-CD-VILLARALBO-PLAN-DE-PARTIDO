import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const teams = [
  { nombre: "Turégano C.F.", escudo_url: null },
  { nombre: "Atlético Mansillés", escudo_url: null },
  { nombre: "C.D. Palencia Cristo Atlético", escudo_url: null },
  { nombre: "Atlético Bembibre", escudo_url: null },
  { nombre: "C.D. Calasanz de Soria", escudo_url: null },
  { nombre: "C.D. Guijuelo", escudo_url: null },
  { nombre: "U.D. Santa Marta de Tormes", escudo_url: null },
  { nombre: "Arandina C.F.", escudo_url: null },
  { nombre: 'Burgos C.F. S.A.D. "B"', escudo_url: null },
  { nombre: "C.D. Villaralbo", escudo_url: null },
  { nombre: "Júpiter Leonés", escudo_url: null },
  { nombre: "C.D. Colegios Diocesanos", escudo_url: null },
  { nombre: 'C.D. Mirandés S.A.D. "B"', escudo_url: null },
  { nombre: "Palencia C.F. S.A.D.", escudo_url: null },
  { nombre: 'Salamanca C.F. UDS "B"', escudo_url: null },
  { nombre: "C.D. La Virgen del Camino", escudo_url: null },
  { nombre: "C.D. Almazán", escudo_url: null },
  { nombre: 'Unionistas de Salamanca C.F. "B"', escudo_url: null }
];

async function seed() {
  console.log("Insertando equipos...");
  for (const team of teams) {
    const { data: existingTeam } = await supabase
      .from('equipos')
      .select('id')
      .eq('nombre', team.nombre)
      .single();

    if (!existingTeam) {
      const { error } = await supabase.from('equipos').insert([team]);
      if (error) {
        console.error(`Error insertando ${team.nombre}:`, error.message);
      } else {
        console.log(`Equipo insertado: ${team.nombre}`);
      }
    } else {
      console.log(`El equipo ${team.nombre} ya existe.`);
    }
  }

  // Obtener IDs de Burgos B y Villaralbo
  const { data: burgos } = await supabase.from('equipos').select('id').eq('nombre', 'Burgos C.F. S.A.D. "B"').single();
  const { data: villaralbo } = await supabase.from('equipos').select('id').eq('nombre', 'C.D. Villaralbo').single();

  if (burgos && villaralbo) {
    // Comprobar si ya existe el partido
    const { data: partidoExistente } = await supabase
      .from('partidos')
      .select('id')
      .eq('equipo_local_id', burgos.id)
      .eq('equipo_visitante_id', villaralbo.id)
      .single();

    if (!partidoExistente) {
      console.log("Creando el partido Burgos C.F. S.A.D. 'B' vs C.D. Villaralbo...");
      const { data: nuevoPartido, error: errorPartido } = await supabase
        .from('partidos')
        .insert([{
          equipo_local_id: burgos.id,
          equipo_visitante_id: villaralbo.id,
          fecha: '2026-09-06T12:00:00Z',
          tipo: 'Liga',
          estado: 'Programado'
        }])
        .select()
        .single();
      
      if (errorPartido) {
        console.error("Error creando el partido:", errorPartido.message);
      } else {
        console.log("Partido creado con éxito!", nuevoPartido);
      }
    } else {
      console.log("El partido ya existe.");
    }
  }
}

seed();
