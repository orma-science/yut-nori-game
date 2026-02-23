
import React from 'react';
import { YutResult } from '../types';

interface YutControllerProps {
    onInput: (result: YutResult) => void;
    disabled: boolean;
    theme?: 'traditional' | 'cyber';
}

const Stick: React.FC<{ type: 'flat' | 'round' | 'backdo'; small?: boolean; theme?: string }> = ({ type, small, theme }) => {
    const isCyber = theme === 'cyber';
    const baseClass = `rounded-full border-2 transition-all ${small ? 'w-2 h-8' : 'w-3 h-12'} ${isCyber ? 'border-blue-400/50' : 'border-black/20'}`;

    if (isCyber) {
        // Cyber energy bar look
        const color = type === 'flat' ? 'bg-blue-400 shadow-[0_0_10px_#60A5FA]' : 'bg-blue-900/60';
        return (
            <div className={`${baseClass} ${color} relative flex items-center justify-center`}>
                {type === 'backdo' && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-red-500 font-bold animate-pulse">!</div>}
            </div>
        );
    }

    if (type === 'round') {
        // Round side (Back of stick) - Darker, convex look
        return <div className={`${baseClass} bg-[#4a3b2a] bg-[linear-gradient(90deg,rgba(0,0,0,0.2),transparent,rgba(255,255,255,0.1))]`}></div>;
    }

    if (type === 'flat') {
        // Flat side (Front of stick) - Lighter wood
        return (
            <div className={`${baseClass} bg-[#e8d5b5] flex items-center justify-center`}>
                <div className="text-[8px] opacity-30 text-[#4a3b2a]">XXX</div>
            </div>
        );
    }

    if (type === 'backdo') {
        // Marked Flat side for Back Do
        return (
            <div className={`${baseClass} bg-[#e8d5b5] flex items-center justify-center relative`}>
                <div className="absolute inset-0 flex items-center justify-center text-red-600 font-bold text-[10px]">BACK</div>
            </div>
        );
    }
    return null;
};

const YutButton: React.FC<{ result: YutResult; onClick: () => void; label: string; pattern: ('flat' | 'round' | 'backdo')[], theme?: string }> = ({ result, onClick, label, pattern, theme }) => {
    const isCyber = theme === 'cyber';
    return (
        <button
            onClick={onClick}
            className={`group relative flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all active:scale-95 
                ${isCyber
                    ? 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-600/40 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.5)]'
                    : 'bg-black/40 border-[#d4af37]/30 hover:bg-[#d4af37] hover:shadow-[0_0_20px_#d4af37]'}`}
        >
            <div className="flex gap-1 mb-2">
                {pattern.map((p, i) => <Stick key={i} type={p} theme={theme} />)}
            </div>
            <span className={`text-xl font-black ${isCyber ? 'text-blue-400 group-hover:text-blue-100' : 'text-[#d4af37] group-hover:text-black'}`}>{label}</span>
        </button>
    );
};

export const YutController: React.FC<YutControllerProps> = ({ onInput, theme }) => {

    const patterns: Record<YutResult, ('flat' | 'round' | 'backdo')[]> = {
        'DO': ['round', 'round', 'round', 'flat'],
        'GAE': ['round', 'round', 'flat', 'flat'],
        'GEOL': ['round', 'flat', 'flat', 'flat'],
        'YUT': ['flat', 'flat', 'flat', 'flat'],
        'MO': ['round', 'round', 'round', 'round'],
        'BACK_DO': ['round', 'round', 'round', 'backdo']
    };

    const labels: Record<YutResult, string> = {
        'DO': '도', 'GAE': '개', 'GEOL': '걸',
        'YUT': '윷', 'MO': '모', 'BACK_DO': '빽도'
    };

    const order: YutResult[] = ['DO', 'GAE', 'GEOL', 'YUT', 'MO', 'BACK_DO'];

    return (
        <div className="grid grid-cols-3 gap-3 p-2">
            {order.map(res => (
                <YutButton
                    key={res}
                    result={res}
                    onClick={() => onInput(res)}
                    label={labels[res]}
                    pattern={patterns[res]}
                    theme={theme}
                />
            ))}
        </div>
    );
};
