import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const newPlayers = [
  "AMON, ANGE ROLAND YOHANE",
  "BLANCO MERINO, MIGUEL",
  "BLANCO RODRIGUEZ, RUBEN",
  "DIARRA TRAORE, MOUSSA",
  "ESTEBAN RUIZ, ANGEL",
  "GARCÍA ANTOLÍN, ISMAEL",
  "GARCIA SALINAS, ROMARIO",
  "GONZALEZ CEPEDA, DIEGO",
  "GOORE, THEODORE",
  "KONATE, VARANE IBRAHIM",
  "LUPIDIO, CRISTIAN TOMÁS",
  "MANERO, EMMANUEL TOMAS",
  "MUÑOZ PUELLES, RAÚL",
  "NAVARRO CARRASQUERO, ALEJANDRO",
  "ORTEGA PAREJO, JOSE MARIA",
  "PERALTA ARROYO, DANIEL",
  "SANABRIA BELLOSO, JORGE"
];

function titleCase(str: string) {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

async function run() {
  const migueId = 'edd89245-e6db-4928-8b15-019a17c13b20';

  // 1. Delete all except Miguel del Río
  const { error: delError } = await supabase
    .from('jugadores')
    .delete()
    .neq('id', migueId);

  if (delError) {
    console.error('Error deleting:', delError);
    return;
  }
  console.log('Deleted old players');

  // 2. Insert new players
  const toInsert = newPlayers.map(name => ({
    nombre: titleCase(name.replace(',', '')),
    dorsal: null,
    demarcacion: 'Mediocentro', // default
    fecha_nacimiento: '2000-01-01', // default
    foto_url: null,
    forma: 100
  }));

  const { error: insError } = await supabase
    .from('jugadores')
    .insert(toInsert);

  if (insError) {
    console.error('Error inserting:', insError);
  } else {
    console.log('Inserted new players successfully');
  }
}

run();
