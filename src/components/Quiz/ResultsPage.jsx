// src/components/Quiz/ResultsPage.jsx
import React, { useState, useEffect, Fragment, useRef } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { motion, animate } from 'framer-motion';
import ExplanationModal from './ExplanationModal';
import LogoHorizontalMono from '../Shared/LogoHorizontalMono';
import LogoSymbol from '../Shared/LogoSymbol';
import { 
    XMarkIcon, 
    PrinterIcon, 
    ArrowPathIcon, 
    SparklesIcon, 
    ChevronUpIcon,
    CheckCircleIcon,
    XCircleIcon,
    BookmarkSquareIcon,
} from '@heroicons/react/24/solid';

const ResultsPage = ({ results, originalQuestions, subject, contest, setPage, handleStartQuiz, contestSubjectsMap }) => {
    const { score, total_questions, userAnswers, flaggedQuestions, startTime, endTime } = results;

    const [explanation, setExplanation] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [showScroll, setShowScroll] = useState(false);
    const [runTour, setRunTour] = useState(false);
    const chartRef = useRef(null);
    const counterRef = useRef(null);

    const filterConfig = {
        correct: {
            text: 'Refazer Certas',
            icon: CheckCircleIcon,
            className: 'bg-green-500 hover:bg-green-600 text-white'
        },
        wrong: {
            text: 'Refazer Erradas',
            icon: XCircleIcon,
            className: 'bg-red-500 hover:bg-red-600 text-white'
        },
        flagged: {
            text: 'Refazer Favoritas',
            icon: BookmarkSquareIcon,
            className: 'bg-orange-500 hover:bg-orange-600 text-white'
        }
    };
    const currentFilterConfig = filterConfig[filter];

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
            content: (
                <div>
                  <strong>Passo 1 de 4</strong>
                  <p>Aqui você vê seu percentual de acerto. O gráfico mostra a proporção de acertos e erros.</p>
                </div>
            ),
            disableBeacon: true,
        },
        {
            target: '.results-filter',
            content: (
                <div>
                  <strong>Passo 2 de 4</strong>
                  <p>Use este filtro para revisar apenas as questões que errou, acertou ou favoritou durante o quiz.</p>
                </div>
            ),
        },
        {
            target: '.results-page-card',
            content: (
                <div>
                    <strong>Passo 3 de 4</strong>
                    <p>Aqui você pode revisar cada questão, sua resposta, o gabarito e o feedback.</p>
                </div>
            )
        },
        {
            target: '.explain-ai-button',
            content: (
                <div>
                  <strong>Passo 4 de 4</strong>
                  <p>Esta é a nossa função especial! Clique aqui para obter uma explicação detalhada sobre a questão, gerada por Inteligência Artificial.</p>
                </div>
            ),
        }
    ]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    
    useEffect(() => {
        const counter = counterRef.current;
        const chart = chartRef.current;
        if (counter && chart && total_questions > 0) {
            const controls = animate(0, score, {
                duration: 1.5,
                ease: "easeOut",
                onUpdate(value) {
                    const percentage = (value / total_questions) * 100;
                    counter.textContent = `${Math.round(percentage)}%`;
                    chart.style.setProperty('--percentage', percentage);
                }
            });
            return () => controls.stop();
        }
    }, [score, total_questions]);


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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleExplain = async (question, userAnswer) => {
        setExplanation("Conectando com a Inteligência Artificial...");
        setIsModalOpen(true);
        const userAnswerText = userAnswer !== undefined ? (userAnswer.value === 0 ? "Certo" : "Errado") : "Não respondida";
        const correctAnswerText = question.gabarito === 0 ? "Certo" : "Errado";

        const prompt = `Me retorne texto simples, sem markdown ou html.Você é um tutor especialista em concursos públicos no Brasil. Explique a seguinte questão de forma detalhada e didática para um estudante. Questão: "${question.enunciado}" Sua explicação deve: Explicar detalhadamente o assunto, citando leis, artigos ou conceitos relevantes, se aplicável. Se o aluno errou, explicar o erro de raciocínio comum que leva a respostas erradas. Oferecer uma dica para ajudar a fixar o conhecimento. Mantenha a linguagem clara, objetiva e encorajadora, sem markdown nem marcações com **.`;

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

    const filteredQuestions = originalQuestions?.map((q, i) => ({ q, i })).filter(({ q, i }) => {
        if (filter === 'correct') return userAnswers[i]?.value === q.gabarito;
        if (filter === 'wrong') return userAnswers[i] && userAnswers[i]?.value !== q.gabarito;
        if (filter === 'flagged') return !!flaggedQuestions[i];
        return true;
      }) || [];
      
    const handleRefazerFiltrado = () => {
        const questionsToRefazer = filteredQuestions.map(item => item.q);
        const newSubjectTitle = `${subject} (${currentFilterConfig.text.split(' ')[1]})`;
        handleStartQuiz(newSubjectTitle, contest, questionsToRefazer);
    };

    return (
      <Fragment>
        <div className="print-header hidden print:flex justify-between items-center p-4 border-b">
            <LogoHorizontalMono className="h-8 w-auto" />
            <p className='text-sm text-gray-700'>gabaritofinal.app</p>
        </div>
        
        <Joyride
          steps={tourSteps}
          run={runTour}
          continuous
          showProgress={false}
          showSkipButton
          callback={handleJoyrideCallback}
          styles={{
            options: {
              zIndex: 10000,
              primaryColor: 'var(--color-accent)',
            },
          }}
          locale={portugueseLocale}
        />
        <div className='animate-fade-up max-w-4xl mx-auto w-full p-4 results-page-container'>
            <button
              onClick={() => setPage('federal-contests')}
              className='fixed top-8 right-8 w-12 h-12 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors flex items-center justify-center shadow-lg font-bold z-50 no-print'
              aria-label="Fechar resultados e voltar"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <div className="flex justify-center mb-8 no-print">
                <LogoSymbol className="w-12 h-12" />
            </div>
            <h2 className='print-title text-4xl font-semibold text-center mb-8 text-[--color-accent]'>{`Resultado: ${subject}`}</h2>
            <div className='p-6 rounded-3xl mb-6 text-center shadow-md bg-[#263445] no-print'>
                <div className='donut-chart' ref={chartRef}>
                    <div className='chart-text'> 
                        <motion.span ref={counterRef} className='percentage'>0%</motion.span>
                        <span className='label'>de Acerto</span>
                    </div>
                </div>
                <p className='text-xl font-bold text-text-primary mt-4'>{`Você acertou ${score} de ${total_questions} questões.`}</p>
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
                  {filter !== 'all' && (
                    <button 
                        className={`px-4 py-2 font-semibold rounded-lg flex items-center gap-2 transition-colors ${currentFilterConfig.className}`} 
                        onClick={handleRefazerFiltrado} 
                        aria-label={currentFilterConfig.text}
                    >
                        <currentFilterConfig.icon className='w-5 h-5' /> {currentFilterConfig.text}
                    </button>
                  )}
                  <button className='px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg flex items-center gap-2' onClick={() => handleStartQuiz(subject, contest)} aria-label="Refazer este quiz">
                    <ArrowPathIcon className='w-5 h-5' /> Refazer
                  </button>
                </div>
            </div>
            
            {filteredQuestions.map(({q, i}) => {
                const isCorrect = userAnswers[i]?.value === q.gabarito;
                const gabaritoText = q.gabarito === 0 ? 'Certo' : 'Errado';
                
                const borderClass = userAnswers[i] != null ? (isCorrect ? 'border-l-8 border-green-500' : 'border-l-8 border-red-500') : 'border-l-8 border-gray-400';

                return (
                    <div key={i} className={`bg-white p-6 rounded-2xl mb-6 text-gray-800 results-page-card ${borderClass}`}>
                        <p className='text-xs text-gray-500 font-mono mb-2'>{q.id}</p>
                        <p className='text-lg text-gray-900 font-semibold whitespace-pre-line'>{`${i + 1}. ${q.enunciado}`}</p>
                        
                        {userAnswers[i] != null ? (
                            isCorrect ? (
                                <p className='text-base mt-2 font-bold text-green-600'>✓ Você acertou</p>
                            ) : (
                                <p className='text-base mt-2 font-bold text-red-500'>✗ Você errou</p>
                            )
                        ) : (
                            <p className='text-base text-gray-600 mt-2'>Não Respondida</p>
                        )}

                        <p className='text-base text-gray-600 mt-2'>
                          Gabarito: 
                          <span className={`ml-2 font-bold px-2 py-1 rounded-md text-sm ${q.gabarito === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {gabaritoText}
                          </span>
                        </p>
                        <p className='text-base text-gray-800 mt-4 border-t pt-4'>
                            <span className='font-bold'>Feedback: </span>
                            {q.feedback}
                        </p>
                        <div className='mt-4 no-print'>
                          {/* ALTERAÇÃO: Classes de cor do botão atualizadas */}
                          <button
                            onClick={() => handleExplain(q, userAnswers[i])}
                            className='explain-ai-button px-4 py-2 bg-[--color-accent] text-black font-bold rounded-lg hover:bg-[--color-accent-hover] transition-all flex items-center gap-2 shadow-lg'
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