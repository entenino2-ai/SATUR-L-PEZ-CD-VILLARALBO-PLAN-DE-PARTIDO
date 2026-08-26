'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Loader2, Calendar, User, Activity, ShieldAlert } from 'lucide-react';
import { Jugador, DemarcacionType } from '../lib/types';
import { uploadPlayerPhoto } from '../lib/storage';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Jugador | null;
  onSave: (playerData: Omit<Jugador, 'id' | 'creado_en'> & { id?: string }) => Promise<void>;
}

const DEMARCACIONES: DemarcacionType[] = [
  'Portero',
  'Defensa Central',
  'Defensa Lateral',
  'Mediocentro',
  'Interior',
  'Extremo',
  'Mediapunta',
  'Delantero',
];

export default function PlayerModal({ isOpen, onClose, player, onSave }: PlayerModalProps) {
  const [nombre, setNombre] = useState('');
  const [dorsal, setDorsal] = useState<number | ''>('');
  const [demarcacion, setDemarcacion] = useState<DemarcacionType>('Portero');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [forma, setForma] = useState(100);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load player data if editing
  useEffect(() => {
    if (player) {
      setNombre(player.nombre);
      setDorsal(player.dorsal !== null ? player.dorsal : '');
      setDemarcacion(player.demarcacion);
      // Format date to YYYY-MM-DD for date inputs
      try {
        const date = new Date(player.fecha_nacimiento);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        setFechaNacimiento(`${yyyy}-${mm}-${dd}`);
      } catch {
        setFechaNacimiento('');
      }
      setForma(player.forma);
      setFotoUrl(player.foto_url);
      setPreviewUrl(player.foto_url);
    } else {
      // Reset form for addition
      setNombre('');
      setDorsal('');
      setDemarcacion('Portero');
      setFechaNacimiento('');
      setForma(100);
      setFotoUrl(null);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setError(null);
  }, [player, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo supera el tamaño máximo permitido de 5MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre del jugador es obligatorio.');
      return;
    }
    if (!fechaNacimiento) {
      setError('La fecha de nacimiento es obligatoria.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      let uploadedUrl = fotoUrl;

      // 1. Upload photo directly to Supabase storage if a new one is selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          uploadedUrl = await uploadPlayerPhoto(selectedFile);
        } catch (uploadErr: any) {
          setError(uploadErr.message || 'Error al subir la foto a Supabase Storage.');
          setIsUploading(false);
          setIsSaving(false);
          return;
        }
        setIsUploading(false);
      }

      // 2. Format final data
      const finalDorsal = dorsal === '' ? null : Number(dorsal);

      await onSave({
        ...(player?.id ? { id: player.id } : {}),
        nombre: nombre.trim(),
        dorsal: finalDorsal,
        demarcacion,
        fecha_nacimiento: fechaNacimiento,
        foto_url: uploadedUrl,
        forma,
      });

      onClose();
    } catch (saveErr: any) {
      console.error('Error saving player:', saveErr);
      setError(saveErr.message || 'Error al guardar el jugador.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl transition-all">
        {/* Decorative Top Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-blue to-primary" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-extrabold sm:text-lg">
            {player ? 'Editar Jugador' : 'Añadir Nuevo Jugador'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background text-muted-text hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs font-bold text-primary-blue">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo upload and Preview */}
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-slate-50 dark:bg-slate-900/30">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Vista previa" className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-muted-text/50" />
              )}
              {(isUploading || isSaving) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <span className="text-xs font-bold text-muted-text block mb-1">FOTO DEL JUGADOR</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isSaving}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                <UploadCloud className="h-4 w-4" />
                {previewUrl ? 'Cambiar Foto' : 'Subir Foto'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <p className="mt-1.5 text-[10px] font-semibold text-muted-text">
                Formatos soportados: JPG, PNG, WEBP. Máx: 5MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Nombre */}
            <div className="sm:col-span-2">
              <label className="text-xs font-extrabold text-muted-text uppercase block mb-1.5">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Satur López"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={isSaving}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Dorsal */}
            <div>
              <label className="text-xs font-extrabold text-muted-text uppercase block mb-1.5">
                Dorsal
              </label>
              <input
                type="number"
                min="1"
                max="99"
                placeholder="Ej. 10"
                value={dorsal}
                onChange={(e) => setDorsal(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={isSaving}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Demarcacion */}
            <div>
              <label className="text-xs font-extrabold text-muted-text uppercase block mb-1.5">
                Demarcación *
              </label>
              <select
                value={demarcacion}
                onChange={(e) => setDemarcacion(e.target.value as DemarcacionType)}
                disabled={isSaving}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {DEMARCACIONES.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Nacimiento */}
            <div className="sm:col-span-2">
              <label className="text-xs font-extrabold text-muted-text uppercase block mb-1.5">
                Fecha de Nacimiento *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  disabled={isSaving}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Forma Fisiológica (%) */}
            <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-900/30 border border-border/60 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-extrabold text-muted-text uppercase mb-2">
                <span className="flex items-center gap-1">
                  <Activity className="h-4 w-4 text-primary-blue" /> Estado de Forma (%)
                </span>
                <span className="text-sm text-primary font-black">{forma}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={forma}
                onChange={(e) => setForma(Number(e.target.value))}
                disabled={isSaving}
                className="h-2 w-full cursor-pointer rounded-full bg-slate-200 accent-primary dark:bg-slate-800"
              />
              <div className="flex justify-between text-[10px] font-semibold text-muted-text mt-1.5">
                <span>0% Lesionado / Inactivo</span>
                <span>100% Óptimo</span>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-border bg-background px-5 py-3 text-xs font-bold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-blue px-6 py-3 text-xs font-bold text-white shadow-md hover:from-primary/95 hover:to-primary-blue/95 cursor-pointer disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar Jugador</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
