// src/components/Auth/Teste10.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from '../Shared/Logo'; // Importe Logo para o componente simples
import Spinner from '../Shared/Spinner';
import toast from 'react-hot-toast';
// REMOVIDOS: zxcvbn, PasswordStrengthMeter, PasswordTooltip, AcademicCapIcon, ChartBarIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, SparklesIcon, HandThumbUpIcon, DocumentTextIcon, TrophyIcon, BoltIcon (e outros ícones não usados)
import { UserIcon, EnvelopeIcon, PhoneIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

// REMOVIDOS: LogoHorizontal, AnimatedNumber (não usados na versão simples)

const Teste10 = ({ setPage }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState(''); // Campo de telefone
    const [loading, setLoading] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(null);

    const emailInputRef = useRef(null);

    useEffect(() => {
        emailInputRef.current?.focus();
    }, []);

    const validateEmail = (email) => {
        if (!email) return null;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        setIsEmailValid(validateEmail(newEmail));
    };

    const formatPhoneNumber = (value) => {
        if (!value) return value;
        const phoneNumber = value.replace(/[^\d]/g, '');
        const phoneNumberLength = phoneNumber.length;

        if (phoneNumberLength < 3) return phoneNumber;
        if (phoneNumberLength < 8) {
            return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
        }
        if (phoneNumberLength < 11) {
            return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 10)}`;
        }
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
    };

    const handlePhoneChange = (e) => {
        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
        setPhone(formattedPhoneNumber);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!name || !email || isEmailValid === false) {
            toast.error("Por favor, preencha seu nome e um e-mail válido.");
            setLoading(false);
            return;
        }

        try {
            // CHAMADA PARA A NETLIFY FUNCTION createTrialLeadAndLink
            const response = await fetch('/.netlify/functions/createTrialLeadAndLink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao solicitar teste. Tente novamente.');
            }
            
            toast.success(data.message);
            setPage('login'); // Redireciona para o login (usuário vai usar magic link)
            
        } catch (error) {
            console.error("Erro geral no handleSubmit da Teste10:", error);
            toast.error(error.message || "Ocorreu um erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[--color-bg-hero] p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.5 } }} className="w-full max-w-md mx-auto">
                <motion.div className="text-center mb-8">
                    <Logo className="h-28 mx-auto mb-4" /> {/* Usando o componente Logo simples */}
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Teste <span className="text-[--color-accent]">10</span> Gratuito</h1>
                    <p className="text-text-secondary text-lg sm:text-xl max-w-md mx-auto">
                        Acesse 10 questões exclusivas. Basta fornecer seu nome e e-mail.
                    </p>
                </motion.div>

                <div className="bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-700/50">
                    <motion.form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 p-6 rounded-xl shadow-inner border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-4 text-center">Acesse seu Teste Gratuito!</h3>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full p-3 pl-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 transition-colors"
                                placeholder="Seu Nome Completo"
                            />
                        </div>
                        <div className="relative">
                            <EnvelopeIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                required
                                className="w-full p-3 pl-10 pr-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 transition-colors"
                                placeholder="Seu melhor e-mail"
                            />
                            {isEmailValid === true && <CheckCircleIcon className="absolute right-3 top-3.5 h-5 w-5 text-green-500" />}
                            {isEmailValid === false && <XCircleIcon className="absolute right-3 top-3.5 h-5 w-5 text-red-500" />}
                        </div>
                        <div className="relative">
                            <PhoneIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={handlePhoneChange}
                                className="w-full p-3 pl-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 transition-colors"
                                placeholder="(DDD) XXXXX-XXXX"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-6 bg-[--color-accent] text-black font-bold rounded-lg hover:bg-[--color-accent-hover] transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <><Spinner />Acessando Teste...</> : 'Acessar Teste Gratuito'}
                        </button>
                        <p className="text-center text-text-secondary text-sm pt-2">
                            Já tem uma conta?{' '}
                            <button type="button" onClick={() => setPage('login')} className="font-bold text-[--color-accent] hover:underline">Faça Login</button>
                        </p>
                    </motion.form>
                </div>
            </motion.div>
        </div>
    );
};

export default Teste10;