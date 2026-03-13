// src/components/Shared/GenericConfirmModal.jsx
import React, { useEffect } from 'react'; // Importa o useEffect
import { motion, AnimatePresence } from 'framer-motion';

const GenericConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Confirmar", 
    cancelText = "Cancelar" 
}) => {
    // ALTERAÇÃO: Efeito para bloquear o scroll do body
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        // Função de limpeza para reabilitar o scroll ao fechar o modal
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 no-print'>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className='bg-gray-800 p-6 rounded-3xl shadow-lg max-w-md w-full border border-gray-700'
                    >
                        <h3 className='text-xl font-semibold text-white mb-4'>{title}</h3>
                        <p className='text-gray-300 mb-6'>{message}</p>
                        <div className='flex justify-end space-x-4'>
                            <button className='px-4 py-2 bg-gray-600 text-gray-200 rounded-xl hover:bg-gray-500 transition-colors' onClick={onClose}>
                                {cancelText}
                            </button>
                            <button className='px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors' onClick={onConfirm}>
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default GenericConfirmModal;