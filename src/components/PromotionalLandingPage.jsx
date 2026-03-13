import React, { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { RocketLaunchIcon, CheckCircleIcon, TrophyIcon, AcademicCapIcon, BoltIcon, EnvelopeIcon, HandThumbUpIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import LogoHorizontal from './Shared/LogoHorizontal';
// Ícones adicionais para os benefícios rápidos
import { CalendarIcon, ComputerDesktopIcon, AdjustmentsHorizontalIcon, SparklesIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

// <<-- INÍCIO DA CORREÇÃO: IMPORTAÇÃO DOS FUNDOS -->>
import bgLp01 from '../assets/img/bg/bg_lp_01.png'; // BG 01 e BG 03
import bgLp02 from '../assets/img/bg/bg_lp_01.png'; // BG 02
// <<-- FIM DA CORREÇÃO -->>

const PromotionalLandingPage = ({ setPage }) => {
    // Lógica do Contador Regressivo
    const targetDate = new Date('2025-07-27T00:00:00-03:00'); // 27 de julho de 2025, fuso horário do Rio (GMT-3)
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000); // Atualiza a cada segundo

        return () => clearInterval(timer);
    }, []);

    function calculateTimeLeft() {
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();

        let remaining = {};

        if (difference > 0) {
            remaining = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            remaining = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return remaining;
    }

    const formatTime = (time) => {
        return time < 10 ? `0${time}` : time;
    };

    const isAfterTargetDate = Object.keys(timeLeft).length === 0 || (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 && new Date() > targetDate);


    // --- Dados para as Seções ---

    // Dados da Prova Social (Depoimentos)
    const testimonials = [
        { id: 1, avatar: "https://c.animaapp.com/piTrqSMl/img/rectangle-3@2x.png", quote: 'Finalmente encontrei uma plataforma que explica como a banca pensa!', username: "@danielyag", timestamp: "2 dias atrás..." },
        { id: 2, avatar: "https://c.animaapp.com/piTrqSMl/img/rectangle-3-1@2x.png", quote: 'As estatísticas me ajudaram a focar onde eu mais errava.', username: "@fariseug", timestamp: "5 dias atrás..." },
        { id: 3, avatar: "https://c.animaapp.com/piTrqSMl/img/rectangle-3-2@2x.png", quote: 'Estudar com feedback imediato me fez revisar 3x mais rápido.', username: "@rafad9r", timestamp: "1 semana atrás..." },
    ];

    // Dados dos Benefícios Rápidos (com ícones - adaptados para os do wireframe)
    const quickBenefits = [
        { icon: CheckCircleIcon, text: "+500 questões atualizadas" },
        { icon: AcademicCapIcon, text: "Feedback com IA" },
        { icon: ChartBarIcon, text: "Progresso salvo automaticamente" },
        { icon: TrophyIcon, text: "Estilo idêntico ao da banca" },
        { icon: GlobeAltIcon, text: "Plataforma 100% responsiva" },
        { icon: RocketLaunchIcon, text: "Estatísticas e conquistas" },
        { icon: BoltIcon, text: "Foco na prova de AGENTE da PF 2025" },
        { icon: CalendarIcon, text: "Estude no seu ritmo, até a véspera" },
    ];

    // --- Animações ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    // --- Componente de Botão CTA (Centralizado com Gradiente) ---
    const CtaButtonComponent = ({ text }) => (
        <a 
            href="https://pay.kiwify.com.br/LA65QRl" // URL da sua página de vendas Kiwify
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-gradiente w-full sm:w-auto px-8 py-3 font-extrabold text-lg rounded-lg shadow-xl flex items-center justify-center gap-2 whitespace-nowrap mx-auto"
        >
            <RocketLaunchIcon className="w-6 h-6 z-10" />
            <span className="z-10">{text}</span>
        </a>
    );

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-[--color-bg-hero] text-white flex flex-col items-center pt-12 px-4"
        >
            {/* <<-- INÍCIO DA CORREÇÃO: BG 01 - Aplicado à seção que contém Contador e Hero -->> */}
            <section 
                className="w-full relative overflow-hidden flex flex-col items-center pb-12 md:pb-16"
                style={{
                    backgroundImage: `url(${bgLp01})`, // Referência à imagem importada
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Contador Regressivo (Topo da Página) */}
                <motion.div variants={itemVariants} className="w-full text-center p-6 md:p-8 rounded-2xl max-w-2xl mx-auto mb-12 md:mb-16 mt-8 relative z-10"
                    style={{ backgroundColor: 'rgba(25, 32, 43, 0.6)' }} // Fundo transparente 60% aqui
                > 
                    <h2 className="text-2xl md:text-3xl font-bold text-[--color-accent] mb-4 md:mb-6">Dias restantes até a prova!</h2>
                    <div className="flex justify-center items-baseline gap-3 md:gap-4 text-white">
                        <div className="text-center">
                            <span className="block text-4xl md:text-6xl font-extrabold text-[--color-accent]">{formatTime(timeLeft.days)}</span>
                            <span className="text-sm md:text-base">DIAS</span>
                        </div>
                        <span className="text-3xl md:text-5xl font-extrabold text-gray-500">:</span>
                        <div className="text-center">
                            <span className="block text-4xl md:text-6xl font-extrabold text-[--color-accent]">{formatTime(timeLeft.hours)}</span>
                            <span className="text-sm md:text-base">HORAS</span>
                        </div>
                        <span className="text-3xl md:text-5xl font-extrabold text-gray-500">:</span>
                        <div className="text-center">
                            <span className="block text-4xl md:text-6xl font-extrabold text-[--color-accent]">{formatTime(timeLeft.minutes)}</span>
                            <span className="text-sm md:text-base">MINUTOS</span>
                        </div>
                        <span className="text-3xl md:text-5xl font-extrabold text-gray-500">:</span>
                        <div className="text-center">
                            <span className="block text-4xl md:text-6xl font-extrabold">{formatTime(timeLeft.seconds)}</span>
                            <span className="text-sm md:text-base">SEGUNDOS</span>
                        </div>
                    </div>
                    {isAfterTargetDate && <p className="mt-4 md:mt-6 text-base md:text-lg text-red-400 font-semibold">A prova já passou! Mas nunca é tarde para se preparar para o próximo desafio.</p>}
                </motion.div>

                {/* 1. HERO SECTION (Cabeçalho) */}
                <motion.section 
                    variants={itemVariants}
                    className="w-full max-w-4xl mx-auto text-center py-12 md:py-16 relative z-10"
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-[--color-accent]">
                        Você quer passar na PF 2025?
                    </h1>
                    <p className="text-xl md:text-3xl text-text-primary mb-8 md:mb-12">
                        Descubra agora se você está realmente preparado.
                    </p>
                    <CtaButtonComponent text="QUERO COMEÇAR AGORA" />
                    
                    {/* IMAGEM DA HERO SECTION (Placeholder) */}
                    {/* REMOVIDO: a imagem "Captura da plataforma ou policial" */}
                </motion.section>
            </section> {/* Fim da seção com BG 01 */}


            {/* <<-- INÍCIO DA CORREÇÃO: BG 02 - Aplicado à seção de Demonstração e Prova Social -->> */}
            <section 
                className="w-full relative overflow-hidden flex flex-col items-center py-12 md:py-16"
                style={{
                    backgroundImage: `url(${bgLp02})`, // Referência à imagem importada
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* 3. DEMONSTRAÇÃO DA PLATAFORMA (VISUAL) - TROCADO DE POSIÇÃO */}
                <motion.section
                    variants={itemVariants}
                    className="w-full max-w-5xl mx-auto py-12 md:py-24 relative z-10"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-10 md:mb-12">Veja como funciona na prática:</h2>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 p-6 md:p-10 rounded-xl"> {/* REMOVIDO bg-gray-800 shadow-lg border border-gray-700 para tornar transparente */}
                        {/* LADO ESQUERDO: Imagem/GIF da tela */}
                        <div className="w-full md:w-1/2 flex-shrink-0">
                            <img src="https://via.placeholder.com/700x500?text=DEMO+PLATAFORMA" alt="Demonstração da plataforma" className="w-full h-auto rounded-lg shadow-md" />
                        </div>
                        {/* LADO DIREITO: Texto explicativo com bullets */}
                        <div className="w-full md:w-1/2 space-y-4 md:space-y-6 text-lg md:text-xl text-text-secondary">
                            <h3 className="text-2xl font-bold text-white mb-4">Prepare-se com as ferramentas certas:</h3>
                            <ul className="space-y-3 md:space-y-4">
                                <li className="flex items-start gap-3"><CheckCircleIcon className="mt-1 w-6 h-6 text-[--color-accent] flex-shrink-0" /> Estilo CEBRASPE (Certo/Errado)</li>
                                <li className="flex items-start gap-3"><CheckCircleIcon className="mt-1 w-6 h-6 text-[--color-accent] flex-shrink-0" /> Correção imediata com feedback</li>
                                <li className="flex items-start gap-3"><CheckCircleIcon className="mt-1 w-6 h-6 text-[--color-accent] flex-shrink-0" /> Interface moderna e intuitiva</li>
                                <li className="flex items-start gap-3"><CheckCircleIcon className="mt-1 w-6 h-6 text-[--color-accent] flex-shrink-0" /> IA explica cada erro</li>
                            </ul>
                        </div>
                    </div>
                </motion.section>

                {/* 2. PROVA SOCIAL (Depoimentos ou feedbacks reais) */}
                <motion.section
                    variants={itemVariants}
                    className="w-full max-w-3xl mx-auto py-12 md:py-24 relative z-10"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-10 md:mb-12">O que nossos alunos dizem:</h2>
                    <div className="flex flex-col gap-6">
                        {testimonials.map((testimonial) => (
                            <motion.div key={testimonial.id} className="bg-white rounded-xl p-5 md:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 border-l-8 border-[--color-accent] cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl active:scale-[0.99]" whileTap={{ scale: 0.98 }}>
                                {testimonial.avatar && <img className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0" alt={`Avatar do usuário ${testimonial.username || 'Anônimo'}`} src={testimonial.avatar} />} 
                                <div className="flex-1 text-center sm:text-left">
                                    {testimonial.username && (
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                            <span className="text-base md:text-lg text-gray-900 font-bold">{testimonial.username}</span>
                                            {testimonial.timestamp && <span className="text-sm md:text-base text-gray-500">{testimonial.timestamp}</span>}
                                        </div>
                                    )}
                                    <p className="text-base md:text-lg text-gray-700">{`"${testimonial.quote}"`}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            </section> {/* Fim da seção com BG 02 */}


            {/* <<-- INÍCIO DA CORREÇÃO: BG 03 - Aplicado à seção de Benefícios e CTA Final -->> */}
            <section 
                className="w-full relative overflow-hidden flex flex-col items-center py-12 md:py-16"
                style={{
                    backgroundImage: `url(${bgLp01})`, // Referência à imagem importada (BG03 usa BG01)
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* 4. BENEFÍCIOS RÁPIDOS (com ícones) */}
                <motion.section
                    variants={itemVariants}
                    className="w-full max-w-5xl mx-auto py-12 md:py-24 relative z-10"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-10 md:mb-12">O que você vai ter acesso:</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {quickBenefits.map((benefit, index) => (
                            <div key={index} className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 text-center flex flex-col items-center">
                                <benefit.icon className="w-10 h-10 md:w-12 md:h-12 text-[--color-accent] mb-4" />
                                <p className="text-base md:text-lg font-semibold text-text-primary">{benefit.text}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* 5. CHAMADA FINAL (CTA) */}
                <motion.section
                    variants={itemVariants}
                    className="w-full max-w-4xl mx-auto text-center py-12 md:py-24 relative z-10"
                >
                    <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6 text-text-primary">
                        Não perca mais tempo!
                    </h2> 
                    {/* Destaque do Preço */}
                    <p className="text-2xl md:text-4xl font-extrabold text-[--color-accent] mb-4">
                        Apenas R$ 29,90/mês!
                    </p>
                    <p className="text-lg md:text-xl text-text-secondary mb-8">
                        Acesso completo (válido por 1 mês de acesso ilimitado).
                    </p>
                    <CtaButtonComponent text="QUERO ACELERAR MINHA APROVAÇÃO" /> 
                    
                    {/* Sessão "Ainda com dúvidas?" */}
                    <div className="mt-12 text-center">
                        <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">Ainda com dúvidas?</h3>
                        <p className="text-lg md:text-xl text-text-secondary mb-6">Fale conosco ou comece a estudar imediatamente!</p>
                        <button 
                            onClick={() => setPage('contact-page')} 
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg font-bold rounded-lg text-[--color-accent] hover:underline transition-colors"
                        >
                            <EnvelopeIcon className="w-6 h-6"/> Fale com nosso suporte
                        </button>
                    </div>
                </motion.section>
            </section> {/* Fim da seção com BG 03 */}

            {/* 6. RODAPÉ - Revertido para o padrão com Logo, Links e Direitos Autorais */}
            <motion.footer 
                variants={itemVariants}
                className="w-full bg-[--color-bg-footer] py-8 px-4 text-center text-text-secondary"
            >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <LogoHorizontal className="h-8 w-auto text-white mx-auto md:mx-0 mb-4 md:mb-0" /> 
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-sm md:text-base">
                        <a href="/privacy" className="hover:underline" onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/privacy'); setPage('privacy-page'); }}>Política de Privacidade</a>
                        <span className="hidden md:inline">|</span>
                        <a href="/terms" className="hover:underline" onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/terms'); setPage('terms-page'); }}>Termos de Uso</a>
                        <span className="hidden md:inline">|</span>
                        <button onClick={() => setPage('contact-page')} className="hover:underline">Contato</button>
                    </div>
                </div>
                <p className="mt-4 text-xs md:text-sm">Gabarito Final © 2025 - Todos os direitos reservados.</p>
            </motion.footer>
        </motion.div>
    );
};

export default PromotionalLandingPage;