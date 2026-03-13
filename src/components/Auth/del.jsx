import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import zxcvbn from 'zxcvbn';
import { supabase } from '../../supabaseClient';
import Logo from '../Shared/Logo';
import toast from 'react-hot-toast';
import { EnvelopeIcon, LockClosedIcon, UserIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { translateSupabaseError } from './errorTranslator.js';
import Spinner from '../Shared/Spinner';
import PasswordStrengthMeter from '../Shared/PasswordStrengthMeter';
import PasswordTooltip from '../Shared/PasswordTooltip';

const SignUpPage = ({ setPage }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const nameInputRef = useRef(null);

    useEffect(() => {
        nameInputRef.current?.focus();
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

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (newPassword) {
            const result = zxcvbn(newPassword);
            setPasswordStrength(result.score);
        } else {
            setPasswordStrength(0);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Primeiro, verifica se o e-mail é de um comprador
            const { data: isBuyer, error: rpcError } = await supabase.rpc('is_buyer', {
                email_to_check: email
            });

            if (rpcError) throw rpcError;

            if (!isBuyer) {
                toast.error("Email não autorizado. Apenas clientes podem se registrar.");
                setLoading(false);
                return;
            }
            
            // ALTERAÇÃO: Trocamos a chamada à 'user_exists' pela nova 'get_user_status'
            const { data: status, error: statusError } = await supabase.rpc('get_user_status', { email_to_check: email });
            if (statusError) throw statusError;

            // Se o status for 'verified' ou 'unverified', o usuário já existe.
            if (status === 'verified' || status === 'unverified') {
                toast.error('Este email já está registrado. Por favor, faça login.');
                setLoading(false);
                return;
            }

            // Se o status for 'not_found', podemos prosseguir com o registro.
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    emailRedirectTo: window.location.origin,
                    data: { full_name: name }
                }
            });

            if (error) {
                toast.error(translateSupabaseError(error.message));
            } else if (data.user) {
                toast.success("Registro realizado! Verifique seu email para confirmar a conta.");
                setPage('login'); // Redireciona para o login após o sucesso
            }
        } catch (err) {
            toast.error(translateSupabaseError(err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[--color-bg-hero] p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.5 } }} className="w-full max-w-md mx-auto">
                <motion.div className="text-center mb-8">
                    <Logo className="h-32 mx-auto" />
                    <p className="text-text-secondary text-lg">Use o mesmo email da sua compra.</p>
                </motion.div>
                <motion.form onSubmit={handleSignUp} className="space-y-4 bg-gray-800 p-8 rounded-xl shadow-lg">
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input ref={nameInputRef} type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 pl-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 transition-colors" placeholder="Nome (opcional)" />
                    </div>
                    <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input type="email" value={email} onChange={handleEmailChange} required className="w-full p-3 pl-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 transition-colors" placeholder="Email utilizado na compra" />
                        {isEmailValid === true && <CheckCircleIcon className="absolute right-3 top-3.5 h-5 w-5 text-green-500" />}
                        {isEmailValid === false && <XCircleIcon className="absolute right-3 top-3.5 h-5 w-5 text-red-500" />}
                    </div>
                    <div className="relative">
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={handlePasswordChange}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                required
                                className="w-full p-3 pl-10 pr-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 transition-colors"
                                placeholder="Crie uma senha"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-white">
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        <PasswordTooltip isVisible={isPasswordFocused} />
                        <PasswordStrengthMeter score={passwordStrength} />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 px-6 bg-[--color-accent] text-black font-bold rounded-lg hover:bg-[--color-accent-hover] transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <><Spinner />Aguarde...</> : 'Criar Conta'}
                    </button>
                    <p className="text-center text-text-secondary pt-2">
                        Já tem uma conta?{' '}
                        <button type="button" onClick={() => setPage('login')} className="font-bold text-[--color-accent] hover:underline">Faça Login</button>
                    </p>
                </motion.form>
            </motion.div>
        </div>
    );
};

export default SignUpPage;