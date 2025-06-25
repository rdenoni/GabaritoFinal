// src/components/Quiz/ResultsPage.jsx

import React, { useState, useEffect, Fragment, useRef } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { motion, animate } from 'framer-motion';
import ExplanationModal from './ExplanationModal';
import LogoHorizontalMono from '../Shared/LogoHorizontalMono';
import LogoSymbol from '../Shared/LogoSymbol';
import { XMarkIcon, PrinterIcon, ArrowPathIcon, Squares2X2Icon, SparklesIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const ResultsPage = ({ results, originalQuestions, subject, contest, setPage, handleStartQuiz, contestSubjectsMap }) => {
    const { score, total, userAnswers, flaggedQuestions, startTime, endTime } = results;

    const [explanation, setExplanation] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [showScroll, setShowScroll] = useState(false);
    const [runTour, setRunTour] = useState(false);
    const chartRef = useRef(null);
    const counterRef = useRef(null);

    // --- NOVA ADIÇÃO: Objeto de tradução para o Joyride ---
    const portugueseLocale = {
      back: 'Voltar',
      close: 'Fechar',
      last: 'Finalizar',
      next: 'Próximo',
      skip: 'Pular',
    };

    const [tourSteps] = useState([
        {
            target: '.donut-chart',
            content: 'Aqui você vê seu percentual de acerto. O gráfico mostra a proporção de acertos e erros.',
            disableBeacon: true,
        },
        {
            target: '.results-filter',
            content: 'Use este filtro para revisar apenas as questões que errou, acertou ou favoritou durante o quiz.',
        },
        {
            target: '.explain-ai-button',
            content: 'Esta é a nossa função especial! Clique aqui para obter uma explicação detalhada sobre a questão, gerada por Inteligência Artificial.',
        }
    ]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    
    useEffect(() => {
        const counter = counterRef.current;
        const chart = chartRef.current;
        if (counter && chart && total > 0) {
            const controls = animate(0, score, {
                duration: 1.5,
                ease: "easeOut",
                onUpdate(value) {
                    const percentage = (value / total) * 100;
                    counter.textContent = `${Math.round(percentage)}%`;
                    chart.style.setProperty('--percentage', percentage);
                }
            });
            return () => controls.stop();
        }
    }, [score, total]);


    useEffect(() => {
        const checkScrollTop = () => {
            if (!showScroll && window.pageYOffset > 400) {
                setShowScroll(true);
            } else if (showScroll && window.pageYOffset <= 400) {
                setShowScroll(false);
            }
        };
        window.addEventListener('scroll', checkScrollTop);
        const tourHasBeenSeen = localStorage.getItem('gabaritoFinalTourSeen');
        if (!tourHasBeenSeen) {
            setRunTour(true);
        }
        return () => window.removeEventListener('scroll', checkScrollTop);
    }, [showScroll]);

    const handleJoyrideCallback = (data) => {
        const { status } = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRunTour(false);
            localStorage.setItem('gabaritoFinalTourSeen', 'true');
        }
    };

    const handleExplain = async (question, userAnswer) => {
        setExplanation("Conectando com a Inteligência Artificial...");
        setIsModalOpen(true);
        const userAnswerText = userAnswer !== undefined ? (userAnswer.value === 0 ? "Certo" : "Errado") : "Não respondida";
        const correctAnswerText = question.gabarito === 0 ? "Certo" : "Errado";

        const prompt = `Você é um tutor especialista em concursos públicos no Brasil. Explique a seguinte questão de forma detalhada e didática para um estudante. Questão: "${question.enunciado}" Opções: Certo, Errado. Gabarito: ${correctAnswerText}. Resposta do Aluno: ${userAnswerText}. Feedback Original: ${question.feedback}. Sua explicação deve: 1. Confirmar se a resposta do aluno está certa ou errada. 2. Explicar detalhadamente por que o gabarito é o correto, citando leis, artigos ou conceitos relevantes, se aplicável. 3. Se o aluno errou, explicar o erro de raciocínio comum que leva a essa resposta. 4. Oferecer uma dica ou mnemônico para ajudar a fixar o conhecimento. 5. Mantenha a linguagem clara, objetiva e encorajadora.`;

        try {
            const response = await fetch('/.netlify/functions/getExplanation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });
            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.error || `O servidor respondeu com o status: ${response.status}`);
            }
            const result = await response.json();
            if (result.error) {
                throw new Error(result.error);
            }
            setExplanation(result.explanation);
        } catch (error) {
            console.error("Erro ao chamar a função serverless:", error);
            setExplanation(`Ocorreu um erro ao buscar a explicação: ${error.message}`);
        }
    };

    const formatTime = (start, end) => {
      if (!start || !end) return "00:00:00";
      const diff = Math.floor((end - start) / 1000);
      return new Date(diff * 1000).toISOString().substr(11, 8);
    };

    const handleSwitchSubject = () => {
        if (!contestSubjectsMap || !contest) {
            console.error("Erro: Dados do concurso ou mapa de disciplinas não encontrado.");
            return;
        }
        const allSubjects = contestSubjectsMap[contest] || [];
        const otherSubjects = allSubjects.filter(s => s !== subject);
        if (otherSubjects.length > 0) {
            const randomSubject = otherSubjects[Math.floor(Math.random() * otherSubjects.length)];
            handleStartQuiz(randomSubject, contest);
        } else {
            console.warn("Não há outras disciplinas disponíveis para este concurso.");
        }
    };

    const filteredQuestions = originalQuestions?.map((q, i) => ({ q, i })).filter(({ q, i }) => {
        if (filter === 'correct') return userAnswers[i]?.value === q.gabarito;
        if (filter === 'wrong') return userAnswers[i] && userAnswers[i]?.value !== q.gabarito;
        if (filter === 'flagged') return !!flaggedQuestions[i];
        return true;
      }) || [];

    return (
      <Fragment>
        <div className="print-header">
            <LogoHorizontalMono className="h-8 w-auto" />
            <p>gabaritofinal2.netlify.app</p>
        </div>
        
        <Joyride
          steps={tourSteps}
          run={runTour}
          continuous
          showProgress
          showSkipButton
          callback={handleJoyrideCallback}
          styles={{ options: { zIndex: 10000 } }}
          locale={portugueseLocale} // --- NOVA ADIÇÃO: Passando o objeto de tradução ---
        />
        <div className='animate-fade-up max-w-4xl mx-auto w-full p-4 results-page-container'>
            <button
              onClick={() => setPage('federal-contests')}
              className='fixed top-4 right-4 w-12 h-12 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors flex items-center justify-center shadow-lg font-bold z-50 no-print'
              aria-label="Fechar resultados e voltar"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <div className="flex justify-center mb-8 no-print">
                <LogoSymbol className="w-12 h-12" />
            </div>
            <h2 className='text-4xl font-semibold text-center mb-8 text-[--color-accent]'>{`Resultado: ${subject}`}</h2>
            <div className='p-6 rounded-3xl mb-6 text-center shadow-md bg-[#263445]'>
                <div className='donut-chart' ref={chartRef}>
                    <div className='chart-text'> 
                        <motion.span ref={counterRef} className='percentage'>0%</motion.span>
                        <span className='label'>de Acerto</span>
                    </div>
                </div>
                <p className='text-xl font-bold text-text-primary mt-4'>{`Você acertou ${score} de ${total} questões.`}</p>
                <p className='text-lg text-text-secondary mt-2'>{`Tempo total: ${formatTime(startTime, endTime)}`}</p>
            </div>
            <div className='flex flex-wrap justify-between items-center my-6 gap-4 no-print'>
                <div className='flex items-center gap-4'>
                  <select value={filter} onChange={e => setFilter(e.target.value)} className='results-filter px-4 py-3 rounded-xl bg-gray-700 border-2 border-gray-600 text-gray-200 font-semibold' aria-label="Filtrar questões">
                    <option value='all'>Filtrar: Todas</option>
                    <option value='correct'>Filtrar: Certas</option>
                    <option value='wrong'>Filtrar: Erradas</option>
                    <option value='flagged'>Filtrar: Favoritas</option>
                  </select>
                  <button className='p-3 bg-gray-700 text-gray-200 rounded-xl hover:bg-gray-600 flex items-center shadow-md font-semibold' onClick={() => window.print()} title='Imprimir' aria-label="Imprimir resultados">
                    <PrinterIcon className='w-6 h-6' />
                  </button>
                </div>
                <div className='flex flex-wrap justify-end items-center gap-4'>
                  <button className='px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg flex items-center gap-2' onClick={() => handleStartQuiz(subject, contest)} aria-label="Refazer este quiz">
                    <ArrowPathIcon className='w-5 h-5' /> Refazer
                  </button>
                  <button className='px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg flex items-center gap-2' onClick={handleSwitchSubject} aria-label="Trocar de matéria aleatoriamente">
                    <Squares2X2Icon className='w-5 h-5' /> Trocar Disciplina
                  </button>
                </div>
            </div>
            
            {filteredQuestions.map(({q, i}) => {
                const isCorrect = userAnswers[i]?.value === q.gabarito;
                const gabaritoText = q.gabarito === 0 ? 'Certo' : 'Errado';
                return (
                    <div key={i} className={`bg-white p-6 rounded-2xl mb-6 border-l-8 text-gray-800 ${isCorrect ? 'border-green-500' : 'border-red-500'} results-page-card`}>
                        <p className='text-xs text-gray-500 font-mono mb-2'>{q.id}</p>
                        <p className='text-lg text-gray-900 font-semibold whitespace-pre-line'>{`${i + 1}. ${q.enunciado}`}</p>
                        <p className='text-base text-gray-600 mt-2'>{`Sua resposta: ${userAnswers[i] != null ? ['Certo', 'Errado'][userAnswers[i].value] : 'Não Respondida'}`}</p>
                        <p className='text-base text-gray-600 mt-2'>
                          Gabarito: 
                          <span className={`ml-2 font-bold px-2 py-1 rounded-md text-sm ${q.gabarito === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {gabaritoText}
                          </span>
                          <span className={`print-only font-bold ml-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {isCorrect ? '✓ Você acertou' : '✗ Você errou'}
                          </span>
                        </p>
                        <p className='text-base text-gray-800 mt-4 border-t pt-4'>
                            <span className='font-bold'>Feedback: </span>
                            {q.feedback}
                        </p>
                        <div className='mt-4 no-print'>
                          <button
                            onClick={() => handleExplain(q, userAnswers[i])}
                            className='explain-ai-button px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg'
                          >
                            <SparklesIcon className="w-5 h-5" /> Explicar com IA
                          </button>
                        </div>
                    </div>
                );
            })}
             {showScroll && (
              <button
                onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                className='fixed bottom-8 right-8 bg-[--color-accent] p-3 rounded-full text-white shadow-lg hover:bg-[--color-accent-hover] transition-all no-print'
                aria-label="Voltar ao topo"
              >
                <ChevronUpIcon className='w-6 h-6' />
              </button>
             )}
        </div>
        {isModalOpen && <ExplanationModal explanation={explanation} onClose={() => setIsModalOpen(false)} />}
      </Fragment>
    );
};

export default ResultsPage;