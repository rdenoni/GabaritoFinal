import React from 'react';
import { motion } from 'framer-motion';

// DADOS DOS CONCURSOS (com "information scent")
const contestsData = [
    { name: 'Receita Federal', subject: 'Receita Federal', enabled: false, status: 'Edital aguardado para 2025' },
    { name: 'Agente da Polícia Federal (PF)', subject: 'Agente da Polícia Federal', enabled: true, status: 'Último concurso em 2021' },
    { name: 'Polícia Rodoviária Federal (PRF)', subject: 'Polícia Rodoviária Federal (PRF)', enabled: false, status: 'Último concurso em 2021' },
    { name: 'Instituto Nacional do Seguro Social (INSS)', subject: 'INSS', enabled: false, status: 'Último concurso em 2022' },
    { name: 'Banco Central do Brasil (BACEN)', subject: 'BACEN', enabled: false, status: 'Edital publicado' },
    { name: 'Tribunal de Contas da União (TCU)', subject: 'TCU', enabled: false, status: 'Último concurso em 2022' }
];

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

// CORREÇÃO APLICADA AQUI: O código completo do ícone foi restaurado.
const LockIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);


const FederalContestsPage = ({ setPage, setContest }) => {
  return (
    <div className="page-with-bg">
      <div className="page-bg-overlay">
        <div className='animate-fade-up max-w-4xl mx-auto w-full z-10 pt-10'>
            <h2 className='text-4xl font-semibold texto-titulo text-center mb-8'>Concursos Federais</h2>
            
            <motion.div 
              className='flex flex-col gap-4'
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
{contestsData.map((contest) => (
                <motion.button
                  key={contest.name}
                  className='selection-button'
                  disabled={!contest.enabled}
                  onClick={contest.enabled ? () => { setContest(contest.subject); setPage('quiz-selection'); } : null}
                  variants={itemVariants}
                  whileHover={{ scale: contest.enabled ? 1.02 : 1, y: contest.enabled ? -2 : 0 }}
                  whileTap={{ scale: contest.enabled ? 0.98 : 1 }}
                  title={!contest.enabled ? 'Em breve!' : ''}
                >
                  {/* CORREÇÃO APLICADA AQUI: 
                    Trocado 'items-center' por 'items-start' para alinhar o ícone com o topo do texto.
                  */}
                  <div className="flex items-start text-left"> {/* <--- MUDANÇA AQUI */}
                    {!contest.enabled && <LockIcon />}
                    <div>
                      <span className="font-semibold text-lg">{contest.name}</span>
                      <span className="block text-sm text-gray-300 mt-1">{contest.status}</span>
                    </div>
                  </div>
                  <svg className="w-6 h-6 icon-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </motion.button>
              ))}
            </motion.div>
            
            <button
              className='px-6 py-3 bg-gray-700/80 backdrop-blur-sm text-white rounded-xl hover:bg-gray-600 flex items-center mx-auto mt-10 shadow-md font-semibold'
              onClick={() => setPage('home-page')}
            >
              Voltar
            </button>
        </div>
      </div>
    </div>
  );
};

export default FederalContestsPage;