
import React, { useState, useEffect } from 'react';
import * as Hangul from 'hangul-js';

interface VirtualKeyboardProps {
    value: string;
    onChange: (val: string) => void;
    onClose: () => void;
    theme?: 'traditional' | 'cyber';
}

type LayoutType = 'ko' | 'en' | 'symbol';

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ value, onChange, onClose, theme }) => {
    const [layout, setLayout] = useState<LayoutType>('ko');
    const [isShift, setIsShift] = useState(false);
    const isCyber = theme === 'cyber';

    const koRows = [
        isShift ? ["ㅃ", "ㅉ", "ㄸ", "ㄲ", "ㅆ", "ㅒ", "ㅖ"] : ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ"],
        ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"],
        ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ"]
    ];

    const enRows = [
        isShift ? ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"] : ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        isShift ? ["A", "S", "D", "F", "G", "H", "J", "K", "L"] : ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        isShift ? ["Z", "X", "C", "V", "B", "N", "M"] : ["z", "x", "c", "v", "b", "n", "m"]
    ];

    const symRows = [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
        ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"],
        ["-", "=", "_", "+", "[", "]", "{", "}", ";", "'", ":", "?", "."]
    ];

    const getCurrentRows = () => {
        if (layout === 'en') return enRows;
        if (layout === 'symbol') return symRows;
        return koRows;
    };

    const getRandomName = () => {
        const names = [
            "전설의 윷잡이", "빽도 대장", "모 아니면 도", "걸출한 수재들",
            "사이버 윷전사", "전승 무적", "웃음 보따리", "슈퍼 울트라",
            "동네 백수", "강남 도령", "빛의 속도", "천하 제일", "무적 함대"
        ];
        const randomName = names[Math.floor(Math.random() * names.length)];
        onChange(randomName);
    };

    const handleKeyClick = (key: string) => {
        if (layout === 'ko') {
            // Hangul composition logic
            const jamos = Hangul.disassemble(value);
            jamos.push(key);
            const assembled = Hangul.assemble(jamos);
            if (assembled.length <= 8) {
                onChange(assembled);
            }
        } else {
            if (value.length < 8) {
                onChange(value + key);
            }
        }
        if (isShift) setIsShift(false);
    };

    const handleBackspace = () => {
        if (layout === 'ko') {
            const jamos = Hangul.disassemble(value);
            jamos.pop();
            onChange(Hangul.assemble(jamos));
        } else {
            onChange(value.slice(0, -1));
        }
    };

    const handleSpace = () => {
        if (value.length < 8) {
            onChange(value + " ");
        }
    };

    useEffect(() => {
        const handlePhysicalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Backspace') {
                handleBackspace();
                return;
            }
            if (e.key === ' ') {
                handleSpace();
                return;
            }
            if (e.key === 'Enter') {
                onClose();
                return;
            }
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key === 'Shift') {
                setIsShift(true);
                return;
            }

            // Key mapping
            if (layout === 'ko') {
                const koMap: Record<string, string> = {
                    'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ', 'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
                    'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ', 'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
                    'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ',
                    'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ', 'O': 'ㅒ', 'P': 'ㅖ'
                };
                const jamo = koMap[e.key];
                if (jamo) handleKeyClick(jamo);
            } else if (layout === 'en') {
                if (/^[a-zA-Z]$/.test(e.key)) {
                    handleKeyClick(e.key);
                }
            } else if (layout === 'symbol') {
                if (symRows.flat().includes(e.key)) {
                    handleKeyClick(e.key);
                }
            }
        };

        const handlePhysicalKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') setIsShift(false);
        };

        window.addEventListener('keydown', handlePhysicalKeyDown);
        window.addEventListener('keyup', handlePhysicalKeyUp);
        return () => {
            window.removeEventListener('keydown', handlePhysicalKeyDown);
            window.removeEventListener('keyup', handlePhysicalKeyUp);
        };
    }, [value, layout, isShift, onChange, onClose]);

    return (
        <div className={`fixed inset-x-0 bottom-0 z-[1000] p-6 pt-8 animate-fadeIn pb-12 ${isCyber ? 'bg-[#000814]/95 backdrop-blur-2xl border-t-2 border-blue-500/50 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]' : 'bg-[#1a120b]/98 backdrop-blur-md border-t-8 border-[#d4af37]'}`}>
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-4">
                        <button onClick={() => setLayout('ko')} className={`px-8 py-3 rounded-2xl font-black text-xl transition-all shadow-lg ${layout === 'ko' ? (isCyber ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-[#d4af37] text-black') : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>한글</button>
                        <button onClick={() => setLayout('en')} className={`px-8 py-3 rounded-2xl font-black text-xl transition-all shadow-lg ${layout === 'en' ? (isCyber ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-[#d4af37] text-black') : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>EN</button>
                        <button onClick={() => setLayout('symbol')} className={`px-8 py-3 rounded-2xl font-black text-xl transition-all shadow-lg ${layout === 'symbol' ? (isCyber ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-[#d4af37] text-black') : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>기호</button>
                        <button onClick={getRandomName} className={`px-8 py-3 rounded-2xl font-black text-xl transition-all shadow-lg border-2 ${isCyber ? 'bg-indigo-600/30 border-blue-400 text-blue-200' : 'bg-green-900/30 border-green-500 text-green-300'}`}>🎲 랜덤추천</button>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className={`px-6 py-3 rounded-2xl text-2xl font-black border-2 ${isCyber ? 'bg-black/40 border-blue-500/20 text-blue-400' : 'bg-black/60 border-[#d4af37]/30 text-[#d4af37]'} min-w-[200px] text-center`}>
                            {value || <span className="opacity-20">입력중...</span>}
                        </div>
                        <button onClick={onClose} className="bg-red-900/60 text-white px-6 py-3 rounded-2xl font-black hover:bg-red-600 shadow-xl transition-all active:scale-95">입력완료</button>
                    </div>
                </div>

                <div className="space-y-3">
                    {getCurrentRows().map((row, rowIdx) => (
                        <div key={rowIdx} className="flex justify-center gap-2">
                            {row.map((key, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleKeyClick(key)}
                                    className={`h-16 px-6 lg:px-8 rounded-2xl text-2xl font-black transition-all active:scale-90 shadow-xl flex items-center justify-center min-w-[60px]
                                        ${isCyber
                                            ? 'bg-blue-900/40 border-2 border-blue-500/20 text-blue-100 hover:bg-blue-500/40 hover:border-blue-300'
                                            : 'bg-white/5 border-2 border-white/10 text-[#d4af37] hover:bg-[#d4af37] hover:text-black'}`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    ))}

                    {/* Function Row */}
                    <div className="flex justify-center gap-2 pt-2">
                        <button
                            onClick={() => setIsShift(!isShift)}
                            className={`h-16 px-10 rounded-2xl text-xl font-black border-2 transition-all shadow-xl ${isShift ? (isCyber ? 'bg-blue-400 text-black border-white' : 'bg-[#d4af37] text-black border-white') : (isCyber ? 'bg-blue-900/60 border-blue-500/30 text-blue-300' : 'bg-white/10 border-white/10 text-white/60')}`}
                        >
                            SHIFT
                        </button>
                        <button
                            onClick={handleSpace}
                            className={`h-16 px-24 rounded-2xl text-xl font-black border-2 shadow-xl ${isCyber ? 'bg-blue-900/60 border-blue-500/30 text-blue-300' : 'bg-white/10 border-white/10 text-white/60'}`}
                        >
                            SPACE
                        </button>
                        <button
                            onClick={handleBackspace}
                            className="h-16 px-10 rounded-2xl bg-red-950/60 border-2 border-red-500/30 text-red-400 text-xl font-black hover:bg-red-900 shadow-xl transition-all"
                        >
                            ⌫ BACK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
