import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkOutlineIcon } from '@heroicons/react/24/outline';

const QuizCard = ({ question, index, onAnswer, selected, onFlag, isFlagged, handleKeyDown }) => {
    
    useEffect(() => {
        console.log(`Dados recebidos para a Questão ${index + 1}:`, question);
    }, [question, index]);

    const enunciado = question?.enunciado || "[ERRO: O enunciado desta questão não foi encontrado. Verifique a chave 'enunciado' no seu arquivo JSON.]";

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            // Transição ajustada para ser mais suave e sem "bounce"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`bg-white text-black p-6 md:p-8 rounded-2xl shadow-lg mb-4 border-l-8 transition-colors duration-300 ${isFlagged ? 'border-[--cor-feedback-flag]' : 'border-transparent'} focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[--color-accent]`}
            onKeyDown={handleKeyDown}
            id={`question-card-${index}`}
            aria-labelledby={`question-text-${index}`}
            tabIndex={-1}
        >
            <div className='flex justify-between items-start gap-4'>
                <div className='flex-1'> 
                    <p className='text-sm font-bold text-gray-500 mb-2'>{question?.id || `ID Inválido`}</p>
                    <p className='text-lg leading-relaxed whitespace-pre-line' id={`question-text-${index}`}>{`${index + 1}. ${enunciado}`}</p>
                </div>
                <button 
                    className={`shrink-0 transition-colors duration-200 ${isFlagged ? 'text-[--cor-feedback-flag]' : 'text-gray-400 hover:text-gray-600'}`} 
                    onClick={() => onFlag(index)}
                    aria-label={isFlagged ? `Desmarcar questão ${index + 1} como favorita` : `Marcar questão ${index + 1} como favorita`}
                >
                    {isFlagged ? <BookmarkSolidIcon className="w-6 h-6" /> : <BookmarkOutlineIcon className="w-6 h-6" />}
                </button>
            </div>
            <fieldset className='mt-5' aria-label={`Opções para a questão ${index + 1}`}>
                <legend className="sr-only">Opções</legend>
                <div className='space-y-3'>
                    {["Certo", "Errado"].map((opt, i) => {
                        const isSelected = selected?.value === i;
                        return (
                            <div key={i}>
                                <label
                                    className={`flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${isSelected ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300 hover:border-gray-400'}`}
                                    onClick={() => onAnswer(index, { value: i, questionId: index })}
                                >
                                    <input 
                                      type='radio' 
                                      name={`question-${index}`} 
                                      value={i} 
                                      checked={isSelected} 
                                      readOnly
                                      className='h-5 w-5 mr-4 accent-yellow-500 pointer-events-none' 
                                    />
                                    <span className="font-medium">{opt}</span>
                                </label>
                            </div>
                        );
                    })}
                </div>
            </fieldset>
        </motion.div>
    );
};

export default QuizCard;