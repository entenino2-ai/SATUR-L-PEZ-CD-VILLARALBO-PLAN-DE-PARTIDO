import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  MousePointer, 
  MoveRight, 
  CornerDownRight, 
  Activity, 
  Square, 
  Disc, 
  PenTool, 
  Type, 
  Undo2, 
  Trash2,
  Layers
} from 'lucide-react';
import { DibujoPizarra } from '../../../lib/types';

export interface FormationNode {
  id: string; // unique ID for the position (e.g., 'local-1', 'rival-1')
  x: number;  // 0-100 percentage
  y: number;  // 0-100 percentage
  role: string;
}

// Tactical formations when confronting two teams (Dual mode: calibrated so opposing lines NEVER overlap)
const FORMATIONS_DUAL: Record<string, { x: number; y: number; role: string }[]> = {
  '4-3-3': [
    { x: 50, y: 93, role: 'POR' },
    { x: 14, y: 81, role: 'LI' },
    { x: 36, y: 81, role: 'DFC' },
    { x: 64, y: 81, role: 'DFC' },
    { x: 86, y: 81, role: 'LD' },
    { x: 50, y: 69, role: 'MCD' },
    { x: 28, y: 62, role: 'MC' },
    { x: 72, y: 62, role: 'MC' },
    { x: 14, y: 46, role: 'EI' },
    { x: 50, y: 44, role: 'DC' },
    { x: 86, y: 46, role: 'ED' },
  ],
  '4-4-2': [
    { x: 50, y: 93, role: 'POR' },
    { x: 14, y: 81, role: 'LI' },
    { x: 36, y: 81, role: 'DFC' },
    { x: 64, y: 81, role: 'DFC' },
    { x: 86, y: 81, role: 'LD' },
    { x: 14, y: 66, role: 'MI' },
    { x: 36, y: 67, role: 'MC' },
    { x: 64, y: 67, role: 'MC' },
    { x: 86, y: 66, role: 'MD' },
    { x: 38, y: 46, role: 'DC' },
    { x: 62, y: 46, role: 'DC' },
  ],
  '4-2-3-1': [
    { x: 50, y: 93, role: 'POR' },
    { x: 14, y: 81, role: 'LI' },
    { x: 36, y: 81, role: 'DFC' },
    { x: 64, y: 81, role: 'DFC' },
    { x: 86, y: 81, role: 'LD' },
    { x: 35, y: 70, role: 'MCD' },
    { x: 65, y: 70, role: 'MCD' },
    { x: 14, y: 56, role: 'MI' },
    { x: 50, y: 56, role: 'MCO' },
    { x: 86, y: 56, role: 'MD' },
    { x: 50, y: 44, role: 'DC' },
  ],
  '5-3-2': [
    { x: 50, y: 93, role: 'POR' },
    { x: 12, y: 76, role: 'CARR' },
    { x: 30, y: 81, role: 'DFC' },
    { x: 50, y: 83, role: 'DFC' },
    { x: 70, y: 81, role: 'DFC' },
    { x: 88, y: 76, role: 'CARR' },
    { x: 30, y: 64, role: 'MC' },
    { x: 50, y: 68, role: 'MCD' },
    { x: 70, y: 64, role: 'MC' },
    { x: 38, y: 46, role: 'DC' },
    { x: 62, y: 46, role: 'DC' },
  ],
  '3-5-2': [
    { x: 50, y: 93, role: 'POR' },
    { x: 28, y: 81, role: 'DFC' },
    { x: 50, y: 83, role: 'DFC' },
    { x: 72, y: 81, role: 'DFC' },
    { x: 12, y: 65, role: 'CARR' },
    { x: 34, y: 66, role: 'MC' },
    { x: 50, y: 56, role: 'MCO' },
    { x: 66, y: 66, role: 'MC' },
    { x: 88, y: 65, role: 'CARR' },
    { x: 38, y: 46, role: 'DC' },
    { x: 62, y: 46, role: 'DC' },
  ],
  '4-1-4-1': [
    { x: 50, y: 93, role: 'POR' },
    { x: 14, y: 81, role: 'LI' },
    { x: 36, y: 81, role: 'DFC' },
    { x: 64, y: 81, role: 'DFC' },
    { x: 86, y: 81, role: 'LD' },
    { x: 50, y: 71, role: 'MCD' },
    { x: 14, y: 59, role: 'MI' },
    { x: 36, y: 61, role: 'MC' },
    { x: 64, y: 61, role: 'MC' },
    { x: 86, y: 59, role: 'MD' },
    { x: 50, y: 44, role: 'DC' },
  ],
  '3-4-3': [
    { x: 50, y: 93, role: 'POR' },
    { x: 28, y: 81, role: 'DFC' },
    { x: 50, y: 83, role: 'DFC' },
    { x: 72, y: 81, role: 'DFC' },
    { x: 12, y: 65, role: 'CARR' },
    { x: 36, y: 66, role: 'MC' },
    { x: 64, y: 66, role: 'MC' },
    { x: 88, y: 65, role: 'CARR' },
    { x: 14, y: 46, role: 'EI' },
    { x: 50, y: 44, role: 'DC' },
    { x: 86, y: 46, role: 'ED' },
  ]
};

// Formations when showing only one team across the full pitch
const FORMATIONS_SINGLE: Record<string, { x: number; y: number; role: string }[]> = {
  '4-3-3': [
    { x: 50, y: 90, role: 'POR' },
    { x: 14, y: 74, role: 'LI' },
    { x: 38, y: 76, role: 'DFC' },
    { x: 62, y: 76, role: 'DFC' },
    { x: 86, y: 74, role: 'LD' },
    { x: 50, y: 58, role: 'MCD' },
    { x: 30, y: 48, role: 'MC' },
    { x: 70, y: 48, role: 'MC' },
    { x: 18, y: 26, role: 'EI' },
    { x: 50, y: 20, role: 'DC' },
    { x: 82, y: 26, role: 'ED' },
  ],
  '4-4-2': [
    { x: 50, y: 90, role: 'POR' },
    { x: 14, y: 74, role: 'LI' },
    { x: 38, y: 76, role: 'DFC' },
    { x: 62, y: 76, role: 'DFC' },
    { x: 86, y: 74, role: 'LD' },
    { x: 15, y: 50, role: 'MI' },
    { x: 38, y: 52, role: 'MC' },
    { x: 62, y: 52, role: 'MC' },
    { x: 85, y: 50, role: 'MD' },
    { x: 36, y: 22, role: 'DC' },
    { x: 64, y: 22, role: 'DC' },
  ],
  '4-2-3-1': [
    { x: 50, y: 90, role: 'POR' },
    { x: 14, y: 74, role: 'LI' },
    { x: 38, y: 76, role: 'DFC' },
    { x: 62, y: 76, role: 'DFC' },
    { x: 86, y: 74, role: 'LD' },
    { x: 36, y: 60, role: 'MCD' },
    { x: 64, y: 60, role: 'MCD' },
    { x: 18, y: 40, role: 'MI' },
    { x: 50, y: 38, role: 'MCO' },
    { x: 82, y: 40, role: 'MD' },
    { x: 50, y: 20, role: 'DC' },
  ],
  '5-3-2': [
    { x: 50, y: 90, role: 'POR' },
    { x: 12, y: 68, role: 'CARR' },
    { x: 32, y: 76, role: 'DFC' },
    { x: 50, y: 78, role: 'DFC' },
    { x: 68, y: 76, role: 'DFC' },
    { x: 88, y: 68, role: 'CARR' },
    { x: 32, y: 50, role: 'MC' },
    { x: 50, y: 54, role: 'MCD' },
    { x: 68, y: 50, role: 'MC' },
    { x: 36, y: 22, role: 'DC' },
    { x: 64, y: 22, role: 'DC' },
  ],
  '3-5-2': [
    { x: 50, y: 90, role: 'POR' },
    { x: 28, y: 76, role: 'DFC' },
    { x: 50, y: 78, role: 'DFC' },
    { x: 72, y: 76, role: 'DFC' },
    { x: 12, y: 52, role: 'CARR' },
    { x: 34, y: 54, role: 'MC' },
    { x: 50, y: 48, role: 'MCO' },
    { x: 66, y: 54, role: 'MC' },
    { x: 88, y: 52, role: 'CARR' },
    { x: 36, y: 22, role: 'DC' },
    { x: 64, y: 22, role: 'DC' },
  ],
  '4-1-4-1': [
    { x: 50, y: 90, role: 'POR' },
    { x: 14, y: 74, role: 'LI' },
    { x: 38, y: 76, role: 'DFC' },
    { x: 62, y: 76, role: 'DFC' },
    { x: 86, y: 74, role: 'LD' },
    { x: 50, y: 62, role: 'MCD' },
    { x: 16, y: 42, role: 'MI' },
    { x: 38, y: 44, role: 'MC' },
    { x: 62, y: 44, role: 'MC' },
    { x: 84, y: 42, role: 'MD' },
    { x: 50, y: 20, role: 'DC' },
  ],
  '3-4-3': [
    { x: 50, y: 90, role: 'POR' },
    { x: 28, y: 76, role: 'DFC' },
    { x: 50, y: 78, role: 'DFC' },
    { x: 72, y: 76, role: 'DFC' },
    { x: 12, y: 54, role: 'CARR' },
    { x: 38, y: 54, role: 'MC' },
    { x: 62, y: 54, role: 'MC' },
    { x: 86, y: 54, role: 'CARR' },
    { x: 18, y: 26, role: 'EI' },
    { x: 50, y: 20, role: 'DC' },
    { x: 82, y: 26, role: 'ED' },
  ]
};

// Mirror formation for the rival so they face downwards with correct spacing
const getRivalFormation = (formationStr: string) => {
  const base = FORMATIONS_DUAL[formationStr] || FORMATIONS_DUAL['4-3-3'];
  return base.map(node => ({
    ...node,
    x: 100 - node.x,
    y: 100 - node.y
  }));
};

function formatDisplayName(player: any): string {
  if (!player || !player.nombre) return '';
  const nombre = player.nombre.trim();
  
  let dorsal = player.dorsal;
  if (!dorsal && player.caracteristicas) {
    const dMatch = player.caracteristicas.match(/Dorsal\s*(\d+)/i);
    if (dMatch) dorsal = parseInt(dMatch[1], 10);
  }

  let display = '';
  if (nombre.includes(',')) {
    const parts = nombre.split(',');
    const surnames = parts[0].trim();
    const surnameWords = surnames.split(/\s+/);
    if (surnameWords[0].toLowerCase() === 'del' || surnameWords[0].toLowerCase() === 'de' || surnameWords[0].toLowerCase() === 'san') {
      display = surnameWords.slice(0, 2).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    } else {
      display = surnameWords[0].charAt(0).toUpperCase() + surnameWords[0].slice(1).toLowerCase();
    }
  } else {
    const words = nombre.split(/\s+/);
    if (words.length === 1) {
      display = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    } else if (words.length === 2) {
      display = words[0].charAt(0).toUpperCase() + '. ' + words[1].charAt(0).toUpperCase() + words[1].slice(1).toLowerCase();
    } else {
      display = words[0].charAt(0).toUpperCase() + '. ' + words[words.length - 1].charAt(0).toUpperCase() + words[words.length - 1].slice(1).toLowerCase();
    }
  }

  return dorsal ? `#${dorsal} ${display}` : display;
}

export type TacticalTool = 'pointer' | 'arrow' | 'pass' | 'press' | 'cone' | 'zone' | 'freehand' | 'text';

const TACTICAL_COLORS = [
  { id: '#facc15', label: 'Amarillo', bg: 'bg-yellow-400' },
  { id: '#38bdf8', label: 'Azul', bg: 'bg-sky-400' },
  { id: '#ef4444', label: 'Rojo', bg: 'bg-rose-500' },
  { id: '#ffffff', label: 'Blanco', bg: 'bg-white' },
  { id: '#4ade80', label: 'Verde', bg: 'bg-emerald-400' },
  { id: '#fb923c', label: 'Naranja', bg: 'bg-orange-400' },
];

interface FootballFieldProps {
  formacionLocal: string;
  formacionRival: string;
  mostrarRival: boolean;
  jugadoresAlineados: Record<string, any>;
  customPositions?: Record<string, { x: number; y: number }>;
  dibujos?: DibujoPizarra[];
  onDibujosChange?: (dibujos: DibujoPizarra[]) => void;
  onMoveNode?: (nodeId: string, x: number, y: number) => void;
  onDropJugador: (posId: string, playerId: string) => void;
  onRemoveJugador: (posId: string) => void;
  rivalName?: string;
  selectedPlayerToPlace?: any;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
}

export default function FootballField({
  formacionLocal,
  formacionRival,
  mostrarRival,
  jugadoresAlineados,
  customPositions = {},
  dibujos = [],
  onDibujosChange,
  onMoveNode,
  onDropJugador,
  onRemoveJugador,
  rivalName,
  selectedPlayerToPlace,
  selectedNodeId,
  onSelectNode
}: FootballFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  
  // Tactical drawing state
  const [activeTool, setActiveTool] = useState<TacticalTool>('pointer');
  const [activeColor, setActiveColor] = useState<string>('#facc15');
  const [internalDibujos, setInternalDibujos] = useState<DibujoPizarra[]>(dibujos);
  const [currentDrawing, setCurrentDrawing] = useState<DibujoPizarra | null>(null);
  const [textPromptPos, setTextPromptPos] = useState<{ x: number; y: number } | null>(null);
  const [tagTextInput, setTagTextInput] = useState('');

  // Sync internal dibujos with prop
  useEffect(() => {
    setInternalDibujos(dibujos);
  }, [dibujos]);

  const updateDibujos = (newDibujos: DibujoPizarra[]) => {
    setInternalDibujos(newDibujos);
    if (onDibujosChange) {
      onDibujosChange(newDibujos);
    }
  };

  const handleUndo = () => {
    if (internalDibujos.length === 0) return;
    const next = internalDibujos.slice(0, -1);
    updateDibujos(next);
  };

  const handleClearDibujos = () => {
    if (internalDibujos.length === 0) return;
    updateDibujos([]);
  };

  // Local state for smooth 60fps dragging without parent re-render lag
  const [internalPositions, setInternalPositions] = useState<Record<string, { x: number; y: number }>>(customPositions);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragCoords, setDragCoords] = useState<{ x: number; y: number } | null>(null);
  const lastDragTimeRef = useRef<number>(0);

  // Sync internal positions when prop changes from outside
  useEffect(() => {
    setInternalPositions(customPositions);
  }, [customPositions]);

  const formationsSource = mostrarRival ? FORMATIONS_DUAL : FORMATIONS_SINGLE;
  
  const nodesLocal = useMemo(() => {
    return (formationsSource[formacionLocal] || formationsSource['4-3-3']).map((n, i) => {
      const id = `local-${i}`;
      const custom = internalPositions[id];
      return {
        ...n,
        id,
        x: custom ? custom.x : n.x,
        y: custom ? custom.y : n.y,
        isLocal: true
      };
    });
  }, [formationsSource, formacionLocal, internalPositions]);

  const nodesRival = useMemo(() => {
    if (!mostrarRival) return [];
    return getRivalFormation(formacionRival).map((n, i) => {
      const id = `rival-${i}`;
      const custom = internalPositions[id];
      return {
        ...n,
        id,
        x: custom ? custom.x : n.x,
        y: custom ? custom.y : n.y,
        isLocal: false
      };
    });
  }, [mostrarRival, formacionRival, internalPositions]);

  const allNodes = useMemo(() => {
    return [...nodesRival, ...nodesLocal];
  }, [nodesRival, nodesLocal]);

  // Player dragging handlers (active only when in pointer mode)
  const handleMouseDown = (e: React.MouseEvent, nodeId: string, currentX: number, currentY: number) => {
    if (activeTool !== 'pointer' || e.button !== 0) return;
    startDrag(e.clientX, e.clientY, nodeId, currentX, currentY);
  };

  const handleTouchStart = (e: React.TouchEvent, nodeId: string, currentX: number, currentY: number) => {
    if (activeTool !== 'pointer' || e.touches.length === 0) return;
    startDrag(e.touches[0].clientX, e.touches[0].clientY, nodeId, currentX, currentY);
  };

  const startDrag = (startX: number, startY: number, nodeId: string, nodeStartX: number, nodeStartY: number) => {
    let hasMoved = false;
    let finalX = nodeStartX;
    let finalY = nodeStartY;

    setActiveDragId(nodeId);
    setDragCoords({ x: Math.round(nodeStartX), y: Math.round(nodeStartY) });

    const handleMove = (clientX: number, clientY: number) => {
      if (!fieldRef.current) return;
      const dx = clientX - startX;
      const dy = clientY - startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved = true;
      }

      if (hasMoved) {
        const rect = fieldRef.current.getBoundingClientRect();
        const deltaPctX = (dx / rect.width) * 100;
        const deltaPctY = (dy / rect.height) * 100;

        finalX = Math.max(4, Math.min(96, Math.round((nodeStartX + deltaPctX) * 10) / 10));
        finalY = Math.max(4, Math.min(96, Math.round((nodeStartY + deltaPctY) * 10) / 10));

        setDragCoords({ x: Math.round(finalX), y: Math.round(finalY) });
        setInternalPositions(prev => ({
          ...prev,
          [nodeId]: { x: finalX, y: finalY }
        }));
      }
    };

    const handleMouseMove = (ev: MouseEvent) => {
      handleMove(ev.clientX, ev.clientY);
    };

    const handleTouchMove = (ev: TouchEvent) => {
      if (ev.touches.length > 0) {
        if (ev.cancelable) ev.preventDefault();
        handleMove(ev.touches[0].clientX, ev.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);

      setActiveDragId(null);
      setDragCoords(null);

      if (hasMoved) {
        lastDragTimeRef.current = Date.now();
        if (onMoveNode) {
          onMoveNode(nodeId, finalX, finalY);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);
  };

  const handleNodeClick = (nodeId: string, player: any) => {
    if (activeTool !== 'pointer') return;
    if (Date.now() - lastDragTimeRef.current < 250) return;

    if (selectedPlayerToPlace) {
      onDropJugador(nodeId, selectedPlayerToPlace.id);
      return;
    }

    if (onSelectNode) {
      onSelectNode(selectedNodeId === nodeId ? null : nodeId);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, posId: string) => {
    e.preventDefault();
    const playerId = e.dataTransfer.getData('playerId');
    if (playerId) {
      onDropJugador(posId, playerId);
    }
  };

  const getPlayerInitials = (name: string) => {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  };

  // Convert Mouse/Touch client coords to Field Percentage (0 - 100)
  const getFieldCoords = (clientX: number, clientY: number) => {
    if (!fieldRef.current) return { x: 50, y: 50 };
    const rect = fieldRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  };

  // Drawing Canvas Handlers
  const handleFieldMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'pointer' || e.button !== 0) return;
    const coords = getFieldCoords(e.clientX, e.clientY);

    if (activeTool === 'cone') {
      const newCone: DibujoPizarra = {
        id: 'cone-' + Date.now(),
        tipo: 'cone',
        color: activeColor,
        puntos: [coords]
      };
      updateDibujos([...internalDibujos, newCone]);
      return;
    }

    if (activeTool === 'text') {
      setTextPromptPos(coords);
      setTagTextInput('');
      return;
    }

    // Tools that drag: arrow, pass, press, zone, freehand
    const newDrawing: DibujoPizarra = {
      id: 'draw-' + Date.now(),
      tipo: activeTool,
      color: activeColor,
      puntos: [coords, coords]
    };
    setCurrentDrawing(newDrawing);
  };

  const handleFieldMouseMove = (e: React.MouseEvent) => {
    if (!currentDrawing) return;
    const coords = getFieldCoords(e.clientX, e.clientY);

    if (currentDrawing.tipo === 'freehand') {
      setCurrentDrawing(prev => {
        if (!prev) return null;
        return {
          ...prev,
          puntos: [...prev.puntos, coords]
        };
      });
    } else {
      // 2-point shapes
      setCurrentDrawing(prev => {
        if (!prev) return null;
        return {
          ...prev,
          puntos: [prev.puntos[0], coords]
        };
      });
    }
  };

  const handleFieldMouseUp = () => {
    if (!currentDrawing) return;
    // Commit only if moved slightly or freehand has points
    const p1 = currentDrawing.puntos[0];
    const p2 = currentDrawing.puntos[currentDrawing.puntos.length - 1];
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    if (dist > 1.5 || currentDrawing.tipo === 'freehand') {
      updateDibujos([...internalDibujos, currentDrawing]);
    }
    setCurrentDrawing(null);
  };

  const handleAddTextTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textPromptPos || !tagTextInput.trim()) {
      setTextPromptPos(null);
      return;
    }

    const newTag: DibujoPizarra = {
      id: 'tag-' + Date.now(),
      tipo: 'text',
      color: activeColor,
      puntos: [textPromptPos],
      texto: tagTextInput.trim()
    };

    updateDibujos([...internalDibujos, newTag]);
    setTextPromptPos(null);
    setTagTextInput('');
  };

  return (
    <div className="space-y-3">
      {/* TACTICAL DRAWING TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl text-white">
        
        {/* Tool modes */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTool('pointer')}
            title="Mover Jugadores / Puntero"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTool === 'pointer'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mover</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('arrow')}
            title="Flecha de Carrera / Desplazamiento"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTool === 'arrow'
                ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MoveRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Carrera</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('pass')}
            title="Línea Discontinua / Pase de Balón"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTool === 'pass'
                ? 'bg-sky-400 text-slate-950 shadow-md shadow-sky-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CornerDownRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pase</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('press')}
            title="Flecha de Presión / Cobertura"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTool === 'press'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Presión</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('zone')}
            title="Zona Táctica Sombreada"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTool === 'zone'
                ? 'bg-orange-400 text-slate-950 shadow-md shadow-orange-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zona</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('cone')}
            title="Colocar Cono / Posta"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTool === 'cone'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cono</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('freehand')}
            title="Dibujo Libre / Pincel"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTool === 'freehand'
                ? 'bg-purple-400 text-slate-950 shadow-md shadow-purple-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pincel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('text')}
            title="Etiqueta de Texto Táctico"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTool === 'text'
                ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Texto</span>
          </button>
        </div>

        {/* Color Palette & Actions */}
        <div className="flex items-center gap-2">
          {/* Colors */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {TACTICAL_COLORS.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveColor(c.id)}
                title={c.label}
                className={`w-5 h-5 rounded-full transition-transform ${c.bg} ${
                  activeColor === c.id ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
          </div>

          {/* Undo & Clear */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={internalDibujos.length === 0}
            title="Deshacer último trazo"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer text-slate-200"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleClearDibujos}
            disabled={internalDibujos.length === 0}
            title="Limpiar todos los dibujos"
            className="p-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer text-rose-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TEXT TAG PROMPT MODAL */}
      {textPromptPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleAddTextTag} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-2xl max-w-sm w-full space-y-4 text-white">
            <h4 className="text-sm font-black flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" />
              Añadir Nota Táctica
            </h4>
            <input 
              type="text"
              autoFocus
              placeholder="Ej: 2vs1 por fuera, Bloque bajo..."
              value={tagTextInput}
              onChange={(e) => setTagTextInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setTextPromptPos(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 rounded-xl text-xs font-black bg-primary text-white hover:bg-primary/90"
              >
                Insertar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FOOTBALL PITCH CONTAINER */}
      <div 
        ref={fieldRef}
        onMouseDown={handleFieldMouseDown}
        onMouseMove={handleFieldMouseMove}
        onMouseUp={handleFieldMouseUp}
        className={`relative w-full h-[680px] md:h-[780px] max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-[#1f4e27] select-none touch-none ${
          activeTool !== 'pointer' ? 'cursor-crosshair' : ''
        }`}
      >
        
        {/* CÉSPED FIELD BACKGROUND WITH PROFESSIONAL STRIPES */}
        <div 
          className="absolute inset-0 opacity-35 pointer-events-none" 
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 52px, rgba(0,0,0,0.14) 52px, rgba(0,0,0,0.14) 104px)'
          }}
        ></div>
        
        {/* VIGNETTE & LIGHTING OVERLAY */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/35 pointer-events-none"></div>

        {/* LÍNEAS DEL CAMPO */}
        <div className="absolute inset-0 border-2 border-white/70 m-4 rounded-sm pointer-events-none"></div>
        
        {/* Línea Central */}
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/70 -translate-y-1/2 pointer-events-none"></div>
        
        {/* Círculo Central */}
        <div className="absolute top-1/2 left-1/2 w-28 h-28 border-2 border-white/70 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow pointer-events-none"></div>
        
        {/* Áreas Grandes (Penal) */}
        <div className="absolute top-4 left-1/2 w-72 h-36 border-2 border-white/70 border-t-0 -translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-4 left-1/2 w-72 h-36 border-2 border-white/70 border-b-0 -translate-x-1/2 pointer-events-none"></div>
        
        {/* Áreas Pequeñas */}
        <div className="absolute top-4 left-1/2 w-36 h-14 border-2 border-white/70 border-t-0 -translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-4 left-1/2 w-36 h-14 border-2 border-white/70 border-b-0 -translate-x-1/2 pointer-events-none"></div>

        {/* Semicírculos de Área */}
        <div className="absolute top-40 left-1/2 w-24 h-12 border-2 border-white/70 rounded-b-full border-t-0 -translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-40 left-1/2 w-24 h-12 border-2 border-white/70 rounded-t-full border-b-0 -translate-x-1/2 pointer-events-none"></div>
        
        {/* Puntos de Penalti */}
        <div className="absolute top-28 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 shadow pointer-events-none"></div>
        <div className="absolute bottom-28 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 shadow pointer-events-none"></div>

        {/* Córners */}
        <div className="absolute top-4 left-4 w-4 h-4 border-b-2 border-r-2 border-white/70 rounded-br-full pointer-events-none"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-b-2 border-l-2 border-white/70 rounded-bl-full pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-t-2 border-r-2 border-white/70 rounded-tr-full pointer-events-none"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-t-2 border-l-2 border-white/70 rounded-tl-full pointer-events-none"></div>

        {/* WATERMARK LABELS */}
        <div className="absolute top-6 left-7 text-[10px] font-black uppercase text-white/30 tracking-widest pointer-events-none">
          {mostrarRival ? (rivalName || 'RIVAL') : ''}
        </div>
        <div className="absolute bottom-6 left-7 text-[10px] font-black uppercase text-white/30 tracking-widest pointer-events-none">
          CD VILLARALBO
        </div>

        {/* SVG DRAWING LAYER (ARROWS, PASSES, ZONES, CONES) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            {TACTICAL_COLORS.map(c => (
              <marker
                key={c.id}
                id={`arrowhead-${c.id.replace('#', '')}`}
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill={c.id} />
              </marker>
            ))}
          </defs>

          {/* Render Committed Drawings + In-progress Drawing */}
          {[...internalDibujos, ...(currentDrawing ? [currentDrawing] : [])].map(draw => {
            const pts = draw.puntos;
            if (!pts || pts.length === 0) return null;

            if (draw.tipo === 'arrow') {
              const p1 = pts[0];
              const p2 = pts[pts.length - 1];
              return (
                <line
                  key={draw.id}
                  x1={`${p1.x}%`}
                  y1={`${p1.y}%`}
                  x2={`${p2.x}%`}
                  y2={`${p2.y}%`}
                  stroke={draw.color}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  markerEnd={`url(#arrowhead-${draw.color.replace('#', '')})`}
                  className="filter drop-shadow-md"
                />
              );
            }

            if (draw.tipo === 'pass') {
              const p1 = pts[0];
              const p2 = pts[pts.length - 1];
              return (
                <line
                  key={draw.id}
                  x1={`${p1.x}%`}
                  y1={`${p1.y}%`}
                  x2={`${p2.x}%`}
                  y2={`${p2.y}%`}
                  stroke={draw.color}
                  strokeWidth="3"
                  strokeDasharray="6,4"
                  strokeLinecap="round"
                  markerEnd={`url(#arrowhead-${draw.color.replace('#', '')})`}
                  className="filter drop-shadow-md"
                />
              );
            }

            if (draw.tipo === 'press') {
              const p1 = pts[0];
              const p2 = pts[pts.length - 1];
              // Calculate curved / zigzag control point
              const midX = (p1.x + p2.x) / 2 + (p2.y - p1.y) * 0.2;
              const midY = (p1.y + p2.y) / 2 - (p2.x - p1.x) * 0.2;
              return (
                <path
                  key={draw.id}
                  d={`M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke={draw.color}
                  strokeWidth="3.5"
                  strokeDasharray="8,3"
                  markerEnd={`url(#arrowhead-${draw.color.replace('#', '')})`}
                  className="filter drop-shadow-md"
                />
              );
            }

            if (draw.tipo === 'zone') {
              const p1 = pts[0];
              const p2 = pts[pts.length - 1];
              const minX = Math.min(p1.x, p2.x);
              const minY = Math.min(p1.y, p2.y);
              const width = Math.abs(p2.x - p1.x);
              const height = Math.abs(p2.y - p1.y);
              return (
                <rect
                  key={draw.id}
                  x={`${minX}%`}
                  y={`${minY}%`}
                  width={`${width}%`}
                  height={`${height}%`}
                  fill={draw.color}
                  fillOpacity="0.22"
                  stroke={draw.color}
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  rx="8"
                />
              );
            }

            if (draw.tipo === 'freehand') {
              const pathData = pts.reduce((acc, p, idx) => {
                return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
              }, '');
              return (
                <path
                  key={draw.id}
                  d={pathData}
                  fill="none"
                  stroke={draw.color}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="filter drop-shadow-md"
                />
              );
            }

            return null;
          })}
        </svg>

        {/* DOM-BASED TACTICAL ANNOTATIONS (CONES & TEXT TAGS) */}
        {internalDibujos.map(draw => {
          const pt = draw.puntos[0];
          if (!pt) return null;

          if (draw.tipo === 'cone') {
            return (
              <div
                key={draw.id}
                style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-15 flex flex-col items-center drop-shadow-lg"
              >
                {/* SVG Cone */}
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <polygon points="12,2 4,20 20,20" fill={draw.color} stroke="#000" strokeWidth="1" />
                  <polygon points="12,8 7,16 17,16" fill="#ffffff" fillOpacity="0.8" />
                  <ellipse cx="12" cy="20" rx="9" ry="2.5" fill="#111" fillOpacity="0.5" />
                </svg>
              </div>
            );
          }

          if (draw.tipo === 'text' && draw.texto) {
            return (
              <div
                key={draw.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-25 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-xl border backdrop-blur-md whitespace-nowrap"
                style={{
                  left: `${pt.x}%`,
                  top: `${pt.y}%`,
                  backgroundColor: 'rgba(15, 23, 42, 0.92)',
                  color: draw.color,
                  borderColor: draw.color
                }}
              >
                {draw.texto}
              </div>
            );
          }

          return null;
        })}

        {/* NODOS DE JUGADORES */}
        {allNodes.map(node => {
          const isLocal = node.isLocal;
          const player = jugadoresAlineados[node.id];
          const formattedName = player ? formatDisplayName(player) : '';
          const isCurrentlyDragging = activeDragId === node.id;
          const isTargetOfSelection = selectedPlayerToPlace !== null && selectedPlayerToPlace !== undefined;
          const isSlotSelected = selectedNodeId === node.id;
          
          return (
            <div 
              key={node.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group select-none ${
                activeTool === 'pointer' ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-auto'
              } ${
                isCurrentlyDragging ? 'z-50 scale-125' : (isLocal ? 'z-20' : 'z-15')
              }`}
              style={{ 
                left: `${node.x}%`, 
                top: `${node.y}%`,
                transition: isCurrentlyDragging ? 'none' : 'transform 0.12s ease-out, left 0.12s ease-out, top 0.12s ease-out'
              }}
              onMouseDown={(e) => handleMouseDown(e, node.id, node.x, node.y)}
              onTouchStart={(e) => handleTouchStart(e, node.id, node.x, node.y)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, node.id)}
            >
              {/* For RIVAL players: place name pill ABOVE the avatar */}
              {!isLocal && (
                <div className="mb-1 px-2 py-0.5 rounded-full text-[9px] font-black whitespace-nowrap max-w-[95px] truncate text-center backdrop-blur-md shadow-lg border transition-all duration-200 bg-rose-950/90 text-rose-100 border-rose-500/40 group-hover:scale-105 group-hover:z-30 pointer-events-none select-none">
                  {player ? formattedName : node.role}
                </div>
              )}

              {/* The Player Circle Node */}
              <div 
                className={`
                  relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border-2 shadow-xl transition-all duration-150 group-hover:scale-110 select-none
                  ${isCurrentlyDragging ? 'ring-4 ring-yellow-400 shadow-yellow-500/60 scale-125' : ''}
                  ${isTargetOfSelection && !player ? 'ring-4 ring-emerald-400 animate-pulse scale-110' : ''}
                  ${isSlotSelected ? 'ring-4 ring-amber-400 scale-115 shadow-amber-500/60' : ''}
                  ${isLocal 
                    ? player 
                      ? 'bg-gradient-to-tr from-emerald-700 to-teal-500 border-white ring-2 ring-emerald-400/50 shadow-emerald-950/60' 
                      : 'bg-emerald-950/60 border-emerald-300/60 border-dashed hover:bg-emerald-900/70 text-emerald-100' 
                    : player
                      ? 'bg-gradient-to-tr from-rose-700 to-red-500 border-white ring-2 ring-rose-400/50 shadow-rose-950/60'
                      : 'bg-rose-950/60 border-rose-300/60 border-dashed hover:bg-rose-900/70 text-rose-100'}
                `}
                onClick={() => handleNodeClick(node.id, player)}
              >
                {player ? (
                  player.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={player.foto_url} 
                      alt="" 
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                      className="w-full h-full rounded-full object-cover pointer-events-none select-none" 
                    />
                  ) : (
                    <span className="text-[9px] md:text-[10px] font-black text-white tracking-wider pointer-events-none select-none">
                      {getPlayerInitials(player.nombre)}
                    </span>
                  )
                ) : (
                  <span className="text-[8px] md:text-[9px] font-black tracking-wider drop-shadow-md pointer-events-none select-none">
                    {node.role}
                  </span>
                )}

                {/* Role badge pill at corner */}
                <div 
                  className={`absolute -bottom-1 -right-1 px-1 py-0.2 rounded text-[7px] font-black uppercase shadow border pointer-events-none select-none ${
                    isLocal 
                      ? 'bg-emerald-600 text-white border-emerald-300' 
                      : 'bg-rose-600 text-white border-rose-300'
                  }`}
                >
                  {node.role}
                </div>

                {/* Explicit Remove Button on hover / tap */}
                {player && !isCurrentlyDragging && activeTool === 'pointer' && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveJugador(node.id);
                    }}
                    title="Quitar jugador de la posición"
                    className="pointer-events-auto absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white hover:bg-rose-700 border border-white flex items-center justify-center text-[9px] font-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-30 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {/* For LOCAL players: place name pill BELOW the avatar */}
              {isLocal && (
                <div className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-black whitespace-nowrap max-w-[95px] truncate text-center backdrop-blur-md shadow-lg border transition-all duration-200 bg-slate-950/90 text-emerald-200 border-emerald-500/40 group-hover:scale-105 group-hover:z-30 pointer-events-none select-none">
                  {player ? formattedName : node.role}
                </div>
              )}

              {/* Active coordinates badge while dragging */}
              {isCurrentlyDragging && dragCoords && (
                <div className="absolute -bottom-6 px-1.5 py-0.5 rounded bg-yellow-400 text-slate-950 font-black text-[8px] shadow-lg pointer-events-none select-none">
                  {dragCoords.x}%, {dragCoords.y}%
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
