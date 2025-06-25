import React from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/solid';

const ContactPage = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        e.target.reset();
    };

    // Variantes para o container principal da página
    const pageVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2, // Atraso entre o título e a seção do grid
        }
      }
    };

    // Variantes para os itens filhos (título, grid)
    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
    };

    return (
        <div className='w-full py-16 md:py-24 px-4' style={{backgroundColor: 'var(--color-bg-hero)'}}>
            {/* O container da animação agora envolve todo o conteúdo da página */}
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={pageVariants}
                className='max-w-5xl mx-auto'
            >
                <motion.div variants={itemVariants} className="text-center">
                    <h1 style={{font: 'var(--font-h1)'}} className='text-center text-text-primary mb-4'>Entre em Contato</h1>
                    <p style={{font: 'var(--font-p)'}} className='text-center text-text-secondary mb-12'>Tem alguma dúvida, sugestão ou feedback? Adoraríamos ouvir você!</p>
                </motion.div>

                {/* Este grid agora é um item da animação principal */}
                <motion.div 
                    variants={itemVariants}
                    className='grid md:grid-cols-2 gap-12 items-start mt-16'
                >
                    <form 
                        onSubmit={handleSubmit} 
                        className='space-y-6 bg-gray-800 p-8 rounded-xl shadow-lg'
                    >
                        <h3 className="text-2xl font-bold text-white mb-4">Envie sua mensagem</h3>
                        <div>
                            <label htmlFor='name' className='block text-text-secondary mb-2'>Nome</label>
                            <input type='text' id='name' name='name' required className='w-full p-3 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 transition-colors' placeholder="Seu nome completo" />
                        </div>
                        <div>
                            <label htmlFor='email' className='block text-text-secondary mb-2'>Email</label>
                            <input type='email' id='email' name='email' required className='w-full p-3 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 transition-colors' placeholder="seu.email@exemplo.com" />
                        </div>
                        <div>
                            <label htmlFor='message' className='block text-text-secondary mb-2'>Mensagem</label>
                            <textarea id='message' name='message' rows='6' required className='w-full p-3 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 transition-colors' placeholder="Digite sua dúvida ou sugestão aqui..."></textarea>
                        </div>
                        <button type='submit' className='w-full py-3 px-6 bg-[--color-accent] text-black font-bold rounded-lg hover:bg-[--color-accent-hover] transition-colors shadow-lg'>Enviar Mensagem</button>
                    </form>

                    <div className='space-y-6'>
                        <h3 className="text-2xl font-bold text-white mb-4">Outros canais</h3>
                        <div className='bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-6'> 
                            <EnvelopeIcon className='w-10 h-10 text-[--color-accent] flex-shrink-0' aria-hidden="true" />
                            <div> 
                                <h4 className='font-semibold text-xl text-text-primary'>Email</h4>
                                <p className="text-text-secondary">Prefere nos enviar um email? Sem problemas.</p>
                                <a href="mailto:contato@gabaritofinal.com" className="text-[--color-accent] font-semibold hover:underline">contato@gabaritofinal.com</a>
                            </div>
                        </div>
                        <div className='bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-6'> 
                            <PhoneIcon className='w-10 h-10 text-[--color-accent] flex-shrink-0' aria-hidden="true" />
                            <div> 
                                <h4 className='font-semibold text-xl text-text-primary'>Telefone</h4>
                                <p className="text-text-secondary">Para assuntos urgentes (horário comercial).</p>
                                <p className="text-white font-semibold">(21) 99999-9999</p>
                            </div>
                        </div>
                        <div className='bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-6'>
                            <img src="https://c.animaapp.com/piTrqSMl/img/insta-icon.svg" className="w-10 h-10" alt="Instagram Icon" />
                            <div>
                                <h4 className='font-semibold text-xl text-text-primary'>Instagram</h4>
                                <p className="text-text-secondary">Siga para dicas e atualizações diárias.</p>
                                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-[--color-accent] font-semibold hover:underline">@gabaritofinal</a>
                            </div>
                        </div>
                        <div className='bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-6'>
                            <img src="https://c.animaapp.com/piTrqSMl/img/face-icon.svg" className="w-10 h-10" alt="Facebook Icon" />
                            <div>
                                <h4 className='font-semibold text-xl text-text-primary'>Facebook</h4>
                                <p className="text-text-secondary">Acompanhe as novidades em nossa página.</p>
                                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-[--color-accent] font-semibold hover:underline">/gabaritofinal</a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ContactPage;