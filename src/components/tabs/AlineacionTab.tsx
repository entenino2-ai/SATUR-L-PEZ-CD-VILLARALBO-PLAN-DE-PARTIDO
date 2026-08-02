import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Save, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Partido, Jugador, DemarcacionType } from '../../lib/types';
import FootballField from './alineacion/FootballField';
import TacticalAIPanel from './alineacion/TacticalAIPanel';

interface AlineacionTabProps {
  partido: Partido;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const FORMACIONES = ['4-3-3', '4-4-2', '4-2-3-1', '5-3-2'];

const ORDEN_DEMARCACION: Record<DemarcacionType, number> = {
  'Portero': 1,
  'Defensa Lateral': 2,
  'Defensa Central': 3,
  'Mediocentro': 4,
  'Interior': 5,
  'Mediapunta': 6,
  'Extremo': 7,
  'Delantero': 8
};

export default function AlineacionTab({ partido, showToast }: AlineacionTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Tactical State
  const [formacionLocal, setFormacionLocal] = useState('4-3-3');
  const [formacionRival, setFormacionRival] = useState('4-3-3');
  const [mostrarRival, setMostrarRival] = useState(true);
  const [jugadoresAlineados, setJugadoresAlineados] = useState<Record<string, any>>({});
  const [analisisIa, setAnalisisIa] = useState<string | null>(null);

  // Players State
  const [plantilla, setPlantilla] = useState<Jugador[]>([]);
  
  // UI State
  const [showAIPanel, setShowAIPanel] = useState(false);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);
        // 1. Fetch Plantilla
        const { data: playersData, error: playersError } = await supabase
          .from('jugadores')
          .select('*')
          .order('dorsal', { ascending: true });
        
        if (playersError) throw playersError;
        setPlantilla(playersData || []);

        // 2. Fetch Alineacion
        const { data: alineacionData, error: alingError } = await supabase
          .from('alineaciones')
          .select('*')
          .eq('partido_id', partido.id)
          .maybeSingle();

        if (alingError) {
          // If error is code 42P01 (relation does not exist), table not created yet
          if (alingError.code === '42P01') {
             console.warn('Tabla alineaciones no existe. Ejecuta el script SQL.');
          } else {
             throw alingError;
          }
        }

        if (alineacionData) {
          setFormacionLocal(alineacionData.formacion_local);
          setFormacionRival(alineacionData.formacion_rival);
          setMostrarRival(alineacionData.mostrar_rival);
          setAnalisisIa(alineacionData.analisis_ia);
          
          // Hydrate players from JSON mapping { posId: playerId }
          const mapping = alineacionData.jugadores_11 || {};
          const hydrated: Record<string, any> = {};
          
          Object.keys(mapping).forEach(posId => {
            const pid = mapping[posId];
            const pObj = (playersData || []).find(p => p.id === pid);
            if (pObj) hydrated[posId] = pObj;
          });
          
          setJugadoresAlineados(hydrated);
        }

      } catch (err: any) {
        console.error(err);
        showToast('Error cargando datos: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDatos();
  }, [partido.id, showToast]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Serialize mapping to just IDs
      const mappingIds: Record<string, string> = {};
      Object.keys(jugadoresAlineados).forEach(k => {
        mappingIds[k] = jugadoresAlineados[k].id;
      });

      const { error } = await supabase
        .from('alineaciones')
        .upsert({
          partido_id: partido.id,
          formacion_local: formacionLocal,
          formacion_rival: formacionRival,
          mostrar_rival: mostrarRival,
          jugadores_11: mappingIds,
          analisis_ia: analisisIa
        }, { onConflict: 'partido_id' });

      if (error) {
         if (error.code === '42P01') {
             throw new Error('La tabla alineaciones no existe. Ejecuta el script SQL provisto.');
         }
         throw error;
      }
      
      showToast('Alineación guardada correctamente', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Error al guardar: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAI = async (content: string) => {
    setAnalisisIa(content);
    setShowAIPanel(false);
    showToast('Informe IA guardado temporalmente. Pulsa Guardar Alineación para consolidar.', 'success');
  };

  const onDragStart = (e: React.DragEvent, player: Jugador) => {
    e.dataTransfer.setData('playerId', player.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const onDropJugador = (posId: string, playerId: string) => {
    const player = plantilla.find(p => p.id === playerId);
    if (!player) return;

    setJugadoresAlineados(prev => {
      // Remove player if already on field somewhere else
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (next[k].id === playerId) delete next[k];
      });
      // Place in new position
      next[posId] = player;
      return next;
    });
  };

  const onRemoveJugador = (posId: string) => {
    setJugadoresAlineados(prev => {
      const next = { ...prev };
      delete next[posId];
      return next;
    });
  };

  const jugadoresDisponibles = useMemo(() => {
    const placedIds = Object.values(jugadoresAlineados).map(p => p.id);
    return plantilla
      .filter(p => !placedIds.includes(p.id))
      .sort((a, b) => ORDEN_DEMARCACION[a.demarcacion] - ORDEN_DEMARCACION[b.demarcacion]);
  }, [plantilla, jugadoresAlineados]);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary-purple" />
        <p className="text-xs font-bold text-muted-text">Cargando plantilla y alineación...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-300">
      
      {/* LEFT: Football Field & Controls */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-muted-text w-20">MI FORMACIÓN</span>
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                {FORMACIONES.map(f => (
                  <button
                    key={f}
                    onClick={() => setFormacionLocal(f)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      formacionLocal === f ? 'bg-primary-red text-white shadow-sm' : 'text-slate-500 hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px h-6 bg-border mx-1 hidden md:block"></div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-muted-text w-24">FORMACIÓN RIVAL</span>
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                {FORMACIONES.map(f => (
                  <button
                    key={f}
                    onClick={() => setFormacionRival(f)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      formacionRival === f ? 'bg-primary-blue text-white shadow-sm' : 'text-slate-500 hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMostrarRival(!mostrarRival)}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {mostrarRival ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {mostrarRival ? 'Ocultar Rival' : 'Mostrar Rival'}
            </button>
            <button
              onClick={() => setShowAIPanel(true)}
              className="flex items-center gap-1.5 rounded-lg bg-purple-100 px-3 py-1.5 text-xs font-extrabold text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Analizar IA
            </button>
          </div>

        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-2 text-[10px] font-bold">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary-red"></div> CD Villaralbo ({formacionLocal})</div>
          {mostrarRival && <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary-blue opacity-80"></div> Rival ({formacionRival})</div>}
        </div>

        {/* Field */}
        <FootballField
          formacionLocal={formacionLocal}
          formacionRival={formacionRival}
          mostrarRival={mostrarRival}
          jugadoresAlineados={jugadoresAlineados}
          onDropJugador={onDropJugador}
          onRemoveJugador={onRemoveJugador}
        />

      </div>

      {/* RIGHT: Players Sidebar */}
      <div className="w-full lg:w-72 flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
          <h3 className="text-sm font-black uppercase text-foreground">Jugadores</h3>
          <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-muted-text">
            {Object.keys(jugadoresAlineados).length} / 11
          </span>
        </div>

        <div className="flex-1 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-border text-xs font-semibold text-muted-text text-center">
            Arrastra jugadores al campo
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Group by Demarcacion */}
            {(Object.keys(ORDEN_DEMARCACION) as DemarcacionType[]).map(demarcacion => {
              const playersInGroup = jugadoresDisponibles.filter(p => p.demarcacion === demarcacion);
              if (playersInGroup.length === 0) return null;
              
              return (
                <div key={demarcacion} className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-muted-text border-b border-border/50 pb-1">
                    {demarcacion}
                  </h4>
                  <div className="space-y-1.5">
                    {playersInGroup.map(player => (
                      <div
                        key={player.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, player)}
                        className="flex items-center gap-2 p-2 rounded-lg border border-transparent hover:border-border hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-grab active:cursor-grabbing transition-all group"
                      >
                        {player.foto_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={player.foto_url} alt="" className="w-8 h-8 rounded-full object-cover border border-border shadow-sm group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="flex w-8 h-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-border text-[9px] font-black">
                            {player.nombre.split(' ').slice(0,2).map(w=>w[0]).join('')}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{player.nombre}</p>
                          <p className="text-[9px] text-muted-text">Forma: {player.forma}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-purple to-primary-red px-4 py-3 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer mt-auto"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar Alineación
        </button>
      </div>

      {/* AI Panel Modal */}
      {showAIPanel && (
        <TacticalAIPanel
          formacionLocal={formacionLocal}
          formacionRival={formacionRival}
          partidoId={partido.id}
          initialData={analisisIa}
          onSave={handleSaveAI}
          onClose={() => setShowAIPanel(false)}
        />
      )}

    </div>
  );
}
