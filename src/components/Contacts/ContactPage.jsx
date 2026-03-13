import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// ALTERAÇÃO: O componente agora recebe 'session' como prop
const ContactPage = ({ session }) => {
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);

        const formData = new FormData(e.target);
        const dataFromForm = Object.fromEntries(formData.entries());

        // ALTERAÇÃO: Adicionamos o e-mail da sessão aos dados a serem enviados
        const dataToSend = {
            ...dataFromForm,
            sessionEmail: session.user.email,
        };

        try {
            const response = await fetch('/.netlify/functions/send-contact-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error('Falha no envio da mensagem. Tente novamente.');
            }

            toast.success('Mensagem enviada com sucesso! Entraremos em contacto em breve.');
            e.target.reset();

        } catch (error) {
            console.error('Erro no formulário de contato:', error);
            toast.error(error.message || 'Ocorreu um erro. Por favor, tente mais tarde.');
        } finally {
            setIsSending(false);
        }
    };
    
    // O resto do seu componente com as animações e redes sociais
    const pageVariants = { /* ...suas variantes... */ };
    const itemVariants = { /* ...suas variantes... */ };

    return (
        <div className='w-full py-16 md:py-24 px-4' style={{backgroundColor: 'var(--color-bg-hero)'}}>
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={pageVariants}
                className='max-w-5xl mx-auto'
            >
                <motion.div variants={itemVariants} className="text-center">
                    <h1 style={{font: 'var(--font-h1)'}} className='text-center text-text-primary mb-4'>Entre em Contacto</h1>
                    <p style={{font: 'var(--font-p)'}} className='text-center text-text-secondary mb-12'>Tem alguma dúvida, sugestão ou feedback? Adoraríamos ouvi-lo!</p>
                </motion.div>

                <motion.div 
                    variants={itemVariants}
                    className='grid md:grid-cols-2 gap-12 items-start mt-16'
                >
                    {/* Se o utilizador não estiver logado, mostra uma mensagem. Caso contrário, mostra o formulário. */}
                    {!session ? (
                        <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center md:col-span-2">
                             <h3 className="text-2xl font-bold text-white mb-4">Acesso Restrito</h3>
                             <p className="text-text-secondary">Você precisa estar logado para enviar uma mensagem através do formulário.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className='space-y-6 bg-gray-800 p-8 rounded-xl shadow-lg'>
                            <motion.h3 variants={itemVariants} className="text-2xl font-bold text-white mb-4">Envie a sua mensagem</motion.h3>
                            
                            <motion.div variants={itemVariants}>
                                <label htmlFor='name' className='block text-text-secondary mb-2'>Nome</label>
                                <input type='text' id='name' name='name' required className='w-full p-3 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0' placeholder="O seu nome completo" />
                            </motion.div>

                            {/* --- CAMPO DE EMAIL REMOVIDO --- */}

                            <motion.div variants={itemVariants}>
                                <label htmlFor='message' className='block text-text-secondary mb-2'>Mensagem</label>
                                <textarea id='message' name='message' rows='6' required className='w-full p-3 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0' placeholder="Digite a sua dúvida ou sugestão aqui..."></textarea>
                            </motion.div>
                            <motion.p variants={itemVariants} className="text-xs text-text-secondary">
                                A sua mensagem será enviada usando o seu e-mail de login: <strong className="text-gray-300">{session.user.email}</strong>
                            </motion.p>
                            <motion.button 
                                variants={itemVariants} 
                                type='submit' 
                                className='w-full py-3 px-6 bg-[--color-accent] text-black font-bold rounded-lg hover:bg-[--color-accent-hover] transition-colors shadow-lg disabled:opacity-70'
                                disabled={isSending}
                            >
                                {isSending ? 'A Enviar...' : 'Enviar Mensagem'}
                            </motion.button>
                        </form>
                    )}

                    <div className='space-y-6'>
                        <motion.h3 variants={itemVariants} className="text-2xl font-bold text-white mb-4">Outros canais</motion.h3>
                        
                        <motion.div variants={itemVariants} className='bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-6'>
                            <EnvelopeIcon className='w-10 h-10 text-[--color-accent] flex-shrink-0' />
                            <div> 
                                <h4 className='font-semibold text-xl text-text-primary'>Email</h4>
                                <p className="text-text-secondary">Prefere enviar-nos um email? Sem problemas.</p>
                                <a href="mailto:suporte@gabaritofinal.app" className="text-[--color-accent] font-semibold hover:underline">suporte@gabaritofinal.app</a>
                            </div>
                        </motion.div>
                        
                        <motion.div variants={itemVariants} className='bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-6'>
                            <img src="https://c.animaapp.com/piTrqSMl/img/insta-icon.svg" className="w-10 h-10" alt="Instagram Icon" />
                            <div>
                                <h4 className='font-semibold text-xl text-text-primary'>Instagram</h4>
                                <p className="text-text-secondary">Siga para dicas e atualizações diárias.</p>
                                <a href="https://www.instagram.com/gabarito.final" target="_blank" rel="noopener noreferrer" className="text-[--color-accent] font-semibold hover:underline">@gabarito.final</a>
                            </div>
                        </motion.div>
                        
                        <motion.div variants={itemVariants} className='bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-6'>
                            <img src="https://c.animaapp.com/piTrqSMl/img/face-icon.svg" className="w-10 h-10" alt="Facebook Icon" />
                            <div>
                                <h4 className='font-semibold text-xl text-text-primary'>Facebook</h4>
                                <p className="text-text-secondary">Acompanhe nossas novidades e publicações.</p>
                                <a href="https://www.facebook.com/gabaritofinal" target="_blank" rel="noopener noreferrer" className="text-[--color-accent] font-semibold hover:underline">/gabaritofinal</a>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ContactPage;