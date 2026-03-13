import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import Logo from '../Shared/Logo';
import LogoHorizontal from '../Shared/LogoHorizontal';
import GenericConfirmModal from '../Shared/GenericConfirmModal';
import {
    ArrowLeftOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    Cog6ToothIcon,
    ChartBarIcon,
    HomeIcon,
    QuestionMarkCircleIcon,
    EnvelopeIcon,
    UserCircleIcon
} from '@heroicons/react/24/solid';

// Import generic avatars here as well to check against
import genericAvatar1 from '../../assets/img/avatars/avatar1.png';
import genericAvatar2 from '../../assets/img/avatars/avatar2.png'; // CORRIGIDO O CAMINHO
import genericAvatar3 from '../../assets/img/avatars/avatar3.png'; // CORRIGIDO O CAMINHO
import genericAvatar4 from '../../assets/img/avatars/avatar4.png'; // CORRIGIDO O CAMINHO

const GENERIC_AVATAR_PATHS = [ // Use paths that match what ProfilePage stores
    '/src/assets/img/avatars/avatar1.png',
    '/src/assets/img/avatars/avatar2.png',
    '/src/assets/img/avatars/avatar3.png',
    '/src/assets/img/avatars/avatar4.png',
];

const mobileMenuVariants = {
    open: { x: 0, transition: { type: "tween", ease: "easeOut", duration: 0.4 } },
    closed: { x: "-100%", transition: { type: "tween", ease: "easeIn", duration: 0.3 } },
};

const HeaderSection = ({ setPage, session }) => {
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const userMenuRef = useRef(null);

    const getAvatarDisplayUrl = (avatarUrlFromDb) => {
        if (!avatarUrlFromDb) return null;

        // Check if it's one of the generic paths
        if (GENERIC_AVATAR_PATHS.includes(avatarUrlFromDb)) {
            // Find the correct imported image based on the path
            switch(avatarUrlFromDb) {
                case '/src/assets/img/avatars/avatar1.png': return genericAvatar1;
                case '/src/assets/img/avatars/avatar2.png': return genericAvatar2;
                case '/src/assets/img/avatars/avatar3.png': return genericAvatar3;
                case '/src/assets/img/avatars/avatar4.png': return genericAvatar4;
                default: return null;
            }
        } else {
            // Assume it's a Supabase storage path
            const { data } = supabase.storage.from('avatars').getPublicUrl(avatarUrlFromDb);
            return data.publicUrl;
        }
    };

    const fetchProfile = async () => {
        if (!session) return;
        try {
            const { data, error, status } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('id', session.user.id)
                .single();

            if (error && status !== 406) throw error;

            if (data) {
                setProfile({
                    username: data.username || session.user.email.split('@')[0],
                    avatar_url: data.avatar_url,
                    display_avatar_url: getAvatarDisplayUrl(data.avatar_url) // Calculate display URL here
                });
            }
        } catch (error) {
            console.error('Erro ao buscar perfil no Header:', error);
        }
    };

    useEffect(() => {
        if (!session) {
            setProfile(null);
            return;
        }

        fetchProfile();

        const channel = supabase.channel('realtime-profile-header-final')
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
                () => {
                    fetchProfile();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session]);

    const handleNavClick = (page) => {
        setPage(page);
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
    };

    const handleLogout = () => {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = async () => {
        setIsLogoutModalOpen(false);
        await supabase.auth.signOut();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setUserMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <header style={{backgroundImage: 'linear-gradient(to bottom, #19202B, #11161F)'}} className="w-full py-8 md:py-10 relative z-40"> {/* Ajuste aqui para descer a logo */}
                 <div className="container mx-auto px-4">
                  <div className="flex justify-between items-center mx-auto max-w-7xl">
                       {/* LAYOUT MOBILE: Logo (esquerda) e Hamburger (direita) */}
                       <motion.div className="cursor-pointer md:hidden" onClick={() => handleNavClick('home-page')} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                           <LogoHorizontal className="h-12 w-auto" />
                       </motion.div>
                       <div className="md:hidden">
                           <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md hover:bg-white/10 transition-colors relative z-50">
                               <Bars3Icon className="w-7 h-7 text-white" />
                           </button>
                       </div>
                       
                       {/* LAYOUT DESKTOP: Navegação (esquerda), Logo (centro), Avatar (direita) */}
                       <div className="hidden md:flex w-full items-center">
                           {/* Coluna Esquerda: Navegação */}
                           <div className="w-1/3 flex justify-start">
                               <motion.nav className="flex items-center gap-8 h-12">
                                   <motion.button onClick={() => handleNavClick('home-page')} className="menu-link">HOME</motion.button>
                                   <motion.button onClick={() => handleNavClick('faq-page')} className="menu-link">FAQ</motion.button>
                                   <motion.button onClick={() => handleNavClick('contact-page')} className="menu-link">CONTATO</motion.button>
                               </motion.nav>
                           </div>
                           
                           {/* Coluna Central: Logo */}
                           <div className="w-1/3 flex justify-center">
                               <motion.div className="cursor-pointer" onClick={() => handleNavClick('home-page')} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
                                   <Logo className="w-48 h-auto md:w-56" />
                               </motion.div>
                           </div>

                           {/* Coluna Direita: Avatar/Login */}
                           <div className="w-1/3 flex justify-end">
                               {session ? (
                                   <div ref={userMenuRef} className="relative flex items-center">
                                       <button onClick={() => setUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-3 py-2 px-3 rounded-full hover:bg-white/10 transition-colors">
                                           <span className="text-white font-semibold text-lg" style={{ lineHeight: '1.2' }}>{profile?.username || 'Carregando...'}</span>
                                           
                                           {profile?.display_avatar_url ? ( // Use display_avatar_url
                                               <img 
                                                   key={profile.display_avatar_url} // Key on display URL
                                                   src={`${profile.display_avatar_url}?t=${new Date().getTime()}`}
                                                   alt="Avatar do usuário" 
                                                   className="w-12 h-12 rounded-full object-cover border-2 border-gray-600" 
                                               />
                                           ) : (
                                               <UserCircleIcon className="w-12 h-12 text-gray-400" />
                                           )}
                                       </button>
                                       <AnimatePresence>
                                         {isUserMenuOpen && ( <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute top-full right-0 mt-2 w-60 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-20 origin-top-right"> <div className="p-4 border-b border-gray-700"><p className="text-sm text-white font-semibold truncate">{session.user.email}</p></div> <button onClick={() => handleNavClick('dashboard-page')} className="w-full text-left flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"><ChartBarIcon className="w-5 h-5" />Meu Desempenho</button> <button onClick={() => handleNavClick('profile-page')} className="w-full text-left flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"><Cog6ToothIcon className="w-5 h-5" />Editar Perfil</button> <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/20 transition-colors"><ArrowLeftOnRectangleIcon className="w-5 h-5" />Sair</button> </motion.div> )}
                                       </AnimatePresence>
                                   </div>
                               ) : ( 
                                   <button onClick={() => handleNavClick('login')} className='px-6 py-2 bg-[--color-accent] text-black font-bold rounded-lg hover:bg-[--color-accent-hover] transition-colors'>Entrar</button>
                               )}
                           </div>
                       </div>
                  </div>
                 </div>
            </header>

            <AnimatePresence>
                 {isMobileMenuOpen && (
                     <>
                         {/* Overlay que escurece o fundo */}
                         <motion.div
                             key="overlay"
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             exit={{ opacity: 0 }}
                             onClick={() => setMobileMenuOpen(false)}
                             className="fixed inset-0 bg-black/60 z-40"
                         />
                         {/* Painel do Menu */}
                         <motion.div
                             key="mobile-menu"
                             variants={mobileMenuVariants}
                             initial="closed"
                             animate="open"
                             exit="closed"
                             className="fixed top-0 left-0 w-4/5 max-w-sm h-full bg-gray-800 shadow-2xl z-50 flex flex-col p-6"
                         >
                             <div className="flex justify-end mb-8">
                                 <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors">
                                     <XMarkIcon className="w-8 h-8" />
                                 </button>
                             </div>
                             <nav className="flex flex-col w-full">
                                 {session && profile && (
                                     <>
                                         {/* Bloco de usuário redesenhado e alinhado à esquerda */}
                                         <div className="flex items-center gap-4 w-full mb-4">
                                             {profile.display_avatar_url ? ( // Use display_avatar_url
                                                <img
                                                    key={profile.display_avatar_url}
                                                    src={`${profile.display_avatar_url}?t=${new Date().getTime()}`}
                                                    alt="Avatar"
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                                                />
                                             ) : (
                                                <UserCircleIcon className="w-10 h-10 text-gray-400" />
                                             )}
                                             <div className="flex flex-col items-start">
                                                 <span className="text-white font-normal text-base">{profile.username || 'Usuário'}</span>
                                                 <span className="text-gray-400 font-normal text-sm">{session.user.email}</span>
                                             </div>
                                         </div>
                                         <div className="w-full h-px bg-gray-700 mb-6"></div>
                                     </>
                                 )}
 
                                 <div className="flex flex-col w-full gap-3 text-lg">
                                     <button onClick={() => handleNavClick('home-page')} className="w-full py-3 px-2 rounded-md text-white flex flex-row items-center justify-start gap-4 hover:bg-white/10 transition-colors"><HomeIcon className="w-6 h-6 text-[--color-accent]" /><span>HOME</span></button>
                                     {session && (
                                         <>
                                             <button onClick={() => handleNavClick('dashboard-page')} className="w-full py-3 px-2 rounded-md text-white flex flex-row items-center justify-start gap-4 hover:bg-white/10 transition-colors"><ChartBarIcon className="w-6 h-6 text-[--color-accent]" /><span>MEU DESEMPENHO</span></button>
                                             <button onClick={() => handleNavClick('profile-page')} className="w-full py-3 px-2 rounded-md text-white flex flex-row items-center justify-start gap-4 hover:bg-white/10 transition-colors"><Cog6ToothIcon className="w-6 h-6 text-[--color-accent]" /><span>EDITAR PERFIL</span></button>
                                         </>
                                     )}
                                     <button onClick={() => handleNavClick('faq-page')} className="w-full py-3 px-2 rounded-md text-white flex flex-row items-center justify-start gap-4 hover:bg-white/10 transition-colors"><QuestionMarkCircleIcon className="w-6 h-6 text-[--color-accent]" /><span>FAQ</span></button>
                                     <button onClick={() => handleNavClick('contact-page')} className="w-full py-3 px-2 rounded-md text-white flex flex-row items-center justify-start gap-4 hover:bg-white/10 transition-colors"><EnvelopeIcon className="w-6 h-6 text-[--color-accent]" /><span>CONTATO</span></button>
                                 </div>
 
                                 <div className="w-full h-px bg-gray-700 my-6"></div>
 
                                 {session ? (
                                     <button onClick={handleLogout} className="w-full py-3 px-2 rounded-md text-red-400 flex flex-row items-center justify-start gap-4 hover:bg-red-500/20 transition-colors"><ArrowLeftOnRectangleIcon className="w-6 h-6" /><span>Sair</span></button>
                                 ) : (
                                     <button onClick={() => handleNavClick('login')} className="w-full py-3 px-2 rounded-md text-[--color-accent] flex flex-row items-center justify-start gap-4 hover:bg-white/10 transition-colors"><span>ENTRAR</span></button>
                                 )}
                             </nav>
                         </motion.div>
                     </>
                 )}
             </AnimatePresence>
 
             <GenericConfirmModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={confirmLogout} title="Confirmar Saída" message="Você tem certeza que deseja sair da sua conta?" confirmText="Sair" />
         </>
     );
 };
 
 export default HeaderSection;