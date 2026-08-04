import React, { useState } from 'react';
import { Sparkles, Loader2, Save, X } from 'lucide-react';

interface TacticalAIPanelProps {
  formacionLocal: string;
  formacionRival: string;
  partidoId: string;
  initialData: string | null;
  onSave: (data: string) => Promise<void>;
  onClose: () => void;
}

export default function TacticalAIPanel({
  formacionLocal,
  formacionRival,
  partidoId,
  initialData,
  onSave,
  onClose
}: TacticalAIPanelProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(initialData || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tactical-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formacionLocal,
          formacionRival,
          tipo: 'enfrentamiento'
        })
      });

      if (!res.ok) throw new Error('Error en el análisis IA');
      
      const data = await res.json();
      setContent(data.analysis);
    } catch (err: any) {
      console.warn('Error en TacticalAIPanel:', err);
      alert('Hubo un error al conectar con Gemini: ' + (err?.message || err?.toString() || 'Ha ocurrido un error inesperado'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(content);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right-full duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-slate-50 dark:bg-slate-900/50">
          <h3 className="flex items-center gap-2 text-sm font-black uppercase text-foreground">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Análisis Táctico IA
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-slate-50 dark:bg-slate-900/30 p-4 text-center">
            <p className="text-xs font-semibold text-muted-text mb-3">
              Enfrentamiento de Sistemas:
            </p>
            <div className="flex items-center justify-center gap-3 font-black text-lg">
              <span className="text-primary-red">{formacionLocal}</span>
              <span className="text-slate-400 text-sm">VS</span>
              <span className="text-primary-blue">{formacionRival}</span>
            </div>
          </div>

          {!content && !loading && (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-3 opacity-70">
              <Sparkles className="h-8 w-8 text-slate-400" />
              <p className="text-xs font-semibold text-slate-500 max-w-[200px]">
                Pulsa el botón inferior para que la IA genere el informe táctico del enfrentamiento.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 animate-pulse">
                Gemini está analizando los emparejamientos...
              </p>
            </div>
          )}

          {content && !loading && (
            <div className="flex flex-col h-full gap-2">
              <label className="text-[10px] font-black uppercase text-muted-text">
                INFORME GENERADO (MODIFICABLE)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full rounded-xl border border-border bg-background p-3 text-xs font-medium text-foreground outline-none focus:border-purple-500 resize-none min-h-[300px]"
                placeholder="El informe aparecerá aquí..."
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-2">
          {!content ? (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? 'Analizando...' : '✨ Analizar con IA'}
            </button>
          ) : (
            <>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground hover:bg-slate-100 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Regenerar Análisis
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-xs font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar Informe Táctico
              </button>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}
