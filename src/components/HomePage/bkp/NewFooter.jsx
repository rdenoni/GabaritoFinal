import React from 'react';
import { motion } from 'framer-motion';

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

    // ALTERAÇÃO: Adicionado o componente de Link para reutilização
    const FooterLink = ({ href, children }) => (
        <a href={href} className="text-text-secondary hover:text-white hover:underline transition-colors duration-300">
            {children}
        </a>
    );

    return (
        <motion.footer 
            style={{backgroundColor: 'var(--color-bg-footer)'}} 
            className="w-full py-12 no-print"
            variants={footerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ amount: 0.2, once: false }}
        >
            <div className="flex flex-col sm:flex-row items-center justify-between h-full max-w-6xl mx-auto px-8">
                <p style={{font: 'var(--font-p-small)'}} className="text-text-secondary text-center sm:text-left">
                    Gabarito Final © 2025 - Todos os direitos reservados.
                </p>

                {/* ALTERAÇÃO: Div para os links legais */}
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                     <FooterLink href="/terms">Termos e Condições</FooterLink>
                     <span className="text-text-secondary">|</span>
                     <FooterLink href="/privacy">Política de Privacidade</FooterLink>
                </div>

                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                    {socialLinks.map((link, index) => (
                        <a key={index} href={link.href} rel="noopener noreferrer" target="_blank">
                            <img className="h-5 hover:opacity-80 transition-opacity" alt={link.alt} src={link.src} />
                        </a>
                    ))}
                </div>
            </div>
        </motion.footer>
    );
};

export default NewFooter;