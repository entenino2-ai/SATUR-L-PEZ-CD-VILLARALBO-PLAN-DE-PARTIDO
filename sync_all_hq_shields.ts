import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';

const supabase = createClient(supabaseUrl, supabaseKey);

const ALL_TEAMS_HQ = [
  // Official League Rivals & Core Teams
  { name: 'Arandina CF', file: 'arandina.png' },
  { name: 'Atlético Bembibre', file: 'bembibre.png' },
  { name: 'Atlético Mansillés', file: 'mansilles.png' },
  { name: 'Atlético Tordesillas', file: 'tordesillas.png' },
  { name: 'Burgos C.F. S.A.D. "B"', file: 'burgos_b.png' },
  { name: 'C.D. Almazán', file: 'almazan.png' },
  { name: 'C.D. Calasanz de Soria', file: 'calasanz_soria.png' },
  { name: 'C.D. Colegios Diocesanos', file: 'colegios_diocesanos.png' },
  { name: 'C.D. Guijuelo', file: 'guijuelo.png' },
  { name: 'C.D. La Virgen del Camino', file: 'la_virgen.png' },
  { name: 'C.D. Mirandés S.A.D. "B"', file: 'mirandes_b.png' },
  { name: 'C.D. Palencia Cristo Atlético', file: 'cristo_atletico.png' },
  { name: 'CD Villaralbo', file: 'villaralbo.png' },
  { name: 'Ciudad Rodrigo C.F.', file: 'ciudad_rodrigo.png' },
  { name: 'Júpiter Leonés', file: 'jupiter_leones.png' },
  { name: 'Palencia C.F. S.A.D.', file: 'palencia_cf.png' },
  { name: 'Real Ávila CF', file: 'real_avila.png' },
  { name: 'Salamanca C.F. UDS "B"', file: 'salamanca_base_uds.png' },
  { name: 'Salamanca UDS', file: 'salamanca_cf_uds.png' },
  { name: 'Turégano C.F.', file: 'turegano.png' },
  { name: 'U.D. Santa Marta de Tormes', file: 'santa_marta.png' },
  { name: 'Unionistas de Salamanca C.F. "B"', file: 'unionistas_b.png' },
  { name: 'Unionistas de Salamanca C.F. "juv.DH."', file: 'unionistas.png' },
  { name: 'Zamora CF', file: 'zamora_cf.png' },
  
  // Extended Clubs in Gallery
  { name: 'Atlético Astorga FC', file: 'astorga.png' },
  { name: 'C.D. Becerril', file: 'becerril.png' },
  { name: 'C.D. Bovedana', file: 'bovedana.png' },
  { name: 'C.D. Carbajosa de la Sagrada', file: 'carbajosa_sagrada.png' },
  { name: 'C.D. Cristo Rey Barrio Vidal', file: 'cristo_rey.png' },
  { name: 'C.D. Hergar Helmántica', file: 'hergar.png' },
  { name: 'C.D. Jai-Alai Bolívar', file: 'jai_alai.png' },
  { name: 'C.D. Munibar Pizarrales', file: 'pizarrales.png' },
  { name: 'C.D. Navega', file: 'navega.png' },
  { name: 'C.D. Numancia de Soria "B"', file: 'numancia_b.png' },
  { name: 'C.D. Villamayor', file: 'villamayor.png' },
  { name: 'C.D. Villares de la Reina', file: 'villares_reina.png' },
  { name: 'C.D.F. Helmántico', file: 'helmantico.png' },
  { name: 'C.D.F. Mojados', file: 'mojados.png' },
  { name: 'Cabrerizos C.F.', file: 'cabrerizos.png' },
  { name: 'CD Béjar Industrial', file: 'bejar_industrial.png' },
  { name: 'CD Covadonga', file: 'covadonga.png' },
  { name: 'La Cistérniga C.F.', file: 'cisterniga.png' },
  { name: 'Real Valladolid C.F.', file: 'real_valladolid.png' },
  { name: 'Ribert C.F.', file: 'ribert.png' },
  { name: 'S.D. Ponferradina', file: 'ponferradina.png' },
  { name: 'Sporting Carbajosa', file: 'sporting_carbajosa.png' },
  { name: 'U.D. Mirobrigense', file: 'mirobrigense.png' },
  { name: 'Veguellina C.F.', file: 'veguellina.png' },
  { name: 'Villarreal C.F.', file: 'villarreal.png' }
];

async function syncAllHQShields() {
  console.log('=== SYNCING ALL HIGH RESOLUTION SHIELDS ===');

  const { data: existingTeams, error: fetchErr } = await supabase.from('equipos').select('*');
  if (fetchErr) {
    console.error('Error fetching teams:', fetchErr);
    return;
  }

  for (const item of ALL_TEAMS_HQ) {
    const shieldUrl = `/shields/${item.file}`;
    
    // Match in DB
    const match = existingTeams?.find(t => {
      const cleanDB = t.nombre.toLowerCase().replace(/["'\.\s]/g, '');
      const cleanItem = item.name.toLowerCase().replace(/["'\.\s]/g, '');
      return cleanDB === cleanItem || cleanDB.includes(cleanItem) || cleanItem.includes(cleanDB);
    });

    if (match) {
      const { error: updateErr } = await supabase
        .from('equipos')
        .update({ escudo_url: shieldUrl })
        .eq('id', match.id);

      if (updateErr) {
        console.error(`Error updating ${match.nombre}:`, updateErr);
      } else {
        console.log(`✓ Updated shield: ${match.nombre} -> ${shieldUrl}`);
      }
    } else {
      // Insert as new team
      const { error: insErr } = await supabase
        .from('equipos')
        .insert({
          nombre: item.name,
          escudo_url: shieldUrl
        });

      if (insErr) {
        console.error(`Error inserting ${item.name}:`, insErr);
      } else {
        console.log(`+ Added new team: ${item.name} with shield -> ${shieldUrl}`);
      }
    }
  }

  console.log('=== SYNC ALL SHIELDS COMPLETE ===');
}

syncAllHQShields();
