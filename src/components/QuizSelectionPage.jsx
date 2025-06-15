import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

const QuizSelectionPage = ({ setPage, contest, startQuiz, subjects }) => {
  return (
    <div className="page-with-bg">
      <div className="page-bg-overlay">
        <div className='animate-fade-up max-w-4xl mx-auto w-full z-10 pt-10'>
          <div className='text-center mb-8'>
            <h2 className='text-4xl font-semibold texto-titulo'>Disciplinas</h2>
            <p className='text-xl texto-subtitulo mt-2'>{contest}</p>
          </div>

          {/* MUDANÇA 4: Botão para baixar o E-book adicionado com destaque */}
          <div className="flex justify-center mb-10">
            <motion.button 
              className="bg-yellow-500 text-blue-900 font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => alert('Download do E-book iniciado!')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              BAIXAR E-BOOK GRATUITO
            </motion.button>
          </div>
          
          <motion.div 
            className='flex flex-col gap-4'
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {subjects.map((subject) => (
              <motion.button
                key={subject}
                className='selection-button'
                onClick={() => startQuiz(subject, contest)}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-semibold text-lg">{subject}</span>
                <svg className="w-6 h-6 icon-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </motion.button>
            ))}
          </motion.div>
          
          <button
            className='px-6 py-3 bg-gray-700/80 backdrop-blur-sm text-white rounded-xl hover:bg-gray-600 flex items-center mx-auto mt-10 shadow-md font-semibold'
            onClick={() => setPage('federal-contests')}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizSelectionPage;