import React, { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import FeedbackRenderer from './FeedbackRenderer';
import Confetti from './Confetti';

// Componente para animar o número da porcentagem
const AnimatedPercentage = ({ percentage }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, percentage, {
      duration: 1.5,
      ease: "easeInOut",
      onUpdate: (value) => {
        setAnimatedValue(value);
      }
    });
    return () => controls.stop();
  }, [percentage]);

  return <span className='percentage'>{`${animatedValue.toFixed(0)}%`}</span>;
};


const ResultsPage = ({ results, originalQuestions, userAnswers, flaggedQuestions, startTime, endTime, subject, contest, setPage, handleStartQuiz }) => {
  const [filter, setFilter] = useState('all');
  
  const correctPercentage = results.total > 0 ? (results.score / results.total) * 100 : 0;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const formatTime = (start, end) => {
    if (!start || !end) return "00:00:00";
    const diff = Math.floor((end - start) / 1000);
    const h = Math.floor(diff / 3600).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const filteredQuestions = originalQuestions.map((q, i) => ({ q, i })).filter(({ q, i }) => {
    if (filter === 'correct') return userAnswers[i]?.value === q.correct_option;
    if (filter === 'wrong') return userAnswers[i] && userAnswers[i]?.value !== q.correct_option;
    if (filter === 'flagged') return !!flaggedQuestions[i];
    return true;
  });

  const handleRedoFlagged = () => {
    const flagged = originalQuestions.filter((q, i) => flaggedQuestions[i]);
    if (flagged.length > 0) {
      handleStartQuiz(subject, contest, flagged);
    } else {
      alert("Você não sinalizou nenhuma questão para refazer.");
    }
  };

  return (
    <div className='animate-fade-up max-w-4xl mx-auto w-full'>
      <div className='my-10 relative'>
        <img src='/img/SIMBOLO_LG.svg' alt='Gabarito Final Simbolo' className='absolute top-0 left-0 w-[80px] no-print cursor-pointer' onClick={() => setPage('home-page')} />
        <h2 className='text-4xl font-semibold texto-titulo text-center mb-2'>Resultado: {subject}</h2>
        <h3 className='text-xl font-medium text-gray-400 text-center mb-8'>{`Concurso: ${contest}`}</h3>
      </div>
      
      <button 
        className='fixed top-4 right-4 w-12 h-12 bg-yellow-400 text-gray-900 rounded-full hover:bg-yellow-500 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 transition-all duration-300 ease-in-out shadow-md no-print flex items-center justify-center font-bold text-2xl' 
        onClick={() => setPage('quiz-selection')}
      >
        X
      </button>

      <div 
        className='p-6 rounded-3xl mb-6 text-center shadow-md' 
        style={{
          backgroundColor: '#263445', 
          position: 'relative', 
          overflow: 'hidden' 
        }}
      >
        <Confetti />
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <div 
              className='donut-chart'
              style={{ '--percentage': correctPercentage, '--correct-color': 'var(--cor-feedback-certo)', '--wrong-color': 'var(--cor-feedback-errado)'}}
            >
              <div className='chart-text'>
                <AnimatedPercentage percentage={correctPercentage} />
                <span className='label'>de Acerto</span>
              </div>
            </div>
            <p className='text-xl font-bold texto-titulo mt-4'>{`Você acertou ${results.score} de ${results.total} questões.`}</p>
            <p className='text-lg text-gray-300 mt-2'>{`Tempo total: ${formatTime(startTime, endTime)}`}</p>
        </motion.div>
      </div>

      <div className='flex justify-between items-center my-6 no-print'>
        <div className="flex items-center gap-4">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className='px-4 py-3 rounded-xl bg-gray-700 border-2 border-gray-600 text-gray-200 font-semibold focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400'>
                <option value="all">Filtrar: Todas</option>
                <option value="correct">Filtrar: Certas</option>
                <option value="wrong">Filtrar: Erradas</option>
                <option value="flagged">Filtrar: Favoritadas</option>
            </select>
            <button className='px-4 py-3 bg-gray-700 text-gray-200 rounded-xl hover:bg-gray-600 flex items-center shadow-md font-semibold' onClick={() => window.print()}>
                <svg className='w-5 h-5' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m10 0v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4m10 0v4H7v-4m5 0h.01' /></svg>
            </button>
        </div>
        <div className="flex items-center gap-4">
            {Object.keys(flaggedQuestions).length > 0 && (
                <button
                    className='px-6 py-3 font-semibold bg-gray-700 text-gray-200 rounded-xl hover:bg-gray-600 flex items-center shadow-md'
                    onClick={handleRedoFlagged}
                    title="Refazer apenas as questões que você sinalizou com a bandeira"
                >
                    <svg className='w-5 h-5 mr-2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'><path d='M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z' /></svg>
                    Refazer Sinalizadas
                </button>
            )}
            <button
                className='px-6 py-3 font-semibold bg-gray-700 text-gray-200 rounded-xl hover:bg-gray-600 flex items-center shadow-md'
                onClick={() => handleStartQuiz(subject, contest, originalQuestions)}
            >
                <svg className='w-5 h-5 mr-2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'><path d='M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z' /></svg>
                Refazer Questões
            </button>
        </div>
      </div>
      
      <h3 className="text-xl font-bold texto-titulo mb-4">Correção:</h3>
      {filteredQuestions.map(({ q, i }) => {
        const isCorrect = userAnswers[i]?.value === q.correct_option;
        const isCorrectOption = q.correct_option === 0;

        return (
            <div key={i} id={`result-question-${i}`} className={`p-6 rounded-3xl mb-6 border-l-4 bg-white text-gray-900 shadow-md ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                <p className='sm:text-base text-lg flex-grow'>{`${i + 1}: ${q.question_text}`}</p>
                <p className='sm:text-sm text-base text-gray-700 mt-2'>{`Sua Resposta: ${userAnswers[i] != null ? ['Certo', 'Errado'][userAnswers[i].value] : 'Não Respondida'}`}</p>
                <p className='sm:text-sm text-base text-gray-700 mt-2'>
                    Gabarito:{' '}
                    <span className={`inline-flex items-center text-white px-4 py-1 rounded-lg sm:text-sm text-base font-semibold ${isCorrectOption ? 'bg-green-600' : 'bg-red-600'}`}>
                        <svg className='w-4 h-4 mr-2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d={isCorrectOption ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} /></svg>
                        {isCorrectOption ? 'CERTO' : 'ERRADO'}
                    </span>
                </p>
                <div className='sm:text-base text-lg font-semibold text-gray-900 mt-4 border-t-2 border-gray-200 pt-4'>
                    <FeedbackRenderer text={q.feedback} />
                </div>
            </div>
        );
      })}
      
      <button
        className='fixed bottom-4 right-4 p-3 bg-yellow-400 text-gray-900 rounded-full shadow-lg hover:bg-yellow-500 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 transition-all duration-300 ease-in-out no-print'
        onClick={scrollToTop}
        aria-label='Voltar ao Topo'
      >
        <svg className='w-6 h-6' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M5 15l7-7 7 7' /></svg>
      </button>
    </div>
  );
};

export default ResultsPage;
