
import React from 'react';
import { GameState, Team, Piece } from '../types';
import { NODE_COORDS } from '../constants';

interface YutBoardProps {
    gameState: GameState;
    validTarget: number | 'GOAL' | null;
    previewPath: number[];
    onNodeClick: (nodeId: number | 'GOAL') => void;
    onPieceClick: (pieceId: string) => void;
}

export const YutBoard: React.FC<YutBoardProps> = ({
    gameState,
    validTarget,
    previewPath,
    onNodeClick,
    onPieceClick
}) => {
    const currentTeam = gameState.teams[gameState.currentTeamIndex];

    return (
        <div className={`aspect-square w-full max-w-[90vh] relative rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,1)] border-[16px] border-[#2c1d12] bg-[#1a120b] shrink-0`} onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 rounded-[3rem] border-4 border-[#d4af37]/10 pointer-events-none"></div>

            {/* Path Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                <path d="M 90 90 L 90 10 L 10 10 L 10 90 Z M 10 10 L 90 90 M 90 10 L 10 90" fill="none" stroke="#d4af37" strokeWidth="0.8" strokeOpacity="0.2" />
                {previewPath.length > 0 && (
                    <polyline
                        points={
                            (gameState.selectedPieceId === 'new'
                                ? `${NODE_COORDS[0].x},${NODE_COORDS[0].y} `
                                : gameState.pieces.find(p => p.id === gameState.selectedPieceId)
                                    ? `${NODE_COORDS[gameState.pieces.find(p => p.id === gameState.selectedPieceId)!.position].x},${NODE_COORDS[gameState.pieces.find(p => p.id === gameState.selectedPieceId)!.position].y} `
                                    : ""
                            ) + previewPath.map(id => `${NODE_COORDS[id].x},${NODE_COORDS[id].y}`).join(' ')
                        }
                        fill="none"
                        stroke={currentTeam.color}
                        strokeWidth="3"
                        strokeDasharray="4 4"
                        className="animate-[dash_1s_linear_infinite]"
                    />
                )}
            </svg>

            {/* Nodes */}
            {Object.entries(NODE_COORDS).map(([id, coord]) => {
                const nodeId = Number(id);
                const isTarget = validTarget === nodeId;
                const isEvent = gameState.specialNodes.eventNodes.includes(nodeId);
                const isTrial = nodeId === gameState.specialNodes.hellNode;
                const isSupport = nodeId === gameState.specialNodes.upNode;
                const isCorner = [0, 5, 10, 15, 22].includes(nodeId);

                return (
                    <div
                        key={id}
                        onClick={() => onNodeClick(nodeId)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all cursor-pointer z-10 
               ${isCorner ? 'w-[6%] h-[6%] rounded-2xl rotate-45 border-[#d4af37]/60' : 'w-[4.5%] h-[4.5%] rounded-full border-[#d4af37]/20'} 
               ${isTrial ? 'w-[10%] h-[10%] z-20 shadow-[0_0_40px_rgba(239,68,68,0.8)] border-red-500 bg-red-950/40 animate-pulse' : ''}
               ${isSupport ? 'w-[10%] h-[10%] z-20 shadow-[0_0_40px_rgba(255,105,180,0.8)] border-pink-500 bg-pink-950/40 animate-bounce' : ''}
               border-2 
               ${isTarget ? 'bg-white scale-[1.8] z-50 shadow-[0_0_40px_white] border-white animate-pulse' : 'bg-[#1a120b] hover:border-white/50'}`}
                        style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                    >
                        <div className={`${isCorner ? '-rotate-45' : ''} ${isTrial || isSupport ? 'text-[3.5cqw]' : 'text-[1.5cqw]'} opacity-100`}>
                            {isEvent && "🧧"} {isTrial && "🧨"} {isSupport && "💑"}
                        </div>
                    </div>
                );
            })}

            {/* Goal Zone */}
            {validTarget === 'GOAL' && (
                <div onClick={() => onNodeClick('GOAL')} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] h-[25%] bg-indigo-900/90 backdrop-blur-md rounded-full flex flex-col items-center justify-center animate-bounce cursor-pointer z-[100] border-4 border-white shadow-[0_0_60px_rgba(79,70,229,0.8)]">
                    <span className="text-3xl lg:text-5xl font-black text-white italic tracking-widest drop-shadow-lg">완주!</span>
                    <span className="text-5xl lg:text-7xl mt-2 filter drop-shadow-md">🏁</span>
                </div>
            )}

            {/* Pieces */}
            {gameState.pieces.map(piece => {
                const coord = NODE_COORDS[piece.position];
                const team = gameState.teams.find(t => t.id === piece.teamId);
                const isSelected = gameState.selectedPieceId === piece.id;
                const isCurrentTeam = team?.id === currentTeam.id;

                return (
                    <div
                        key={piece.id}
                        onClick={(e) => { e.stopPropagation(); if (isCurrentTeam) onPieceClick(piece.id); }}
                        className={`absolute w-[10%] h-[10%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all cursor-pointer z-40 
              ${isSelected ? 'scale-125 z-[60] drop-shadow-[0_0_30px_white]' : 'hover:scale-110'} 
              ${!isCurrentTeam ? 'opacity-60 grayscale-[0.3]' : ''}`}
                        style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                    >
                        <span className="text-[5cqw] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] filter select-none transition-transform active:scale-95" style={{ fontSize: 'min(8vh, 8vw)' }}>
                            {team?.emoji}
                        </span>
                        {piece.stackCount > 1 && (
                            <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[1.2cqw] font-black w-[40%] h-[40%] rounded-full flex items-center justify-center border-2 border-white shadow-xl animate-pulse">
                                {piece.stackCount}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Explosion Effect */}
            {gameState.showExplosion && (
                <div
                    className="absolute z-[150] pointer-events-none"
                    style={{ left: `${gameState.showExplosion.x}%`, top: `${gameState.showExplosion.y}%` }}
                >
                    {/* Shell Falling */}
                    <div className="absolute -translate-x-1/2 -translate-y-1/2 text-[100px] shell-anim">🚀</div>
                    {/* Blast Wave */}
                    <div className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-500 rounded-full blur-2xl opacity-0 blast-anim"></div>
                    <div className="absolute -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-400 rounded-full blur-3xl opacity-0 blast-anim [animation-delay:0.1s]"></div>
                    <div className="absolute -translate-x-1/2 -translate-y-1/2 text-[120px] opacity-0 blast-anim [animation-delay:0.15s]">💥</div>
                </div>
            )}
        </div>
    );
};
