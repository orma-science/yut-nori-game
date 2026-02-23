
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
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [showHelp, setShowHelp] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const moveX = (clientX - window.innerWidth / 2) / 50;
        const moveY = (clientY - window.innerHeight / 2) / 50;
        setMousePos({ x: moveX, y: moveY });
    };

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
        <div
            className="h-screen w-screen relative flex items-center justify-center overflow-hidden font-['Nanum_Myeongjo']"
            onMouseMove={handleMouseMove}
        >
            {/* 1. 배경 레이어 */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isCyber ? 'bg-[#000510]' : 'bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#90EE90]'}`}>
                {!isCyber && (
                    <>
                        {/* 벚꽃잎 휘날리기 (가장 멀리 있음) */}
                        <img
                            src="/petals.png"
                            className="absolute top-10 left-10 w-64 opacity-60 animate-[float_10s_ease-in-out_infinite]"
                            style={{ transform: `translate(${mousePos.x * 0.2}px, ${mousePos.y * 0.2}px)` }}
                            alt=""
                        />
                        <img
                            src="/petals.png"
                            className="absolute bottom-40 right-10 w-48 opacity-40 animate-[float_15s_ease-in-out_infinite_reverse]"
                            style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)` }}
                            alt=""
                        />

                        {/* 구름 */}
                        <div
                            className="absolute top-32 left-[10%] w-64 h-12 bg-white/40 rounded-full blur-2xl animate-[cloudMove_30s_linear_infinite]"
                            style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
                        ></div>

                        {/* 방패연 (중간 깊이) */}
                        <img
                            src="/kites.png"
                            className="absolute top-12 right-12 w-80 filter drop-shadow-xl animate-bounce"
                            style={{
                                animationDuration: '4s',
                                transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`
                            }}
                            alt=""
                        />

                        {/* 하단 캐릭터 배치 (가장 가까이 있음 - 깊이감 강조) */}
                        <img
                            src="/girl2.png"
                            className="absolute bottom-[-30px] left-[-30px] w-[28vw] max-w-[450px] z-20 transition-transform hover:scale-105"
                            style={{ transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)` }}
                            alt="한복소녀1"
                        />
                        <img
                            src="/boy1.png"
                            className="absolute bottom-[-30px] right-[-30px] w-[28vw] max-w-[450px] z-20 transition-transform hover:scale-105"
                            style={{ transform: `translate(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px)` }}
                            alt="한복소년"
                        />
                    </>
                )}
                {isCyber && (
                    <div
                        className="cyber-grid opacity-20"
                        style={{ transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}
                    ></div>
                )}
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

                {/* 도움말 버튼 - 타이틀 위 */}
                <div className="w-full flex justify-end mb-2">
                    <button
                        onClick={() => setShowHelp(true)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-full font-black text-lg border-2 transition-all hover:scale-105 active:scale-95 shadow-md
                            ${isCyber ? 'bg-blue-600/30 text-blue-200 border-blue-500/50 hover:bg-blue-600/60' : 'bg-orange-100 text-orange-600 border-orange-300 hover:bg-orange-200'}`}
                    >
                        <span className="text-xl">❓</span> 게임 도움말
                    </button>
                </div>

                {/* 타이틀 */}
                <div className="text-center mb-6 w-full overflow-visible">
                    <h1 className="text-8xl font-black italic mb-2 bg-clip-text text-transparent bg-gradient-to-b from-orange-400 via-orange-500 to-orange-700 drop-shadow-[0_6px_0_#FFD700] px-10 inline-block font-['Jua']">
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
                                <label className={`text-2xl font-black ${isCyber ? 'text-blue-100' : 'text-gray-700'}`}>참여 팀 설정</label>
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
                                <label className={`text-2xl font-black ${isCyber ? 'text-blue-100' : 'text-gray-700'}`}>말 개수 설정</label>
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
                                <label className={`text-2xl font-black ${isCyber ? 'text-blue-100' : 'text-gray-700'}`}>이벤트 코너</label>
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
                            <label className={`block text-xl font-black mb-2 ${isCyber ? 'text-blue-200' : 'text-gray-500'}`}>오늘 쏠 간식!</label>
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
                <div className="w-full mt-4 relative">
                    <button
                        onClick={onStart}
                        className="group relative w-full py-7 rounded-full text-5xl font-black text-white bg-gradient-to-r from-yellow-400 via-orange-500 to-orange-600 border-4 border-white shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95"
                    >
                        게 임 시 작 하 기 ⚔️
                    </button>
                    {!isCyber && (
                        <img
                            src="/girl1.png"
                            className="absolute -right-20 -bottom-16 w-[20vw] max-w-[300px] z-30 transition-transform hover:scale-110 pointer-events-none"
                            style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` }}
                            alt="한복소녀2"
                        />
                    )}
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

            {/* 도움말 모달 */}
            {showHelp && (
                <div
                    className="fixed inset-0 z-[9000] bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
                    onClick={() => setShowHelp(false)}
                >
                    <div
                        className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[3rem] border-4 shadow-2xl p-8
                            ${isCyber ? 'bg-blue-950 border-blue-400' : 'bg-[#1a120b] border-[#d4af37]'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 닫기 버튼 */}
                        <button
                            onClick={() => setShowHelp(false)}
                            className="absolute top-5 right-5 text-4xl text-white/40 hover:text-white transition-colors"
                        >✕</button>

                        <h2 className={`text-4xl font-black text-center mb-8 ${isCyber ? 'text-blue-300' : 'text-[#d4af37]'}`}>
                            📖 게임 도움말
                        </h2>

                        {/* 특수 칸 설명 */}
                        <section className="mb-8">
                            <h3 className={`text-2xl font-black mb-4 border-b pb-2 ${isCyber ? 'text-blue-200 border-blue-500/30' : 'text-[#d4af37] border-[#d4af37]/30'}`}>
                                ⚡ 특수 칸 설명
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5">
                                    <img src="/event.png" alt="이벤트" className="w-14 h-14 object-contain shrink-0" />
                                    <div>
                                        <div className="font-black text-lg text-white">이벤트 코너</div>
                                        <div className="text-white/60 text-sm">도착하면 이벤트 뽑기! 좋은 일? 나쁜 일? 운명을 받아들여라!</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5">
                                    <img src="/blackhall.png" alt="블랙홀" className="w-14 h-14 object-contain shrink-0 animate-[spin_8s_linear_infinite]" />
                                    <div>
                                        <div className="font-black text-lg text-white">🕳️ 블랙홀</div>
                                        <div className="text-white/60 text-sm">판 위의 <span className="text-red-400 font-bold">모든 팀 말</span>이 집으로 돌아갑니다!</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5">
                                    <img src="/cat.png" alt="업어" className="w-14 h-14 object-contain shrink-0" />
                                    <div>
                                        <div className="font-black text-lg text-white">💑 업어! 코너</div>
                                        <div className="text-white/60 text-sm">집에서 기다리던 같은 팀 말 하나를 무료로 태웁니다!</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 이벤트 목록 */}
                        <section className="mb-8">
                            <h3 className={`text-2xl font-black mb-4 border-b pb-2 ${isCyber ? 'text-blue-200 border-blue-500/30' : 'text-[#d4af37] border-[#d4af37]/30'}`}>
                                🧧 이벤트 목록
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { icon: '🔙', name: '전략적 후퇴', desc: '2칸 뒤로 이동. 적을 잡으면 한 번 더!' },
                                    { icon: '🚀', name: '급행 열차', desc: '3칸 전진! 적을 잡으면 한 번 더!' },
                                    { icon: '✨', name: '황금 윷가락', desc: '보너스 턴 획득! 윷가락을 한 번 더 던집니다' },
                                    { icon: '😱', name: '강제 귀가 조치', desc: '현재 말이 집으로 강제 귀환' },
                                    { icon: '💤', name: '강제 동면', desc: '너무 피곤해서 다음 한 턴을 쉽니다' },
                                    { icon: '🔄', name: '운명의 장난', desc: '가장 앞서가는 상대 말과 위치를 교환!' },
                                    { icon: '🌀', name: '오르마 워프', desc: '가장 뒤처진 팀을 판의 중앙으로 워프!' },
                                    { icon: '🍿', name: '간식 쏜다!', desc: '당첨 팀은 모두에게 간식을 쏩니다!' },
                                ].map(ev => (
                                    <div key={ev.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
                                        <span className="text-2xl w-8 text-center shrink-0">{ev.icon}</span>
                                        <div>
                                            <span className="font-black text-white text-sm">{ev.name}</span>
                                            <span className="text-white/50 text-sm ml-2">{ev.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 추가 규칙 */}
                        <section>
                            <h3 className={`text-2xl font-black mb-4 border-b pb-2 ${isCyber ? 'text-blue-200 border-blue-500/30' : 'text-[#d4af37] border-[#d4af37]/30'}`}>
                                ✅ 추가 규칙
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { icon: '🎯', text: '상대 말 잡기: 같은 칸에 도착하면 상대 말을 집으로 보내고 한 번 더!' },
                                    { icon: '🤝', text: '말 업기: 같은 팀 말끼리 같은 칸에 있으면 함께 이동합니다' },
                                    { icon: '🏆', text: '윷·모: 던지고 나면 한 번 더 던질 기회가 생깁니다!' },
                                    { icon: '↩️', text: '빽도: 말이 한 칸 뒤로 갑니다. 판에 말이 없으면 턴이 넘어갑니다' },
                                    { icon: '🏁', text: '완주: 모든 말을 골인시키면 등수가 부여됩니다' },
                                    { icon: '↺', text: '되돌리기: 우측 하단 버튼으로 직전 수를 취소할 수 있습니다' },
                                ].map(rule => (
                                    <div key={rule.text} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5">
                                        <span className="text-xl shrink-0 mt-0.5">{rule.icon}</span>
                                        <p className="text-white/70 text-sm leading-snug">{rule.text}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <button
                            onClick={() => setShowHelp(false)}
                            className={`w-full mt-8 py-4 rounded-2xl text-xl font-black transition-all active:scale-95 ${isCyber ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-[#d4af37] text-black hover:bg-yellow-300'
                                }`}
                        >
                            확인했습니다! 게임 시작! 🎲
                        </button>
                    </div>
                </div>
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
