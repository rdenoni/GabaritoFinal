import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import LogoSymbol from '../Shared/LogoSymbol';
import QuizCard from './QuizCard';
import ConfirmModal from './ConfirmModal';
import ReviewModal from './ReviewModal';
import ResultsPage from './ResultsPage';
import { XMarkIcon } from '@heroicons/react/24/solid';

const ResumeQuizModal = ({ onConfirm, onDecline }) => (
    <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 no-print'>
      <div className='bg-gray-800 p-6 rounded-3xl shadow-lg max-w-md w-full animate-fade-up border border-gray-700'>
        <h3 className='text-xl font-semibold text-[--color-accent] mb-4'>Continuar Quiz?</h3>
        <p className='text-gray-200 mb-6'>Encontramos um progresso salvo para este quiz. Deseja continuar de onde parou?</p>
        <div className='flex justify-end space-x-4'>
          <button className='px-4 py-2 bg-gray-600 text-gray-200 rounded-xl' onClick={onDecline}>Começar de Novo</button>
          <button className='px-4 py-2 bg-green-600 text-white rounded-xl' onClick={onConfirm}>Sim, Continuar</button>
        </div>
      </div>
    </div>
);


const QuizPage = ({ setPage, quizProps, handleStartQuiz, contestSubjectsMap }) => {
    if (!quizProps || !Array.isArray(quizProps.questions)) {
        return (
            <div className="loading-container">
                <p className="loading-text">Preparando quiz...</p>
            </div>
        );
    }

    const { questions, subject, contest } = quizProps;
    const quizStorageKey = `quizProgress_${contest}_${subject}`;

    const [userAnswers, setUserAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState({});
    const [startTime, setStartTime] = useState(Date.now());
    const [finalResults, setFinalResults] = useState(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [isAutoNextEnabled, setIsAutoNextEnabled] = useState(true);

    useEffect(() => {
        const savedProgress = localStorage.getItem(quizStorageKey);
        if (savedProgress) {
            setShowResumeModal(true);
        }
    }, [quizStorageKey]);

    const resumeQuiz = () => {
        const savedProgress = JSON.parse(localStorage.getItem(quizStorageKey));
        if (savedProgress) {
            setUserAnswers(savedProgress.answers || {});
            setFlaggedQuestions(savedProgress.flags || {});
            setStartTime(savedProgress.startTime || Date.now());
        }
        setShowResumeModal(false);
    };

    const startNewQuiz = () => {
        localStorage.removeItem(quizStorageKey);
        setShowResumeModal(false);
    };

    useEffect(() => {
        const progress = {
            answers: userAnswers,
            flags: flaggedQuestions,
            startTime: startTime,
        };
        if (!finalResults) {
            localStorage.setItem(quizStorageKey, JSON.stringify(progress));
        }
    }, [userAnswers, flaggedQuestions, startTime, quizStorageKey, finalResults]);

    useEffect(() => {
        if (!isAutoNextEnabled || finalResults || !questions.length) return;
        const start = currentPageIndex * 10;
        const end = Math.min(start + 10, questions.length);
        if (end > questions.length) return; 

        let completedInPage = 0;
        for (let i = start; i < end; i++) {
            if (userAnswers[i] !== undefined) {
                completedInPage++;
            }
        }
        
        const isPageComplete = completedInPage === (end - start);

        if (isPageComplete && end < questions.length) {
            const timer = setTimeout(() => {
                setCurrentPageIndex(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [userAnswers, currentPageIndex, isAutoNextEnabled, finalResults, questions]);
    
    const handleAnswer = useCallback((index, answer) => {
        setUserAnswers(prev => ({ ...prev, [index]: answer }));
    }, []);

    const toggleFlag = useCallback((index) => {
        setFlaggedQuestions(prev => {
            const newFlags = { ...prev };
            if (newFlags[index]) delete newFlags[index];
            else newFlags[index] = true;
            return newFlags;
        });
    }, []);

    const submitQuiz = () => {
        setShowConfirmModal(false);
        const endTime = Date.now();
        localStorage.removeItem(quizStorageKey);
        
        let score = 0;
        questions.forEach((q, i) => {
            // CORRIGIDO: Comparando com 'q.gabarito' em vez de 'q.correct_option'
            if (userAnswers[i] && userAnswers[i].value === q.gabarito) score++;
        });
        
        setFinalResults({
            score,
            total: questions.length,
            userAnswers,
            flaggedQuestions,
            startTime,
            endTime
        });
    };

    const handleKeyDown = useCallback((event) => {
        const activeCardId = document.activeElement.id;
        if (!activeCardId || !activeCardId.startsWith('question-card-')) return;
        
        const index = parseInt(activeCardId.split('-')[2]);

        switch (event.key.toUpperCase()) {
            case 'C':
                handleAnswer(index, { value: 0, questionId: index });
                event.preventDefault();
                break;
            case 'E':
                handleAnswer(index, { value: 1, questionId: index });
                event.preventDefault();
                break;
            case 'F':
                toggleFlag(index);
                event.preventDefault();
                break;
        }
    }, [handleAnswer, toggleFlag]);
    
    if (finalResults) {
        return <ResultsPage 
            results={finalResults}
            originalQuestions={questions}
            subject={subject}
            contest={contest}
            setPage={setPage} 
            handleStartQuiz={handleStartQuiz} 
            contestSubjectsMap={contestSubjectsMap}
        />;
    }

    if (showResumeModal) {
        return <ResumeQuizModal onConfirm={resumeQuiz} onDecline={startNewQuiz} />;
    }

    const start = currentPageIndex * 10;
    const end = Math.min(start + 10, questions.length);
    const allQuestionsAnswered = Object.keys(userAnswers).length === questions.length;

    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className='my-10 relative max-w-4xl mx-auto w-full px-4'
        >
            <button
              onClick={() => setPage('federal-contests')}
              className='fixed top-4 right-4 w-12 h-12 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors flex items-center justify-center shadow-lg font-bold z-50 no-print'
              aria-label="Fechar quiz e voltar para a seleção de concursos"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            
            <motion.div variants={itemVariants} className="flex justify-center mb-8">
                <LogoSymbol className="w-12 h-12" />
            </motion.div>

            <motion.h2 variants={itemVariants} className='text-4xl font-semibold text-[--color-accent] text-center mb-2'>{`Questões de ${subject}`}</motion.h2>
            <motion.h3 variants={itemVariants} className='text-xl font-medium text-text-secondary text-center mb-8'>{`Concurso: ${contest}`}</motion.h3>

            <motion.div variants={itemVariants} className='mb-4'>
                <p className='text-sm text-text-secondary text-right mb-1'>{`${Object.keys(userAnswers).length} de ${questions.length} questões respondidas`}</p>
                <div className='w-full h-2 bg-gray-700 rounded-full'>
                    <div className='h-2 bg-[--color-accent] rounded-full transition-all duration-300' style={{ width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }}></div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className='flex justify-end mb-4'>
                <label className='flex items-center cursor-pointer' aria-label="Ativar ou desativar avanço automático de página">
                    <div className='relative'>
                        <input type='checkbox' checked={isAutoNextEnabled} onChange={() => setIsAutoNextEnabled(prev => !prev)} className='sr-only' />
                        <div className={`w-14 h-8 rounded-full transition-all duration-300 ease-in-out ${isAutoNextEnabled ? 'bg-[--color-accent]' : 'bg-gray-600'}`}></div>
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ease-in-out transform ${isAutoNextEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                    <span className='ml-3 text-base text-gray-300'>Avanço Auto</span>
                </label>
            </motion.div>

            {questions.slice(start, end).map((q, i) => (
                <motion.div variants={itemVariants} key={q.id || i}>
                    <QuizCard 
                        question={q} 
                        index={start + i} 
                        onAnswer={handleAnswer} 
                        selected={userAnswers[start + i]} 
                        onFlag={toggleFlag} 
                        isFlagged={!!flaggedQuestions[start + i]}
                        handleKeyDown={handleKeyDown}
                    />
                </motion.div>
            ))}
            
            <div className='fixed sm:bottom-6 bottom-4 left-0 right-0 flex justify-center no-print'>
                <div className='bg-gray-800/90 backdrop-blur-sm p-2 sm:p-4 rounded-2xl shadow-lg flex flex-wrap justify-center gap-2 sm:gap-4 border border-gray-700'>
                    {currentPageIndex > 0 && 
                        <button className='px-4 py-2 sm:px-6 sm:py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 flex items-center shadow-md font-semibold' onClick={() => setCurrentPageIndex(p => p - 1)}>
                            Anterior
                        </button>
                    }
                    <button 
                        className='px-4 py-2 sm:px-6 sm:py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 flex items-center shadow-md font-semibold' 
                        onClick={() => setShowReviewModal(true)}
                        aria-label="Revisar questões respondidas e favoritadas"
                    >
                        Revisar
                    </button>
                    <button 
                        className={`px-4 py-2 sm:px-6 sm:py-3 text-white rounded-xl flex items-center shadow-md font-semibold ${Object.keys(userAnswers).length === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} ${allQuestionsAnswered ? 'pulse-highlight' : ''}`} 
                        onClick={() => setShowConfirmModal(true)} 
                        disabled={Object.keys(userAnswers).length === 0}
                        aria-label="Finalizar e corrigir o quiz"
                    >
                        Corrigir
                    </button>
                    {end < questions.length && 
                        <button className='px-4 py-2 sm:px-6 sm:py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 flex items-center shadow-md font-semibold' onClick={() => setCurrentPageIndex(p => p + 1)}>
                            Próximo
                        </button>
                    }
                </div>
            </div>
            
            {showConfirmModal && <ConfirmModal onCancel={() => setShowConfirmModal(false)} onConfirm={submitQuiz} />}
            {showReviewModal && <ReviewModal questions={questions} userAnswers={userAnswers} flaggedQuestions={flaggedQuestions} onCancel={() => setShowReviewModal(false)} onConfirm={(newAnswers) => { setUserAnswers(newAnswers); setShowReviewModal(false); }} />}
        </motion.div>
    );
};

export default QuizPage;