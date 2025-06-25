import React from 'react';
import { motion } from 'framer-motion';
import ShowcaseSection from './ShowcaseSection';
import HeroSection from './HeroSection';
import WhyChooseUsSection from './WhyChooseUsSection';
import TestimonialsSection from './TestimonialsSection';

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3, 
    },
  },
};

const HomePage = ({ setPage }) => {
    return (
        <motion.div 
            variants={containerVariants}
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