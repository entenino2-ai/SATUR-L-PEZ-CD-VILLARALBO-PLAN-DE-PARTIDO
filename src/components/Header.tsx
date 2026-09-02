'use client';

import React from 'react';
import { Menu, Calendar, Trophy, User } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
  activeTab: string;
}

export default function Header({ onMenuToggle, activeTab }: HeaderProps) {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'plantilla':
        return {
          title: 'Gestión de Plantilla',
          subtitle: 'Jugadores inscritos, estado de forma y demarcaciones.',
          breadcrumb: 'Plantilla'
        };
      case 'equipos':
        return {
          title: 'Equipos y Clubes',
          subtitle: 'Listado de equipos del CD Villaralbo y rivales de liga.',
          breadcrumb: 'Equipos'
        };
      case 'partidos':
        return {
          title: 'Calendario de Partidos',
          subtitle: 'Próximos encuentros, planes de juego e informes técnicos.',
          breadcrumb: 'Partidos'
        };
      default:
        return {
          title: 'CD Villaralbo',
          subtitle: 'Plan de Partido y Panel Técnico.',
          breadcrumb: 'Dashboard'
        };
    }
  };

  const { title, subtitle, breadcrumb } = getPageTitle();

  return (
    <header className="flex h-20 items-center justify-between border-b border-border bg-card px-6 py-4 text-foreground shadow-sm">
      {/* Title & Mobile hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          {/* Breadcrumb path */}
          <div className="hidden items-center gap-1.5 text-xs font-semibold text-muted-text sm:flex">
            <span>Club</span>
            <span>/</span>
            <span className="text-primary-blue">{breadcrumb}</span>
          </div>
          {/* Page title */}
          <h1 className="text-base font-extrabold tracking-tight sm:text-lg">
            {title}
          </h1>
        </div>
      </div>

      {/* Utilities / Meta info */}
      <div className="flex items-center gap-3">
        {/* Quick Season Badge */}
        <div className="hidden items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-black text-amber-600 dark:text-amber-400 md:flex shadow-sm">
          <Trophy className="h-3.5 w-3.5 text-amber-500" />
          <span>Temp. 26/27</span>
        </div>

        {/* Current Match day badge */}
        <div className="hidden items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-black text-sky-600 dark:text-sky-400 md:flex shadow-sm">
          <Calendar className="h-3.5 w-3.5 text-sky-500" />
          <span>Jornada 24</span>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Supabase Conectado</span>
        </div>
      </div>
    </header>
  );
}
