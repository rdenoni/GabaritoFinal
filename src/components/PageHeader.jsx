import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Ícones ---
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- Componente Principal do Header ---
const PageHeader = ({ onLogoClick, setPage }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleMenuLinkClick = (page) => {
        setIsMobileMenuOpen(false);
        if (page) {
            setPage(page);
        } else {
            alert('Navegação para página externa ou modal.');
        }
    };

    return (
        <>
            <header className='w-full bg-[#242c3b] sticky top-0 z-40'>
                <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    {/* LOGO */}
                    <img 
                        src='/img/LOGO_AZ_HORI.svg' 
                        alt='Gabarito Final Logo' 
                        className='w-[240px] md:w-[300px] cursor-pointer'
                        onClick={onLogoClick} 
                    />

                    {/* AÇÕES DO USUÁRIO (DESKTOP) E BOTÃO HAMBÚRGUER (MOBILE) */}
                    <div className="flex items-center gap-4">
                        <button className="text-white hover:text-yellow-400 transition-colors hidden sm:block">
                            <UserIcon />
                        </button>
                        {/* BOTÃO HAMBÚRGUER: Visível apenas em telas menores que 'lg' */}
                        <button 
                            className="lg:hidden text-white"
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Abrir menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <MenuIcon />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* MENU GAVETA (MOBILE) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex justify-end"
                        aria-modal="true"
                    >
                        {/* BACKDROP */}
                        <div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        ></div>
                        
                        {/* PAINEL DO MENU */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: '0%' }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="relative w-full max-w-xs bg-[#2d3748] h-full flex flex-col"
                        >
                            {/* CABEÇALHO DO MENU GAVETA */}
                            <div className="flex justify-between items-center p-4 border-b border-gray-600">
                                <h2 className="text-xl font-bold texto-titulo">Menu</h2>
                                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Fechar menu">
                                    <CloseIcon />
                                </button>
                            </div>

                            {/* LINKS DE NAVEGAÇÃO DO MENU GAVETA */}
                            <nav className="flex-grow p-4 flex flex-col gap-2">
                                <a href="#" onClick={() => handleMenuLinkClick('home-page')} className="block text-lg py-3 px-4 rounded-md hover:bg-gray-600/50 transition-colors">Início</a>
                                <a href="#" onClick={() => handleMenuLinkClick('federal-contests')} className="block text-lg py-3 px-4 rounded-md hover:bg-gray-600/50 transition-colors">Concursos Federais</a>
                                <a href="#" onClick={() => handleMenuLinkClick()} className="block text-lg py-3 px-4 rounded-md hover:bg-gray-600/50 transition-colors">FAQ</a>
                                <a href="#" onClick={() => handleMenuLinkClick()} className="block text-lg py-3 px-4 rounded-md hover:bg-gray-600/50 transition-colors">Contato</a>
                                <div className="border-t border-gray-600 my-4"></div>
                                <a href="#" onClick={() => handleMenuLinkClick()} className="flex items-center gap-3 text-lg py-3 px-4 rounded-md hover:bg-gray-600/50 transition-colors">
                                    <UserIcon />
                                    Meu Perfil
                                </a>
                            </nav>

                            {/* RODAPÉ DO MENU GAVETA */}
                            <div className="p-4 border-t border-gray-600 text-center text-sm text-gray-400">
                                Gabarito Final &copy; {new Date().getFullYear()}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PageHeader;