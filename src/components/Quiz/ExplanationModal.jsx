import React, { useEffect } from 'react';

const ExplanationModal = ({ explanation, onClose }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div 
            className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 no-print'
            onClick={onClose}
        >
            <div 
                className='bg-gray-800 p-8 rounded-3xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fade-up border border-gray-700'
                onClick={e => e.stopPropagation()}
            >
                <h3 className='text-2xl font-semibold text-[--color-accent] mb-4'>✨ Explicação da IA</h3>
                
                {/* ALTERAÇÃO: Lógica para formatar o texto da explicação em parágrafos */}
                <div className='text-gray-200 leading-relaxed space-y-4'>
                    {explanation ? (
                        explanation.split('\n').filter(paragraph => paragraph.trim() !== '').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))
                    ) : (
                        <p>Carregando explicação...</p>
                    )}
                </div>

                <button 
                    className='mt-6 px-4 py-2 bg-gray-600 text-gray-200 rounded-xl hover:bg-gray-500'
                    onClick={onClose}
                >
                    Fechar
                </button>
            </div>
        </div>
    );
};

export default ExplanationModal;