import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  
  return (
    <section className="w-full py-12 px-4 bg-[#11161F]">
      <div className="hidden lg:flex flex-row gap-2 max-w-6xl mx-auto h-[600px]">
        {contestTypes.map((contest, index) => (
          <motion.div
            key={contest.title}
            className="showcase-card"
            style={{ backgroundImage: `url(${contest.imageUrl})` }}
            onMouseEnter={() => setActiveIndex(index)}
            animate={{ 
              width: activeIndex === index ? '40%' : '20%',
              filter: !contest.enabled ? 'grayscale(80%)' : 'none'
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            initial={{ width: '25%' }}
          >
            <div className="showcase-overlay">
              {activeIndex === index && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex flex-col items-center"
                >
                  {!contest.enabled && (
                    <LockClosedIcon className="w-6 h-6 text-white text-opacity-50 mb-2" />
                  )}
                  <h2 style={{ font: "700 32px/1.2 'Roboto Condensed', sans-serif" }} className="text-white uppercase mb-4 whitespace-pre-line">
                    {contest.title}
                  </h2>
                  {contest.enabled && (
                    <button onClick={() => setPage(contest.page)} className="btn-gradiente whitespace-nowrap">
                      <span>ACESSAR AGORA</span>
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="lg:hidden flex flex-col gap-4 max-w-5xl mx-auto">
        {contestTypes.map((contest) => (
            <div 
                key={contest.title}
                className={`relative w-full h-40 rounded-lg overflow-hidden bg-cover bg-center flex items-center justify-center text-center p-4 ${!contest.enabled ? 'grayscale' : ''}`}
                style={{ backgroundImage: `url(${contest.imageUrl})` }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-60"></div>
                <div className="relative z-10 flex flex-col items-center">
                    {!contest.enabled && (
                      <LockClosedIcon className="w-7 h-7 text-white text-opacity-70 mb-2" />
                    )}
                    <h2 style={{ font: 'var(--font-h3)' }} className="text-white uppercase mb-3 whitespace-pre-line">
                        {contest.title}
                    </h2>
                    {contest.enabled && (
                        <button onClick={() => setPage(contest.page)} className="bg-[--color-accent] text-black font-bold py-2 px-5 rounded-lg text-sm">
                            <span>ACESSAR AGORA</span>
                        </button>
                    )}
                </div>
            </div>
        ))}
      </div>
    </section>
  );
};

export default ShowcaseSection;