import React from 'react';

const NewFooter = () => {
    const socialLinks = [
        { href: "https://www.instagram.com", src: "https://c.animaapp.com/piTrqSMl/img/insta-icon.svg", alt: "Ícone Instagram" },
        { href: "https://www.facebook.com", src: "https://c.animaapp.com/piTrqSMl/img/face-icon.svg", alt: "Ícone Facebook" },
        { href: "mailto:suporte@gabaritofinal.com", src: "https://c.animaapp.com/piTrqSMl/img/email-icon.svg", alt: "Ícone Email" },
    ];

    return (
        <footer style={{backgroundColor: 'var(--color-bg-footer)'}} className="w-full py-12">
            <div className="flex flex-col sm:flex-row items-center justify-between h-full max-w-6xl mx-auto px-8">
                <p style={{font: 'var(--font-p-small)'}} className="text-text-secondary text-center sm:text-left">Gabarito Final © 2025 - Todos os direitos reservados.</p>
                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                    {socialLinks.map((link, index) => (
                        <a key={index} href={link.href} rel="noopener noreferrer" target="_blank">
                            <img className="h-5 hover:opacity-80 transition-opacity" alt={link.alt} src={link.src} />
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default NewFooter;