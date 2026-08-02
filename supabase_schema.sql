-- ==========================================
-- SCRIPT DE BASE DE DATOS: CD VILLARALBO
-- ==========================================

-- Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM PARA DEMARCACIONES DE JUGADORES
CREATE TYPE demarcacion_enum AS ENUM (
  'Portero', 
  'Defensa Central', 
  'Defensa Lateral', 
  'Mediocentro', 
  'Interior', 
  'Extremo', 
  'Mediapunta', 
  'Delantero'
);

-- 2. TABLA: JUGADORES
CREATE TABLE IF NOT EXISTS jugadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  dorsal INTEGER,
  demarcacion demarcacion_enum NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  foto_url TEXT,
  forma INTEGER DEFAULT 100 CHECK (forma >= 0 AND forma <= 100),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. VISTA: VISTA_JUGADORES (Calcula "año/edad" dinámicamente)
-- En Postgres, no se puede usar una función mutable como `age()` en columnas calculadas generadas (STORED).
-- Por ende, la mejor práctica es usar una Vista que calcule la edad al vuelo (en años).
-- Se añade WITH (security_invoker = true) para que la vista respete las políticas RLS de la tabla jugadores.
CREATE OR REPLACE VIEW vista_jugadores 
WITH (security_invoker = true)
AS
SELECT 
  id,
  nombre,
  dorsal,
  demarcacion,
  fecha_nacimiento,
  -- age(current_date, fecha_nacimiento) calcula el intervalo completo, y date_part extrae los años (edad)
  date_part('year', age(current_date, fecha_nacimiento))::INTEGER AS año,
  foto_url,
  forma,
  creado_en
FROM jugadores;

-- 4. TABLA: EQUIPOS
CREATE TABLE IF NOT EXISTS equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL UNIQUE,
  escudo_url TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: PARTIDOS
CREATE TABLE IF NOT EXISTS partidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_local_id UUID REFERENCES equipos(id) ON DELETE CASCADE,
  equipo_visitante_id UUID REFERENCES equipos(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  lugar VARCHAR(255),
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Liga', 'Amistoso', 'Copa')),
  estado VARCHAR(50) DEFAULT 'Programado' NOT NULL CHECK (estado IN ('Programado', 'En juego', 'Finalizado')),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Validación para evitar que un equipo juegue contra sí mismo
  CONSTRAINT chk_equipos_distintos CHECK (equipo_local_id <> equipo_visitante_id)
);

-- 6. TABLA: INFORMES_RIVAL (Relación 1:1 con Partidos)
CREATE TABLE IF NOT EXISTS informes_rival (
  partido_id UUID PRIMARY KEY REFERENCES partidos(id) ON DELETE CASCADE,
  slides_url TEXT,
  video_url TEXT,
  -- caracteristicas contiene un JSONB estructurado, ejemplo:
  -- { "salida_balon": "...", "presion": "...", "bloque": "...", "linea_defensiva": "..." }
  caracteristicas JSONB DEFAULT '{}'::jsonb NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA: PLANES_PARTIDO (Relación 1:1 con Partidos)
CREATE TABLE IF NOT EXISTS planes_partido (
  partido_id UUID PRIMARY KEY REFERENCES partidos(id) ON DELETE CASCADE,
  ataque_texto TEXT,
  ataque_video TEXT,
  ataque_imgs TEXT[] DEFAULT '{}'::text[] NOT NULL,
  
  defensa_texto TEXT,
  defensa_video TEXT,
  defensa_imgs TEXT[] DEFAULT '{}'::text[] NOT NULL,
  
  transiciones_texto TEXT,
  transiciones_video TEXT,
  transiciones_imgs TEXT[] DEFAULT '{}'::text[] NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABLA: ABP (Acciones a Balón Parado - Múltiples por partido)
CREATE TABLE IF NOT EXISTS abp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id UUID REFERENCES partidos(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Ofensivo', 'Defensivo')),
  numero_corner INTEGER NOT NULL CHECK (numero_corner BETWEEN 1 AND 4),
  imagen_url TEXT,
  detalle_texto TEXT,
  video_url TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Restricción única opcional para evitar duplicados del mismo corner del mismo tipo en un partido
  CONSTRAINT uq_partido_tipo_corner UNIQUE (partido_id, tipo, numero_corner)
);

-- 9. TABLA: EVENTOS_PARTIDO (Línea de tiempo / Eventos interactivos en el campo)
CREATE TABLE IF NOT EXISTS eventos_partido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id UUID REFERENCES partidos(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Gol', 'Ocasión', 'Duelo', 'Nota')),
  minuto_video INTEGER, -- Guardado en segundos desde el inicio del video
  minuto_partido INTEGER NOT NULL,
  descripcion TEXT,
  posicion_x NUMERIC CHECK (posicion_x >= 0 AND posicion_x <= 100), -- Porcentaje de la coordenada X en el campo (0-100)
  posicion_y NUMERIC CHECK (posicion_y >= 0 AND posicion_y <= 100), -- Porcentaje de la coordenada Y en el campo (0-100)
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- CONFIGURACIÓN DE STORAGE BUCKETS (SUPABASE)
-- ==========================================

-- Asegurarse de que existan los registros correspondientes en storage.buckets para las imágenes.
-- En Supabase, los buckets se pueden crear insertando registros en storage.buckets
-- Los buckets requeridos son: 'FOTOS JUGADORES' y 'FOTOS ESCUDOS'.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('FOTOS JUGADORES', 'FOTOS JUGADORES', true, 5242880, '{"image/png", "image/jpeg", "image/webp", "image/gif"}'),
  ('FOTOS ESCUDOS', 'FOTOS ESCUDOS', true, 5242880, '{"image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"}')
ON CONFLICT (id) DO NOTHING;

-- Habilitar políticas de seguridad si no se han deshabilitado
-- Las políticas en storage.objects permiten lectura anónima/pública en estos buckets.
-- NOTA: Estas políticas se asumen para desarrollo en Supabase.

CREATE POLICY "Lectura pública de fotos de jugadores"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'FOTOS JUGADORES');

CREATE POLICY "Subida pública de fotos de jugadores"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'FOTOS JUGADORES');

CREATE POLICY "Lectura pública de fotos de escudos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'FOTOS ESCUDOS');

CREATE POLICY "Subida pública de fotos de escudos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'FOTOS ESCUDOS');

-- ==========================================
-- HABILITACIÓN DE SEGURIDAD RLS EN TABLAS
-- ==========================================

-- Habilitar RLS en cada tabla de la base de datos
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE informes_rival ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes_partido ENABLE ROW LEVEL SECURITY;
ALTER TABLE abp ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_partido ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir todas las operaciones CRUD (Lectura y Escritura) a los usuarios 
-- (tanto anónimos como autenticados) utilizando la Anon Key.
-- NOTA: En producción, se recomienda restringir los permisos de escritura a usuarios autenticados.

CREATE POLICY "Permitir todo a todos en jugadores" ON jugadores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos en equipos" ON equipos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos en partidos" ON partidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos en informes_rival" ON informes_rival FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos en planes_partido" ON planes_partido FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos en abp" ON abp FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a todos en eventos_partido" ON eventos_partido FOR ALL USING (true) WITH CHECK (true);
