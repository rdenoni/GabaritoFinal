import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../supabaseClient';
import { UserIcon, LockClosedIcon, CameraIcon, TrashIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import GenericConfirmModal from '../Shared/GenericConfirmModal';

import genericAvatar1 from '../../assets/img/avatars/avatar1.png';
import genericAvatar2 from '../../assets/img/avatars/avatar2.png';
import genericAvatar3 from '../../assets/img/avatars/avatar3.png';
import genericAvatar4 from '../../assets/img/avatars/avatar4.png';

const genericAvatars = [
    { id: '1', src: genericAvatar1, alt: 'Avatar Genérico 1' },
    { id: '2', src: genericAvatar2, alt: 'Avatar Genérico 2' },
    { id: '3', src: genericAvatar3, alt: 'Avatar Genérico 3' },
    { id: '4', src: genericAvatar4, alt: 'Avatar Genérico 4' },
];

const ProfilePage = ({ session, onProfileUpdate }) => {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRemoveAvatarModalOpen, setIsRemoveAvatarModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const getProfile = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', session.user.id)
                    .single();
                
                if (error && error.status !== 406) throw error;

                if (data) {
                    setUsername(data.username || session.user.email.split('@')[0]);
                    setAvatarUrl(data.avatar_url);
                } else {
                    setUsername(session.user.email.split('@')[0]);
                }
            } catch (error) {
                toast.error("Não foi possível carregar seu perfil.");
                console.error('Erro ao buscar perfil:', error.message);
            } finally {
                setLoading(false);
            }
        };
        if (session) getProfile();
    }, [session]);

    const updateProfile = async (profileData) => {
        try {
            setLoading(true);
            const updates = {
                id: session.user.id,
                username: profileData.username,
                avatar_url: profileData.avatar_url,
                updated_at: new Date(),
            };
            
            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;

            toast.success('Perfil atualizado com sucesso!');
            if (onProfileUpdate) onProfileUpdate();

        } catch (error) {
            toast.error("Não foi possível atualizar o perfil.");
            console.error('Erro ao atualizar perfil:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) throw new Error('Você precisa selecionar uma imagem.');
            
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
            
            let { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
            const newUrl = data.publicUrl;

            setAvatarUrl(newUrl);
            await updateProfile({ username, avatar_url: newUrl });

        } catch (error) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handlePasswordChange = async () => {
        setIsChangePasswordModalOpen(false);
        if (newPassword.length < 6) {
            toast.error('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem.');
            return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Senha alterada com sucesso!');
            setNewPassword('');
            setConfirmPassword('');
        }
    };
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        updateProfile({ username, avatar_url: avatarUrl });
    };

    const confirmRemoveAvatar = async () => {
        setIsRemoveAvatarModalOpen(false);
        setAvatarUrl(null);
        await updateProfile({ username, avatar_url: null });
    };
    
    const selectGenericAvatar = async (url) => {
        setAvatarUrl(url);
        await updateProfile({ username, avatar_url: url });
    };

    if (loading) {
        return <div className="w-full text-center py-40 text-white">A carregar perfil...</div>;
    }

    return (
        <div className='w-full py-16 px-4 bg-[--color-bg-hero]'>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='max-w-5xl mx-auto'>
                <div className="flex flex-col md:flex-row gap-8 justify-center">
                    <div className="space-y-6 bg-gray-800 p-8 rounded-xl shadow-lg flex-1">
                        <h1 className="text-3xl font-bold text-white mb-4">Editar Perfil</h1>
                        
                        <div className="flex flex-col items-center mb-2">
                            <div className="relative w-32 h-32 rounded-full group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                <img src={avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${session.user.email}`} alt="Avatar" className="w-full h-full object-cover rounded-full border-2 border-gray-600"/>
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"><CameraIcon className="w-8 h-8 text-white" /></div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={uploadAvatar} className="hidden" accept="image/png, image/jpeg" disabled={uploading} />

                            {avatarUrl && (<button type="button" onClick={() => setIsRemoveAvatarModalOpen(true)} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors mt-2"><TrashIcon className="w-4 h-4" /> Remover</button>)}
                        </div>

                        <div>
                            <p className='block text-text-secondary mb-3 text-center'>Ou escolha um avatar genérico:</p>
                            <div className='flex flex-wrap items-center justify-center gap-4'>
                                {genericAvatars.map(avatar => (
                                    <button type="button" key={avatar.id} onClick={() => selectGenericAvatar(avatar.src)} className={`w-12 h-12 rounded-full overflow-hidden border-2 ${avatarUrl === avatar.src ? 'border-[--color-accent] ring-2 ring-[--color-accent]' : 'border-gray-700 hover:border-gray-500'} transition-all bg-gray-700 flex-shrink-0`}><img src={avatar.src} alt={avatar.alt} className='w-full h-full object-cover' /></button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-text-secondary mb-2">Nome de Usuário</label>
                                <div className="relative"><UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="username" type="text" value={username || ''} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 pl-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 text-white" placeholder="Seu nome de usuário" /></div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-text-secondary mb-2">Email</label>
                                <div className="relative"><EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="email" type="text" value={session.user.email} disabled className="w-full p-3 pl-10 bg-gray-900 rounded-lg border-2 border-gray-700 cursor-not-allowed text-gray-400"/></div>
                            </div>
                            <div><button type="submit" className="w-full py-3 px-6 bg-[--color-accent] text-black font-bold rounded-lg hover:bg-[--color-accent-hover] transition-colors" disabled={loading || uploading}>{loading ? 'A guardar...' : 'Salvar Nome'}</button></div>
                        </form>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); setIsChangePasswordModalOpen(true); }} className="space-y-6 bg-gray-800 p-8 rounded-xl shadow-lg flex-1">
                         <h2 className="text-3xl font-bold text-white mb-4">Alterar Senha</h2>
                         <div>
                            <label htmlFor="newPassword" className='block text-text-secondary mb-2'>Nova Senha</label>
                            <div className="relative"><LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 pl-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 text-white" placeholder="Mínimo de 6 caracteres" /></div>
                         </div>
                         <div>
                            <label htmlFor="confirmPassword" className='block text-text-secondary mb-2'>Confirmar Nova Senha</label>
                             <div className="relative"><LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 pl-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 text-white" placeholder="Repita a nova senha" /></div>
                         </div>
                         <div><button type="submit" className="w-full py-3 px-6 bg-[--color-accent] text-black font-bold rounded-lg hover:bg-[--color-accent-hover] transition-colors" disabled={loading}>{loading ? 'A alterar...' : 'Alterar Senha'}</button></div>
                    </form>
                </div>
            </motion.div>
            <GenericConfirmModal isOpen={isRemoveAvatarModalOpen} onClose={() => setIsRemoveAvatarModalOpen(false)} onConfirm={confirmRemoveAvatar} title="Remover Foto de Perfil" message="Tem certeza que deseja remover sua foto de perfil?" confirmText="Remover" cancelText="Cancelar"/>
            <GenericConfirmModal isOpen={isChangePasswordModalOpen} onClose={() => setIsChangePasswordModalOpen(false)} onConfirm={handlePasswordChange} title="Confirmar Alteração de Senha" message="Você tem certeza que deseja alterar sua senha?" confirmText="Confirmar Alteração" cancelText="Cancelar"/>
        </div>
    );
};

export default ProfilePage;