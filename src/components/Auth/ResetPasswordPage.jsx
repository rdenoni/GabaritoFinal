// src/components/Auth/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import zxcvbn from 'zxcvbn';
import Logo from '../Shared/Logo'; // ALTERADO: Revertido para Logo vertical
import { supabase } from '../../supabaseClient';
import { translateSupabaseError } from './errorTranslator.js';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import Spinner from '../Shared/Spinner';
import PasswordStrengthMeter from '../Shared/PasswordStrengthMeter';
import PasswordTooltip from '../Shared/PasswordTooltip';

const ResetPasswordPage = ({ onPasswordUpdated }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [shake, setShake] = useState(false);

    const shakeVariants = {
        shake: {
            x: [0, -8, 8, -8, 8, 0],
            transition: { duration: 0.4 }
        }
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

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (passwordStrength < 3) {
            toast.error('Sua senha é muito fraca. Por favor, siga as recomendações.');
            setShake(true);
            return;
        }
        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem.');
            setShake(true);
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            toast.error(translateSupabaseError(error.message));
        } else {
            toast.success('Sua senha foi atualizada com sucesso!');
            onPasswordUpdated();
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[--color-bg-hero] p-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <Logo className="h-24 mx-auto" /> {/* ALTERADO: Revertido para Logo vertical */}
                    <h1 className="text-3xl font-bold text-white mt-4">Crie sua Nova Senha</h1>
                    <p className="text-text-secondary">Insira e confirme sua nova senha abaixo.</p>
                </div>

                <motion.form onSubmit={handleResetPassword} variants={shakeVariants} animate={shake ? "shake" : ""} onAnimationComplete={() => setShake(false)}>
                    <div className="space-y-4 bg-gray-800 p-8 rounded-xl shadow-lg">
                        <div className="relative">
                            <label htmlFor="password" className='block text-text-secondary mb-2'>Nova Senha</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    required
                                    className="w-full p-3 pr-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0"
                                    placeholder="Crie uma senha forte"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                            <PasswordTooltip isVisible={isPasswordFocused} />
                            <PasswordStrengthMeter score={passwordStrength} />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className='block text-text-secondary mb-2'>Confirmar Nova Senha</label>
                            <div className="relative">
                                <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                                    className="w-full p-3 pr-10 bg-gray-700 rounded-lg border-2 border-gray-600 focus:border-[--color-accent] focus:ring-0"
                                    placeholder="Repita a nova senha"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                    {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 px-6 bg-[--color-accent] text-black font-bold rounded-lg hover:bg-[--color-accent-hover] flex items-center justify-center gap-2 !mt-8">
                            {loading ? <><Spinner />Aguarde...</> : 'Guardar Nova Senha'}
                        </button>
                    </div>
                </motion.form>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;