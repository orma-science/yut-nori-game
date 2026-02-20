
import React, { useState } from 'react';
import { VirtualKeyboard } from './VirtualKeyboard';

interface SetupScreenProps {
    teamCount: number;
    pieceCount: number;
    eventCount: number;
    teamNames: string[];
    setTeamCount: (n: number) => void;
    setPieceCount: (n: number) => void;
    setEventCount: (n: number) => void;
    setTeamNames: (names: string[]) => void;
    onStart: () => void;
    theme: 'traditional' | 'cyber';
    setTheme: (t: 'traditional' | 'cyber') => void;
    snackMoney: string;
    setSnackMoney: (val: string) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
    teamCount, pieceCount, eventCount, teamNames, setTeamCount, setPieceCount, setEventCount, setTeamNames, onStart, theme, setTheme, snackMoney, setSnackMoney
}) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleValueChange = (index: number, val: string) => {
        if (index === -1) {
            setSnackMoney(val);
            return;
        }
        const newNames = [...teamNames];
        newNames[index] = val;
        setTeamNames(newNames);
    };

    const isCyber = theme === 'cyber';

    return (
        <div className="h-screen w-screen relative flex items-center justify-center overflow-hidden font-['Jua']">
            {/* 1. 배경 레이어 */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isCyber ? 'bg-[#000510]' : 'bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#90EE90]'}`}>
                {!isCyber && (
                    <>
                        {/* 벚꽃잎 휘날리기 */}
                        <img src="/petals.png" className="absolute top-10 left-10 w-64 opacity-60 animate-[float_10s_ease-in-out_infinite]" alt="" />
                        <img src="/petals.png" className="absolute bottom-40 right-10 w-48 opacity-40 animate-[float_15s_ease-in-out_infinite_reverse]" alt="" />

                        {/* 방패연 */}
                        <img src="/kites.png" className="absolute top-12 right-12 w-80 filter drop-shadow-xl animate-bounce" style={{ animationDuration: '4s' }} alt="" />

                        {/* 하단 캐릭터 배치 (크기 대폭 확대) */}
                        <img src="/girl2.png" className="absolute bottom-[-30px] left-[-30px] w-[28vw] max-w-[450px] z-20 transition-transform hover:scale-105" alt="한복소녀1" />
                        <img src="/girl1.png" className="absolute bottom-[-10px] left-[18%] w-[25vw] max-w-[380px] z-20 transition-transform hover:scale-105" alt="한복소녀2" />
                        <img src="/boy1.png" className="absolute bottom-[-30px] right-[-30px] w-[28vw] max-w-[450px] z-20 transition-transform hover:scale-105" alt="한복소년" />

                        {/* 구름 */}
                        <div className="absolute top-32 left-[10%] w-64 h-12 bg-white/40 rounded-full blur-2xl animate-[cloudMove_30s_linear_infinite]"></div>
                    </>
                )}
                {isCyber && <div className="cyber-grid opacity-20"></div>}
            </div>

            {/* 메인 설정창 컨테이너 */}
            <div className={`
                relative w-[92%] max-w-[1000px] bg-white/95 backdrop-blur-md rounded-[50px] 
                border-[10px] p-10 flex flex-col items-center shadow-[0_25px_60px_rgba(0,0,0,0.2)]
                ${isCyber ? 'border-blue-500 bg-black/80' : 'border-[#FFD700]'}
            `}>

                {/* 상단 테마 버튼 */}
                <div className="absolute -top-12 right-0 flex gap-3">
                    <button onClick={() => setTheme('traditional')} className={`px-8 py-2.5 rounded-full font-black text-xl border-4 transition-all shadow-md ${theme === 'traditional' ? 'bg-[#FFD700] text-black border-white' : 'bg-white/90 text-gray-400 border-gray-100'}`}>전통 모드</button>
                    <button onClick={() => setTheme('cyber')} className={`px-8 py-2.5 rounded-full font-black text-xl border-4 transition-all shadow-md ${theme === 'cyber' ? 'bg-blue-600 text-white border-blue-400' : 'bg-white/90 text-gray-400 border-gray-100'}`}>사이버 모드</button>
                </div>

                {/* 타이틀 */}
                <div className="text-center mb-6 w-full overflow-visible">
                    <h1 className="text-8xl font-black italic mb-2 bg-clip-text text-transparent bg-gradient-to-b from-orange-400 via-orange-500 to-orange-700 drop-shadow-[0_6px_0_#FFD700] px-10 inline-block">
                        SUPER 윷놀이
                    </h1>
                    <p className="text-2xl font-bold text-gray-500">
                        오르마 게임 개발연구소 <span className="mx-2 text-gray-300">|</span> 소통과 화합의 프로젝트
                    </p>
                </div>

                {/* 중앙 2열 레이아웃 */}
                <div className="flex w-full gap-12 mb-2">
                    {/* 설정 영역 */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">🤼</span>
                                <label className="text-2xl font-black text-gray-700">참여 팀 설정</label>
                            </div>
                            <div className="flex gap-3">
                                {[2, 3, 4].map(n => (
                                    <button key={n} onClick={() => setTeamCount(n)} className={`flex-1 py-3 rounded-2xl text-2xl font-black border-4 transition-all ${teamCount === n ? 'bg-[#FFD700] border-white shadow-md' : 'bg-[#FFF9F0] text-gray-300 border-stone-50'}`}>{n}</button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">🏯</span>
                                <label className="text-2xl font-black text-gray-700">말 개수 설정</label>
                            </div>
                            <div className="flex gap-3">
                                {[2, 3, 4, 5].map(n => (
                                    <button key={n} onClick={() => setPieceCount(n)} className={`flex-1 py-3 rounded-2xl text-2xl font-black border-4 transition-all ${pieceCount === n ? 'bg-[#FFD700] border-white shadow-md' : 'bg-[#FFF9F0] text-gray-300 border-stone-50'}`}>{n}</button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">🧧</span>
                                <label className="text-2xl font-black text-gray-700">이벤트 코너</label>
                            </div>
                            <div className="grid grid-cols-6 gap-2">
                                {[0, 1, 2, 3, 4, 5].map(n => (
                                    <button key={n} onClick={() => setEventCount(n)} className={`py-2 rounded-xl text-lg font-black border-2 transition-all ${eventCount === n ? 'bg-[#FFD700] border-white' : 'bg-[#FFF9F0] text-gray-300 border-stone-50'}`}>{n}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 정보 영역 */}
                    <div className="flex-1 space-y-6 flex flex-col justify-center border-l-2 border-dashed border-gray-100 pl-10">
                        <div className={`grid ${teamCount > 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                            {Array.from({ length: teamCount }).map((_, i) => (
                                <input
                                    key={i}
                                    readOnly
                                    onClick={() => setEditingIndex(i)}
                                    value={teamNames[i] || `${i + 1}팀 이름`}
                                    className="w-full py-4 px-6 rounded-3xl border-4 border-orange-300 text-lg font-bold bg-white text-gray-700 shadow-inner cursor-pointer"
                                />
                            ))}
                        </div>
                        <div className="pt-4">
                            <label className="block text-xl font-black text-gray-500 mb-2">오늘 쏠 간식!</label>
                            <input
                                readOnly
                                onClick={() => setEditingIndex(-1)}
                                value={snackMoney || "간식을 입력하세요"}
                                className="w-full py-5 px-6 rounded-3xl border-4 border-dashed border-orange-200 text-3xl font-black text-orange-600 bg-orange-50/30 text-center cursor-pointer cursor-animated"
                            />
                        </div>
                    </div>
                </div>

                {/* 시작 버튼 */}
                <div className="w-full mt-4">
                    <button
                        onClick={onStart}
                        className="group relative w-full py-7 rounded-full text-5xl font-black text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 border-4 border-white shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                        게 임 시 작 하 기 ⚔️
                    </button>
                </div>
            </div>

            {editingIndex !== null && (
                <VirtualKeyboard
                    value={editingIndex === -1 ? snackMoney : (teamNames[editingIndex] || "")}
                    onChange={(val) => handleValueChange(editingIndex, val)}
                    onClose={() => setEditingIndex(null)}
                    theme={theme}
                />
            )}

            <style>{`
                @keyframes cloudMove {
                    0% { transform: translateX(-200px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateX(100vw); opacity: 0; }
                }
                .cursor-animated {
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};
