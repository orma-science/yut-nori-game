
import React from 'react';
import { GameState, Team } from '../types';

interface GameStatusProps {
    gameState: GameState;
    onReset: () => void;
}

export const GameStatus: React.FC<GameStatusProps> = ({ gameState, onReset }) => {
    const currentTeam = gameState.teams[gameState.currentTeamIndex];

    return (
        <div className="h-full flex flex-col z-20 backdrop-blur-md bg-black/40 border-r-2 border-[#d4af37]/20 shadow-2xl p-4">
            <h2 className="text-4xl font-black text-[#d4af37] text-center mb-6 border-b-2 border-[#d4af37]/20 pb-4 text-glow italic tracking-widest">
                윷놀이 현황
            </h2>

            {/* Current Turn Banner - Very Prominent for TV */}
            <div className="mb-8 bg-gradient-to-r from-black/0 via-[#d4af37]/20 to-black/0 text-center py-4 rounded-xl border-y border-[#d4af37]/30">
                <p className="text-[#d4af37] text-sm font-bold uppercase tracking-[0.3em] mb-2">Current Turn</p>
                <div className="flex items-center justify-center gap-4 animate-pulse">
                    <span className="text-6xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{currentTeam.emoji}</span>
                    <span className="text-5xl font-black" style={{ color: currentTeam.color, textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>
                        {currentTeam.name}
                    </span>
                </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide py-2 px-2">
                {gameState.teams.map((team, idx) => (
                    <div
                        key={team.id}
                        className={`p-5 rounded-[2rem] border-2 transition-all relative 
              ${idx === gameState.currentTeamIndex
                                ? 'bg-[#d4af37]/15 border-[#d4af37] scale-105 shadow-[0_0_30px_rgba(212,175,55,0.2)] z-10'
                                : 'bg-black/40 border-white/5 opacity-60 grayscale-[0.3]'}`}
                    >
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl filter drop-shadow-md">{team.emoji}</span>
                                <p className="font-black text-2xl truncate" style={{ color: team.color }}>{team.name}</p>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-white/50 border-t border-white/5 pt-3">
                                <div className="flex items-center gap-2">
                                    <span className="bg-white/10 px-2 py-1 rounded text-white">대기 {team.piecesAtHome}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-emerald-900/40 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">완주 {team.piecesFinished}</span>
                                </div>
                            </div>
                        </div>
                        {idx === gameState.currentTeamIndex && (
                            <div className="absolute top-3 right-4 w-4 h-4 bg-[#d4af37] rounded-full animate-pulse shadow-[0_0_15px_#d4af37]"></div>
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
