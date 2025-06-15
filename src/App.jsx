import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HomePage from './components/HomePage';
import FederalContestsPage from './components/FederalContestsPage';
import QuizSelectionPage from './components/QuizSelectionPage';
import QuizPage from './components/QuizPage';
import PageHeader from './components/PageHeader';

// Mapas de dados permanecem os mesmos...
const subjectJsonMap = {
  "Língua Portuguesa": "/data/federal_PF2025_lingua_portuguesa.json",
  "Direito Administrativo": "/data/federal_PF2025_direito_admin.json",
  "Direito Constitucional": "/data/federal_PF2025_direito_const.json",
  "Direitos Humanos": "/data/federal_PF2025_direitos_humanos.json",
  "Direito Penal e Processual Penal": "/data/federal_PF2025_direito_penal.json",
  "Informática": "/data/federal_PF2025_informatica.json",
  "Legislação Especial": "/data/federal_PF2025_legis.json",
  "Estatística": "/data/federal_PF2025_estatistica.json"
};
const contestSubjectsMap = {
  "Agente da Polícia Federal": ["Língua Portuguesa", "Direito Administrativo", "Direito Constitucional", "Direitos Humanos", "Direito Penal e Processual Penal", "Informática", "Legislação Especial", "Estatística"]
};

const LoadingAnimation = () => (
    <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Carregando Questões...</p>
    </div>
);

// COMPONENTE DE RODAPÉ REINTRODUZIDO
const Footer = () => (
    <footer className="w-full bg-[#1f2736] border-t border-t-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left px-8 py-6 gap-4">
            <p className="text-gray-400 text-sm">
                Gabarito Final &copy; {new Date().getFullYear()} - Todos os direitos reservados.
            </p>
            <nav className="flex gap-6 texto-padrao font-semibold">
                 <button onClick={() => alert('Página de FAQ em breve!')} className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">FAQ</button>
                 <button onClick={() => alert('Página de Contato em breve!')} className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">Contato</button>
            </nav>
        </div>
    </footer>
);


const App = () => {
    const [page, setPage] = useState('home-page');
    const [contest, setContest] = useState('');
    const [quizProps, setQuizProps] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [quizId, setQuizId] = useState(0);

    const handleStartQuiz = async (subject, contest, questionFilter = null) => {
        setIsLoading(true);
        setError('');
        try {
            let questions;
            if (questionFilter) {
                questions = questionFilter;
            } else {
                const jsonPath = subjectJsonMap[subject];
                if (!jsonPath) throw new Error("Caminho para as questões não encontrado.");
                await new Promise(resolve => setTimeout(resolve, 1000));
                const response = await fetch(jsonPath);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                questions = await response.json();
            }

            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error("Nenhuma questão encontrada para este filtro.");
            }
            
            setQuizProps({ subject, contest, questions });
            setQuizId(id => id + 1); 
            setPage('quiz-page');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const goHome = () => setPage('home-page');
    
    const showHeader = !isLoading && !error && page !== 'quiz-page';

    const renderPage = () => {
        if (isLoading) return <LoadingAnimation />;
        if (error) {
            return (
                <div className="text-center text-xl mt-20 text-red-400">
                    <p>Ocorreu um erro:</p>
                    <p>{error}</p>
                    <button className="px-6 py-3 bg-gray-700/80 text-white rounded-xl mt-4" onClick={goHome}>Voltar</button>
                </div>
            );
        }

        switch (page) {
            case 'home-page':
                return <HomePage setPage={setPage} />;
            case 'federal-contests':
                return <FederalContestsPage setPage={setPage} setContest={setContest} />;
            case 'quiz-selection':
                const subjects = contestSubjectsMap[contest] || [];
                return <QuizSelectionPage setPage={setPage} contest={contest} startQuiz={handleStartQuiz} subjects={subjects} />;
            case 'quiz-page':
                return <QuizPage key={quizId} setPage={setPage} quizProps={quizProps} goHome={goHome} handleStartQuiz={handleStartQuiz} />;
            default:
                return <HomePage setPage={setPage} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {showHeader && <PageHeader onLogoClick={goHome} setPage={setPage} />}
            
            <main className="flex-grow flex justify-center p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={page + quizId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        {renderPage()}
                    </motion.div>
                </AnimatePresence>
            </main>
            
            <Footer />
        </div>
    );
};

export default App;