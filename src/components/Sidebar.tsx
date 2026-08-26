'use client';

import React from 'react';
import { Users, Shield, Calendar, Sun, Moon, X, Trophy } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  stats?: {
    playersCount: number;
    teamsCount: number;
  };
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  isOpen,
  setIsOpen,
  stats = { playersCount: 0, teamsCount: 0 }
}: SidebarProps) {
  const menuItems = [
    { id: 'plantilla', label: 'Plantilla', icon: Users, badge: stats.playersCount > 0 ? stats.playersCount : undefined },
    { id: 'equipos', label: 'Equipos', icon: Shield, badge: stats.teamsCount > 0 ? stats.teamsCount : undefined },
    { id: 'partidos', label: 'Partidos', icon: Calendar, badge: 'PRO' },
  ];

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card text-foreground transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header/Brand logo */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary-blue text-white shadow-md overflow-hidden p-0">
              <Shield className="h-5 w-5 text-white/90" />
            </div>
            <div>
              <span className="font-sans text-lg font-extrabold tracking-wider bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
                CD VILLARALBO
              </span>
              <p className="text-[10px] font-semibold text-muted-text uppercase tracking-widest">
                Plan de Partido
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5 p-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/10 to-primary-blue/10 text-primary border-l-4 border-primary-blue shadow-sm'
                    : 'text-muted-text hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? 'text-primary-blue' : 'text-muted-text group-hover:text-foreground'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-primary-blue text-white'
                        : item.badge === 'PRO'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Area: Dark Mode switch and info */}
        <div className="p-4 border-t border-border">
          {/* Theme switcher card */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-slate-50/50 p-3.5 dark:bg-slate-900/30">
            <div className="flex items-center gap-2.5">
              {isDarkMode ? (
                <Moon className="h-4.5 w-4.5 text-primary" />
              ) : (
                <Sun className="h-4.5 w-4.5 text-amber-500" />
              )}
              <span className="text-xs font-semibold">
                {isDarkMode ? 'Modo Oscuro' : 'Modo Claro'}
              </span>
            </div>
            <button
              onClick={toggleDarkMode}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-200 transition-colors duration-200 ease-in-out focus:outline-none dark:bg-primary"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="mt-4 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-blue/10 text-primary-blue font-bold text-sm overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/satur-lopez.png" alt="Satur López" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-bold leading-none">Satur López</p>
              <span className="text-[10px] font-semibold text-muted-text">
                Director Técnico
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
