import React from 'react';

const HeroSection = () => {

    const statistics = [
        { number: "5.000", label: "Questões", leftVector: "https://c.animaapp.com/piTrqSMl/img/vector-4.svg", rightVector: "https://c.animaapp.com/piTrqSMl/img/vector-5.svg" },
        { number: "8k", label: "Usuários", leftVector: "https://c.animaapp.com/piTrqSMl/img/vector-6.svg", rightVector: "https://c.animaapp.com/piTrqSMl/img/vector-7.svg" },
        { number: "1.5k", label: "Aprovações", leftVector: "https://c.animaapp.com/piTrqSMl/img/vector-8.svg", rightVector: "https://c.animaapp.com/piTrqSMl/img/vector-9.svg" },
        { number: "95%", label: "Rendimento", leftVector: "https://c.animaapp.com/piTrqSMl/img/vector-10.svg", rightVector: "https://c.animaapp.com/piTrqSMl/img/vector-11.svg" },
    ];
    return (

        <section style={{ backgroundColor: 'var(--color-bg-header)' }} className="relative w-full">
            <div className="text-center max-w-3xl mx-auto py-20">
                <h1 style={{ font: 'var(--font-h1)' }} className="text-text-primary">
                    Sua aprovação <span className="text-[--color-accent]">começa aqui</span>
                </h1>
                <p style={{ font: 'var(--font-p)' }} className="mt-8 text-text-secondary">Plataforma completa com milhares de questões para você praticar e garantir seu nome na lista de aprovados.</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-16 w-full justify-center flex-wrap ">
                {statistics.map((stat, index) => (
                    <div key={index} className="inline-flex h-72 mt-10 items-center gap-3 sm:gap-4">
                        <img className="w-5 h-16 sm:w-6 sm:h-36" alt="Vetor Esquerdo" src={stat.leftVector} />
                        <div className="text-center">
                            <span style={{ font: 'var(--font-stat-number)' }} className="block text-text-primary">{stat.number}</span>
                            <span style={{ font: 'var(--font-p)' }} className="text-text-secondary">{stat.label}</span>
                        </div>
                        <img className="w-5 h-16 sm:w-6 sm:h-20" alt="Vetor Direito" src={stat.rightVector} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HeroSection;