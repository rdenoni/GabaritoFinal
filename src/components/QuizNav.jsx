import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';

const QuizNav = ({ currentPageIndex, totalQuestions, itemsPerPage, setCurrentPageIndex, submitQuiz, userAnswers }) => {
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const totalPages = Math.ceil(totalQuestions / itemsPerPage);
  const isLastPage = currentPageIndex === totalPages - 1;

  const handleConfirmSubmit = () => {
    setConfirmModalOpen(false);
    submitQuiz();
  };

  return (
    <>
      <div className="fixed sm:bottom-6 bottom-4 left-0 right-0 flex justify-center no-print">
        <div 
          className="p-4 rounded-2xl shadow-lg flex space-x-4 border"
          style={{ 
            backgroundColor: 'rgba(40, 56, 76, 0.9)', 
            borderColor: 'var(--cor-borda-padrao)', 
            backdropFilter: 'blur(5px)' 
          }}
        >
          <button 
            className="btn btn-nav"
            onClick={() => setCurrentPageIndex(p => p - 1)}
            disabled={currentPageIndex === 0}
          >
            Anterior
          </button>
          
          <button
            className="btn btn-ok pulse-highlight"
            onClick={() => setConfirmModalOpen(true)}
            disabled={Object.keys(userAnswers).length === 0}
          >
            Corrigir
          </button>
          
          <button 
            className="btn btn-nav"
            onClick={() => setCurrentPageIndex(p => p + 1)}
            disabled={isLastPage}
          >
            Próximo
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
      />
    </>
  );
};

export default QuizNav;