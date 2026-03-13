import React from 'react';
import { HandThumbUpIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

const WhyChooseUsSection = () => {
    
    const features = [
        { icon: HandThumbUpIcon, title: "QUESTÕES\nATUAIS", description: "Elaboradas para o\n concurso especícfico." },
        { icon: DocumentTextIcon, title: "FEEDBACK COMPLETO", description: "Explicações específicas\n para cada questão." },
        { icon: ChartBarIcon, title: "PROGRESSO IMEDIATO", description: "Monitore seu desempenho e identifique áreas de melhoria." },
    ];

    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <motion.section 
            style={{backgroundColor: 'var(--color-bg-features)'}} 
            className="w-full px-4 py-24 md:py-32"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.2, once: false }} // <<< CORREÇÃO APLICADA AQUI
        >
           
           <div className="max-w-5xl mx-auto">
                <h2 style={{font: 'var(--font-h1)'}} className="text-center text-text-primary mb-16">Por que escolher o Gabarito Final?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            <motion.div className="flex items-center justify-start text-left w-full max-w-[280px] gap-4 px-4 py-4 bg-[--color-accent] rounded-lg mb-4 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl" whileTap={{ scale: 0.98 }}>
                                <feature.icon className="h-16 w-16 text-[--color-text-dark]" aria-hidden="true" />
                                <h3 style={{font: 'var(--font-h3)', color: 'var(--color-text-dark)'}} className="whitespace-pre-line">{feature.title}</h3>
                            </motion.div>
                            <p style={{font: 'var(--font-p)'}} className="text-text-primary max-w-xs whitespace-pre-line">{feature.description}</p>
                        </div>
                    ))}
                </div>
           </div>
        </motion.section>
    );
};

export default WhyChooseUsSection;