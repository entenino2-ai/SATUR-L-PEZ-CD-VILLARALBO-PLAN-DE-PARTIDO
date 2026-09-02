import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';

const supabase = createClient(supabaseUrl, supabaseKey);

const BURGOS_B_SQUAD = [
  {
    nombre: 'Marc Monedero Sánchez',
    demarcacion: 'Portero',
    caracteristicas: 'Dorsal 1 | Portero'
  },
  {
    nombre: 'Diego González Presencio (P)',
    demarcacion: 'Portero',
    caracteristicas: 'Dorsal 13 | Portero'
  },
  {
    nombre: 'Marcos Riaño Puig',
    demarcacion: 'Portero',
    caracteristicas: 'Dorsal 25 | Portero'
  },
  {
    nombre: 'David Hernaiz García',
    demarcacion: 'Defensa Lateral',
    caracteristicas: 'Dorsal 3 | Defensa / Lateral'
  },
  {
    nombre: 'Ayman Mustapha Rajjouani Mansri',
    demarcacion: 'Defensa Central',
    caracteristicas: 'Dorsal 3 | Central'
  },
  {
    nombre: 'Ander Ibai Barck Pavón',
    demarcacion: 'Extremo',
    caracteristicas: 'Dorsal 4 | Centrocampista - Extremo zurdo'
  },
  {
    nombre: 'Javier Caño Vales',
    demarcacion: 'Defensa Central',
    caracteristicas: 'Dorsal 5 | Central'
  },
  {
    nombre: 'Álex Iker Alba Fernández Berridi',
    demarcacion: 'Mediocentro',
    caracteristicas: 'Dorsal 6 | Medio centro defensivo'
  },
  {
    nombre: 'Jesús Ares Maneiro',
    demarcacion: 'Extremo',
    caracteristicas: 'Dorsal 7 | Extremo zurdo por derecha'
  },
  {
    nombre: 'Diego González Presencio',
    demarcacion: 'Interior',
    caracteristicas: 'Dorsal 8 | Mediocentro / Interior'
  },
  {
    nombre: 'Irian Ribas Carrasco',
    demarcacion: 'Delantero',
    caracteristicas: 'Dorsal 9 | Delantero'
  },
  {
    nombre: 'Ethan Ventosa González',
    demarcacion: 'Delantero',
    caracteristicas: 'Dorsal 10 | Delantero'
  },
  {
    nombre: 'Sergio Romero Rubiño',
    demarcacion: 'Mediocentro',
    caracteristicas: 'Dorsal 14 | Centrocampista (Procedencia: CE Europa)'
  },
  {
    nombre: 'Iván Martínez Ruiz',
    demarcacion: 'Mediocentro',
    caracteristicas: 'Dorsal 15 | Centrocampista'
  },
  {
    nombre: 'Héctor Royo Méndez',
    demarcacion: 'Defensa Lateral',
    caracteristicas: 'Dorsal 16 | Lateral derecho / Central'
  },
  {
    nombre: 'Daniel Ruiz Mayo',
    demarcacion: 'Defensa Central',
    caracteristicas: 'Dorsal 4 | Defensa'
  },
  {
    nombre: 'Pablo Sagredo García',
    demarcacion: 'Delantero',
    caracteristicas: 'Dorsal 20 | Delantero'
  },
  {
    nombre: 'Hugo Sedano Oca',
    demarcacion: 'Mediocentro',
    caracteristicas: 'Dorsal 6 | Centrocampista'
  },
  {
    nombre: 'Javier Tejedor Gómez',
    demarcacion: 'Defensa Central',
    caracteristicas: 'Dorsal 21 | Central'
  },
  {
    nombre: 'Cristian Torrelavid Moreno',
    demarcacion: 'Mediocentro',
    caracteristicas: 'Dorsal 21 | Centrocampista'
  }
];

async function seedBurgosPlayers() {
  console.log('--- SEEDING BURGOS B PLAYERS ---');

  // 1. Find Burgos B team
  const { data: teams, error: tErr } = await supabase
    .from('equipos')
    .select('id, nombre')
    .ilike('nombre', '%Burgos%');

  if (tErr || !teams || teams.length === 0) {
    console.error('Burgos B team not found in DB:', tErr);
    return;
  }

  const burgosTeam = teams[0];
  console.log(`Found Team: ${burgosTeam.nombre} (${burgosTeam.id})`);

  // 2. Clear old players for this team to avoid duplicates
  const { error: delErr } = await supabase
    .from('jugadores_equipo')
    .delete()
    .eq('equipo_id', burgosTeam.id);

  if (delErr) {
    console.log('Note on deletion:', delErr.message);
  }

  // 3. Insert squad
  const rows = BURGOS_B_SQUAD.map(p => ({
    equipo_id: burgosTeam.id,
    nombre: p.nombre,
    demarcacion: p.demarcacion,
    caracteristicas: p.caracteristicas,
    foto_url: null
  }));

  const { data: inserted, error: insErr } = await supabase
    .from('jugadores_equipo')
    .insert(rows)
    .select();

  if (insErr) {
    console.error('Error inserting players:', insErr);
  } else {
    console.log(`✓ Inserted ${inserted?.length} players for ${burgosTeam.nombre}!`);
  }

  console.log('--- SEEDING COMPLETE ---');
}

seedBurgosPlayers();
