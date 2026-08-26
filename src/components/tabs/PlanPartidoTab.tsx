'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Upload, Trash2, Globe, Video, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../lib/storage';
import { Partido, PlanPartido } from '../../lib/types';

interface PlanPartidoTabProps {
  partido: Partido;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface BlockState {
  notes: string;
  video: string;
  docUrl: string;
  imgs: string[];
}

export default function PlanPartidoTab({ partido, showToast }: PlanPartidoTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Block states
  const [ataque, setAtaque] = useState<BlockState>({ notes: '', video: '', docUrl: '', imgs: [] });
  const [defensa, setDefensa] = useState<BlockState>({ notes: '', video: '', docUrl: '', imgs: [] });
  const [transiciones, setTransiciones] = useState<BlockState>({ notes: '', video: '', docUrl: '', imgs: [] });

  // Loading state for individual image uploads
  const [uploadingImage, setUploadingImage] = useState<{ [key: string]: boolean }>({});

  // Fetch plan from Supabase
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('planes_partido')
          .select('*')
          .eq('partido_id', partido.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          // Parse notes and docUrl
          const parseTextAndDoc = (rawText: string | null) => {
            if (!rawText) return { notes: '', docUrl: '' };
            const parts = rawText.split('|||');
            return {
              notes: parts[0] || '',
              docUrl: parts[1] || ''
            };
          };

          const atQ = parseTextAndDoc(data.ataque_texto);
          const dfS = parseTextAndDoc(data.defensa_texto);
          const trN = parseTextAndDoc(data.transiciones_texto);

          setAtaque({
            notes: atQ.notes,
            docUrl: atQ.docUrl,
            video: data.ataque_video || '',
            imgs: data.ataque_imgs || []
          });

          setDefensa({
            notes: dfS.notes,
            docUrl: dfS.docUrl,
            video: data.defensa_video || '',
            imgs: data.defensa_imgs || []
          });

          setTransiciones({
            notes: trN.notes,
            docUrl: trN.docUrl,
            video: data.transiciones_video || '',
            imgs: data.transiciones_imgs || []
          });
        }
      } catch (err: any) {
        console.error('Error fetching plan:', err);
        showToast('Error al cargar plan de partido: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [partido.id, showToast]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Serialize text and doc
      const buildText = (notes: string, docUrl: string) => `${notes}|||${docUrl}`;

      const { error } = await supabase
        .from('planes_partido')
        .upsert({
          partido_id: partido.id,
          ataque_texto: buildText(ataque.notes, ataque.docUrl),
          ataque_video: ataque.video,
          ataque_imgs: ataque.imgs,
          
          defensa_texto: buildText(defensa.notes, defensa.docUrl),
          defensa_video: defensa.video,
          defensa_imgs: defensa.imgs,
          
          transiciones_texto: buildText(transiciones.notes, transiciones.docUrl),
          transiciones_video: transiciones.video,
          transiciones_imgs: transiciones.imgs
        });

      if (error) throw error;
      showToast('Plan de partido guardado correctamente', 'success');
    } catch (err: any) {
      console.error('Error saving plan:', err);
      showToast('Error al guardar plan: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (blockKey: 'ataque' | 'defensa' | 'transiciones', index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const blockState = blockKey === 'ataque' ? ataque : blockKey === 'defensa' ? defensa : transiciones;
    const setBlockState = blockKey === 'ataque' ? setAtaque : blockKey === 'defensa' ? setDefensa : setTransiciones;
    const uploadKey = `${blockKey}_${index}`;

    try {
      setUploadingImage(prev => ({ ...prev, [uploadKey]: true }));
      // Upload directly to FOTOS ESCUDOS bucket since it is public
      const publicUrl = await uploadImage('FOTOS ESCUDOS', file);
      
      const newImgs = [...blockState.imgs];
      newImgs[index] = publicUrl;

      setBlockState(prev => ({
        ...prev,
        imgs: newImgs
      }));
      showToast('Imagen subida correctamente', 'success');
    } catch (err: any) {
      console.error('Error uploading image:', err);
      showToast('Error al subir imagen: ' + err.message, 'error');
    } finally {
      setUploadingImage(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleImageDelete = (blockKey: 'ataque' | 'defensa' | 'transiciones', index: number) => {
    const blockState = blockKey === 'ataque' ? ataque : blockKey === 'defensa' ? defensa : transiciones;
    const setBlockState = blockKey === 'ataque' ? setAtaque : blockKey === 'defensa' ? setDefensa : setTransiciones;

    const newImgs = [...blockState.imgs];
    newImgs.splice(index, 1); // remove image

    setBlockState(prev => ({
      ...prev,
      imgs: newImgs
    }));
    showToast('Imagen eliminada de la lista', 'success');
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold text-muted-text">Cargando plan de juego...</p>
      </div>
    );
  }

  const renderBlock = (
    title: string,
    icon: string,
    state: BlockState,
    setState: React.Dispatch<React.SetStateAction<BlockState>>,
    key: 'ataque' | 'defensa' | 'transiciones'
  ) => {
    return (
      <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        {/* Header Block */}
        <div className="flex items-center gap-2 pb-2 border-b border-border/60">
          <span className="text-lg">{icon}</span>
          <div>
            <span className="text-[10px] font-black text-muted-text uppercase block leading-none">BLOQUE</span>
            <h4 className="text-xs font-black uppercase text-foreground">{title}</h4>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-muted-text uppercase block">Notas abiertas</label>
          <textarea
            rows={4}
            value={state.notes}
            onChange={(e) => setState(prev => ({ ...prev, notes: e.target.value }))}
            placeholder={`Escribe tu análisis de ${title.toLowerCase()}...`}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary resize-none transition-all"
          />
        </div>

        {/* Video specific URL */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-muted-text uppercase block">Video específico (Vimeo/YouTube)</label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={state.video}
              onChange={(e) => setState(prev => ({ ...prev, video: e.target.value }))}
              placeholder="https://vimeo.com/... o youtube.com/..."
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3.5 text-xs font-semibold outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Image Slots (up to 2 as per the screenshots) */}
        {[0, 1].map((imgIndex) => {
          const imgUrl = state.imgs[imgIndex];
          const uploadKey = `${key}_${imgIndex}`;
          const isUploading = uploadingImage[uploadKey];

          return (
            <div key={imgIndex} className="space-y-1">
              <label className="text-[9px] font-black text-muted-text uppercase block">Imagen {imgIndex + 1}</label>
              {imgUrl ? (
                /* Display uploaded image preview */
                <div className="relative rounded-xl border border-border bg-slate-50 dark:bg-slate-900/30 overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt={`Táctica ${title} ${imgIndex + 1}`} className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleImageDelete(key, imgIndex)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-rose-600 shadow-md hover:bg-rose-50 hover:scale-105 transition-all"
                      title="Eliminar Imagen"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Select file button */
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(key, imgIndex, e)}
                    className="hidden"
                    id={`file_input_${key}_${imgIndex}`}
                    disabled={isUploading}
                  />
                  <label
                    htmlFor={`file_input_${key}_${imgIndex}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-slate-50/50 hover:bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 dark:bg-slate-800/20 dark:text-slate-300 dark:hover:bg-slate-850 cursor-pointer shadow-sm transition-all"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <Upload className="h-4 w-4 text-slate-400" />
                    )}
                    <span>{isUploading ? 'Subiendo...' : `Subir Imagen ${imgIndex + 1}`}</span>
                  </label>
                </div>
              )}
            </div>
          );
        })}

        {/* Document (PDF in Google Drive) URL */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-muted-text uppercase block">Documento (PDF en Google Drive)</label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={state.docUrl}
              onChange={(e) => setState(prev => ({ ...prev, docUrl: e.target.value }))}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3.5 text-xs font-semibold outline-none focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Save action header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase text-foreground">Planes por Fase de Juego</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary-blue px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:from-primary/95 hover:to-primary-blue/95 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Guardar plan</span>
        </button>
      </div>

      {/* 3 Columns Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {renderBlock('Ataque', '⚽', ataque, setAtaque, 'ataque')}
        {renderBlock('Defensa', '🛡️', defensa, setDefensa, 'defensa')}
        {renderBlock('Transiciones', '⚡', transiciones, setTransiciones, 'transiciones')}
      </div>
    </div>
  );
}
