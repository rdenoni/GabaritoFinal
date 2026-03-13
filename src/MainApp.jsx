// src/MainApp.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import LoadingLogo from './components/Shared/LoadingLogo';
import AppLayout from './components/Shared/AppLayout';
import HomePage from './components/HomePage/HomePage.jsx';
import FederalContestsPage from './components/Federal/FederalContestsPage.jsx';
import QuizPage from './components/Quiz/QuizPage.jsx';
import FAQPage from './components/FAQ/FAQPage.jsx';
import ContactPage from './components/Contacts/ContactPage.jsx';
import DashboardPage from './components/Dashboard/DashboardPage.jsx';
import ProfilePage from './components/Profile/ProfilePage.jsx';
import ResultsPage from './components/Quiz/ResultsPage.jsx';
import { toast } from 'react-hot-toast';

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Importa dinamicamente todos os ficheiros JSON da pasta de dados
const jsonModules = import.meta.glob('/src/assets/data/*.json');

const MainApp = ({ session, initialPageFromUrl }) => {
    const [page, setPage] = useState('home-page');
    const [quizProps, setQuizProps] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState('');
    const [quizId, setQuizId] = useState(0);
    const [headerRefreshKey, setHeaderRefreshKey] = useState(0);
    const [quizResults, setQuizResults] = useState(null);

    // Determina se o utilizador é um utilizador de teste
    const isTrialUser = session?.user?.user_metadata?.is_trial_user || false;

    // Efeito para definir a página inicial com base na URL ou no estado da sessão
    useEffect(() => {
        window.scrollTo(0, 0);
        if (['promo', 'teste10', 'login', 'signup', 'reset_password', 'home', ''].includes(initialPageFromUrl)) {
            setPage('home-page');
        } else if (session && isTrialUser && initialPageFromUrl === 'quiz-page') {
            setPage('quiz-page'); 
        } else if (initialPageFromUrl) {
            setPage(initialPageFromUrl);
        } else {
            setPage('home-page');
        }
    }, [initialPageFromUrl, session, isTrialUser]);

    // Função para forçar a atualização do cabeçalho após a atualização do perfil
    const handleProfileUpdate = useCallback(() => {
        setHeaderRefreshKey(prev => prev + 1);
    }, []);

    // Mapeamento de matérias por concurso
    const contestSubjectsMap = {
        "Agente da Polícia Federal": ["Direito Penal e Processual Penal", "Direito Administrativo", "Direito Constitucional", "Direitos Humanos", "Língua Portuguesa", "Legislação Penal Especial", "Informática", "Contabilidade Geral", "Estatística"]
    };
    // Mapeamento de nomes de ficheiros JSON por matéria
    const fileNameMap = {
        "Língua Portuguesa": ["federal_PF2025_lingua_portuguesa"],
        "Direito Administrativo": ["federal_PF2025_direito_administrativo"],
        "Direito Constitucional": ["federal_PF2025_direito_constitucional"],
        "Direitos Humanos": ["federal_PF2025_direitos_humanos"],
        "Direito Penal e Processual Penal": ["federal_PF2025_direito_penal_e_processual"],
        "Legislação Penal Especial": ["federal_PF2025_legislacao_especial"],
        "Estatística": ["federal_PF2025_estatistica"],
        "Informática": ["federal_PF2025_informatica"],
        "Contabilidade Geral": ["federal_PF2025_contabilidade"],
        "Raciocínio Lógico": ["federal_PF2025_raciocinio"],
    };

    // Função para iniciar um quiz
    const handleStartQuiz = async (subject, contest, customQuestions = null) => {
        if (isTrialUser && customQuestions === null && page !== 'quiz-page') {
            toast.error("Funcionalidade exclusiva para assinantes.");
            setPage('home-page');
            return;
        }

        setIsLoading(true);
        setLoadingProgress(0);
        setError('');

        const interval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return 95;
                }
                return prev + 5;
            });
        }, 100);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            let questionsToLoad = [];

            if (customQuestions) {
                questionsToLoad = customQuestions;
            } else if (isTrialUser) {
                const trialSubject = session.user.user_metadata?.trial_subject;
                const trialQuestionIds = session.user.user_metadata?.trial_question_ids;

                if (!trialSubject || !trialQuestionIds || trialQuestionIds.length === 0) {
                    throw new Error("Dados de teste incompletos. Tente novamente ou contate o suporte.");
                }

                const { data: qData, error: qError } = await supabase
                    .from('questions')
                    .select('*')
                    .in('id', trialQuestionIds)
                    .eq('subject', trialSubject);

                if (qError) throw qError;
                if (!qData || qData.length === 0) throw new Error("Nenhuma questão trial encontrada.");
                
                questionsToLoad = qData;
                subject = trialSubject;
                contest = "Teste Gratuito";
                setQuizResults(null);
                
            } else {
                const fileNames = fileNameMap[subject] || [];
                if (fileNames.length === 0) throw new Error(`Nenhum arquivo JSON associado a: ${subject}`);
                
                let allQuestions = [];
                for (const fileName of fileNames) {
                    const filePath = `/src/assets/data/${fileName}.json`;
                    const moduleLoader = jsonModules[filePath];
                    if (moduleLoader) {
                        const module = await moduleLoader();
                        const data = module.default;
                        const questionsArray = data?.concursos?.[0]?.disciplinas?.[0]?.questoes;
                        if (Array.isArray(questionsArray)) {
                            allQuestions = allQuestions.concat(questionsArray);
                        }
                    } else {
                        throw new Error(`Arquivo não encontrado: ${filePath}`);
                    }
                }
                questionsToLoad = allQuestions;
                setQuizResults(null);
            }

            if (questionsToLoad.length === 0) throw new Error(`Nenhuma questão encontrada para ${subject}.`);

            const shuffledQuestions = shuffleArray(questionsToLoad);
            
            clearInterval(interval);
            setLoadingProgress(100);

            setTimeout(() => {
                setQuizProps({ subject, contest, questions: shuffledQuestions });
                setQuizId(id => id + 1);
                setPage('quiz-page');
                setIsLoading(false);
            }, 400);

        } catch (err) {
            console.error("MainApp.jsx - Erro ao carregar o quiz:", err);
            setError(err.message);
            clearInterval(interval);
            setIsLoading(false);
        }
    };

    // Lida com a navegação interna, restringindo o acesso para utilizadores de teste
    const handleInternalPageChange = (newPage) => {
        if (isTrialUser) {
            if (['home-page', 'quiz-page', 'results-page', 'faq-page', 'contact-page'].includes(newPage)) {
                setPage(newPage);
            } else {
                toast.error("Funcionalidade exclusiva para assinantes.");
            }
        } else {
            setPage(newPage);
        }
    };

    // Função de roteamento para renderizar o conteúdo da página atual
    const renderPageContent = () => {
        if (isLoading) {
            return (
                <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <LoadingLogo className="w-24 h-24" progress={loadingProgress} />
                    <p className="loading-text mt-4 text-white">A carregar questões...</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="error-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <h3 className="text-2xl text-red-400 mb-4">Ocorreu um Erro</h3>
                    <p className="text-lg text-center max-w-md text-white">{error.toString()}</p>
                    <button className="mt-6 px-4 py-2 bg-gray-600 rounded-lg" onClick={() => {setError(''); handleInternalPageChange('home-page')}}>Voltar</button>
                </div>
            );
        }

        switch (page) {
            case 'home-page':
                return <HomePage setPage={handleInternalPageChange} />;
            case 'federal-contests':
                return <FederalContestsPage startQuiz={handleStartQuiz} subjectsMap={contestSubjectsMap} />;
            case 'quiz-page':
                return <QuizPage setPage={handleInternalPageChange} quizProps={quizProps} session={session} isTrialMode={isTrialUser} setQuizResults={setQuizResults} />;
            case 'results-page':
                return <ResultsPage setPage={handleInternalPageChange} quizResults={quizResults} originalQuestions={quizProps.questions} quizType={isTrialUser ? 'trial' : 'full'} handleStartQuiz={handleStartQuiz} />;
            case 'dashboard-page':
                return <DashboardPage session={session} supabase={supabase} setPage={handleInternalPageChange} />;
            case 'profile-page':
                return <ProfilePage session={session} onProfileUpdate={handleProfileUpdate} setPage={handleInternalPageChange} />;
            case 'faq-page':
                return <FAQPage />;
            case 'contact-page':
                // Passa a 'session' para a ContactPage, conforme solicitado
                return <ContactPage session={session} />;
            case 'promo-page':
            case 'teste10':
                return <HomePage setPage={handleInternalPageChange} />;
            default:
                return <HomePage setPage={handleInternalPageChange} />;
        }
    };

    // Determina se a página deve ser renderizada dentro do layout principal ou de forma isolada
    const isStandAlonePage = ['quiz-page', 'results-page'].includes(page) || isLoading || error;

    return (
        <AnimatePresence mode="wait">
            {isStandAlonePage ? (
                 <motion.div
                    key={page + quizId + (error ? 'error' : '')}
                    className="w-full"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                    {renderPageContent()}
                </motion.div>
            ) : (
                <AppLayout setPage={handleInternalPageChange} session={session} supabase={supabase} headerRefreshKey={headerRefreshKey}>
                    <motion.div
                        key={page}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        {renderPageContent()}
                    </motion.div>
                </AppLayout>
            )}
        </AnimatePresence>
    );
};

export default MainApp;