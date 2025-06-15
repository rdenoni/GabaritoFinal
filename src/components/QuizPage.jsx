import React, { useState, useEffect } from 'react';
import QuizCard from './QuizCard';
import ConfirmModal from './ConfirmModal';
import ReviewModal from './ReviewModal';
import ResultsPage from './ResultsPage';

const QuizPage = ({ setPage, quizProps, goHome, handleStartQuiz }) => {
    if (!quizProps || !quizProps.questions) {
        return <div className="text-center text-xl mt-20">Preparando quiz...</div>;
    }

    const { questions, subject, contest } = quizProps;
    
    const [results, setResults] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState({});
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [startTime] = useState(() => Date.now());
    const [endTime, setEndTime] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isAutoNextEnabled, setIsAutoNextEnabled] = useState(true);

    useEffect(() => {
        if (!isAutoNextEnabled || results || !questions.length) return;

        const start = currentPageIndex * 10;
        const end = Math.min(start + 10, questions.length);

        if (end > questions.length) return; 

        let completedInPage = 0;
        for (let i = start; i < end; i++) {
            if (userAnswers[i] || flaggedQuestions[i]) {
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
    }, [userAnswers, flaggedQuestions, currentPageIndex, isAutoNextEnabled, results, questions]);
    
    const handleAnswer = (index, answer) => setUserAnswers(prev => ({ ...prev, [index]: answer }));

    const toggleFlag = (index) => {
        setFlaggedQuestions(prev => {
            const newFlags = { ...prev };
            if (newFlags[index]) delete newFlags[index];
            else newFlags[index] = true;
            return newFlags;
        });
    };

    const submitQuiz = () => {
        setShowConfirmModal(false);
        let score = 0;
        questions.forEach((q, i) => {
            if (userAnswers[i] && userAnswers[i].value === q.correct_option) score++;
        });
        setResults({ score, total: questions.length });
        setEndTime(Date.now());
    };
    
    if (results) {
        return <ResultsPage results={results} originalQuestions={questions} userAnswers={userAnswers} flaggedQuestions={flaggedQuestions} startTime={startTime} endTime={endTime} subject={subject} contest={contest} setPage={setPage} handleStartQuiz={handleStartQuiz} />;
    }

    const start = currentPageIndex * 10;
    const end = Math.min(start + 10, questions.length);
    const allQuestionsAnswered = Object.keys(userAnswers).length === questions.length;

    return (
        <div className='my-10 relative max-w-4xl mx-auto w-full'>
            <img src='/img/SIMBOLO_LG.svg' alt='Gabarito Final Simbolo' className='absolute top-0 left-0 w-[80px] no-print cursor-pointer' onClick={goHome} />
            <h2 className='text-4xl font-semibold texto-titulo text-center mb-2'>{`Questões de ${subject}`}</h2>
            <h3 className='text-xl font-medium text-gray-400 text-center mb-8'>{`Concurso: ${contest}`}</h3>

            <div className='mb-4'>
                <p className='text-sm text-gray-400 text-right mb-1'>{`${Object.keys(userAnswers).length} de ${questions.length} questões respondidas`}</p>
                <div className='w-full h-2 bg-gray-700 rounded-full'>
                    <div className='h-2 bg-green-500 rounded-full transition-all duration-300' style={{ width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }}></div>
                </div>
            </div>

            <div className='flex justify-end mb-4'>
                <label className='flex items-center cursor-pointer'>
                    <div className='relative'>
                        <input type='checkbox' checked={isAutoNextEnabled} onChange={() => setIsAutoNextEnabled(prev => !prev)} className='sr-only' />
                        <div className={`w-14 h-8 rounded-full transition-all duration-300 ease-in-out bg-gray-600`}></div>
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ease-in-out transform ${isAutoNextEnabled ? 'translate-x-6' : 'translate-x-0'} flex items-center justify-center`}>
                            <svg className={`w-4 h-4 ${isAutoNextEnabled ? 'text-yellow-500' : 'text-gray-500'}`} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'><path d={isAutoNextEnabled ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} /></svg>
                        </div>
                    </div>
                    <span className='ml-2 sm:text-sm text-base text-gray-300'>Avanço Auto</span>
                </label>
            </div>

            {questions.slice(start, end).map((q, i) => (
                <QuizCard key={q.question_text} question={q} index={start + i} onAnswer={handleAnswer} selected={userAnswers[start + i]} onFlag={toggleFlag} isFlagged={!!flaggedQuestions[start + i]} />
            ))}
            
            <div className='fixed sm:bottom-6 bottom-12 left-0 right-0 flex justify-center no-print'>
                <div className='bg-gray-800/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg flex flex-wrap justify-center gap-4 border border-gray-700'>
                    {currentPageIndex > 0 && <button className='px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 flex items-center shadow-md font-semibold' onClick={() => setCurrentPageIndex(p => p - 1)}><svg className='w-4 h-4 mr-2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M15 18l-6-6 6-6' /></svg>Anterior</button>}
                    <button className='px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 flex items-center shadow-md font-semibold' onClick={() => setShowReviewModal(true)}><svg className='w-4 h-4 mr-2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M10 9v6m4-6v6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z' /></svg>Revisar</button>
                    <button className={`px-6 py-3 text-white rounded-xl flex items-center shadow-md font-semibold ${Object.keys(userAnswers).length === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} ${allQuestionsAnswered ? 'pulse-highlight' : ''}`} onClick={() => setShowConfirmModal(true)} disabled={Object.keys(userAnswers).length === 0}><svg className='w-4 h-4 mr-2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M5 13l4 4L19 7' /></svg>Corrigir</button>
                    
                    {/* BOTÃO E-BOOK ADICIONADO */}
                    <button 
                        className='px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-200 flex items-center shadow-md font-semibold transition-colors'
                        onClick={() => alert('O download do seu E-Book começará em breve!')}
                    >
                        <svg className='w-5 h-5 mr-2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'>
                           <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Baixar E-Book
                    </button>

                    {end < questions.length && <button className='px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 flex items-center shadow-md font-semibold' onClick={() => setCurrentPageIndex(p => p + 1)}>Próximo<svg className='w-4 h-4 ml-2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M9 18l6-6-6-6' /></svg></button>}
                </div>
            </div>
            
            <button className='fixed top-4 right-4 w-12 h-12 bg-yellow-400 text-gray-900 rounded-full hover:bg-yellow-500 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 transition-all duration-300 ease-in-out shadow-md no-print flex items-center justify-center font-bold text-2xl' onClick={() => setPage('quiz-selection')}>X</button>

            {showConfirmModal && <ConfirmModal onCancel={() => setShowConfirmModal(false)} onConfirm={submitQuiz} />}
            {showReviewModal && <ReviewModal questions={questions} userAnswers={userAnswers} flaggedQuestions={flaggedQuestions} onCancel={() => setShowReviewModal(false)} onConfirm={(newAnswers) => { setUserAnswers(newAnswers); setShowReviewModal(false); }} />}
        </div>
    );
};

export default QuizPage;