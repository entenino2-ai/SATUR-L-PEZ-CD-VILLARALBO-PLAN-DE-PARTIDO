'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { Partido } from '../lib/types';
import InformeRivalTab from './tabs/InformeRivalTab';
import PlanPartidoTab from './tabs/PlanPartidoTab';
import ABPTab from './tabs/ABPTab';
import EventosPartidoTab from './tabs/EventosPartidoTab';
import AlineacionTab from './tabs/AlineacionTab';

interface PartidoDetailProps {
  partido: Partido;
  onBack: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function PartidoDetail({ partido, onBack, showToast }: PartidoDetailProps) {
  const [activeTab, setActiveTab] = useState<'informe' | 'alineacion' | 'plan' | 'abp' | 'eventos'>('informe');

  const local = partido.equipo_local;
  const visitante = partido.equipo_visitante;
  if (!local || !visitante) return null;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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

  // List of tabs matching the design
  const tabs = [
    { id: 'informe', label: 'Informe rival' },
    { id: 'alineacion', label: 'Alineación' },
    { id: 'plan', label: 'Plan de partido' },
    { id: 'abp', label: 'ABP' },
    { id: 'eventos', label: 'Eventos' }
  ] as const;

  return (
    <div className="space-y-6">
      
      {/* Volver al listado button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-extrabold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a Partidos</span>
      </button>

      {/* Match Info Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-text">
            <span className="uppercase tracking-wider">{partido.tipo}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" />{formatDate(partido.fecha)}</span>
            {partido.lugar && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" />{partido.lugar}</span>
              </>
            )}
          </div>
          
          <h2 className="text-xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
            <span>{local.nombre}</span>
            <span className="text-slate-400 font-extrabold text-sm normal-case">vs</span>
            <span>{visitante.nombre}</span>
          </h2>
        </div>

        {/* Small Visual Shields display */}
        <div className="flex items-center gap-2">
          {/* Local */}
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-slate-50 dark:bg-slate-900/30 p-1.5 shadow-inner">
            {local.escudo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={local.escudo_url} alt={local.nombre} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-primary/10 to-primary-blue/10 rounded-lg text-primary font-black text-[10px]">
                {getInitials(local.nombre)}
              </div>
            )}
          </div>
          <span className="text-xs font-black text-slate-400">VS</span>
          {/* Visitante */}
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-slate-50 dark:bg-slate-900/30 p-1.5 shadow-inner">
            {visitante.escudo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={visitante.escudo_url} alt={visitante.nombre} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-primary/10 to-primary-blue/10 rounded-lg text-primary font-black text-[10px]">
                {getInitials(visitante.nombre)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar rounded-2xl bg-slate-200/80 p-1.5 dark:bg-slate-900 border border-border shadow-inner w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-md font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render active tab */}
      <div className="mt-6">
        {activeTab === 'informe' && (
          <InformeRivalTab partido={partido} showToast={showToast} />
        )}
        
        {activeTab === 'plan' && (
          <PlanPartidoTab partido={partido} showToast={showToast} />
        )}

        {activeTab === 'abp' && (
          <ABPTab partido={partido} showToast={showToast} />
        )}

        {activeTab === 'eventos' && (
          <EventosPartidoTab partido={partido} showToast={showToast} />
        )}

        {activeTab === 'alineacion' && (
          <AlineacionTab partido={partido} showToast={showToast} />
        )}
      </div>

    </div>
  );
}
