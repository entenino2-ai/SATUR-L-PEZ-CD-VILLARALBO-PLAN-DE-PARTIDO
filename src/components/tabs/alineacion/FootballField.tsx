import React, { useRef, useState, useEffect, useMemo } from 'react';

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

interface FootballFieldProps {
  formacionLocal: string;
  formacionRival: string;
  mostrarRival: boolean;
  jugadoresAlineados: Record<string, any>;
  customPositions?: Record<string, { x: number; y: number }>;
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
  onMoveNode,
  onDropJugador,
  onRemoveJugador,
  rivalName,
  selectedPlayerToPlace,
  selectedNodeId,
  onSelectNode
}: FootballFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  
  // Local state for smooth 60fps dragging without parent re-render lag
  const [internalPositions, setInternalPositions] = useState<Record<string, { x: number; y: number }>>(customPositions);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragCoords, setDragCoords] = useState<{ x: number; y: number } | null>(null);
  const lastDragTimeRef = useRef<number>(0);

  // Sync internal positions when prop changes from outside (e.g. initial load or reset)
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

  // High-performance direct dragging
  const handleMouseDown = (e: React.MouseEvent, nodeId: string, currentX: number, currentY: number) => {
    if (e.button !== 0) return;
    startDrag(e.clientX, e.clientY, nodeId, currentX, currentY);
  };

  const handleTouchStart = (e: React.TouchEvent, nodeId: string, currentX: number, currentY: number) => {
    if (e.touches.length === 0) return;
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
    // If just dragged, ignore click
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

  return (
    <div 
      ref={fieldRef}
      className="relative w-full h-[680px] md:h-[780px] max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-[#1f4e27] select-none touch-none"
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

      {/* NODOS DE JUGADORES (ARRASTRABLES LIBREMENTE CON ALTA SENSIBILIDAD) */}
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
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-grab active:cursor-grabbing select-none ${
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
              {player && !isCurrentlyDragging && (
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
  );
}
