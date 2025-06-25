import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import Logo from '../Shared/Logo'; 

const HeaderSection = ({ setPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNavClick = (page) => {
        if (page === 'home-page' || page === 'faq-page' || page === 'contact-page') {
            setPage(page);
            setIsMenuOpen(false);
        } else {
            alert(`Navegação para a página ${page} ainda não implementada.`);
        }
    };

    return (
        <header style={{backgroundImage: 'linear-gradient(to bottom, #19202B, #11161F)'}} className="w-full py-10">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mx-auto pb-8 max-w-6xl">
                  <div className="flex-1 flex justify-start">
                      <nav className="hidden md:flex">
                           <button onClick={() => handleNavClick('home-page')} className="menu-link">HOME</button>
                      </nav>
                  </div>
                  <div className="flex-shrink-0">
                      
                      <div className="cursor-pointer" onClick={() => handleNavClick('home-page')}>
                          <Logo className="w-52 h-auto" />
                      </div>
                  </div>
                  <div className="flex-1 flex justify-end items-center">
                      <nav className="hidden md:flex gap-10 items-center">
                          <button onClick={() => handleNavClick('faq-page')} className="menu-link">FAQ</button>
                          <button onClick={() => handleNavClick('contact-page')} className="menu-link">CONTATO</button>
                      </nav>
                      <button 
                        className="md:hidden z-50 text-white" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                      >
                          {isMenuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
                      </button>
                  </div>
              </div>
            </div>
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-95 z-40 flex flex-col items-center justify-center"
                    >
                        <nav className="flex flex-col items-center gap-10">
                            <button onClick={() => handleNavClick('home-page')} className="menu-link text-3xl">HOME</button>
                            <button onClick={() => handleNavClick('faq-page')} className="menu-link text-3xl">FAQ</button>
                            <button onClick={() => handleNavClick('contact-page')} className="menu-link text-3xl">CONTATO</button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default HeaderSection;

