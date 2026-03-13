// src/components/Shared/PageLoading.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PageLoading = ({ progress = 0 }) => {
    const [displayedProgress, setDisplayedProgress] = useState(0);

    useEffect(() => {
        const animateProgress = () => {
            let current = 0;
            const interval = setInterval(() => {
                current += 1;
                if (current > progress) {
                    clearInterval(interval);
                    current = progress;
                }
                setDisplayedProgress(current);
            }, 10);
        };

        animateProgress();

        // Opcional: Adicionar um pequeno delay para que 100% seja visível
        if (progress === 100) {
            const timeout = setTimeout(() => {
                // Aqui você pode adicionar lógica para esconder o loading se ele for controlado internamente
            }, 300);
            return () => clearTimeout(timeout);
        }

        return () => {
            // Limpa o progresso ao desmontar
            setDisplayedProgress(0);
        };
    }, [progress]);

    return (
        <div className="fixed inset-0 bg-[--color-bg-hero] flex flex-col items-center justify-center z-50">
            <motion.p
                className="text-white text-xl mb-6 font-semibold"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            >
                Carregando...
            </motion.p>
            <div className="w-80 h-3 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-[--color-accent] rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${displayedProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                ></motion.div>
            </div>
        </div>
    );
};

export default PageLoading;