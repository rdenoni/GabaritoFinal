import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import Logo from '../Shared/Logo';
import toast from 'react-hot-toast';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { translateSupabaseError } from './errorTranslator.js';
import InfoModal from '../Shared/InfoModal';
import Spinner from '../Shared/Spinner';

// console.log("LoginPage component is loading..."); // REMOVIDO

const LoginPage = ({ setPage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('unauthorized');
    const [showPassword, setShowPassword] = useState(false);
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

    // === INÍCIO DO CÓDIGO DE TESTE TEMPORÁRIO (REMOVIDO) ===
    // useEffect(() => {
    //     const runBasicNetworkTest = async () => {
    //         console.log("--- Teste de Rede Básico para Supabase URL ---");
    //         const supabaseUrl = process.env.VITE_SUPABASE_URL;
    //         console.log("URL Supabase para teste:", supabaseUrl);

    //         try {
    //             const response = await fetch(supabaseUrl + '/rest/v1/', {
    //                 method: 'GET',
    //                 headers: {
    //                     'apikey': process.env.VITE_SUPABASE_ANON_KEY
    //                 }
    //             });

    //             if (response.ok) {
    //                 console.log("Teste de Rede Básico BEM-SUCEDIDO. Status:", response.status);
    //             } else {
    //                 console.error("Teste de Rede Básico FALHOU. Status:", response.status, "Texto:", await response.text());
    //             }
    //         } catch (error) {
    //             console.error("Erro inesperado no Teste de Rede Básico:", error);
    //             if (error instanceof TypeError && error.message === 'Failed to fetch') {
    //                 console.error("Este é o 'TypeError: Failed to fetch' que estamos vendo. Indica um problema de rede ou CORS.");
    //             }
    //         }
    //         console.log("--- Fim do Teste de Rede Básico ---");
    //     };

    //     runBasicNetworkTest();

    //     const testSupabaseConnection = async () => {
    //         console.log("--- Teste de Conexão Supabase (SDK) ---");
    //         console.log("SUPABASE_URL (Client-side):", process.env.VITE_SUPABASE_URL);
    //         console.log("SUPABASE_ANON_KEY (Client-side):", process.env.VITE_SUPABASE_ANON_KEY);

    //         try {
    //             const { count, error: countError } = await supabase
    //                 .from('achievements')
    //                 .select('*', { count: 'exact' });

    //             if (countError) {
    //                 console.error("Erro no teste de conexão Supabase (count):", countError);
    //             } else {
    //                 console.log("Teste de conexão Supabase BEM-SUCEDIDO. Contagem de achievements:", count);
    //             }

    //             console.log("\n--- Teste RPC get_user_status (SDK) ---");
    //             try {
    //                 const { data: status, error: rpcError } = await supabase.rpc('get_user_status', {
    //                     email_to_check: 'teste@example.com'
    //                 });

    //                 if (rpcError) {
    //                     console.error("Erro no teste RPC get_user_status:", rpcError);
    //                     if (rpcError.code) console.error("Código de erro RPC:", rpcError.code);
    //                     if (rpcError.details) console.error("Detalhes do erro RPC:", rpcError.details);
    //                     if (rpcError.hint) console.error("Dica do erro RPC:", rpcError.hint);
    //                 } else {
    //                     console.log("Teste RPC get_user_status BEM-SUCEDIDO. Status:", status);
    //                 }
    //             } catch (rpcCatchError) {
    //                 console.error("Erro inesperado ao chamar RPC get_user_status:", rpcCatchError);
    //             }

    //         } catch (generalError) {
    //             console.error("Erro geral no teste de conexão Supabase (SDK):", generalError);
    //         }
    //         console.log("--- Fim do Teste de Conexão Supabase (SDK) ---");
    //     };

    //     testSupabaseConnection();
    // }, []);
    // === FIM DO CÓDIGO DE TESTE TEMPORÁRIO ===

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Verifica o status do usuário primeiro para decidir o fluxo.
            const { data: status, error: rpcStatusError } = await supabase.rpc('get_user_status', {
                email_to_check: email
            });

            if (rpcStatusError) throw rpcStatusError;

            // 2. Lida com o fluxo baseado no status retornado.
            if (status === 'verified' || status === 'unverified') {
                // Se o usuário existe, tentamos o login.
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

                if (signInError) {
                    if (signInError.message === 'Email not confirmed') {
                        toast.error("Seu email ainda não foi confirmado. Verifique sua caixa de entrada.");
                    } else {
                        toast.error("Senha incorreta. Por favor, tente novamente.");
                    }
                }
                // Se o login for bem-sucedido, o onAuthStateChange em App.jsx cuidará do resto.
            } else if (status === 'not_found') {
                // Se o usuário não existe no sistema de autenticação, verificamos se é um comprador.
                const { data: isBuyer, error: rpcBuyerError } = await supabase.rpc('is_buyer', {
                    email_to_check: email
                });

                if (rpcBuyerError) throw rpcBuyerError;

                if (isBuyer) {
                    // Este é o cenário chave: um comprador que precisa se registrar.
                    setModalType('unregistered');
                    setIsModalOpen(true);
                } else {
                    // Se não for um comprador, o e-mail é desconhecido.
                    toast.error("E-mail não registrado.");
                }
            }
        } catch (err) {
            console.error("Erro capturado no handleLogin:", err);
            // Verifique se o erro é o 'Failed to fetch' específico
            if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
                toast.error("Erro de conexão! Verifique sua internet ou firewall. Tente novamente.");
            } else {
                toast.error(translateSupabaseError(err.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendConfirmation = async () => {
        if (!email) {
            toast.error('Por favor, insira o seu email.');
            return;
        }
        setLoading(true);
        try {
            const { data: status, error: rpcError } = await supabase.rpc('get_user_status', { email_to_check: email });
            if (rpcError) throw rpcError;

            if (status === 'verified') {
                toast.success('Seu e-mail já está verificado.');
            } else if (status === 'unverified') {
                const { error: resendError } = await supabase.auth.resend({ type: 'signup', email: email });
                if (resendError) throw resendError;
                toast.success('Um novo e-mail de confirmação foi enviado!');
            } else { // status === 'not_found'
                toast.error('Este e-mail não está registrado.');
            }
        } catch (err) {
            toast.error(translateSupabaseError(err.message));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            toast.error('Por favor, insira o seu email para redefinir a senha.');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}`,
            });
            if (error) throw error;
            toast.success('Se você tiver uma conta, um link para redefinição de senha foi enviado.');
        } catch(err) {
            toast.error(translateSupabaseError(err.message));
        } finally {
            setLoading(false);
        }
    };

    const modalContent = {
        unregistered: {
            title: "Finalize o seu Registo",
            content: (
                <>
                    <p className="mb-6">Olá! Verificamos que você é nosso cliente. Agora só falta criar uma senha para acessar.</p>
                    <button
                        onClick={() => {
                            setIsModalOpen(false);
                            setPage('signup');
                        }}
                        className="w-full py-3 px-6 bg-[--color-accent] text-black font-bold rounded-lg hover:bg-[--color-accent-hover] transition-colors"
                    >
                        Registrar e Criar Senha
                    </button>
                </>
            )
        },
        unauthorized: {
            title: "Acesso não Encontrado",
            content: (
                 <>
                    <p className="mb-4">Para acessar esta área, é necessário ser um membro ativo.</p>
                    <p className="mb-6">Clique no botão abaixo para garantir o seu acesso.</p>
                    <a
                        href="https://pay.kiwify.com.br/LA65QRl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-3 px-6 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Adquirir Acesso Agora
                    </a>
                </>
            )
        }
    };

    return (
        <>
            <InfoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalContent[modalType]?.title}
            >
                {modalContent[modalType]?.content}
            </InfoModal>

            <div className="min-h-screen flex items-center justify-center bg-[--color-bg-hero] p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.5 }}}
                    className="w-full max-w-md mx-auto"
                >
                    <motion.div className="text-center mb-8">
                        <Logo className="h-32 mx-auto" />
                        <p className="text-text-secondary mt-4 text-lg">Faça login ou registre-se.</p>
                    </motion.div>

                    <motion.form onSubmit={handleLogin} className="space-y-6 bg-gray-800 p-8 rounded-xl shadow-lg">
                        <div className="relative">
                            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                ref={emailInputRef}
                                type="email"
                                value={email}
                                onChange={handleEmailChange}
                                required
                                className="w-full p-3 pl-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 transition-colors"
                                placeholder="Email"
                            />
                            {isEmailValid === true && <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />}
                            {isEmailValid === false && <XCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />}
                        </div>
                        <div className="relative">
                            <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-3 pl-10 pr-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0 transition-colors"
                                placeholder="Senha"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <button type="button" onClick={handleResendConfirmation} className="font-medium text-text-secondary hover:text-[--color-accent]">
                                Reenviar confirmação?
                            </button>
                            <button type="button" onClick={handlePasswordReset} className="font-medium text-[--color-accent] hover:underline">
                                Esqueceu a senha?
                            </button>
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 px-6 bg-[--color-accent] text-black font-bold rounded-lg hover:bg-[--color-accent-hover] transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <><Spinner />Aguarde...</> : 'Entrar'}
                        </button>
                        <p className="text-center text-text-secondary">
                            Não tem uma conta?{' '}
                            <button type="button" onClick={() => setPage('signup')} className="font-bold text-[--color-accent] hover:underline">
                                Registre-se
                            </button>
                        </p>
                    </motion.form>
                </motion.div>
            </div>
        </>
    );
};

export default LoginPage;