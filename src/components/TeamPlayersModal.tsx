'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Loader2, User, Plus, Trash2, Edit2, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Equipo, JugadorEquipo, DemarcacionType } from '../lib/types';
import { uploadPlayerPhoto } from '../lib/storage';

interface TeamPlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Equipo | null;
}

const DEMARCACIONES: DemarcacionType[] = [
  'Portero',
  'Defensa Central',
  'Defensa Lateral',
  'Mediocentro',
  'Interior',
  'Extremo',
  'Mediapunta',
  'Delantero'
];

export default function TeamPlayersModal({ isOpen, onClose, team }: TeamPlayersModalProps) {
  const [players, setPlayers] = useState<JugadorEquipo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Partial<JugadorEquipo> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && team) {
      loadPlayers();
    } else {
      setPlayers([]);
      setIsEditing(false);
      setEditingPlayer(null);
    }
  }, [isOpen, team]);

  const loadPlayers = async () => {
    if (!team) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('jugadores_equipo')
        .select('*')
        .eq('equipo_id', team.id)
        .order('creado_en', { ascending: true });
        
      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error loading team players:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (player?: JugadorEquipo) => {
    setIsEditing(true);
    setPhotoFile(null);
    if (player) {
      setEditingPlayer(player);
      setPhotoPreview(player.foto_url);
    } else {
      setEditingPlayer({
        equipo_id: team?.id,
        nombre: '',
        demarcacion: 'Mediocentro',
        caracteristicas: '',
        foto_url: null
      });
      setPhotoPreview(null);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingPlayer(null);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer || !team) return;
    
    setIsSaving(true);
    try {
      let finalPhotoUrl = editingPlayer.foto_url;
      
      if (photoFile) {
        const photoUrl = await uploadPlayerPhoto(photoFile);
        if (photoUrl) {
          finalPhotoUrl = photoUrl;
        }
      }

      const playerData = {
        equipo_id: team.id,
        nombre: editingPlayer.nombre,
        demarcacion: editingPlayer.demarcacion,
        caracteristicas: editingPlayer.caracteristicas || '',
        foto_url: finalPhotoUrl
      };

      if (editingPlayer.id) {
        // Update
        const { error } = await supabase
          .from('jugadores_equipo')
          .update(playerData)
          .eq('id', editingPlayer.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('jugadores_equipo')
          .insert(playerData);
        if (error) throw error;
      }

      await loadPlayers();
      cancelEdit();
    } catch (error) {
      console.error('Error saving player:', error);
      alert('Error al guardar el jugador.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este jugador?')) return;
    try {
      const { error } = await supabase.from('jugadores_equipo').delete().eq('id', id);
      if (error) throw error;
      setPlayers(players.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Error al eliminar el jugador.');
    }
  };

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-card rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/20">
          <div>
            <h2 className="text-xl font-bold text-foreground">Jugadores de {team.nombre}</h2>
            <p className="text-sm text-muted-foreground mt-1">Gestiona la plantilla del equipo rival</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isEditing && editingPlayer ? (
            <form onSubmit={handleSave} className="space-y-6 max-w-2xl mx-auto">
              <div className="flex justify-center mb-6">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-dashed border-border group-hover:border-primary transition-colors bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <UploadCloud className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={editingPlayer.nombre || ''}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, nombre: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Nombre del jugador"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Demarcación *</label>
                  <select
                    required
                    value={editingPlayer.demarcacion}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, demarcacion: e.target.value as DemarcacionType })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {DEMARCACIONES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Características</label>
                <textarea
                  value={editingPlayer.caracteristicas || ''}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, caracteristicas: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none h-24"
                  placeholder="Diestro, rápido, buen remate de cabeza..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Guardar Jugador
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-muted-foreground">
                  {players.length} jugadores registrados
                </div>
                <button
                  onClick={() => startEdit()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-colors text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Añadir Jugador
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : players.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl bg-slate-50/50 dark:bg-slate-900/20">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-foreground font-medium">No hay jugadores registrados</p>
                  <p className="text-sm text-muted-foreground mt-1">Añade el primer jugador al equipo rival.</p>
                  <button
                    onClick={() => startEdit()}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Añadir Jugador
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {players.map(player => (
                    <div key={player.id} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
                      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                        {player.foto_url ? (
                          <img src={player.foto_url} alt={player.nombre} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            <User className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{player.nombre}</h4>
                        <p className="text-xs text-muted-foreground truncate">{player.demarcacion}</p>
                        {player.caracteristicas && (
                          <p className="text-xs text-foreground/70 mt-1 line-clamp-2" title={player.caracteristicas}>
                            {player.caracteristicas}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEdit(player)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(player.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
