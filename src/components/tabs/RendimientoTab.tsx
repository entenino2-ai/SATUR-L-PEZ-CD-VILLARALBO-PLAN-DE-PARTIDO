import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Save, 
  Loader2, 
  Award, 
  Trophy, 
  Activity, 
  Flame, 
  Star, 
  FileText, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Partido, Jugador, EstadisticaJugadorPartido } from '../../lib/types';

interface RendimientoTabProps {
  partido: Partido;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function RendimientoTab({ partido, showToast }: RendimientoTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [players, setPlayers] = useState<Jugador[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, EstadisticaJugadorPartido>>({});
  const [activeFilter, setActiveFilter] = useState<'todos' | 'titulares' | 'suplentes' | 'no_convocados'>('todos');
  const [searchPlayer, setSearchPlayer] = useState('');

  // Fetch players and match stats
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Villaralbo players
      const { data: playersData, error: playersErr } = await supabase
        .from('jugadores')
        .select('*')
        .order('dorsal', { ascending: true });

      if (playersErr && playersErr.code !== '42P01') throw playersErr;
      const allPlayers = (playersData || []) as Jugador[];
      setPlayers(allPlayers);

      // 2. Fetch Alineaciones to initialize starter/substitute status if no stats exist yet
      const { data: alineacionData } = await supabase
        .from('alineaciones')
        .select('*')
        .eq('partido_id', partido.id)
        .maybeSingle();

      const startersIds = new Set<string>();
      if (alineacionData?.jugadores_11) {
        Object.entries(alineacionData.jugadores_11).forEach(([posKey, val]: [string, any]) => {
          if (posKey.startsWith('local-')) {
            const pid = typeof val === 'object' && val !== null ? val.playerId : val;
            if (pid) startersIds.add(pid);
          }
        });
      }

      // 3. Fetch existing stats for this match from Supabase
      let fetchedStats: EstadisticaJugadorPartido[] = [];
      const { data: dbStats, error: statsErr } = await supabase
        .from('estadisticas_partido_jugador')
        .select('*')
        .eq('partido_id', partido.id);

      if (!statsErr && dbStats && dbStats.length > 0) {
        fetchedStats = dbStats as EstadisticaJugadorPartido[];
      } else {
        // Try localStorage cache
        try {
          const cached = localStorage.getItem(`stats_partido_${partido.id}`);
          if (cached) {
            fetchedStats = JSON.parse(cached);
          }
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }
      }

      // 4. Build map
      const initialMap: Record<string, EstadisticaJugadorPartido> = {};
      allPlayers.forEach(player => {
        const existing = fetchedStats.find(s => s.jugador_id === player.id);
        if (existing) {
          initialMap[player.id] = {
            ...existing,
            jugador: player
          };
        } else {
          const isStarter = startersIds.has(player.id);
          initialMap[player.id] = {
            partido_id: partido.id,
            jugador_id: player.id,
            convocado: true,
            titular: isStarter,
            minutos_jugados: isStarter ? 90 : 0,
            goles: 0,
            asistencias: 0,
            tarjetas_amarillas: 0,
            tarjetas_rojas: 0,
            valoracion: 7, // default good rating
            notas: '',
            jugador: player
          };
        }
      });

      setStatsMap(initialMap);
    } catch (err: any) {
      console.warn('Error cargando estadísticas:', err);
      showToast('Error cargando estadísticas: ' + (err.message || 'desconocido'), 'error');
    } finally {
      setLoading(false);
    }
  }, [partido.id, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update single player stat field
  const updatePlayerStat = (playerId: string, field: keyof EstadisticaJugadorPartido, value: any) => {
    setStatsMap(prev => {
      const current = prev[playerId];
      if (!current) return prev;

      let updated = { ...current, [field]: value };

      // Auto adjustments
      if (field === 'titular' && value === true) {
        updated.convocado = true;
        if (updated.minutos_jugados === 0) updated.minutos_jugados = 90;
      } else if (field === 'convocado' && value === false) {
        updated.titular = false;
        updated.minutos_jugados = 0;
      }

      return {
        ...prev,
        [playerId]: updated
      };
    });
  };

  // Save all stats
  const handleSave = async () => {
    try {
      setSaving(true);
      const statsList = Object.values(statsMap);

      // 1. Cache locally
      try {
        localStorage.setItem(`stats_partido_${partido.id}`, JSON.stringify(statsList));
      } catch (e) {
        console.warn('Cache error:', e);
      }

      // 2. Save in Supabase
      const payload = statsList.map(s => ({
        partido_id: s.partido_id,
        jugador_id: s.jugador_id,
        convocado: s.convocado,
        titular: s.titular,
        minutos_jugados: s.minutos_jugados,
        goles: s.goles,
        asistencias: s.asistencias,
        tarjetas_amarillas: s.tarjetas_amarillas,
        tarjetas_rojas: s.tarjetas_rojas,
        valoracion: s.valoracion,
        notas: s.notas
      }));

      const { error } = await supabase
        .from('estadisticas_partido_jugador')
        .upsert(payload, { onConflict: 'partido_id,jugador_id' });

      if (error && error.code !== '42P01') {
        console.warn('Supabase stats save warning:', error);
      }

      showToast('Estadísticas y valoraciones de rendimiento guardadas con éxito', 'success');
    } catch (err: any) {
      console.error('Error al guardar rendimiento:', err);
      showToast('Error al guardar: ' + (err.message || 'desconocido'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Match Summary Analytics
  const summary = useMemo(() => {
    const list = Object.values(statsMap);
    const convocados = list.filter(s => s.convocado);
    const titulares = list.filter(s => s.titular);
    const totalGoles = list.reduce((acc, s) => acc + (s.goles || 0), 0);
    const totalAsistencias = list.reduce((acc, s) => acc + (s.asistencias || 0), 0);
    const totalAmarillas = list.reduce((acc, s) => acc + (s.tarjetas_amarillas || 0), 0);
    const totalRojas = list.reduce((acc, s) => acc + (s.tarjetas_rojas || 0), 0);

    const playedList = list.filter(s => s.minutos_jugados > 0);
    const mediaValoracion = playedList.length > 0
      ? (playedList.reduce((acc, s) => acc + (s.valoracion || 0), 0) / playedList.length).toFixed(1)
      : '0.0';

    // Top MVP
    const mvp = [...playedList].sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0))[0];

    return {
      convocadosCount: convocados.length,
      titularesCount: titulares.length,
      totalGoles,
      totalAsistencias,
      totalAmarillas,
      totalRojas,
      mediaValoracion,
      mvpPlayer: mvp ? players.find(p => p.id === mvp.jugador_id) : null,
      mvpRating: mvp?.valoracion
    };
  }, [statsMap, players]);

  // Filtered players list
  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const s = statsMap[p.id];
      if (!s) return true;

      if (searchPlayer.trim() && !p.nombre.toLowerCase().includes(searchPlayer.toLowerCase())) {
        return false;
      }

      if (activeFilter === 'titulares') return s.titular;
      if (activeFilter === 'suplentes') return s.convocado && !s.titular;
      if (activeFilter === 'no_convocados') return !s.convocado;
      return true;
    });
  }, [players, statsMap, activeFilter, searchPlayer]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-sm font-black text-muted-text">Cargando métricas de rendimiento...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* TOP HEADER WITH SAVE BUTTON & STATS TILES */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">
              Seguimiento de Rendimiento y Actas
            </h3>
            <p className="text-xs font-semibold text-muted-text">
              Minutos jugados, goles, tarjetas y valoraciones técnicas individuales de Satur López
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white px-5 py-2.5 text-xs font-black transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Guardando...' : 'Guardar Rendimiento'}</span>
        </button>
      </div>

      {/* SUMMARY DASHBOARD METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Convocados / Titulares */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-muted-text tracking-wider">Convocatoria</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-foreground">{summary.titularesCount}</span>
            <span className="text-xs font-bold text-muted-text">/ {summary.convocadosCount} conv.</span>
          </div>
        </div>

        {/* Goles */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Goles Marcados</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{summary.totalGoles}</span>
            <span className="text-base">⚽</span>
          </div>
        </div>

        {/* Asistencias */}
        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider">Asistencias</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">{summary.totalAsistencias}</span>
            <span className="text-base">👟</span>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">Tarjetas</span>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 font-black text-amber-500 text-sm">
              <span className="w-2.5 h-3.5 bg-yellow-400 rounded-xs shadow-xs"></span>
              {summary.totalAmarillas}
            </span>
            <span className="flex items-center gap-1 font-black text-rose-500 text-sm">
              <span className="w-2.5 h-3.5 bg-rose-500 rounded-xs shadow-xs"></span>
              {summary.totalRojas}
            </span>
          </div>
        </div>

        {/* Media Valoración */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">Media Equipo</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{summary.mediaValoracion}</span>
            <Star className="w-4 h-4 text-purple-500 fill-purple-500" />
          </div>
        </div>

        {/* MVP */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-primary tracking-wider">MVP Partido</span>
          <div className="flex items-center gap-2 mt-1 truncate">
            {summary.mvpPlayer ? (
              <span className="text-xs font-black text-foreground truncate">
                #{summary.mvpPlayer.dorsal} {summary.mvpPlayer.nombre.split(' ')[0]} ({summary.mvpRating}★)
              </span>
            ) : (
              <span className="text-xs font-semibold text-muted-text">-</span>
            )}
          </div>
        </div>

      </div>

      {/* FILTER BUTTONS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-200/80 dark:bg-slate-900 p-1 rounded-2xl border border-border w-full sm:w-auto">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'titulares', label: '11 Titulares' },
            { id: 'suplentes', label: 'Suplentes' },
            { id: 'no_convocados', label: 'No Convocados' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-text hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Buscar jugador..."
          value={searchPlayer}
          onChange={(e) => setSearchPlayer(e.target.value)}
          className="w-full sm:w-64 bg-card border border-border rounded-xl px-3.5 py-2 text-xs font-bold text-foreground placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* PLAYERS PERFORMANCE TABLE / CARDS */}
      <div className="space-y-3">
        {filteredPlayers.map(player => {
          const stat = statsMap[player.id];
          if (!stat) return null;

          const getRatingBadge = (rating: number) => {
            if (rating >= 8.5) return 'bg-emerald-500 text-white';
            if (rating >= 7.0) return 'bg-sky-500 text-white';
            if (rating >= 6.0) return 'bg-yellow-500 text-slate-950';
            if (rating >= 5.0) return 'bg-orange-500 text-white';
            return 'bg-rose-500 text-white';
          };

          return (
            <div 
              key={player.id}
              className={`rounded-2xl border transition-all duration-200 p-4 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                !stat.convocado
                  ? 'bg-card/40 border-dashed border-border opacity-70'
                  : stat.titular
                  ? 'bg-card border-primary/40 shadow-primary/5'
                  : 'bg-card border-border'
              }`}
            >
              
              {/* PLAYER INFO */}
              <div className="flex items-center gap-3.5 min-w-[240px]">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-border overflow-hidden">
                  {player.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={player.foto_url} alt={player.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-black text-primary">#{player.dorsal || '-'}</span>
                  )}
                  {player.dorsal && (
                    <div className="absolute bottom-0 right-0 bg-slate-950/80 text-white text-[8px] font-black px-1 rounded-tl">
                      #{player.dorsal}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-black text-foreground">{player.nombre}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-extrabold uppercase text-primary">
                      {player.demarcacion}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      !stat.convocado 
                        ? 'bg-slate-100 dark:bg-slate-800 text-muted-text' 
                        : stat.titular 
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}>
                      {!stat.convocado ? 'No Convocado' : stat.titular ? 'Titular' : 'Banquillo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* CONVOCATORIA & MINUTOS CONTROLS */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Status selector */}
                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 border border-border">
                  <button
                    type="button"
                    onClick={() => updatePlayerStat(player.id, 'titular', true)}
                    className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                      stat.titular ? 'bg-emerald-500 text-white shadow-xs' : 'text-muted-text hover:text-foreground'
                    }`}
                  >
                    11 Titular
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updatePlayerStat(player.id, 'convocado', true);
                      updatePlayerStat(player.id, 'titular', false);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                      stat.convocado && !stat.titular ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-muted-text hover:text-foreground'
                    }`}
                  >
                    Banquillo
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePlayerStat(player.id, 'convocado', false)}
                    className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                      !stat.convocado ? 'bg-rose-500 text-white shadow-xs' : 'text-muted-text hover:text-foreground'
                    }`}
                  >
                    No Conv.
                  </button>
                </div>

                {/* Minutos jugados */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-3 py-1 rounded-xl border border-border">
                  <span className="text-[10px] font-black uppercase text-muted-text">Min:</span>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    disabled={!stat.convocado}
                    value={stat.minutos_jugados}
                    onChange={(e) => updatePlayerStat(player.id, 'minutos_jugados', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 bg-transparent text-center font-black text-xs text-foreground focus:outline-none"
                  />
                  <span className="text-[10px] font-bold text-muted-text">min</span>
                </div>

              </div>

              {/* GOALS, ASSISTS & CARDS COUNTERS */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Goles */}
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1 rounded-xl border border-border">
                  <span className="text-xs">⚽</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={stat.goles}
                    onChange={(e) => updatePlayerStat(player.id, 'goles', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-8 text-center font-black text-xs text-emerald-600 dark:text-emerald-400 bg-transparent focus:outline-none"
                  />
                </div>

                {/* Asistencias */}
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50 px-2.5 py-1 rounded-xl border border-border">
                  <span className="text-xs">👟</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={stat.asistencias}
                    onChange={(e) => updatePlayerStat(player.id, 'asistencias', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-8 text-center font-black text-xs text-sky-600 dark:text-sky-400 bg-transparent focus:outline-none"
                  />
                </div>

                {/* Tarjeta Amarilla */}
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-xl border border-border">
                  <span className="w-2.5 h-3.5 bg-yellow-400 rounded-xs shadow-xs"></span>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    value={stat.tarjetas_amarillas}
                    onChange={(e) => updatePlayerStat(player.id, 'tarjetas_amarillas', Math.max(0, Math.min(2, parseInt(e.target.value) || 0)))}
                    className="w-7 text-center font-black text-xs text-amber-500 bg-transparent focus:outline-none"
                  />
                </div>

                {/* Tarjeta Roja */}
                <button
                  type="button"
                  onClick={() => updatePlayerStat(player.id, 'tarjetas_rojas', stat.tarjetas_rojas > 0 ? 0 : 1)}
                  title="Tarjeta Roja"
                  className={`px-2 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                    stat.tarjetas_rojas > 0
                      ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900/50 border-border text-muted-text opacity-40 hover:opacity-100'
                  }`}
                >
                  <span className="w-2.5 h-3.5 bg-rose-500 rounded-xs shadow-xs border border-white/40"></span>
                  <span className="text-[10px] font-black">{stat.tarjetas_rojas > 0 ? 'ROJA' : '0'}</span>
                </button>

              </div>

              {/* RATING & NOTES */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                
                {/* Rating Stepper */}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-3 py-1 rounded-xl border border-border">
                  <span className="text-[10px] font-black uppercase text-muted-text">Nota:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={stat.valoracion}
                    onChange={(e) => updatePlayerStat(player.id, 'valoracion', Math.max(1, Math.min(10, parseFloat(e.target.value) || 1)))}
                    className="w-10 text-center font-black text-xs bg-transparent focus:outline-none"
                  />
                  <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${getRatingBadge(stat.valoracion)}`}>
                    {stat.valoracion}★
                  </div>
                </div>

                {/* Technical Note input */}
                <input
                  type="text"
                  placeholder="Nota técnica del míster..."
                  value={stat.notas}
                  onChange={(e) => updatePlayerStat(player.id, 'notas', e.target.value)}
                  className="bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary w-full lg:w-48"
                />

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
