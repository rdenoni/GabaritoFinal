import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import estadualBg from '../../assets/img/bg/bg_estadual.webp';
import federalBg from '../../assets/img/bg/bg_federal.webp';
import municipalBg from '../../assets/img/bg/bg_municipal.webp';
import publicaBg from '../../assets/img/bg/bg_publica.webp';

const ShowcaseSection = ({ setPage }) => {
  const [activeIndex, setActiveIndex] = useState(1);
  const contestTypes = [
    { title: 'CONCURSOS\nESTADUAIS', imageUrl: estadualBg, enabled: false },
    { title: 'CONCURSOS\nFEDERAIS', imageUrl: federalBg, page: 'federal-contests', enabled: true },
    { title: 'CONCURSOS\nMUNICIPAIS', imageUrl: municipalBg, enabled: false },
    { title: 'EMPRESAS\nPÚBLICAS', imageUrl: publicaBg, enabled: false },
  ];
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <section 
      className="w-full py-12 px-4"
      style={{
        backgroundImage: 'linear-gradient(to bottom, #11161F 30%, #19202B 30%)'
      }}
    >
      {/* Versão Desktop */}
      <div className="hidden lg:flex flex-row gap-2 max-w-5xl mx-auto h-[500px]">
        {contestTypes.map((contest, index) => (
          <motion.div key={contest.title} className="showcase-card shadow-xl" style={{ backgroundImage: `url(${contest.imageUrl})` }} onMouseEnter={() => setActiveIndex(index)} animate={{ width: activeIndex === index ? '40%' : '20%', filter: !contest.enabled ? 'grayscale(80%)' : 'none' }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }} initial={{ width: '25%' }}>
            <div className="showcase-overlay">
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, transition:{ duration: 0.3 } }} transition={{ duration: 0.4, delay: 0.2 }} className="flex flex-col items-center">
                    {!contest.enabled && ( <LockClosedIcon className="w-6 h-6 text-white text-opacity-50 mb-2" /> )}
                    <h2 style={{ font: "700 32px/1.2 'Roboto Condensed', sans-serif" }} className={`uppercase mb-4 whitespace-pre-line ${!contest.enabled ? 'text-gray-400' : 'text-white'}`}>
                      {contest.title}
                    </h2>
                    {contest.enabled && ( 
                      <motion.button onClick={() => setPage(contest.page)} className="btn-gradiente whitespace-nowrap" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}>
                        <span>ACESSAR AGORA</span>
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Versão Mobile */}
      <div className="lg:hidden flex flex-col gap-4 max-w-5xl mx-auto">
        {contestTypes.map((contest) => (
            <motion.div 
                key={contest.title}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ amount: 0.3, once: false }} // <<< CORREÇÃO APLICADA AQUI
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                
                className={`relative w-full h-40 rounded-lg overflow-hidden bg-cover bg-center flex items-center justify-center text-center p-4 shadow-lg ${!contest.enabled ? 'grayscale' : ''}`}
                style={{ backgroundImage: `url(${contest.imageUrl})` }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <div className="relative z-10 flex flex-col items-center">
                    {!contest.enabled && ( <LockClosedIcon className="w-5 h-5 text-white text-opacity-70 mb-2" /> )}
                    <h2 style={{ font: 'var(--font-h3)' }} className={`uppercase mb-3 whitespace-pre-line ${!contest.enabled ? 'text-gray-500' : 'text-white'}`}>{contest.title}</h2>
                    {contest.enabled && (
                        <button onClick={() => setPage(contest.page)} className="bg-[--color-accent] text-black font-bold py-2 px-5 rounded-lg text-sm">
                            <span>ACESSAR AGORA</span>
                        </button>
                    )}
                </div>
            </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ShowcaseSection;