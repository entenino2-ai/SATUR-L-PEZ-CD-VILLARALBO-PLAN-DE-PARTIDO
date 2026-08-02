'use client';

import React, { useState, useEffect } from 'react';
import { Play, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Partido, InformeRival } from '../../lib/types';

interface InformeRivalTabProps {
  partido: Partido;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function InformeRivalTab({ partido, showToast }: InformeRivalTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [slidesUrl, setSlidesUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  
  // Tactical options
  const [salidaBalon, setSalidaBalon] = useState<'En corto' | 'En largo' | 'Mixto' | ''>('');
  const [presion, setPresion] = useState<'Alta' | 'Media' | 'Baja' | ''>('');
  const [bloque, setBloque] = useState<'Alto' | 'Medio' | 'Bajo' | ''>('');
  const [lineaDefensiva, setLineaDefensiva] = useState<'Alta' | 'Media' | 'Baja' | ''>('');
  const [transicionOfensiva, setTransicionOfensiva] = useState<'Directa' | 'Posesión' | ''>('');
  const [transicionDefensiva, setTransicionDefensiva] = useState<'Presión Inmediata' | 'Repliegue' | ''>('');

  // Fetch existing report
  useEffect(() => {
    const fetchInforme = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('informes_rival')
          .select('*')
          .eq('partido_id', partido.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is code for no rows found

        if (data) {
          setSlidesUrl(data.slides_url || '');
          setVideoUrl(data.video_url || '');
          
          const char = data.caracteristicas || {};
          setSalidaBalon(char.salida_balon || '');
          setPresion(char.presion || '');
          setBloque(char.bloque || '');
          setLineaDefensiva(char.linea_defensiva || '');
          setTransicionOfensiva(char.transicion_ofensiva || '');
          setTransicionDefensiva(char.transicion_defensiva || '');
        }
      } catch (err: any) {
        console.error('Error fetching rival report:', err);
        showToast('Error al cargar informe del rival: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInforme();
  }, [partido.id, showToast]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const caracteristicas = {
        salida_balon: salidaBalon,
        presion: presion,
        bloque: bloque,
        linea_defensiva: lineaDefensiva,
        transicion_ofensiva: transicionOfensiva,
        transicion_defensiva: transicionDefensiva
      };

      // Upsert: update or insert
      const { error } = await supabase
        .from('informes_rival')
        .upsert({
          partido_id: partido.id,
          slides_url: slidesUrl,
          video_url: videoUrl,
          caracteristicas
        });

      if (error) throw error;
      showToast('Informe del rival guardado correctamente', 'success');
    } catch (err: any) {
      console.error('Error saving rival report:', err);
      showToast('Error al guardar informe: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Convert Google Slides URL to embeddable link
  const getEmbedSlidesUrl = (url: string) => {
    if (!url) return '';
    try {
      let embedUrl = url;
      // If it contains /pub, we can replace html with embed
      if (embedUrl.includes('/pub?')) {
        embedUrl = embedUrl.replace('/pub?', '/embed?');
      } else if (embedUrl.includes('/edit')) {
        embedUrl = embedUrl.split('/edit')[0] + '/embed';
      }
      return embedUrl;
    } catch {
      return url;
    }
  };

  // Convert Youtube/Vimeo to embeddable link
  const getEmbedVideoUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return `https://www.youtube.com/embed/${urlParams.get('v')}`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('vimeo.com/')) {
        // Handle standard vimeo.com/123456789 or player.vimeo.com/video/123456789
        const id = url.split('vimeo.com/')[1]?.split('?')[0];
        return `https://player.vimeo.com/video/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary-purple" />
        <p className="text-xs font-bold text-muted-text">Cargando informe del rival...</p>
      </div>
    );
  }

  const embedSlides = getEmbedSlidesUrl(slidesUrl);
  const embedVideo = getEmbedVideoUrl(videoUrl);

  return (
    <div className="space-y-6">
      {/* Save action header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase text-foreground">Características del Rival</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-purple to-primary-red px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:from-primary-purple/95 hover:to-primary-red/95 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Guardar Informe</span>
        </button>
      </div>

      {/* Row categories */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        {/* Salida Balon */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="rounded-lg bg-primary-red px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white text-center w-full sm:w-44 shrink-0">
            Salida de Balón
          </span>
          <div className="flex flex-wrap gap-2">
            {(['En corto', 'En largo', 'Mixto'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSalidaBalon(salidaBalon === option ? '' : option)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                  salidaBalon === option
                    ? 'bg-primary-red border-primary-red text-white'
                    : 'bg-background border-border text-muted-text hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground'
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Presion */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="rounded-lg bg-primary-red px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white text-center w-full sm:w-44 shrink-0">
            Presión
          </span>
          <div className="flex flex-wrap gap-2">
            {(['Alta', 'Media', 'Baja'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setPresion(presion === option ? '' : option)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                  presion === option
                    ? 'bg-primary-red border-primary-red text-white'
                    : 'bg-background border-border text-muted-text hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground'
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Bloque */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="rounded-lg bg-primary-red px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white text-center w-full sm:w-44 shrink-0">
            Bloque
          </span>
          <div className="flex flex-wrap gap-2">
            {(['Alto', 'Medio', 'Bajo'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setBloque(bloque === option ? '' : option)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                  bloque === option
                    ? 'bg-primary-red border-primary-red text-white'
                    : 'bg-background border-border text-muted-text hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground'
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Linea Defensiva */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="rounded-lg bg-primary-red px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white text-center w-full sm:w-44 shrink-0">
            Línea Defensiva
          </span>
          <div className="flex flex-wrap gap-2">
            {(['Alta', 'Media', 'Baja'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setLineaDefensiva(lineaDefensiva === option ? '' : option)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                  lineaDefensiva === option
                    ? 'bg-primary-red border-primary-red text-white'
                    : 'bg-background border-border text-muted-text hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground'
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Transicion Ofensiva */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="rounded-lg bg-primary-red px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white text-center w-full sm:w-44 shrink-0">
            Transición Ofensiva
          </span>
          <div className="flex flex-wrap gap-2">
            {(['Directa', 'Posesión'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setTransicionOfensiva(transicionOfensiva === option ? '' : option)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                  transicionOfensiva === option
                    ? 'bg-primary-red border-primary-red text-white'
                    : 'bg-background border-border text-muted-text hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground'
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Transicion Defensiva */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="rounded-lg bg-primary-red px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white text-center w-full sm:w-44 shrink-0">
            Transición Defensiva
          </span>
          <div className="flex flex-wrap gap-2">
            {(['Presión Inmediata', 'Repliegue'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setTransicionDefensiva(transicionDefensiva === option ? '' : option)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                  transicionDefensiva === option
                    ? 'bg-primary-red border-primary-red text-white'
                    : 'bg-background border-border text-muted-text hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground'
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inputs of documents / presentation / video */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Google Slides Column */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
              📊 Presentación Google Slides
            </label>
            <input
              type="text"
              placeholder="Pega el enlace de Google Slides (compartir > publicar)..."
              value={slidesUrl}
              onChange={(e) => setSlidesUrl(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary-purple transition-all"
            />
          </div>

          <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl border border-border bg-slate-50 dark:bg-slate-900/10">
            {embedSlides ? (
              <iframe
                src={embedSlides}
                className="h-full w-full border-none"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <p className="text-center text-xs font-semibold text-muted-text px-6 leading-relaxed">
                Introduce el enlace de Google Slides para previsualizarlo aquí.
              </p>
            )}
          </div>
        </div>

        {/* Video Column */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
              🎬 Vídeo del Rival (YouTube/Vimeo)
            </label>
            <input
              type="text"
              placeholder="Pega el enlace de Vimeo o YouTube (ej. https://vimeo.com/...)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-primary-purple transition-all"
            />
          </div>

          <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl border border-border bg-slate-50 dark:bg-slate-900/10">
            {embedVideo ? (
              <iframe
                src={embedVideo}
                className="h-full w-full border-none"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <p className="text-center text-xs font-semibold text-muted-text px-6 leading-relaxed">
                Introduce el enlace de vídeo para previsualizarlo aquí.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
