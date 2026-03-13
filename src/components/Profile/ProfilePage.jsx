import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';
import { 
    UserIcon, KeyIcon, CameraIcon, TrashIcon, 
    EnvelopeIcon, ArrowRightIcon, ChartBarIcon, 
    PencilSquareIcon // Este ícone já está importado corretamente
} from '@heroicons/react/24/solid';
import Spinner from '../Shared/Spinner';
import GenericConfirmModal from '../Shared/GenericConfirmModal';

// --- IMAGENS DOS AVATARES PADRÃO ---
// Garanta que os caminhos para estas imagens estejam corretos no seu projeto.
import genericAvatar1 from '../../assets/img/avatars/avatar1.png';
import genericAvatar2 from '../../assets/img/avatars/avatar2.png';
import genericAvatar3 from '../../assets/img/avatars/avatar3.png';
import genericAvatar4 from '../../assets/img/avatars/avatar4.png';

const genericAvatars = [
    { id: '1', src: genericAvatar1, path: '/src/assets/img/avatars/avatar1.png' },
    { id: '2', src: genericAvatar2, path: '/src/assets/img/avatars/avatar2.png' },
    { id: '3', src: genericAvatar3, path: '/src/assets/img/avatars/avatar3.png' },
    { id: '4', src: genericAvatar4, path: '/src/assets/img/avatars/avatar4.png' },
];

// --- Componentes Internos ---

const ProfileSkeleton = () => (
    <div className="animate-pulse max-w-lg mx-auto p-8 space-y-8">
        <div className="flex justify-center"><div className="rounded-full bg-gray-700 h-32 w-32"></div></div>
        <div className="space-y-4"><div className="bg-gray-700 h-10 rounded-md"></div><div className="bg-gray-700 h-10 rounded-md"></div></div>
        <div className="space-y-4"><div className="bg-gray-700 h-10 rounded-md"></div><div className="bg-gray-700 h-10 rounded-md"></div><div className="bg-gray-700 h-10 rounded-md"></div></div>
    </div>
);

const AvatarSection = ({ url, onUpload, uploading, session, onRemove, onSelectGeneric }) => {
    const fileInputRef = useRef(null);
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-32 h-32 rounded-full group">
                <img
                    src={url || `https://api.dicebear.com/8.x/initials/svg?seed=${session.user.email}`}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-full border-2 border-gray-600"
                />
                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                    <CameraIcon className="w-8 h-8 text-white" />
                </label>
                <input id="avatar-upload" type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
            </div>
            {uploading && <div className="flex items-center gap-2 text-sm text-white"><Spinner className="w-4 h-4" /> Enviando...</div>}
            {url && !uploading && (
                <button type="button" onClick={onRemove} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                    <TrashIcon className="w-4 h-4" /> Remover Foto
                </button>
            )}
            <div className="mt-4 text-center">
                <p className='block text-text-secondary text-sm mb-3'>Ou escolha um dos nossos avatares:</p>
                <div className='flex flex-wrap items-center justify-center gap-4'>
                    {genericAvatars.map(avatar => (
                        <button type="button" key={avatar.id} onClick={() => onSelectGeneric(avatar.src, avatar.path)} className={`w-12 h-12 rounded-full overflow-hidden border-2 ${url === avatar.src ? 'border-[--color-accent] ring-2 ring-[--color-accent]' : 'border-gray-700 hover:border-gray-500'} transition-all bg-gray-700 flex-shrink-0`}>
                            <img src={avatar.src} alt={avatar.alt} className='w-full h-full object-cover' />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal ---

const ProfilePage = ({ session, onProfileUpdate, setPage }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null); 
    const [displayAvatarUrl, setDisplayAvatarUrl] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [dashboardStats, setDashboardStats] = useState(null);

    const getProfileAndStats = useCallback(async () => {
        if (!session?.user) return;
        try {
            const [profileRes, historyRes] = await Promise.all([
                supabase.from('profiles').select(`username, avatar_url`).eq('id', session.user.id).single(),
                supabase.from('quiz_history').select('score, total_questions, subject').eq('user_id', session.user.id)
            ]);

            if (profileRes.error && profileRes.status !== 406) throw profileRes.error;
            if (historyRes.error) throw historyRes.error;

            if (profileRes.data) {
                const profile = profileRes.data;
                setUsername(profile.username || session.user.email.split('@')[0]);
                setAvatarUrl(profile.avatar_url);
                if (profile.avatar_url) {
                    const isGeneric = genericAvatars.some(ga => ga.path === profile.avatar_url);
                    if (isGeneric) {
                        const generic = genericAvatars.find(ga => ga.path === profile.avatar_url);
                        setDisplayAvatarUrl(generic.src);
                    } else {
                        setDisplayAvatarUrl(supabase.storage.from('avatars').getPublicUrl(profile.avatar_url).data.publicUrl);
                    }
                }
            } else {
                 setUsername(session.user.email.split('@')[0]);
            }
            
            if (historyRes.data) {
                const history = historyRes.data;
                const totalQuizzes = history.length;
                if (totalQuizzes > 0) {
                    const subjectData = history.reduce((acc, item) => {
                        const subjectName = item.subject.split(' (')[0];
                        if (!acc[subjectName]) acc[subjectName] = { totalScore: 0, totalQuestions: 0 };
                        acc[subjectName].totalScore += item.score;
                        acc[subjectName].totalQuestions += item.total_questions;
                        return acc;
                    }, {});
                    const performanceBySubject = Object.values(subjectData).map(data => data.totalQuestions > 0 ? (data.totalScore / data.totalQuestions) * 100 : 0);
                    const best = Math.round(Math.max(...performanceBySubject));
                    const worst = Math.round(Math.min(...performanceBySubject));
                    const totalScore = history.reduce((sum, item) => sum + item.score, 0);
                    const totalQuestions = history.reduce((sum, item) => sum + item.total_questions, 0);
                    const averageAccuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
                    setDashboardStats({ best, worst, totalQuizzes, averageAccuracy });
                }
            }

        } catch (error) {
            toast.error("Erro ao carregar dados: " + error.message);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        getProfileAndStats();
    }, [getProfileAndStats]);

    async function handleProfileSave() {
        try {
            setSaving(true);
            const updates = { id: session.user.id, username, avatar_url: avatarUrl, updated_at: new Date() };
            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            toast.success('Perfil salvo com sucesso!');
            if (onProfileUpdate) onProfileUpdate();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    }
    
    async function uploadAvatar(event) {
        try {
            setSaving(true);
            const file = event.target.files[0];
            if (!file) throw new Error("Nenhum arquivo selecionado.");

            const fileName = `${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
            if (uploadError) throw uploadError;

            // Não precisamos mais do publicUrl aqui, apenas armazenamos o fileName no DB
            // O getAvatarDisplayUrl em HeaderSection e na própria ProfilePage vai lidar com a exibição
            setAvatarUrl(fileName); 
            setDisplayAvatarUrl(supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl); // Atualiza display imediatamente para feedback visual

            await handleProfileSave(); // Salva automaticamente após o upload
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    }
    
    async function removeAvatar() {
        setDisplayAvatarUrl(null);
        setAvatarUrl(null);
        await handleProfileSave();
        toast.success("Foto de perfil removida.");
    }
    
    const selectGenericAvatar = (src, path) => {
        setDisplayAvatarUrl(src); // O src é a URL direta da imagem para exibição
        setAvatarUrl(path); // O path é o caminho relativo para ser salvo no DB
    };

    async function changePassword() {
        if (!currentPassword || !newPassword) {
            toast.error("Por favor, preencha todos os campos para alterar a senha.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("A nova senha deve ter no mínimo 6 caracteres.");
            return;
        }
        setIsChangingPassword(true);
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: session.user.email,
            password: currentPassword
        });

        if (signInError) {
            toast.error("A senha atual está incorreta.");
            setIsChangingPassword(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Senha alterada com sucesso!");
            setCurrentPassword('');
            setNewPassword('');
        }
        setIsChangingPassword(false);
    }
    
    const handleForgotPassword = async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, { redirectTo: window.location.origin });
        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Um link para redefinir sua senha foi enviado para o seu e-mail.");
        }
    };
    
    // Definir variants para os elementos filhos
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } // Aumentar duração para mais suavidade
    };

    // Definir variants para o container principal, controlando o stagger
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

    if (loading) return <ProfileSkeleton />;

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className='w-full py-12 px-4 bg-[--color-bg-hero]'>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <motion.div variants={itemVariants} className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6"><PencilSquareIcon className="w-6 h-6 text-[--color-accent]" /> Dados do Perfil</h2>
                    <AvatarSection url={displayAvatarUrl} onUpload={uploadAvatar} uploading={saving} session={session} onRemove={removeAvatar} onSelectGeneric={selectGenericAvatar} />
                    <div className="space-y-4 mt-6">
                        <div>
                            <label htmlFor="email" className="block text-text-secondary text-sm font-bold mb-2">Email</label>
                            <div className="relative"><EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" /><input id="email" type="text" value={session.user.email} disabled className="w-full p-2.5 pl-10 bg-gray-900 rounded-lg border-2 border-gray-700 cursor-not-allowed text-gray-400"/></div>
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-text-secondary text-sm font-bold mb-2">Nome de Usuário</label>
                            <div className="relative"><UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="username" type="text" value={username || ''} onChange={(e) => setUsername(e.target.value)} className="w-full p-2.5 pl-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 text-white" /></div>
                        </div>
                        <div>
                            <button onClick={handleProfileSave} className="w-full py-3 px-6 bg-[--color-accent] text-black font-bold rounded-lg hover:bg-[--color-accent-hover] transition-colors" disabled={saving}>{saving ? 'Salvando...' : 'Salvar Alterações'}</button>
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-8">
                    <motion.div variants={itemVariants} className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700/50">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6"><KeyIcon className="w-6 h-6 text-[--color-accent]" />Alterar Senha</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="currentPassword" className="block text-text-secondary text-sm font-bold mb-2">Senha Atual</label>
                                <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-2.5 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 text-white" />
                            </div>
                            <div className="text-right"><button onClick={handleForgotPassword} className="text-xs text-text-secondary hover:text-[--color-accent] underline">Esqueceu sua senha?</button></div>
                            <div>
                                <label htmlFor="newPassword" className="block text-text-secondary text-sm font-bold mb-2">Nova Senha</label>
                                <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2.5 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 text-white" />
                            </div>
                            <button onClick={changePassword} className="w-full py-3 px-6 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors" disabled={isChangingPassword || !newPassword || !currentPassword}>{isChangingPassword ? 'Alterando...' : 'Confirmar Nova Senha'}</button>
                        </div>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700/50">
                       <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-6"><ChartBarIcon className="w-6 h-6 text-[--color-accent]" />Resumo do Desempenho</h2>
                        <div className='grid grid-cols-2 gap-4 text-center'>
                            <div className="bg-gray-900/50 p-4 rounded-lg"><p className='text-2xl font-bold text-[--color-accent]'>{dashboardStats?.totalQuizzes ?? 0}</p><p className='text-sm text-text-secondary'>Quizzes</p></div>
                            <div className="bg-gray-900/50 p-4 rounded-lg"><p className='text-2xl font-bold text-[--color-accent]'>{dashboardStats?.averageAccuracy ?? 0}%</p><p className='text-sm text-text-secondary'>Média Acertos</p></div>
                            <div className="bg-gray-900/50 p-4 rounded-lg"><p className='text-2xl font-bold text-[--color-accent]'>{dashboardStats?.best ?? 0}%</p><p className='text-sm text-text-secondary'>Melhor Matéria</p></div>
                            <div className="bg-gray-900/50 p-4 rounded-lg"><p className='text-2xl font-bold text-[--color-accent]'>{dashboardStats?.worst ?? 0}%</p><p className='text-sm text-text-secondary'>Ponto a Melhorar</p></div>
                        </div>
                        {/* Correção do onClick para o Dashboard Completo */}
                        <button onClick={() => setPage('dashboard-page')} className="mt-6 w-full py-3 px-6 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center gap-2">Ver Dashboard Completo <ArrowRightIcon className="h-4 w-4" /></button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfilePage;