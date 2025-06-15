import React, { useState } from 'react';

const ReviewModal = ({ questions, userAnswers, flaggedQuestions, onCancel, onConfirm }) => {
  const [reviewAnswers, setReviewAnswers] = useState({...userAnswers});

  const indexesToShow = [...new Set([...Object.keys(userAnswers), ...Object.keys(flaggedQuestions)])].sort((a,b) => a - b);

  return (
    <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 no-print'>
      <div className='bg-gray-800 p-6 rounded-3xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fade-up border border-gray-700'>
        <h3 className='text-xl font-semibold texto-titulo mb-4'>Revisar Questões</h3>
        <div className='grid gap-4'>
          {indexesToShow.map(index => {
            const i = parseInt(index);
            return (
              <div key={i} className={`p-4 border rounded-xl ${flaggedQuestions[i] ? 'flagged' : 'border-gray-700'}`}>
                <p className='text-sm text-gray-200'>{`${i + 1}. ${questions[i].question_text}`}</p>
                <select 
                  value={reviewAnswers[i] ? reviewAnswers[i].value : ''}
                  onChange={(e) => setReviewAnswers(prev => ({...prev, [i]: { value: parseInt(e.target.value), questionId: i } }))}
                  className='mt-2 w-full p-2 border rounded-lg bg-gray-700 text-gray-200 border-gray-600'
                >
                  <option value="">Não respondida</option>
                  <option value="0">Certo</option>
                  <option value="1">Errado</option>
                </select>
              </div>
            )
          })}
        </div>
        <div className='mt-6 flex justify-end space-x-4'>
          <button className='px-4 py-2 bg-gray-600 text-gray-200 rounded-xl' onClick={onCancel}>Fechar</button>
          <button className='px-4 py-2 bg-yellow-400 text-gray-900 rounded-xl' onClick={() => onConfirm(reviewAnswers)}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;