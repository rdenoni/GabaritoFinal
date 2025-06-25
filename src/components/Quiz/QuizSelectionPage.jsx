import React from 'react';
import { motion } from 'framer-motion';
import AppLayout from '../Shared/AppLayout';

const QuizSelectionPage = ({ setPage, contest, startQuiz, subjects }) => {
    return (
        <AppLayout setPage={setPage}>
            <div className="page-with-bg">
                <div className='animate-fade-up max-w-6xl mx-auto w-full z-10 pt-16 px-8'>
                    <div className='text-center mb-8'>
                        <h2 style={{font: 'var(--font-h1)'}} className='text-[--color-accent]'>Disciplinas</h2>
                        <p style={{font: 'var(--font-h2)'}} className='text-[--color-text-primary] mt-2'>{contest}</p>
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                        {subjects.map((subject) => (
                            <motion.button
                                key={subject}
                                className='selection-button'
                                onClick={() => startQuiz(subject, contest)}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="font-semibold text-lg">{subject}</span>
                                <svg className="w-6 h-6 icon-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default QuizSelectionPage;