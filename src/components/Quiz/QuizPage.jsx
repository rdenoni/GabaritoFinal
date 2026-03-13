import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Joyride, { STATUS } from 'react-joyride';
import { supabase } from '../../supabaseClient';
import LogoSymbol from '../Shared/LogoSymbol';
import QuizCard from './QuizCard';
import ConfirmModal from './ConfirmModal';
import ReviewModal from './ReviewModal';
import ResultsPage from './ResultsPage';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const QuizPage = ({ setPage, quizProps, handleStartQuiz, contestSubjectsMap, session }) => {
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
    const [isAutoNextEnabled, setIsAutoNextEnabled] = useState(true);
    const [runQuizTour, setRunQuizTour] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    const quizTourSteps = [
        // ... (seus passos do tour permanecem os mesmos)
    ];
    
    const handleQuizTourCallback = async (data) => {
      const { status } = data;
      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
        setRunQuizTour(false);
        try {
            await supabase
                .from('profiles')
                .update({ has_seen_quiz_tour: true })
                .eq('id', session.user.id);
        } catch (error) {
            console.error("Erro ao salvar preferência do tour:", error);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    useEffect(() => {
        const checkTourStatus = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('has_seen_quiz_tour')
                    .eq('id', session.user.id)
                    .single();

                if (error && error.status !== 406) throw error;
                
                if (data && !data.has_seen_quiz_tour) {
                    setRunQuizTour(true);
                }
            } catch (error) {
                console.error("Não foi possível verificar o status do tour:", error);
            }
        };
        
        checkTourStatus();

        const savedProgress = localStorage.getItem(quizStorageKey);
        if (savedProgress) {
            const { answers, flags, startTime: savedTime } = JSON.parse(savedProgress);
            setUserAnswers(answers || {});
            setFlaggedQuestions(flags || {});
            setStartTime(savedTime || Date.now());
            if (Object.keys(answers || {}).length > 0) {
                setHasInteracted(true);
            }
        }
    }, [quizStorageKey, session.user.id]);

    useEffect(() => {
        const progress = {
            answers: userAnswers,
            flags: flaggedQuestions,
            startTime: startTime,
        };
        if (!finalResults && Object.keys(userAnswers).length > 0) {
            localStorage.setItem(quizStorageKey, JSON.stringify(progress));
        }
    }, [userAnswers, flaggedQuestions, startTime, quizStorageKey, finalResults]);
    
    // Este é o useEffect que controla o avanço automático
    useEffect(() => {
        if (!isAutoNextEnabled || finalResults || !questions.length) return;
        const start = currentPageIndex * 10;
        const end = Math.min(start + 10, questions.length);

        let completedInPage = 0;
        for (let i = start; i < end; i++) {
            if (userAnswers[i] !== undefined) {
                completedInPage++;
            }
        }
        
        const isPageComplete = completedInPage === (end - start);

        // --- CÓDIGO DE DEPURAÇÃO ADICIONADO ---
        console.log({
            paginaAtual: currentPageIndex,
            questoesNaPagina: (end - start),
            questoesRespondidasNaPagina: completedInPage,
            paginaEstaCompleta: isPageComplete,
            podeAvancar: end < questions.length
        });
        // --- FIM DO CÓDIGO DE DEPURAÇÃO ---

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
        setHasInteracted(true);
    }, []);

    const toggleFlag = useCallback((index) => {
        setFlaggedQuestions(prev => {
            const newFlags = { ...prev };
            if (newFlags[index]) delete newFlags[index];
            else newFlags[index] = true;
            return newFlags;
        });
    }, []);

    const submitQuiz = async () => {
        setShowConfirmModal(false);
        const endTime = Date.now();
        localStorage.removeItem(quizStorageKey);
        
        let score = 0;
        questions.forEach((q, i) => {
            if (userAnswers[i] && userAnswers[i].value === q.gabarito) {
                score++;
            }
        });

        const finalQuizResults = {
            score,
            total_questions: questions.length,
            userAnswers,
            flaggedQuestions,
            startTime,
            endTime,
            subject,
            contest
        };

        try {
            await fetch('/.netlify/functions/process-quiz-result', {
                method: 'POST',
                body: JSON.stringify({
                    quizResult: finalQuizResults,
                    userId: session.user.id
                })
            });
        } catch (error) {
            console.error("Falha ao salvar o histórico do quiz:", error);
        }
        
        setFinalResults(finalQuizResults);
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

    const start = currentPageIndex * 10;
    const end = Math.min(start + 10, questions.length);

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
            className='my-10 relative max-w-4xl mx-auto w-full px-4 pb-32'
        >
            <Joyride
                steps={quizTourSteps}
                run={runQuizTour}
                continuous
                showProgress={false}
                showSkipButton
                callback={handleQuizTourCallback}
                styles={{
                    options: {
                      zIndex: 10000,
                      primaryColor: 'var(--color-accent)',
                    },
                }}
                locale={{
                    back: 'Voltar',
                    close: 'Fechar',
                    last: 'Finalizar',
                    next: 'Próximo',
                    skip: 'Pular',
                }}
            />

            <button
              onClick={() => setPage('federal-contests')}
              className='fixed top-8 right-8 w-12 h-12 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors flex items-center justify-center shadow-lg font-bold z-50 no-print'
              aria-label="Fechar quiz"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            
            <motion.div variants={itemVariants} className="flex justify-center mb-8 no-print">
                <LogoSymbol className="w-12 h-12" />
            </motion.div>

            <motion.h2 variants={itemVariants} className='text-4xl font-semibold text-[--color-accent] text-center mb-2'>{`Questões de ${subject}`}</motion.h2>
            <motion.h3 variants={itemVariants} className='text-xl font-medium text-text-secondary text-center mb-8'>{`Concurso: ${contest}`}</motion.h3>

            <motion.div variants={itemVariants} className='mb-4 no-print'>
                <p className='text-sm text-text-secondary text-right mb-1'>{`${Object.keys(userAnswers).length} de ${questions.length} questões respondidas`}</p>
                <div className='w-full h-2 bg-gray-700 rounded-full'>
                    <div className='h-2 bg-[--color-accent] rounded-full transition-all duration-300' style={{ width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }}></div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className='flex justify-end mb-4 no-print'>
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
                        <button className='px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base bg-gray-700 text-white rounded-xl hover:bg-gray-600 flex items-center shadow-md font-semibold' onClick={() => setCurrentPageIndex(p => p - 1)}>
                            <ChevronLeftIcon className="h-5 w-5 mr-0 sm:mr-2" />
                            <span className="hidden sm:inline">Anterior</span>
                        </button>
                    }
                    <button
                        id="button-review"
                        className={`px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base text-white rounded-xl flex items-center shadow-md font-semibold transition-colors ${hasInteracted ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}`} 
                        onClick={() => setShowReviewModal(true)}
                        aria-label="Revisar questões respondidas e favoritadas"
                    >
                        Revisar
                    </button>
                    <button
                        id="button-correct"
                        className="px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center shadow-md font-semibold transition-colors" 
                        onClick={() => setShowConfirmModal(true)} 
                        aria-label="Finalizar e corrigir o quiz"
                    >
                        Corrigir
                    </button>
                    {end < questions.length && 
                        <button className='px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base bg-gray-700 text-white rounded-xl hover:bg-gray-600 flex items-center shadow-md font-semibold' onClick={() => setCurrentPageIndex(p => p + 1)}>
                            <span className="hidden sm:inline">Próximo</span>
                            <ChevronRightIcon className="h-5 w-5 ml-0 sm:ml-2" />
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