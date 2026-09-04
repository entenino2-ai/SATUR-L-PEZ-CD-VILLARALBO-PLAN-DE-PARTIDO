import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://slexyuklfyjufevzppsc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZXh5dWtsZnlqdWZldnpwcHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjY2MTEsImV4cCI6MjEwMDU0MjYxMX0.KKhQaGadI3dXNGm1PTGfyhPVt6-7UCFpwmuneYWY2QA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { error: e9 } = await supabase
    .from('jugadores')
    .update({ foto_url: '/players/dorsal_9_rubo.png' })
    .eq('dorsal', 9);
    
  if (e9) console.error('Error updating Rubo:', e9);
  else console.log('✓ Rubo (dorsal 9) updated with /players/dorsal_9_rubo.png');

  const { error: e25 } = await supabase
    .from('jugadores')
    .update({ foto_url: '/players/dorsal_25_kassim.png' })
    .eq('dorsal', 25);
    
  if (e25) console.error('Error updating Kassim:', e25);
  else console.log('✓ Kassim (dorsal 25) updated with /players/dorsal_25_kassim.png');
}

run();
