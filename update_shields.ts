import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Utilizando los archivos originales en lugar de los thumbnails para evitar errores de Wikipedia
const teamLogos: Record<string, string> = {
  'Burgos C.F. S.A.D. "B"': 'https://upload.wikimedia.org/wikipedia/en/5/52/Burgos_CF_logo.svg',
  'Arandina C.F.': 'https://upload.wikimedia.org/wikipedia/en/6/6b/Arandina_CF.svg',
  'C.D. Guijuelo': 'https://upload.wikimedia.org/wikipedia/en/8/87/CD_Guijuelo_logo.svg',
  'C.D. Mirandés S.A.D. "B"': 'https://upload.wikimedia.org/wikipedia/en/0/03/CD_Mirand%C3%A9s_logo.svg',
  'Unionistas de Salamanca C.F. "B"': 'https://upload.wikimedia.org/wikipedia/en/3/3d/Unionistas_de_Salamanca_CF_logo.svg',
  'Salamanca C.F. UDS "B"': 'https://upload.wikimedia.org/wikipedia/en/f/f6/Salamanca_CF_UDS_logo.png',
  'Atlético Bembibre': 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Atl%C3%A9tico_Bembibre_escudo.png',
  'C.D. Palencia Cristo Atlético': 'https://upload.wikimedia.org/wikipedia/en/6/67/CD_Palencia_Cristo_Atl%C3%A9tico_logo.svg',
  'Júpiter Leonés': 'https://upload.wikimedia.org/wikipedia/en/3/36/Cultural_y_Deportiva_Leonesa_logo.svg',
  'U.D. Santa Marta de Tormes': 'https://upload.wikimedia.org/wikipedia/en/7/7b/UD_Santa_Marta_logo.png',
  'C.D. La Virgen del Camino': 'https://upload.wikimedia.org/wikipedia/en/a/ad/CD_La_Virgen_del_Camino.svg',
  'C.D. Colegios Diocesanos': 'https://upload.wikimedia.org/wikipedia/en/8/86/CD_Colegios_Diocesanos.png',
  'Palencia C.F. S.A.D.': 'https://upload.wikimedia.org/wikipedia/en/9/9f/Palencia_CF_logo.svg'
};

async function updateShields() {
  console.log("Iniciando actualización de escudos (Intento 2)...");
  
  for (const [nombre, url] of Object.entries(teamLogos)) {
    try {
      console.log(`\nProcesando ${nombre}...`);
      
      // Añadimos un User-Agent falso para que Wikipedia no nos bloquee
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        console.error(`Error al descargar imagen para ${nombre}: ${response.statusText} (${response.status})`);
        continue;
      }
      
      const buffer = await response.arrayBuffer();
      const contentType = url.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
      const extension = url.endsWith('.svg') ? 'svg' : 'png';
      
      const fileName = `${nombre.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${Date.now()}.${extension}`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('FOTOS ESCUDOS')
        .upload(fileName, buffer, {
          contentType,
          upsert: true
        });
        
      if (uploadError) {
        console.error(`Error subiendo al storage para ${nombre}:`, uploadError.message);
        continue;
      }
      
      const { data: publicUrlData } = supabase
        .storage
        .from('FOTOS ESCUDOS')
        .getPublicUrl(uploadData.path);
        
      const publicUrl = publicUrlData.publicUrl;
      
      const { error: updateError } = await supabase
        .from('equipos')
        .update({ escudo_url: publicUrl })
        .eq('nombre', nombre);
        
      if (updateError) {
        console.error(`Error actualizando DB para ${nombre}:`, updateError.message);
      } else {
        console.log(`¡Escudo actualizado exitosamente para ${nombre}! -> ${publicUrl}`);
      }
      
      // Pequeña pausa para no saturar
      await new Promise(r => setTimeout(r, 1000));
      
    } catch (error) {
      console.error(`Error inesperado con ${nombre}:`, error);
    }
  }
}

updateShields();
