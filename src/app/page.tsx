'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Loader2, 
  Sparkles, 
  Activity, 
  Trash2, 
  UserPlus, 
  ShieldCheck, 
  Calendar,
  X,
  MapPin,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';

import { supabase } from '../lib/supabase';
import { Jugador, Equipo, DemarcacionType, Partido } from '../lib/types';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PlayerCard, { getPositionConfig } from '../components/PlayerCard';
import PlayerModal from '../components/PlayerModal';
import TeamCard from '../components/TeamCard';
import TeamModal from '../components/TeamModal';
import TeamPlayersModal from '../components/TeamPlayersModal';
import PartidoList from '../components/PartidoList';
import PartidoDetail from '../components/PartidoDetail';

// Mock list of CD Villaralbo players to seed database
const CD_VILLARALBO_SEED_PLAYERS: Omit<Jugador, 'id' | 'creado_en'>[] = [
  { nombre: 'Miguel Ángel Ramos', dorsal: 1, demarcacion: 'Portero', fecha_nacimiento: '1995-04-12', forma: 95, foto_url: null },
  { nombre: 'Carlos Ramos', dorsal: 4, demarcacion: 'Defensa Central', fecha_nacimiento: '1994-11-03', forma: 92, foto_url: null },
  { nombre: 'Héctor Gómez', dorsal: 5, demarcacion: 'Defensa Central', fecha_nacimiento: '1998-05-18', forma: 88, foto_url: null },
  { nombre: 'Jorge González', dorsal: 2, demarcacion: 'Defensa Lateral', fecha_nacimiento: '2000-02-14', forma: 85, foto_url: null },
  { nombre: 'Miguel Mazariegos', dorsal: 3, demarcacion: 'Defensa Lateral', fecha_nacimiento: '2001-09-07', forma: 90, foto_url: null },
  { nombre: 'Raúl Valero', dorsal: 6, demarcacion: 'Mediocentro', fecha_nacimiento: '1996-01-20', forma: 96, foto_url: null },
  { nombre: 'Javi Borrego', dorsal: 7, demarcacion: 'Extremo', fecha_nacimiento: '1997-03-24', forma: 95, foto_url: null },
  { nombre: 'Juanan del Valle', dorsal: 8, demarcacion: 'Interior', fecha_nacimiento: '1996-10-15', forma: 91, foto_url: null },
  { nombre: 'Chechi Blanco', dorsal: 9, demarcacion: 'Delantero', fecha_nacimiento: '1993-08-14', forma: 98, foto_url: null },
  { nombre: 'Rubén Rodríguez', dorsal: 10, demarcacion: 'Mediapunta', fecha_nacimiento: '1997-06-12', forma: 94, foto_url: null },
  { nombre: 'Luis Rivas', dorsal: 11, demarcacion: 'Extremo', fecha_nacimiento: '2001-01-19', forma: 92, foto_url: null },
  { nombre: 'Alejandro Sanz', dorsal: 13, demarcacion: 'Portero', fecha_nacimiento: '2002-08-25', forma: 80, foto_url: null },
  { nombre: 'Andrés Fraile', dorsal: 14, demarcacion: 'Mediocentro', fecha_nacimiento: '2002-12-05', forma: 83, foto_url: null },
  { nombre: 'David De la Iglesia', dorsal: 15, demarcacion: 'Defensa Central', fecha_nacimiento: '2003-03-22', forma: 78, foto_url: null },
  { nombre: 'Samuel Prieto', dorsal: 16, demarcacion: 'Interior', fecha_nacimiento: '2004-02-28', forma: 75, foto_url: null },
  { nombre: 'Hugo Herrero', dorsal: 17, demarcacion: 'Delantero', fecha_nacimiento: '2003-05-10', forma: 81, foto_url: null },
  { nombre: 'Adrián López', dorsal: 18, demarcacion: 'Mediapunta', fecha_nacimiento: '2000-11-20', forma: 82, foto_url: null },
  { nombre: 'Dani Hernando', dorsal: 19, demarcacion: 'Extremo', fecha_nacimiento: '2002-06-30', forma: 86, foto_url: null },
  { nombre: 'Manuel Domínguez', dorsal: 21, demarcacion: 'Delantero', fecha_nacimiento: '2004-09-15', forma: 79, foto_url: null },
  { nombre: 'Sergio Ledesma', dorsal: 22, demarcacion: 'Defensa Lateral', fecha_nacimiento: '1999-07-31', forma: 84, foto_url: null }
];

const SEED_TEAMS = [
  { nombre: 'CD Villaralbo', escudo_url: null },
  { nombre: 'Zamora CF', escudo_url: null },
  { nombre: 'Real Ávila CF', escudo_url: null },
  { nombre: 'Arandina CF', escudo_url: null },
  { nombre: 'Atlético Tordesillas', escudo_url: null },
  { nombre: 'Salamanca UDS', escudo_url: null }
];

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

export default function DashboardPage() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('plantilla');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data States
  const [players, setPlayers] = useState<Jugador[]>([]);
  const [teams, setTeams] = useState<Equipo[]>([]);
  const [selectedPartido, setSelectedPartido] = useState<Partido | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<'Todos' | 'POR' | 'DEF' | 'MED' | 'DEL'>('Todos');
  
  // Modals
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isTeamPlayersModalOpen, setIsTeamPlayersModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Jugador | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Equipo | null>(null);
  
  // View Details Overlay
  const [viewedPlayer, setViewedPlayer] = useState<Jugador | null>(null);
  
  // Custom alerts (Toast)
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });
  const [isSeeding, setIsSeeding] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(initialDark);
    document.documentElement.classList.toggle('dark', initialDark);
  }, []);

  // Theme switch handler
  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', nextDark);
  };

  // Toast Helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
  }, []);

  // Close toast automatically
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Fetch players from Supabase
  const fetchPlayers = useCallback(async () => {
    try {
      // First try to fetch from vista_jugadores which includes age calculation ('año')
      const { data, error } = await supabase
        .from('vista_jugadores')
        .select('*')
        .order('dorsal', { ascending: true });
        
      if (error) {
        // Fallback to table 'jugadores' if view isn't available or fails
        console.warn('Fallo al obtener de vista_jugadores, intentando de la tabla jugadores:', error.message);
        const { data: rawData, error: rawError } = await supabase
          .from('jugadores')
          .select('*')
          .order('dorsal', { ascending: true });

        if (rawError) throw rawError;
        setPlayers((rawData || []) as Jugador[]);
      } else {
        setPlayers((data || []) as Jugador[]);
      }
    } catch (err: any) {
      console.error('Error fetching players:', err);
      showToast('Error al cargar la plantilla: ' + err.message, 'error');
    }
  }, [showToast]);

  // Fetch teams from Supabase
  const fetchTeams = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('equipos')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setTeams((data || []) as Equipo[]);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      showToast('Error al cargar los equipos: ' + err.message, 'error');
    }
  }, [showToast]);

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPlayers(), fetchTeams()]);
      setLoading(false);
    };
    loadData();
  }, [fetchPlayers, fetchTeams]);

  // Seeder: "Cargar Plantilla CD VILLARALBO"
  const handleSeedData = async () => {
    if (isSeeding) return;
    
    const confirmSeed = window.confirm(
      '¿Deseas restaurar la base de datos con los 20 jugadores oficiales del CD Villaralbo y los equipos de la liga? (Esto reemplazará los datos existentes).'
    );
    if (!confirmSeed) return;

    try {
      setIsSeeding(true);
      setLoading(true);
      
      // 1. Delete existing records (Cascading database triggers will clean dependent rows)
      await supabase.from('jugadores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('equipos').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 2. Insert Teams
      const { error: teamErr } = await supabase.from('equipos').insert(SEED_TEAMS);
      if (teamErr) throw teamErr;

      // 3. Insert Players
      const { error: playerErr } = await supabase.from('jugadores').insert(CD_VILLARALBO_SEED_PLAYERS);
      if (playerErr) throw playerErr;

      showToast('Plantilla y equipos cargados correctamente desde el CD Villaralbo', 'success');
      
      // 4. Reload data
      await Promise.all([fetchPlayers(), fetchTeams()]);
    } catch (err: any) {
      console.error('Seeding error:', err);
      showToast('Error al cargar los datos demo: ' + err.message, 'error');
    } finally {
      setIsSeeding(false);
      setLoading(false);
    }
  };

  // CRUD Actions: PLAYERS
  const handleSavePlayer = async (playerData: Omit<Jugador, 'id' | 'creado_en'> & { id?: string }) => {
    try {
      if (playerData.id) {
        // Edit Mode
        const { error } = await supabase
          .from('jugadores')
          .update({
            nombre: playerData.nombre,
            dorsal: playerData.dorsal,
            demarcacion: playerData.demarcacion,
            fecha_nacimiento: playerData.fecha_nacimiento,
            foto_url: playerData.foto_url,
            forma: playerData.forma
          })
          .eq('id', playerData.id);
        
        if (error) throw error;
        showToast(`Jugador ${playerData.nombre} editado con éxito`);
      } else {
        // Create Mode
        const { error } = await supabase
          .from('jugadores')
          .insert([playerData]);

        if (error) throw error;
        showToast(`Jugador ${playerData.nombre} añadido a la plantilla`);
      }
      fetchPlayers();
    } catch (err: any) {
      console.error('Error saving player:', err);
      showToast('No se pudo guardar el jugador: ' + err.message, 'error');
      throw err; // Re-throw to show error inside modal too
    }
  };

  const handleDeletePlayer = async (id: string) => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar a este jugador de la plantilla?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('jugadores').delete().eq('id', id);
      if (error) throw error;
      showToast('Jugador eliminado de la plantilla');
      fetchPlayers();
    } catch (err: any) {
      console.error('Error deleting player:', err);
      showToast('No se pudo eliminar el jugador: ' + err.message, 'error');
    }
  };

  // CRUD Actions: TEAMS
  const handleSaveTeam = async (teamData: Omit<Equipo, 'id' | 'creado_en'> & { id?: string }) => {
    try {
      if (teamData.id) {
        // Edit Mode
        const { error } = await supabase
          .from('equipos')
          .update({
            nombre: teamData.nombre,
            escudo_url: teamData.escudo_url
          })
          .eq('id', teamData.id);
        
        if (error) throw error;
        showToast(`Equipo ${teamData.nombre} modificado con éxito`);
      } else {
        // Create Mode
        const { error } = await supabase
          .from('equipos')
          .insert([teamData]);

        if (error) throw error;
        showToast(`Equipo ${teamData.nombre} registrado con éxito`);
      }
      fetchTeams();
    } catch (err: any) {
      console.error('Error saving team:', err);
      showToast('No se pudo guardar el equipo: ' + err.message, 'error');
      throw err;
    }
  };

  const handleDeleteTeam = async (id: string) => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este equipo?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('equipos').delete().eq('id', id);
      if (error) throw error;
      showToast('Equipo eliminado con éxito');
      fetchTeams();
    } catch (err: any) {
      console.error('Error deleting team:', err);
      showToast('No se pudo eliminar el equipo: ' + err.message, 'error');
    }
  };

  // Memoized lists filtering logic
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // 1. Position Filter
      let matchesPosition = true;
      if (positionFilter !== 'Todos') {
        const { label } = getPositionConfig(player.demarcacion);
        matchesPosition = label === positionFilter;
      }

      // 2. Search Text
      const matchesSearch = player.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (player.dorsal !== null && player.dorsal.toString().includes(searchQuery));

      return matchesPosition && matchesSearch;
    });
  }, [players, positionFilter, searchQuery]);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => 
      team.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teams, searchQuery]);

  // Mock technical ratings based on positions (adds dynamic wow elements to the player details view)
  const getPlayerMockStats = (position: DemarcacionType, shape: number) => {
    const modifier = shape / 100;
    switch (position) {
      case 'Portero':
        return [
          { name: 'Reflejos', val: Math.round(92 * modifier) },
          { name: 'Juego Aéreo', val: Math.round(85 * modifier) },
          { name: 'Estirada', val: Math.round(90 * modifier) },
          { name: 'Saque pie/mano', val: Math.round(82 * modifier) },
          { name: 'Posicionamiento', val: Math.round(88 * modifier) },
        ];
      case 'Defensa Central':
      case 'Defensa Lateral':
        return [
          { name: 'Intercepciones', val: Math.round(89 * modifier) },
          { name: 'Físico/Fuerza', val: Math.round(91 * modifier) },
          { name: 'Velocidad', val: Math.round(84 * modifier) },
          { name: 'Entradas', val: Math.round(88 * modifier) },
          { name: 'Pase corto', val: Math.round(79 * modifier) },
        ];
      case 'Mediocentro':
      case 'Interior':
      case 'Mediapunta':
        return [
          { name: 'Visión de juego', val: Math.round(94 * modifier) },
          { name: 'Pase largo', val: Math.round(90 * modifier) },
          { name: 'Regate/Control', val: Math.round(91 * modifier) },
          { name: 'Tiro medio', val: Math.round(82 * modifier) },
          { name: 'Recuperación', val: Math.round(85 * modifier) },
        ];
      default: // Extremo / Delantero
        return [
          { name: 'Definición', val: Math.round(95 * modifier) },
          { name: 'Velocidad punta', val: Math.round(93 * modifier) },
          { name: 'Regate', val: Math.round(90 * modifier) },
          { name: 'Desmarque', val: Math.round(92 * modifier) },
          { name: 'Salto/Cabeza', val: Math.round(80 * modifier) },
        ];
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Toast alert overlay */}
      {toast.visible && (
        <div className="fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200/20 bg-slate-900 px-5 py-4 text-sm font-bold text-white shadow-2xl transition-all duration-300 dark:bg-slate-950 sm:max-w-md animate-in fade-in slide-in-from-top-4">
          {toast.type === 'success' && <ShieldCheck className="h-5 w-5 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400" />}
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(prev => ({ ...prev, visible: false }))}
            className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery(''); // Reset search when switching tab
        }}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        stats={{
          playersCount: players.length,
          teamsCount: teams.length,
        }}
      />

      {/* Dashboard Content Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Dynamic header */}
        <Header activeTab={activeTab} onMenuToggle={() => setIsMobileMenuOpen(true)} />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* TAB 1: PLANTILLA */}
          {activeTab === 'plantilla' && (
            <div className="space-y-6">
              {/* Header Action Row */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Plantilla del CD Villaralbo</h2>
                  <p className="text-xs font-semibold text-muted-text">
                    Controla la preparación y el estado físico de tu equipo para el próximo partido.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleSeedData}
                    disabled={loading || isSeeding}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-extrabold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" />
                    <span>Cargar Plantilla CD Villaralbo</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPlayer(null);
                      setIsPlayerModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-blue px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:from-primary/95 hover:to-primary-blue/95 transition-all duration-200 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Añadir Jugador</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Row */}
              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center">
                {/* Search query input */}
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-text" />
                  <input
                    type="text"
                    placeholder="Buscar jugador por nombre o dorsal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-2.5 pr-4 pl-10 text-xs font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Quick Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {(['Todos', 'POR', 'DEF', 'MED', 'DEL'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setPositionFilter(filter)}
                      className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all duration-150 cursor-pointer ${
                        positionFilter === filter
                          ? 'bg-primary text-white shadow-sm'
                          : 'border border-border bg-background text-muted-text hover:bg-slate-50 hover:text-foreground dark:hover:bg-slate-800'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs font-bold text-muted-text">Cargando jugadores desde Supabase...</p>
                </div>
              ) : filteredPlayers.length === 0 ? (
                /* Empty state */
                <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center shadow-inner">
                  <UserPlus className="h-10 w-10 text-muted-text/40 mb-3" />
                  <h3 className="text-sm font-bold text-foreground">No se encontraron jugadores</h3>
                  <p className="max-w-xs text-xs font-semibold text-muted-text mt-1">
                    Carga los datos por defecto o añade jugadores manualmente para verlos en el grid.
                  </p>
                </div>
              ) : (
                /* Grid de Tarjetas */
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                  {filteredPlayers.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      onEdit={(p) => {
                        setSelectedPlayer(p);
                        setIsPlayerModalOpen(true);
                      }}
                      onDelete={handleDeletePlayer}
                      onView={(p) => setViewedPlayer(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EQUIPOS */}
          {activeTab === 'equipos' && (
            <div className="space-y-6">
              {/* Header Action Row */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Listado de Equipos</h2>
                  <p className="text-xs font-semibold text-muted-text">
                    Registra y administra los equipos asociados a la competición.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedTeam(null);
                    setIsTeamModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-blue px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:from-primary/95 hover:to-primary-blue/95 transition-all duration-200 cursor-pointer sm:self-center"
                >
                  <Plus className="h-4 w-4" />
                  <span>Añadir Equipo</span>
                </button>
              </div>

              {/* Search Row */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-text" />
                  <input
                    type="text"
                    placeholder="Buscar equipo por nombre de club..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-2.5 pr-4 pl-10 text-xs font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs font-bold text-muted-text">Cargando equipos desde Supabase...</p>
                </div>
              ) : filteredTeams.length === 0 ? (
                /* Empty state */
                <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center shadow-inner">
                  <ShieldCheck className="h-10 w-10 text-muted-text/40 mb-3" />
                  <h3 className="text-sm font-bold text-foreground">No hay equipos registrados</h3>
                  <p className="max-w-xs text-xs font-semibold text-muted-text mt-1">
                    Carga los datos iniciales o crea nuevos equipos para gestionar rivales.
                  </p>
                </div>
              ) : (
                /* Grid de Equipos */
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      onEdit={(t) => {
                        setSelectedTeam(t);
                        setIsTeamModalOpen(true);
                      }}
                      onDelete={handleDeleteTeam}
                      onViewPlayers={(t) => {
                        setSelectedTeam(t);
                        setIsTeamPlayersModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PARTIDOS */}
          {activeTab === 'partidos' && (
            selectedPartido ? (
              <PartidoDetail
                partido={selectedPartido}
                onBack={() => setSelectedPartido(null)}
                showToast={showToast}
              />
            ) : (
              <PartidoList
                onSelectPartido={(p) => setSelectedPartido(p)}
                teams={teams}
              />
            )
          )}

        </main>
      </div>
      {/* OVERLAY: PLAYER VIEW DETAILS (WOW element!) */}
      {viewedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setViewedPlayer(null)} />
          
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header backdrop color based on position */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary/90 via-primary-blue/95 to-primary-blue/90" />
            
            {/* Close button */}
            <button 
              onClick={() => setViewedPlayer(null)}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Profile Content */}
            <div className="relative z-10 px-6 pt-16 pb-6">
              {/* Photo & Main Badges */}
              <div className="flex flex-col items-center">
                <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-card bg-slate-50 shadow-lg">
                  {viewedPlayer.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={viewedPlayer.foto_url} alt={viewedPlayer.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/35 to-primary-blue/35 text-2xl font-black text-white">
                      {viewedPlayer.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm font-black shadow-sm">
                    {viewedPlayer.dorsal !== null ? `#${viewedPlayer.dorsal}` : '--'}
                  </span>
                  <span className={`rounded-xl border px-3 py-1 text-xs font-black uppercase tracking-wider ${
                    getPositionConfig(viewedPlayer.demarcacion).color
                  }`}>
                    {viewedPlayer.demarcacion}
                  </span>
                </div>

                <h3 className="mt-3.5 text-center text-xl font-black tracking-tight">{viewedPlayer.nombre}</h3>
                <p className="text-xs font-semibold text-muted-text mt-0.5 uppercase tracking-widest">CD VILLARALBO SQUAD</p>
              </div>

              {/* Personal details grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-border/80 bg-slate-50/50 dark:bg-slate-900/30 p-4">
                <div>
                  <span className="text-[10px] font-black text-muted-text uppercase">FECHA DE NACIMIENTO</span>
                  <p className="text-xs font-extrabold mt-0.5">
                    {new Date(viewedPlayer.fecha_nacimiento).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-muted-text uppercase">EDAD CALCULADA</span>
                  <p className="text-xs font-extrabold mt-0.5">
                    {viewedPlayer.año !== undefined ? `${viewedPlayer.año} años` : 'No calculada'}
                  </p>
                </div>
                <div className="col-span-2 border-t border-border/60 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-4.5 w-4.5 text-emerald-500" />
                    <div>
                      <span className="text-[10px] font-black text-muted-text uppercase block leading-none">PREPARACIÓN FÍSICA</span>
                      <span className="text-xs font-extrabold text-emerald-500">{viewedPlayer.forma}% de forma óptima</span>
                    </div>
                  </div>
                  {viewedPlayer.forma >= 90 ? (
                    <span className="rounded-lg bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[9px] font-black uppercase">
                      Disponible para 90min
                    </span>
                  ) : viewedPlayer.forma >= 75 ? (
                    <span className="rounded-lg bg-amber-500/10 text-amber-600 px-2 py-0.5 text-[9px] font-black uppercase">
                      Condicionado
                    </span>
                  ) : (
                    <span className="rounded-lg bg-rose-500/10 text-rose-600 px-2 py-0.5 text-[9px] font-black uppercase">
                      No recomendado
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic Mock Ratings breakdown */}
              <div className="mt-6">
                <h4 className="flex items-center gap-1.5 text-xs font-black text-foreground uppercase mb-3">
                  <Award className="h-4 w-4 text-primary" /> Valoración del Analista Técnico
                </h4>
                <div className="space-y-3.5">
                  {getPlayerMockStats(viewedPlayer.demarcacion, viewedPlayer.forma).map((stat) => (
                    <div key={stat.name} className="flex items-center gap-3">
                      <span className="text-[11px] font-bold w-28 text-muted-text truncate">{stat.name}</span>
                      <div className="flex-1 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 border border-border/30">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-blue transition-all duration-500"
                          style={{ width: `${stat.val}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-black text-primary w-6 text-right">{stat.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRUD Modals */}
      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => {
          setIsPlayerModalOpen(false);
          setSelectedPlayer(null);
        }}
        player={selectedPlayer}
        onSave={handleSavePlayer}
      />

      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
        onSave={handleSaveTeam}
      />

      <TeamPlayersModal
        isOpen={isTeamPlayersModalOpen}
        onClose={() => {
          setIsTeamPlayersModalOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
      />
    </div>
  );
}
