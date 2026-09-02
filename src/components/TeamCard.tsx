'use client';

import React from 'react';
import { Edit2, Trash2, Shield, Calendar } from 'lucide-react';
import { Equipo } from '../lib/types';

interface TeamCardProps {
  team: Equipo;
  onEdit: (team: Equipo) => void;
  onDelete: (id: string) => void;
  onViewPlayers?: (team: Equipo) => void;
}

export default function TeamCard({ team, onEdit, onDelete, onViewPlayers }: TeamCardProps) {
  // Get initials for team shield fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  const isCDVillaralbo = team.nombre.toLowerCase().includes('villaralbo');

  const formatCreationDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Reciente';
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Reciente';
    }
  };

  return (
    <div 
      className={`group relative flex items-center justify-between rounded-2xl border border-border bg-card p-4.5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md dark:shadow-slate-900/10 ${onViewPlayers ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''}`}
      onClick={() => {
        if (onViewPlayers) {
          onViewPlayers(team);
        }
      }}
    >
      
      {/* Decorative side accent for the main club */}
      {isCDVillaralbo && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-gradient-to-b from-primary to-primary-blue" />
      )}

      <div className="flex items-center gap-4">
        {/* Shield Container */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-slate-50 dark:bg-slate-900/30 p-2 shadow-inner transition-transform duration-300 group-hover:scale-105">
          {team.escudo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={team.escudo_url}
              alt={team.nombre}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-primary/10 to-primary-blue/10 rounded-xl text-primary font-black text-base border border-primary/20">
              {getInitials(team.nombre)}
            </div>
          )}
        </div>

        {/* Team details */}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors duration-200 sm:text-base">
              {team.nombre}
            </h3>
            {isCDVillaralbo && (
              <span className="rounded-full bg-primary-blue/10 px-2 py-0.5 text-[9px] font-black text-primary-blue uppercase tracking-wider">
                Principal
              </span>
            )}
          </div>
          
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-text font-semibold">
            <Calendar className="h-3.5 w-3.5" />
            <span>Creado: {formatCreationDate(team.creado_en)}</span>
          </div>
        </div>
      </div>

      {/* CRUD Action Buttons */}
      <div className="flex gap-1.5 z-10">
        {onViewPlayers && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewPlayers(team);
            }}
            className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-slate-50 px-3 text-slate-700 hover:bg-primary hover:text-primary-foreground hover:border-primary dark:bg-slate-800/40 dark:text-slate-300 transition-all duration-200"
            title="Ver Jugadores"
          >
            <span className="text-xs font-bold">Jugadores</span>
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(team);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-primary dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-primary transition-all duration-200"
          title="Editar"
        >
          <Edit2 className="h-4 w-4" />
        </button>

        {/* Don't allow deletion of CD Villaralbo main team for safety, but allow deleting other rival teams */}
        {!isCDVillaralbo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(team.id);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-primary-blue dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-rose-950/20 dark:hover:text-primary-blue transition-all duration-200"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
