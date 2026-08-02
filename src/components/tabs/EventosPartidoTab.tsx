'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Plus, Trash2, Download, FileText, Filter, List, Map, BarChart3, Loader2, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Partido, EventoPartido } from '../../lib/types';

interface EventosPartidoTabProps {
  partido: Partido;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export default function EventosPartidoTab({ partido, showToast }: EventosPartidoTabProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [activeVideoId, setActiveVideoId] = useState('');
  const [events, setEvents] = useState<EventoPartido[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'lista' | 'campo' | 'graficas'>('lista');
  const [filterType, setFilterType] = useState<string>('Todos');

  // Form states for creating/editing an event
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<'Gol' | 'Ocasión' | 'Duelo' | 'Nota'>('Nota');
  const [videoTimeSeconds, setVideoTimeSeconds] = useState(0);
  const [partidoMinuto, setPartidoMinuto] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [savingEvent, setSavingEvent] = useState(false);

  // YouTube Player Ref
  const playerRef = useRef<any>(null);
  const containerId = 'yt-player-container';

  // Load Youtube Iframe API
  useEffect(() => {
    // Only load if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Fetch events for this match
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('eventos_partido')
        .select('*')
        .eq('partido_id', partido.id)
        .order('minuto_video', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      showToast('Error al cargar eventos: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [partido.id, showToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Extract YouTube ID
  const getYouTubeId = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get('v') || '';
      }
      if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1]?.split('?')[0] || '';
      }
    } catch (e) {
      console.error('Error parsing YouTube URL:', e);
    }
    return '';
  };

  const handleLoadVideo = () => {
    const id = getYouTubeId(videoUrl);
    if (!id) {
      showToast('Introduce una URL de YouTube válida para cargar el vídeo', 'error');
      return;
    }
    setActiveVideoId(id);
    showToast('Vídeo cargado correctamente', 'success');
  };

  // Instantiate YouTube Player when activeVideoId changes
  useEffect(() => {
    if (!activeVideoId || !window.YT) return;

    // Destructor previous player if exists
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.error(e);
      }
    }

    const initPlayer = () => {
      playerRef.current = new window.YT.Player(containerId, {
        height: '100%',
        width: '100%',
        videoId: activeVideoId,
        playerVars: {
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady: () => {
            console.log('YouTube Player is ready');
          }
        }
      });
    };

    if (window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }
  }, [activeVideoId]);

  // Capture current video time and trigger form
  const handleTriggerEvent = (type: 'Gol' | 'Ocasión' | 'Duelo' | 'Nota') => {
    let currentSeconds = 0;
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      currentSeconds = Math.floor(playerRef.current.getCurrentTime());
    }
    
    setSelectedEventType(type);
    setVideoTimeSeconds(currentSeconds);
    // Rough estimate for partido minute (e.g. seconds / 60)
    setPartidoMinuto(Math.min(90, Math.floor(currentSeconds / 60)));
    setDescripcion('');
    setPosX(50);
    setPosY(50);
    setShowEventForm(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingEvent(true);
      const { error } = await supabase
        .from('eventos_partido')
        .insert([
          {
            partido_id: partido.id,
            tipo: selectedEventType,
            minuto_video: videoTimeSeconds,
            minuto_partido: partidoMinuto,
            descripcion,
            posicion_x: posX,
            posicion_y: posY
          }
        ]);

      if (error) throw error;
      showToast('Evento registrado correctamente', 'success');
      setShowEventForm(false);
      fetchEvents();
    } catch (err: any) {
      console.error('Error saving event:', err);
      showToast('Error al guardar el evento: ' + err.message, 'error');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const confirmDelete = window.confirm('¿Deseas eliminar este evento del historial?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('eventos_partido').delete().eq('id', id);
      if (error) throw error;
      showToast('Evento eliminado', 'success');
      fetchEvents();
    } catch (err: any) {
      console.error('Error deleting event:', err);
      showToast('Error al eliminar: ' + err.message, 'error');
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Filter events based on active badge
  const filteredEvents = events.filter((ev) => {
    if (filterType === 'Todos') return true;
    return ev.tipo === filterType;
  });

  // Calculate event distribution for graphics tab
  const getStats = () => {
    const counts = { Gol: 0, Ocasión: 0, Duelo: 0, Nota: 0 };
    events.forEach(e => {
      if (counts[e.tipo] !== undefined) {
        counts[e.tipo]++;
      }
    });
    return counts;
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (events.length === 0) {
      showToast('No hay eventos registrados para exportar', 'error');
      return;
    }
    const headers = ['ID', 'Tipo', 'Minuto Video', 'Minuto Partido', 'Descripción', 'Posición X', 'Posición Y', 'Creado En'];
    const rows = events.map(e => [
      e.id,
      e.tipo,
      formatTime(e.minuto_video),
      `${e.minuto_partido}'`,
      `"${e.descripcion.replace(/"/g, '""')}"`,
      e.posicion_x,
      e.posicion_y,
      e.creado_en
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `eventos_partido_${partido.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV exportado con éxito', 'success');
  };

  // Download JSON
  const handleDownloadJSON = () => {
    if (events.length === 0) {
      showToast('No hay eventos registrados para descargar', 'error');
      return;
    }
    const jsonContent = JSON.stringify(events, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `eventos_partido_${partido.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('JSON descargado con éxito', 'success');
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'Gol': return 'bg-rose-500 text-white';
      case 'Ocasión': return 'bg-orange-500 text-white';
      case 'Duelo': return 'bg-amber-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      
      {/* Control Panel: Left (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Load Match Video card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-text block">URL DEL PARTIDO</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Pega la URL de YouTube..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold outline-none focus:border-primary-purple transition-all"
              />
              <button
                onClick={handleLoadVideo}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-purple text-white hover:bg-primary-purple/90 transition-colors"
                title="Cargar Video"
              >
                <Play className="h-4.5 w-4.5 fill-white" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs font-extrabold border-t border-border/60 pt-3">
            <span className="text-muted-text uppercase text-[9px]">TIEMPOS DE PARTIDO</span>
            <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] uppercase border border-border">Mostrar</span>
          </div>
        </div>

        {/* Quick Event Registry */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <span className="text-[10px] font-black uppercase text-muted-text block leading-none">REGISTRAR EVENTO</span>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleTriggerEvent('Gol')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs py-3.5 shadow transition-all duration-200 cursor-pointer"
            >
              🔴 GOL
            </button>
            
            <button
              onClick={() => handleTriggerEvent('Ocasión')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-extrabold text-xs py-3.5 shadow transition-all duration-200 cursor-pointer"
            >
              🟠 OCASIÓN
            </button>
            
            <button
              onClick={() => handleTriggerEvent('Duelo')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-xs py-3.5 shadow transition-all duration-200 cursor-pointer"
            >
              🟡 DUELO
            </button>
            
            <button
              onClick={() => handleTriggerEvent('Nota')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-extrabold text-xs py-3.5 shadow transition-all duration-200 cursor-pointer"
            >
              🔘 NOTA
            </button>
          </div>

          <div className="text-center pt-2 border-t border-border/60 text-[11px] font-black text-slate-500">
            • Tiempo video: <span className="text-foreground">{formatTime(videoTimeSeconds)}</span> - Partido: <span className="text-foreground">{partidoMinuto}&apos;</span>
          </div>
        </div>

        {/* Event Edit Form Modal Overlay inside this panel */}
        {showEventForm && (
          <form onSubmit={handleSaveEvent} className="rounded-2xl border border-primary-purple/35 bg-primary-purple/5 p-5 shadow-sm space-y-4 animate-in slide-in-from-top-3">
            <div className="flex justify-between items-center border-b border-border/60 pb-2">
              <span className="text-xs font-black uppercase text-primary-purple">Detalles de {selectedEventType.toUpperCase()}</span>
              <button type="button" onClick={() => setShowEventForm(false)} className="text-xs font-bold text-muted-text hover:text-foreground">Cerrar</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-muted-text uppercase block">Min. Video</label>
                <input
                  type="text"
                  value={formatTime(videoTimeSeconds)}
                  disabled
                  className="w-full rounded-xl border border-border bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-muted-text uppercase block">Min. Partido (0-90)*</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={partidoMinuto}
                  onChange={(e) => setPartidoMinuto(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:border-primary-purple"
                  required
                />
              </div>
            </div>

            {/* Position coordinate inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-muted-text uppercase block">Posición X (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:border-primary-purple"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-muted-text uppercase block">Posición Y (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:border-primary-purple"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-muted-text uppercase block">Descripción del Evento *</label>
              <textarea
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej. Gol de Chechi Blanco tras centro..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:border-primary-purple resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingEvent}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary-purple text-white font-extrabold text-xs py-2.5 shadow hover:bg-primary-purple/95 transition-all"
            >
              {savingEvent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span>Registrar Evento</span>
            </button>
          </form>
        )}
      </div>

      {/* Video Player & Historial: Right (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Responsive Video Iframe Player */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm aspect-video flex items-center justify-center">
          {activeVideoId ? (
            <div id={containerId} className="w-full h-full" />
          ) : (
            <div className="text-center p-8 max-w-sm space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border text-slate-400 mx-auto">
                <Video className="h-8 w-8" />
              </div>
              <h4 className="text-xs font-black uppercase text-foreground">Reproductor del Partido</h4>
              <p className="text-[11px] font-semibold text-muted-text leading-relaxed">
                Introduce la URL de YouTube en el panel izquierdo para cargar y reproducir el vídeo.
              </p>
            </div>
          )}
        </div>

        {/* Historial Section */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          
          {/* Sub tabs + Export buttons row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
            
            {/* Sub Tabs navigation */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-muted-text mr-2">Historial</span>
              
              <button
                onClick={() => setActiveSubTab('lista')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeSubTab === 'lista'
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>Lista</span>
              </button>

              <button
                onClick={() => setActiveSubTab('campo')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeSubTab === 'campo'
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                <Map className="h-3.5 w-3.5" />
                <span>Campo</span>
              </button>

              <button
                onClick={() => setActiveSubTab('graficas')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeSubTab === 'graficas'
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-muted-text hover:text-foreground'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Gráficas</span>
              </button>
            </div>

            {/* Export options */}
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-[11px] font-black text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Exportar CSV</span>
              </button>
              <button
                onClick={handleDownloadJSON}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-[11px] font-black text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Descargar JSON</span>
              </button>
            </div>
          </div>

          {/* LIST SUB-TAB CONTENT */}
          {activeSubTab === 'lista' && (
            <div className="space-y-4">
              
              {/* Type Filter row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black text-muted-text mr-1.5">FILTRAR:</span>
                {['Todos', 'Gol', 'Ocasión', 'Duelo', 'Nota'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      filterType === type
                        ? 'bg-primary-purple text-white'
                        : 'border border-border text-muted-text hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-purple" />
                </div>
              ) : filteredEvents.length === 0 ? (
                <p className="text-center text-xs font-semibold text-muted-text py-12">No hay eventos registrados que coincidan.</p>
              ) : (
                /* Table list */
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-border text-[10px] uppercase text-muted-text">
                        <th className="py-2.5">Tipo</th>
                        <th className="py-2.5">Video</th>
                        <th className="py-2.5">Partido</th>
                        <th className="py-2.5">Descripción</th>
                        <th className="py-2.5 text-center">X,Y</th>
                        <th className="py-2.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredEvents.map((ev) => (
                        <tr key={ev.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="py-3">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${getEventBadgeColor(ev.tipo)}`}>
                              {ev.tipo}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-primary-purple">{formatTime(ev.minuto_video)}</td>
                          <td className="py-3 font-mono">{ev.minuto_partido}&apos;</td>
                          <td className="py-3 max-w-xs truncate text-foreground" title={ev.descripcion}>{ev.descripcion}</td>
                          <td className="py-3 text-center text-muted-text font-mono">{Math.round(ev.posicion_x)},{Math.round(ev.posicion_y)}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => ev.id && handleDeleteEvent(ev.id)}
                              className="rounded p-1 text-slate-400 hover:text-rose-600"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* CAMPO SUB-TAB CONTENT (Interactive coordinate board) */}
          {activeSubTab === 'campo' && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-text leading-relaxed">
                Visualización de eventos según sus coordenadas en el campo. Haz clic en el campo para cambiar el filtro.
              </p>
              
              {/* Football Field Visual representation */}
              <div className="relative border border-slate-700 bg-emerald-800 rounded-2xl w-full aspect-[5/3] overflow-hidden shadow-inner flex items-center justify-center select-none">
                
                {/* Field markings lines */}
                <div className="absolute inset-4 border border-white/40" />
                <div className="absolute inset-y-4 left-1/2 w-0.5 bg-white/40" />
                <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40" />
                <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
                
                {/* Local Goal Box */}
                <div className="absolute left-4 top-1/2 h-36 w-16 -translate-y-1/2 border border-white/40 bg-emerald-800/10" />
                <div className="absolute left-4 top-1/2 h-20 w-6 -translate-y-1/2 border border-white/40" />
                
                {/* Visitante Goal Box */}
                <div className="absolute right-4 top-1/2 h-36 w-16 -translate-y-1/2 border border-white/40 bg-emerald-800/10" />
                <div className="absolute right-4 top-1/2 h-20 w-6 -translate-y-1/2 border border-white/40" />

                {/* Plotting points */}
                {events.map((ev) => {
                  const color = ev.tipo === 'Gol' ? '#f43f5e' : ev.tipo === 'Ocasión' ? '#f97316' : ev.tipo === 'Duelo' ? '#f59e0b' : '#64748b';
                  return (
                    <div
                      key={ev.id}
                      className="absolute h-4 w-4 rounded-full border border-white flex items-center justify-center text-[8px] font-black text-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                      style={{
                        left: `${ev.posicion_x}%`,
                        top: `${ev.posicion_y}%`,
                        backgroundColor: color
                      }}
                      title={`${ev.tipo} - Minuto ${ev.minuto_partido}'\n${ev.descripcion}`}
                    >
                      {ev.tipo[0]}
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-6 left-1/2 w-36 -translate-x-1/2 scale-0 group-hover:scale-100 rounded bg-slate-900 border border-slate-700/60 p-2 text-[9px] font-semibold text-slate-100 pointer-events-none transition-all shadow-md leading-tight">
                        <span className="font-extrabold block uppercase" style={{ color }}>{ev.tipo} ({ev.minuto_partido}&apos;)</span>
                        {ev.descripcion}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GRAFICAS SUB-TAB CONTENT */}
          {activeSubTab === 'graficas' && (
            <div className="space-y-4.5">
              <span className="text-xs font-extrabold text-muted-text block leading-none">Distribución de Registros</span>
              
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 pt-2">
                {Object.entries(getStats()).map(([type, count]) => {
                  const colorClass = type === 'Gol' ? 'text-rose-500 border-rose-100 bg-rose-50/20' : type === 'Ocasión' ? 'text-orange-500 border-orange-100 bg-orange-50/20' : type === 'Duelo' ? 'text-amber-500 border-amber-100 bg-amber-50/20' : 'text-slate-500 border-slate-100 bg-slate-50/20';
                  
                  return (
                    <div key={type} className={`rounded-xl border p-4.5 text-center shadow-inner ${colorClass}`}>
                      <span className="text-[10px] font-black uppercase tracking-wider block">{type}</span>
                      <span className="text-3xl font-black block mt-2">{count}</span>
                      <span className="text-[9px] font-bold text-muted-text uppercase block mt-1">Registros</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
