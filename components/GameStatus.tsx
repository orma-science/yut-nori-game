
import React from 'react';
import { GameState, Team } from '../types';

interface GameStatusProps {
    gameState: GameState;
    onReset: () => void;
}

export const GameStatus: React.FC<GameStatusProps> = ({ gameState, onReset }) => {
    const currentTeam = gameState.teams[gameState.currentTeamIndex];
    const isCyber = gameState.theme === 'cyber';

    return (
        <div className={`h-full flex flex-col z-20 backdrop-blur-md transition-colors duration-500 border-r-2 p-4 shadow-2xl ${isCyber ? 'bg-blue-950/20 border-blue-500/30 shadow-blue-900/20' : 'bg-black/40 border-[#d4af37]/20'}`}>
            <h2 className={`text-4xl font-black text-center mb-6 border-b-2 pb-4 text-glow italic tracking-widest ${isCyber ? 'text-blue-400 border-blue-500/20' : 'text-[#d4af37] border-[#d4af37]/20'}`}>
                윷놀이 현황
            </h2>

            <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide py-2 px-2">
                {gameState.teams.map((team, idx) => (
                    <div
                        key={team.id}
                        className={`p-5 rounded-[2rem] border-2 transition-all relative overflow-hidden
              ${idx === gameState.currentTeamIndex
                                ? isCyber
                                    ? 'bg-blue-600/20 border-blue-400 scale-105 shadow-[0_0_30px_rgba(96,165,250,0.3)] z-10'
                                    : 'bg-[#d4af37]/15 border-[#d4af37] scale-105 shadow-[0_0_30px_rgba(212,175,55,0.2)] z-10'
                                : isCyber
                                    ? 'bg-black/40 border-blue-900/40 opacity-60 grayscale-[0.2]'
                                    : 'bg-black/40 border-white/5 opacity-60 grayscale-[0.3]'}`}
                    >
                        {isCyber && idx === gameState.currentTeamIndex && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none"></div>
                        )}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl filter drop-shadow-md">{team.emoji}</span>
                                <p className="font-black text-2xl truncate" style={{ color: team.color }}>{team.name}</p>
                                {team.rank !== undefined && (
                                    <div className="ml-auto bg-yellow-500 text-black px-3 py-1 rounded-full font-black text-xl animate-bounce shadow-lg">
                                        {team.rank}등 🏆
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-3 mt-1">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-[10px] font-bold opacity-30 shrink-0 uppercase">Wait</span>
                                    <div className="flex flex-wrap gap-0.5">
                                        {Array.from({ length: team.piecesAtHome }).map((_, i) => (
                                            <span key={i} className="text-xl animate-[float_3s_ease-in-out_infinite] inline-block" style={{ animationDelay: `${i * 0.2}s` }}>
                                                {team.emoji}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 overflow-hidden border-l border-white/5 pl-2">
                                    <span className="text-[10px] font-bold opacity-30 shrink-0 uppercase text-emerald-500">Goal</span>
                                    <div className="flex flex-wrap gap-0.5">
                                        {Array.from({ length: team.piecesFinished }).map((_, i) => (
                                            <span key={i} className="text-xl animate-bounce inline-block" style={{ animationDelay: `${i * 0.1}s` }}>
                                                {team.emoji}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 승리 팀 전용 화려한 이펙트 */}
                        {team.piecesFinished >= gameState.maxPieces && (
                            <div className="absolute inset-0 bg-yellow-400/10 pointer-events-none animate-pulse">
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-yellow-400/50 rounded-[2rem] animate-ping opacity-20"></div>
                                <div className="absolute -top-2 -left-2 text-2xl animate-bounce">🎊</div>
                                <div className="absolute -bottom-2 -right-2 text-2xl animate-bounce delay-500">🎊</div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl opacity-20 rotate-12">VICTORY</div>
                            </div>
                        )}

                        {idx === gameState.currentTeamIndex && team.rank === undefined && (
                            <div className="absolute top-3 right-4 w-3 h-3 bg-[#d4af37] rounded-full animate-pulse shadow-[0_0_15px_#d4af37]"></div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#d4af37]/20">
                <button
                    onClick={onReset}
                    className="w-full py-5 bg-red-950/40 text-red-400 rounded-2xl border-2 border-red-900/40 text-xl font-black hover:bg-red-900/60 transition-all active:scale-95 shadow-lg group"
                >
                    <span className="group-hover:animate-spin inline-block mr-2">↺</span> 판 다시 짜기
                </button>
            </div>
        </div>
    );
};
