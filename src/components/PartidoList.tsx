'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Calendar, MapPin, Trash2, Shield, Loader2, ArrowRight, X, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Partido, Equipo } from '../lib/types';

interface PartidoListProps {
  onSelectPartido: (partido: Partido) => void;
  teams: Equipo[];
}

export default function PartidoList({ onSelectPartido, teams }: PartidoListProps) {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartidoId, setEditingPartidoId] = useState<string | null>(null);

  // Form states
  const [equipoLocalId, setEquipoLocalId] = useState('');
  const [equipoVisitanteId, setEquipoVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('');
  const [tipo, setTipo] = useState<'Liga' | 'Amistoso' | 'Copa'>('Liga');
  const [estado, setEstado] = useState<'Programado' | 'En juego' | 'Finalizado'>('Programado');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch matches from Supabase
  const fetchPartidos = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partidos')
        .select(`
          *,
          equipo_local:equipos!partidos_equipo_local_id_fkey(*),
          equipo_visitante:equipos!partidos_equipo_visitante_id_fkey(*)
        `)
        .order('fecha', { ascending: false });

      if (error) throw error;
      setPartidos(data || []);
    } catch (err: any) {
      console.error('Error fetching partidos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartidos();
  }, [fetchPartidos]);

  // Set default Villaralbo local team if exists (only for new matches)
  useEffect(() => {
    if (editingPartidoId) return;
    const cdVillaralbo = teams.find(t => t.nombre.toLowerCase().includes('villaralbo'));
    if (cdVillaralbo) {
      setEquipoLocalId(cdVillaralbo.id);
    } else if (teams.length > 0) {
      setEquipoLocalId(teams[0].id);
    }
    if (teams.length > 1) {
      const otherTeam = teams.find(t => !t.nombre.toLowerCase().includes('villaralbo')) || teams[1];
      setEquipoVisitanteId(otherTeam.id);
    }
  }, [teams, editingPartidoId]);

  const handleCreatePartido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipoLocalId || !equipoVisitanteId || !fecha) {
      setErrorMsg('Por favor completa los campos obligatorios.');
      return;
    }
    if (equipoLocalId === equipoVisitanteId) {
      setErrorMsg('Un equipo no puede jugar contra sí mismo.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      if (editingPartidoId) {
        // Update existing match
        const { error } = await supabase
          .from('partidos')
          .update({
            equipo_local_id: equipoLocalId,
            equipo_visitante_id: equipoVisitanteId,
            fecha: new Date(fecha).toISOString(),
            lugar: lugar || null,
            tipo,
            estado
          })
          .eq('id', editingPartidoId);

        if (error) throw error;
      } else {
        // Create new match
        const { data, error } = await supabase
          .from('partidos')
          .insert([
            {
              equipo_local_id: equipoLocalId,
              equipo_visitante_id: equipoVisitanteId,
              fecha: new Date(fecha).toISOString(),
              lugar: lugar || null,
              tipo,
              estado
            }
          ])
          .select();

        if (error) throw error;

        // Seed default record in informes_rival and planes_partido for the created match
        if (data && data[0]) {
          const matchId = data[0].id;
          await Promise.all([
            supabase.from('informes_rival').insert([{ partido_id: matchId, caracteristicas: {} }]),
            supabase.from('planes_partido').insert([{ partido_id: matchId }])
          ]);
        }
      }

      setIsModalOpen(false);
      setEditingPartidoId(null);
      // Reset form
      setLugar('');
      setFecha('');
      fetchPartidos();
    } catch (err: any) {
      console.error('Error saving partido:', err);
      setErrorMsg(err.message || 'Error al guardar el partido');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePartido = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este partido?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('partidos').delete().eq('id', id);
      if (error) throw error;
      fetchPartidos();
    } catch (err: any) {
      console.error('Error deleting partido:', err);
      alert('Error al eliminar partido: ' + err.message);
    }
  };

  const handleEditClick = (partido: Partido, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPartidoId(partido.id);
    setEquipoLocalId(partido.equipo_local_id);
    setEquipoVisitanteId(partido.equipo_visitante_id);
    // Convert to datetime-local format YYYY-MM-DDThh:mm
    const d = new Date(partido.fecha);
    const formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setFecha(formattedDate);
    setLugar(partido.lugar || '');
    setTipo(partido.tipo);
    setEstado(partido.estado);
    setIsModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Listado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Listado de Partidos</h2>
          <p className="text-xs font-semibold text-muted-text">
            Gestiona los partidos programados, diseña planes de juego e introduce informes del rival.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPartidoId(null);
            setLugar('');
            setFecha('');
            setTipo('Liga');
            setEstado('Programado');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-blue px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:from-primary/95 hover:to-primary-blue/95 transition-all duration-200 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Programar Partido</span>
        </button>
      </div>

      {/* Grid de Partidos */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-bold text-muted-text">Cargando partidos desde Supabase...</p>
        </div>
      ) : partidos.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center shadow-inner">
          <Calendar className="h-10 w-10 text-muted-text/40 mb-3" />
          <h3 className="text-sm font-bold text-foreground">No hay partidos programados</h3>
          <p className="max-w-xs text-xs font-semibold text-muted-text mt-1">
            Agenda tu primer encuentro haciendo clic en el botón de programar para empezar la planificación táctica.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partidos.map((partido) => {
            const local = partido.equipo_local;
            const visitante = partido.equipo_visitante;
            if (!local || !visitante) return null;

            return (
              <div
                key={partido.id}
                onClick={() => onSelectPartido(partido)}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md cursor-pointer dark:shadow-slate-900/10"
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`rounded-xl px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    partido.tipo === 'Liga'
                      ? 'bg-primary/10 text-primary'
                      : partido.tipo === 'Copa'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {partido.tipo}
                  </span>

                  <div className="flex gap-1">
                    <button
                      onClick={(e) => handleEditClick(partido, e)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeletePartido(partido.id, e)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-primary-blue dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Enfrentamiento visual (Logos + VS) */}
                <div className="flex items-center justify-center gap-6 py-2">
                  {/* Local Shield */}
                  <div className="flex flex-col items-center gap-1 w-24">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border bg-slate-50 dark:bg-slate-900/30 p-2 shadow-inner">
                      {local.escudo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={local.escudo_url} alt={local.nombre} className="h-full w-full object-contain" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-primary/10 to-primary-blue/10 rounded-xl text-primary font-black text-xs">
                          {getInitials(local.nombre)}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-extrabold text-center truncate w-full text-foreground">{local.nombre}</span>
                  </div>

                  {/* VS Divider */}
                  <span className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">VS</span>

                  {/* Visitante Shield */}
                  <div className="flex flex-col items-center gap-1 w-24">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border bg-slate-50 dark:bg-slate-900/30 p-2 shadow-inner">
                      {visitante.escudo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={visitante.escudo_url} alt={visitante.nombre} className="h-full w-full object-contain" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-primary/10 to-primary-blue/10 rounded-xl text-primary font-black text-xs">
                          {getInitials(visitante.nombre)}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-extrabold text-center truncate w-full text-foreground">{visitante.nombre}</span>
                  </div>
                </div>

                {/* Detalles extra */}
                <div className="mt-4 border-t border-border/60 pt-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-text">
                    <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>{formatDate(partido.fecha)}</span>
                  </div>

                  {partido.lugar && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-text">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{partido.lugar}</span>
                    </div>
                  )}
                </div>

                {/* Pie de tarjeta */}
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3.5">
                  <span className="text-[11px] font-bold text-muted-text">
                    Estado: <span className="font-extrabold text-foreground">{partido.estado}</span>
                  </span>
                  
                  <span className="flex items-center gap-1 text-[11px] font-black text-primary group-hover:translate-x-1.5 transition-transform duration-200">
                    <span>Abrir detalle</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Programar Partido */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <h3 className="text-base font-black tracking-tight uppercase">
                {editingPartidoId ? 'Modificar Partido' : 'Programar Nuevo Partido'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreatePartido} className="p-6 space-y-4.5">
              {errorMsg && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs font-bold text-primary-blue">
                  {errorMsg}
                </div>
              )}

              {/* Equipos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-text uppercase block">Equipo Local *</label>
                  <select
                    value={equipoLocalId}
                    onChange={(e) => setEquipoLocalId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary transition-all"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-text uppercase block">Equipo Visitante *</label>
                  <select
                    value={equipoVisitanteId}
                    onChange={(e) => setEquipoVisitanteId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary transition-all"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-text uppercase block">Fecha y Hora *</label>
                <input
                  type="datetime-local"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary transition-all"
                  required
                />
              </div>

              {/* Lugar */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-text uppercase block">Lugar / Estadio</label>
                <input
                  type="text"
                  placeholder="Ej. Estadio Municipal Lezama"
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Tipo y Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-text uppercase block">Tipo de Partido</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary transition-all"
                  >
                    <option value="Liga">Liga</option>
                    <option value="Amistoso">Amistoso</option>
                    <option value="Copa">Copa</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-text uppercase block">Estado</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary transition-all"
                  >
                    <option value="Programado">Programado</option>
                    <option value="En juego">En juego</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </div>
              </div>

              {/* Footer Acciones */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-blue px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:from-primary/95 hover:to-primary-blue/95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Guardar Partido</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
