export type DemarcacionType =
  | 'Portero'
  | 'Defensa Central'
  | 'Defensa Lateral'
  | 'Mediocentro'
  | 'Interior'
  | 'Extremo'
  | 'Mediapunta'
  | 'Delantero';

export interface Jugador {
  id: string;
  nombre: string;
  dorsal: number | null;
  demarcacion: DemarcacionType;
  fecha_nacimiento: string;
  foto_url: string | null;
  forma: number;
  creado_en: string;
  año?: number; // Calculado en la vista de Supabase como la edad
}

export interface JugadorEquipo {
  id: string;
  equipo_id: string;
  equipo_nombre?: string;
  nombre: string;
  demarcacion: DemarcacionType;
  caracteristicas: string | null;
  foto_url: string | null;
  creado_en: string;
}

export interface Equipo {
  id: string;
  nombre: string;
  escudo_url: string | null;
  creado_en: string;
}

export interface Partido {
  id: string;
  equipo_local_id: string;
  equipo_visitante_id: string;
  fecha: string;
  lugar: string | null;
  tipo: 'Liga' | 'Amistoso' | 'Copa';
  estado: 'Programado' | 'En juego' | 'Finalizado';
  creado_en: string;
  equipo_local?: Equipo;
  equipo_visitante?: Equipo;
}

export interface CaracteristicasRival {
  salida_balon?: string;
  presion?: string;
  bloque?: string;
  linea_defensiva?: string;
  transicion_ofensiva?: string;
  transicion_defensiva?: string;
}

export interface InformeRival {
  partido_id: string;
  slides_url: string;
  video_url: string;
  caracteristicas: CaracteristicasRival;
  creado_en?: string;
}

export interface PlanPartido {
  partido_id: string;
  ataque_texto: string;
  ataque_video: string;
  ataque_imgs: string[];
  
  defensa_texto: string;
  defensa_video: string;
  defensa_imgs: string[];
  
  transiciones_texto: string;
  transiciones_video: string;
  transiciones_imgs: string[];
  creado_en?: string;
}

export interface ABP {
  id?: string;
  partido_id: string;
  tipo: 'Ofensivo' | 'Defensivo';
  numero_corner: number; // 1-4
  imagen_url: string | null;
  detalle_texto: string | null;
  video_url: string | null;
  creado_en?: string;
}

export interface EventoPartido {
  id?: string;
  partido_id: string;
  tipo: 'Gol' | 'Ocasión' | 'Duelo' | 'Nota';
  minuto_video: number; // en segundos
  minuto_partido: number;
  descripcion: string;
  posicion_x: number; // 0-100
  posicion_y: number; // 0-100
  creado_en?: string;
}

export interface DibujoPizarra {
  id: string;
  tipo: 'arrow' | 'pass' | 'press' | 'cone' | 'zone' | 'freehand' | 'text';
  color: string;
  puntos: { x: number; y: number }[]; // 0-100 percentage coordinates
  texto?: string;
}

export interface AlineacionPartido {
  partido_id: string;
  formacion_local: string;
  formacion_rival: string;
  mostrar_rival: boolean;
  jugadores_11: Record<string, any>; // { "local-0": "jugador_id", "_customPositions": { ... }, "_dibujos": [...] }
  posiciones_custom?: Record<string, { x: number; y: number }>;
  dibujos?: DibujoPizarra[];
  analisis_ia: string | null;
  creado_en?: string;
}

export interface EstadisticaJugadorPartido {
  id?: string;
  partido_id: string;
  jugador_id: string;
  convocado: boolean;
  titular: boolean;
  minutos_jugados: number;
  goles: number;
  asistencias: number;
  tarjetas_amarillas: number;
  tarjetas_rojas: number;
  valoracion: number; // 1 to 10
  notas: string;
  jugador?: Jugador;
  creado_en?: string;
}

