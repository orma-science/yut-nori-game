
import React from 'react';
import { GameState, Team, Piece } from '../types';
import { NODE_COORDS } from '../constants';
import { UpIcon } from './UpIcon';

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

    const isCyber = gameState.theme === 'cyber';

    return (
        <div className={`aspect-square w-full max-w-[90vh] relative rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,1)] border-[16px] transition-all duration-700 shrink-0
            ${isCyber
                ? 'border-blue-600 bg-[#000814] shadow-[0_0_50px_rgba(37,99,235,0.4)]'
                : 'border-[#2c1d12] bg-[#1a120b]'}`}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Theme Specific Overlay */}
            {isCyber ? (
                <div className="absolute inset-0 rounded-[3rem] opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)', backgroundSize: '4% 4%' }}></div>
            ) : (
                <div className="absolute inset-0 rounded-[3rem] border-4 border-[#d4af37]/10 pointer-events-none"></div>
            )}

            {/* Path Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                <path
                    d="M 90 90 L 90 10 L 10 10 L 10 90 Z M 10 10 L 90 90 M 90 10 L 10 90"
                    fill="none"
                    stroke={isCyber ? "#60A5FA" : "#d4af37"}
                    strokeWidth={isCyber ? "1.2" : "0.8"}
                    strokeOpacity={isCyber ? "0.4" : "0.2"}
                    className={isCyber ? "drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]" : ""}
                />
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

                const isSpecial = isEvent || isTrial || isSupport;

                return (
                    <div
                        key={id}
                        onClick={(e) => { e.stopPropagation(); onNodeClick(nodeId); }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all cursor-pointer z-10 
               ${!isSpecial ? (isCorner ? `w-[6%] h-[6%] rounded-2xl rotate-45 border-2 ${isCyber ? 'border-blue-400 bg-blue-900/40 shadow-[0_0_15px_rgba(96,165,250,0.5)]' : 'border-[#d4af37]/60 bg-[#1a120b]'}` : `w-[4.5%] h-[4.5%] rounded-full border-2 ${isCyber ? 'border-blue-500/30 bg-blue-950/60' : 'border-[#d4af37]/20 bg-[#1a120b]'}`) : ''} 
               ${isEvent ? 'w-[18%] h-[18%] z-10 bg-transparent' : ''}
               ${isTrial ? 'w-[18%] h-[18%] z-10 bg-transparent' : ''}
               ${isSupport ? 'w-[22%] h-[22%] z-10 bg-transparent' : ''}
               ${isTarget ? 'bg-white scale-[1.8] z-50 shadow-[0_0_40px_white] border-white animate-pulse' : 'hover:border-white/50'}`}
                        style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                    >
                        <div className={`absolute inset-0 flex items-center justify-center ${isCorner ? '-rotate-45' : ''}`}>
                            {isEvent && <img src="/event.png" alt="이벤트" className="w-[85%] h-[85%] object-contain" style={{ transformOrigin: 'center center' }} />}
                            {isTrial && (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {/* Warning Vortex Layers */}
                                    <div className="absolute inset-[-20%] rounded-full border-2 border-purple-500/30 animate-vortex"></div>
                                    <div className="absolute inset-[-40%] rounded-full border border-purple-900/20 animate-vortex [animation-duration:6s] [animation-direction:reverse]"></div>
                                    <div className="absolute inset-0 rounded-full animate-warning"></div>

                                    <img
                                        src="/blackhall.png"
                                        alt="블랙홀"
                                        className="w-[95%] h-[95%] object-contain animate-[spin_12s_linear_infinite] filter drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]"
                                        style={{ transformOrigin: 'center center' }}
                                    />

                                    {/* Warning Particles (Simulated) */}
                                    <div className="absolute w-1 h-1 bg-purple-400 rounded-full animate-ping top-0 left-1/4"></div>
                                    <div className="absolute w-1 h-1 bg-purple-500 rounded-full animate-ping bottom-1/4 right-0 [animation-delay:0.5s]"></div>
                                </div>
                            )}
                            {isSupport && <UpIcon />}
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

            {/* Dust Particles Effect */}
            {gameState.showDust && (
                <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                    <div
                        className="dust-particle"
                        style={{
                            left: `${gameState.showDust.x}%`,
                            top: `${gameState.showDust.y}%`,
                            width: '4%', height: '4%',
                            background: isCyber ? 'rgba(96, 165, 250, 0.4)' : 'rgba(139, 69, 19, 0.4)'
                        }}
                    ></div>
                </div>
            )}

            {/* Pieces */}
            {gameState.pieces.map(piece => {
                const coord = NODE_COORDS[piece.position];
                const team = gameState.teams.find(t => t.id === piece.teamId);
                const isSelected = gameState.selectedPieceId === piece.id;
                const isCurrentTeam = team?.id === currentTeam.id;
                const isAnimating = gameState.animatingPieceId === piece.id;

                return (
                    <div
                        key={piece.id}
                        onClick={(e) => { e.stopPropagation(); if (isCurrentTeam) onPieceClick(piece.id); }}
                        className={`absolute w-[10%] h-[10%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all cursor-pointer z-40 
                ${isSelected ? 'scale-125 z-[60] drop-shadow-[0_0_35px_white]' : 'hover:scale-110'}
                ${isAnimating ? 'animate-jump' : ''}`}
                        style={{
                            left: `${coord.x}%`,
                            top: `${coord.y}%`,
                            transitionDuration: '0.4s'
                        }}
                    >
                        {/* 현재 턴인 말에 해당 팀 색상의 강조 원 추가 */}
                        {isCurrentTeam && (
                            <>
                                <div
                                    className="absolute inset-[-15%] rounded-full border-[3px] border-dashed animate-[spin_10s_linear_infinite] opacity-60"
                                    style={{ borderColor: team?.color }}
                                ></div>
                                <div
                                    className="absolute inset-[-15%] rounded-full border-2 animate-pulse opacity-40 shadow-[0_0_15px_inset]"
                                    style={{ borderColor: team?.color, boxShadow: `0 0 15px ${team?.color}` }}
                                ></div>
                            </>
                        )}
                        {/* 말 뒤에 그림자를 주어 아이콘을 완벽히 차단 */}
                        <div className="absolute inset-0 rounded-full bg-black/20 blur-md"></div>

                        <span className="text-[5cqw] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] filter select-none transition-transform active:scale-95 relative z-10" style={{ fontSize: 'min(8vh, 8vw)' }}>
                            {team?.emoji}
                        </span>
                        {piece.stackCount > 1 && (
                            <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[1.8cqw] font-black w-[45%] h-[45%] rounded-full flex items-center justify-center border-2 border-white shadow-xl animate-pulse z-20" style={{ fontSize: 'min(2.5vh, 2.5vw)' }}>
                                {piece.stackCount}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Caught Piece Animation overlay */}
            {gameState.caughtPiece && (
                <div
                    className="absolute w-[10%] h-[10%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-[100] animate-caught pointer-events-none"
                    style={{
                        left: `${NODE_COORDS[gameState.caughtPiece.position].x}%`,
                        top: `${NODE_COORDS[gameState.caughtPiece.position].y}%`
                    }}
                >
                    <span className="text-[5cqw] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] opacity-70" style={{ fontSize: 'min(8vh, 8vw)' }}>
                        {gameState.caughtPiece.emoji}
                    </span>
                </div>
            )}

            {/* Black Hole Effect */}
            {gameState.showExplosion && (
                <div
                    className="absolute z-[150] pointer-events-none"
                    style={{ left: `${gameState.showExplosion.x}%`, top: `${gameState.showExplosion.y}%` }}
                >
                    {/* Outer glow ring */}
                    <div className="absolute w-40 h-40 rounded-full bg-purple-900/60 blur-3xl blackhole-anim" style={{ left: '-80px', top: '-80px' }}></div>
                    {/* Dark vortex core */}
                    <div className="absolute w-24 h-24 rounded-full bg-black border-4 border-purple-500 shadow-[0_0_60px_rgba(168,85,247,0.9)] blackhole-anim" style={{ left: '-48px', top: '-48px' }}></div>
                    {/* Black hole emoji */}
                    <div className="absolute text-[80px] blackhole-anim" style={{ left: '-40px', top: '-40px' }}>🕳️</div>
                    {/* Swirling particles */}
                    <div className="absolute w-48 h-48 rounded-full border-2 border-purple-400/40 blast-anim" style={{ left: '-96px', top: '-96px' }}></div>
                    <div className="absolute w-64 h-64 rounded-full border border-indigo-400/20 blast-anim [animation-delay:0.2s]" style={{ left: '-128px', top: '-128px' }}></div>
                </div>
            )}
        </div>
    );
};
