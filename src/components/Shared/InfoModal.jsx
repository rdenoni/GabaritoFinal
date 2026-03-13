// src/components/Shared/InfoModal.jsx
import React, { useEffect } from 'react'; // Importa o useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';

const InfoModal = ({ isOpen, onClose, title, children }) => {
    // ALTERAÇÃO: Efeito para bloquear o scroll do body
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        // Função de limpeza para reabilitar o scroll ao fechar ou desmontar
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-gray-800 text-white w-full max-w-md rounded-xl shadow-lg p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="text-text-secondary">
                        {children}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InfoModal;