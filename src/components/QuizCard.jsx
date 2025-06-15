import React from 'react';

const QuizCard = ({ question, index, onAnswer, selected, onFlag, isFlagged }) => {
    return (
        <div className={`bg-white text-black p-6 md:p-8 rounded-2xl shadow-lg mb-6 border-l-8 transition-colors duration-300 ${isFlagged ? 'border-[--cor-feedback-flag]' : 'border-transparent'}`}>
            <div className='flex justify-between items-start gap-4'>
                <p className='text-lg flex-1 leading-relaxed'>{`${index + 1}. ${question.question_text}`}</p> {/* */}
                <button 
                    className={`shrink-0 transition-colors duration-200 ${isFlagged ? 'text-[--cor-feedback-flag]' : 'text-gray-400 hover:text-gray-600'}`} 
                    onClick={() => onFlag(index)} //
                    aria-label={isFlagged ? "Desmarcar questão" : "Marcar questão"}
                >
                    <svg xmlns='http://www.w3.org/2000/svg' className="w-6 h-6" viewBox='0 0 24 24' fill='currentColor'><path d='M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z' /></svg>
                </button>
            </div>
            <fieldset className='mt-5'>
                <legend className="sr-only">Opções</legend>
                <div className='space-y-3'>
                    {["Certo", "Errado"].map((opt, i) => { //
                        const isSelected = selected?.value === i;
                        return (
                            <div key={i}>
                                <label
                                    className={`flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${isSelected ? 'border-[--cor-botoes-acao] bg-yellow-50' : 'border-gray-300 hover:border-gray-400'}`}
                                    onClick={() => onAnswer(index, { value: i, questionId: index })} //
                                >
                                    <input 
                                      type='radio' 
                                      name={`question-${index}`} 
                                      value={i} 
                                      checked={isSelected} 
                                      onChange={() => {}} 
                                      className='h-5 w-5 mr-4 accent-[--cor-botoes-acao]' 
                                    />
                                    <span className="font-medium">{opt}</span>
                                </label>
                            </div>
                        );
                    })}
                </div>
            </fieldset>
        </div>
    );
};

export default QuizCard;