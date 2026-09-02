'use client';

import React from 'react';
import { Edit2, Trash2, Eye, Activity } from 'lucide-react';
import { Jugador, DemarcacionType } from '../lib/types';

interface PlayerCardProps {
  player: Jugador;
  onEdit: (player: Jugador) => void;
  onDelete: (id: string) => void;
  onView: (player: Jugador) => void;
}

// Helper to translate and style position badges
export const getPositionConfig = (position: DemarcacionType) => {
  switch (position) {
    case 'Portero':
      return { label: 'POR', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400' };
    case 'Defensa Central':
    case 'Defensa Lateral':
      return { label: 'DEF', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400' };
    case 'Mediocentro':
    case 'Interior':
    case 'Mediapunta':
      return { label: 'MED', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400' };
    case 'Extremo':
    case 'Delantero':
      return { label: 'DEL', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400' };
    default:
      return { label: 'JUG', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400' };
  }
};

// Helper for shape color
const getShapeColor = (shape: number) => {
  if (shape >= 90) return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', label: 'Excelente' };
  if (shape >= 80) return { bar: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10', label: 'Bueno' };
  if (shape >= 70) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', label: 'Regular' };
  return { bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', label: 'Bajo rendimiento' };
};

export default function PlayerCard({ player, onEdit, onDelete, onView }: PlayerCardProps) {
  const { label: posLabel, color: posColor } = getPositionConfig(player.demarcacion);
  const shapeConfig = getShapeColor(player.forma);

  // Formatting date of birth: DD/MM/YYYY
  const formatBirthdate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Get dynamic age
  const getAge = () => {
    if (player.año !== undefined) return player.año;
    // Fallback calculation in frontend
    try {
      const birth = new Date(player.fecha_nacimiento);
      const diffMs = Date.now() - birth.getTime();
      const ageDate = new Date(diffMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    } catch {
      return '--';
    }
  };

  // Initial avatar placeholder
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:shadow-slate-900/10">
      
      {/* Decorative colored strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-blue to-primary-blue opacity-80" />

      {/* Card Header: Dorsal & Position */}
      <div className="flex items-center justify-between">
        {/* Dorsal badge */}
        <div className="flex h-9 min-w-9 px-2.5 items-center justify-center rounded-xl bg-primary/10 border border-primary/25 text-primary dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400 text-xs font-black tracking-wider shadow-sm">
          {player.dorsal !== null && player.dorsal !== undefined ? `#${player.dorsal}` : 'N/A'}
        </div>

        {/* Position badge */}
        <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black tracking-wider uppercase shadow-sm ${posColor}`}>
          {posLabel}
        </span>
      </div>

      {/* Card Body: Player photo and main info */}
      <div className="mt-4 flex flex-col items-center">
        {/* Player Avatar */}
        <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-border shadow-sm transition-transform duration-300 group-hover:scale-105">
          {player.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.foto_url}
              alt={player.nombre}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary-blue/20 text-xl font-black text-primary">
              {getInitials(player.nombre)}
            </div>
          )}
        </div>

        {/* Player Name and Specific position */}
        <h3 className="mt-4 text-center text-base font-extrabold tracking-tight text-foreground line-clamp-1 group-hover:text-primary-blue transition-colors duration-200">
          {player.nombre}
        </h3>
        
        <p className="mt-0.5 text-center text-xs font-bold text-muted-text">
          {player.demarcacion}
        </p>

        {/* Age & birthdate */}
        <p className="mt-2 text-center text-[11px] font-semibold text-muted-text">
          {getAge()} años <span className="text-slate-300 dark:text-slate-600">•</span> {formatBirthdate(player.fecha_nacimiento)}
        </p>
      </div>

      {/* Form indicator / performance meter */}
      <div className="mt-5 border-t border-border/60 pt-4">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="flex items-center gap-1 text-muted-text">
            <Activity className="h-3 w-3" /> Estado de Forma
          </span>
          <span className={shapeConfig.text}>{player.forma}% ({shapeConfig.label})</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 border border-border/40">
          <div
            className={`h-full rounded-full transition-all duration-500 ${shapeConfig.bar}`}
            style={{ width: `${player.forma}%` }}
          />
        </div>
      </div>

      {/* Hover action buttons */}
      <div className="mt-5 flex gap-2 border-t border-border/60 pt-4">
        <button
          onClick={() => onView(player)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-slate-100/80 py-2 text-xs font-bold text-foreground hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-primary dark:text-blue-400" />
          <span>Ver</span>
        </button>

        <button
          onClick={() => onEdit(player)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-slate-100/80 text-foreground hover:bg-slate-200 hover:text-primary dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-blue-400 transition-all duration-200 cursor-pointer"
          title="Editar"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={() => onDelete(player.id)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-slate-100/80 text-muted-text hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800/80 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-all duration-200 cursor-pointer"
          title="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
