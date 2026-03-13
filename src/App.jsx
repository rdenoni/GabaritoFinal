// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './supabaseClient';
import MainApp from './MainApp';
import LoginPage from './components/Auth/LoginPage';
import SignUpPage from './components/Auth/SignUpPage';
import ResetPasswordPage from './components/Auth/ResetPasswordPage';
import LoadingLogo from './components/Shared/LoadingLogo';
import Teste10 from './components/Auth/Teste10.jsx';
import PromotionalLandingPage from './components/PromotionalLandingPage.jsx';
import { EnvelopeIcon } from '@heroicons/react/24/solid';
import HomePage from './components/HomePage/HomePage.jsx';

// Componente para a tela de verificação de e-mail
const PleaseVerifyEmail = ({ session, setPage }) => {
    const [loadingResend, setLoadingResend] = useState(false);

    const handleResend = async () => {
        setLoadingResend(true);
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: session.user.email,
        });
        if (error) {
            toast.error("Erro ao reenviar: " + error.message);
        } else {
            toast.success('Um novo e-mail de confirmação foi enviado!');
        }
        setLoadingResend(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setPage('login');
    };

    return (
        <div className="min-h-screen bg-[--color-bg-hero] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-gray-800 p-8 sm:p-12 rounded-2xl shadow-lg max-w_lg w-full">
                <EnvelopeIcon className="w-16 h-16 mx-auto text-[--color-accent] mb-6" />
                <h1 className="text-3xl font-bold text-white mb-4">Verifique seu E-mail</h1>
                <p className="text-text-secondary mb-8">
                    Enviamos um link de confirmação para **{session.user.email}**. Por favor, clique no link para ativar sua conta.
                </p>
                <button
                    onClick={handleResend}
                    disabled={loadingResend}
                    className="w-full py-3 px-6 bg-[--color-accent] text-black font-bold rounded-lg hover:bg-[--color-accent-hover] transition-colors disabled:opacity-50"
                >
                    {loadingResend ? 'Enviando...' : 'Reenviar E-mail de Confirmação'}
                </button>
                <button
                    onClick={handleLogout}
                    className="mt-4 text-sm text-text-secondary hover:text-white transition-colors"
                >
                    Sair
                </button>
            </div>
        </div>
    );
};


const App = () => {
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authPage, setAuthPage] = useState('login');
    const [currentPageFromUrl, setCurrentPageFromUrl] = useState('');

    useEffect(() => {
        const pathName = window.location.pathname.substring(1);
        setCurrentPageFromUrl(pathName || 'home');

        setIsLoading(true);
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (event === 'SIGNED_IN') {
                if (session && !session.user.email_confirmed_at) {
                    setAuthPage('verify_email');
                } else {
                    setAuthPage('logged_in'); 
                    window.history.pushState(null, '', '/dashboard');
                }
            } else if (event === 'SIGNED_OUT') {
                // --- INÍCIO DA CORREÇÃO ---
                // Em vez de apenas mudar a URL no histórico, forçamos um recarregamento
                // para a página promocional. Isto limpa todo o estado da aplicação.
                window.location.href = '/promo';
                // --- FIM DA CORREÇÃO ---
            } else if (event === 'PASSWORD_RECOVERY') {
                setAuthPage('reset_password');
            } else if (event === 'USER_UPDATED' && session && !session.user.email_confirmed_at) {
                setAuthPage('verify_email');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <div className="loading-container"><LoadingLogo className="w-24 h-24" /></div>;
        }

        if (session && !session.user.email_confirmed_at && authPage === 'verify_email') {
            return <PleaseVerifyEmail session={session} setPage={setAuthPage} />;
        }

        if (session && session.user.email_confirmed_at) {
            return <MainApp session={session} initialPageFromUrl={currentPageFromUrl} />;
        }

        // Lógica de renderização para utilizadores não logados
        switch (currentPageFromUrl) {
            case 'promo':
                return <PromotionalLandingPage setPage={(pageName) => { setAuthPage(pageName); window.history.pushState(null, '', `/${pageName}`); }} />;
            case 'teste10':
                return <Teste10 setPage={(pageName) => { setAuthPage(pageName); window.history.pushState(null, '', `/${pageName}`); }} />;
            case 'login':
                return <LoginPage setPage={setAuthPage} />;
            case 'signup':
                return <SignUpPage setPage={setAuthPage} />;
            case 'reset_password':
                return <ResetPasswordPage onPasswordUpdated={() => setAuthPage('login')} />;
            default:
                // Se a URL não for nenhuma das anteriores, usa o estado interno `authPage`
                switch (authPage) {
                    case 'login':
                        return <LoginPage setPage={setAuthPage} />;
                    case 'signup':
                        return <SignUpPage setPage={setAuthPage} />;
                    case 'reset_password':
                        return <ResetPasswordPage onPasswordUpdated={() => setAuthPage('login')} />;
                    case 'teste10':
                        return <Teste10 setPage={setAuthPage} />;
                    default:
                        // Como fallback, mostra a HomePage
                        return <HomePage setPage={(pageName) => { setAuthPage(pageName); window.history.pushState(null, '', `/${pageName}`); }} />;
                }
        }
    };

    return (
        <>
            <Toaster
                position="bottom-center"
                toastOptions={{
                    success: {
                        style: { background: '#2a9d8f', color: 'white' },
                        duration: 3000,
                    },
                    error: {
                        style: { background: '#e76f51', color: 'white' },
                        duration: 5000,
                    },
                }}
            />
            {renderContent()}
        </>
    );
};

export default App;