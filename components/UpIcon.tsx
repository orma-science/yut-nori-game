
import React from 'react';

// 사용자가 제공한 cat.png 이미지를 사용하여 "업" 아이콘(업힌 말)을 표시합니다.
export const UpIcon: React.FC<{ size?: string | number }> = ({ size = '100%' }) => (
    <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center relative active:scale-95 transition-transform"
    >
        {/* 고양이 이미지 배치 (정적 상태로 변경) */}
        <img
            src="/cat.png"
            alt="업"
            className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
        />

        <style>{`
            /* 애니메이션 제거됨 */
        `}</style>
    </div>
);
