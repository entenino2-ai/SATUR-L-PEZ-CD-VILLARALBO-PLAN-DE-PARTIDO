import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

async function fix() {
  const { data: burgos } = await supabase.from('equipos').select('id').eq('nombre', 'Burgos C.F. S.A.D. "B"').single();
  const { data: villaralbo } = await supabase.from('equipos').select('id').eq('nombre', 'CD CD Villaralbo').single();
  
  if(burgos && villaralbo) {
    // Verificar si ya existe
    const { data: exist } = await supabase.from('partidos')
        .select('*')
        .eq('equipo_local_id', burgos.id)
        .eq('equipo_visitante_id', villaralbo.id)
        .single();
        
    if(!exist) {
        await supabase.from('partidos').insert([{
        equipo_local_id: burgos.id,
        equipo_visitante_id: villaralbo.id,
        fecha: '2026-09-06T12:00:00Z',
        tipo: 'Liga',
        estado: 'Programado'
        }]);
        console.log('Match created');
    } else {
        console.log('Match already exists');
    }
  } else {
    console.log('Teams not found', !!burgos, !!villaralbo);
  }
}
fix();
