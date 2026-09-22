import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, Save, Eye, EyeOff, Loader2, RotateCcw, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Partido, Jugador, JugadorEquipo, DemarcacionType } from '../../lib/types';
import FootballField from './alineacion/FootballField';
import TacticalAIPanel from './alineacion/TacticalAIPanel';

interface AlineacionTabProps {
  partido: Partido;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const FORMACIONES = ['4-3-3', '4-4-2', '4-2-3-1', '5-3-2', '3-5-2', '4-1-4-1', '3-4-3'];

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
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [analisisIa, setAnalisisIa] = useState<string | null>(null);

  // Players State
  const [plantilla, setPlantilla] = useState<Jugador[]>([]);
  const [plantillaRival, setPlantillaRival] = useState<JugadorEquipo[]>([]);
  
  // UI Selection State (Click-to-place support)
  const [selectedPlayerToPlace, setSelectedPlayerToPlace] = useState<any | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'local' | 'rival'>('local');

  // Determine which team is the rival
  const isVillaralboLocal = partido.equipo_local?.nombre?.toLowerCase().includes('villaralbo') ?? true;
  const rivalId = isVillaralboLocal ? partido.equipo_visitante_id : partido.equipo_local_id;
  const rivalName = isVillaralboLocal 
    ? (partido.equipo_visitante?.nombre || 'Rival')
    : (partido.equipo_local?.nombre || 'Rival');

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);
        // 1. Fetch Plantillas
        const [playersRes, rivalPlayersRes] = await Promise.all([
          supabase.from('jugadores').select('*').order('dorsal', { ascending: true }),
          supabase.from('jugadores_equipo').select('*').eq('equipo_id', rivalId)
        ]);
        
        if (playersRes.error && playersRes.error.code !== '42P01') throw playersRes.error;
        if (rivalPlayersRes.error && rivalPlayersRes.error.code !== '42P01') throw rivalPlayersRes.error;
        
        const playersData = playersRes.data || [];
        const rivalPlayersData = rivalPlayersRes.data || [];
        
        setPlantilla(playersData);
        setPlantillaRival(rivalPlayersData);

        // 2. Fetch Alineacion
        const { data: alineacionData, error: alingError } = await supabase
          .from('alineaciones')
          .select('*')
          .eq('partido_id', partido.id)
          .maybeSingle();

        if (alingError) {
          if (alingError.code === '42P01') {
             console.warn('Tabla alineaciones no existe.');
          } else {
             throw alingError;
          }
        }

        if (alineacionData) {
          setFormacionLocal(alineacionData.formacion_local || '4-3-3');
          setFormacionRival(alineacionData.formacion_rival || '4-3-3');
          setMostrarRival(alineacionData.mostrar_rival ?? true);
          setAnalisisIa(alineacionData.analisis_ia);
          
          // Hydrate players from JSON mapping { posId: playerId }
          const mapping = alineacionData.jugadores_11 || {};
          
          if (alineacionData.posiciones_custom && typeof alineacionData.posiciones_custom === 'object') {
            setCustomPositions(alineacionData.posiciones_custom);
          } else if (mapping._customPositions && typeof mapping._customPositions === 'object') {
            setCustomPositions(mapping._customPositions);
          }
          
          const hydrated: Record<string, any> = {};
          
          Object.keys(mapping).forEach(posId => {
            if (posId === '_customPositions') return;
            const item = mapping[posId];
            const pid = typeof item === 'object' && item !== null ? item.playerId : item;
            let pObj: any = playersData.find(p => p.id === pid);
            if (!pObj) {
              pObj = rivalPlayersData.find(p => p.id === pid);
            }
            if (pObj) hydrated[posId] = pObj;
          });
          
          setJugadoresAlineados(hydrated);
        }

      } catch (err: any) {
        console.warn('Error en fetchDatos:', err);
        const errorMsg = err?.message || err?.toString() || 'Error desconocido';
        showToast('Error cargando datos: ' + errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDatos();
  }, [partido.id, rivalId, showToast]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Serialize mapping to just IDs + embed _customPositions for guaranteed persistence
      const mappingIds: Record<string, any> = {};
      Object.keys(jugadoresAlineados).forEach(k => {
        if (k !== '_customPositions') {
          mappingIds[k] = jugadoresAlineados[k].id;
        }
      });
      
      if (customPositions && Object.keys(customPositions).length > 0) {
        mappingIds._customPositions = customPositions;
      }

      const payload: any = {
        partido_id: partido.id,
        formacion_local: formacionLocal,
        formacion_rival: formacionRival,
        mostrar_rival: mostrarRival,
        jugadores_11: mappingIds,
        analisis_ia: analisisIa
      };

      if (customPositions && Object.keys(customPositions).length > 0) {
        payload.posiciones_custom = customPositions;
      }

      const { error } = await supabase
        .from('alineaciones')
        .upsert(payload, { onConflict: 'partido_id' });

      if (error) {
        // Fallback without posiciones_custom if column is not yet present
        if (error.message?.includes('posiciones_custom') || error.code === '42703') {
          delete payload.posiciones_custom;
          const { error: retryErr } = await supabase
            .from('alineaciones')
            .upsert(payload, { onConflict: 'partido_id' });
          if (retryErr) throw retryErr;
        } else {
          throw error;
        }
      }
      
      showToast('Alineación y posiciones grabadas correctamente en la base de datos', 'success');
    } catch (err: any) {
      console.warn('Error al guardar:', err);
      const errorMsg = err?.message || err?.toString() || 'Error desconocido';
      showToast('Error al guardar: ' + errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveNode = useCallback((nodeId: string, x: number, y: number) => {
    setCustomPositions(prev => ({
      ...prev,
      [nodeId]: { x, y }
    }));
  }, []);

  const handleResetPositions = () => {
    setCustomPositions({});
    showToast('Posiciones tácticas restablecidas a la formación por defecto. Pulsa Guardar para grabar el reajuste.', 'success');
  };

  const handleSaveAI = async (content: string) => {
    setAnalisisIa(content);
    setShowAIPanel(false);
    showToast('Informe IA guardado temporalmente. Pulsa Guardar Alineación para consolidar.', 'success');
  };

  const onDragStart = (e: React.DragEvent, player: Jugador | JugadorEquipo) => {
    e.dataTransfer.setData('playerId', player.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const onDropJugador = (posId: string, playerId: string) => {
    let player: any = plantilla.find(p => p.id === playerId);
    if (!player) {
      player = plantillaRival.find(p => p.id === playerId);
    }
    if (!player) return;

    setJugadoresAlineados(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (next[k].id === playerId) delete next[k];
      });
      next[posId] = player;
      return next;
    });

    // Clear placement selection
    setSelectedPlayerToPlace(null);
    setSelectedNodeId(null);
  };

  const onRemoveJugador = (posId: string) => {
    setJugadoresAlineados(prev => {
      const next = { ...prev };
      delete next[posId];
      return next;
    });
  };

  const handleSidebarPlayerClick = (player: any) => {
    // If a node is already selected on the pitch, assign this player to it immediately
    if (selectedNodeId) {
      onDropJugador(selectedNodeId, player.id);
      setSelectedNodeId(null);
      setSelectedPlayerToPlace(null);
      showToast(`Jugador ${player.nombre} colocado en la posición`, 'success');
      return;
    }

    // Toggle player selection for click-to-place
    if (selectedPlayerToPlace?.id === player.id) {
      setSelectedPlayerToPlace(null);
    } else {
      setSelectedPlayerToPlace(player);
    }
  };

  const { disponiblesLocal, disponiblesRival } = useMemo(() => {
    const placedIds = Object.values(jugadoresAlineados).map(p => p.id);
    const filterAndSort = (arr: any[]) => arr
      .filter(p => !placedIds.includes(p.id))
      .sort((a, b) => ((ORDEN_DEMARCACION as Record<string, number>)[a.demarcacion] || 99) - ((ORDEN_DEMARCACION as Record<string, number>)[b.demarcacion] || 99));
      
    return {
      disponiblesLocal: filterAndSort(plantilla),
      disponiblesRival: filterAndSort(plantillaRival)
    };
  }, [plantilla, plantillaRival, jugadoresAlineados]);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold text-muted-text">Cargando plantilla y alineación...</p>
      </div>
    );
  }

  const hasCustomPositions = Object.keys(customPositions).length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-300">
      
      {/* LEFT: Football Field & Controls */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-muted-text w-20">MI FORMACIÓN</span>
              <div className="flex bg-slate-200/80 dark:bg-slate-900 rounded-xl p-1 border border-border">
                {FORMACIONES.map(f => (
                  <button
                    key={f}
                    onClick={() => {
                      setFormacionLocal(f);
                    }}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      formacionLocal === f ? 'bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-foreground'
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
              <div className="flex bg-slate-200/80 dark:bg-slate-900 rounded-xl p-1 border border-border">
                {FORMACIONES.map(f => (
                  <button
                    key={f}
                    onClick={() => {
                      setFormacionRival(f);
                    }}
                    className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      formacionRival === f ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasCustomPositions && (
              <button
                onClick={handleResetPositions}
                title="Restablecer posiciones al dibujo táctico estándar"
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-2 text-xs font-black transition-colors shadow-sm cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reajustar</span>
              </button>
            )}
            <button
              onClick={() => setMostrarRival(!mostrarRival)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-black text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              {mostrarRival ? <EyeOff className="h-3.5 w-3.5 text-rose-500" /> : <Eye className="h-3.5 w-3.5 text-primary" />}
              {mostrarRival ? 'Ocultar Rival' : 'Mostrar Rival'}
            </button>
            <button
              onClick={() => setShowAIPanel(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-black text-white hover:bg-purple-700 shadow-sm transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-200" />
              <span>Analizar IA</span>
            </button>
          </div>

        </div>

        {/* Dynamic Interactive Hint Banner */}
        {selectedPlayerToPlace ? (
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-black animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Colocando a: <strong>{selectedPlayerToPlace.nombre}</strong> — Haz clic en cualquier posición del campo para ubicarlo</span>
            </div>
            <button 
              onClick={() => setSelectedPlayerToPlace(null)} 
              className="p-1 hover:bg-emerald-500/20 rounded-lg text-xs"
              title="Cancelar selección"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : selectedNodeId ? (
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-black">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Posición seleccionada en el campo — Haz clic en cualquier jugador de la plantilla para asignarlo</span>
            </div>
            <button 
              onClick={() => setSelectedNodeId(null)} 
              className="p-1 hover:bg-amber-500/20 rounded-lg text-xs"
              title="Cancelar selección"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-[10px] font-black">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-foreground">
                <div className="w-3 h-3 rounded-full bg-emerald-600 shadow-sm"></div> 
                CD Villaralbo ({formacionLocal})
              </div>
              {mostrarRival && (
                <div className="flex items-center gap-1.5 text-foreground">
                  <div className="w-3 h-3 rounded-full bg-rose-600 shadow-sm"></div> 
                  {rivalName} ({formacionRival})
                </div>
              )}
            </div>
            <div className="text-[10px] font-bold text-muted-text flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>Arrastra con el ratón o pulsa para mover y ajustar jugadores libremente</span>
            </div>
          </div>
        )}

        {/* Interactive Field with Manual Free Dragging & Click-to-Place */}
        <FootballField
          formacionLocal={formacionLocal}
          formacionRival={formacionRival}
          mostrarRival={mostrarRival}
          jugadoresAlineados={jugadoresAlineados}
          customPositions={customPositions}
          onMoveNode={handleMoveNode}
          onDropJugador={onDropJugador}
          onRemoveJugador={onRemoveJugador}
          rivalName={rivalName}
          selectedPlayerToPlace={selectedPlayerToPlace}
          selectedNodeId={selectedNodeId}
          onSelectNode={(nodeId) => {
            setSelectedNodeId(nodeId);
            if (nodeId && selectedPlayerToPlace) {
              onDropJugador(nodeId, selectedPlayerToPlace.id);
            }
          }}
        />

      </div>

      {/* RIGHT: Players Sidebar */}
      <div className="w-full lg:w-72 flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-card p-2 shadow-sm flex items-center justify-between">
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 w-full relative">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-800 rounded-md shadow-sm transition-transform duration-300 ${
                activeSidebarTab === 'rival' ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'
              }`}
            ></div>
            <button
              onClick={() => {
                setActiveSidebarTab('local');
                setSelectedPlayerToPlace(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-colors relative z-10 ${
                activeSidebarTab === 'local' ? 'text-foreground' : 'text-slate-500 hover:text-foreground'
              }`}
            >
              CD Villaralbo
            </button>
            <button
              onClick={() => {
                setActiveSidebarTab('rival');
                setSelectedPlayerToPlace(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-colors relative z-10 truncate px-2 ${
                activeSidebarTab === 'rival' ? 'text-foreground' : 'text-slate-500 hover:text-foreground'
              }`}
              title={rivalName}
            >
              {rivalName}
            </button>
          </div>
        </div>

        <div className="flex-1 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-border text-xs font-semibold text-muted-text text-center flex justify-between items-center">
            <span>Arrastra o pulsa un jugador</span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-md text-foreground">
              {Object.keys(jugadoresAlineados).length} / 22
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[600px]">
            {/* Group by Demarcacion */}
            {(Object.keys(ORDEN_DEMARCACION) as DemarcacionType[]).map(demarcacion => {
              const listToUse = activeSidebarTab === 'local' ? disponiblesLocal : disponiblesRival;
              const playersInGroup = listToUse.filter((p: any) => p.demarcacion === demarcacion);
              if (playersInGroup.length === 0) return null;
              
              return (
                <div key={demarcacion} className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-muted-text border-b border-border/50 pb-1">
                    {demarcacion}
                  </h4>
                  <div className="space-y-1.5">
                    {playersInGroup.map(player => {
                      const isSelected = selectedPlayerToPlace?.id === player.id;
                      return (
                        <div
                          key={player.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, player)}
                          onClick={() => handleSidebarPlayerClick(player)}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer group ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40 shadow-sm' 
                              : 'border-transparent hover:border-border hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          {player.foto_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={player.foto_url} 
                              alt="" 
                              draggable={false}
                              onDragStart={(e) => e.preventDefault()}
                              className="w-8 h-8 rounded-full object-cover border border-border shadow-sm group-hover:scale-105 transition-transform select-none pointer-events-none" 
                            />
                          ) : (
                            <div className="flex w-8 h-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-border text-[9px] font-black">
                              {player.nombre.split(' ').slice(0,2).map((w: string)=>w[0]).join('')}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                              <span>{player.nombre}</span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                            </p>
                            {'forma' in player && (
                              <p className="text-[9px] text-muted-text">Forma: {player.forma}%</p>
                            )}
                            {'caracteristicas' in player && player.caracteristicas && (
                              <p className="text-[9px] text-muted-text truncate">{player.caracteristicas}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-blue px-4 py-3 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer mt-auto"
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
