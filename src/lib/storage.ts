import { supabase } from './supabase';

/**
 * Sube un archivo a un bucket de Supabase Storage y retorna la URL pública del archivo.
 * @param bucket Nombre del bucket ('FOTOS JUGADORES' o 'FOTOS ESCUDOS')
 * @param file Archivo a subir
 */
export async function uploadImage(bucket: 'FOTOS JUGADORES' | 'FOTOS ESCUDOS', file: File): Promise<string> {
  // Limpiar el nombre del archivo para evitar caracteres problemáticos
  const fileExt = file.name.split('.').pop();
  const cleanName = file.name
    .replace(`.${fileExt}`, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 30);
  const fileName = `${cleanName}_${Date.now()}.${fileExt}`;

  // Subir el archivo mediante la API pública de Supabase
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file to Supabase Storage:', error);
    throw new Error(`Error al subir la imagen: ${error.message}`);
  }

  // Obtener la URL pública del archivo
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Sube la foto de un jugador al bucket 'FOTOS JUGADORES'
 */
export async function uploadPlayerPhoto(file: File): Promise<string> {
  return uploadImage('FOTOS JUGADORES', file);
}

/**
 * Sube el escudo de un equipo al bucket 'FOTOS ESCUDOS'
 */
export async function uploadTeamShield(file: File): Promise<string> {
  return uploadImage('FOTOS ESCUDOS', file);
}
