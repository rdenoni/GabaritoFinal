import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import GenericConfirmModal from '../Shared/GenericConfirmModal';
import {
    PresentationChartLineIcon,
    CheckCircleIcon,
    ListBulletIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    TrashIcon,
    AcademicCapIcon,
    TrophyIcon,
    RocketLaunchIcon,
    ChartPieIcon,
    ChartBarSquareIcon
} from '@heroicons/react/24/solid';

const StatCard = ({ title, value, icon: Icon, highlight = false }) => (
    <div className={`p-4 sm:p-6 rounded-2xl flex items-center gap-4 border shadow-lg transition-all duration-300 ${highlight ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white border-emerald-500' : 'bg-gray-800 border-gray-700/50'}`}>
        <div className={`p-2 sm:p-3 rounded-lg ${highlight ? 'bg-white/20' : 'bg-gray-700'}`}>
            <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${highlight ? 'text-white' : 'text-[--color-accent]'}`} />
        </div>
        <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${highlight ? 'text-green-100' : 'text-text-secondary'}`} title={title}>{title}</p>
            <p className='text-xl sm:text-2xl font-bold text-white'>{value}</p>
        </div>
    </div>
);

const DashboardSkeleton = () => (
    <div className="animate-pulse max-w-7xl mx-auto" aria-label="Carregando dados do dashboard">
        <div className="h-10 bg-gray-700 rounded-lg w-1/3 mb-12"></div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8'>
            <div className="h-28 bg-gray-700 rounded-2xl"></div>
            <div className="h-28 bg-gray-700 rounded-2xl"></div>
            <div className="h-28 bg-gray-700 rounded-2xl"></div>
            <div className="h-28 bg-gray-700 rounded-2xl"></div>
            <div className="h-28 bg-gray-700 rounded-2xl"></div>
        </div>
        <div className='flex flex-col gap-8'>
            <div className="h-96 bg-gray-700 rounded-2xl"></div>
            <div className="h-80 bg-gray-700 rounded-2xl"></div>
        </div>
    </div>
);

const EmptyState = ({ setPage, username }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
        <h1 style={{font: 'var(--font-h1)'}} className='text-text-primary mb-2'>Bem-vindo(a), {username}!</h1>
        <p className="text-text-secondary text-lg mb-8">Parece que você ainda não tem um histórico. Que tal começar agora?</p>
        <button
            onClick={() => setPage('federal-contests')}
            className="bg-[--color-accent] text-black font-bold py-3 px-8 rounded-lg hover:bg-[--color-accent-hover] transition-colors flex items-center gap-3 mx-auto text-lg shadow-lg"
        >
            <RocketLaunchIcon className="w-6 h-6" />
            Fazer meu primeiro quiz
        </button>
    </motion.div>
);

const EvolutionChart = ({ data }) => (
    <div className='bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-700/50'>
        <h2 className='text-xl font-bold text-white mb-4'>Evolução ao Longo do Tempo</h2>
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs><linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.8}/><stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="date" fontSize={12} tick={{ fill: 'var(--color-text-secondary)' }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fill: 'var(--color-text-secondary)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 23, 32, 0.8)', backdropFilter: 'blur(4px)', border: '1px solid #293344', borderRadius: '0.75rem' }} />
                <Area type="monotone" dataKey="Acertos" stroke="var(--color-accent)" fill="url(#colorUv)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

const SubjectPerformanceChart = ({ data }) => {
    const chartHeight = Math.max(300, data.length * 40);

    return (
        <div className='bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-700/50'>
            <h2 className='text-xl font-bold text-white mb-4'>Desempenho por Matéria</h2>
            <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: 'var(--color-text-secondary)' }} />
                    <YAxis type="category" dataKey="name" width={120} fontSize={12} tick={{ fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 23, 32, 0.8)', backdropFilter: 'blur(4px)', border: '1px solid #293344', borderRadius: '0.75rem' }} 
                        itemStyle={{ color: 'var(--color-accent)' }} // Cor do texto do item no tooltip
                        labelStyle={{ color: 'white' }} // Cor do label no tooltip
                    />
                    {/* Ajuste do fill da barra para usar uma cor com transparência no hover */}
                    <Bar dataKey="performance" name="Acertos (%)" fill="var(--color-accent)" radius={[0, 8, 8, 0]} barSize={20}
                         activeBar={{ fill: 'rgba(0, 226, 143, 0.15)' }} // Cor de hover com 15% de opacidade
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const DashboardPage = ({ supabase, session, setPage }) => {
    const [history, setHistory] = useState([]);
    const [username, setUsername] = useState('');
    const [activeTab, setActiveTab] = useState('subjects');
    const [internalLoading, setInternalLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setInternalLoading(true);
        setError(null);
        try {
            const [historyRes, profileRes] = await Promise.all([
                supabase.from('quiz_history').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true }),
                supabase.from('profiles').select('username').eq('id', session.user.id).single()
            ]);
            if (historyRes.error) throw historyRes.error;
            if (profileRes.error && profileRes.error.status !== 406) throw profileRes.error;
            if (historyRes.data) setHistory(historyRes.data);
            if (profileRes.data) setUsername(profileRes.data.username || session.user.email.split('@')[0]);
        } catch (e) {
            if (e.message.includes('Invalid JWT')) {
                toast.error('Sua sessão expirou. Faça o login novamente.');
                setTimeout(() => { supabase.auth.signOut(); }, 2000);
            } else {
                setError("Não foi possível carregar os dados.");
            }
        } finally {
            setInternalLoading(false);
        }
    }, [session.user.id, supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteHistory = async () => {
        setIsDeleteModalOpen(false);
        try {
            await supabase.from('quiz_history').delete().eq('user_id', session.user.id);
            setHistory([]);
            toast.success('Seu histórico foi apagado com sucesso!');
        } catch (e) {
            toast.error('Não foi possível apagar seu histórico.');
        }
    };

    const stats = useMemo(() => {
        if (!history || history.length === 0) {
            return null;
        }
        
        const totalQuizzes = history.length;
        const totalAnsweredQuestions = history.reduce((acc, item) => acc + Object.keys(item.userAnswers || {}).length, 0);
        const totalScore = history.reduce((acc, item) => acc + item.score, 0);
        const totalQuestionsInHistory = history.reduce((acc, item) => acc + item.total_questions, 0);
        const averageScore = totalQuestionsInHistory > 0 ? Math.round((totalScore / totalQuestionsInHistory) * 100) : 0;
        
        const subjectData = history.reduce((acc, item) => {
            const subjectName = item.subject.split(' (')[0];
            if (!acc[subjectName]) {
                acc[subjectName] = { totalScore: 0, totalQuestions: 0 };
            }
            acc[subjectName].totalScore += item.score;
            acc[subjectName].totalQuestions += item.total_questions;
            return acc;
        }, {});

        const performanceBySubject = Object.entries(subjectData).map(([subject, data]) => ({
            name: subject,
            performance: data.totalQuestions > 0 ? Math.round((data.totalScore / data.totalQuestions) * 100) : 0,
        }));

        const bestSubject = performanceBySubject.length > 0 ? performanceBySubject.reduce((best, current) => current.performance > best.performance ? current : best).name : 'N/A';
        const worstSubject = performanceBySubject.length > 0 ? performanceBySubject.reduce((worst, current) => current.performance < worst.performance ? current : worst).name : 'N/A';

        return { totalQuizzes, totalAnsweredQuestions, averageScore, performanceBySubject, bestSubject, worstSubject };
    }, [history]);

    const chartData = useMemo(() => history.map(item => ({ date: new Date(item.created_at).toLocaleDateString('pt-BR'), Acertos: item.total_questions > 0 ? Math.round((item.score / item.total_questions) * 100) : 0 })), [history]);
    
    // Variants para os elementos filhos
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } // Aumentar duração para mais suavidade
    };

    // Variants para o container principal, controlando o stagger
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.2, // Aumentar o stagger para mais lentidão
                duration: 0.8, // Duração da animação do container principal
                ease: "easeOut"
            }
        }
    };

    if (internalLoading) {
        return <div className='w-full min-h-screen py-16 md:py-24 px-4 bg-[--color-bg-hero]'><DashboardSkeleton /></div>;
    }
    
    if (error) {
        return <div className="text-center py-20 max-w-xl mx-auto"><ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-400 mb-4" /><h2 className="text-xl font-semibold text-white mb-2">Ocorreu um Erro</h2><p className="text-text-secondary mb-6">{error}</p><button onClick={fetchData} className="bg-[--color-accent] text-black font-bold py-2 px-6 rounded-lg hover:bg-[--color-accent-hover] transition-colors flex items-center gap-2 mx-auto"><ArrowPathIcon className="w-5 h-5" /> Tentar Novamente</button></div>;
    }

    if (!stats) {
        return <div className='w-full min-h-screen py-16 md:py-24 px-4 bg-[--color-bg-hero]'><EmptyState setPage={setPage} username={username} /></div>;
    }

    return (
        <div className='w-full min-h-screen py-16 md:py-24 px-4 bg-[--color-bg-hero]'>
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className='max-w-7xl mx-auto'>
                <motion.div variants={itemVariants} className="mb-12">
                    <h1 style={{font: 'var(--font-h1)'}} className='text-text-primary text-left'>
                        Olá, {username}!
                    </h1>
                    <p className="text-text-secondary text-lg mt-2">Este é o resumo do seu progresso até agora.</p>
                </motion.div>

                <motion.div variants={itemVariants} className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8'>
                    <StatCard title="Quizzes Realizados" value={stats.totalQuizzes} icon={ListBulletIcon} />
                    <StatCard title="Questões Respondidas" value={stats.totalAnsweredQuestions} icon={CheckCircleIcon} />
                    <StatCard title="Média de Acertos" value={`${stats.averageScore}%`} icon={PresentationChartLineIcon} />
                    <StatCard title="Ponto a Melhorar" value={stats.worstSubject} icon={AcademicCapIcon} />
                    <StatCard title="Melhor Matéria" value={stats.bestSubject} icon={TrophyIcon} highlight={true} />
                </motion.div>

                <div className='hidden lg:flex flex-col gap-8'>
                    <motion.div variants={itemVariants}>
                        <SubjectPerformanceChart data={stats.performanceBySubject} />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <EvolutionChart data={chartData} />
                    </motion.div>
                </div>

                <div className="lg:hidden">
                    <motion.div variants={itemVariants} className="flex border-b border-gray-700 mb-6">
                        <button onClick={() => setActiveTab('subjects')} className={`flex-1 py-3 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'subjects' ? 'text-[--color-accent] border-b-2 border-[--color-accent]' : 'text-text-secondary hover:text-white'}`}><ChartBarSquareIcon className="w-5 h-5" /> Matérias</button>
                        <button onClick={() => setActiveTab('evolution')} className={`flex-1 py-3 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'evolution' ? 'text-[--color-accent] border-b-2 border-[--color-accent]' : 'text-text-secondary hover:text-white'}`}><ChartPieIcon className="w-5 h-5" /> Evolução</button>
                    </motion.div>
                    <div>
                        {activeTab === 'evolution' && <EvolutionChart data={chartData} />}
                        {activeTab === 'subjects' && <SubjectPerformanceChart data={stats.performanceBySubject} />}
                    </div>
                </div>

                <motion.div variants={itemVariants} className="mt-12 flex justify-end items-center gap-4">
                    <button onClick={() => setIsDeleteModalOpen(true)} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2" title="Apagar todo o histórico">
                        <TrashIcon className="w-5 h-5" />
                        Apagar Histórico
                    </button>
                    <button onClick={fetchData} className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2" title="Atualizar Dados">
                        <ArrowPathIcon className="w-5 h-5" />
                        Atualizar
                    </button>
                </motion.div>
            </motion.div>
            
            <GenericConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteHistory} title="Apagar Histórico de Desempenho" message="Você tem certeza? Esta ação é irreversível e apagará todos os seus resultados de quizzes permanentemente." confirmText="Sim, apagar tudo" cancelText="Cancelar"/>
        </div>
    );
};

export default DashboardPage;