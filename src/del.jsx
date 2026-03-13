// src/MainApp.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import LoadingLogo from './components/Shared/LoadingLogo';
import AppLayout from './components/Shared/AppLayout'; // Contém Header e Footer
import HomePage from './components/HomePage/HomePage.jsx';
import FederalContestsPage from './components/Federal/FederalContestsPage.jsx';
import QuizPage from './components/Quiz/QuizPage.jsx';
import FAQPage from './components/FAQ/FAQPage.jsx';
import ContactPage from './components/Contacts/ContactPage.jsx';
import DashboardPage from './components/Dashboard/DashboardPage.jsx';
import ProfilePage from './components/Profile/ProfilePage.jsx';
import ResultsPage from './components/Quiz/ResultsPage.jsx'; // Importar ResultsPage
import { toast } from 'react-hot-toast'; // Importar toast para mensagens de restrição

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const jsonModules = import.meta.glob('/src/assets/data/*.json');

// MainApp agora recebe initialPageFromUrl do App.jsx
const MainApp = ({ session, initialPageFromUrl }) => {
    // console.log("MainApp.jsx - Renderizando MainApp..."); // REMOVIDO LOG DE DEBUG
    // console.log("MainApp.jsx - Props recebidas: session, initialPageFromUrl"); // REMOVIDO LOG DE DEBUG
    // console.log("MainApp.jsx - Session no MainApp:", session ? session.user.email : "null"); // REMOVIDO LOG DE DEBUG
    // console.log("MainApp.jsx - initialPageFromUrl:", initialPageFromUrl); // REMOVIDO LOG DE DEBUG

    const [page, setPage] = useState('home-page'); // Estado para navegação interna
    const [quizProps, setQuizProps] = useState({});
    const [isLoading, setIsLoading] = useState(false); // Para carregamento do quiz
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState('');
    const [quizId, setQuizId] = useState(0); // Para forçar remount do QuizPage
    const [headerRefreshKey, setHeaderRefreshKey] = useState(0); // Para forçar refresh do header
    const [quizResults, setQuizResults] = useState(null); // Para armazenar resultados após o quiz

    const isTrialUser = session?.user?.user_metadata?.is_trial_user || false; // Verifica se é usuário de teste
    // console.log("MainApp.jsx - isTrialUser:", isTrialUser); // REMOVIDO LOG DE DEBUG


    useEffect(() => {
        window.scrollTo(0, 0);
        // console.log("MainApp.jsx - useEffect (initialPageFromUrl): Acionando lógica de rota interna inicial."); // REMOVIDO LOG DE DEBUG
        // Define a página inicial do MainApp baseada na URL ao carregar
        if (initialPageFromUrl && initialPageFromUrl !== 'home' && initialPageFromUrl !== 'promo' && initialPageFromUrl !== 'teste10' && initialPageFromUrl !== 'login' && initialPageFromUrl !== 'signup' && initialPageFromUrl !== 'reset_password') {
            setPage(initialPageFromUrl);
            // console.log("MainApp.jsx - useEffect: Redirecionando para initialPageFromUrl:", initialPageFromUrl); // REMOVIDO LOG DE DEBUG
        } else if (session && isTrialUser) {
            setPage('quiz-page'); // Se é trial user, vai direto para o quiz-page
            // console.log("MainApp.jsx - useEffect: Usuário TRIAL logado. Redirecionando para 'quiz-page'."); // REMOVIDO LOG DE DEBUG
        } else {
            setPage('home-page'); // Padrão
            // console.log("MainApp.jsx - useEffect: Nenhum match ou default. Redirecionando para 'home-page'."); // REMOVIDO LOG DE DEBUG
        }
    }, [initialPageFromUrl, session, isTrialUser]);

    useEffect(() => {
        // console.log("MainApp.jsx - Current internal page state (page):", page); // REMOVIDO LOG DE DEBUG
        // console.log("MainApp.jsx - Current quizId:", quizId); // REMOVIDO LOG DE DEBUG
        // console.log("MainApp.jsx - Current isLoading state:", isLoading); // REMOVIDO LOG DE DEBUG
        // console.log("MainApp.jsx - Current error state:", error); // REMOVIDO LOG DE DEBUG
    });

    const handleProfileUpdate = useCallback(() => {
        setHeaderRefreshKey(prev => prev + 1);
        // console.log("MainApp.jsx - handleProfileUpdate: Atualizando headerRefreshKey."); // REMOVIDO LOG DE DEBUG
    }, []);

    const contestSubjectsMap = {
        "Agente da Polícia Federal": ["Direito Penal e Processual Penal", "Direito Administrativo", "Direito Constitucional", "Direitos Humanos", "Língua Portuguesa", "Legislação Penal Especial", "Informática", "Contabilidade Geral", "Estatística"]
    };
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

    const handleStartQuiz = async (subject, contest, customQuestions = null) => {
        // console.log("MainApp.jsx - handleStartQuiz: Iniciando quiz..."); // REMOVIDO LOG DE DEBUG
        // console.log("MainApp.jsx - handleStartQuiz: isTrialUser =", isTrialUser); // REMOVIDO LOG DE DEBUG
        // console.log("MainApp.jsx - handleStartQuiz: subject =", subject, "contest =", contest); // REMOVIDO LOG DE DEBUG
        // console.log("MainApp.jsx - handleStartQuiz: customQuestions =", customQuestions ? "presente" : "ausente"); // REMOVIDO LOG DE DEBUG


        if (isTrialUser && customQuestions === null && page !== 'quiz-page') {
            toast.error("Funcionalidade exclusiva para assinantes.");
            // console.log("MainApp.jsx - handleStartQuiz: Usuário TRIAL tentou acessar quiz normal. Bloqueado."); // REMOVIDO LOG DE DEBUG
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
                // console.log("MainApp.jsx - handleStartQuiz: Carregando customQuestions."); // REMOVIDO LOG DE DEBUG
                questionsToLoad = customQuestions;
            } else if (isTrialUser) {
                // console.log("MainApp.jsx - handleStartQuiz: Carregando questões para usuário TRIAL."); // REMOVIDO LOG DE DEBUG
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
                subject = trialSubject; // Define o assunto para o trial
                contest = "Teste Gratuito"; // Define o concurso para o trial
                setQuizResults(null);
                
            } else {
                // console.log("MainApp.jsx - handleStartQuiz: Carregando questões normais."); // REMOVIDO LOG DE DEBUG
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
                // console.log("MainApp.jsx - handleStartQuiz: Quiz carregado com sucesso. Redirecionando para 'quiz-page'."); // REMOVIDO LOG DE DEBUG
            }, 400);

        } catch (err) {
            console.error("MainApp.jsx - Erro ao carregar o quiz:", err);
            setError(err.message);
            clearInterval(interval);
            setIsLoading(false);
            // console.log("MainApp.jsx - handleStartQuiz: Erro no carregamento do quiz."); // REMOVIDO LOG DE DEBUG
        }
    };

    // Função para navegar entre as páginas internas do MainApp, com restrições para trial user
    const handleInternalPageChange = (newPage) => {
        // console.log("MainApp.jsx - handleInternalPageChange: Tentando navegar para:", newPage); // REMOVIDO LOG DE DEBUG
        if (isTrialUser) {
            if (newPage === 'home-page' || newPage === 'quiz-page' || newPage === 'results-page' || newPage === 'faq-page' || newPage === 'contact-page') {
                setPage(newPage);
                // console.log("MainApp.jsx - handleInternalPageChange: Usuário TRIAL, navegação permitida para:", newPage); // REMOVIDO LOG DE DEBUG
            } else {
                toast.error("Funcionalidade exclusiva para assinantes.");
                // console.log("MainApp.jsx - handleInternalPageChange: Usuário TRIAL, navegação BLOQUEADA para:", newPage); // REMOVIDO LOG DE DEBUG
            }
        } else {
            setPage(newPage);
            // console.log("MainApp.jsx - handleInternalPageChange: Usuário NORMAL, navegação permitida para:", newPage); // REMOVIDO LOG DE DEBUG
        }
    };

    const renderPageContent = () => {
        // console.log("MainApp.jsx - renderPageContent: Renderizando conteúdo da página:", page); // REMOVIDO LOG DE DEBUG
        if (isLoading) {
            // console.log("MainApp.jsx - renderPageContent: Quiz está carregando. Exibindo LoadingLogo."); // REMOVIDO LOG DE DEBUG
            return (
                <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <LoadingLogo className="w-24 h-24" progress={loadingProgress} />
                    <p className="loading-text mt-4 text-white">A carregar questões...</p>
                </div>
            );
        }
        if (error) {
            // console.log("MainApp.jsx - renderPageContent: Erro no carregamento. Exibindo mensagem de erro."); // REMOVIDO LOG DE DEBUG
            return <div className="error-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><h3 className="text-2xl text-red-400 mb-4">Ocorreu um Erro</h3><p className="text-lg text-center max-w-md text-white">{error.toString()}</p><button className="mt-6 px-4 py-2 bg-gray-600 rounded-lg" onClick={() => {setError(''); handleInternalPageChange('home-page')}}>Voltar</button></div>;

        switch (page) {
            case 'home-page': return <HomePage setPage={handleInternalPageChange} />;
            case 'federal-contests': return <FederalContestsPage startQuiz={handleStartQuiz} subjectsMap={contestSubjectsMap} />;
            case 'quiz-page': return <QuizPage setPage={handleInternalPageChange} quizProps={quizProps} handleStartQuiz={handleStartQuiz} contestSubjectsMap={contestSubjectsMap} session={session} isTrialMode={isTrialUser} setQuizResults={setQuizResults} />;
            case 'results-page': return <ResultsPage setPage={handleInternalPageChange} quizResults={quizResults} originalQuestions={quizProps.questions} quizType={isTrialUser ? 'trial' : 'full'} handleStartQuiz={handleStartQuiz} contestSubjectsMap={contestSubjectsMap} />;
            case 'dashboard-page': return <DashboardPage session={session} supabase={supabase} setPage={handleInternalPageChange} />;
            case 'profile-page': return <ProfilePage session={session} onProfileUpdate={handleProfileUpdate} setPage={handleInternalPageChange} />;
            case 'faq-page': return <FAQPage />;
            case 'contact-page': return <ContactPage />;
            case 'promo-page': return <HomePage setPage={handleInternalPageChange} />;
            case 'teste10': return <HomePage setPage={handleInternalPageChange} />;
            default: return <HomePage setPage={handleInternalPageChange} />;
        }
    };

    const isStandAlonePage = page === 'quiz-page' || page === 'results-page' || isLoading || error;
    // console.log("MainApp.jsx - isStandAlonePage:", isStandAlonePage); // REMOVIDO LOG DE DEBUG

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