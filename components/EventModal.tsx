
import React from 'react';
import { EventDraw } from '../types';

interface EventModalProps {
    drawResult: EventDraw | null;
    isDrawing: boolean;
    onSelect: (index: number) => void;
    onFinalize: () => void;
    giftCount: number; // 추가: 보여줄 선물의 개수
}

export const EventModal: React.FC<EventModalProps> = ({ drawResult, isDrawing, onSelect, onFinalize, giftCount }) => {
    return (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="bg-[#1a120b] border-[12px] border-[#d4af37] p-12 rounded-[6rem] max-w-4xl w-full text-center shadow-[0_0_100px_rgba(212,175,55,0.3)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#2c1d12_0%,#1a120b_100%)] opacity-50"></div>
                <div className="relative z-10">
                    <h2 className="text-7xl font-black text-[#fcd34d] mb-12 italic tracking-tight text-glow">🎁 특별 이벤트 추첨 🎁</h2>
                    {!drawResult ? (
                        <div className="flex justify-center gap-12 px-6">
                            {Array.from({ length: giftCount }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelect(idx)}
                                    disabled={isDrawing}
                                    className={`aspect-square w-48 flex items-center justify-center rounded-[3rem] border-4 bg-black/60 border-[#d4af37]/40 hover:scale-110 hover:border-white hover:bg-[#d4af37]/20 transition-all shadow-2xl animate-[zoomIn_0.3s_ease-out]`}
                                >
                                    <span className="text-[6rem] filter drop-shadow-xl">🎁</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-10 animate-[zoomIn_0.4s_ease-out] px-8">
                            <div className="text-[12rem] filter drop-shadow-[0_0_40px_rgba(255,215,0,0.6)] animate-bounce select-none">✨</div>
                            <h3 className="text-6xl font-black text-white">{drawResult.title}</h3>
                            <p className="text-4xl text-slate-300 italic leading-relaxed">"{drawResult.description}"</p>
                            <button
                                onClick={onFinalize}
                                className="w-full bg-gradient-to-b from-[#d4af37] to-[#b4941f] py-10 rounded-full text-5xl font-black text-black shadow-2xl hover:scale-105 transition-all active:scale-95"
                            >
                                확인
                            </button>
                        </div>
                    )}
                    {isDrawing && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-[4rem]">
                            <div className="text-white text-5xl animate-pulse font-black tracking-widest">이벤트 내용을 추첨 중입니다...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
