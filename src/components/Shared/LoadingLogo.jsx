// src/components/Shared/LoadingLogo.jsx

import React from 'react';

const LoadingLogo = ({ className = '', progress = 0 }) => {
    const path1 = "M118.92,6.61L45.69,87.58c-1.72,1.9-4.71,1.89-6.42-.02L0,43.45l16.39-14.86,26.41,32c.16.23.49.27.7.08L113.21,0l5.71,6.61Z";
    const path2 = "M71.99,92.48l4.78,8.46c-3.48,3.58-16.21,14.88-34.84,14.88s-31.39-11.29-34.87-14.88l4.74-8.46c3.45,2.49,14.78,10.65,30.13,10.65s26.62-8.16,30.06-10.65Z";

    // O progresso controla o preenchimento da direita para a esquerda
    const clipPercent = 100 - progress;
    
    const fillStyle = {
        clipPath: `inset(0 ${clipPercent}% 0 0)`
    };

    return (
        <div className={`relative ${className}`}>
            {/* Camada 1: A base da logo em cinza */}
            <svg
                viewBox="0 0 121.83 115.82"
                className="absolute inset-0 w-full h-full text-gray-600"
                fill="currentColor"
                aria-hidden="true"
            >
                <path d={path1} />
                <path d={path2} />
            </svg>

            {/* Camada 2: A versão verde que é preenchida com base no progresso */}
            <svg
                viewBox="0 0 121.83 115.82"
                className="absolute inset-0 w-full h-full text-[#00e28f] transition-all duration-300 ease-linear"
                fill="currentColor"
                aria-hidden="true"
                style={fillStyle}
            >
                <path d={path1} />
                <path d={path2} />
            </svg>
        </div>
    );
};

export default LoadingLogo;