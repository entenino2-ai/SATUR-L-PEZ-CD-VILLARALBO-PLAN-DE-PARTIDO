import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  Calendar, 
  MapPin, 
  Shield, 
  Award, 
  Check, 
  FileText, 
  Sparkles, 
  Users, 
  Layers, 
  ChevronRight,
  Activity
} from 'lucide-react';
import { 
  Partido, 
  Jugador, 
  JugadorEquipo, 
  InformeRival, 
  PlanPartido, 
  ABP, 
  AlineacionPartido, 
  EstadisticaJugadorPartido 
} from '../lib/types';
import { supabase } from '../lib/supabase';

interface PartidoReportModalProps {
  partido: Partido;
  onClose: () => void;
}

export default function PartidoReportModal({ partido, onClose }: PartidoReportModalProps) {
  const [loading, setLoading] = useState(true);
  const [alineacion, setAlineacion] = useState<AlineacionPartido | null>(null);
  const [informeRival, setInformeRival] = useState<InformeRival | null>(null);
  const [planPartido, setPlanPartido] = useState<PlanPartido | null>(null);
  const [abpList, setAbpList] = useState<ABP[]>([]);
  const [statsList, setStatsList] = useState<EstadisticaJugadorPartido[]>([]);
  const [players, setPlayers] = useState<Jugador[]>([]);
  const [rivalPlayers, setRivalPlayers] = useState<JugadorEquipo[]>([]);

  const local = partido.equipo_local;
  const visitante = partido.equipo_visitante;
  const isVillaralboLocal = local?.nombre?.toLowerCase().includes('villaralbo') ?? true;
  const rival = isVillaralboLocal ? visitante : local;
  const rivalId = isVillaralboLocal ? partido.equipo_visitante_id : partido.equipo_local_id;

  useEffect(() => {
    const fetchAllMatchData = async () => {
      try {
        setLoading(true);

        const [
          playersRes,
          rivalPlayersRes,
          alineacionRes,
          informeRes,
          planRes,
          abpRes,
          statsRes
        ] = await Promise.all([
          supabase.from('jugadores').select('*').order('dorsal', { ascending: true }),
          supabase.from('jugadores_equipo').select('*').eq('equipo_id', rivalId),
          supabase.from('alineaciones').select('*').eq('partido_id', partido.id).maybeSingle(),
          supabase.from('informes_rival').select('*').eq('partido_id', partido.id).maybeSingle(),
          supabase.from('planes_partido').select('*').eq('partido_id', partido.id).maybeSingle(),
          supabase.from('abp').select('*').eq('partido_id', partido.id).order('numero_corner', { ascending: true }),
          supabase.from('estadisticas_partido_jugador').select('*').eq('partido_id', partido.id)
        ]);

        const allPlayers = (playersRes.data || []) as Jugador[];
        setPlayers(allPlayers);
        setRivalPlayers((rivalPlayersRes.data || []) as JugadorEquipo[]);
        
        if (alineacionRes.data) setAlineacion(alineacionRes.data as AlineacionPartido);
        if (informeRes.data) setInformeRival(informeRes.data as InformeRival);
        if (planRes.data) setPlanPartido(planRes.data as PlanPartido);
        if (abpRes.data) setAbpList(abpRes.data as ABP[]);
        
        if (statsRes.data && statsRes.data.length > 0) {
          setStatsList(statsRes.data as EstadisticaJugadorPartido[]);
        } else {
          // LocalStorage fallback
          try {
            const cached = localStorage.getItem(`stats_partido_${partido.id}`);
            if (cached) setStatsList(JSON.parse(cached));
          } catch (e) {
            console.warn(e);
          }
        }

      } catch (err) {
        console.error('Error fetching full dossier data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMatchData();
  }, [partido.id, rivalId]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Build starting 11 for CD Villaralbo
  const starting11 = React.useMemo(() => {
    if (!alineacion?.jugadores_11) return [];
    const starters: { role: string; player: Jugador | null }[] = [];
    
    Object.entries(alineacion.jugadores_11).forEach(([k, v]) => {
      if (k.startsWith('local-')) {
        const pid = typeof v === 'object' && v !== null ? v.playerId : v;
        const pObj = players.find(p => p.id === pid) || null;
        starters.push({ role: k, player: pObj });
      }
    });
    return starters;
  }, [alineacion, players]);

  // Substitutes
  const substitutes = React.useMemo(() => {
    const starterIds = new Set(starting11.map(s => s.player?.id).filter(Boolean));
    return players.filter(p => !starterIds.has(p.id));
  }, [starting11, players]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      
      {/* MODAL WRAPPER */}
      <div className="relative w-full max-w-5xl bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* TOP ACTION BAR (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-card border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground uppercase tracking-wide">
                Dossier Técnico Oficial de Partido
              </h2>
              <p className="text-[11px] font-semibold text-muted-text">
                Ficha completa de banquillo, análisis táctico y plan de juego
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black transition-all shadow-md cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir / Descargar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-text hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOSSIER BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 print:p-0 print:m-0 print:bg-white print:text-black">
          
          {/* ======================================================== */}
          {/* 1. OFFICIAL COVER HEADER */}
          {/* ======================================================== */}
          <div className="rounded-3xl border-2 border-slate-900 bg-gradient-to-br from-slate-900 via-slate-950 to-[#102a16] p-6 text-white shadow-xl relative overflow-hidden print:border-black print:text-black print:bg-none print:shadow-none">
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none print:hidden"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Club Badge & Match Details */}
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-xl border border-white/20">
                  {local?.escudo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={local.escudo_url} alt={local.nombre} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xl font-black text-slate-900">CDV</span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider print:text-black print:border-black">
                    PLAN DE PARTIDO OFICIAL • {partido.tipo}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase flex items-center gap-2">
                    <span>{local?.nombre}</span>
                    <span className="text-slate-400 font-bold text-sm lowercase">vs</span>
                    <span>{visitante?.nombre}</span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 print:text-black font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                      {formatDate(partido.fecha)}
                    </span>
                    {partido.lugar && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                        {partido.lugar}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Staff info & Rival Shield */}
              <div className="flex items-center gap-5 border-t md:border-t-0 md:border-l border-white/10 md:pl-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">DIRECTOR TÉCNICO</span>
                  <span className="text-base font-black text-white print:text-black">Satur López</span>
                  <span className="text-[10px] text-emerald-400 block font-semibold">Cuerpo Técnico CD Villaralbo</span>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-lg border border-white/20">
                  {visitante?.escudo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={visitante.escudo_url} alt={visitante.nombre} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-sm font-black text-slate-900">RIV</span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. ALINEACIÓN & SISTEMAS TÁCTICOS */}
          {/* ======================================================== */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/40 space-y-4 break-inside-avoid">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <Users className="h-4 w-4" />
                1. Alineación y Sistemas de Juego
              </h3>
              <div className="flex items-center gap-3 text-xs font-black">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white">
                  CD VILLARALBO: {alineacion?.formacion_local || '4-3-3'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white">
                  {rival?.nombre || 'RIVAL'}: {alineacion?.formacion_rival || '4-3-3'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ONCE TITULAR */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Once Inicial CD Villaralbo
                </h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {starting11.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-[10px]">
                          {item.player?.dorsal || idx + 1}
                        </span>
                        <span className="font-extrabold text-foreground">
                          {item.player?.nombre || 'Posición ' + (idx + 1)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {item.player?.demarcacion || 'Titular'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BANQUILLO & SUPLENTES */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Banquillo y Convocados
                </h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {substitutes.map((player) => (
                    <div 
                      key={player.id} 
                      className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 text-foreground font-black text-[10px]">
                          {player.dorsal || '-'}
                        </span>
                        <span className="font-bold text-foreground">
                          {player.nombre}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        {player.demarcacion}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Tactical AI / Trainer Insights */}
            {alineacion?.analisis_ia && (
              <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-foreground space-y-2">
                <h5 className="font-black text-purple-700 dark:text-purple-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Informe Táctico del Emparejamiento de Sistemas
                </h5>
                <div className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                  {alineacion.analisis_ia}
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 3. INFORME DEL RIVAL */}
          {/* ======================================================== */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/40 space-y-4 break-inside-avoid">
            <h3 className="text-sm font-black uppercase tracking-wider text-rose-600 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Shield className="h-4 w-4" />
              2. Análisis e Informe del Rival ({rival?.nombre})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Salida de Balón', value: informeRival?.caracteristicas?.salida_balon || 'No especificada' },
                { label: 'Tipo de Presión', value: informeRival?.caracteristicas?.presion || 'No especificada' },
                { label: 'Altura de Bloque', value: informeRival?.caracteristicas?.bloque || 'No especificado' },
                { label: 'Línea Defensiva', value: informeRival?.caracteristicas?.linea_defensiva || 'No especificada' },
                { label: 'Transición Ofensiva', value: informeRival?.caracteristicas?.transicion_ofensiva || 'No especificada' },
                { label: 'Transición Defensiva', value: informeRival?.caracteristicas?.transicion_defensiva || 'No especificada' },
              ].map((c, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">{c.label}</span>
                  <span className="text-xs font-bold text-foreground mt-0.5 block">{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. PLAN DE PARTIDO (3 BLOQUES TÁCTICOS) */}
          {/* ======================================================== */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/40 space-y-4 break-inside-avoid">
            <h3 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Layers className="h-4 w-4" />
              3. Plan de Partido de Satur López (Fases de Juego)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* ATAQUE */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Fase de Ataque
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                  {planPartido?.ataque_texto || 'Instrucciones de posesión, generación de ventajas, amplitud y profundidad.'}
                </p>
              </div>

              {/* DEFENSA */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  Fase de Defensa
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                  {planPartido?.defensa_texto || 'Estructura defensiva, repliegue, alturas de presión y protección de carriles centrales.'}
                </p>
              </div>

              {/* TRANSICIONES */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Transiciones
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                  {planPartido?.transiciones_texto || 'Comportamiento en robo para contragolpear y presión tras pérdida inmediata.'}
                </p>
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* 5. ACCIONES A BALÓN PARADO (ABP) */}
          {/* ======================================================== */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/40 space-y-4 break-inside-avoid">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Award className="h-4 w-4" />
              4. Estrategia a Balón Parado (ABP)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(num => {
                const of = abpList.find(a => a.tipo === 'Ofensivo' && a.numero_corner === num);
                const def = abpList.find(a => a.tipo === 'Defensivo' && a.numero_corner === num);
                return (
                  <div key={num} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                    <span className="text-[11px] font-black uppercase text-foreground block">
                      Córner #{num}
                    </span>
                    <div className="text-[11px] space-y-1">
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                        A favor: <span className="font-normal text-slate-600 dark:text-slate-300">{of?.detalle_texto || 'Rutina estándar'}</span>
                      </p>
                      <p className="text-rose-600 dark:text-rose-400 font-bold">
                        En contra: <span className="font-normal text-slate-600 dark:text-slate-300">{def?.detalle_texto || 'Marcaje zonal'}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 6. ACTA DE RENDIMIENTO Y MINUTAJE */}
          {/* ======================================================== */}
          {statsList.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/40 space-y-4 break-inside-avoid">
              <h3 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Activity className="h-4 w-4" />
                5. Registro de Minutaje y Rendimiento de Jugadores
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400">
                      <th className="py-2">Dorsal / Jugador</th>
                      <th className="py-2 text-center">Rol</th>
                      <th className="py-2 text-center">Minutos</th>
                      <th className="py-2 text-center">Goles</th>
                      <th className="py-2 text-center">Asist.</th>
                      <th className="py-2 text-center">Tarjetas</th>
                      <th className="py-2 text-center">Valoración</th>
                      <th className="py-2">Notas Técnicas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {statsList.filter(s => s.convocado).map(s => {
                      const pObj = players.find(p => p.id === s.jugador_id);
                      return (
                        <tr key={s.jugador_id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30">
                          <td className="py-2 font-black flex items-center gap-2">
                            <span className="w-5 text-slate-400">#{pObj?.dorsal || '-'}</span>
                            <span>{pObj?.nombre || 'Jugador'}</span>
                          </td>
                          <td className="py-2 text-center font-bold">
                            {s.titular ? (
                              <span className="text-emerald-600 dark:text-emerald-400">Titular</span>
                            ) : (
                              <span className="text-amber-500">Banquillo</span>
                            )}
                          </td>
                          <td className="py-2 text-center font-black">{s.minutos_jugados}'</td>
                          <td className="py-2 text-center">{s.goles > 0 ? `${s.goles} ⚽` : '-'}</td>
                          <td className="py-2 text-center">{s.asistencias > 0 ? `${s.asistencias} 👟` : '-'}</td>
                          <td className="py-2 text-center font-black">
                            {s.tarjetas_amarillas > 0 && <span className="text-yellow-500">🟨x{s.tarjetas_amarillas} </span>}
                            {s.tarjetas_rojas > 0 && <span className="text-rose-500">🟥</span>}
                            {!s.tarjetas_amarillas && !s.tarjetas_rojas && '-'}
                          </td>
                          <td className="py-2 text-center font-black text-primary">{s.valoracion}★</td>
                          <td className="py-2 text-slate-500 text-[11px] truncate max-w-xs">{s.notas || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FOOTER SIGNATURE & TIMESTAMP */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-semibold gap-3 print:text-black">
            <span>Documento generado por CD VILLARALBO PLAN DE PARTIDO (Satur López)</span>
            <span>Fecha de emisión: {new Date().toLocaleDateString('es-ES')}</span>
          </div>

        </div>

      </div>

    </div>
  );
}
