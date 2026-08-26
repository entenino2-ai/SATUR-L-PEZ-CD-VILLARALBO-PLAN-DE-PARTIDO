'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Loader2, Shield, ShieldAlert } from 'lucide-react';
import { Equipo } from '../lib/types';
import { uploadTeamShield } from '../lib/storage';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Equipo | null;
  onSave: (teamData: Omit<Equipo, 'id' | 'creado_en'> & { id?: string }) => Promise<void>;
}

export default function TeamModal({ isOpen, onClose, team, onSave }: TeamModalProps) {
  const [nombre, setNombre] = useState('');
  const [escudoUrl, setEscudoUrl] = useState<string | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load team data if editing
  useEffect(() => {
    if (team) {
      setNombre(team.nombre);
      setEscudoUrl(team.escudo_url);
      setPreviewUrl(team.escudo_url);
    } else {
      // Reset form
      setNombre('');
      setEscudoUrl(null);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setError(null);
  }, [team, isOpen]);

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
      setError('El nombre del equipo es obligatorio.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      let uploadedUrl = escudoUrl;

      // 1. Upload crest directly to Supabase storage if selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          uploadedUrl = await uploadTeamShield(selectedFile);
        } catch (uploadErr: any) {
          setError(uploadErr.message || 'Error al subir el escudo a Supabase Storage.');
          setIsUploading(false);
          setIsSaving(false);
          return;
        }
        setIsUploading(false);
      }

      // 2. Call save callback
      await onSave({
        ...(team?.id ? { id: team.id } : {}),
        nombre: nombre.trim(),
        escudo_url: uploadedUrl,
      });

      onClose();
    } catch (saveErr: any) {
      console.error('Error saving team:', saveErr);
      setError(saveErr.message || 'Error al guardar el equipo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl transition-all">
        {/* Decorative Top Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary-blue to-primary-blue" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-extrabold sm:text-lg">
            {team ? 'Editar Equipo' : 'Añadir Nuevo Equipo'}
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

          {/* Escudo upload and Preview */}
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-slate-50 dark:bg-slate-900/30 p-2 shadow-inner">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Vista previa escudo" className="h-full w-full object-contain" />
              ) : (
                <Shield className="h-9 w-9 text-muted-text/40" />
              )}
              {(isUploading || isSaving) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <span className="text-xs font-bold text-muted-text block mb-1">ESCUDO DEL EQUIPO</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isSaving}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                <UploadCloud className="h-4 w-4" />
                {previewUrl ? 'Cambiar Escudo' : 'Subir Escudo'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <p className="mt-1.5 text-[10px] font-semibold text-muted-text">
                JPG, PNG, WEBP, SVG. Máx: 5MB.
              </p>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="text-xs font-extrabold text-muted-text uppercase block mb-1.5">
              Nombre del Equipo / Club *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. CD Villaralbo B"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={isSaving}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
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
                <span>Guardar Equipo</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
