import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LockClosedIcon, ChevronRightIcon, ArrowUturnLeftIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

const FederalContestsPage = ({ startQuiz, subjectsMap }) => {
    const [selected, setSelected] = useState(null);

    const contestsData = [
        { name: 'Agente da Polícia Federal (PF)', subjectKey: 'Agente da Polícia Federal', enabled: true, status: 'Conteúdo pós-edital 2025 para 2025' },
        { name: 'Receita Federal', subjectKey: 'Receita Federal', enabled: false, status: 'Edital aguardado para 2025' },
        { name: 'Polícia Rodoviária Federal (PRF)', subjectKey: 'Polícia Rodoviária Federal (PRF)', enabled: false, status: 'Último concurso em 2021' },
        { name: 'Instituto Nacional do Seguro Social (INSS)', subjectKey: 'INSS', enabled: false, status: 'Último concurso em 2022' },
        { name: 'Banco Central do Brasil (BACEN)', subjectKey: 'BACEN', enabled: false, status: 'Edital publicado' },
        { name: 'Tribunal de Contas da União (TCU)', subjectKey: 'TCU', enabled: false, status: 'Último concurso em 2022' }
    ];

    const containerVariants = {
        animate: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
    };

    const itemVariants = {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
    };

    return (
        <div className="page-with-bg">
            <div className='max-w-4xl mx-auto w-full z-10 pt-10 px-4'>
                <h2 style={{font: 'var(--font-h1)'}} className='text-center text-[--color-accent] mb-12'>Concursos Federais</h2>

                <motion.div 
                    layout
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    className='flex flex-col gap-4'
                >
                    <AnimatePresence>
                        {(selected === null ? contestsData : [contestsData[selected]]).map((contest, index) => (
                            <motion.div
                                key={contest.name}
                                variants={itemVariants}
                                layout
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            >
                                <button
                                    className='selection-button w-full'
                                    disabled={!contest.enabled}
                                    onClick={() => contest.enabled && setSelected(selected === contestsData.indexOf(contest) ? null : contestsData.indexOf(contest))}
                                >
                                    <div className="flex items-center flex-1 gap-2">
                                        <AnimatePresence>
                                            {selected === contestsData.indexOf(contest) && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1, transition: { delay: 0.3 } }}
                                                    exit={{ opacity: 0, scale: 0 }}
                                                    onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                                                    className="p-2 rounded-full bg-[--color-accent] hover:bg-[--color-accent-hover] transition-colors"
                                                    aria-label="Voltar"
                                                >
                                                    <ArrowUturnLeftIcon className="w-5 h-5 text-black" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <motion.div layout="position" className="flex items-start text-left">
                                            {!contest.enabled && <LockClosedIcon className="w-5 h-5 mr-2" />}
                                            <div>
                                                <span className="font-semibold text-lg">{contest.name}</span>
                                                <span className="block text-sm text-text-secondary mt-1">{contest.status}</span>
                                            </div>
                                        </motion.div>
                                    </div>

                                    <motion.div layout className="ml-4" animate={{ rotate: selected === contestsData.indexOf(contest) ? 90 : 0 }}>
                                        <ChevronRightIcon className="w-6 h-6" />
                                    </motion.div>
                                </button>
                                
                                <AnimatePresence>
                                    {selected === contestsData.indexOf(contest) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1, transition: { delay: 0.1, ease: "easeOut" } }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-8 pr-4"
                                        >
                                            <div className="flex flex-col gap-1 py-3">
                                                {(subjectsMap[contest.subjectKey] || []).map(subject => (
                                                    <button
                                                        key={subject}
                                                        className="w-full flex items-center gap-3 text-left p-3 rounded-lg bg-[rgba(50,60,78,0.5)] hover:bg-[rgba(90,103,126,0.5)] my-1 text-text-primary transition-colors duration-200"
                                                        onClick={() => startQuiz(subject, contest.subjectKey)}
                                                    >
                                                        <DocumentTextIcon className="w-5 h-5 text-white flex-shrink-0" />
                                                        {subject}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default FederalContestsPage;