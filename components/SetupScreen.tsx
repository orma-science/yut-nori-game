
import React from 'react';

interface SetupScreenProps {
    teamCount: number;
    pieceCount: number;
    setTeamCount: (n: number) => void;
    setPieceCount: (n: number) => void;
    onStart: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
    teamCount, pieceCount, setTeamCount, setPieceCount, onStart
}) => {
    return (
        <div className="h-screen w-screen bg-[#0c0c0c] flex items-center justify-center overflow-hidden">
            <div className="bg-[#1a120b] border-[8px] border-[#d4af37] p-16 rounded-[5rem] text-center shadow-[0_0_80px_rgba(212,175,55,0.3)] max-w-xl w-full relative animate-[zoomIn_0.5s_ease-out]">
                <h1 className="text-7xl font-black text-[#d4af37] mb-14 tracking-widest text-glow italic">윷놀이 한마당</h1>
                <div className="space-y-12 mb-16 relative z-10">
                    <div>
                        <p className="text-[#d4af37] text-2xl mb-6 font-bold">함께할 팀 수</p>
                        <div className="flex justify-center gap-6">
                            {[2, 3, 4].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setTeamCount(n)}
                                    className={`w-20 h-20 rounded-3xl font-black text-3xl border-4 transition-all ${teamCount === n ? 'bg-[#d4af37] text-black border-white scale-110 shadow-2xl' : 'bg-black/40 text-[#d4af37] border-[#d4af37]/40 hover:border-[#d4af37]'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[#d4af37] text-2xl mb-6 font-bold">참여할 말 개수</p>
                        <div className="flex justify-center gap-6">
                            {[2, 3, 4, 5].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setPieceCount(n)}
                                    className={`w-20 h-20 rounded-3xl font-black text-3xl border-4 transition-all ${pieceCount === n ? 'bg-[#d4af37] text-black border-white scale-110 shadow-2xl' : 'bg-black/40 text-[#d4af37] border-[#d4af37]/40 hover:border-[#d4af37]'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <button
                    onClick={onStart}
                    className="w-full bg-gradient-to-b from-[#d4af37] to-[#b4941f] py-8 rounded-full text-5xl font-black text-[#1a120b] shadow-2xl hover:scale-[1.05] transition-all"
                >
                    윷놀이 시작 ⚔️
                </button>
            </div>
        </div>
    );
};
