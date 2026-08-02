import React from 'react';

export interface FormationNode {
  id: string; // unique ID for the position (e.g., 'local-1')
  x: number;  // 0-100 percentage
  y: number;  // 0-100 percentage
  role: string;
}

const FORMATIONS: Record<string, { x: number; y: number; role: string }[]> = {
  '4-3-3': [
    { x: 50, y: 90, role: 'POR' },
    { x: 15, y: 75, role: 'LI' },
    { x: 38, y: 75, role: 'DFC' },
    { x: 62, y: 75, role: 'DFC' },
    { x: 85, y: 75, role: 'LD' },
    { x: 30, y: 55, role: 'MC' },
    { x: 50, y: 60, role: 'MCD' },
    { x: 70, y: 55, role: 'MC' },
    { x: 20, y: 35, role: 'EI' },
    { x: 50, y: 30, role: 'DC' },
    { x: 80, y: 35, role: 'ED' },
  ],
  '4-4-2': [
    { x: 50, y: 90, role: 'POR' },
    { x: 15, y: 75, role: 'LI' },
    { x: 38, y: 75, role: 'DFC' },
    { x: 62, y: 75, role: 'DFC' },
    { x: 85, y: 75, role: 'LD' },
    { x: 15, y: 55, role: 'MI' },
    { x: 38, y: 55, role: 'MC' },
    { x: 62, y: 55, role: 'MC' },
    { x: 85, y: 55, role: 'MD' },
    { x: 38, y: 30, role: 'DC' },
    { x: 62, y: 30, role: 'DC' },
  ],
  '4-2-3-1': [
    { x: 50, y: 90, role: 'POR' },
    { x: 15, y: 75, role: 'LI' },
    { x: 38, y: 75, role: 'DFC' },
    { x: 62, y: 75, role: 'DFC' },
    { x: 85, y: 75, role: 'LD' },
    { x: 38, y: 60, role: 'MCD' },
    { x: 62, y: 60, role: 'MCD' },
    { x: 20, y: 45, role: 'MI' },
    { x: 50, y: 45, role: 'MCO' },
    { x: 80, y: 45, role: 'MD' },
    { x: 50, y: 30, role: 'DC' },
  ],
  '5-3-2': [
    { x: 50, y: 90, role: 'POR' },
    { x: 15, y: 75, role: 'CARR' },
    { x: 32, y: 78, role: 'DFC' },
    { x: 50, y: 78, role: 'DFC' },
    { x: 68, y: 78, role: 'DFC' },
    { x: 85, y: 75, role: 'CARR' },
    { x: 30, y: 55, role: 'MC' },
    { x: 50, y: 55, role: 'MCD' },
    { x: 70, y: 55, role: 'MC' },
    { x: 38, y: 30, role: 'DC' },
    { x: 62, y: 30, role: 'DC' },
  ]
};

// Mirror formation for the rival (so they face downwards)
const getRivalFormation = (formationStr: string) => {
  const base = FORMATIONS[formationStr] || FORMATIONS['4-3-3'];
  return base.map(node => ({
    ...node,
    x: 100 - node.x,
    y: 100 - node.y
  }));
};

interface FootballFieldProps {
  formacionLocal: string; // e.g. "4-3-3"
  formacionRival: string;
  mostrarRival: boolean;
  jugadoresAlineados: Record<string, any>; // mapping pos_id -> player
  onDropJugador: (posId: string, playerId: string) => void;
  onRemoveJugador: (posId: string) => void;
}

export default function FootballField({
  formacionLocal,
  formacionRival,
  mostrarRival,
  jugadoresAlineados,
  onDropJugador,
  onRemoveJugador
}: FootballFieldProps) {
  
  const nodesLocal = (FORMATIONS[formacionLocal] || FORMATIONS['4-3-3']).map((n, i) => ({
    ...n,
    id: `local-${i}`,
    isLocal: true
  }));

  const nodesRival = mostrarRival 
    ? getRivalFormation(formacionRival).map((n, i) => ({ ...n, id: `rival-${i}`, isLocal: false }))
    : [];

  const allNodes = [...nodesRival, ...nodesLocal]; // render rival first so local is on top if overlap

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
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
    <div className="relative w-full h-[600px] md:h-[700px] max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-[#2d5d36]">
      {/* CÉSPED FIELD BACKGROUND (CSS DRAWING) */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(0,0,0,0.1) 50px, rgba(0,0,0,0.1) 100px)'
      }}></div>
      
      {/* LÍNEAS DEL CAMPO */}
      <div className="absolute inset-0 border-2 border-white/60 m-4"></div>
      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/60 -translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white/60 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/60 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Áreas Penal */}
      <div className="absolute top-4 left-1/2 w-64 h-32 border-2 border-white/60 border-t-0 -translate-x-1/2"></div>
      <div className="absolute bottom-4 left-1/2 w-64 h-32 border-2 border-white/60 border-b-0 -translate-x-1/2"></div>
      
      {/* Áreas Pequeñas */}
      <div className="absolute top-4 left-1/2 w-32 h-12 border-2 border-white/60 border-t-0 -translate-x-1/2"></div>
      <div className="absolute bottom-4 left-1/2 w-32 h-12 border-2 border-white/60 border-b-0 -translate-x-1/2"></div>

      {/* Semicírculos */}
      <div className="absolute top-36 left-1/2 w-20 h-10 border-2 border-white/60 rounded-b-full border-t-0 -translate-x-1/2"></div>
      <div className="absolute bottom-36 left-1/2 w-20 h-10 border-2 border-white/60 rounded-t-full border-b-0 -translate-x-1/2"></div>
      
      {/* Puntos penalti */}
      <div className="absolute top-24 left-1/2 w-1.5 h-1.5 bg-white/60 rounded-full -translate-x-1/2"></div>
      <div className="absolute bottom-24 left-1/2 w-1.5 h-1.5 bg-white/60 rounded-full -translate-x-1/2"></div>


      {/* NODOS (JUGADORES) */}
      {allNodes.map(node => {
        const isLocal = node.isLocal;
        const player = jugadoresAlineados[node.id];
        
        return (
          <div 
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-all duration-300"
            style={{ left: `${node.x}%`, top: `${node.y}%`, zIndex: isLocal ? 10 : 5 }}
            onDragOver={isLocal ? handleDragOver : undefined}
            onDrop={isLocal ? (e) => handleDrop(e, node.id) : undefined}
          >
            {/* The Circle */}
            <div 
              className={`
                relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 shadow-lg cursor-pointer
                ${isLocal 
                  ? player 
                    ? 'bg-primary-red border-white/80' 
                    : 'bg-white/10 border-white/40 border-dashed hover:bg-white/20' 
                  : 'bg-primary-blue border-white/50 opacity-80'}
              `}
              onClick={isLocal && player ? () => onRemoveJugador(node.id) : undefined}
            >
              {player ? (
                player.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={player.foto_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-[10px] md:text-xs font-black text-white">{getPlayerInitials(player.nombre)}</span>
                )
              ) : (
                <span className={`text-[9px] md:text-[10px] font-black ${isLocal ? 'text-white/60' : 'text-white'}`}>{node.role}</span>
              )}
              
              {/* Tooltip on remove */}
              {isLocal && player && (
                <div className="absolute -top-8 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                  Click para quitar
                </div>
              )}
            </div>
            
            {/* Player Name below circle */}
            <div className="mt-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold text-white whitespace-nowrap max-w-[80px] truncate text-center backdrop-blur-sm border border-white/10">
              {player ? player.nombre.split(' ')[0] : isLocal ? 'Arrastra aquí' : 'Rival'}
            </div>
          </div>
        )
      })}
    </div>
  );
}
