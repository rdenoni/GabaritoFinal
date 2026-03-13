import React from 'react';
import { motion } from 'framer-motion';
// import LogoSymbol from '../Shared/LogoSymbol'; // REMOVIDO
import LogoHorizontal from '../Shared/LogoHorizontal'; // ADICIONADO

const NewFooter = () => {
    const socialLinks = [
        { href: "https://www.instagram.com/gabarito.final", src: "https://c.animaapp.com/piTrqSMl/img/insta-icon.svg", alt: "Ícone Instagram" },
        { href: "https://www.facebook.com/gabaritofinal", src: "https://c.animaapp.com/piTrqSMl/img/face-icon.svg", alt: "Ícone Facebook" },
        { href: "mailto:gabaritofinal.suporte@gmail.com", src: "https://c.animaapp.com/piTrqSMl/img/email-icon.svg", alt: "Ícone Email" },
    ];

    const footerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const FooterLink = ({ href, children }) => (
        <a href={href} className="text-sm text-text-secondary hover:text-white hover:underline transition-colors duration-300">
            {children}
        </a>
    );

    return (
        <motion.footer 
            style={{backgroundColor: 'var(--color-bg-footer)'}} 
            className="w-full py-8 no-print"
            variants={footerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.2, once: true }}
        >
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between pb-6">
                    <div className="mb-4 sm:mb-0">
                        {/* SUBSTITUÍDO LogoSymbol por LogoHorizontal, e adicionado text-white para garantir cor */}
                        <LogoHorizontal className="h-10 w-auto text-white" /> 
                    </div>
                    <div className="flex items-center gap-6">
                        {socialLinks.map((link, index) => (
                            <a key={index} href={link.href} rel="noopener noreferrer" target="_blank">
                                <img className="h-6 hover:opacity-80 transform hover:scale-110 transition-all duration-200" alt={link.alt} src={link.src} />
                            </a>
                        ))}
                    </div>
                </div>

                <div className="w-full border-t border-gray-700/50 my-6"></div>

                <div className="flex flex-col sm:flex-row items-center justify-between">
                    <p className="text-sm text-text-secondary text-center sm:text-left mb-4 sm:mb-0">
                        Gabarito Final © 2025 - Todos os direitos reservados.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                         <FooterLink href="/terms">Termos e Condições</FooterLink>
                         <span className="text-gray-600">|</span>
                         <FooterLink href="/privacy">Política de Privacidade</FooterLink>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
};

export default NewFooter;