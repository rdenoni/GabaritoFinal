import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Ícones ---
const StatsIcon = ({ path }) => (
    <svg className='w-8 h-8 mx-auto mb-2 texto-titulo' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d={path} />
    </svg>
);
const LockIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

// --- Dados ---
const contestTypes = [
  { title: 'CONCURSOS ESTADUAIS', subtitle: 'Veja os concursos disponíveis no seu estado.', page: 'state-contests', enabled: false, imageUrl: '/img/estaduais_bg.webp', tooltip: 'Disponível em breve!' },
  { title: 'CONCURSOS FEDERAIS', subtitle: 'Prepare-se para os maiores concursos do país.', page: 'federal-contests', enabled: true, imageUrl: '/img/federais_bg.webp' },
  { title: 'CONCURSOS MUNICIPAIS', subtitle: 'Encontre vagas na sua cidade.', page: 'municipal-contests', enabled: false, imageUrl: '/img/municipais_bg.webp', tooltip: 'Disponível em breve!' },
  { title: 'EMPRESAS PÚBLICAS', subtitle: 'Vagas em estatais e outras empresas públicas.', page: 'public-companies-contests', enabled: false, imageUrl: '/img/empresas_bg.webp', tooltip: 'Disponível em breve!' },
];
const stats = [
  { value: '5000+', label: 'Questões', icon: 'M9 12h6m-3-3v6M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { value: '12k+', label: 'Usuários', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 4v2a3 3 0 005.356 1.857M17 4v2a3 3 0 01-5.356 1.857' },
  { value: '2.5k+', label: 'Aprovações', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { value: '85%', label: 'Taxa de Sucesso', icon: 'M3 3v18h18M9 17l3-3 3 3 4-4' }
];
const features = [
  { title: 'Questões Reais', description: 'Pratique com questões de concursos anteriores.' },
  { title: 'Feedback Imediato', description: 'Receba explicações detalhadas para cada questão.' },
  { title: 'Acompanhe seu Progresso', description: 'Monitore seu desempenho e identifique áreas de melhoria.' }
];


// --- Componente do Carrossel de Destaque (RESPONSIVO) ---
const ContestShowcase = ({ setPage }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className="showcase-wrapper">
            <div className="flex flex-col lg:flex-row w-full max-w-7xl h-auto lg:h-[600px] gap-4">
                {contestTypes.map((contest, index) => (
                    <motion.div
                        key={index}
                        className="showcase-card h-[250px] lg:h-full w-full lg:w-auto"
                        style={{ backgroundImage: `url(${contest.imageUrl})` }}
                        onHoverStart={() => setHoveredIndex(index)}
                        onHoverEnd={() => setHoveredIndex(null)}
                        animate={{ width: window.innerWidth < 1024 ? '100%' : (hoveredIndex === index ? '40%' : '20%') }}
                        transition={{ type: 'spring', stiffness: 100, damping: 30 }}
                        title={!contest.enabled ? contest.tooltip : ''}
                    >
                        <div className="showcase-overlay">
                            <motion.div 
                                className="showcase-content"
                                animate={{ y: window.innerWidth < 1024 ? 0 : (hoveredIndex === index ? -40 : 0) }}
                                transition={{ type: 'spring', stiffness: 100, damping: 30 }}
                            >
                                <motion.div 
                                    className="showcase-title-wrapper"
                                    animate={{ opacity: hoveredIndex === index ? 0 : 1, y: hoveredIndex === index ? 10 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h3 className="showcase-title">{contest.title}</h3>
                                </motion.div>

                                <AnimatePresence>
                                    {hoveredIndex === index && (
                                        <motion.div
                                            className="showcase-hover-content"
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4 } }}
                                            exit={{ opacity: 0, y: 30 }}
                                        >
                                            <h4 className="showcase-hover-title">{contest.title}</h4>
                                            <p className="showcase-subtitle">{contest.subtitle}</p>
                                            {contest.enabled ? (
                                                <motion.button 
                                                    className="showcase-button"
                                                    onClick={() => setPage(contest.page)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Acessar Agora
                                                </motion.button>
                                            ) : (
                                                <div className="flex items-center justify-center mt-4 text-gray-300">
                                                    <LockIcon />
                                                    <span className="font-semibold">Em Breve</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};


const HomePage = ({ setPage }) => {
  return (
    <div className='animate-fade-in max-w-6xl mx-auto px-4'>
      <div className='text-center my-10'>
        <h1 className='text-4xl md:text-5xl font-bold texto-titulo mb-4'>Sua Aprovação Começa Aqui</h1>
        <p className='text-xl font-regular max-w-2xl mx-auto text-gray-300'>A plataforma completa com milhares de questões de concursos para você praticar e garantir seu nome na lista de aprovados.</p>
      </div>

      <div className='my-16'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {stats.map((stat, i) => (
            <div key={i} className='p-4 text-center animate-fade-in'>
              <StatsIcon path={stat.icon} />
              <h3 className='text-2xl font-semibold texto-padrao'>{stat.value}</h3>
              <p className='sm:text-sm text-base text-gray-300'>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='my-16' id='concursos'>
        <h2 className='text-3xl font-semibold texto-titulo text-center mb-8'>Escolha sua área de atuação</h2>
        <ContestShowcase setPage={setPage} />
      </div>

      <h2 className='text-2xl font-semibold texto-titulo text-center mb-6'>Por que escolher o Gabarito Final?</h2>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10'>
        {features.map((feature, i) => (
          <motion.div 
            key={i} 
            className='bg-white p-6 rounded-2xl shadow-sm border border-gray-200'
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className='flex items-center justify-center'>
              <h3 className='text-lg font-semibold texto-primario'>{feature.title}</h3>
            </div>
            <p className='sm:text-sm text-base text-gray-700 mt-2 text-center'>{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;