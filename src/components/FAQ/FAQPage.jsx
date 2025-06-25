import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const faqData = [
        { q: 'Como funciona a plataforma?', a: 'Nossa plataforma oferece milhares de questões de concursos anteriores para você praticar. Você escolhe o concurso, a matéria e resolve as questões, recebendo feedback instantâneo e detalhado.' },
        { q: 'As questões são atualizadas?', a: 'Sim, nosso banco de questões é constantemente atualizado com as provas mais recentes dos principais concursos do país.' },
        { q: 'Posso acompanhar meu desempenho?', a: 'Com certeza! Na página de resultados, você tem acesso a um gráfico de desempenho, tempo gasto e pode revisar todas as suas respostas.' },
        { q: 'O que é a função "Explicar com IA"?', a: 'É um assistente de estudos que utiliza a API Gemini do Google para fornecer uma explicação ainda mais detalhada sobre cada questão, ajudando a esclarecer dúvidas e a fixar o conteúdo.' },
        { q: 'A plataforma é gratuita?', a: 'Oferecemos uma grande quantidade de conteúdo gratuito. Planos de assinatura com acesso a funcionalidades exclusivas e mais questões serão lançados em breve.' },
        { q: 'Meu progresso no quiz é salvo se eu fechar a página?', a: 'Sim! Seu progresso (respostas, tempo e questões favoritas) é salvo automaticamente no seu navegador. Ao retornar para o mesmo quiz, perguntaremos se você deseja continuar de onde parou.' },
        { q: 'Posso usar o Gabarito Final no meu celular ou tablet?', a: 'Sim, a plataforma é totalmente responsiva e foi projetada para funcionar perfeitamente em computadores, tablets e celulares, permitindo que você estude onde e quando quiser.' }
    ];
    
    const containerVariants = {
      hidden: {},
      visible: { transition: { staggerChildren: 0.07 } }
    };

    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }
    };

    return (
        <div className='w-full py-16 md:py-24 px-4' style={{backgroundColor: 'var(--color-bg-hero)'}}>
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className='max-w-4xl mx-auto'
            >
                <motion.div variants={itemVariants} className="text-center mb-12">
                    <h1 style={{font: 'var(--font-h1)'}} className='text-center text-text-primary'>Perguntas Frequentes (FAQ)</h1>
                    <p style={{font: 'var(--font-p)'}} className='text-center text-text-secondary mt-2'>Encontre aqui as respostas para as dúvidas mais comuns.</p>
                </motion.div>

                <motion.div variants={containerVariants} className='space-y-4'> 
                    {faqData.map((item, index) => (
                        <motion.div variants={itemVariants} key={index} className='bg-[rgba(41,51,68,0.5)] rounded-xl overflow-hidden'>
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className='w-full flex justify-between items-center text-left p-6 hover:bg-[rgba(57,78,102,0.5)] transition-colors duration-200'
                                aria-expanded={openIndex === index}
                                aria-controls={`faq-answer-${index}`}
                            >
                                <h3 style={{font: 'var(--font-p)'}} className='font-semibold text-text-primary pr-4'>{item.q}</h3>
                                
                                <ChevronDownIcon 
                                    className={`w-6 h-6 text-text-secondary transform transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} 
                                    aria-hidden="true"
                                />
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        id={`faq-answer-${index}`}
                                        initial={{height: 0, opacity: 0}}
                                        animate={{height: 'auto', opacity: 1}}
                                        exit={{height: 0, opacity: 0}}
                                        className='overflow-hidden'
                                    >
                                        <div className="p-6 pt-0">
                                            <p style={{font: 'var(--font-p)'}} className='text-text-secondary border-l-2 border-[--color-accent] pl-4'>{item.a}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default FAQPage;