'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Upload, Trash2, Video, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/storage';
import { Partido, ABP } from '../../lib/types';

interface ABPTabProps {
  partido: Partido;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface JugadaState {
  img: string;
  detail: string;
  video: string;
}

interface CornerState {
  jugada1: JugadaState;
  jugada2: JugadaState;
}

// Initial state for one corner
const createEmptyCorner = (): CornerState => ({
  jugada1: { img: '', detail: '', video: '' },
  jugada2: { img: '', detail: '', video: '' }
});

export default function ABPTab({ partido, showToast }: ABPTabProps) {
  const [tipo, setTipo] = useState<'Ofensivo' | 'Defensivo'>('Ofensivo');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 4 corners state
  const [corners, setCorners] = useState<{ [key: number]: CornerState }>({
    1: createEmptyCorner(),
    2: createEmptyCorner(),
    3: createEmptyCorner(),
    4: createEmptyCorner()
  });

  // Track uploading state for each corner image slot
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  // Fetch corners from Supabase whenever type (Ofensivo/Defensivo) changes
  useEffect(() => {
    const fetchABP = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('abp')
          .select('*')
          .eq('partido_id', partido.id)
          .eq('tipo', tipo);

        if (error) throw error;

        // Reset state to empty first
        const freshCorners: { [key: number]: CornerState } = {
          1: createEmptyCorner(),
          2: createEmptyCorner(),
          3: createEmptyCorner(),
          4: createEmptyCorner()
        };

        if (data && data.length > 0) {
          data.forEach((row: ABP) => {
            const num = row.numero_corner;
            if (num >= 1 && num <= 4) {
              const imgs = (row.imagen_url || '').split('|||');
              const details = (row.detalle_texto || '').split('|||');
              const videos = (row.video_url || '').split('|||');

              freshCorners[num] = {
                jugada1: {
                  img: imgs[0] || '',
                  detail: details[0] || '',
                  video: videos[0] || ''
                },
                jugada2: {
                  img: imgs[1] || '',
                  detail: details[1] || '',
                  video: videos[1] || ''
                }
              };
            }
          });
        }
        setCorners(freshCorners);
      } catch (err: any) {
        console.error('Error fetching ABP data:', err);
        showToast('Error al cargar ABP: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchABP();
  }, [partido.id, tipo, showToast]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const promises = [1, 2, 3, 4].map(async (num) => {
        const corner = corners[num];
        const imagen_url = `${corner.jugada1.img}|||${corner.jugada2.img}`;
        const detalle_texto = `${corner.jugada1.detail}|||${corner.jugada2.detail}`;
        const video_url = `${corner.jugada1.video}|||${corner.jugada2.video}`;

        return supabase
          .from('abp')
          .upsert({
            partido_id: partido.id,
            tipo,
            numero_corner: num,
            imagen_url,
            detalle_texto,
            video_url
          }, {
            onConflict: 'partido_id,tipo,numero_corner'
          });
      });

      const results = await Promise.all(promises);
      const err = results.find(r => r.error);
      if (err) throw err.error;

      showToast(`ABP ${tipo === 'Ofensivo' ? 'Ofensivos' : 'Defensivos'} guardados correctamente`, 'success');
    } catch (err: any) {
      console.error('Error saving ABP:', err);
      showToast('Error al guardar ABP: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (cornerNum: number, jugadaKey: 'jugada1' | 'jugada2', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadKey = `${cornerNum}_${jugadaKey}`;

    try {
      setUploading(prev => ({ ...prev, [uploadKey]: true }));
      // Upload directly to public FOTOS ESCUDOS bucket
      const publicUrl = await uploadImage('FOTOS ESCUDOS', file);

      setCorners(prev => {
        const corner = prev[cornerNum];
        return {
          ...prev,
          [cornerNum]: {
            ...corner,
            [jugadaKey]: {
              ...corner[jugadaKey],
              img: publicUrl
            }
          }
        };
      });

      showToast(`Esquema para Córner ${cornerNum} subido con éxito`, 'success');
    } catch (err: any) {
      console.error('Error uploading ABP image:', err);
      showToast('Error al subir imagen: ' + err.message, 'error');
    } finally {
      setUploading(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleImageDelete = (cornerNum: number, jugadaKey: 'jugada1' | 'jugada2') => {
    setCorners(prev => {
      const corner = prev[cornerNum];
      return {
        ...prev,
        [cornerNum]: {
          ...corner,
          [jugadaKey]: {
            ...corner[jugadaKey],
            img: ''
          }
        }
      };
    });
    showToast('Imagen eliminada de la jugada', 'success');
  };

  const handleFieldChange = (
    cornerNum: number,
    jugadaKey: 'jugada1' | 'jugada2',
    field: 'detail' | 'video',
    value: string
  ) => {
    setCorners(prev => {
      const corner = prev[cornerNum];
      return {
        ...prev,
        [cornerNum]: {
          ...corner,
          [jugadaKey]: {
            ...corner[jugadaKey],
            [field]: value
          }
        }
      };
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold text-muted-text">Cargando pizarra de ABP...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Central Toggle selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Toggle Ofensivo / Defensivo */}
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900 mx-auto sm:mx-0 w-fit">
          <button
            onClick={() => setTipo('Ofensivo')}
            className={`rounded-lg px-6 py-2 text-xs font-black transition-all ${
              tipo === 'Ofensivo'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-muted-text hover:text-foreground'
            }`}
          >
            OFENSIVO
          </button>
          <button
            onClick={() => setTipo('Defensivo')}
            className={`rounded-lg px-6 py-2 text-xs font-black transition-all ${
              tipo === 'Defensivo'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-muted-text hover:text-foreground'
            }`}
          >
            DEFENSIVO
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-blue px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:from-primary/95 hover:to-primary-blue/95 transition-all cursor-pointer disabled:opacity-50 mx-auto sm:mx-0 w-full sm:w-auto"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Guardar ABP ({tipo})</span>
        </button>
      </div>

      {/* Grid corners */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((num) => {
          const corner = corners[num];

          return (
            <div
              key={num}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950 p-4.5 text-slate-100 shadow-md space-y-4"
            >
              {/* Corner Header */}
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <span className="text-[10px] font-black text-primary-blue uppercase tracking-wider">CÓRNERS {tipo.toUpperCase()}</span>
                <h4 className="text-xs font-black text-slate-300 uppercase">CÓRNER {num}</h4>
              </div>

              {/* JUGADA 1 */}
              <div className="space-y-3.5 border-b border-slate-900 pb-4">
                <span className="text-[9px] font-extrabold text-slate-400 block tracking-widest uppercase">JUGADA PRINCIPAL</span>
                
                {/* File upload */}
                {corner.jugada1.img ? (
                  <div className="relative rounded-xl border border-slate-800 bg-slate-900 overflow-hidden group h-24">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={corner.jugada1.img} alt={`Esquema Córner ${num} 1`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleImageDelete(num, 'jugada1')}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-rose-600 shadow hover:bg-rose-50 hover:scale-105 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(num, 'jugada1', e)}
                      className="hidden"
                      id={`file_abp_${num}_jugada1`}
                      disabled={uploading[`${num}_jugada1`]}
                    />
                    <label
                      htmlFor={`file_abp_${num}_jugada1`}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-350 cursor-pointer transition-all"
                    >
                      {uploading[`${num}_jugada1`] ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      ) : (
                        <Upload className="h-3.5 w-3.5 text-slate-500" />
                      )}
                      <span>{uploading[`${num}_jugada1`] ? 'Subiendo...' : 'Seleccionar archivo'}</span>
                    </label>
                  </div>
                )}

                {/* Detail textarea */}
                <textarea
                  rows={2}
                  value={corner.jugada1.detail}
                  onChange={(e) => handleFieldChange(num, 'jugada1', 'detail', e.target.value)}
                  placeholder="Detalle imagen 1..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-200 placeholder:text-slate-600 outline-none focus:border-primary-blue resize-none transition-all"
                />

                {/* Video URL input */}
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                  <input
                    type="text"
                    value={corner.jugada1.video}
                    onChange={(e) => handleFieldChange(num, 'jugada1', 'video', e.target.value)}
                    placeholder="URL Vimeo imagen 1..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-200 placeholder:text-slate-600 outline-none focus:border-primary-blue transition-all"
                  />
                </div>
              </div>

              {/* JUGADA 2 */}
              <div className="space-y-3.5">
                <span className="text-[9px] font-extrabold text-slate-400 block tracking-widest uppercase">JUGADA ALTERNATIVA</span>
                
                {/* File upload */}
                {corner.jugada2.img ? (
                  <div className="relative rounded-xl border border-slate-800 bg-slate-900 overflow-hidden group h-24">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={corner.jugada2.img} alt={`Esquema Córner ${num} 2`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleImageDelete(num, 'jugada2')}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-rose-600 shadow hover:bg-rose-50 hover:scale-105 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(num, 'jugada2', e)}
                      className="hidden"
                      id={`file_abp_${num}_jugada2`}
                      disabled={uploading[`${num}_jugada2`]}
                    />
                    <label
                      htmlFor={`file_abp_${num}_jugada2`}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-350 cursor-pointer transition-all"
                    >
                      {uploading[`${num}_jugada2`] ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      ) : (
                        <Upload className="h-3.5 w-3.5 text-slate-500" />
                      )}
                      <span>{uploading[`${num}_jugada2`] ? 'Subiendo...' : 'Seleccionar archivo'}</span>
                    </label>
                  </div>
                )}

                {/* Detail textarea */}
                <textarea
                  rows={2}
                  value={corner.jugada2.detail}
                  onChange={(e) => handleFieldChange(num, 'jugada2', 'detail', e.target.value)}
                  placeholder="Detalle imagen 2..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs font-semibold text-slate-200 placeholder:text-slate-600 outline-none focus:border-primary-blue resize-none transition-all"
                />

                {/* Video URL input */}
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
                  <input
                    type="text"
                    value={corner.jugada2.video}
                    onChange={(e) => handleFieldChange(num, 'jugada2', 'video', e.target.value)}
                    placeholder="URL Vimeo imagen 2..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-200 placeholder:text-slate-600 outline-none focus:border-primary-blue transition-all"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
