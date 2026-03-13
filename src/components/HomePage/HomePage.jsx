import React from 'react';
import { motion } from 'framer-motion';
import ShowcaseSection from './ShowcaseSection';
import HeroSection from './HeroSection';
import WhyChooseUsSection from './WhyChooseUsSection';
import TestimonialsSection from './TestimonialsSection';

const HomePage = ({ setPage }) => {
    // A lógica de carregamento simulado (useState e useEffect) foi removida.
    // As props 'setCurrentPageIsLoading' e 'setCurrentPageLoadProgress' não são mais necessárias aqui.

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col justify-center w-full"
        >
            <div style={{backgroundColor: '#11161F'}}>
                <div style={{paddingTop: '0.1px', backgroundImage: 'linear-gradient(to bottom, #11161F 30%, #19202B 70%)'}}>
                    <ShowcaseSection setPage={setPage} />
                </div>
            </div>
            <HeroSection />
            <WhyChooseUsSection />
            <TestimonialsSection />
        </motion.div>
    );
};

export default HomePage;