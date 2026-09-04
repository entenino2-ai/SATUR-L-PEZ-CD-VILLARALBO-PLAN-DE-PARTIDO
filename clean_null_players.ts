import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
  const { data } = await supabase.from('jugadores').select('id, nombre, dorsal');
  console.log('Total rows before clean:', data?.length);
  for (const row of data || []) {
    if (row.dorsal === null || row.dorsal === undefined) {
      const { error } = await supabase.from('jugadores').delete().eq('id', row.id);
      console.log(`Deleted null dorsal: ${row.nombre}, error:`, error);
    }
  }
  const { data: finalRows } = await supabase.from('jugadores').select('id, nombre, dorsal').order('dorsal', { ascending: true });
  console.log('Total official players remaining:', finalRows?.length);
  console.log(finalRows);
}

clean();
