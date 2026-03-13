import React, { useEffect, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';

const AnimatedNumber = ({ value, isK, isPercent }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false }); 

    useEffect(() => {
        // Garante que a referência ao elemento exista antes de iniciar a animação.
        if (isInView && ref.current) {
            // 1. Armazena os controles da animação.
            const controls = animate(0, value, {
                duration: 2,
                ease: "easeOut",
                onUpdate(latest) {
                    // 2. Adiciona uma verificação para garantir que a referência
                    // ainda exista durante a atualização.
                    if (ref.current) {
                        ref.current.textContent = Math.round(latest).toLocaleString('pt-BR');
                    }
                }
            });

            // 3. Retorna uma função de limpeza para parar a animação
            // quando o componente for desmontado.
            return () => controls.stop();
        }
    }, [isInView, value]);

    return (
        <span style={{ font: 'var(--font-stat-number)' }} className="block text-text-primary">
            <span ref={ref}>0</span>
            {isK && 'k'}
            {isPercent && '%'}
        </span>
    );
};

const HeroSection = () => {
    const statistics = [
        { number: 5000, label: "Questões", leftVector: "https://c.animaapp.com/piTrqSMl/img/vector-4.svg", rightVector: "https://c.animaapp.com/piTrqSMl/img/vector-5.svg" },
        { number: 8, label: "Usuários", isK: true, leftVector: "https://c.animaapp.com/piTrqSMl/img/vector-6.svg", rightVector: "https://c.animaapp.com/piTrqSMl/img/vector-7.svg" },
        { number: 1500, label: "Aprovações", leftVector: "https://c.animaapp.com/piTrqSMl/img/vector-8.svg", rightVector: "https://c.animaapp.com/piTrqSMl/img/vector-9.svg" },
        { number: 95, label: "Rendimento", isPercent: true, leftVector: "https://c.animaapp.com/piTrqSMl/img/vector-10.svg", rightVector: "https://c.animaapp.com/piTrqSMl/img/vector-11.svg" },
    ];
    
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
      <motion.section
        style={{ backgroundColor: "var(--color-bg-primary)" }}
        className="relative w-full"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ amount: 0.2, once: false }}
      >
        <div className="text-center max-w-3xl mx-auto pt-16 px-4">
          <h1 style={{ font: "var(--font-h1)" }} className="text-text-primary">
            Sua aprovação{" "}
            <span className="text-[--color-accent]">começa aqui</span>
          </h1>
          <p
            style={{ font: "var(--font-p)" }}
            className="mt-8 text-text-secondary"
          >
            Plataforma completa com milhares de questões para você praticar e
            garantir seu nome na lista de aprovados.
          </p>
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 py-16 grid grid-cols-2 gap-y-12 gap-x-4 lg:flex lg:justify-around lg:items-center">
          {statistics.map((stat, index) => (
            <div key={index} className="flex items-center justify-center gap-2">
              <img
                className="w-auto h-24 md:w-6 md:h-36"
                alt="Vetor Esquerdo"
                src={stat.leftVector}
              />
              <div className="text-center">
                <AnimatedNumber
                  value={stat.number}
                  isK={stat.isK}
                  isPercent={stat.isPercent}
                />
                <span
                  style={{ font: "var(--font-p)" }}
                  className="text-text-secondary"
                >
                  {stat.label}
                </span>
              </div>
              <img
                className="w-auto h-24 md:w-6 md:h-20"
                alt="Vetor Direito"
                src={stat.rightVector}
              />
            </div>
          ))}
        </div>
      </motion.section>
    );
};

export default HeroSection;