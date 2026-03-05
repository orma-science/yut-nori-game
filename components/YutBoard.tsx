
import React from 'react';
import { GameState } from '../types';
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

    // 노드 크기 정의 (SVG 포인트 단위)
    const getBorderSize = (nodeId: number) => {
        const isCorner = [0, 5, 10, 15, 22].includes(nodeId);
        return isCorner ? 6.5 : 5.5;
    };

    const getSpecialSize = (nodeId: number) => {
        if (nodeId === gameState.specialNodes.hellNode) return 20;
        if (nodeId === gameState.specialNodes.upNode) return 25;
        if (gameState.specialNodes.eventNodes.includes(nodeId)) return 20;
        return 0;
    };

    return (
        <div
            className={`w-full max-w-[95%] h-full max-h-[95%] relative rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,1)] border-[16px] transition-all duration-700 shrink-0 aspect-square
            ${isCyber
                    ? 'border-blue-600/80 bg-[#000814] shadow-[0_0_60px_rgba(37,99,235,0.3)]'
                    : 'border-[#2c1d12] bg-[#1a120b]'}`}
            onClick={(e) => e.stopPropagation()}
        >
            {/* 100x100 단일 좌표계 시작 */}
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                className="absolute inset-0 w-full h-full overflow-visible"
            >
                {/* 1. 배경 장식 */}
                {isCyber ? (
                    <defs>
                        <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                            <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#1e3a8a" strokeWidth="0.05" strokeOpacity="0.2" />
                        </pattern>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="0.2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                ) : null}
                <rect width="100" height="100" fill={isCyber ? "url(#grid)" : "transparent"} rx="2" pointerEvents="none" />

                {/* 2. 경로 선 (Path Lines) - 미세하게 더 날렵하게 조정 */}
                <path
                    d={`M ${NODE_COORDS[0].x} ${NODE_COORDS[0].y}
                       L ${NODE_COORDS[5].x} ${NODE_COORDS[5].y}
                       L ${NODE_COORDS[10].x} ${NODE_COORDS[10].y}
                       L ${NODE_COORDS[15].x} ${NODE_COORDS[15].y} Z`}
                    fill="none"
                    stroke={isCyber ? "#60A5FA" : "#d4af37"}
                    strokeWidth={isCyber ? "1.2" : "0.8"}
                    strokeOpacity={isCyber ? "0.5" : "0.3"}
                    filter={isCyber ? "url(#glow)" : ""}
                />
                <path
                    d={`M ${NODE_COORDS[10].x} ${NODE_COORDS[10].y} L ${NODE_COORDS[0].x} ${NODE_COORDS[0].y}
                       M ${NODE_COORDS[5].x} ${NODE_COORDS[5].y} L ${NODE_COORDS[15].x} ${NODE_COORDS[15].y}`}
                    fill="none"
                    stroke={isCyber ? "#60A5FA" : "#d4af37"}
                    strokeWidth={isCyber ? "1" : "0.7"}
                    strokeOpacity={isCyber ? "0.3" : "0.15"}
                />

                {/* 3. 이동 경로 미리보기 (Preview Path) */}
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
                        strokeWidth="3.2"
                        strokeDasharray="2.5 2.5"
                        className="animate-[dash_1s_linear_infinite]"
                        style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))' }}
                    />
                )}

                {/* 4. 노드 배치 (Nodes) */}
                {Object.entries(NODE_COORDS).map(([id, coord]) => {
                    const nodeId = Number(id);
                    const isTarget = validTarget === nodeId;
                    const isEvent = gameState.specialNodes.eventNodes.includes(nodeId);
                    const isTrial = nodeId === gameState.specialNodes.hellNode;
                    const isSupport = nodeId === gameState.specialNodes.upNode;
                    const isCorner = [0, 5, 10, 15, 22].includes(nodeId);
                    const isSpecial = isEvent || isTrial || isSupport;

                    const size = isSpecial ? getSpecialSize(nodeId) : getBorderSize(nodeId);

                    return (
                        <foreignObject
                            key={`node-${id}`}
                            x={coord.x - size / 2}
                            y={coord.y - size / 2}
                            width={size}
                            height={size}
                            className="overflow-visible"
                        >
                            <div
                                onClick={(e) => { e.stopPropagation(); onNodeClick(nodeId); }}
                                className={`w-full h-full flex items-center justify-center transition-all duration-300 cursor-pointer
                                    ${!isSpecial ? (isCorner
                                        ? `rounded-2xl rotate-45 border-[1.2px] ${isCyber ? 'border-blue-400/80 bg-blue-900/40 shadow-[0_0_12px_rgba(96,165,250,0.4)]' : 'border-[#d4af37]/40 bg-[#1a120b] shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]'}`
                                        : `rounded-full border-[1.2px] ${isCyber ? 'border-blue-500/40 bg-blue-950/70 shadow-[0_0_8px_rgba(96,165,250,0.2)]' : 'border-[#d4af37]/25 bg-[#1a120b] shadow-[inset_0_0_5px_rgba(0,0,0,0.2)]'}`) : ''}
                                    ${isTarget ? 'bg-white/90 scale-[1.2] shadow-[0_0_30px_white] border-white z-50 animate-pulse' : 'hover:border-white/40 hover:scale-105'}`}
                            >
                                <div className={`absolute inset-0 flex items-center justify-center ${isCorner ? '-rotate-45' : ''}`}>
                                    {isEvent && <img src="/event.png" alt="이벤트" className="w-[85%] h-[85%] object-contain" />}
                                    {isTrial && (
                                        <div className="relative w-full h-full flex items-center justify-center scale-90">
                                            <div className="absolute inset-[-20%] rounded-full border-2 border-purple-500/30 animate-vortex"></div>
                                            <div className="absolute inset-0 rounded-full animate-warning"></div>
                                            <img src="/blackhall.png" alt="블랙홀" className="w-[95%] h-[95%] object-contain animate-[spin_12s_linear_infinite] filter drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]" />
                                        </div>
                                    )}
                                    {isSupport && <UpIcon />}
                                </div>
                            </div>
                        </foreignObject>
                    );
                })}

                {/* 5. 완주 구역 (Goal Zone) */}
                {validTarget === 'GOAL' && (
                    <foreignObject x="35" y="35" width="30" height="30" className="overflow-visible">
                        <div
                            onClick={() => onNodeClick('GOAL')}
                            className="w-full h-full bg-indigo-900/90 backdrop-blur-md rounded-full flex flex-col items-center justify-center animate-bounce cursor-pointer border-4 border-white shadow-[0_0_60px_rgba(79,70,229,0.8)]"
                        >
                            <span className="text-[2.5px] font-black text-white italic tracking-widest drop-shadow-lg" style={{ fontSize: '3px' }}>완주!</span>
                            <span className="text-[5px]" style={{ fontSize: '5px' }}>🏁</span>
                        </div>
                    </foreignObject>
                )}

                {/* 6. 말 배치 (Pieces) */}
                {gameState.pieces.map(piece => {
                    const coord = NODE_COORDS[piece.position];
                    const team = gameState.teams.find(t => t.id === piece.teamId);
                    const isSelected = gameState.selectedPieceId === piece.id;
                    const isCurrentTeam = team?.id === currentTeam.id;
                    const isAnimating = gameState.animatingPieceId === piece.id;
                    const pieceSize = 10;

                    return (
                        <foreignObject
                            key={`piece-${piece.id}`}
                            x={coord.x - pieceSize / 2}
                            y={coord.y - pieceSize / 2}
                            width={pieceSize}
                            height={pieceSize}
                            className={`overflow-visible z-40 transition-all duration-300 ${isSelected ? 'z-[60]' : ''}`}
                            style={{ pointerEvents: 'none' }}
                        >
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (typeof validTarget === 'number' && validTarget === piece.position) {
                                        onNodeClick(piece.position);
                                    } else if (isCurrentTeam) {
                                        onPieceClick(piece.id);
                                    }
                                }}
                                className={`w-full h-full flex items-center justify-center pointer-events-auto cursor-pointer
                                    ${isSelected ? 'scale-125 drop-shadow-[0_0_35px_white]' : 'hover:scale-110'}
                                    ${isAnimating ? 'animate-jump' : ''}`}
                                style={{ transitionDuration: '0.4s' }}
                            >
                                {isCurrentTeam && (
                                    <>
                                        <div className="absolute inset-[-15%] rounded-full border-[0.3px] border-dashed animate-[spin_10s_linear_infinite] opacity-60" style={{ borderColor: team?.color }}></div>
                                        <div className="absolute inset-[-15%] rounded-full border-[0.2px] animate-pulse opacity-40 shadow-[0_0_5px_inset]" style={{ borderColor: team?.color, boxShadow: `0 0 5px ${team?.color}` }}></div>
                                    </>
                                )}
                                <div className="absolute inset-0 rounded-full bg-black/20 blur-sm"></div>
                                <span className="text-[6px] drop-shadow-[0_0.4px_1px_rgba(0,0,0,0.9)] filter select-none transition-transform active:scale-95 relative z-10" style={{ fontSize: '8px' }}>
                                    {team?.emoji}
                                </span>
                                {piece.stackCount > 1 && (
                                    <div className="absolute -top-[1px] -right-[1px] bg-red-600 text-white font-black w-[45%] h-[45%] rounded-full flex items-center justify-center border-[0.3px] border-white shadow-xl animate-pulse z-20" style={{ fontSize: '2.5px' }}>
                                        {piece.stackCount}
                                    </div>
                                )}
                            </div>
                        </foreignObject>
                    );
                })}

                {/* 7. 잡힌 말 애니메이션 (Caught Piece) */}
                {gameState.caughtPiece && (
                    <foreignObject
                        x={NODE_COORDS[gameState.caughtPiece.position].x - 5}
                        y={NODE_COORDS[gameState.caughtPiece.position].y - 5}
                        width="10" height="10"
                        className="overflow-visible pointer-events-none z-[100]"
                    >
                        <div className="w-full h-full flex items-center justify-center animate-caught">
                            <span className="text-[6px] drop-shadow-[0_0.4px_1px_rgba(0,0,0,0.9)] opacity-70" style={{ fontSize: '8px' }}>
                                {gameState.caughtPiece.emoji}
                            </span>
                        </div>
                    </foreignObject>
                )}

                {/* 8. 폭발 효과 (Explosion/Black Hole) */}
                {gameState.showExplosion && (
                    <foreignObject
                        x={gameState.showExplosion.x - 15}
                        y={gameState.showExplosion.y - 15}
                        width="30" height="30"
                        className="overflow-visible pointer-events-none z-[150]"
                    >
                        <div className="w-full h-full relative flex items-center justify-center">
                            <div className="absolute w-[150%] h-[150%] rounded-full bg-purple-900/60 blur-xl blackhole-anim"></div>
                            <div className="absolute w-full h-full rounded-full bg-black border-[0.4px] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.9)] blackhole-anim"></div>
                            <div className="absolute text-[12px] blackhole-anim">🕳️</div>
                        </div>
                    </foreignObject>
                )}
            </svg>

            {/* 머지 효과 (HTML Overlay) */}
            {gameState.showDust && (
                <div
                    className="absolute dust-particle pointer-events-none z-50 overflow-hidden"
                    style={{
                        left: `${gameState.showDust.x}%`,
                        top: `${gameState.showDust.y}%`,
                        width: '4%', height: '4%',
                        background: isCyber ? 'rgba(96, 165, 250, 0.4)' : 'rgba(139, 69, 1 brown, 0.4)'
                    }}
                ></div>
            )}
        </div>
    );
};
