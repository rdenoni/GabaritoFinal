import React, { useState } from 'react';

const ReviewModal = ({ questions, userAnswers, flaggedQuestions, onCancel, onConfirm }) => {
  const [reviewAnswers, setReviewAnswers] = useState({...userAnswers});

  // Garante que a lista de revisão inclua tanto as respondidas quanto as favoritadas, sem duplicatas.
  const indexesToShow = [...new Set([...Object.keys(userAnswers).map(Number), ...Object.keys(flaggedQuestions).map(Number)])].sort((a,b) => a - b);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 no-print'>
      <div className='bg-gray-800 p-6 rounded-3xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fade-up border border-gray-700'>
        <h3 className='text-xl font-semibold text-[--color-accent] mb-4'>Revisar Questões</h3>
        <div className='space-y-4'>
          {indexesToShow.length > 0 ? (
            indexesToShow.map(index => {
              const i = parseInt(index);
              const question = questions[i]; // Pega o objeto da questão

              // Proteção para o caso de uma questão não ser encontrada
              if (!question) return null;

              return (
                <div key={i} className={`p-4 border rounded-xl ${flaggedQuestions[i] ? 'border-[--cor-feedback-flag]' : 'border-gray-700'}`}>
                  {/* CORRIGIDO: Usando 'question.enunciado' em vez de 'question.question_text' */}
                  <p className='text-sm text-gray-200 whitespace-pre-line'>{`${i + 1}. ${question.enunciado}`}</p>
                  
                  <select 
                    value={reviewAnswers[i] ? reviewAnswers[i].value : ''}
                    onChange={(e) => setReviewAnswers(prev => ({...prev, [i]: { value: parseInt(e.target.value), questionId: i } }))}
                    className='mt-2 w-full p-2 border rounded-lg bg-gray-700 text-gray-200 border-gray-600 focus:ring-0 focus:border-[--color-accent]'
                    aria-label={`Resposta para a questão ${i + 1}`}
                  >
                    <option value="">Não respondida</option>
                    <option value="0">Certo</option>
                    <option value="1">Errado</option>
                  </select>
                </div>
              )
            })
          ) : (
            <p className="text-gray-400 text-center py-8">Nenhuma questão para revisar.</p>
          )}
        </div>
        <div className='mt-6 flex justify-end space-x-4'>
          <button className='px-4 py-2 bg-gray-600 text-gray-200 rounded-xl hover:bg-gray-500' onClick={onCancel}>Fechar</button>
          <button className='px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700' onClick={() => onConfirm(reviewAnswers)}>Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;