const { useState, useEffect, Fragment } = React;

// --- DADOS E MAPAS ---
const subjectJsonMap = {
  "Língua Portuguesa": "data/federal_PF2025_lingua_portuguesa.json",
  "Direito Administrativo": "data/federal_PF2025_direito_admin.json",
  "Direito Constitucional": "data/federal_PF2025_direito_const.json",
  "Direitos Humanos": "data/federal_PF2025_direitos_humanos.json",
  "Direito Penal e Processual Penal": "data/federal_PF2025_direito_penal.json",
  "Informática": "data/federal_PF2025_informatica.json",
  "Legislação Especial": "data/federal_PF2025_legis.json",
  "Estatística": "data/federal_PF2025_estatistica.json"
};
const contestSubjectsMap = {
  "Agente da Polícia Federal": ["Língua Portuguesa", "Direito Administrativo", "Direito Constitucional", "Direitos Humanos", "Direito Penal e Processual Penal", "Informática", "Legislação Especial", "Estatística"]
};
const prfDetails = {
    level: 'Nível Superior',
    banca: 'CEBRASPE',
    vacancies: '1.000 vagas',
    salary: 'R$ 14.164,81 a R$ 26.800,00',
    examDate: '27/07/2025',
    inscription: '26/05/2025 a 13/06/2025',
    studyHours: '57 horas de estudo',
    editalLink: 'https://www.example.com/edital-pf-2025.pdf'
};


// --- COMPONENTES AUXILIARES ---

const FeedbackRenderer = ({ text }) => {
    const parts = text.split(/(Art\.\s*\d+º?)/g);
    return React.createElement(
        Fragment,
        null,
        parts.map((part, i) =>
            /(Art\.\s*\d+º?)/.test(part)
                ? React.createElement('span', { key: i, className: 'legal-mention', title: 'Referência Legislativa' }, part)
                : part
        )
    );
};

const QuizCard = ({ question, index, onAnswer, selected, onFlag, isFlagged, keyboardFocus }) => {
  const isQuestionFocused = keyboardFocus && keyboardFocus.questionIndex === index;

  return React.createElement(
    'div',
    {
      id: `question-${index}`,
      className: `bg-gray-800 p-6 rounded-xl shadow-sm mb-4 transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${isFlagged ? 'flagged' : ''}`,
      role: 'region',
      'aria-label': `Questão ${index + 1}`
    },
    React.createElement(
      'div', { className: 'flex justify-between items-start' },
      React.createElement('p', { className: 'text-lg text-gray-100 mb-4 font-medium flex-1' }, `${index + 1}. ${question.question_text}`),
      React.createElement('button', {
        className: `flag-button ${isFlagged ? 'flagged' : ''}`,
        onClick: () => onFlag(index),
        title: isFlagged ? 'Remover sinalização (F)' : 'Sinalizar para revisão (F)',
        'aria-label': isFlagged ? `Remover sinalização da questão ${index + 1}` : `Sinalizar questão ${index + 1} para revisão`
      }, 
        React.createElement('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'currentColor' },
            React.createElement('path', { d: 'M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z' })
        )
      )
    ),
    React.createElement(
      'ul',
      { className: 'space-y-3' },
      ["Certo", "Errado"].map((opt, i) =>
        React.createElement(
          'li',
          {
            key: i,
            className: `p-4 border rounded-xl transition-all duration-200 ease-in-out text-white ${selected && selected.value === i ? 'border-yellow-400 bg-yellow-400 bg-opacity-10 shadow-md transform scale-105' : 'border-gray-600 hover:bg-gray-700 cursor-pointer'} ${isQuestionFocused && keyboardFocus.optionIndex === i ? 'keyboard-focused' : ''}`
          },
          React.createElement(
            'label', { className: 'flex items-center cursor-pointer' },
            React.createElement('input', {
              type: 'radio',
              name: `question-${index}`,
              value: i,
              checked: selected && selected.value === i,
              onChange: () => onAnswer(index, { value: i, questionId: index }),
              className: 'mr-4 h-5 w-5 texto-titulo focus:ring-2 focus:ring-yellow-400',
              'aria-label': `${opt} para questão ${index + 1}`
            }),
            opt
          )
        )
      )
    )
  );
};


// --- COMPONENTE PRINCIPAL ---
const App = () => {
  const [currentPage, setCurrentPage] = useState('home-page');
  const [contestantType, setContestantType] = useState('');
  const [currentContest, setCurrentContest] = useState('');
  const [currentSubject, setCurrentSubject] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoNextEnabled, setIsAutoNextEnabled] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reviewAnswers, setReviewAnswers] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [keyboardFocus, setKeyboardFocus] = useState({ questionIndex: null, optionIndex: null });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => { scrollToTop(); }, [currentPage]);
    
  const toggleFlag = (index) => {
      setFlaggedQuestions(prev => {
          const newFlags = {...prev};
          if (newFlags[index]) {
              delete newFlags[index];
          } else {
              newFlags[index] = true;
          }
          return newFlags;
      });
  };

  const formatTime = (start, end) => {
    if (!start || !end) return "00:00:00";
    const diff = Math.floor((end - start) / 1000);
    const hours = Math.floor(diff / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const seconds = (diff % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const startQuiz = async (subject) => {
    setCurrentSubject(subject);
    setCurrentPageIndex(0);
    setUserAnswers({});
    setResults(null);
    setFlaggedQuestions({});
    setKeyboardFocus({ questionIndex: null, optionIndex: null });
    setIsLoading(true);
    setError('');
    setIsAutoNextEnabled(true);
    setShowAlert(false);
    setShowReviewModal(false);
    setShowConfirmModal(false);
    setFilterStatus('all');
    const now = Date.now();
    setStartTime(now);
    setEndTime(null);

    try {
      const jsonPath = subjectJsonMap[subject];
      if (!jsonPath) throw new Error(`Caminho JSON não encontrado para ${subject}`);
      const response = await fetch(jsonPath);
      if (!response.ok) throw new Error(`Erro ao carregar questões: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Formato de dados inválido');

      const savedProgress = localStorage.getItem('quizProgress');
      if (savedProgress) {
          const { subject: savedSubject, userAnswers: savedAnswers, currentPageIndex: savedIndex, startTime: savedStartTime } = JSON.parse(savedProgress);
          if (savedSubject === subject) {
              setQuestions(data);
              setUserAnswers(savedAnswers);
              setCurrentPageIndex(savedIndex);
              setStartTime(savedStartTime);
              setCurrentPage('quiz-page');
              setIsLoading(false);
              return;
          }
      }

      setQuestions(data);
      setCurrentPage('quiz-page');
      localStorage.setItem('quizProgress', JSON.stringify({ subject, userAnswers: {}, currentPageIndex: 0, startTime: now }));
    } catch (err) {
      setError(`Erro ao carregar questões: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleAnswer = (index, answer) => {
    const newAnswers = { ...userAnswers, [index]: answer };
    setUserAnswers(newAnswers);
    localStorage.setItem('quizProgress', JSON.stringify({
      subject: currentSubject,
      userAnswers: newAnswers,
      currentPageIndex,
      startTime
    }));

    if (isAutoNextEnabled) {
      const start = currentPageIndex * 10;
      const end = Math.min(start + 10, questions.length);
      const answersInPage = Object.keys(newAnswers).filter(k => k >= start && k < end).length;
      if (answersInPage === (end - start) && end < questions.length) {
        setCurrentPageIndex(prev => prev + 1);
        scrollToTop();
      }
    }
  };

  const submitQuiz = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] && userAnswers[i].value === q.correct_option) score++;
    });
    setResults({ score, total: questions.length });
    setEndTime(Date.now());
    localStorage.removeItem('quizProgress');
    scrollToTop();
  };

  const scrollToQuestion = (index) => {
    const element = document.getElementById(`question-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const restoreProgress = () => {
    const saved = localStorage.getItem('quizProgress');
    if (saved) {
      const { subject, userAnswers: savedAnswers, currentPageIndex: savedIndex, startTime: savedStartTime } = JSON.parse(saved);
      if (subject === currentSubject) {
        setUserAnswers(savedAnswers);
        setCurrentPageIndex(savedIndex);
        setStartTime(savedStartTime);
      }
    }
  };

  useEffect(() => {
    if (currentPage === 'quiz-page' && questions.length > 0 && !results && !error) {
        restoreProgress();
    }
  }, [currentPage, questions]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentPage !== 'quiz-page' || results || error || showReviewModal || showConfirmModal) return;
      
      let { questionIndex, optionIndex } = keyboardFocus;
      
      if (questionIndex === null) {
        questionIndex = currentPageIndex * 10;
        optionIndex = 0;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (optionIndex === 0) {
            setKeyboardFocus({ questionIndex, optionIndex: 1 });
          } else if (questionIndex < questions.length - 1) {
            const nextQuestionIndex = questionIndex + 1;
            setKeyboardFocus({ questionIndex: nextQuestionIndex, optionIndex: 0 });
            scrollToQuestion(nextQuestionIndex);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (optionIndex === 1) {
            setKeyboardFocus({ questionIndex, optionIndex: 0 });
          } else if (questionIndex > 0) {
            const prevQuestionIndex = questionIndex - 1;
            setKeyboardFocus({ questionIndex: prevQuestionIndex, optionIndex: 1 });
            scrollToQuestion(prevQuestionIndex);
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (questionIndex !== null && optionIndex !== null) {
            handleAnswer(questionIndex, { value: optionIndex, questionId: questionIndex });
            
            let nextFocusIndex = questionIndex + 1;
            while(userAnswers[nextFocusIndex] && nextFocusIndex < questions.length) {
              nextFocusIndex++;
            }
            if(nextFocusIndex < questions.length) {
                const newPageIndex = Math.floor(nextFocusIndex / 10);
                if (newPageIndex !== currentPageIndex) {
                    setCurrentPageIndex(newPageIndex);
                }
                setKeyboardFocus({ questionIndex: nextFocusIndex, optionIndex: 0 });
                scrollToQuestion(nextFocusIndex);
            } else {
                setKeyboardFocus({ questionIndex: null, optionIndex: null });
            }
          }
          break;
        
        case 'f':
        case 'F':
            e.preventDefault();
            if (questionIndex !== null) {
                toggleFlag(questionIndex);
            }
            break;
        
        case 'ArrowRight':
            if (e.ctrlKey || e.metaKey) {
                const endOfPage = (currentPageIndex + 1) * 10;
                if (endOfPage < questions.length) {
                    setCurrentPageIndex(p => p + 1);
                }
            }
            break;
        case 'ArrowLeft':
            if (e.ctrlKey || e.metaKey) {
                if (currentPageIndex > 0) {
                    setCurrentPageIndex(p => p - 1);
                }
            }
            break;

        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, results, error, showReviewModal, showConfirmModal, keyboardFocus, userAnswers, questions, currentPageIndex]);

  const handleKeyDownEvents = (e, callback) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };
  
  const handleReviewAnswerChange = (index, value) => {
      setReviewAnswers(prev => ({
          ...prev,
          [index]: { value: parseInt(value), questionId: index }
      }));
  };

  const confirmReviewChanges = () => {
      setUserAnswers(reviewAnswers);
      localStorage.setItem('quizProgress', JSON.stringify({
          subject: currentSubject,
          userAnswers: reviewAnswers,
          currentPageIndex,
          startTime
      }));
      setShowReviewModal(false);
  };

  const renderReviewModal = () => {
    const answeredIndexes = Object.keys(userAnswers).sort((a, b) => parseInt(a) - parseInt(b));
    return React.createElement(
      'div',
      { className: 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 no-print' },
      React.createElement(
        'div',
        { className: 'bg-gray-800 p-6 rounded-3xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fade-up border border-gray-700' },
        React.createElement('h3', { className: 'text-xl font-semibold texto-titulo mb-4' }, 'Revisar respostas respondidas'),
        React.createElement(
          'div',
          { className: 'grid gap-4' },
          answeredIndexes.length > 0 ? answeredIndexes.map(index => {
            const i = parseInt(index);
            const q = questions[i];
            const isFlagged = !!flaggedQuestions[i];
            return React.createElement(
              'div',
              { key: i, className: `p-4 border rounded-xl ${isFlagged ? 'flagged' : 'border-gray-700'}` },
              React.createElement('p', { className: 'text-sm text-gray-200' }, `${isFlagged ? '🚩 ' : ''}${i + 1}. ${q.question_text}`),
              React.createElement(
                'select',
                {
                  value: reviewAnswers[i] ? reviewAnswers[i].value : '',
                  onChange: (e) => handleReviewAnswerChange(i, e.target.value),
                  className: 'mt-2 w-full p-2 border rounded-lg bg-gray-700 text-gray-200 border-gray-600'
                },
                React.createElement('option', { value: '' }, 'Não respondida'),
                React.createElement('option', { value: 0 }, 'Certo'),
                React.createElement('option', { value: 1 }, 'Errado')
              )
            )
          }) : React.createElement('p', { className: 'text-gray-400' }, 'Nenhuma questão foi respondida ainda.')
        ),
        React.createElement(
          'div',
          { className: 'mt-6 flex justify-end space-x-4' },
          React.createElement(
            'button',
            {
              className: 'px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500',
              onClick: () => setShowReviewModal(false),
              'aria-label': 'Fechar Revisão'
            },
            'Fechar'
          ),
          React.createElement(
            'button',
            {
              className: 'px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400',
              onClick: confirmReviewChanges,
              'aria-label': 'Confirmar Alterações'
            },
            'Confirmar'
          )
        )
      )
    );
  };

  const renderConfirmModal = () => {
    return React.createElement(
      'div',
      { className: 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 no-print' },
      React.createElement(
        'div',
        { className: 'bg-gray-800 p-6 rounded-3xl shadow-lg max-w-md w-full animate-fade-up border border-gray-700' },
        React.createElement('h3', { className: 'text-xl font-semibold texto-titulo mb-4' }, 'Confirmar Correção'),
        React.createElement('p', { className: 'text-gray-200 mb-6' }, 'Deseja corrigir o quiz agora? Esta ação é irreversível.'),
        React.createElement(
          'div',
          { className: 'flex justify-end space-x-4' },
          React.createElement(
            'button',
            {
              className: 'px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500',
              onClick: () => setShowConfirmModal(false),
              'aria-label': 'Cancelar'
            },
            'Cancelar'
          ),
          React.createElement(
            'button',
            {
              className: 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
              onClick: () => { setShowConfirmModal(false); submitQuiz(); },
              'aria-label': 'Confirmar'
            },
            'Confirmar'
          )
        )
      )
    );
  };

  const goToPrevPage = () => {
      setCurrentPageIndex(prev => prev - 1);
      scrollToTop();
  };

  const goToNextPage = () => {
      setCurrentPageIndex(prev => prev + 1);
      scrollToTop();
  };

  const renderQuestions = () => {
    if (isLoading) {
        return React.createElement(
          'div',
          { className: 'text-center p-10' },
          React.createElement('div', { className: 'loading-spinner' }),
          React.createElement('p', { className: 'text-lg text-gray-400' }, 'Carregando questões...')
        );
    }
      
    const start = currentPageIndex * 10;
    const end = Math.min(start + 10, questions.length);
    const answersInPage = Object.keys(userAnswers).filter(k => k >= start && k < end).length;
    const isPageComplete = answersInPage === (end - start);
    const allQuestionsAnswered = Object.keys(userAnswers).length === questions.length;

    return React.createElement(
      'div',
      { className: 'transition-opacity duration-300 animate-fade-up' },
       React.createElement(
        'div', { className: 'mb-4' },
         React.createElement('p', { className: 'text-sm text-gray-400 text-right mb-1' }, `${Object.keys(userAnswers).length} de ${questions.length} questões respondidas`),
         React.createElement(
          'div',
          { className: 'w-full h-2 bg-gray-700 rounded-full' },
          React.createElement(
            'div',
            {
              className: 'h-2 bg-yellow-200 rounded-full transition-all duration-300',
              style: { width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }
            }
          )
         )
       ),
      showAlert && React.createElement(
        'div',
        { className: 'bg-yellow-900 bg-opacity-30 text-yellow-300 p-4 rounded-lg mb-4 flex items-center animate-shake', role: 'alert' },
        React.createElement('svg', { className: 'w-5 h-5 mr-2', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })),
        'Responda todas as questões antes de avançar.'
      ),
      
      
      React.createElement(
        'div',
        { className: 'flex justify-end mb-4' },
        React.createElement(
          'label',
          {
            className: 'flex items-center cursor-pointer',
            'aria-label': `Avanço auto ${isAutoNextEnabled ? 'ativado' : 'desativado'}`
          },
                    React.createElement(
            'div',
            {
              className: `relative w-14 h-8 rounded-full transition-all duration-300 ease-in-out ${isAutoNextEnabled ? 'bg-gray-600' : 'bg-gray-600'}`
            },
            React.createElement(
              'span',
              {
                className: `absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ease-in-out transform ${isAutoNextEnabled ? 'translate-x-6' : 'translate-x-0'} flex items-center justify-center`
              },
          React.createElement('input', {
            type: 'checkbox',
            checked: isAutoNextEnabled,
            onChange: () => setIsAutoNextEnabled(prev => !prev),
            className: 'sr-only',
            'aria-checked': isAutoNextEnabled
          }),

              React.createElement('svg', {
                className: `w-4 h-4 ${isAutoNextEnabled ? 'text-yellow-500' : 'text-gray-500'}`,
                xmlns: 'http://www.w3.org/2000/svg',
                viewBox: '0 0 24 24',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: '3'
              }, React.createElement('path', { d: isAutoNextEnabled ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12' }))
            )
          ),
          React.createElement('span', { className: 'ml-2 sm:text-sm text-base text-gray-300' }, 'Avanço Auto')
        )
      ),
      questions.slice(start, end).map((q, i) =>
        React.createElement(QuizCard, {
          key: start + i,
          question: q,
          index: start + i,
          onAnswer: handleAnswer,
          selected: userAnswers[start + i],
          onFlag: toggleFlag,
          isFlagged: !!flaggedQuestions[start + i],
          keyboardFocus: keyboardFocus
        })
      ),
      React.createElement(
        'div',
        { className: 'fixed sm:bottom-6 bottom-12 left-0 right-0 flex justify-center no-print' },
        React.createElement(
          'div',
          { className: 'bg-gray-800/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg flex space-x-4 border border-gray-700' },
          currentPageIndex > 0 && React.createElement(
            'button',
            {
              className: 'px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-300 ease-in-out flex items-center shadow-md font-semibold',
              onClick: goToPrevPage,
              'aria-label': 'Página Anterior'
            },
            React.createElement('svg', { className: 'w-4 h-4 mr-2', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M15 18l-6-6 6-6' })),
            'Anterior'
          ),
          React.createElement(
            'button',
            {
              className: 'px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-300 ease-in-out flex items-center shadow-md font-semibold',
              onClick: () => { setReviewAnswers({ ...userAnswers }); setShowReviewModal(true); },
              'aria-label': 'Revisar Respostas'
            },
            React.createElement('svg', { className: 'w-4 h-4 mr-2', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M10 9v6m4-6v6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z' })),
            'Revisar'
          ),
          React.createElement(
            'button',
            {
              className: `px-6 py-3 text-white rounded-xl transition-all duration-300 ease-in-out flex items-center shadow-md font-semibold ${Object.keys(userAnswers).length === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500'} ${allQuestionsAnswered ? 'pulse-highlight' : ''}`,
              onClick: () => setShowConfirmModal(true),
              disabled: Object.keys(userAnswers).length === 0,
              'aria-label': 'Corrigir Respostas'
            },
            React.createElement('svg', { className: 'w-4 h-4 mr-2', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M5 13l4 4L19 7' })),
            'Corrigir'
          ),
          end < questions.length && React.createElement(
            'button',
            {
              className: `px-6 py-3 text-white rounded-xl transition-all duration-300 ease-in-out flex items-center shadow-md font-semibold ${isPageComplete ? 'bg-gray-700 hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400' : 'bg-gray-600 cursor-not-allowed'}`,
              onClick: isPageComplete ? goToNextPage : () => { setShowAlert(true); setTimeout(() => setShowAlert(false), 3000); },
              disabled: !isPageComplete,
              'aria-label': 'Próxima Página'
            },
            'Próximo',
            React.createElement('svg', { className: 'w-4 h-4 ml-2', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M9 18l6-6-6-6' }))
          )
        )
      ),
      showReviewModal && renderReviewModal(),
      showConfirmModal && renderConfirmModal()
    );
  };

  const renderResults = () => {
    const correctPercentage = results.total > 0 ? (results.score / results.total) * 100 : 0;
    const totalTimeSeconds = (endTime - startTime) / 1000;
    const avgTimePerQuestion = results.total > 0 ? totalTimeSeconds / results.total : 0;
      
    let filteredQuestions = questions.map((q, i) => ({ q, i }));
    if (filterStatus === 'correct') {
        filteredQuestions = filteredQuestions.filter(({ i }) => userAnswers[i] && userAnswers[i].value === questions[i].correct_option);
    } else if (filterStatus === 'wrong') {
        filteredQuestions = filteredQuestions.filter(({ i }) => !userAnswers[i] || userAnswers[i].value !== questions[i].correct_option);
    }
      
    return React.createElement(
      'div',
      { className: 'printable-area animate-fade-up' },
      React.createElement(
        'div',
        { className: 'bg-gradient-to-r from-gray-800 to-gray-900 border-t-4 border-green-500 p-6 rounded-3xl mb-6 text-center shadow-md' },
        React.createElement(
            'div', {
                className: 'donut-chart',
                style: { backgroundImage: `conic-gradient(var(--correct-color) ${correctPercentage}%, var(--wrong-color) ${correctPercentage}%)`},
                'aria-label': `Gráfico de desempenho: ${correctPercentage.toFixed(1)}% de acerto.`
            },
            React.createElement('div', {className: 'chart-text'},
                React.createElement('span', {className: 'percentage'}, `${correctPercentage.toFixed(0)}%`),
                React.createElement('span', {className: 'label'}, 'de Acerto')
            )
        ),
        React.createElement('p', { className: 'text-xl font-bold texto-titulo' }, `Você acertou ${results.score} de ${results.total} questões de ${currentSubject}.`),
        React.createElement('p', { className: 'text-lg text-gray-300 mt-2' }, `Tempo total: ${formatTime(startTime, endTime)}`),
        React.createElement('p', { className: 'text-md text-gray-400 mt-1' }, `Tempo médio por questão: ${avgTimePerQuestion.toFixed(1)} segundos`),
        React.createElement('div', { className: 'flex justify-center items-center gap-4 mt-6 no-print' },
            React.createElement(
              'button',
              {
                className: 'px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 ease-in-out flex items-center mx-auto shadow-md font-semibold',
                onClick: () => startQuiz(currentSubject),
                'aria-label': 'Refazer Quiz'
              },
              React.createElement('svg', { className: 'w-4 h-4 mr-2', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 28', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' })),
              'Refazer'
            ),
             React.createElement('select', {
                value: filterStatus,
                onChange: (e) => setFilterStatus(e.target.value),
                className: 'px-4 py-3 rounded-xl bg-gray-700 border-2 border-gray-600 text-gray-200 font-semibold focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400'
            },
                React.createElement('option', { value: 'all' }, 'Filtrar: Todas'),
                React.createElement('option', { value: 'correct' }, 'Filtrar: Certas'),
                React.createElement('option', { value: 'wrong' }, 'Filtrar: Erradas')
            ),
             React.createElement(
              'button',
              {
                className: 'px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-500 focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 ease-in-out flex items-center shadow-md font-semibold',
                onClick: () => window.print(),
                'aria-label': 'Imprimir'
              },
              React.createElement('svg', { className: 'w-5 h-5', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m10 0v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4m10 0v4H7v-4m5 0h.01' }))
            )
        )
      ),
      React.createElement('p', { className: 'text-xl font-bold texto-titulo mb-4' }, 'Correção:'),
      filteredQuestions.map(({ q, i }) => {
        const isCorrect = userAnswers[i] && userAnswers[i].value === q.correct_option;
        return React.createElement(
          'div',
          {
            key: i,
            id: `result-question-${i}`,
            className: `p-6 rounded-3xl mb-6 border-l-4 ${isCorrect ? 'border-green-500 bg-green-500 bg-opacity-10' : 'border-red-500 bg-red-500 bg-opacity-10'} transition-all duration-300 ease-in-out transform hover:scale-[1.02]`,
            role: 'region',
            'aria-label': `Feedback da Questão ${i + 1}`,
            'aria-describedby': `feedback-${i}`
          },
          React.createElement('p', { className: 'sm:text-base text-lg text-gray-200' }, `${i + 1}: ${q.question_text}`),
          React.createElement('p', { className: 'sm:text-sm text-base text-gray-300 mt-2' }, `Sua Resposta: ${userAnswers[i] == null ? 'Não Respondida' : ['Certo', 'Errado'][userAnswers[i].value]}`),
          React.createElement(
            'p',
            { className: 'sm:text-sm text-base text-gray-300 mt-2' },
            `Gabarito: `,
            React.createElement(
              'span',
              { className: 'inline-flex items-center bg-yellow-400 text-gray-900 px-4 py-1 rounded-lg sm:text-sm text-base font-semibold' },
              React.createElement('svg', { className: 'w-4 h-4 mr-2', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M5 13l4 4L19 7' })),
              ['CERTO', 'ERRADO'][q.correct_option]
            )
          ),
          React.createElement('div', { id: `feedback-${i}`, className: 'sm:text-base text-lg font-semibold text-gray-200 mt-4 border-t-2 border-gray-700 pt-4' }, 
            React.createElement(FeedbackRenderer, { text: q.feedback })
          )
        );
      }),
      React.createElement(
        'button',
        {
          className: 'fixed bottom-4 right-4 p-3 bg-yellow-400 text-gray-900 rounded-full shadow-lg hover:bg-yellow-500 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 transition-all duration-300 ease-in-out no-print',
          onClick: scrollToTop,
          'aria-label': 'Voltar ao Topo'
        },
        React.createElement('svg', { className: 'w-6 h-6', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M5 15l7-7 7 7' }))
      )
    );
  };

  const renderPage = () => {
      if (isLoading && currentPage !== 'quiz-page') {
        return React.createElement(
          'div', { className: 'text-center p-10 animate-fade-in' },
          React.createElement('div', { className: 'loading-spinner' }),
          React.createElement('p', { className: 'text-lg text-gray-400' }, 'Carregando...')
        );
      }
      
      switch(currentPage) {
          case 'home-page':
            return React.createElement(
              'div', { className: 'animate-fade-in max-w-4xl mx-auto' },
React.createElement( 'div', { 
  className: 'text-white p-10 rounded-4xl text-center mb-2', 
},

                React.createElement('div', { className: 'flex justify-center items-center mb-4' },
                  React.createElement('img', { src: 'img/LOGO_AZ_VERT.svg', alt: 'Gabarito Final Logo', className: 'h-40 mr-3' })
                ),
                
                React.createElement('p', { className: 'text-x2 font-regular mb-2 max-w-xl mx-auto text-gray-300' }, 'Pratique com questões reais e feedback imediato.')
              ),
                            React.createElement('div', { className: 'border-t border-gray-700 my-10' }),
              React.createElement('div', { className: 'my-10' },
                React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' },
                  [
                    { value: '1000+', label: 'Questões', icon: 'M9 12h6m-3-3v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { value: '50k+', label: 'Usuários', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 4v2a3 3 0 005.356 1.857M17 4v2a3 3 0 01-5.356 1.857' },
                    { value: '2.5k+', label: 'Aprovações', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { value: '85%', label: 'Taxa de Sucesso', icon: 'M3 3v18h18M9 17l3-3 3 3 4-4' }
                  ].map((stat, i) =>
                    React.createElement('div', { key: i, className: 'p-4 text-center animate-fade-in' },
                      React.createElement('svg', { className: 'w-8 h-8 mx-auto mb-2 texto-titulo', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: stat.icon })),
                      React.createElement('h3', { className: 'text-2xl font-semibold texto-padrao' }, stat.value),
                      React.createElement('p', { className: 'sm:text-sm text-base text-gray-300' }, stat.label)
                    )
                  )
                )
              ),

              React.createElement('div', { className: 'my-10', id: 'concursos' },
                React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-3 gap-4' },
                  [
                    { title: 'CONCURSOS ESTADUAIS', page: 'state-contests', enabled: false },
                    { title: 'CONCURSOS FEDERAIS', page: 'federal-contests', enabled: true },
                    { title: 'CONCURSOS MUNICIPAIS', page: 'municipal-contests', enabled: false },
                    //{ title: 'Concursos para Empresas Públicas', page: 'public-companies-contests', enabled: false }
                  ].map((contest, i) =>
                    React.createElement('div', { key: i, className: `px-20 py-40 mx-auto rounded-3xl border-2 shadow-sm transition-all duration-300 ease-in-out animate-fade-in ${contest.enabled ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer' : 'bg-gray-800 border-gray-700 text-gray-500 opacity-50 cursor-not-allowed'}`, onClick: contest.enabled ? () => { setContestantType(contest.page); setCurrentPage(contest.page); } : null, onKeyDown: contest.enabled ? (e) => handleKeyDownEvents(e, () => { setContestantType(contest.page); setCurrentPage(contest.page); }) : null, role: 'button', tabIndex: contest.enabled ? 0 : -1, 'aria-label': contest.title + (contest.enabled ? '' : ' (Indisponível)') },
                      React.createElement('svg', { className: `w-6 h-4 mx-auto mb-2 ${contest.enabled ? 'texto-titulo' : 'text-gray-600'}`, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: contest.enabled ? 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' : 'M8 11V7a4 4 0 018 0v4m-7 0h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6a2 2 0 012-2z' })),
                      React.createElement('h3', { className: `text-base font-semibold text-center ${contest.enabled ? 'texto-titulo' : 'text-gray-500'}` }, contest.title),
                      React.createElement('p', { className: `sm:text-sm text-base mt-1 text-center ${contest.enabled ? 'text-gray-300' : 'text-gray-600'}` }, contest.enabled ? 'Acesse as questões!' : 'Indisponível')
                    )))
              ),

              React.createElement('h2', { className: 'text-2xl font-semibold texto-titulo text-center mb-6' }, 'Por que escolher o Gabarito Final?'),
              React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-10' },
                [
                  { title: 'Questões Reais', description: 'Pratique com questões de concursos anteriores.', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { title: 'Feedback Imediato', description: 'Receba explicações detalhadas para cada questão.', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
                  { title: 'Acompanhe seu Progresso', description: 'Monitore seu desempenho e identifique áreas de melhoria.', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }
              ].map((feature, i) =>
              
                React.createElement('div', { key: i, className: 'bg-gray-800 p-6 rounded-2xl shadow-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02] animate-fade-in border border-gray-700' },
                  
                  // 2. Crie o grupo para o ícone e o título com 'flex'.
                  React.createElement('div', { className: 'flex items-center justify-center' },
                      React.createElement('svg', { className: 'w-6 h-6 mr-3 texto-titulo', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, 
                          React.createElement('path', { d: feature.icon })
                      ),
                      React.createElement('h3', { className: 'text-lg font-semibold texto-titulo' }, feature.title)
                  ),
                  
                  // 3. Adicione uma margem no topo (mt-2) ao parágrafo para criar o espaço.
                  React.createElement('p', { className: 'sm:text-sm text-base text-gray-300 mt-2 text-center' }, feature.description)
                )
              )
              )
            );
        case 'federal-contests':
            return React.createElement('div', { className: 'my-10 animate-fade-up max-w-2xl mx-auto' },
                React.createElement('h2', { className: 'text-4xl font-semibold texto-titulo text-center mb-8' }, 'Concursos Federais'),
                React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10' },
                  [
                    { name: 'Receita Federal', subject: 'Receita Federal', enabled: false },
                    { name: 'Agente da Polícia Federal', subject: 'Agente da Polícia Federal', enabled: true },
                    { name: 'Polícia Rodoviária Federal (PRF)', subject: 'Polícia Rodoviária Federal (PRF)', enabled: false },
                    { name: 'Instituto Nacional do Seguro Social (INSS)', subject: 'INSS', enabled: false },
                    { name: 'Banco Central do Brasil (BACEN)', subject: 'BACEN', enabled: false },
                    { name: 'Tribunal de Contas da União (TCU)', subject: 'TCU', enabled: false }
                  ].map((contest, i) =>
                    React.createElement('div', { key: i, className: `p-8 rounded-3xl border-2 shadow-sm transition-all duration-300 ease-in-out animate-fade-in ${contest.enabled ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer' : 'bg-gray-800 border-gray-700 text-gray-500 opacity-50 cursor-not-allowed'}`, onClick: contest.enabled ? () => { setCurrentContest(contest.subject); setCurrentPage('quiz-selection'); } : null, onKeyDown: contest.enabled ? (e) => handleKeyDownEvents(e, () => { setCurrentContest(contest.subject); setCurrentPage('quiz-selection'); }) : null, role: 'button', tabIndex: contest.enabled ? 0 : -1, 'aria-label': contest.name + (contest.enabled ? '' : ' (Indisponível)') },
                      React.createElement('svg', { className: `w-4 h-4 mx-auto mb-2 ${contest.enabled ? 'texto-titulo' : 'text-gray-600'}`, xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: contest.enabled ? 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' : 'M8 11V7a4 4 0 018 0v4m-7 0h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6a2 2 0 012-2z' })),
                      React.createElement('h3', { className: `text-lg font-semibold text-center ${contest.enabled ? 'texto-titulo' : 'text-gray-500'}` }, contest.name),
                      React.createElement('p', { className: `sm:text-sm text-base mt-1 text-center ${contest.enabled ? 'text-gray-300' : 'text-gray-600'}` }, contest.enabled ? 'Acesse as Questões!' : 'Indisponível')
                    )
                  )
                ),
                React.createElement('button', { className: 'px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-300 ease-in-out flex items-center mx-auto shadow-md font-semibold', onClick: () => setCurrentPage('home-page'), 'aria-label': 'Voltar para Página Inicial' }, React.createElement('svg', { className: 'w-4 h-4 mr-2', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M15 18l-6-6 6-6' })), 'Voltar')
            );
        case 'quiz-selection':
            return React.createElement('div', { className: 'my-10 animate-fade-up max-w-4xl mx-auto' },
                React.createElement('h2', { className: 'text-3xl font-semibold texto-titulo text-center mb-6' }, `Agente da Polícia Federal - Disciplinas`),
                currentContest === 'Agente da Polícia Federal' && React.createElement('div', { className: 'bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-4xl shadow-sm border border-gray-700 mb-8' },
                  React.createElement('h3', { className: 'text-xl font-semibold texto-titulo mb-4' }, 'Informações do Concurso'),
                  React.createElement('div', { className: 'sm:text-sm text-base text-gray-300 space-y-2' },
                    Object.entries(prfDetails).map(([key, value]) => {
                      if (key === 'editalLink') { return React.createElement('a', { key: key, href: value, target: '_blank', rel: 'noopener noreferrer', className: 'inline-flex items-center bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg sm:text-sm text-base hover:bg-yellow-500 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-300 ease-in-out font-semibold' }, React.createElement('svg', { className: 'w-4 h-4 mr-2', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M13 10V3H3v18h18v-8h-7l-4 4-4-4h4z' })), 'Baixar Edital'); }
                      return React.createElement('p', { key: key, className: 'flex items-center' }, React.createElement('svg', { className: 'w-4 h-4 mr-2 texto-titulo', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M5 13l4 4L19 7' })), value);
                    })
                  )
                ),
                React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6' },
                  (contestSubjectsMap[currentContest] || []).map((subject, i) =>
                    React.createElement('button', { 
                        key: i, 
                        
                        className: 'btn btn-card flex items-center justify-center w-full h-full p-4 text-center animate-fade-in', 
                        onClick: () => startQuiz(subject), 
                        onKeyDown: (e) => handleKeyDownEvents(e, () => startQuiz(subject)), 
                        role: 'button', 
                        tabIndex: 0, 
                        'aria-label': `Iniciar Quiz de ${subject}` 
                    },
                      
                      React.createElement('svg', { className: 'w-6 h-6 mr-2 flex-shrink-0', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M9 5h6m-6 4h6m-6 4h6m-8-8h2' })),
                      React.createElement('span', null, subject)
                    )
                  )
                ),
                React.createElement('button', { className: 'px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-300 ease-in-out flex items-center mx-auto shadow-md font-semibold', onClick: () => setCurrentPage('federal-contests'), 'aria-label': 'Voltar para Concursos Federais' }, React.createElement('svg', { className: 'w-4 h-4 mr-2', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M15 18l-6-6 6-6' })), 'Voltar')
            );
        case 'quiz-page':
             return React.createElement('div', { className: 'my-10 relative max-w-4xl mx-auto' },
                React.createElement('img', { src: 'img/SIMBOLO_LG.svg', alt: 'Gabarito Final Simbolo', className: 'absolute top-0 left-0 h-16 w-16 no-print' }),
                React.createElement('h2', { className: 'text-3xl font-semibold texto-titulo text-center mb-2' }, `Questões de ${currentSubject}`),
                React.createElement('h3', { className: 'text-xl font-medium text-gray-400 text-center mb-8' }, `Concurso: ${currentContest}`),
                error
                  ? React.createElement('div', { className: 'text-center border border-red-600 p-6 rounded-3xl bg-red-500 bg-opacity-10', role: 'alert' },
                      React.createElement('svg', { className: 'w-6 h-6 mx-auto mb-2 text-red-500', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })),
                      React.createElement('p', { className: 'text-red-400' }, error),
                      React.createElement('button', { className: 'mt-4 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-300 ease-in-out', onClick: () => startQuiz(currentSubject), 'aria-label': 'Tentar Novamente' }, 'Tentar Novamente')
                    )
                  : results
                  ? renderResults()
                  : renderQuestions(),
                !error && !results && React.createElement('button', { className: 'fixed top-4 right-4 p-3 btn-alerta text-white rounded-full hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 ease-in-out shadow-md no-print', onClick: () => setCurrentPage('quiz-selection'), 'aria-label': 'Fechar Quiz' },
                  React.createElement('svg', { className: 'w-6 h-6', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, React.createElement('path', { d: 'M6 18L18 6M6 6l12 12' }))
                )
            );
        default:
             return React.createElement('div', { className: 'my-10 animate-fade-up max-w-4xl mx-auto' }, `Página não encontrada: ${currentPage}`);
      }
  }


  return React.createElement(
    'div',
    { className: 'w-full' },
    renderPage()
  );
};

ReactDOM.render(React.createElement(App), document.getElementById('root'));