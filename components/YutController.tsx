
import React from 'react';
import { YutResult } from '../types';

interface YutControllerProps {
    onInput: (result: YutResult) => void;
    disabled: boolean;
}

const Stick: React.FC<{ type: 'flat' | 'round' | 'backdo'; small?: boolean }> = ({ type, small }) => {
    const baseClass = `rounded-full border-2 border-black/20 shadow-sm transition-all ${small ? 'w-2 h-8' : 'w-3 h-12'}`;

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

const YutButton: React.FC<{ result: YutResult; onClick: () => void; label: string; pattern: ('flat' | 'round' | 'backdo')[] }> = ({ result, onClick, label, pattern }) => (
    <button
        onClick={onClick}
        className="group relative flex flex-col items-center justify-center bg-black/40 hover:bg-[#d4af37] py-4 rounded-xl border-2 border-[#d4af37]/30 transition-all active:scale-95 hover:shadow-[0_0_20px_#d4af37]"
    >
        <div className="flex gap-1 mb-2">
            {pattern.map((p, i) => <Stick key={i} type={p} />)}
        </div>
        <span className="text-xl font-black text-[#d4af37] group-hover:text-black">{label}</span>
    </button>
);

export const YutController: React.FC<YutControllerProps> = ({ onInput }) => {

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
                />
            ))}
        </div>
    );
};
